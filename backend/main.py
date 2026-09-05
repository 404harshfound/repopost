import os
import json
import hmac
import hashlib
import logging
import secrets
import time
from collections import defaultdict
from urllib.parse import urlencode

from pathlib import Path
from dotenv import load_dotenv
load_dotenv(Path(__file__).parent / ".env")

import httpx
from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import RedirectResponse, HTMLResponse
from pydantic import BaseModel

from core.github_fetcher import fetch_repo_data
from core.prompt_builder import build_prompt, TONE_TEMPERATURES
from core.generator import generate_post

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI()

# ── CORS — lock down to actual frontend origins ────────────
FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:5173")
ALLOWED_ORIGINS = [origin.strip() for origin in FRONTEND_URL.split(",")]

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["Content-Type", "Authorization"],
)

VALID_TONES = {"professional", "hype", "technical"}
VALID_MODELS = {
    "openai/gpt-oss-120b",
    "qwen/qwen3.6-27b",
    "openai/gpt-oss-20b",
    "groq/compound",
}

GITHUB_CLIENT_ID = os.getenv("GITHUB_CLIENT_ID", "")
GITHUB_CLIENT_SECRET = os.getenv("GITHUB_CLIENT_SECRET", "")
LINKEDIN_CLIENT_ID = os.getenv("LINKEDIN_CLIENT_ID", "")
LINKEDIN_CLIENT_SECRET = os.getenv("LINKEDIN_CLIENT_SECRET", "")
BACKEND_URL = os.getenv("BACKEND_URL", "http://localhost:8000")

# Secret for signing OAuth state cookies
STATE_SECRET = os.getenv("STATE_SECRET", secrets.token_hex(32))

# ── Simple in-memory rate limiter ──────────────────────────
_rate_limit_store: dict[str, list[float]] = defaultdict(list)
RATE_LIMIT_WINDOW = 60  # seconds
RATE_LIMIT_MAX = 10  # requests per window


def _check_rate_limit(client_ip: str) -> bool:
    """Return True if the request should be allowed."""
    now = time.time()
    timestamps = _rate_limit_store[client_ip]
    # Purge old entries
    _rate_limit_store[client_ip] = [t for t in timestamps if now - t < RATE_LIMIT_WINDOW]
    if len(_rate_limit_store[client_ip]) >= RATE_LIMIT_MAX:
        return False
    _rate_limit_store[client_ip].append(now)
    return True


# ── OAuth state helpers (HMAC-signed cookie) ───────────────
def _sign_state(state: str) -> str:
    """Create an HMAC signature for an OAuth state value."""
    return hmac.new(STATE_SECRET.encode(), state.encode(), hashlib.sha256).hexdigest()


def _make_state_cookie_value(state: str) -> str:
    """Return 'state.signature' for the cookie."""
    return f"{state}.{_sign_state(state)}"


def _verify_state_cookie(cookie_value: str, returned_state: str) -> bool:
    """Verify that the returned state matches the signed cookie."""
    if not cookie_value or not returned_state:
        return False
    parts = cookie_value.split(".", 1)
    if len(parts) != 2:
        return False
    stored_state, signature = parts
    if stored_state != returned_state:
        return False
    expected_sig = _sign_state(stored_state)
    return hmac.compare_digest(signature, expected_sig)


# ── HTML response helpers ──────────────────────────────────

def _oauth_result_page(data: dict) -> HTMLResponse:
    payload = json.dumps(data)
    # Use the specific frontend origin instead of wildcard '*'
    target_origin = ALLOWED_ORIGINS[0] if ALLOWED_ORIGINS else "*"
    return HTMLResponse(f"""<!DOCTYPE html>
<html><head><title>Connected</title>
<style>body{{font-family:system-ui;display:flex;align-items:center;justify-content:center;height:100vh;margin:0;color:#1a1a1a;background:#f5f3f0}}</style>
</head><body><p>Connected! This window will close...</p>
<script>
if(window.opener){{window.opener.postMessage({payload},'{target_origin}');}}
setTimeout(()=>window.close(),1000);
</script></body></html>""")


def _oauth_error_page(user_message: str) -> HTMLResponse:
    return HTMLResponse(f"""<!DOCTYPE html>
<html><head><title>Error</title>
<style>body{{font-family:system-ui;display:flex;align-items:center;justify-content:center;height:100vh;margin:0;color:#e53e3e;background:#f5f3f0}}</style>
</head><body><p>{user_message}</p>
<script>setTimeout(()=>window.close(),3000);</script>
</body></html>""", status_code=400)


# ── GitHub OAuth ─────────────────────────────────────────

@app.get("/auth/github")
def auth_github():
    if not GITHUB_CLIENT_ID:
        raise HTTPException(400, "GitHub OAuth not configured.")
    state = secrets.token_urlsafe(32)
    params = urlencode({
        "client_id": GITHUB_CLIENT_ID,
        "redirect_uri": f"{BACKEND_URL}/auth/github/callback",
        "scope": "read:user",
        "state": state,
    })
    response = RedirectResponse(f"https://github.com/login/oauth/authorize?{params}")
    response.set_cookie(
        "oauth_state",
        _make_state_cookie_value(state),
        max_age=600,
        httponly=True,
        samesite="lax",
        secure=BACKEND_URL.startswith("https"),
    )
    return response


@app.get("/auth/github/callback")
def auth_github_callback(request: Request, code: str = "", state: str = "", error: str = ""):
    if error or not code:
        return _oauth_error_page("GitHub authorization was denied.")

    # Validate OAuth state
    cookie_value = request.cookies.get("oauth_state", "")
    if not _verify_state_cookie(cookie_value, state):
        logger.warning("GitHub OAuth state mismatch — possible CSRF")
        return _oauth_error_page("Authorization failed. Please try again.")

    try:
        token_res = httpx.post(
            "https://github.com/login/oauth/access_token",
            data={
                "client_id": GITHUB_CLIENT_ID,
                "client_secret": GITHUB_CLIENT_SECRET,
                "code": code,
            },
            headers={"Accept": "application/json"},
            timeout=10,
        )
        token_data = token_res.json()
        access_token = token_data.get("access_token")
        if not access_token:
            return _oauth_error_page("Failed to get access token from GitHub.")

        headers = {"Authorization": f"Bearer {access_token}"}

        user_res = httpx.get("https://api.github.com/user", headers=headers, timeout=10)
        user = user_res.json()

        repos_res = httpx.get(
            "https://api.github.com/user/repos?per_page=30&sort=updated&type=owner",
            headers=headers, timeout=10,
        )
        repos_raw = repos_res.json()

        data = {
            "type": "github-auth",
            "username": user.get("login", ""),
            "name": user.get("name") or user.get("login", ""),
            "avatar": user.get("avatar_url", ""),
            "repos": [
                {
                    "name": r.get("full_name", ""),
                    "url": r.get("html_url", ""),
                    "description": r.get("description"),
                    "stars": r.get("stargazers_count", 0),
                }
                for r in repos_raw
                if isinstance(r, dict)
            ],
        }
        response = _oauth_result_page(data)
        response.delete_cookie("oauth_state")
        return response

    except Exception as e:
        logger.error("GitHub OAuth callback error: %s", e)
        return _oauth_error_page("GitHub connection failed. Please try again.")


# ── LinkedIn OAuth (OpenID Connect) ──────────────────────

@app.get("/auth/linkedin")
def auth_linkedin():
    if not LINKEDIN_CLIENT_ID:
        raise HTTPException(400, "LinkedIn OAuth not configured.")
    state = secrets.token_urlsafe(32)
    params = urlencode({
        "response_type": "code",
        "client_id": LINKEDIN_CLIENT_ID,
        "redirect_uri": f"{BACKEND_URL}/auth/linkedin/callback",
        "scope": "openid profile email",
        "state": state,
    })
    response = RedirectResponse(f"https://www.linkedin.com/oauth/v2/authorization?{params}")
    response.set_cookie(
        "oauth_state",
        _make_state_cookie_value(state),
        max_age=600,
        httponly=True,
        samesite="lax",
        secure=BACKEND_URL.startswith("https"),
    )
    return response


@app.get("/auth/linkedin/callback")
def auth_linkedin_callback(request: Request, code: str = "", state: str = "", error: str = ""):
    if error or not code:
        return _oauth_error_page("LinkedIn authorization was denied.")

    # Validate OAuth state
    cookie_value = request.cookies.get("oauth_state", "")
    if not _verify_state_cookie(cookie_value, state):
        logger.warning("LinkedIn OAuth state mismatch — possible CSRF")
        return _oauth_error_page("Authorization failed. Please try again.")

    try:
        token_res = httpx.post(
            "https://www.linkedin.com/oauth/v2/accessToken",
            data={
                "grant_type": "authorization_code",
                "code": code,
                "client_id": LINKEDIN_CLIENT_ID,
                "client_secret": LINKEDIN_CLIENT_SECRET,
                "redirect_uri": f"{BACKEND_URL}/auth/linkedin/callback",
            },
            headers={"Content-Type": "application/x-www-form-urlencoded"},
            timeout=10,
        )
        token_data = token_res.json()
        access_token = token_data.get("access_token")
        if not access_token:
            return _oauth_error_page("Failed to get access token from LinkedIn.")

        userinfo_res = httpx.get(
            "https://api.linkedin.com/v2/userinfo",
            headers={"Authorization": f"Bearer {access_token}"},
            timeout=10,
        )
        userinfo = userinfo_res.json()

        data = {
            "type": "linkedin-auth",
            "name": userinfo.get("name", ""),
            "email": userinfo.get("email", ""),
            "photoUrl": userinfo.get("picture", ""),
            "headline": userinfo.get("headline", ""),
        }
        response = _oauth_result_page(data)
        response.delete_cookie("oauth_state")
        return response

    except Exception as e:
        logger.error("LinkedIn OAuth callback error: %s", e)
        return _oauth_error_page("LinkedIn connection failed. Please try again.")


# ── Generate endpoint ────────────────────────────────────

class GenerateRequest(BaseModel):
    repo_url: str
    tone: str
    model: str = "openai/gpt-oss-120b"


@app.post("/generate")
def generate(req: GenerateRequest, request: Request) -> dict:
    # Rate limiting
    client_ip = request.client.host if request.client else "unknown"
    if not _check_rate_limit(client_ip):
        raise HTTPException(status_code=429, detail="Too many requests. Please wait a minute and try again.")

    if req.tone not in VALID_TONES:
        raise HTTPException(status_code=422, detail=f"tone must be one of: {', '.join(VALID_TONES)}")

    if "github.com" not in req.repo_url:
        raise HTTPException(status_code=400, detail="repo_url must be a GitHub URL (must contain github.com)")

    try:
        repo_data = fetch_repo_data(req.repo_url)
    except Exception as e:
        logger.error("Failed to fetch repo data for %s: %s", req.repo_url, e)
        raise HTTPException(status_code=502, detail=str(e))

    if repo_data.get("name") is None:
        raise HTTPException(status_code=404, detail="Repository not found. Check the URL and make sure it's a public repo.")

    system_prompt, user_prompt = build_prompt(repo_data, req.tone, req.repo_url)
    temperature = TONE_TEMPERATURES[req.tone]

    selected_model = req.model if req.model in VALID_MODELS else "openai/gpt-oss-120b"
    post = generate_post(system_prompt, user_prompt, temperature, selected_model)

    if post.startswith("Error"):
        raise HTTPException(status_code=500, detail=post)

    return {"post": post, "repo_data": repo_data}


# ── Health check ─────────────────────────────────────────

@app.get("/health")
def health():
    return {"status": "ok"}
