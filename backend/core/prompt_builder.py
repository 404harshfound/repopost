TONE_SYSTEM_PROMPTS: dict[str, str] = {
    "professional": (
        "You are a LinkedIn content writer. Write a post about a GitHub project in a professional tone. "
        "Start by clearly explaining what the project is and what problem it solves. "
        "Write in first person. Do not use emojis. Write 3-5 paragraphs. "
        "Mention the tech stack and key features. "
        "Output ONLY the post text — no preamble, no 'here\\'s your post', no markdown fences. "
        "Do NOT use markdown formatting (no **bold**, no *italic*, no `backticks`, no bullet dashes). "
        "LinkedIn only renders plain text — use line breaks and spacing for structure instead. "
        "Write as much as needed to do the project justice — no character limit. "
        "Include the repo URL at the end naturally."
    ),
    "hype": (
        "You are a LinkedIn content writer. Write a post about a GitHub project in a hype tone. "
        "Start with a hook that tells people what you built and why it matters. "
        "High energy, emoji-heavy, hook-first (e.g. 'I just built something crazy 🔥'). "
        "Explain what the project does early — don't make readers guess. "
        "Use short punchy lines. Engagement-bait style that actually works on LinkedIn. "
        "Include a CTA like 'check it out, link in comments'. "
        "Output ONLY the post text — no preamble, no 'here\\'s your post', no markdown fences. "
        "Do NOT use markdown formatting (no **bold**, no *italic*, no `backticks`, no bullet dashes). "
        "LinkedIn only renders plain text — use line breaks, spacing, and emojis for structure instead. "
        "Write as much as needed to do the project justice — no character limit. "
        "Include the repo URL at the end naturally."
    ),
    "technical": (
        "You are a LinkedIn content writer. Write a post about a GitHub project in a technical tone. "
        "Start by explaining what the project is and the problem it addresses. "
        "Then go into architecture and design decisions. "
        "Developer-to-developer. Mention specific tools and frameworks. Skip the fluff. "
        "Output ONLY the post text — no preamble, no 'here\\'s your post', no markdown fences. "
        "Do NOT use markdown formatting (no **bold**, no *italic*, no `backticks`, no bullet dashes). "
        "LinkedIn only renders plain text — use line breaks, spacing, and Unicode arrows/bullets for structure instead. "
        "Write as much as needed to do the project justice — no character limit. "
        "Include the repo URL at the end naturally."
    ),
}

TONE_TEMPERATURES: dict[str, float] = {
    "professional": 0.7,
    "hype": 0.9,
    "technical": 0.5,
}


def build_prompt(repo_data: dict, tone: str, repo_url: str) -> tuple[str, str]:
    system_prompt = TONE_SYSTEM_PROMPTS[tone]

    lines = [
        "Here is the project data:",
        f"Name: {repo_data['name']}",
    ]

    if repo_data.get("description"):
        lines.append(f"Description: {repo_data['description']}")

    if repo_data.get("languages"):
        stack = ", ".join(f"{lang} {pct}%" for lang, pct in _language_percentages(repo_data["languages"]).items())
        lines.append(f"Tech Stack: {stack}")

    if repo_data.get("topics"):
        lines.append(f"Topics: {', '.join(repo_data['topics'])}")

    if repo_data.get("stars", 0) > 0 or repo_data.get("forks", 0) > 0:
        metrics = []
        if repo_data.get("stars", 0) > 0:
            metrics.append(f"Stars: {repo_data['stars']}")
        if repo_data.get("forks", 0) > 0:
            metrics.append(f"Forks: {repo_data['forks']}")
        lines.append(" | ".join(metrics))

    if repo_data.get("recent_commits"):
        unique_commits = list(dict.fromkeys(repo_data["recent_commits"]))[:7]
        lines.append(f"Recent work:\n" + "\n".join(f"- {c}" for c in unique_commits))

    if repo_data.get("readme"):
        lines.append(f"README excerpt: {repo_data['readme']}")

    lines.append(f"Repo URL: {repo_url}")
    lines.append(f"\nWrite a {tone} LinkedIn post for this project.")

    user_prompt = "\n".join(lines)
    return system_prompt, user_prompt


def _language_percentages(languages: dict) -> dict[str, int]:
    total = sum(languages.values())
    if total == 0:
        return {}
    result = {}
    for lang, bytes_count in languages.items():
        pct = round(bytes_count / total * 100)
        if pct > 0:
            result[lang] = pct
    return result


if __name__ == "__main__":
    from github_fetcher import fetch_repo_data

    repo_url = "https://github.com/404harshfound/Blood-Bank-Management-System"
    data = fetch_repo_data(repo_url)

    for tone in ["professional", "hype", "technical"]:
        system_prompt, user_prompt = build_prompt(data, tone, repo_url)
        print(f"\n{'='*60}")
        print(f"TONE: {tone.upper()}")
        print(f"{'='*60}")
        print(f"\n--- SYSTEM PROMPT ---\n{system_prompt}")
        print(f"\n--- USER PROMPT ---\n{user_prompt}")
