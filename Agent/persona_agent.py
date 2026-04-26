import json
import os
import sys
from pathlib import Path
from typing import Any, Dict, List
from urllib import request
from urllib.error import HTTPError, URLError


ROOT_DIR = Path(__file__).resolve().parent
ENV_PATH = ROOT_DIR / ".env"


def load_env_file(path: Path) -> None:
    if not path.exists():
        return

    for raw_line in path.read_text(encoding="utf-8").splitlines():
        line = raw_line.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue
        key, value = line.split("=", 1)
        os.environ.setdefault(key.strip(), value.strip())


load_env_file(ENV_PATH)

AGENT_API_KEY = os.getenv("AGENT_API_KEY") or os.getenv("DEEPSEEK_API_KEY", "")
AGENT_BASE_URL = (os.getenv("AGENT_BASE_URL") or "https://api.deepseek.com").rstrip("/")
AGENT_MODEL = os.getenv("AGENT_MODEL") or "deepseek-chat"
AGENT_MAX_STEPS = int(os.getenv("AGENT_MAX_STEPS") or "12")

SYSTEM_PROMPT = """
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
- DO NOT USE ENGLISH,USE CHINESE
- DO NOT USE "not only but also"
- DO NOT SHOW many "--"
- ask targeted follow-up questions when evidence is thin
- use tools to record evidence and update the profile incrementally
- produce a mentor-style summary and analysis
- once the profile is complete, call finish_profile

If the user provides a transcript, analyze it directly instead of interviewing again.
Return the final answer as clean JSON-compatible content when the task is finished.
""".strip()


def build_default_profile() -> Dict[str, Any]:
    return {
        "archetype": "Unclassified Historical Learner",
        "dimensions": {
            "strategic": 50,
            "empathy": 50,
            "people_oriented": 50,
            "meticulousness": 50,
            "pragmatic": 50,
        },
        "evidence": [],
        "mentor_commentary": "",
        "mentor_analysis": "",
        "completed": False,
    }


PROFILE = build_default_profile()

TOOLS: List[Dict[str, Any]] = [
    {
        "type": "function",
        "function": {
            "name": "record_observation",
            "description": "Record a concise evidence statement tied to one dimension.",
            "parameters": {
                "type": "object",
                "properties": {
                    "dimension": {
                        "type": "string",
                        "enum": ["strategic", "empathy", "people_oriented", "meticulousness", "pragmatic"],
                    },
                    "summary": {
                        "type": "string",
                        "description": "Short evidence statement grounded in the user dialogue.",
                    },
                },
                "required": ["dimension", "summary"],
            },
        },
    },
    {
        "type": "function",
        "function": {
            "name": "score_dimensions",
            "description": "Update one or more dimension scores using current evidence.",
            "parameters": {
                "type": "object",
                "properties": {
                    "strategic": {"type": "number"},
                    "empathy": {"type": "number"},
                    "people_oriented": {"type": "number"},
                    "meticulousness": {"type": "number"},
                    "pragmatic": {"type": "number"},
                    "rationale": {
                        "type": "string",
                        "description": "Short explanation for the scoring update.",
                    },
                },
                "required": ["rationale"],
            },
        },
    },
    {
        "type": "function",
        "function": {
            "name": "set_archetype",
            "description": "Set a non-MBTI archetype label for the user profile.",
            "parameters": {
                "type": "object",
                "properties": {
                    "archetype": {
                        "type": "string",
                        "description": "A concise archetype label.",
                    }
                },
                "required": ["archetype"],
            },
        },
    },
    {
        "type": "function",
        "function": {
            "name": "set_mentor_summary",
            "description": "Set mentor commentary and deeper mentor analysis.",
            "parameters": {
                "type": "object",
                "properties": {
                    "mentor_commentary": {"type": "string"},
                    "mentor_analysis": {"type": "string"},
                },
                "required": ["mentor_commentary", "mentor_analysis"],
            },
        },
    },
    {
        "type": "function",
        "function": {
            "name": "finish_profile",
            "description": "Mark the profile as complete when evidence and scores are sufficient.",
            "parameters": {
                "type": "object",
                "properties": {
                    "final_note": {
                        "type": "string",
                        "description": "Short note explaining why the profile is ready.",
                    }
                },
                "required": ["final_note"],
            },
        },
    },
]


def clamp_score(value: Any) -> int | None:
    if not isinstance(value, (int, float)):
        return None
    return max(0, min(100, round(float(value))))


def execute_tool(name: str, arguments: str) -> Dict[str, Any]:
    args = json.loads(arguments) if arguments else {}

    if name == "record_observation":
        PROFILE["evidence"].append({
            "dimension": args["dimension"],
            "summary": args["summary"],
        })
        return {"ok": True, "evidence_count": len(PROFILE["evidence"])}

    if name == "score_dimensions":
        for dimension in ["strategic", "empathy", "people_oriented", "meticulousness", "pragmatic"]:
            value = clamp_score(args.get(dimension))
            if value is not None:
                PROFILE["dimensions"][dimension] = value
        return {"ok": True, "dimensions": PROFILE["dimensions"], "rationale": args.get("rationale", "")}

    if name == "set_archetype":
        PROFILE["archetype"] = args["archetype"]
        return {"ok": True, "archetype": PROFILE["archetype"]}

    if name == "set_mentor_summary":
        PROFILE["mentor_commentary"] = args["mentor_commentary"]
        PROFILE["mentor_analysis"] = args["mentor_analysis"]
        return {"ok": True}

    if name == "finish_profile":
        PROFILE["completed"] = True
        return {"ok": True, "final_note": args["final_note"], "profile": PROFILE}

    raise ValueError(f"Unknown tool: {name}")


def chat_completion(messages: List[Dict[str, Any]]) -> Dict[str, Any]:
    payload_body = {
        "model": AGENT_MODEL,
        "messages": messages,
        "tools": TOOLS,
        "tool_choice": "auto",
        "temperature": 0.7,
    }
    payload = json.dumps(payload_body).encode("utf-8")

    req = request.Request(
        url=f"{AGENT_BASE_URL}/chat/completions",
        data=payload,
        headers={
            "Content-Type": "application/json",
            "Authorization": f"Bearer {AGENT_API_KEY}",
        },
        method="POST",
    )

    try:
        with request.urlopen(req, timeout=120) as response:
            body = response.read().decode("utf-8")
            return json.loads(body)
    except HTTPError as error:
        body = error.read().decode("utf-8", errors="replace")
        raise RuntimeError(f"Agent API error {error.code}: {body}") from error
    except URLError as error:
        raise RuntimeError(f"Agent request failed: {error}") from error


def agent_loop(initial_user_input: str) -> Dict[str, Any]:
    messages: List[Dict[str, Any]] = [
        {"role": "system", "content": SYSTEM_PROMPT},
        {"role": "user", "content": initial_user_input},
    ]

    for _ in range(AGENT_MAX_STEPS):
        completion = chat_completion(messages)
        choice = completion.get("choices", [{}])[0]
        message = choice.get("message", {})

        messages.append({
            "role": "assistant",
            "content": message.get("content") or "",
        })

        tool_calls = message.get("tool_calls") or []
        if not tool_calls:
            return {"profile": PROFILE, "transcript": messages}

        for tool_call in tool_calls:
            function_data = tool_call["function"]
            result = execute_tool(function_data["name"], function_data.get("arguments", ""))
            messages.append({
                "role": "tool",
                "tool_call_id": tool_call["id"],
                "content": json.dumps(result, ensure_ascii=False),
            })

        if PROFILE["completed"]:
            return {"profile": PROFILE, "transcript": messages}

    return {
        "profile": PROFILE,
        "transcript": messages,
        "warning": f"Reached max steps ({AGENT_MAX_STEPS}) before explicit completion.",
    }


def main() -> None:
    if not AGENT_API_KEY:
        raise RuntimeError("Missing AGENT_API_KEY or DEEPSEEK_API_KEY")

    if not sys.stdin.isatty():
        initial_input = sys.stdin.read().strip()
    elif len(sys.argv) > 1:
        initial_input = " ".join(sys.argv[1:]).strip()
    else:
        initial_input = input("Describe the conversation target or paste a transcript: ").strip()

    result = agent_loop(initial_input)
    output_path = ROOT_DIR / "last-profile.json"
    output_path.write_text(json.dumps(result, ensure_ascii=False, indent=2), encoding="utf-8")
    print(json.dumps(result["profile"], ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
