# CLAUDE.md — RepoPost AI

## Project Overview

**RepoPost AI** — A tool that takes any public GitHub repo URL and generates a polished, ready-to-post LinkedIn post showcasing the project. Includes a tone selector (Professional / Hype / Technical) for controllable output.

**Target build time:** 1 day (6-8 hours)

---

## Tech Stack

- **Backend:** Python 3.11+, FastAPI, Uvicorn
- **Frontend:** React 18 + Vite, Tailwind CSS
- **LLM:** Groq API (free tier, llama-3.1-70b-versatile)
- **External API:** GitHub REST API (no auth needed for public repos)
- **Deployment:** Backend on Render (free), Frontend on Vercel (free)

## Project Structure

```
repopost-ai/
├── CLAUDE.md
├── README.md
├── backend/
│   ├── requirements.txt
│   ├── .env.example
│   ├── main.py             # FastAPI app, single POST endpoint
│   └── core/
│       ├── __init__.py
│       ├── github_fetcher.py   # GitHub API data extraction
│       ├── prompt_builder.py   # Prompt templates per tone
│       └── generator.py        # LLM call via Groq
└── frontend/
    ├── package.json
    ├── vite.config.js
    ├── index.html
    ├── tailwind.config.js
    ├── postcss.config.js
    └── src/
        ├── main.jsx
        ├── App.jsx             # Single page app
        ├── components/
        │   ├── RepoInput.jsx       # URL input + tone selector
        │   ├── GeneratedPost.jsx   # Output card + copy button
        │   └── RepoSummary.jsx     # Collapsible fetched data view
        └── index.css               # Tailwind base imports
```

## Environment Variables

**Backend (`backend/.env`):**
```
GROQ_API_KEY=your_groq_api_key
```

No GitHub token needed — all calls are to public repo endpoints.

---

## BUILD PHASES

---

### Phase 1: GitHub Data Extraction (`core/github_fetcher.py`)

**Goal:** Given a repo URL like `https://github.com/owner/repo`, fetch all useful context.

**Endpoints to hit (no auth, raw HTTP via `httpx`):**
- `GET https://api.github.com/repos/{owner}/{repo}` → name, description, stars, forks, language, topics
- `GET https://api.github.com/repos/{owner}/{repo}/commits?per_page=10` → last 10 commit messages + dates
- `GET https://api.github.com/repos/{owner}/{repo}/readme` → README content (Accept: application/vnd.github.raw+json)
- `GET https://api.github.com/repos/{owner}/{repo}/languages` → language breakdown (e.g., {"Python": 80, "HTML": 20})

**Return a single dict:**
```python
{
    "name": str,
    "description": str | None,
    "stars": int,
    "forks": int,
    "primary_language": str,
    "languages": dict,
    "topics": list[str],
    "recent_commits": list[str],  # last 10 commit messages
    "readme": str  # truncated to 3000 chars if longer
}
```

**Rules:**
- Parse owner/repo from URL using simple string split, handle trailing slashes and `.git` suffix
- Truncate README to first 3000 chars to stay within token limits
- If any endpoint 404s, return None for that field — don't crash
- Use `httpx` (async not needed, use sync client)
- Add a 5-second timeout per request

**Test:** Run against these repos and print output:
- `https://github.com/404harshfound/Blood-Bank-Management-System`
- `https://github.com/torvalds/linux`
- `https://github.com/langchain-ai/langchain`

---

### Phase 2: Prompt Engineering (`core/prompt_builder.py`)

**Goal:** Build the LLM prompt from fetched repo data, with tone control.

**Three tones, three system prompts:**

1. **Professional** — Clean, corporate-safe, suitable for job seekers. First person. No emojis. 3-4 paragraphs. Mention tech stack and what problem it solves.

2. **Hype** — High energy, emoji-heavy, hook-first ("I just built something crazy 🔥"). Short punchy lines. Engagement-bait style that actually works on LinkedIn. Include a CTA ("check it out, link in comments").

3. **Technical** — Developer-to-developer. Lead with the architecture/design decisions. Mention specific tools/frameworks. Skip the fluff. Code-block or bullet-friendly format.

**Prompt structure:**
```
SYSTEM: You are a LinkedIn content writer. Write a post about a GitHub project in {tone} tone.
        Output ONLY the post text — no preamble, no "here's your post", no markdown fences.
        Keep it under 1300 characters (LinkedIn's sweet spot before "see more").
        Include the repo URL at the end naturally.

USER: Here is the project data:
      Name: {name}
      Description: {description}
      Tech Stack: {languages}
      Topics: {topics}
      Stars: {stars} | Forks: {forks}
      Recent work: {recent_commits joined by newline}
      README excerpt: {readme truncated}
      Repo URL: {repo_url}

      Write a {tone} LinkedIn post for this project.
```

**Rules:**
- Function signature: `build_prompt(repo_data: dict, tone: str, repo_url: str) -> tuple[str, str]` returning (system_prompt, user_prompt)
- If description is None, omit that line from the prompt — don't say "None"
- If stars/forks are 0, omit those too — don't highlight empty vanity metrics
- Commit messages should be deduped and limited to 7 most recent

**Test:** Print the full prompt for each tone using the Blood Bank repo data from Phase 1.

---

### Phase 3: LLM Generation (`core/generator.py`)

**Goal:** Send the prompt to Groq and return clean output.

**Setup:**
```python
from groq import Groq

client = Groq()  # reads GROQ_API_KEY from env
```

**Model:** `llama-3.1-70b-versatile`

**Call config:**
- `temperature=0.7` for Professional, `0.9` for Hype, `0.5` for Technical
- `max_tokens=1024`
- `top_p=0.9`

**Function signature:**
```python
def generate_post(system_prompt: str, user_prompt: str, temperature: float) -> str
```

**Rules:**
- Strip any leading/trailing whitespace or quotes from output
- If the model wraps output in markdown fences or adds "Here's your post:", strip that too
- Wrap in try/except — on any Groq error, return a user-friendly error string, don't crash
- Add a simple retry (max 2 attempts) on rate limit errors

**Test:** Generate one post per tone for the Blood Bank repo, print all three.

---

### Phase 3.5: FastAPI Endpoint (`backend/main.py`)

**Goal:** Wire Phases 1-3 into a single API endpoint the React frontend will call.

**Single endpoint:**
```
POST /generate
Body: { "repo_url": "https://github.com/owner/repo", "tone": "professional" }
Response: { "post": "generated text...", "repo_data": { ...fetched metadata } }
```

**Setup:**
```python
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"])
```

**Rules:**
- Validate `tone` is one of: professional, hype, technical — return 422 if not
- Validate `repo_url` contains `github.com` — return 400 with clear message if not
- If GitHub fetch fails (404, rate limit), return 404 or 429 with a `detail` message
- If LLM call fails, return 500 with `detail`
- Return `repo_data` alongside `post` so frontend can show the summary section
- Run with: `uvicorn main:app --reload --port 8000`

**Test:** Hit with `curl` or httpie before moving to Phase 4.

---

### Phase 4: React Frontend (`frontend/`)

**Goal:** Clean single-page app — paste URL, pick tone, get post, copy it.

**Setup:** `npm create vite@latest frontend -- --template react` → install Tailwind CSS.

**Layout:**
```
┌─────────────────────────────────────────┐
│  🚀 RepoPost AI                        │
│  Turn any GitHub repo into a            │
│  LinkedIn post in seconds               │
├─────────────────────────────────────────┤
│  [GitHub Repo URL input box           ] │
│                                         │
│  Tone: [Professional] [Hype] [Technical]│
│         (pill-style toggle buttons)     │
│                                         │
│  [ 🔥 Generate Post ]                  │
├─────────────────────────────────────────┤
│  Generated Post:                        │
│  ┌───────────────────────────────────┐  │
│  │ Your generated LinkedIn           │  │
│  │ post appears here...              │  │
│  └───────────────────────────────────┘  │
│  Character count: 847/1300              │
│  [ 📋 Copy ] [ 🔄 Regenerate ]         │
├─────────────────────────────────────────┤
│  ▸ Repo Summary (click to expand)      │
│    Stars: 12 | Forks: 3                │
│    Stack: Python 80%, HTML 20%          │
│    Recent commits: "Added JWT auth"     │
└─────────────────────────────────────────┘
```

**API call from frontend:**
```javascript
const res = await fetch("http://localhost:8000/generate", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ repo_url: url, tone: selectedTone }),
});
const data = await res.json();
// data = { post: string, repo_data: object }
```

**Components:**

**`App.jsx`** — State: `url`, `tone`, `post`, `repoData`, `loading`, `error`. Orchestrates the fetch call and passes data down.

**`RepoInput.jsx`** — Props: `url`, `setUrl`, `tone`, `setTone`, `onGenerate`, `loading`
- Text input for repo URL with placeholder "https://github.com/owner/repo"
- Three pill-style toggle buttons for tone (not a dropdown — pills look better)
- Generate button with loading spinner (disable while loading)
- Client-side validation: must match `github.com/` pattern before enabling button

**`GeneratedPost.jsx`** — Props: `post`, `onRegenerate`
- Display post in a styled card with a subtle left border accent
- Character count below: green text if ≤1300, red if over
- Copy button using `navigator.clipboard.writeText()` — show "Copied!" toast for 2 seconds
- Regenerate button to re-call with same URL/tone

**`RepoSummary.jsx`** — Props: `repoData`
- Collapsible section (default collapsed)
- Show: name, stars, forks, language breakdown (small colored bar), topics as tags, last 5 commit messages

**Styling (Tailwind):**
- Dark mode by default (looks more dev-tool-ish, stands out in screenshots)
- Max-width container centered (`max-w-2xl mx-auto`)
- Subtle gradient or solid dark bg (`bg-zinc-950`)
- Accent color: blue-500 or emerald-500 for buttons and highlights
- Smooth transition on post appearing (fade-in)
- Mobile responsive (it's a single column, so basically free)

**Rules:**
- No state management library — `useState` is enough for a day-build
- No routing — single page
- Proxy API calls in dev: add `server.proxy` in `vite.config.js` pointing to `http://localhost:8000`
- Handle 3 error states with clear UI messages: invalid URL, repo not found (404), generation failed

---

### Phase 5: Polish & Ship

**README.md must include:**
- One-liner: "Turn any GitHub repo into a LinkedIn post in seconds"
- Demo screenshot or GIF
- How to run locally (3 steps max: clone, pip install, streamlit run)
- How it works (4 bullet architecture: Fetch → Prompt → Generate → Display)
- Link to live demo (Streamlit Community Cloud)
- "Built in 1 day" badge or note — this is a flex, not a weakness

**Deployment:**
- Backend: Push to GitHub → deploy on Render free tier (set GROQ_API_KEY in env vars, start command: `uvicorn main:app --host 0.0.0.0 --port $PORT`)
- Frontend: Push to GitHub → deploy on Vercel (set `VITE_API_URL` env var pointing to Render backend URL)
- Update frontend fetch calls to use `VITE_API_URL` in production, localhost in dev
- Test live link end-to-end

**The Meta Move:**
- Run the tool on its OWN repo
- Use the generated LinkedIn post to announce the project on LinkedIn
- Screenshot that loop for the README — "This post was written by the tool it's promoting"

---

## Code Conventions

- Type hints on all function signatures
- No classes unless necessary — plain functions are fine for a day-build
- Use `python-dotenv` for env vars locally
- `httpx` for HTTP calls (not requests — it's cleaner)
- No async — keep it simple, everything sync
- Print statements for Phase 1-3 testing, remove before Phase 4

## Dependencies

**Backend (`backend/requirements.txt`):**
```
fastapi
uvicorn
httpx
groq
python-dotenv
```

**Frontend (`frontend/package.json` — via npm):**
```
react, react-dom, tailwindcss, @tailwindcss/vite, lucide-react
```
Use `lucide-react` for icons (copy, refresh, chevron, github, etc.) — clean and lightweight.

## Common Pitfalls to Avoid

- GitHub API rate limit for unauthenticated requests is 60/hour — enough for testing/demo, but mention in README
- Groq free tier has RPM limits — add basic retry logic, don't spam during testing
- Don't over-engineer: no database, no auth, no caching, no queue — it's a day project
- CORS: backend must allow all origins (already in Phase 3.5) or frontend proxy must be set up — this WILL bite you if forgotten
- Vite proxy: in dev, add `server: { proxy: { "/generate": "http://localhost:8000" } }` to `vite.config.js` so you don't deal with CORS locally
- README content can be huge (Linux kernel README) — always truncate
- Some repos have no description or README — handle gracefully, don't crash