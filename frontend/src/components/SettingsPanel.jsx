import { X, Github, Linkedin, User, Palette, Bell } from "lucide-react";
import { useState } from "react";

const TONES = ["professional", "hype", "technical"];
const API_URL = import.meta.env.VITE_API_URL || "";

export default function SettingsPanel({
  open,
  onClose,
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

  if (!open) return null;

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
      <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-sm bg-white shadow-[-4px_0_24px_rgba(0,0,0,0.08)] h-full overflow-y-auto">

        <div className="sticky top-0 bg-white z-10 px-5 py-4 border-b border-[#f0eeeb] flex items-center justify-between">
          <h2 className="text-[16px] font-semibold text-[#1a1a1a]">Settings</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-[#f5f3f0] transition-colors text-[#999]">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="p-5 space-y-6">

          {/* Profile */}
          <section>
            <div className="flex items-center gap-2 mb-3">
              <User className="h-4 w-4 text-[#999]" />
              <h3 className="text-[13px] font-semibold text-[#1a1a1a]">Profile</h3>
            </div>
            <div className="rounded-xl bg-[#f5f3f0] p-4 space-y-3">
              <div className="flex items-center gap-3">
                {linkedinProfile?.photoUrl ? (
                  <img src={linkedinProfile.photoUrl} alt="" className="w-12 h-12 rounded-full object-cover" />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#0a66c2] to-[#004182] flex items-center justify-center">
                    <span className="text-white text-[17px] font-bold">
                      {(linkedinProfile?.name || "U")[0].toUpperCase()}
                    </span>
                  </div>
                )}
                <div>
                  <p className="text-[14px] font-semibold text-[#1a1a1a]">
                    {linkedinProfile?.name || "User"}
                  </p>
                  <p className="text-[12px] text-[#888]">
                    {linkedinProfile?.headline || "Software Developer"}
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Connected Accounts */}
          <section>
            <div className="flex items-center gap-2 mb-3">
              <Linkedin className="h-4 w-4 text-[#999]" />
              <h3 className="text-[13px] font-semibold text-[#1a1a1a]">Connected Accounts</h3>
            </div>
            <div className="space-y-2.5">

              {/* GitHub */}
              <div className="rounded-xl bg-[#f5f3f0] px-4 py-3.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Github className="h-5 w-5 text-[#1a1a1a]" />
                    <div>
                      <p className="text-[13px] font-medium text-[#1a1a1a]">GitHub</p>
                      <p className="text-[11px] text-[#999]">
                        {githubConnected ? `@${githubUsername}` : "Import repos directly"}
                      </p>
                    </div>
                  </div>
                  {githubConnected ? (
                    <button onClick={onGithubDisconnected} className="text-[12px] font-medium text-red-400 hover:text-red-500 transition-colors">
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
              <div className="rounded-xl bg-[#f5f3f0] px-4 py-3.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Linkedin className="h-5 w-5 text-[#0a66c2]" />
                    <div>
                      <p className="text-[13px] font-medium text-[#1a1a1a]">LinkedIn</p>
                      <p className="text-[11px] text-[#999]">
                        {linkedinConnected ? linkedinProfile?.name : "Preview with your profile"}
                      </p>
                    </div>
                  </div>
                  {linkedinConnected ? (
                    <button onClick={onLinkedinDisconnected} className="text-[12px] font-medium text-red-400 hover:text-red-500 transition-colors">
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
              <Palette className="h-4 w-4 text-[#999]" />
              <h3 className="text-[13px] font-semibold text-[#1a1a1a]">Preferences</h3>
            </div>
            <div className="space-y-2.5">
              <div className="rounded-xl bg-[#f5f3f0] px-4 py-3.5 flex items-center justify-between relative">
                <div>
                  <p className="text-[13px] font-medium text-[#1a1a1a]">Default Tone</p>
                  <p className="text-[11px] text-[#999] capitalize">{defaultTone}</p>
                </div>
                <button
                  onClick={() => setToneDropdownOpen(!toneDropdownOpen)}
                  className="text-[12px] font-medium text-[#0a66c2] hover:text-[#004182] transition-colors"
                >
                  Change
                </button>
                {toneDropdownOpen && (
                  <div className="absolute right-4 top-full mt-1 w-40 rounded-xl bg-white shadow-[0_4px_16px_rgba(0,0,0,0.1)] border border-[#e8e5e1] overflow-hidden z-10">
                    {TONES.map((t) => (
                      <button
                        key={t}
                        onClick={() => { onChangeTone(t); setToneDropdownOpen(false); }}
                        className={`w-full text-left px-4 py-2.5 text-[13px] capitalize transition-colors ${
                          defaultTone === t
                            ? "font-semibold text-[#1a1a1a] bg-[#f5f3f0]"
                            : "text-[#666] hover:bg-[#f5f3f0]"
                        }`}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <div className="rounded-xl bg-[#f5f3f0] px-4 py-3.5 flex items-center justify-between">
                <div>
                  <p className="text-[13px] font-medium text-[#1a1a1a]">Notifications</p>
                  <p className="text-[11px] text-[#999]">Email updates</p>
                </div>
                <Bell className="h-4 w-4 text-[#bbb]" />
              </div>
            </div>
          </section>

          {/* About */}
          <section>
            <div className="rounded-xl bg-[#f5f3f0] px-4 py-3.5">
              <p className="text-[13px] font-medium text-[#1a1a1a]">RepoPost</p>
              <p className="text-[11px] text-[#999] mt-0.5">v1.0.0 &middot; Built with Groq &middot; Open Source</p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
