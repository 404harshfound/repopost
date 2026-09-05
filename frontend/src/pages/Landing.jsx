import { useState } from "react";
import { ArrowRight, Github, Sparkles, Zap, Sun, Moon, ExternalLink, Linkedin } from "lucide-react";

function DecorativeNodes() {
  return (
    <svg className="absolute inset-0 w-full h-full hero-grid-nodes" style={{ zIndex: 0 }} viewBox="0 0 1200 700" fill="none" preserveAspectRatio="xMidYMid slice">
      {/* Thin connecting lines */}
      <line x1="150" y1="180" x2="350" y2="280" stroke="rgba(255,255,255,0.06)" strokeWidth="0.5" />
      <line x1="350" y1="280" x2="600" y2="200" stroke="rgba(255,255,255,0.04)" strokeWidth="0.5" />
      <line x1="600" y1="200" x2="900" y2="300" stroke="rgba(255,255,255,0.05)" strokeWidth="0.5" />
      <line x1="900" y1="300" x2="1050" y2="180" stroke="rgba(255,255,255,0.04)" strokeWidth="0.5" />
      <line x1="150" y1="480" x2="400" y2="400" stroke="rgba(255,255,255,0.04)" strokeWidth="0.5" />
      <line x1="850" y1="500" x2="1050" y2="420" stroke="rgba(255,255,255,0.05)" strokeWidth="0.5" />

      {/* Curved paths */}
      <path d="M200 300 Q400 200 600 350" stroke="rgba(255,255,255,0.03)" strokeWidth="0.5" fill="none" />
      <path d="M700 250 Q850 350 1000 280" stroke="rgba(255,255,255,0.03)" strokeWidth="0.5" fill="none" />

      {/* Node dots */}
      <circle cx="150" cy="180" r="3" fill="rgba(255,255,255,0.08)" />
      <circle cx="150" cy="180" r="1.5" fill="rgba(255,255,255,0.15)" />

      <circle cx="350" cy="280" r="2.5" fill="rgba(255,255,255,0.06)" />
      <circle cx="350" cy="280" r="1" fill="rgba(255,255,255,0.12)" />

      <circle cx="900" cy="300" r="3" fill="rgba(255,255,255,0.07)" />
      <circle cx="900" cy="300" r="1.5" fill="rgba(255,255,255,0.14)" />

      <circle cx="1050" cy="180" r="2.5" fill="rgba(255,255,255,0.06)" />
      <circle cx="1050" cy="180" r="1" fill="rgba(255,255,255,0.12)" />

      <circle cx="150" cy="480" r="2" fill="rgba(255,255,255,0.05)" />
      <circle cx="850" cy="500" r="2.5" fill="rgba(255,255,255,0.06)" />
      <circle cx="1050" cy="420" r="2" fill="rgba(255,255,255,0.05)" />

      {/* Small labels near nodes */}
      <text x="165" y="175" fill="rgba(255,255,255,0.12)" fontSize="9" fontFamily="system-ui">Fetch</text>
      <text x="155" y="192" fill="rgba(255,255,255,0.07)" fontSize="7" fontFamily="system-ui">metadata</text>

      <text x="910" y="295" fill="rgba(255,255,255,0.12)" fontSize="9" fontFamily="system-ui">Generate</text>
      <text x="910" y="312" fill="rgba(255,255,255,0.07)" fontSize="7" fontFamily="system-ui">post</text>

      <text x="1060" y="175" fill="rgba(255,255,255,0.12)" fontSize="9" fontFamily="system-ui">Share</text>
      <text x="1060" y="192" fill="rgba(255,255,255,0.07)" fontSize="7" fontFamily="system-ui">LinkedIn</text>

      <text x="155" y="495" fill="rgba(255,255,255,0.10)" fontSize="8" fontFamily="system-ui">README</text>
      <text x="855" y="515" fill="rgba(255,255,255,0.10)" fontSize="8" fontFamily="system-ui">Commits</text>
    </svg>
  );
}

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
      <nav className="relative z-20 flex items-center justify-between px-5 sm:px-8 py-5">
        <div className="flex items-center gap-2.5 sm:gap-3">
          <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-[#1a1a1a] shrink-0">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65S8.93 17.38 9 18v4" />
              <path d="M9 18c-4.51 2-5-2-7-2" />
            </svg>
          </div>
          <span className="text-[15px] font-semibold tracking-[-0.02em]">RepoPost</span>
        </div>
        <div className="flex items-center gap-2 sm:gap-4">
          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg text-[var(--ink-dim)] hover:text-[var(--ink)] hover:bg-[var(--elevated)] transition-colors"
            title={theme === "light" ? "Switch to dark mode" : "Switch to light mode"}
            aria-label={theme === "light" ? "Switch to dark mode" : "Switch to light mode"}
          >
            {theme === "light" ? <Moon className="h-[18px] w-[18px]" /> : <Sun className="h-[18px] w-[18px]" />}
          </button>
          <button
            onClick={() => onNavigate("auth")}
            className="hidden sm:inline text-[13px] text-[var(--ink-dim)] hover:text-[var(--ink)] transition-colors"
          >
            Sign In
          </button>
          <button
            onClick={() => onNavigate("auth")}
            className="rounded-xl bg-[var(--btn)] px-4 sm:px-5 py-2 text-[13px] font-medium text-[var(--btn-text)] hover:bg-[var(--btn-hover)] transition-colors whitespace-nowrap"
          >
            <span className="sm:hidden">Sign In</span>
            <span className="hidden sm:inline">Get Started</span>
          </button>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative overflow-hidden">
        {/* Atmospheric glow + decorative nodes */}
        <div className="hero-glow" />
        <DecorativeNodes />

        <div className="relative z-10 max-w-6xl mx-auto px-5 sm:px-8 pt-16 sm:pt-24 pb-20 sm:pb-32">
          <div className="max-w-2xl mx-auto text-center">
            <h1 className="text-[clamp(2rem,6vw,3.25rem)] font-semibold leading-[1.1] tracking-[-0.03em] sm:tracking-[-0.035em] text-[var(--ink)]">
              Turn repos into
              <br />
              LinkedIn posts
            </h1>

            <p className="mt-4 sm:mt-5 text-[clamp(0.875rem,2.5vw,1.0625rem)] leading-[1.6] text-[var(--ink-dim)] max-w-md mx-auto px-2">
              Paste any public GitHub repository and get a polished,
              ready-to-post LinkedIn post in seconds.
            </p>

            <div className="mt-8 sm:mt-10 flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                onClick={() => onNavigate("auth")}
                className="w-full sm:w-auto rounded-2xl bg-[var(--btn)] px-7 py-3.5 text-[14px] font-medium text-[var(--btn-text)] hover:bg-[var(--btn-hover)] transition-colors shadow-[0_2px_8px_rgba(0,0,0,0.15)] flex items-center justify-center gap-2"
              >
                Get Started
                <ArrowRight className="h-4 w-4" />
              </button>
              <a
                href="https://github.com/404harshfound"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto rounded-2xl border border-[var(--edge-muted)] bg-[var(--card)] px-7 py-3.5 text-[14px] font-medium text-[var(--ink)] hover:bg-[var(--card-hover)] transition-colors flex items-center justify-center gap-2"
              >
                <Github className="h-4 w-4" />
                GitHub
              </a>
            </div>
          </div>

          {/* Preview card */}
          <div className="mt-16 sm:mt-24 rounded-3xl bg-[var(--card)] p-6 sm:p-8 shadow-[0_2px_20px_rgba(0,0,0,0.08)] border border-[var(--edge)] max-w-lg mx-auto backdrop-blur-sm">
            <div className="rounded-2xl bg-[var(--surface)] p-6 border border-[var(--edge-light)]">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-2.5 h-2.5 rounded-full bg-current opacity-20" />
                <div className="w-2.5 h-2.5 rounded-full bg-current opacity-20" />
                <div className="w-2.5 h-2.5 rounded-full bg-current opacity-20" />
              </div>
              <div className="space-y-2.5">
                <div className="h-3 rounded-full bg-current opacity-[0.15] w-3/4" />
                <div className="h-3 rounded-full bg-current opacity-[0.15] w-full" />
                <div className="h-3 rounded-full bg-current opacity-[0.15] w-5/6" />
                <div className="h-3 rounded-full bg-current opacity-[0.15] w-2/3" />
              </div>
            </div>
            <p className="mt-5 text-center text-[13px] text-[var(--ink-muted)]">
              AI-generated LinkedIn posts from your code
            </p>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="relative border-t border-[var(--edge)] bg-[var(--card)]">
        <div className="max-w-6xl mx-auto px-5 sm:px-8 py-16 sm:py-24">
          <p className="text-center text-[12px] font-medium text-[var(--ink-muted)] uppercase tracking-wider mb-10 sm:mb-12">
            How it works
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
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
      <footer className="border-t border-[var(--edge)] px-5 sm:px-8 py-6">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between flex-wrap gap-3 text-center sm:text-left">
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
