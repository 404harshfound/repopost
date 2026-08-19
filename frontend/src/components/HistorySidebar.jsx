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
      className={`fixed top-0 left-0 z-40 h-full w-64 bg-[#f5f3f0] border-r border-[#e8e5e1] flex flex-col transition-transform duration-200 ${
        open ? "translate-x-0" : "-translate-x-full"
      }`}
    >
      {/* Header */}
      <div className="h-14 px-3 flex items-center justify-between border-b border-[#e8e5e1]">
        <button
          onClick={onClose}
          className="p-2 rounded-lg text-[#888] hover:text-[#1a1a1a] hover:bg-[#ebe8e4] transition-colors"
        >
          <PanelLeftClose className="h-[18px] w-[18px]" />
        </button>
        <button
          onClick={onNewGeneration}
          className="p-2 rounded-lg text-[#888] hover:text-[#1a1a1a] hover:bg-[#ebe8e4] transition-colors"
        >
          <Plus className="h-[18px] w-[18px]" />
        </button>
      </div>

      {/* History list */}
      <div className="flex-1 overflow-y-auto py-2">
        {history.length === 0 ? (
          <div className="px-4 py-8 text-center">
            <p className="text-[12px] text-[#bbb]">No history yet</p>
            <p className="text-[11px] text-[#ccc] mt-1">Generated posts will appear here</p>
          </div>
        ) : (
          Object.entries(groups).map(([label, items]) =>
            items.length > 0 && (
              <div key={label} className="mb-1">
                <p className="px-4 pt-3 pb-1.5 text-[10px] font-medium text-[#aaa] uppercase tracking-wider">
                  {label}
                </p>
                {items.map((item) => (
                  <div
                    key={item.id}
                    className={`group relative mx-2 rounded-lg transition-colors ${
                      activeId === item.id
                        ? "bg-[#ebe8e4]"
                        : "hover:bg-[#ebe8e4]"
                    }`}
                  >
                    <button
                      onClick={() => onSelect(item)}
                      className="w-full text-left px-3 py-2.5"
                    >
                      <div className="flex items-center gap-2">
                        <Github className="h-3 w-3 text-[#bbb] shrink-0" />
                        <span className="text-[13px] font-medium text-[#1a1a1a] truncate">
                          {item.repoName}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 mt-0.5 pl-5">
                        <span className="text-[11px] text-[#999] capitalize">{item.tone}</span>
                        <span className="text-[11px] text-[#ccc]">&middot;</span>
                        <span className="text-[11px] text-[#bbb]">{timeAgo(item.createdAt)}</span>
                      </div>
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); onDelete(item.id); }}
                      className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-md text-[#ccc] hover:text-red-400 hover:bg-[#e5e2de] opacity-0 group-hover:opacity-100 transition-all"
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
