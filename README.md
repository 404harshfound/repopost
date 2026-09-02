# RepoPost AI

> Turn any GitHub repo into a LinkedIn post in seconds.

Built in 1 day. Paste a public GitHub repo URL, pick a tone, get a polished LinkedIn post ready to copy and share.

## Tech Stack

- Backend: Python, FastAPI, Uvicorn
- Frontend: React 18, Vite, Tailwind CSS
- LLM: Groq API (openai/gpt-oss-120b)
- APIs: GitHub REST API (no auth needed for public repos)

## How It Works

```mermaid
flowchart LR
    A[Public GitHub repo URL] --> B[Fetch: GitHub REST API]
    B --> C[Repo metadata, README, commits, languages]
    C --> D[Prompt Builder: tone-aware prompt]
    D --> E[Groq LLM]
    E --> F[Generated LinkedIn post]
    F --> G[Copy + share]
```

## Run Locally

```bash
# 1. Clone and install backend
git clone https://github.com/404harshfound/repopost.git
cd repopost/backend
pip install -r requirements.txt

# 2. Add your Groq API key
cp .env.example .env
# Edit .env and add your GROQ_API_KEY

# 3. Start the backend
uvicorn main:app --reload --port 8000
```

```bash
# 4. In a new terminal, start the frontend
cd frontend
npm install
npm run dev
```

Open `http://localhost:5173` and you're live.

## Deploy

**Backend (Render):**
- Push to GitHub
- Create a new Web Service on Render
- Set `GROQ_API_KEY` in environment variables
- Start command: `uvicorn main:app --host 0.0.0.0 --port $PORT`

**Frontend (Vercel):**
- Push to GitHub
- Import project on Vercel, set root directory to `frontend`
- Set `VITE_API_URL` env var to your Render backend URL

## Limitations

- GitHub API rate limit: 60 requests/hour without a token (enough for demos)
- Groq free tier has RPM limits — retry logic is built in
- No persistent storage, auth is demo-only (demo@repopost.ai / demo123)

## License

MIT — see [LICENSE](LICENSE)
