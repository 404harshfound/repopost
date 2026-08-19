import re
import time

from groq import Groq


def generate_post(system_prompt: str, user_prompt: str, temperature: float, model: str = "openai/gpt-oss-120b") -> str:
    client = Groq()
    max_attempts = 2

    for attempt in range(max_attempts):
        try:
            response = client.chat.completions.create(
                model=model,
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_prompt},
                ],
                temperature=temperature,
                max_tokens=2048,
                top_p=0.9,
            )
            text = response.choices[0].message.content
            return _clean_output(text)
        except Exception as e:
            error_str = str(e).lower()
            if "rate_limit" in error_str or "429" in error_str:
                if attempt < max_attempts - 1:
                    time.sleep(2)
                    continue
            return f"Error generating post: {e}"

    return "Error: Failed after retrying. Please try again later."


def _clean_output(text: str) -> str:
    text = text.strip().strip('"').strip("'")
    text = re.sub(r"^```[\w]*\n?", "", text)
    text = re.sub(r"\n?```$", "", text)
    text = re.sub(
        r"^(here'?s?\s*(is\s*)?(your\s*)?post:?\s*\n?)",
        "",
        text,
        flags=re.IGNORECASE,
    )
    return text.strip()


if __name__ == "__main__":
    from github_fetcher import fetch_repo_data
    from prompt_builder import build_prompt, TONE_TEMPERATURES

    repo_url = "https://github.com/404harshfound/Blood-Bank-Management-System"
    data = fetch_repo_data(repo_url)

    for tone in ["professional", "hype", "technical"]:
        system_prompt, user_prompt = build_prompt(data, tone, repo_url)
        temp = TONE_TEMPERATURES[tone]
        print(f"\n{'='*60}")
        print(f"TONE: {tone.upper()} (temp={temp})")
        print("=" * 60)
        post = generate_post(system_prompt, user_prompt, temp)
        print(post)
