import { useState } from "react";
import { ChevronRight, Star, GitFork } from "lucide-react";

export default function RepoSummary({ repoData }) {
  const [open, setOpen] = useState(false);

  const languages = repoData.languages || {};
  const total = Object.values(languages).reduce((a, b) => a + b, 0);

  const langEntries = total > 0
    ? Object.entries(languages).map(([lang, bytes]) => ({
        lang,
        pct: Math.round((bytes / total) * 100),
      })).filter((e) => e.pct > 0)
    : [];

  const commits = (repoData.recent_commits || []).slice(0, 5);

  return (
    <div className="mt-5 rounded-2xl bg-[var(--card)] shadow-[0_1px_3px_rgba(0,0,0,0.06)] border border-[var(--edge)] overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="flex w-full items-center gap-2.5 px-5 py-4 text-[13px] font-medium text-[var(--ink-dim)] hover:text-[var(--ink-secondary)] transition-colors"
      >
        <ChevronRight
          className={`h-3.5 w-3.5 transition-transform duration-200 ${open ? "rotate-90" : ""}`}
        />
        Repo Summary
      </button>

      {open && (
        <div className="border-t border-[var(--edge-light)] px-5 py-5 space-y-4">
          {repoData.name && (
            <p className="text-[15px] font-semibold text-[var(--ink)] tracking-[-0.01em]">
              {repoData.name}
            </p>
          )}

          {(repoData.stars > 0 || repoData.forks > 0) && (
            <div className="flex items-center gap-4 text-[13px] text-[var(--ink-dim)]">
              {repoData.stars > 0 && (
                <span className="flex items-center gap-1.5">
                  <Star className="h-3.5 w-3.5 text-amber-400" />
                  {repoData.stars.toLocaleString()}
                </span>
              )}
              {repoData.forks > 0 && (
                <span className="flex items-center gap-1.5">
                  <GitFork className="h-3.5 w-3.5 text-[var(--ink-faint)]" />
                  {repoData.forks.toLocaleString()}
                </span>
              )}
            </div>
          )}

          {langEntries.length > 0 && (
            <div>
              <p className="text-[11px] font-medium text-[var(--ink-muted)] uppercase tracking-wider mb-2">
                Stack
              </p>
              <div className="flex h-1.5 rounded-full overflow-hidden bg-[var(--edge-light)]">
                {langEntries.map(({ lang, pct }, i) => (
                  <div
                    key={lang}
                    style={{ width: `${pct}%` }}
                    className={LANG_COLORS[i % LANG_COLORS.length]}
                    title={`${lang} ${pct}%`}
                  />
                ))}
              </div>
              <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-[12px] text-[var(--ink-tertiary)]">
                {langEntries.map(({ lang, pct }) => (
                  <span key={lang}>{lang} {pct}%</span>
                ))}
              </div>
            </div>
          )}

          {repoData.topics && repoData.topics.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {repoData.topics.map((t) => (
                <span
                  key={t}
                  className="rounded-lg bg-[var(--surface)] px-2.5 py-1 text-[11px] font-medium text-[var(--ink-dim)]"
                >
                  {t}
                </span>
              ))}
            </div>
          )}

          {commits.length > 0 && (
            <div>
              <p className="text-[11px] font-medium text-[var(--ink-muted)] uppercase tracking-wider mb-2">
                Recent commits
              </p>
              <ul className="space-y-1.5">
                {commits.map((msg, i) => (
                  <li key={i} className="text-[12px] text-[var(--ink-tertiary)] truncate leading-relaxed">
                    {msg}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

const LANG_COLORS = [
  "bg-[#0a66c2]",
  "bg-[#888]",
  "bg-[#bbb]",
  "bg-[#d4d0cc]",
  "bg-[#999]",
  "bg-[#666]",
  "bg-[#aaa]",
  "bg-[#ccc]",
];
