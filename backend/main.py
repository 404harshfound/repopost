import os
import json
import secrets
from urllib.parse import urlencode

from dotenv import load_dotenv
load_dotenv()

import httpx
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import RedirectResponse, HTMLResponse
from pydantic import BaseModel

from core.github_fetcher import fetch_repo_data
from core.prompt_builder import build_prompt, TONE_TEMPERATURES
from core.generator import generate_post

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
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


def _oauth_result_page(data: dict) -> HTMLResponse:
    payload = json.dumps(data)
    return HTMLResponse(f"""<!DOCTYPE html>
<html><head><title>Connected</title>
<style>body{{font-family:system-ui;display:flex;align-items:center;justify-content:center;height:100vh;margin:0;color:#1a1a1a;background:#f5f3f0}}</style>
</head><body><p>Connected! This window will close...</p>
<script>
if(window.opener){{window.opener.postMessage({payload},'*');}}
setTimeout(()=>window.close(),1000);
</script></body></html>""")


def _oauth_error_page(message: str) -> HTMLResponse:
    return HTMLResponse(f"""<!DOCTYPE html>
<html><head><title>Error</title>
<style>body{{font-family:system-ui;display:flex;align-items:center;justify-content:center;height:100vh;margin:0;color:#e53e3e;background:#f5f3f0}}</style>
</head><body><p>{message}</p>
<script>setTimeout(()=>window.close(),3000);</script>
</body></html>""", status_code=400)


# ── GitHub OAuth ─────────────────────────────────────────

@app.get("/auth/github")
def auth_github():
    if not GITHUB_CLIENT_ID:
        raise HTTPException(400, "GitHub OAuth not configured. Set GITHUB_CLIENT_ID and GITHUB_CLIENT_SECRET in .env")
    params = urlencode({
        "client_id": GITHUB_CLIENT_ID,
        "redirect_uri": f"{BACKEND_URL}/auth/github/callback",
        "scope": "read:user public_repo",
        "state": secrets.token_urlsafe(16),
    })
    return RedirectResponse(f"https://github.com/login/oauth/authorize?{params}")


@app.get("/auth/github/callback")
def auth_github_callback(code: str = "", error: str = ""):
    if error or not code:
        return _oauth_error_page("GitHub authorization was denied.")

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
        return _oauth_result_page(data)

    except Exception as e:
        return _oauth_error_page(f"GitHub connection failed: {e}")


# ── LinkedIn OAuth (OpenID Connect) ──────────────────────

@app.get("/auth/linkedin")
def auth_linkedin():
    if not LINKEDIN_CLIENT_ID:
        raise HTTPException(400, "LinkedIn OAuth not configured. Set LINKEDIN_CLIENT_ID and LINKEDIN_CLIENT_SECRET in .env")
    params = urlencode({
        "response_type": "code",
        "client_id": LINKEDIN_CLIENT_ID,
        "redirect_uri": f"{BACKEND_URL}/auth/linkedin/callback",
        "scope": "openid profile email",
        "state": secrets.token_urlsafe(16),
    })
    return RedirectResponse(f"https://www.linkedin.com/oauth/v2/authorization?{params}")


@app.get("/auth/linkedin/callback")
def auth_linkedin_callback(code: str = "", error: str = ""):
    if error or not code:
        return _oauth_error_page("LinkedIn authorization was denied.")

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
        return _oauth_result_page(data)

    except Exception as e:
        return _oauth_error_page(f"LinkedIn connection failed: {e}")


# ── Generate endpoint ────────────────────────────────────

class GenerateRequest(BaseModel):
    repo_url: str
    tone: str
    model: str = "openai/gpt-oss-120b"


@app.post("/generate")
def generate(req: GenerateRequest) -> dict:
    if req.tone not in VALID_TONES:
        raise HTTPException(status_code=422, detail=f"tone must be one of: {', '.join(VALID_TONES)}")

    if "github.com" not in req.repo_url:
        raise HTTPException(status_code=400, detail="repo_url must be a GitHub URL (must contain github.com)")

    try:
        repo_data = fetch_repo_data(req.repo_url)
    except Exception as e:
        raise HTTPException(status_code=404, detail=f"Failed to fetch repo data: {e}")

    if repo_data.get("name") is None:
        raise HTTPException(status_code=404, detail="Repository not found. Check the URL and make sure it's a public repo.")

    system_prompt, user_prompt = build_prompt(repo_data, req.tone, req.repo_url)
    temperature = TONE_TEMPERATURES[req.tone]

    selected_model = req.model if req.model in VALID_MODELS else "openai/gpt-oss-120b"
    post = generate_post(system_prompt, user_prompt, temperature, selected_model)

    if post.startswith("Error"):
        raise HTTPException(status_code=500, detail=post)

    return {"post": post, "repo_data": repo_data}
