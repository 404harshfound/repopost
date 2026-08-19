import { useState, useRef, useEffect } from "react";
import { Settings, LogOut, User, Github, Linkedin, ChevronDown, Link2, Bell, HelpCircle, PanelLeft } from "lucide-react";

export default function Navbar({ onNavigate, linkedinProfile, githubUsername, onOpenSettings, onToggleSidebar, sidebarOpen }) {
  const [profileOpen, setProfileOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const profileRef = useRef(null);
  const notifRef = useRef(null);

  useEffect(() => {
    const handleClick = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) setProfileOpen(false);
      if (notifRef.current && !notifRef.current.contains(e.target)) setNotifOpen(false);
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const displayName = linkedinProfile?.name || "User";
  const headline = linkedinProfile?.headline || "Software Developer";
  const initial = displayName[0].toUpperCase();

  return (
    <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-lg border-b border-[#e8e5e1]">
      <div className="px-5 h-14 flex items-center justify-between">

        {/* Left — Sidebar toggle + Logo */}
        <div className="flex items-center gap-1">
          {onToggleSidebar && (
            <button
              onClick={onToggleSidebar}
              className={`p-2 rounded-lg transition-colors ${
                sidebarOpen
                  ? "text-[#1a1a1a] bg-[#f5f3f0]"
                  : "text-[#888] hover:text-[#1a1a1a] hover:bg-[#f5f3f0]"
              }`}
            >
              <PanelLeft className="h-[18px] w-[18px]" />
            </button>
          )}
        <button
          onClick={() => onNavigate("landing")}
          className="flex items-center gap-2.5 hover:opacity-70 transition-opacity"
        >
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-[#1a1a1a]">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65S8.93 17.38 9 18v4" />
              <path d="M9 18c-4.51 2-5-2-7-2" />
            </svg>
          </div>
          <span className="text-[14px] font-semibold tracking-[-0.02em] text-[#1a1a1a]">RepoPost</span>
        </button>
        </div>

        {/* Center spacer */}
        <div className="flex-1" />

        {/* Right — Actions */}
        <div className="flex items-center gap-1.5">

          {/* Notifications */}
          <div ref={notifRef} className="relative">
            <button
              onClick={() => { setNotifOpen(!notifOpen); setProfileOpen(false); }}
              className="relative p-2 rounded-lg text-[#888] hover:text-[#1a1a1a] hover:bg-[#f5f3f0] transition-colors"
            >
              <Bell className="h-[18px] w-[18px]" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#0a66c2]" />
            </button>
            {notifOpen && (
              <div className="absolute right-0 mt-2 w-72 rounded-2xl bg-white shadow-[0_4px_24px_rgba(0,0,0,0.1)] border border-[#e8e5e1] overflow-hidden">
                <div className="px-4 py-3 border-b border-[#f0eeeb]">
                  <p className="text-[13px] font-semibold text-[#1a1a1a]">Notifications</p>
                </div>
                <div className="px-4 py-6 text-center">
                  <p className="text-[12px] text-[#bbb]">No new notifications</p>
                </div>
              </div>
            )}
          </div>

          {/* Help */}
          <button className="p-2 rounded-lg text-[#888] hover:text-[#1a1a1a] hover:bg-[#f5f3f0] transition-colors">
            <HelpCircle className="h-[18px] w-[18px]" />
          </button>

          {/* Profile Dropdown */}
          <div ref={profileRef} className="relative ml-1">
            <button
              onClick={() => { setProfileOpen(!profileOpen); setNotifOpen(false); }}
              className="flex items-center gap-2 rounded-xl px-2 py-1.5 hover:bg-[#f5f3f0] transition-colors"
            >
              {linkedinProfile?.photoUrl ? (
                <img src={linkedinProfile.photoUrl} alt={displayName} className="w-7 h-7 rounded-full object-cover" />
              ) : (
                <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#0a66c2] to-[#004182] flex items-center justify-center">
                  <span className="text-white text-[11px] font-bold">{initial}</span>
                </div>
              )}
              <ChevronDown className={`h-3 w-3 text-[#999] transition-transform ${profileOpen ? "rotate-180" : ""}`} />
            </button>

            {profileOpen && (
              <div className="absolute right-0 mt-2 w-64 rounded-2xl bg-white shadow-[0_4px_24px_rgba(0,0,0,0.1)] border border-[#e8e5e1] overflow-hidden">

                {/* Profile header */}
                <div className="px-4 py-4 border-b border-[#f0eeeb]">
                  <div className="flex items-center gap-3">
                    {linkedinProfile?.photoUrl ? (
                      <img src={linkedinProfile.photoUrl} alt={displayName} className="w-10 h-10 rounded-full object-cover" />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#0a66c2] to-[#004182] flex items-center justify-center">
                        <span className="text-white text-[15px] font-bold">{initial}</span>
                      </div>
                    )}
                    <div className="min-w-0">
                      <p className="text-[13px] font-semibold text-[#1a1a1a] truncate">{displayName}</p>
                      <p className="text-[11px] text-[#999] truncate">{headline}</p>
                    </div>
                  </div>
                </div>

                {/* Connected accounts */}
                <div className="px-4 py-3 border-b border-[#f0eeeb]">
                  <p className="text-[10px] font-medium text-[#bbb] uppercase tracking-wider mb-2">Connected</p>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Github className="h-3.5 w-3.5 text-[#1a1a1a]" />
                        <span className="text-[12px] text-[#666]">
                          {githubUsername ? githubUsername : "Not connected"}
                        </span>
                      </div>
                      <span className={`w-1.5 h-1.5 rounded-full ${githubUsername ? "bg-emerald-400" : "bg-[#ddd]"}`} />
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Linkedin className="h-3.5 w-3.5 text-[#0a66c2]" />
                        <span className="text-[12px] text-[#666]">
                          {linkedinProfile ? linkedinProfile.name : "Not connected"}
                        </span>
                      </div>
                      <span className={`w-1.5 h-1.5 rounded-full ${linkedinProfile ? "bg-emerald-400" : "bg-[#ddd]"}`} />
                    </div>
                  </div>
                </div>

                {/* Menu items */}
                <div className="py-1.5">
                  <button
                    onClick={() => { setProfileOpen(false); onOpenSettings(); }}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-[13px] text-[#666] hover:bg-[#f5f3f0] transition-colors"
                  >
                    <Settings className="h-4 w-4" />
                    Settings
                  </button>
                  <button
                    onClick={() => { setProfileOpen(false); onNavigate("landing"); }}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-[13px] text-red-400 hover:bg-[#f5f3f0] transition-colors"
                  >
                    <LogOut className="h-4 w-4" />
                    Sign Out
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
