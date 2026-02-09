"""
LLM-based grammar checker using Anthropic (Claude) API.
Uses standard library only—no pip install required.
"""

import json
import os
import urllib.error
import urllib.request

_LOADED_ENV = False


def _load_dotenv() -> None:
    """Load .env from the grammar-checker directory into os.environ."""
    global _LOADED_ENV
    if _LOADED_ENV:
        return
    _LOADED_ENV = True
    env_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), ".env")
    if not os.path.exists(env_path):
        return
    with open(env_path, encoding="utf-8") as f:
        for line in f:
            line = line.strip().rstrip("\r")
            if line and not line.startswith("#") and "=" in line:
                key, _, value = line.partition("=")
                key = key.strip()
                value = value.strip().strip("'\"")
                if key and key not in os.environ:
                    os.environ[key] = value


GRAMMAR_SYSTEM_PROMPT = """You are a grammar and style proofreader. Correct the user's text for grammar, spelling, punctuation, and clarity. Preserve the original meaning, tone, and intent. Return ONLY the corrected text—no explanations, no markdown, no quotes around it."""


def _call_api(messages: list) -> str:
    """Call Claude API with the given messages. Returns the assistant's text response."""
    _load_dotenv()
    api_key = (os.environ.get("ANTHROPIC_API_KEY") or "").strip()
    if not api_key:
        raise RuntimeError(
            "Set ANTHROPIC_API_KEY to use Claude. Get a key at console.anthropic.com"
        )

    body = {
        "model": os.environ.get("GRAMMAR_MODEL", "claude-haiku-4-5-20251001"),
        "max_tokens": 2048,
        "system": GRAMMAR_SYSTEM_PROMPT,
        "messages": messages,
    }
    req = urllib.request.Request(
        "https://api.anthropic.com/v1/messages",
        data=json.dumps(body).encode(),
        method="POST",
        headers={
            "Content-Type": "application/json",
            "x-api-key": api_key,
            "anthropic-version": "2023-06-01",
        },
    )
    try:
        with urllib.request.urlopen(req, timeout=60) as response:
            data = json.loads(response.read().decode())
    except urllib.error.HTTPError as e:
        body_text = e.read().decode() if e.fp else ""
        msg = f"API error ({e.code}): {body_text}"
        if e.code == 401:
            msg += " Check that ANTHROPIC_API_KEY in .env is correct and has no extra spaces or quotes."
        raise RuntimeError(msg) from e

    for block in data.get("content", []):
        if block.get("type") == "text":
            return block["text"].strip()
    return ""


def correct_text(
    text: str,
    user_feedback: str | None = None,
    previous_correction: str | None = None,
) -> str:
    """
    Use Claude to correct grammar and style. Returns the corrected text.
    If user_feedback and previous_correction are provided, refines based on that feedback.
    """
    if not text.strip():
        return text

    if user_feedback and previous_correction:
        prompt = f"""Original text:
{text}

Corrected version:
{previous_correction}

User feedback to refine the correction: "{user_feedback}"

Please produce an improved version based on this feedback. Return ONLY the refined text—no explanations, no markdown, no quotes around it."""
        messages = [{"role": "user", "content": prompt}]
    else:
        messages = [{"role": "user", "content": text}]

    return _call_api(messages)
