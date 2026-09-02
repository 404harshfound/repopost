import { useState } from "react";
import { ArrowRight, Github, Sparkles, Zap, Sun, Moon, Linkedin } from "lucide-react";

export default function Landing({ onNavigate }) {
  const [theme, setTheme] = useState(
    () => document.documentElement.getAttribute("data-theme") || "light"
  );

  const toggleTheme = () => {
    const next = theme === "light" ? "dark" : "light";
    setTheme(next);
    localStorage.setItem("repopost_theme", next);
    if (next === "dark") {
      document.documentElement.setAttribute("data-theme", "dark");
    } else {
      document.documentElement.removeAttribute("data-theme");
    }
  };

  return (
    <div className="min-h-screen bg-[var(--surface)] text-[var(--ink)] font-[system-ui]">

      {/* Nav */}
      <nav className="relative z-20 flex items-center justify-between px-8 py-5">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-[#1a1a1a]">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65S8.93 17.38 9 18v4" />
              <path d="M9 18c-4.51 2-5-2-7-2" />
            </svg>
          </div>
          <span className="text-[15px] font-semibold tracking-[-0.02em]">RepoPost</span>
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg text-[var(--ink-dim)] hover:text-[var(--ink)] hover:bg-[var(--elevated)] transition-colors"
            title={theme === "light" ? "Switch to dark mode" : "Switch to light mode"}
          >
            {theme === "light" ? <Moon className="h-[18px] w-[18px]" /> : <Sun className="h-[18px] w-[18px]" />}
          </button>
          <button
            onClick={() => onNavigate("auth")}
            className="text-[13px] text-[var(--ink-dim)] hover:text-[var(--ink)] transition-colors"
          >
            Sign In
          </button>
          <button
            onClick={() => onNavigate("auth")}
            className="rounded-xl bg-[var(--btn)] px-5 py-2 text-[13px] font-medium text-[var(--btn-text)] hover:bg-[var(--btn-hover)] transition-colors"
          >
            Get Started
          </button>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="hero-glow" />

        <div className="relative z-10 max-w-6xl mx-auto px-8 pt-24 pb-32">
          <div className="hero-rise max-w-2xl mx-auto text-center">
            <h1 className="text-[clamp(2.25rem,6vw,3.25rem)] font-semibold leading-[1.08] tracking-[-0.035em] text-[var(--ink)]">
              Turn repos into
              <br />
              LinkedIn posts
            </h1>

            <p className="mt-5 text-[17px] leading-[1.6] text-[var(--ink-dim)] max-w-md mx-auto">
              Paste any public GitHub repository and get a polished,
              ready-to-post LinkedIn post in seconds.
            </p>

            <div className="mt-10 flex items-center justify-center gap-3">
              <button
                onClick={() => onNavigate("auth")}
                className="rounded-2xl bg-[var(--btn)] px-7 py-3.5 text-[14px] font-medium text-[var(--btn-text)] hover:bg-[var(--btn-hover)] transition-colors shadow-[0_2px_8px_rgba(0,0,0,0.15)] flex items-center gap-2"
              >
                Get Started
                <ArrowRight className="h-4 w-4" />
              </button>
              <a
                href="https://github.com/404harshfound"
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-2xl border border-[var(--edge-muted)] bg-[var(--card)] px-7 py-3.5 text-[14px] font-medium text-[var(--ink)] hover:bg-[var(--card-hover)] transition-colors flex items-center gap-2"
              >
                <Github className="h-4 w-4" />
                GitHub
              </a>
            </div>
          </div>

          {/* Product preview — a lit mockup of the app's own repo-input bar,
              deliberately kept light regardless of page theme so it reads as
              a floating screenshot rather than a page element. */}
          <div className="hero-rise-delay relative mt-24 max-w-lg mx-auto">
            <div className="hero-card-glow" />
            <div className="relative z-10 rounded-2xl bg-white shadow-[0_24px_70px_-20px_rgba(0,0,0,0.4)] border border-black/[0.06] overflow-hidden">
              <div className="px-5 pt-5 pb-3 flex items-center gap-3">
                <Github className="h-4 w-4 text-[#9a9590] shrink-0" />
                <span className="text-[14px] text-[#4a4540] tracking-[-0.01em]">
                  https://github.com/torvalds/linux
                </span>
              </div>
              <div className="mx-2 px-3 pb-3 pt-3 flex items-center justify-between border-t border-black/[0.05]">
                <span className="flex items-center gap-1.5 text-[12px] font-medium text-[#6b6660]">
                  <Sparkles className="h-3 w-3" />
                  GPT-OSS 120B
                  <span className="text-[#d4cfc7]">&middot;</span>
                  Technical
                </span>
                <span className="rounded-xl bg-[#1a1a1a] px-4 py-2 text-[12px] font-medium text-white flex items-center gap-1.5">
                  Generate
                  <ArrowRight className="h-3 w-3" />
                </span>
              </div>
            </div>
            <p className="relative z-10 mt-5 text-center text-[13px] text-[var(--ink-muted)]">
              AI-generated LinkedIn posts from your code
            </p>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="relative border-t border-[var(--edge)] bg-[var(--card)]">
        <div className="max-w-6xl mx-auto px-8 py-24">
          <p className="text-center text-[12px] font-medium text-[var(--ink-muted)] uppercase tracking-wider mb-12">
            How it works
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: <Github className="h-5 w-5" />,
                title: "Paste a repo URL",
                desc: "Enter any public GitHub repository link. We fetch the metadata, README, commits, and tech stack automatically.",
              },
              {
                icon: <Sparkles className="h-5 w-5" />,
                title: "Choose your tone",
                desc: "Professional for job seekers, Hype for engagement, or Technical for developer audiences.",
              },
              {
                icon: <Zap className="h-5 w-5" />,
                title: "Get your post",
                desc: "AI generates a polished LinkedIn post under 1300 characters. Copy it and post directly.",
              },
            ].map((step, i) => (
              <div key={i} className="rounded-2xl bg-[var(--surface)] p-6 border border-[var(--edge-light)]">
                <div className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-[#1a1a1a] text-white mb-4">
                  {step.icon}
                </div>
                <h3 className="text-[15px] font-semibold tracking-[-0.01em] mb-2">
                  {step.title}
                </h3>
                <p className="text-[13px] leading-[1.6] text-[var(--ink-dim)]">
                  {step.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[var(--edge)] px-8 py-6">
        <div className="max-w-6xl mx-auto flex items-center justify-between flex-wrap gap-3">
          <span className="text-[12px] text-[var(--ink-muted)]">
            RepoPost &middot; Built by Harsh Raj &middot; Open Source
          </span>
          <div className="flex items-center gap-4">
            <a
              href="https://github.com/404harshfound"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-[12px] text-[var(--ink-muted)] hover:text-[var(--ink)] transition-colors"
            >
              <Github className="h-3.5 w-3.5" />
              GitHub
            </a>
            <a
              href="https://www.linkedin.com/in/harsh-raj19/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-[12px] text-[var(--ink-muted)] hover:text-[#0a66c2] transition-colors"
            >
              <Linkedin className="h-3.5 w-3.5" />
              LinkedIn
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
