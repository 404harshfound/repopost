import { useState, useRef, useEffect } from "react";
import { Loader2, ChevronDown, Check, Sparkles } from "lucide-react";

const TONES = ["professional", "hype", "technical"];

const MODELS = [
  { id: "openai/gpt-oss-120b", label: "GPT-OSS 120B", desc: "Most capable" },
  { id: "qwen/qwen3.6-27b", label: "Qwen 3.6 27B", desc: "Fast & efficient" },
  { id: "openai/gpt-oss-20b", label: "GPT-OSS 20B", desc: "Lightweight" },
  { id: "groq/compound", label: "Compound", desc: "Multi-step reasoning" },
];

export default function RepoInput({ url, setUrl, tone, setTone, model, setModel, onGenerate, loading, position = "center" }) {
  const isValid = url.includes("github.com/");
  const [popoverOpen, setPopoverOpen] = useState(false);
  const [toneSubOpen, setToneSubOpen] = useState(false);
  const [modelSubOpen, setModelSubOpen] = useState(false);
  const popoverRef = useRef(null);

  const currentModel = MODELS.find((m) => m.id === model) || MODELS[0];

  useEffect(() => {
    const handleClick = (e) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target)) {
        setPopoverOpen(false);
        setToneSubOpen(false);
        setModelSubOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const closeAll = () => {
    setPopoverOpen(false);
    setToneSubOpen(false);
    setModelSubOpen(false);
  };

  const popoverPosition = position === "bottom"
    ? "bottom-full mb-2"
    : "top-full mt-2";

  return (
    <div className="space-y-5">
      <div className="rounded-2xl bg-white shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
        <input
          type="text"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && isValid && !loading && onGenerate()}
          placeholder="https://github.com/owner/repo"
          className="w-full bg-transparent px-4 pt-4 pb-2 text-[14px] text-[#1a1a1a] placeholder-[#bbb] outline-none tracking-[-0.01em]"
        />

        {/* Bottom bar */}
        <div className="px-3 pb-2.5 flex items-center justify-between" ref={popoverRef}>
          <div className="relative">
            <button
              onClick={() => { setPopoverOpen(!popoverOpen); setToneSubOpen(false); setModelSubOpen(false); }}
              className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-[12px] font-medium text-[#888] hover:text-[#555] hover:bg-[#f5f3f0] transition-colors"
            >
              <Sparkles className="h-3 w-3" />
              {currentModel.label}
              <span className="text-[#ccc]">&middot;</span>
              <span className="capitalize">{tone}</span>
              <ChevronDown className={`h-3 w-3 transition-transform ${popoverOpen ? "rotate-180" : ""}`} />
            </button>

            {/* Popover */}
            {popoverOpen && (
              <div className={`absolute left-0 ${popoverPosition} w-56 rounded-xl bg-white shadow-[0_4px_24px_rgba(0,0,0,0.12)] border border-[#e8e5e1] z-20`}>

                {/* Current Model */}
                <button
                  onClick={() => { setModelSubOpen(!modelSubOpen); setToneSubOpen(false); }}
                  className="w-full flex items-center justify-between px-4 py-3 hover:bg-[#f5f3f0] transition-colors rounded-t-xl"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-[13px] font-medium text-[#1a1a1a]">{currentModel.label}</span>
                    <Check className="h-3.5 w-3.5 text-[#0a66c2]" />
                  </div>
                </button>

                <div className="border-t border-[#f0eeeb]" />

                {/* Tone */}
                <button
                  onClick={() => { setToneSubOpen(!toneSubOpen); setModelSubOpen(false); }}
                  className="w-full flex items-center justify-between px-4 py-3 hover:bg-[#f5f3f0] transition-colors"
                >
                  <span className="text-[13px] text-[#1a1a1a]">Tone</span>
                  <div className="flex items-center gap-2">
                    <span className="text-[12px] text-[#999] capitalize">{tone}</span>
                    <ChevronDown className={`h-3 w-3 text-[#999] transition-transform ${toneSubOpen ? "rotate-180" : ""}`} />
                  </div>
                </button>

                {/* Tone sub-menu */}
                {toneSubOpen && (
                  <div className="border-t border-[#f0eeeb]">
                    {TONES.map((t) => (
                      <button
                        key={t}
                        onClick={() => { setTone(t); closeAll(); }}
                        className="w-full flex items-center justify-between px-6 py-2.5 text-[13px] capitalize hover:bg-[#f5f3f0] transition-colors"
                      >
                        <span className={tone === t ? "font-semibold text-[#1a1a1a]" : "text-[#666]"}>{t}</span>
                        {tone === t && <Check className="h-3.5 w-3.5 text-[#0a66c2]" />}
                      </button>
                    ))}
                  </div>
                )}

                <div className="border-t border-[#f0eeeb]" />

                {/* More models */}
                <button
                  onClick={() => { setModelSubOpen(!modelSubOpen); setToneSubOpen(false); }}
                  className="w-full flex items-center justify-between px-4 py-3 hover:bg-[#f5f3f0] transition-colors"
                >
                  <span className="text-[13px] text-[#1a1a1a]">More models</span>
                  <ChevronDown className={`h-3 w-3 text-[#999] transition-transform ${modelSubOpen ? "rotate-180" : ""}`} />
                </button>

                {/* Models sub-menu */}
                {modelSubOpen && (
                  <div className="border-t border-[#f0eeeb]">
                    {MODELS.map((m) => (
                      <button
                        key={m.id}
                        onClick={() => { setModel(m.id); closeAll(); }}
                        className="w-full flex items-center justify-between px-6 py-2.5 hover:bg-[#f5f3f0] transition-colors last:rounded-b-xl"
                      >
                        <div>
                          <span className={`text-[13px] ${model === m.id ? "font-semibold text-[#1a1a1a]" : "text-[#666]"}`}>{m.label}</span>
                          <p className="text-[10px] text-[#bbb]">{m.desc}</p>
                        </div>
                        {model === m.id && <Check className="h-3.5 w-3.5 text-[#0a66c2]" />}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Generate button inline */}
          <button
            onClick={onGenerate}
            disabled={!isValid || loading}
            className="rounded-xl bg-[#1a1a1a] px-5 py-2 text-[12px] font-medium text-white transition-colors hover:bg-[#333] disabled:opacity-30 disabled:cursor-not-allowed flex items-center gap-1.5"
          >
            {loading ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                Generating...
              </>
            ) : (
              "Generate"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
