import { useState, useEffect } from "react";
import { Github, ChevronDown } from "lucide-react";
import { supabase } from "../lib/supabase";
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

export default function Generator({ onNavigate, session }) {
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

  const user = session?.user;
  const userMeta = user?.user_metadata || {};

  // Connected-account state lives on the Supabase user's metadata, not the browser,
  // so it follows the account across devices and across whichever provider is used
  // to sign in next (accounts auto-link by email across Google/GitHub/LinkedIn).
  const [githubConnected, setGithubConnected] = useState(!!userMeta.github_username);
  const [githubUsername, setGithubUsername] = useState(userMeta.github_username || "");
  const [githubRepos, setGithubRepos] = useState([]);
  const [repoDropdownOpen, setRepoDropdownOpen] = useState(false);

  const [linkedinConnected, setLinkedinConnected] = useState(!!userMeta.linkedin_connected);
  const [linkedinProfile, setLinkedinProfile] = useState(
    userMeta.linkedin_connected
      ? {
          name: userMeta.linkedin_name || "",
          headline: userMeta.linkedin_headline || "",
          photoUrl: userMeta.linkedin_photo_url || null,
        }
      : null
  );

  // app_metadata.provider is sticky (set once at account creation) and doesn't
  // reflect which provider was used for THIS sign-in when accounts are auto-linked
  // by email. Derive it from the most recently used identity instead.
  const identities = user?.identities || [];
  const latestIdentity = identities.length
    ? [...identities].sort(
        (a, b) => new Date(b.last_sign_in_at) - new Date(a.last_sign_in_at)
      )[0]
    : null;
  const provider = latestIdentity?.provider || user?.app_metadata?.provider;

  const supabaseProfile = {
    name:
      userMeta.full_name ||
      userMeta.name ||
      user?.email?.split("@")[0] ||
      "User",
    headline: userMeta.headline || "",
    photoUrl: userMeta.avatar_url || userMeta.picture || null,
  };

  // Use LinkedIn profile for preview if connected, otherwise fall back to Supabase profile.
  // A user-set custom headline always wins over whatever the provider returned.
  const previewProfile = {
    ...(linkedinConnected && linkedinProfile ? linkedinProfile : supabaseProfile),
    ...(userMeta.headline ? { headline: userMeta.headline } : {}),
  };

  const hasContent = post || loading || error;

  // Auto-connect GitHub if signed in via GitHub, and remember it on the account
  useEffect(() => {
    if (provider === "github" && userMeta.user_name && !githubConnected) {
      setGithubUsername(userMeta.user_name);
      setGithubConnected(true);
      if (!userMeta.github_username) {
        supabase.auth.updateUser({ data: { github_username: userMeta.user_name } });
      }
    }
  }, [provider, userMeta.user_name]);

  // Auto-connect LinkedIn if signed in via LinkedIn, and remember it on the account
  useEffect(() => {
    if (provider === "linkedin_oidc" && !linkedinConnected) {
      const profile = {
        name: userMeta.full_name || userMeta.name || "",
        headline: userMeta.headline || "",
        photoUrl: userMeta.avatar_url || userMeta.picture || null,
      };
      setLinkedinProfile(profile);
      setLinkedinConnected(true);
      if (!userMeta.linkedin_connected) {
        supabase.auth.updateUser({
          data: {
            linkedin_connected: true,
            linkedin_name: profile.name,
            linkedin_headline: profile.headline,
            linkedin_photo_url: profile.photoUrl,
          },
        });
      }
    }
  }, [provider]);

  useEffect(() => {
    saveHistory(history);
  }, [history]);

  // Listen for OAuth popup messages (GitHub/LinkedIn connect from Settings)
  useEffect(() => {
    const handleMessage = (event) => {
      // Security: only accept messages from our own origin
      if (event.origin !== window.location.origin) return;

      const { data } = event;
      if (!data?.type) return;

      if (data.type === "github-auth") {
        setGithubUsername(data.username);
        setGithubRepos(data.repos || []);
        setGithubConnected(true);
        supabase.auth.updateUser({ data: { github_username: data.username } });
      } else if (data.type === "linkedin-auth") {
        const profile = {
          name: data.name,
          headline: data.headline || "",
          photoUrl: data.photoUrl || null,
        };
        setLinkedinProfile(profile);
        setLinkedinConnected(true);
        supabase.auth.updateUser({
          data: {
            linkedin_connected: true,
            linkedin_name: profile.name,
            linkedin_headline: profile.headline,
            linkedin_photo_url: profile.photoUrl,
          },
        });
      }
    };
    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, []);

  // Fetch GitHub repos when connected
  useEffect(() => {
    if (!githubUsername) return;
    if (githubRepos.length > 0) return;
    fetch(
      `https://api.github.com/users/${githubUsername}/repos?per_page=30&sort=updated`
    )
      .then((res) => res.json())
      .then((repos) => {
        if (Array.isArray(repos)) {
          setGithubRepos(
            repos.map((r) => ({
              name: r.full_name,
              url: r.html_url,
              description: r.description,
              stars: r.stargazers_count,
            }))
          );
        }
      })
      .catch(() => {});
  }, [githubUsername]);

  const addToHistory = (
    repoUrl,
    generatedPost,
    generatedRepoData,
    usedTone,
    usedModel
  ) => {
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

  const handleGithubDisconnected = () => {
    setGithubConnected(false);
    setGithubRepos([]);
    setGithubUsername("");
    supabase.auth.updateUser({ data: { github_username: null } });
  };

  const handleLinkedinDisconnected = () => {
    setLinkedinConnected(false);
    setLinkedinProfile(null);
    supabase.auth.updateUser({
      data: {
        linkedin_connected: null,
        linkedin_name: null,
        linkedin_headline: null,
        linkedin_photo_url: null,
      },
    });
  };

  const handleChangeHeadline = (newHeadline) => {
    supabase.auth.updateUser({ data: { headline: newHeadline } });
  };

  const handleSelectRepo = (repo) => {
    setUrl(repo.url);
    setRepoDropdownOpen(false);
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
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
        body: JSON.stringify({
          repo_url: currentUrl,
          tone: currentTone,
          model: currentModel,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.detail || `Request failed (${res.status})`);
      }

      const data = await res.json();
      setPost(data.post);
      setRepoData(data.repo_data);
      addToHistory(
        currentUrl,
        data.post,
        data.repo_data,
        currentTone,
        currentModel
      );
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const repoDropdown = githubConnected && githubRepos.length > 0 && (
    <div className="mb-5 relative">
      <button
        onClick={() => setRepoDropdownOpen(!repoDropdownOpen)}
        className="w-full rounded-xl bg-[var(--card)] px-4 py-3 shadow-[0_1px_3px_rgba(0,0,0,0.06)] flex items-center justify-between text-[13px] text-[var(--ink-secondary)] hover:bg-[var(--card-hover)] transition-colors border border-[var(--edge)]"
      >
        <div className="flex items-center gap-2">
          <Github className="h-4 w-4" />
          <span>Select from your repos</span>
        </div>
        <ChevronDown
          className={`h-4 w-4 transition-transform ${repoDropdownOpen ? "rotate-180" : ""}`}
        />
      </button>
      {repoDropdownOpen && (
        <div className="absolute z-10 mt-1.5 w-full rounded-xl bg-[var(--card)] shadow-[0_4px_20px_rgba(0,0,0,0.1)] border border-[var(--edge)] max-h-64 overflow-y-auto">
          {githubRepos.map((repo) => (
            <button
              key={repo.name}
              onClick={() => handleSelectRepo(repo)}
              className="w-full text-left px-4 py-3 hover:bg-[var(--surface)] transition-colors border-b border-[var(--edge-light)] last:border-b-0"
            >
              <div className="flex items-center justify-between">
                <span className="text-[13px] font-medium text-[var(--ink)]">
                  {repo.name}
                </span>
                {repo.stars > 0 && (
                  <span className="text-[11px] text-[var(--ink-muted)]">
                    {repo.stars} stars
                  </span>
                )}
              </div>
              {repo.description && (
                <p className="text-[11px] text-[var(--ink-tertiary)] mt-0.5 truncate">
                  {repo.description}
                </p>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <div className="h-screen bg-[var(--surface)] text-[var(--ink)] font-[system-ui]">
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
        user={user}
        userProfile={supabaseProfile}
        provider={provider}
        githubConnected={githubConnected}
        githubUsername={githubUsername}
        onGithubDisconnected={handleGithubDisconnected}
        linkedinConnected={linkedinConnected}
        linkedinProfile={linkedinProfile}
        onLinkedinDisconnected={handleLinkedinDisconnected}
        defaultTone={tone}
        onChangeTone={setTone}
        headline={userMeta.headline || ""}
        onChangeHeadline={handleChangeHeadline}
      />

      <div
        className={`h-full flex flex-col transition-all duration-200 ${
          sidebarOpen ? "ml-64" : "ml-0"
        }`}
      >
        <Navbar
          onNavigate={handleNewGeneration}
          linkedinProfile={previewProfile}
          linkedinConnected={linkedinConnected}
          githubUsername={githubUsername}
          onOpenSettings={() => setSettingsOpen(true)}
          onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
          sidebarOpen={sidebarOpen}
          onSignOut={handleSignOut}
        />
        {!hasContent ? (
          <div className="flex-1 flex flex-col items-center justify-center px-5 relative overflow-hidden">
            <div className="hero-glow-sm" />
            <div className="w-full max-w-xl relative z-10">
              {repoDropdown}

              <header className="mb-6 text-center">
                <h1 className="text-[28px] font-semibold tracking-[-0.03em] text-[var(--ink)]">
                  What repo do you want to post about?
                </h1>
                <p className="mt-2 text-[15px] text-[var(--ink-tertiary)]">
                  {githubConnected
                    ? "Select a repo or paste a URL below"
                    : "Paste a GitHub repo URL to generate a LinkedIn post"}
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
                      <div className="h-8 w-8 rounded-full border-2 border-[var(--edge)] border-t-[var(--ink)] animate-spin" />
                      <p className="text-[13px] text-[var(--ink-tertiary)]">
                        Generating your post...
                      </p>
                    </div>
                  </div>
                )}

                {error && (
                  <div className="rounded-2xl bg-[var(--card)] px-5 py-4 text-[13px] text-red-500 shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
                    {error}
                  </div>
                )}

                {post && (
                  <GeneratedPost
                    post={post}
                    onRegenerate={handleGenerate}
                    linkedinProfile={previewProfile}
                  />
                )}

                {repoData && <RepoSummary repoData={repoData} />}
              </div>
            </div>

            <div className="border-t border-[var(--edge)] bg-[var(--surface)]">
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
