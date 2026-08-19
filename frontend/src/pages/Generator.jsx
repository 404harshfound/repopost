import { useState, useEffect } from "react";
import { Github, ChevronDown } from "lucide-react";
import Navbar from "../components/Navbar";
import SettingsPanel from "../components/SettingsPanel";
import HistorySidebar from "../components/HistorySidebar";
import RepoInput from "../components/RepoInput";
import GeneratedPost from "../components/GeneratedPost";
import RepoSummary from "../components/RepoSummary";

const API_URL = import.meta.env.VITE_API_URL || "";
const HISTORY_KEY = "repopost_history";

function loadHistory() {
  try {
    return JSON.parse(localStorage.getItem(HISTORY_KEY) || "[]");
  } catch {
    return [];
  }
}

function saveHistory(history) {
  localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
}

function extractRepoName(url) {
  const match = url.match(/github\.com\/([^/]+\/[^/]+)/);
  return match ? match[1] : url;
}

export default function Generator({ onNavigate }) {
  const [url, setUrl] = useState("");
  const [tone, setTone] = useState("technical");
  const [model, setModel] = useState("openai/gpt-oss-120b");
  const [post, setPost] = useState("");
  const [repoData, setRepoData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeHistoryId, setActiveHistoryId] = useState(null);

  const [history, setHistory] = useState(loadHistory);

  const [githubConnected, setGithubConnected] = useState(false);
  const [githubUsername, setGithubUsername] = useState("");
  const [githubRepos, setGithubRepos] = useState([]);
  const [repoDropdownOpen, setRepoDropdownOpen] = useState(false);

  const [linkedinConnected, setLinkedinConnected] = useState(false);
  const [linkedinProfile, setLinkedinProfile] = useState(null);

  const hasContent = post || loading || error;

  useEffect(() => {
    saveHistory(history);
  }, [history]);

  const addToHistory = (repoUrl, generatedPost, generatedRepoData, usedTone, usedModel) => {
    const entry = {
      id: Date.now().toString(),
      repoUrl,
      repoName: extractRepoName(repoUrl),
      post: generatedPost,
      repoData: generatedRepoData,
      tone: usedTone,
      model: usedModel,
      createdAt: new Date().toISOString(),
    };
    setHistory((prev) => [entry, ...prev]);
    setActiveHistoryId(entry.id);
  };

  const handleSelectHistory = (item) => {
    setUrl(item.repoUrl);
    setPost(item.post);
    setRepoData(item.repoData);
    setTone(item.tone);
    if (item.model) setModel(item.model);
    setError("");
    setActiveHistoryId(item.id);
  };

  const handleDeleteHistory = (id) => {
    setHistory((prev) => prev.filter((h) => h.id !== id));
    if (activeHistoryId === id) {
      setActiveHistoryId(null);
    }
  };

  const handleNewGeneration = () => {
    setUrl("");
    setPost("");
    setRepoData(null);
    setError("");
    setActiveHistoryId(null);
  };

  const handleGithubConnected = (username, repos) => {
    setGithubUsername(username);
    setGithubRepos(repos);
    setGithubConnected(true);
  };

  const handleGithubDisconnected = () => {
    setGithubConnected(false);
    setGithubRepos([]);
    setGithubUsername("");
  };

  const handleLinkedinConnected = (profile) => {
    setLinkedinProfile(profile);
    setLinkedinConnected(true);
  };

  const handleLinkedinDisconnected = () => {
    setLinkedinConnected(false);
    setLinkedinProfile(null);
  };

  const handleSelectRepo = (repo) => {
    setUrl(repo.url);
    setRepoDropdownOpen(false);
  };

  const handleGenerate = async () => {
    setError("");
    setPost("");
    setRepoData(null);
    setLoading(true);

    const currentUrl = url;
    const currentTone = tone;
    const currentModel = model;

    try {
      const res = await fetch(`${API_URL}/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ repo_url: currentUrl, tone: currentTone, model: currentModel }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.detail || `Request failed (${res.status})`);
      }

      const data = await res.json();
      setPost(data.post);
      setRepoData(data.repo_data);
      addToHistory(currentUrl, data.post, data.repo_data, currentTone, currentModel);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const repoDropdown = githubConnected && (
    <div className="mb-5 relative">
      <button
        onClick={() => setRepoDropdownOpen(!repoDropdownOpen)}
        className="w-full rounded-xl bg-white px-4 py-3 shadow-[0_1px_3px_rgba(0,0,0,0.06)] flex items-center justify-between text-[13px] text-[#666] hover:bg-[#fafaf8] transition-colors border border-[#e8e5e1]"
      >
        <div className="flex items-center gap-2">
          <Github className="h-4 w-4" />
          <span>Select from your repos</span>
        </div>
        <ChevronDown className={`h-4 w-4 transition-transform ${repoDropdownOpen ? "rotate-180" : ""}`} />
      </button>
      {repoDropdownOpen && (
        <div className="absolute z-10 mt-1.5 w-full rounded-xl bg-white shadow-[0_4px_20px_rgba(0,0,0,0.1)] border border-[#e8e5e1] max-h-64 overflow-y-auto">
          {githubRepos.map((repo) => (
            <button
              key={repo.name}
              onClick={() => handleSelectRepo(repo)}
              className="w-full text-left px-4 py-3 hover:bg-[#f5f3f0] transition-colors border-b border-[#f0eeeb] last:border-b-0"
            >
              <div className="flex items-center justify-between">
                <span className="text-[13px] font-medium text-[#1a1a1a]">{repo.name}</span>
                {repo.stars > 0 && (
                  <span className="text-[11px] text-[#bbb]">{repo.stars} stars</span>
                )}
              </div>
              {repo.description && (
                <p className="text-[11px] text-[#999] mt-0.5 truncate">{repo.description}</p>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <div className="h-screen bg-[#f5f3f0] text-[#1a1a1a] font-[system-ui]">

      <HistorySidebar
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        history={history}
        activeId={activeHistoryId}
        onSelect={handleSelectHistory}
        onDelete={handleDeleteHistory}
        onNewGeneration={handleNewGeneration}
      />

      <SettingsPanel
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        githubConnected={githubConnected}
        githubUsername={githubUsername}
        onGithubConnected={handleGithubConnected}
        onGithubDisconnected={handleGithubDisconnected}
        linkedinConnected={linkedinConnected}
        linkedinProfile={linkedinProfile}
        onLinkedinConnected={handleLinkedinConnected}
        onLinkedinDisconnected={handleLinkedinDisconnected}
        defaultTone={tone}
        onChangeTone={setTone}
      />

      {/* Everything shifts right when sidebar open */}
      <div
        className={`h-full flex flex-col transition-all duration-200 ${
          sidebarOpen ? "ml-64" : "ml-0"
        }`}
      >
        <Navbar
          onNavigate={onNavigate}
          linkedinProfile={linkedinProfile}
          githubUsername={githubUsername}
          onOpenSettings={() => setSettingsOpen(true)}
          onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
          sidebarOpen={sidebarOpen}
        />
        {!hasContent ? (
          <div className="flex-1 flex flex-col items-center justify-center px-5">
            <div className="w-full max-w-xl">
              {repoDropdown}

              <header className="mb-6 text-center">
                <h1 className="text-[28px] font-semibold tracking-[-0.03em] text-[#1a1a1a]">
                  What repo do you want to post about?
                </h1>
                <p className="mt-2 text-[15px] text-[#999]">
                  {githubConnected ? "Select a repo or paste a URL below" : "Paste a GitHub repo URL to generate a LinkedIn post"}
                </p>
              </header>

              <RepoInput
                url={url}
                setUrl={setUrl}
                tone={tone}
                setTone={setTone}
                model={model}
                setModel={setModel}
                onGenerate={handleGenerate}
                loading={loading}
                position="center"
              />
            </div>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto">
              <div className="max-w-xl mx-auto px-5 py-8 pb-4">
                {repoDropdown}

                {loading && (
                  <div className="flex items-center justify-center py-16">
                    <div className="flex flex-col items-center gap-3">
                      <div className="h-8 w-8 rounded-full border-2 border-[#e8e5e1] border-t-[#1a1a1a] animate-spin" />
                      <p className="text-[13px] text-[#999]">Generating your post...</p>
                    </div>
                  </div>
                )}

                {error && (
                  <div className="rounded-2xl bg-white px-5 py-4 text-[13px] text-red-500 shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
                    {error}
                  </div>
                )}

                {post && (
                  <GeneratedPost
                    post={post}
                    onRegenerate={handleGenerate}
                    linkedinProfile={linkedinProfile}
                  />
                )}

                {repoData && <RepoSummary repoData={repoData} />}
              </div>
            </div>

            <div className="border-t border-[#e8e5e1] bg-[#f5f3f0]">
              <div className="max-w-xl mx-auto px-5 py-3">
                <RepoInput
                  url={url}
                  setUrl={setUrl}
                  tone={tone}
                  setTone={setTone}
                  model={model}
                  setModel={setModel}
                  onGenerate={handleGenerate}
                  loading={loading}
                  position="bottom"
                />
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
