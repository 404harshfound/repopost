import { useState } from "react";
import { Eye, EyeOff, ArrowLeft, Mail } from "lucide-react";
import { supabase } from "../lib/supabase";

export default function Auth({ onNavigate }) {
  const [mode, setMode] = useState("signin");
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [checkEmail, setCheckEmail] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (mode === "signin") {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
      } else {
        if (!name.trim()) {
          setError("Please enter your name");
          setLoading(false);
          return;
        }
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { full_name: name },
          },
        });
        if (error) throw error;
        if (!data.session) {
          setCheckEmail(true);
        }
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleOAuth = async (provider) => {
    setError("");
    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: window.location.origin,
      },
    });
    if (error) setError(error.message);
  };

  const handleForgotPassword = async () => {
    if (!email) {
      setError("Enter your email first");
      return;
    }
    setError("");
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: window.location.origin,
    });
    if (error) {
      setError(error.message);
    } else {
      setError("Password reset link sent to your email");
    }
  };

  if (checkEmail) {
    return (
      <div className="min-h-screen bg-[var(--surface)] font-[system-ui] flex items-center justify-center px-5 relative overflow-hidden">
        <div className="hero-glow-sm" />
        <div className="w-full max-w-sm text-center relative z-10">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-[#1a1a1a] mb-5">
            <Mail className="h-6 w-6 text-white" />
          </div>
          <h1 className="text-[24px] font-semibold tracking-[-0.02em] text-[var(--ink)]">
            Check your email
          </h1>
          <p className="mt-2 text-[14px] text-[var(--ink-tertiary)] leading-relaxed">
            We sent a confirmation link to
            <br />
            <span className="font-medium text-[var(--ink-secondary)]">{email}</span>
          </p>
          <button
            onClick={() => {
              setCheckEmail(false);
              setMode("signin");
            }}
            className="mt-8 text-[13px] font-medium text-[#0a66c2] hover:text-[#004182] transition-colors"
          >
            Back to Sign In
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--surface)] font-[system-ui] flex items-center justify-center px-5 relative overflow-hidden">
      <div className="hero-glow-sm" />
      <div className="w-full max-w-sm relative z-10">
        <button
          onClick={() => onNavigate("landing")}
          className="flex items-center gap-1.5 text-[13px] text-[var(--ink-tertiary)] hover:text-[var(--ink-secondary)] transition-colors mb-10"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back
        </button>

        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-[#1a1a1a] mb-5">
            <svg
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              stroke="white"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65S8.93 17.38 9 18v4" />
              <path d="M9 18c-4.51 2-5-2-7-2" />
            </svg>
          </div>
          <h1 className="text-[24px] font-semibold tracking-[-0.02em] text-[var(--ink)]">
            {mode === "signin" ? "Welcome Back" : "Create Account"}
          </h1>
          <p className="mt-1.5 text-[14px] text-[var(--ink-tertiary)]">
            {mode === "signin"
              ? "Please enter your details"
              : "Get started for free"}
          </p>
        </div>

        <div className="flex rounded-xl bg-[var(--card)] p-1 shadow-[0_1px_3px_rgba(0,0,0,0.06)] mb-6">
          <button
            onClick={() => {
              setMode("signin");
              setError("");
            }}
            className={`flex-1 rounded-lg py-2.5 text-[13px] font-medium transition-all duration-200 ${
              mode === "signin"
                ? "bg-[var(--btn)] text-[var(--btn-text)] shadow-[0_2px_8px_rgba(0,0,0,0.12)]"
                : "text-[var(--ink-tertiary)] hover:text-[var(--ink-secondary)]"
            }`}
          >
            Sign In
          </button>
          <button
            onClick={() => {
              setMode("signup");
              setError("");
            }}
            className={`flex-1 rounded-lg py-2.5 text-[13px] font-medium transition-all duration-200 ${
              mode === "signup"
                ? "bg-[var(--btn)] text-[var(--btn-text)] shadow-[0_2px_8px_rgba(0,0,0,0.12)]"
                : "text-[var(--ink-tertiary)] hover:text-[var(--ink-secondary)]"
            }`}
          >
            Sign Up
          </button>
        </div>

        {/* OAuth Buttons */}
        <div className="space-y-2.5 mb-4">
          <button
            onClick={() => handleOAuth("google")}
            className="w-full flex items-center justify-center gap-3 rounded-xl bg-[var(--card)] py-3.5 text-[14px] font-medium text-[var(--ink)] shadow-[0_1px_3px_rgba(0,0,0,0.06)] hover:bg-[var(--card-hover)] transition-colors border border-[var(--edge)]"
          >
            <svg width="18" height="18" viewBox="0 0 18 18">
              <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 01-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4" />
              <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 009 18z" fill="#34A853" />
              <path d="M3.964 10.71A5.41 5.41 0 013.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 000 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05" />
              <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 00.957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335" />
            </svg>
            Continue with Google
          </button>

          <button
            onClick={() => handleOAuth("github")}
            className="w-full flex items-center justify-center gap-3 rounded-xl bg-[var(--card)] py-3.5 text-[14px] font-medium text-[var(--ink)] shadow-[0_1px_3px_rgba(0,0,0,0.06)] hover:bg-[var(--card-hover)] transition-colors border border-[var(--edge)]"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
            </svg>
            Continue with GitHub
          </button>

          <button
            onClick={() => handleOAuth("linkedin_oidc")}
            className="w-full flex items-center justify-center gap-3 rounded-xl bg-[var(--card)] py-3.5 text-[14px] font-medium text-[var(--ink)] shadow-[0_1px_3px_rgba(0,0,0,0.06)] hover:bg-[var(--card-hover)] transition-colors border border-[var(--edge)]"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="#0a66c2">
              <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
            </svg>
            Continue with LinkedIn
          </button>
        </div>

        <div className="flex items-center gap-3 mb-4">
          <div className="flex-1 border-t border-[var(--edge)]" />
          <span className="text-[12px] text-[var(--ink-muted)]">or</span>
          <div className="flex-1 border-t border-[var(--edge)]" />
        </div>

        {/* Email/Password Form */}
        <form onSubmit={handleSubmit} className="space-y-3.5">
          {mode === "signup" && (
            <div className="rounded-xl bg-[var(--card)] shadow-[0_1px_3px_rgba(0,0,0,0.06)] border border-[var(--edge-light)]">
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your name"
                className="w-full rounded-xl bg-transparent px-4 py-3.5 text-[14px] text-[var(--ink)] placeholder-[var(--ink-muted)] outline-none"
              />
            </div>
          )}

          <div className="rounded-xl bg-[var(--card)] shadow-[0_1px_3px_rgba(0,0,0,0.06)] border border-[var(--edge-light)]">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email address"
              className="w-full rounded-xl bg-transparent px-4 py-3.5 text-[14px] text-[var(--ink)] placeholder-[var(--ink-muted)] outline-none"
            />
          </div>

          <div className="rounded-xl bg-[var(--card)] shadow-[0_1px_3px_rgba(0,0,0,0.06)] border border-[var(--edge-light)] relative">
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              className="w-full rounded-xl bg-transparent px-4 py-3.5 pr-11 text-[14px] text-[var(--ink)] placeholder-[var(--ink-muted)] outline-none"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[var(--ink-faint)] hover:text-[var(--ink-dim)] transition-colors"
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
          </div>

          {mode === "signin" && (
            <div className="flex items-center justify-end px-1 pt-1">
              <button
                type="button"
                onClick={handleForgotPassword}
                className="text-[12px] font-medium text-[var(--ink)] hover:text-[var(--ink-secondary)] transition-colors"
              >
                Forgot password?
              </button>
            </div>
          )}

          {error && (
            <p
              className={`text-[12px] text-center px-1 ${
                error.includes("reset link sent")
                  ? "text-emerald-600"
                  : "text-red-500"
              }`}
            >
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-[var(--btn)] py-3.5 text-[14px] font-medium text-[var(--btn-text)] hover:bg-[var(--btn-hover)] transition-colors shadow-[0_2px_8px_rgba(0,0,0,0.15)] mt-2 disabled:opacity-50"
          >
            {loading
              ? "..."
              : mode === "signin"
                ? "Sign In"
                : "Create Account"}
          </button>
        </form>

        <p className="mt-6 text-center text-[12px] text-[var(--ink-muted)]">
          {mode === "signin"
            ? "Don't have an account? "
            : "Already have an account? "}
          <button
            onClick={() => {
              setMode(mode === "signin" ? "signup" : "signin");
              setError("");
            }}
            className="font-medium text-[var(--ink)] hover:text-[var(--ink-secondary)] transition-colors"
          >
            {mode === "signin" ? "Sign Up" : "Sign In"}
          </button>
        </p>
      </div>
    </div>
  );
}
