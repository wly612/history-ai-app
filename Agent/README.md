# Persona Agent

This folder contains the standalone personality profiling agent used by the report screen.

## Model Requirement

For competition compliance, this agent must use DeepSeek only.

- API style: OpenAI-compatible `chat/completions`
- Default base URL: `https://api.deepseek.com`
- Default model: `deepseek-chat`
- Fallback model: configured by the Node service with `deepseek-reasoner`

## What This Agent Does

The agent analyzes learning logs, historical dialogue, scenario choices, and assessment evidence. It produces a multidimensional profile:

- `strategic`
- `empathy`
- `people_oriented`
- `meticulousness`
- `pragmatic`

It also produces mentor commentary, mentor analysis, and evidence summaries.

## Configuration

Copy `.env.example` to `.env` inside this folder if you want a dedicated agent config.

```env
DEEPSEEK_API_KEY=
AGENT_API_KEY=
AGENT_BASE_URL=https://api.deepseek.com
AGENT_MODEL=deepseek-chat
AGENT_FALLBACK_MODEL=deepseek-reasoner
AGENT_MAX_STEPS=12
```

`AGENT_API_KEY` and `DEEPSEEK_API_KEY` can use the same DeepSeek key. `AGENT_API_KEY` is kept for compatibility with the Node service.

## Run

From the project root:

```powershell
cd f:\26_4C\history-ai-app
python Agent/persona_agent.py
```
