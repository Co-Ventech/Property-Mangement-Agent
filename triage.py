"""RE-01 Property Maintenance Triage.
Safety rules + config are deterministic; LLM classifies via Gemini or generic OpenAI-compatible/Ollama endpoint.
"""
import os, re, sqlite3, json
from typing import Literal
from pydantic import BaseModel
from dotenv import load_dotenv

load_dotenv()

FREE_PROVIDERS = {"gemini", "ollama"}
EMERGENCY_PATTERN = re.compile(
    r"\b(gas leak|smell gas|fire|smoke|flood|burst pipe|sparking|carbon monoxide|no heat|sewage|break-?in)\b",
    re.I
)


class Triage(BaseModel):
    urgency: Literal["emergency", "urgent", "routine"]
    category: Literal["plumbing", "electrical", "hvac", "appliance", "structural", "pest", "other"]
    suggested_action: str
    reasoning: str


def validate_provider_config():
    """Enforces plan.md policy: free-first, paid API requires explicit authorization."""
    provider = os.getenv("LLM_PROVIDER", "gemini").lower()
    allow_paid = os.getenv("ALLOW_PAID_SERVICES", "false").lower() == "true"
    api_key = os.getenv("LLM_API_KEY", "")

    if provider not in FREE_PROVIDERS and not allow_paid:
        raise RuntimeError(
            f"Provider '{provider}' is not in free baseline. Set ALLOW_PAID_SERVICES=true to authorize."
        )

    if provider != "ollama" and not api_key:
        raise RuntimeError(f"LLM_API_KEY is required for '{provider}' provider.")

    return provider, api_key


def call_llm(prompt: str) -> str:
    """Dispatches to Gemini SDK, local Ollama, or OpenAI-compatible endpoint."""
    provider, api_key = validate_provider_config()
    model = os.getenv("LLM_MODEL", "gemini-2.0-flash")

    if provider == "gemini":
        from google import genai
        client = genai.Client(api_key=api_key)
        response = client.models.generate_content(
            model=model,
            contents=prompt,
        )
        return response.text

    elif provider in {"ollama", "openai", "custom"}:
        import requests
        base_url = os.getenv("LLM_BASE_URL", "http://localhost:11434/v1" if provider == "ollama" else "https://api.openai.com/v1")
        headers = {"Authorization": f"Bearer {api_key}"} if api_key else {}
        payload = {
            "model": model,
            "messages": [{"role": "user", "content": prompt}],
            "temperature": 0.1
        }
        res = requests.post(f"{base_url.rstrip('/')}/chat/completions", json=payload, headers=headers, timeout=30)
        res.raise_for_status()
        return res.json()["choices"][0]["message"]["content"]

    else:
        raise ValueError(f"Unsupported LLM_PROVIDER: {provider}")


def llm_triage(text: str) -> Triage:
    prompt = f"""You are a professional property maintenance triage assistant.
Classify the following tenant request into JSON adhering strictly to this schema:
{{
  "urgency": "emergency" | "urgent" | "routine",
  "category": "plumbing" | "electrical" | "hvac" | "appliance" | "structural" | "pest" | "other",
  "suggested_action": "<action description>",
  "reasoning": "<short explanation>"
}}

Tenant request:
\"\"\"{text}\"\"\"

Return ONLY valid raw JSON without markdown formatting.
"""
    raw = call_llm(prompt).strip()
    if raw.startswith("```"):
        raw = re.sub(r"^```(?:json)?\n?", "", raw)
        raw = re.sub(r"\n?```$", "", raw).strip()
    return Triage.model_validate_json(raw)


def triage(text: str, llm_fn=llm_triage) -> dict:
    """Safety rules run deterministically and take precedence over LLM classification."""
    hit = EMERGENCY_PATTERN.search(text)
    r = {
        "request": text,
        "status": "pending_review",
        "rule_hit": hit.group(0) if hit else None
    }
    try:
        res = llm_fn(text)
        r.update(res.model_dump())
    except Exception as e:
        # Fallback to manual review, never silently fall back to an unauthorized/paid provider
        r.update({
            "urgency": "routine",
            "category": "other",
            "suggested_action": "LLM triage unavailable; please inspect manually",
            "reasoning": f"LLM error: {e}"
        })

    # Deterministic safety rule override
    if hit:
        r["urgency"] = "emergency"
        if not r.get("suggested_action") or "manually" in r["suggested_action"]:
            r["suggested_action"] = f"CRITICAL SAFETY DISPATCH: detected '{hit.group(0)}'."
    return r


def save(r: dict, db="cases.db"):
    c = sqlite3.connect(db)
    c.execute("CREATE TABLE IF NOT EXISTS cases (id INTEGER PRIMARY KEY, status TEXT, data TEXT)")
    c.execute("INSERT INTO cases (status, data) VALUES (?, ?)", (r.get("status", "pending_review"), json.dumps(r)))
    c.commit()
    c.close()
