import { useState, Fragment } from "react";
import { Copy, Check, RefreshCw, Globe, MoreHorizontal, X, ThumbsUp, MessageCircle, Repeat2, Send, ExternalLink } from "lucide-react";

function renderFormattedText(text) {
  const lines = text.split("\n");
  return lines.map((line, li) => (
    <Fragment key={li}>
      {li > 0 && "\n"}
      {renderInline(line)}
    </Fragment>
  ));
}

function renderInline(text) {
  const parts = [];
  const regex = /(\*\*(.+?)\*\*|\*(.+?)\*|`(.+?)`)/g;
  let last = 0;
  let match;

  while ((match = regex.exec(text)) !== null) {
    if (match.index > last) {
      parts.push(text.slice(last, match.index));
    }
    if (match[2]) {
      parts.push(<strong key={match.index} className="font-semibold">{match[2]}</strong>);
    } else if (match[3]) {
      parts.push(<em key={match.index}>{match[3]}</em>);
    } else if (match[4]) {
      parts.push(<code key={match.index} className="bg-[var(--surface)] px-1 py-0.5 rounded text-[13px]">{match[4]}</code>);
    }
    last = match.index + match[0].length;
  }

  if (last < text.length) {
    parts.push(text.slice(last));
  }

  return parts;
}

export default function GeneratedPost({ post, onRegenerate, linkedinProfile }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(post);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePostToLinkedIn = () => {
    const text = encodeURIComponent(post);
    window.open(`https://www.linkedin.com/feed/?shareActive=true&text=${text}`, "_blank");
  };

  const charCount = post.length;
  const isOverLimit = charCount > 1300;

  return (
    <div className="mt-8">
      <p className="text-[12px] font-medium text-[var(--ink-tertiary)] tracking-wide uppercase mb-3 px-1">
        Preview
      </p>

      {/* LinkedIn Post Card */}
      <div className="rounded-2xl bg-[var(--card)] shadow-[0_1px_3px_rgba(0,0,0,0.06)] overflow-hidden border border-[var(--edge)]">

        {/* Header */}
        <div className="px-4 pt-4 pb-2 flex items-start justify-between">
          <div className="flex items-start gap-2.5">
            {linkedinProfile?.photoUrl ? (
              <img
                src={linkedinProfile.photoUrl}
                alt={linkedinProfile.name}
                className="w-12 h-12 rounded-full object-cover shrink-0 ring-2 ring-[var(--card)]"
                referrerPolicy="no-referrer"
              />
            ) : (
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#0a66c2] to-[#004182] flex items-center justify-center shrink-0 ring-2 ring-[var(--card)]">
                <span className="text-white text-[17px] font-bold">
                  {(linkedinProfile?.name || "Y")[0].toUpperCase()}
                </span>
              </div>
            )}
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="text-[14px] font-semibold text-[var(--ink)] leading-tight hover:text-[#0a66c2] hover:underline cursor-pointer">
                  {linkedinProfile?.name || "Your Name"}
                </span>
                <svg width="16" height="16" viewBox="0 0 16 16" className="shrink-0">
                  <rect width="16" height="16" rx="2" fill="#0a66c2"/>
                  <text x="4" y="12" fontSize="10" fontWeight="bold" fill="white" fontFamily="system-ui">in</text>
                </svg>
                <span className="text-[12px] text-[var(--ink-secondary)]">&middot;</span>
                <span className="text-[12px] font-medium text-[var(--ink-secondary)]">Following</span>
              </div>
              <p className="text-[12px] text-[var(--ink-secondary)] leading-snug mt-0.5 line-clamp-1">
                {linkedinProfile?.headline || "Software Developer"}
              </p>
              <div className="flex items-center gap-1 mt-0.5">
                <span className="text-[12px] text-[var(--ink-tertiary)]">Just now</span>
                <span className="text-[12px] text-[var(--ink-tertiary)]">&middot;</span>
                <Globe className="h-3 w-3 text-[var(--ink-tertiary)]" />
              </div>
            </div>
          </div>
          <div className="flex items-center gap-1 shrink-0 ml-2">
            <button className="p-1.5 rounded-full hover:bg-[var(--surface)] transition-colors">
              <MoreHorizontal className="h-5 w-5 text-[var(--ink-secondary)]" />
            </button>
            <button className="p-1.5 rounded-full hover:bg-[var(--surface)] transition-colors">
              <X className="h-5 w-5 text-[var(--ink-secondary)]" />
            </button>
          </div>
        </div>

        {/* Post Content */}
        <div className="px-4 pb-3">
          <p className="whitespace-pre-wrap text-[14px] leading-[1.5] text-[var(--ink)]">
            {renderFormattedText(post)}
          </p>
        </div>

        {/* Reactions Row */}
        <div className="px-4 pb-2 flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <div className="flex -space-x-0.5">
              <span className="w-[18px] h-[18px] rounded-full bg-[#0a66c2] flex items-center justify-center text-[10px] ring-1 ring-[var(--card)]">👍</span>
              <span className="w-[18px] h-[18px] rounded-full bg-[#df704d] flex items-center justify-center text-[10px] ring-1 ring-[var(--card)]">❤️</span>
              <span className="w-[18px] h-[18px] rounded-full bg-[#7fc15e] flex items-center justify-center text-[10px] ring-1 ring-[var(--card)]">👏</span>
            </div>
            <span className="text-[12px] text-[var(--ink-secondary)]">325</span>
          </div>
          <div className="flex items-center gap-3 text-[12px] text-[var(--ink-secondary)]">
            <span>4 comments</span>
            <span>1 repost</span>
          </div>
        </div>

        {/* Divider */}
        <div className="mx-4 border-t border-[var(--edge)]" />

        {/* Action Bar */}
        <div className="px-2 py-1 flex items-center justify-between">
          {[
            { icon: <ThumbsUp className="h-[18px] w-[18px]" strokeWidth={1.5} />, label: "Like" },
            { icon: <MessageCircle className="h-[18px] w-[18px]" strokeWidth={1.5} />, label: "Comment" },
            { icon: <Repeat2 className="h-[18px] w-[18px]" strokeWidth={1.5} />, label: "Repost" },
            { icon: <Send className="h-[18px] w-[18px]" strokeWidth={1.5} />, label: "Send" },
          ].map(({ icon, label }) => (
            <button
              key={label}
              className="flex-1 flex items-center justify-center gap-1.5 rounded-lg py-3 text-[12px] font-semibold text-[var(--ink-secondary)] hover:bg-[var(--surface)] transition-colors"
            >
              {icon}
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Controls below card */}
      <div className="mt-4 flex items-center justify-between px-1">
        <span className="text-[12px] tabular-nums text-[var(--ink-muted)]">
          {charCount} chars{isOverLimit && <span className="text-amber-500 ml-1">&middot; may be truncated on LinkedIn</span>}
        </span>
        <div className="flex gap-1.5">
          <button
            onClick={handleCopy}
            className="inline-flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-[12px] font-medium transition-all duration-200 bg-[var(--card)] text-[var(--ink-secondary)] hover:bg-[var(--elevated)] shadow-[0_1px_3px_rgba(0,0,0,0.06)]"
          >
            {copied ? (
              <>
                <Check className="h-3.5 w-3.5 text-emerald-500" />
                Copied
              </>
            ) : (
              <>
                <Copy className="h-3.5 w-3.5" />
                Copy
              </>
            )}
          </button>
          <button
            onClick={onRegenerate}
            className="inline-flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-[12px] font-medium transition-all duration-200 bg-[var(--card)] text-[var(--ink-secondary)] hover:bg-[var(--elevated)] shadow-[0_1px_3px_rgba(0,0,0,0.06)]"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            Regenerate
          </button>
        </div>
      </div>

      {/* Post to LinkedIn Button */}
      <button
        onClick={handlePostToLinkedIn}
        className="mt-4 w-full rounded-2xl bg-[#0a66c2] py-3.5 text-[14px] font-semibold text-white hover:bg-[#004182] transition-colors shadow-[0_2px_8px_rgba(10,102,194,0.3)] flex items-center justify-center gap-2"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="white">
          <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
        </svg>
        Post to LinkedIn
        <ExternalLink className="h-3.5 w-3.5 opacity-70" />
      </button>
    </div>
  );
}
