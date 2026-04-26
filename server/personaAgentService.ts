export interface PersonaAgentProfile {
  archetype: string;
  strategic: number;
  empathy: number;
  people_oriented: number;
  meticulousness: number;
  pragmatic: number;
  ai_comments: string;
  mentor_analysis: string;
  evidence: { dimension: string; summary: string }[];
}

type AgentRawProfile = {
  archetype?: string;
  dimensions?: {
    strategic?: number;
    empathy?: number;
    people_oriented?: number;
    meticulousness?: number;
    pragmatic?: number;
  };
  mentor_commentary?: string;
  mentor_analysis?: string;
  evidence?: { dimension: string; summary: string }[];
  completed?: boolean;
};

type ToolCall = {
  id: string;
  function: {
    name: string;
    arguments?: string;
  };
};

const AGENT_BASE_URL = (process.env.AGENT_BASE_URL || 'https://api.deepseek.com').replace(/\/$/, '');
const AGENT_MODEL = process.env.AGENT_MODEL || 'deepseek-chat';
const AGENT_FALLBACK_MODEL = process.env.AGENT_FALLBACK_MODEL || 'deepseek-reasoner';
const AGENT_MAX_STEPS = Number(process.env.AGENT_MAX_STEPS || 12);
const RETRYABLE_STATUS = new Set([429, 500, 503]);

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const SYSTEM_PROMPT = `
You are a historical-persona profiling agent.

Your job is to build a multidimensional character profile through dialogue or transcript analysis.
Do not use MBTI labels.
Instead, infer a historical-learning personality profile using these dimensions:
- strategic
- empathy
- people_oriented
- meticulousness
- pragmatic

Scoring rules:
- each dimension must be scored from 0 to 100
- scores must reflect observed evidence, not vague praise
- avoid inflating every score; use differentiated judgments

Working style:
- analyze the provided transcript directly
- use tools to record evidence and update the profile incrementally
- call set_archetype with a concise Chinese historical-learning archetype
- call set_mentor_summary with Chinese mentor commentary and Chinese deeper analysis in a natural human voice
- produce a mentor-style summary and analysis that reads like a thoughtful teacher speaking to the learner
- once the profile is complete, call finish_profile

Language rules:
- all archetype, evidence summaries, mentor commentary, and mentor analysis must be written in Simplified Chinese
- do not output English mentor-facing text
- do not use Markdown markers such as **, ##, -, *, >, tables, code blocks, or bullet lists
- do not use machine-like section labels inside mentor_commentary or mentor_analysis
- do not start with rigid labels such as "001同学：" unless the learner's real name is exactly "001"
- use the learner's actual name naturally, and otherwise use "你"
- write in warm, concrete, conversational paragraphs
- keep mentor_commentary to one paragraph, about 100-160 Chinese characters
- keep mentor_analysis to one or two paragraphs, about 180-280 Chinese characters
- avoid repeating raw log entries mechanically; synthesize them into observations
- avoid saying "数据显示", "根据日志", "模型认为", or "本系统"

Return the final answer as clean JSON-compatible content when the task is finished.
`.trim();

const TOOLS = [
  {
    type: 'function',
    function: {
      name: 'record_observation',
      description: 'Record a concise evidence statement tied to one dimension.',
      parameters: {
        type: 'object',
        properties: {
          dimension: {
            type: 'string',
            enum: ['strategic', 'empathy', 'people_oriented', 'meticulousness', 'pragmatic'],
          },
          summary: {
            type: 'string',
            description: 'Short evidence statement grounded in the user dialogue.',
          },
        },
        required: ['dimension', 'summary'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'score_dimensions',
      description: 'Update one or more dimension scores using current evidence.',
      parameters: {
        type: 'object',
        properties: {
          strategic: { type: 'number' },
          empathy: { type: 'number' },
          people_oriented: { type: 'number' },
          meticulousness: { type: 'number' },
          pragmatic: { type: 'number' },
          rationale: {
            type: 'string',
            description: 'Short explanation for the scoring update.',
          },
        },
        required: ['rationale'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'set_archetype',
      description: 'Set a non-MBTI archetype label for the user profile.',
      parameters: {
        type: 'object',
        properties: {
          archetype: {
            type: 'string',
            description: 'A concise archetype label.',
          },
        },
        required: ['archetype'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'set_mentor_summary',
      description: 'Set mentor commentary and deeper mentor analysis.',
      parameters: {
        type: 'object',
        properties: {
          mentor_commentary: { type: 'string' },
          mentor_analysis: { type: 'string' },
        },
        required: ['mentor_commentary', 'mentor_analysis'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'finish_profile',
      description: 'Mark the profile as complete when evidence and scores are sufficient.',
      parameters: {
        type: 'object',
        properties: {
          final_note: {
            type: 'string',
            description: 'Short note explaining why the profile is ready.',
          },
        },
        required: ['final_note'],
      },
    },
  },
];

function buildDefaultProfile(): AgentRawProfile {
  return {
    archetype: 'Unclassified Historical Learner',
    dimensions: {
      strategic: 50,
      empathy: 50,
      people_oriented: 50,
      meticulousness: 50,
      pragmatic: 50,
    },
    evidence: [],
    mentor_commentary: '',
    mentor_analysis: '',
    completed: false,
  };
}

function clampScore(value: unknown, fallback = 50) {
  if (typeof value !== 'number' || Number.isNaN(value)) {
    return fallback;
  }

  return Math.max(0, Math.min(100, Math.round(value)));
}

function cleanHumanText(value: unknown) {
  if (typeof value !== 'string') return '';

  return value
    .replace(/\*\*/g, '')
    .replace(/```[\s\S]*?```/g, '')
    .replace(/^#{1,6}\s*/gm, '')
    .replace(/^\s*[-*+>]\s+/gm, '')
    .replace(/^\s*\d{1,3}[.、)]\s*/gm, '')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

function normalizeProfile(raw: AgentRawProfile): PersonaAgentProfile {
  return {
    archetype: !raw.archetype || raw.archetype === 'Unclassified Historical Learner'
      ? '未定型历史行动者'
      : cleanHumanText(raw.archetype),
    strategic: clampScore(raw.dimensions?.strategic),
    empathy: clampScore(raw.dimensions?.empathy),
    people_oriented: clampScore(raw.dimensions?.people_oriented),
    meticulousness: clampScore(raw.dimensions?.meticulousness),
    pragmatic: clampScore(raw.dimensions?.pragmatic),
    ai_comments: cleanHumanText(raw.mentor_commentary) || '导师评语暂未生成。',
    mentor_analysis: cleanHumanText(raw.mentor_analysis) || '导师分析暂未生成。',
    evidence: Array.isArray(raw.evidence)
      ? raw.evidence.map(item => ({
        dimension: cleanHumanText(item.dimension),
        summary: cleanHumanText(item.summary),
      }))
      : [],
  };
}

function parseToolArguments(argumentsText?: string) {
  if (!argumentsText) return {};
  return JSON.parse(argumentsText);
}

function executeTool(profile: AgentRawProfile, name: string, argumentsText?: string) {
  const args: any = parseToolArguments(argumentsText);

  if (name === 'record_observation') {
    profile.evidence = [
      ...(profile.evidence || []),
      { dimension: args.dimension, summary: cleanHumanText(args.summary) },
    ];
    return { ok: true, evidence_count: profile.evidence.length };
  }

  if (name === 'score_dimensions') {
    profile.dimensions = profile.dimensions || {};
    for (const dimension of ['strategic', 'empathy', 'people_oriented', 'meticulousness', 'pragmatic'] as const) {
      const value = typeof args[dimension] === 'number' ? clampScore(args[dimension]) : undefined;
      if (value !== undefined) {
        profile.dimensions[dimension] = value;
      }
    }
    return { ok: true, dimensions: profile.dimensions, rationale: args.rationale || '' };
  }

  if (name === 'set_archetype') {
    profile.archetype = cleanHumanText(args.archetype);
    return { ok: true, archetype: profile.archetype };
  }

  if (name === 'set_mentor_summary') {
    profile.mentor_commentary = cleanHumanText(args.mentor_commentary);
    profile.mentor_analysis = cleanHumanText(args.mentor_analysis);
    return { ok: true };
  }

  if (name === 'finish_profile') {
    profile.completed = true;
    return { ok: true, final_note: args.final_note, profile };
  }

  throw new Error(`Unknown persona agent tool: ${name}`);
}

async function chatCompletion(messages: any[]) {
  const apiKey = process.env.AGENT_API_KEY || process.env.DEEPSEEK_API_KEY;
  if (!apiKey) {
    throw new Error('Missing AGENT_API_KEY or DEEPSEEK_API_KEY');
  }

  let lastError: Error | undefined;
  const models = [...new Set([AGENT_MODEL, AGENT_FALLBACK_MODEL].filter(Boolean))];

  for (const model of models) {
    for (let attempt = 0; attempt < 3; attempt++) {
      const payload: any = {
        model,
        messages,
        tools: TOOLS,
        tool_choice: 'auto',
        temperature: 0.7,
      };

      const res = await fetch(`${AGENT_BASE_URL}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify(payload),
        signal: AbortSignal.timeout(120000),
      });

      const body = await res.text();
      if (res.ok) {
        return JSON.parse(body);
      }

      lastError = new Error(`Agent API error ${res.status} on ${model}: ${body}`);
      const isLastAttempt = attempt === 2;
      if (!RETRYABLE_STATUS.has(res.status) || isLastAttempt) {
        break;
      }

      await sleep(800 * (attempt + 1));
    }
  }

  throw lastError || new Error('Agent API request failed');
}

export async function analyzePersonaWithAgent(logs: string[], userName?: string): Promise<PersonaAgentProfile> {
  const profile = buildDefaultProfile();
  const transcriptPrompt = [
    'Please analyze the following historical roleplay transcript and build the full persona profile.',
    'Return the completed multidimensional profile using the tool loop.',
    `The learner account name is: ${userName || '未命名馆员'}. Use this real name naturally in commentary when appropriate.`,
    '',
    'Transcript:',
    logs.length > 0 ? logs.map((line, index) => `${index + 1}. ${line}`).join('\n') : 'No valid interaction logs were provided.',
  ].join('\n');

  const messages: any[] = [
    { role: 'system', content: SYSTEM_PROMPT },
    { role: 'user', content: transcriptPrompt },
  ];

  for (let step = 0; step < AGENT_MAX_STEPS; step++) {
    const completion = await chatCompletion(messages);
    const message = completion?.choices?.[0]?.message;

    if (!message) {
      throw new Error(`Agent returned no message: ${JSON.stringify(completion).slice(0, 500)}`);
    }

    messages.push({
      role: 'assistant',
      content: message.content || '',
      ...(message.tool_calls ? { tool_calls: message.tool_calls } : {}),
    });

    const toolCalls: ToolCall[] = message.tool_calls || [];
    if (toolCalls.length === 0) {
      return normalizeProfile(profile);
    }

    for (const toolCall of toolCalls) {
      const result = executeTool(profile, toolCall.function.name, toolCall.function.arguments);
      messages.push({
        role: 'tool',
        tool_call_id: toolCall.id,
        content: JSON.stringify(result),
      });
    }

    if (profile.completed) {
      return normalizeProfile(profile);
    }
  }

  throw new Error(`Persona agent reached max steps (${AGENT_MAX_STEPS}) before completion`);
}
