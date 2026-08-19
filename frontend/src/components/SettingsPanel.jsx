import { X, Github, Linkedin, User, Palette, Bell, Mail, Sun, Moon } from "lucide-react";
import { useState } from "react";

const TONES = ["professional", "hype", "technical"];
const API_URL = import.meta.env.VITE_API_URL || "";

const PROVIDER_LABELS = {
  github: "GitHub",
  google: "Google",
  linkedin_oidc: "LinkedIn",
  email: "Email",
};

function ProviderIcon({ provider }) {
  if (provider === "github")
    return <Github className="h-4.5 w-4.5 text-[var(--ink)]" />;
  if (provider === "linkedin_oidc")
    return <Linkedin className="h-4.5 w-4.5 text-[#0a66c2]" />;
  if (provider === "google")
    return (
      <svg width="16" height="16" viewBox="0 0 18 18">
        <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 01-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4" />
        <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 009 18z" fill="#34A853" />
        <path d="M3.964 10.71A5.41 5.41 0 013.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 000 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05" />
        <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 00.957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335" />
      </svg>
    );
  return <Mail className="h-4.5 w-4.5 text-[var(--ink-tertiary)]" />;
}

export default function SettingsPanel({
  open,
  onClose,
  user,
  userProfile,
  provider,
  githubConnected,
  githubUsername,
  onGithubDisconnected,
  linkedinConnected,
  linkedinProfile,
  onLinkedinDisconnected,
  defaultTone,
  onChangeTone,
}) {
  const [toneDropdownOpen, setToneDropdownOpen] = useState(false);
  const [theme, setTheme] = useState(
    () => document.documentElement.getAttribute("data-theme") || "light"
  );

  if (!open) return null;

  const displayName = userProfile?.name || "User";
  const photoUrl = userProfile?.photoUrl;
  const email = user?.email || "";

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

  const openGithubAuth = () => {
    const w = 600, h = 700;
    const left = window.screenX + (window.outerWidth - w) / 2;
    const top = window.screenY + (window.outerHeight - h) / 2;
    window.open(
      `${API_URL}/auth/github`,
      "github-auth",
      `width=${w},height=${h},left=${left},top=${top}`
    );
  };

  const openLinkedinAuth = () => {
    const w = 600, h = 700;
    const left = window.screenX + (window.outerWidth - w) / 2;
    const top = window.screenY + (window.outerHeight - h) / 2;
    window.open(
      `${API_URL}/auth/linkedin`,
      "linkedin-auth",
      `width=${w},height=${h},left=${left},top=${top}`
    );
  };

  return (
    <div className="fixed inset-0 z-[60] flex justify-end">
      <div
        className="absolute inset-0 bg-black/20 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative w-full max-w-sm bg-[var(--card)] shadow-[-4px_0_24px_rgba(0,0,0,0.15)] border-l border-[var(--edge)] h-full overflow-y-auto">
        <div className="sticky top-0 bg-[var(--card)] z-10 px-5 py-4 border-b border-[var(--edge-light)] flex items-center justify-between">
          <h2 className="text-[16px] font-semibold text-[var(--ink)]">
            Settings
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-[var(--surface)] transition-colors text-[var(--ink-tertiary)]"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="p-5 space-y-6">
          {/* Profile */}
          <section>
            <div className="flex items-center gap-2 mb-3">
              <User className="h-4 w-4 text-[var(--ink-tertiary)]" />
              <h3 className="text-[13px] font-semibold text-[var(--ink)]">
                Profile
              </h3>
            </div>
            <div className="rounded-xl bg-[var(--surface)] p-4">
              <div className="flex items-center gap-3">
                {photoUrl ? (
                  <img
                    src={photoUrl}
                    alt=""
                    className="w-12 h-12 rounded-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#0a66c2] to-[#004182] flex items-center justify-center">
                    <span className="text-white text-[17px] font-bold">
                      {displayName[0].toUpperCase()}
                    </span>
                  </div>
                )}
                <div className="min-w-0">
                  <p className="text-[14px] font-semibold text-[var(--ink)] truncate">
                    {displayName}
                  </p>
                  {email && (
                    <p className="text-[11px] text-[var(--ink-tertiary)] truncate">
                      {email}
                    </p>
                  )}
                  <div className="flex items-center gap-1.5 mt-1">
                    <ProviderIcon provider={provider} />
                    <span className="text-[11px] text-[var(--ink-muted)]">
                      via {PROVIDER_LABELS[provider] || "Email"}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Connected Accounts */}
          <section>
            <div className="flex items-center gap-2 mb-3">
              <Linkedin className="h-4 w-4 text-[var(--ink-tertiary)]" />
              <h3 className="text-[13px] font-semibold text-[var(--ink)]">
                Connected Accounts
              </h3>
            </div>
            <div className="space-y-2.5">
              {/* GitHub */}
              <div className="rounded-xl bg-[var(--surface)] px-4 py-3.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Github className="h-5 w-5 text-[var(--ink)]" />
                    <div>
                      <p className="text-[13px] font-medium text-[var(--ink)]">
                        GitHub
                      </p>
                      <p className="text-[11px] text-[var(--ink-tertiary)]">
                        {githubConnected
                          ? `@${githubUsername}`
                          : "Import repos directly"}
                      </p>
                    </div>
                  </div>
                  {githubConnected ? (
                    <button
                      onClick={onGithubDisconnected}
                      className="text-[12px] font-medium text-red-400 hover:text-red-500 transition-colors"
                    >
                      Disconnect
                    </button>
                  ) : (
                    <button
                      onClick={openGithubAuth}
                      className="text-[12px] font-medium text-[#0a66c2] hover:text-[#004182] transition-colors"
                    >
                      Connect
                    </button>
                  )}
                </div>
              </div>

              {/* LinkedIn */}
              <div className="rounded-xl bg-[var(--surface)] px-4 py-3.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Linkedin className="h-5 w-5 text-[#0a66c2]" />
                    <div>
                      <p className="text-[13px] font-medium text-[var(--ink)]">
                        LinkedIn
                      </p>
                      <p className="text-[11px] text-[var(--ink-tertiary)]">
                        {linkedinConnected
                          ? linkedinProfile?.name
                          : "Preview with your profile"}
                      </p>
                    </div>
                  </div>
                  {linkedinConnected ? (
                    <button
                      onClick={onLinkedinDisconnected}
                      className="text-[12px] font-medium text-red-400 hover:text-red-500 transition-colors"
                    >
                      Disconnect
                    </button>
                  ) : (
                    <button
                      onClick={openLinkedinAuth}
                      className="text-[12px] font-medium text-[#0a66c2] hover:text-[#004182] transition-colors"
                    >
                      Connect
                    </button>
                  )}
                </div>
              </div>
            </div>
          </section>

          {/* Preferences */}
          <section>
            <div className="flex items-center gap-2 mb-3">
              <Palette className="h-4 w-4 text-[var(--ink-tertiary)]" />
              <h3 className="text-[13px] font-semibold text-[var(--ink)]">
                Preferences
              </h3>
            </div>
            <div className="space-y-2.5">
              {/* Theme */}
              <div className="rounded-xl bg-[var(--surface)] px-4 py-3.5 flex items-center justify-between">
                <div>
                  <p className="text-[13px] font-medium text-[var(--ink)]">
                    Theme
                  </p>
                  <p className="text-[11px] text-[var(--ink-tertiary)] capitalize">
                    {theme}
                  </p>
                </div>
                <button
                  onClick={toggleTheme}
                  className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-[12px] font-medium bg-[var(--elevated)] text-[var(--ink-secondary)] hover:bg-[var(--elevated-hover)] transition-colors"
                >
                  {theme === "light" ? (
                    <>
                      <Moon className="h-3.5 w-3.5" />
                      Dark
                    </>
                  ) : (
                    <>
                      <Sun className="h-3.5 w-3.5" />
                      Light
                    </>
                  )}
                </button>
              </div>

              {/* Tone */}
              <div className="rounded-xl bg-[var(--surface)] px-4 py-3.5 flex items-center justify-between relative">
                <div>
                  <p className="text-[13px] font-medium text-[var(--ink)]">
                    Default Tone
                  </p>
                  <p className="text-[11px] text-[var(--ink-tertiary)] capitalize">
                    {defaultTone}
                  </p>
                </div>
                <button
                  onClick={() => setToneDropdownOpen(!toneDropdownOpen)}
                  className="text-[12px] font-medium text-[#0a66c2] hover:text-[#004182] transition-colors"
                >
                  Change
                </button>
                {toneDropdownOpen && (
                  <div className="absolute right-4 top-full mt-1 w-40 rounded-xl bg-[var(--card)] shadow-[0_4px_16px_rgba(0,0,0,0.1)] border border-[var(--edge)] overflow-hidden z-10">
                    {TONES.map((t) => (
                      <button
                        key={t}
                        onClick={() => {
                          onChangeTone(t);
                          setToneDropdownOpen(false);
                        }}
                        className={`w-full text-left px-4 py-2.5 text-[13px] capitalize transition-colors ${
                          defaultTone === t
                            ? "font-semibold text-[var(--ink)] bg-[var(--surface)]"
                            : "text-[var(--ink-secondary)] hover:bg-[var(--surface)]"
                        }`}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Notifications */}
              <div className="rounded-xl bg-[var(--surface)] px-4 py-3.5 flex items-center justify-between">
                <div>
                  <p className="text-[13px] font-medium text-[var(--ink)]">
                    Notifications
                  </p>
                  <p className="text-[11px] text-[var(--ink-tertiary)]">
                    Email updates
                  </p>
                </div>
                <Bell className="h-4 w-4 text-[var(--ink-muted)]" />
              </div>
            </div>
          </section>

          {/* About */}
          <section>
            <div className="rounded-xl bg-[var(--surface)] px-4 py-3.5">
              <p className="text-[13px] font-medium text-[var(--ink)]">
                RepoPost
              </p>
              <p className="text-[11px] text-[var(--ink-tertiary)] mt-0.5">
                v1.0.0 &middot; Built with Groq &middot; Open Source
              </p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
