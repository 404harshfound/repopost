import os
import logging
import httpx

logger = logging.getLogger(__name__)

GITHUB_TOKEN = os.getenv("GITHUB_TOKEN", "")


def _github_headers() -> dict:
    """Return headers for GitHub API requests, including auth token if available."""
    headers = {"Accept": "application/vnd.github+json"}
    if GITHUB_TOKEN:
        headers["Authorization"] = f"Bearer {GITHUB_TOKEN}"
    return headers


def parse_repo_url(url: str) -> tuple[str, str]:
    url = url.strip().rstrip("/")
    if url.endswith(".git"):
        url = url[:-4]
    parts = url.split("github.com/")[-1].split("/")
    if len(parts) < 2 or not parts[0] or not parts[1]:
        raise ValueError(f"Invalid GitHub URL: cannot extract owner/repo from '{url}'")
    return parts[0], parts[1]


def fetch_repo_data(repo_url: str) -> dict:
    owner, repo = parse_repo_url(repo_url)
    base = f"https://api.github.com/repos/{owner}/{repo}"
    timeout = httpx.Timeout(10.0)
    headers = _github_headers()

    result = {
        "name": None,
        "description": None,
        "stars": 0,
        "forks": 0,
        "primary_language": None,
        "languages": None,
        "topics": None,
        "recent_commits": None,
        "readme": None,
    }

    # Fetch repo metadata - critical call
    try:
        r = httpx.get(base, headers=headers, timeout=timeout)
        if r.status_code == 200:
            data = r.json()
            result["name"] = data.get("name")
            result["description"] = data.get("description")
            result["stars"] = data.get("stargazers_count", 0)
            result["forks"] = data.get("forks_count", 0)
            result["primary_language"] = data.get("language")
            result["topics"] = data.get("topics", [])
        elif r.status_code == 404:
            logger.warning("Repository not found: %s/%s", owner, repo)
            return result
        elif r.status_code == 403:
            logger.error("GitHub API rate limit or access denied for %s/%s: %s", owner, repo, r.text[:200])
            raise RuntimeError(f"GitHub API rate limit exceeded. Try again later.")
        else:
            logger.error("GitHub API error %d for %s/%s: %s", r.status_code, owner, repo, r.text[:200])
            raise RuntimeError(f"GitHub API returned status {r.status_code}")
    except httpx.HTTPError as e:
        logger.error("Network error fetching repo %s/%s: %s", owner, repo, e)
        raise RuntimeError(f"Could not reach GitHub API: {e}")

    # Fetch languages (non-critical)
    try:
        r = httpx.get(f"{base}/languages", headers=headers, timeout=timeout)
        if r.status_code == 200:
            result["languages"] = r.json()
        else:
            logger.warning("Failed to fetch languages for %s/%s: HTTP %d", owner, repo, r.status_code)
    except httpx.HTTPError as e:
        logger.warning("Network error fetching languages for %s/%s: %s", owner, repo, e)

    # Fetch recent commits (non-critical)
    try:
        r = httpx.get(f"{base}/commits", params={"per_page": 10}, headers=headers, timeout=timeout)
        if r.status_code == 200:
            commits = r.json()
            result["recent_commits"] = [
                c["commit"]["message"].split("\n")[0] for c in commits
            ]
        else:
            logger.warning("Failed to fetch commits for %s/%s: HTTP %d", owner, repo, r.status_code)
    except httpx.HTTPError as e:
        logger.warning("Network error fetching commits for %s/%s: %s", owner, repo, e)

    # Fetch README (non-critical)
    try:
        readme_headers = {**headers, "Accept": "application/vnd.github.raw+json"}
        r = httpx.get(f"{base}/readme", headers=readme_headers, timeout=timeout)
        if r.status_code == 200:
            readme = r.text
            result["readme"] = readme[:3000]
        else:
            logger.warning("Failed to fetch README for %s/%s: HTTP %d", owner, repo, r.status_code)
    except httpx.HTTPError as e:
        logger.warning("Network error fetching README for %s/%s: %s", owner, repo, e)

    return result


if __name__ == "__main__":
    import json

    logging.basicConfig(level=logging.INFO)

    test_urls = [
        "https://github.com/404harshfound/Blood-Bank-Management-System",
        "https://github.com/torvalds/linux",
        "https://github.com/langchain-ai/langchain",
    ]
    for url in test_urls:
        print(f"\n{'='*60}")
        print(f"Fetching: {url}")
        print("=" * 60)
        data = fetch_repo_data(url)
        printable = {k: v if k != "readme" else (v[:200] + "..." if v else None) for k, v in data.items()}
        print(json.dumps(printable, indent=2))
