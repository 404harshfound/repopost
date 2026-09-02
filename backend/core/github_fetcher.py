import httpx


def parse_repo_url(url: str) -> tuple[str, str]:
    url = url.strip().rstrip("/")
    if url.endswith(".git"):
        url = url[:-4]
    parts = url.split("github.com/")[-1].split("/")
    return parts[0], parts[1]


def fetch_repo_data(repo_url: str) -> dict:
    owner, repo = parse_repo_url(repo_url)
    base = f"https://api.github.com/repos/{owner}/{repo}"
    timeout = httpx.Timeout(5.0)

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

    try:
        r = httpx.get(base, timeout=timeout)
        if r.status_code == 200:
            data = r.json()
            result["name"] = data.get("name")
            result["description"] = data.get("description")
            result["stars"] = data.get("stargazers_count", 0)
            result["forks"] = data.get("forks_count", 0)
            result["primary_language"] = data.get("language")
            result["topics"] = data.get("topics", [])
    except httpx.HTTPError:
        pass

    try:
        r = httpx.get(f"{base}/languages", timeout=timeout)
        if r.status_code == 200:
            result["languages"] = r.json()
    except httpx.HTTPError:
        pass

    try:
        r = httpx.get(f"{base}/commits", params={"per_page": 10}, timeout=timeout)
        if r.status_code == 200:
            commits = r.json()
            result["recent_commits"] = [
                c["commit"]["message"].split("\n")[0] for c in commits
            ]
    except httpx.HTTPError:
        pass

    try:
        r = httpx.get(
            f"{base}/readme",
            headers={"Accept": "application/vnd.github.raw+json"},
            timeout=timeout,
        )
        if r.status_code == 200:
            readme = r.text
            result["readme"] = readme[:3000]
    except httpx.HTTPError:
        pass

    return result


if __name__ == "__main__":
    import json

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
