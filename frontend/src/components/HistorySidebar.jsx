import { Plus, PanelLeftClose, Trash2, Github } from "lucide-react";

function timeAgo(dateStr) {
  const now = new Date();
  const date = new Date(dateStr);
  const diff = now - date;
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days === 1) return "Yesterday";
  if (days < 7) return `${days}d ago`;
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function groupByDate(items) {
  const groups = { Today: [], Yesterday: [], "Previous 7 days": [], Earlier: [] };
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const weekAgo = new Date(today);
  weekAgo.setDate(weekAgo.getDate() - 7);

  for (const item of items) {
    const d = new Date(item.createdAt);
    if (d >= today) groups.Today.push(item);
    else if (d >= yesterday) groups.Yesterday.push(item);
    else if (d >= weekAgo) groups["Previous 7 days"].push(item);
    else groups.Earlier.push(item);
  }
  return groups;
}

export default function HistorySidebar({ open, onClose, history, activeId, onSelect, onDelete, onNewGeneration }) {
  const groups = groupByDate(history);

  return (
    <div
      className={`fixed top-0 left-0 z-40 h-full w-64 bg-[var(--surface)] border-r border-[var(--edge)] flex flex-col transition-transform duration-200 ${
        open ? "translate-x-0" : "-translate-x-full"
      }`}
    >
      {/* Header */}
      <div className="h-14 px-3 flex items-center justify-between border-b border-[var(--edge)]">
        <div className="flex items-center gap-1">
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-[var(--ink-dim)] hover:text-[var(--ink)] hover:bg-[var(--elevated)] transition-colors"
          >
            <PanelLeftClose className="h-[18px] w-[18px]" />
          </button>
          <div className="flex items-center gap-2 ml-1">
            <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-[#1a1a1a]">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65S8.93 17.38 9 18v4" />
                <path d="M9 18c-4.51 2-5-2-7-2" />
              </svg>
            </div>
            <span className="text-[13px] font-semibold tracking-[-0.02em] text-[var(--ink)]">RepoPost</span>
          </div>
        </div>
        <button
          onClick={onNewGeneration}
          className="p-2 rounded-lg text-[var(--ink-dim)] hover:text-[var(--ink)] hover:bg-[var(--elevated)] transition-colors"
        >
          <Plus className="h-[18px] w-[18px]" />
        </button>
      </div>

      {/* History list */}
      <div className="flex-1 overflow-y-auto py-2">
        {history.length === 0 ? (
          <div className="px-4 py-8 text-center">
            <p className="text-[12px] text-[var(--ink-muted)]">No history yet</p>
            <p className="text-[11px] text-[var(--ink-faint)] mt-1">Generated posts will appear here</p>
          </div>
        ) : (
          Object.entries(groups).map(([label, items]) =>
            items.length > 0 && (
              <div key={label} className="mb-1">
                <p className="px-4 pt-3 pb-1.5 text-[10px] font-medium text-[var(--ink-tertiary)] uppercase tracking-wider">
                  {label}
                </p>
                {items.map((item) => (
                  <div
                    key={item.id}
                    className={`group relative mx-2 rounded-lg transition-colors ${
                      activeId === item.id
                        ? "bg-[var(--elevated)]"
                        : "hover:bg-[var(--elevated)]"
                    }`}
                  >
                    <button
                      onClick={() => onSelect(item)}
                      className="w-full text-left px-3 py-2.5"
                    >
                      <div className="flex items-center gap-2">
                        <Github className="h-3 w-3 text-[var(--ink-muted)] shrink-0" />
                        <span className="text-[13px] font-medium text-[var(--ink)] truncate">
                          {item.repoName}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 mt-0.5 pl-5">
                        <span className="text-[11px] text-[var(--ink-tertiary)] capitalize">{item.tone}</span>
                        <span className="text-[11px] text-[var(--ink-faint)]">&middot;</span>
                        <span className="text-[11px] text-[var(--ink-muted)]">{timeAgo(item.createdAt)}</span>
                      </div>
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); onDelete(item.id); }}
                      className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-md text-[var(--ink-faint)] hover:text-red-400 hover:bg-[var(--elevated-hover)] opacity-0 group-hover:opacity-100 transition-all"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            )
          )
        )}
      </div>
    </div>
  );
}
