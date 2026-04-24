# Persona Agent

This folder contains a standalone agent built around the same core loop described in the ShareAI lesson on the agent loop:

- send messages to the model
- let the model call tools
- execute the tools locally
- write tool results back into the conversation
- repeat until the model finishes

Reference tutorial:
- https://learn.shareai.run/en/s01/

The original lesson demonstrates the loop with Claude-style APIs. This implementation keeps the same loop shape, but switches the transport layer to an OpenAI-compatible `chat/completions` interface so it can work with:

- OpenAI-compatible providers
- Gemini via Google's OpenAI-compatible endpoint

Google's official OpenAI compatibility docs:
- https://ai.google.dev/gemini-api/docs/openai

## What this agent does

This agent is designed for historical-character dialogue and personality construction.

It does not generate an MBTI label. Instead, it builds a multidimensional profile aligned with the fields already used in your project:

- `strategic`
- `empathy`
- `people_oriented`
- `meticulousness`
- `pragmatic`

It also produces:

- a non-MBTI archetype label
- trait evidence gathered from the conversation
- mentor commentary
- mentor analysis

## Files

- `persona_agent.py`: main agent loop and tool execution
- `.env.example`: example configuration

## Configuration

Copy `.env.example` to `.env` inside this folder if you want a dedicated config for the agent.

### Gemini with OpenAI-compatible interface

Use the following values:

```env
AGENT_API_KEY=YOUR_GEMINI_API_KEY
AGENT_BASE_URL=https://generativelanguage.googleapis.com/v1beta/openai
AGENT_MODEL=gemini-2.5-flash
```

### Standard OpenAI-compatible provider

Example:

```env
AGENT_API_KEY=YOUR_API_KEY
AGENT_BASE_URL=https://api.openai.com/v1
AGENT_MODEL=gpt-4.1-mini
```

## Run

From the project root:

```powershell
cd f:\26_4C\history-ai-app
python Agent/persona_agent.py
```

## How it works

The agent exposes a small local toolset to the model:

- `record_observation`
- `score_dimensions`
- `set_archetype`
- `set_mentor_summary`
- `finish_profile`

The model interviews the user or analyzes an existing transcript, uses the tools to update a structured in-memory profile, and then exits with a final JSON report.

## Suggested usage

You can use this agent in two ways:

1. Interactive interview mode
   - ask the user questions
   - accumulate observations
   - score the profile gradually

2. Transcript analysis mode
   - feed an existing dialogue transcript
   - let the agent extract evidence and produce a final profile

## Output shape

The final report includes:

```json
{
  "archetype": "People-Centered Strategic Coordinator",
  "dimensions": {
    "strategic": 82,
    "empathy": 74,
    "people_oriented": 88,
    "meticulousness": 69,
    "pragmatic": 85
  },
  "evidence": [
    {
      "dimension": "strategic",
      "summary": "Consistently weighs long-term consequences before acting."
    }
  ],
  "mentor_commentary": "You show a strong ability to balance historical judgment with action under pressure.",
  "mentor_analysis": "Your decisions favor coordinated, goal-oriented progress while retaining attention to public impact."
}
```

## Integration note

This agent is intentionally standalone first. Once you like the results, it can be connected into the existing project's report generation flow and mapped directly into the report screen.
