import { ArrowRight, Github, Sparkles, Zap } from "lucide-react";

export default function Landing({ onNavigate }) {
  return (
    <div className="min-h-screen bg-[#f5f3f0] text-[#1a1a1a] font-[system-ui]">

      <nav className="flex items-center justify-between px-8 py-5">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-[#1a1a1a]">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65S8.93 17.38 9 18v4" />
              <path d="M9 18c-4.51 2-5-2-7-2" />
            </svg>
          </div>
          <span className="text-[15px] font-semibold tracking-[-0.02em]">RepoPost</span>
        </div>
        <div className="flex items-center gap-6">
          <button
            onClick={() => onNavigate("auth")}
            className="text-[13px] text-[#888] hover:text-[#1a1a1a] transition-colors"
          >
            Sign In
          </button>
          <button
            onClick={() => onNavigate("auth")}
            className="rounded-xl bg-[#1a1a1a] px-5 py-2 text-[13px] font-medium text-white hover:bg-[#333] transition-colors"
          >
            Get Started
          </button>
        </div>
      </nav>

      <section className="max-w-6xl mx-auto px-8 pt-24 pb-32">
        <div className="max-w-2xl mx-auto text-center">
          <h1 className="text-[52px] font-semibold leading-[1.08] tracking-[-0.035em] text-[#1a1a1a]">
            Turn repos into
            <br />
            LinkedIn posts
          </h1>

          <p className="mt-5 text-[17px] leading-[1.6] text-[#888] max-w-md mx-auto">
            Paste any public GitHub repository and get a polished,
            ready-to-post LinkedIn post in seconds.
          </p>

          <div className="mt-10 flex items-center justify-center gap-3">
            <button
              onClick={() => onNavigate("auth")}
              className="rounded-2xl bg-[#1a1a1a] px-7 py-3.5 text-[14px] font-medium text-white hover:bg-[#333] transition-colors shadow-[0_2px_8px_rgba(0,0,0,0.15)] flex items-center gap-2"
            >
              Get Started
              <ArrowRight className="h-4 w-4" />
            </button>
            <a
              href="https://github.com/404harshfound"
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-2xl border border-[#e0ddd9] bg-white px-7 py-3.5 text-[14px] font-medium text-[#1a1a1a] hover:bg-[#f5f3f0] transition-colors flex items-center gap-2"
            >
              <Github className="h-4 w-4" />
              GitHub
            </a>
          </div>
        </div>

        <div className="mt-24 rounded-3xl bg-white p-8 shadow-[0_2px_12px_rgba(0,0,0,0.06)] max-w-lg mx-auto">
          <div className="rounded-2xl bg-[#f5f3f0] p-6">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-2.5 h-2.5 rounded-full bg-[#ddd]" />
              <div className="w-2.5 h-2.5 rounded-full bg-[#ddd]" />
              <div className="w-2.5 h-2.5 rounded-full bg-[#ddd]" />
            </div>
            <div className="space-y-2.5">
              <div className="h-3 rounded-full bg-[#e0ddd9] w-3/4" />
              <div className="h-3 rounded-full bg-[#e0ddd9] w-full" />
              <div className="h-3 rounded-full bg-[#e0ddd9] w-5/6" />
              <div className="h-3 rounded-full bg-[#e0ddd9] w-2/3" />
            </div>
          </div>
          <p className="mt-5 text-center text-[13px] text-[#bbb]">
            AI-generated LinkedIn posts from your code
          </p>
        </div>
      </section>

      <section className="border-t border-[#e8e5e1] bg-white">
        <div className="max-w-6xl mx-auto px-8 py-24">
          <p className="text-center text-[12px] font-medium text-[#bbb] uppercase tracking-wider mb-12">
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
              <div key={i} className="rounded-2xl bg-[#f5f3f0] p-6">
                <div className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-[#1a1a1a] text-white mb-4">
                  {step.icon}
                </div>
                <h3 className="text-[15px] font-semibold tracking-[-0.01em] mb-2">
                  {step.title}
                </h3>
                <p className="text-[13px] leading-[1.6] text-[#888]">
                  {step.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <footer className="border-t border-[#e8e5e1] px-8 py-6">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <span className="text-[12px] text-[#bbb]">
            RepoPost &middot; Built with Groq
          </span>
          <span className="text-[12px] text-[#bbb]">
            Open Source
          </span>
        </div>
      </footer>
    </div>
  );
}
