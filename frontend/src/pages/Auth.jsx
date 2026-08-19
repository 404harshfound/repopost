import { useState } from "react";
import { Eye, EyeOff, ArrowLeft } from "lucide-react";

export default function Auth({ onNavigate }) {
  const [mode, setMode] = useState("signin");
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");

  const DEMO_EMAIL = "demo@repopost.ai";
  const DEMO_PASS = "demo123";

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");

    if (mode === "signin") {
      if (email === DEMO_EMAIL && password === DEMO_PASS) {
        onNavigate("generator");
      } else {
        setError("Invalid credentials. Use demo@repopost.ai / demo123");
      }
    } else {
      if (!name.trim() || !email.trim() || !password.trim()) {
        setError("Please fill in all fields");
      } else {
        onNavigate("generator");
      }
    }
  };

  const handleGoogleSignIn = () => {
    onNavigate("generator");
  };

  return (
    <div className="min-h-screen bg-[#f5f3f0] font-[system-ui] flex items-center justify-center px-5">
      <div className="w-full max-w-sm">

        <button
          onClick={() => onNavigate("landing")}
          className="flex items-center gap-1.5 text-[13px] text-[#999] hover:text-[#555] transition-colors mb-10"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back
        </button>

        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-[#1a1a1a] mb-5">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65S8.93 17.38 9 18v4" />
              <path d="M9 18c-4.51 2-5-2-7-2" />
            </svg>
          </div>
          <h1 className="text-[24px] font-semibold tracking-[-0.02em] text-[#1a1a1a]">
            {mode === "signin" ? "Welcome Back" : "Create Account"}
          </h1>
          <p className="mt-1.5 text-[14px] text-[#999]">
            {mode === "signin" ? "Please enter your details" : "Get started for free"}
          </p>
        </div>

        <div className="flex rounded-xl bg-white p-1 shadow-[0_1px_3px_rgba(0,0,0,0.06)] mb-6">
          <button
            onClick={() => setMode("signin")}
            className={`flex-1 rounded-lg py-2.5 text-[13px] font-medium transition-all duration-200 ${
              mode === "signin"
                ? "bg-[#1a1a1a] text-white shadow-[0_2px_8px_rgba(0,0,0,0.12)]"
                : "text-[#999] hover:text-[#555]"
            }`}
          >
            Sign In
          </button>
          <button
            onClick={() => setMode("signup")}
            className={`flex-1 rounded-lg py-2.5 text-[13px] font-medium transition-all duration-200 ${
              mode === "signup"
                ? "bg-[#1a1a1a] text-white shadow-[0_2px_8px_rgba(0,0,0,0.12)]"
                : "text-[#999] hover:text-[#555]"
            }`}
          >
            Sign Up
          </button>
        </div>

        {/* Google Sign In */}
        <button
          onClick={handleGoogleSignIn}
          className="w-full flex items-center justify-center gap-3 rounded-xl bg-white py-3.5 text-[14px] font-medium text-[#333] shadow-[0_1px_3px_rgba(0,0,0,0.06)] hover:bg-[#fafaf8] transition-colors mb-4 border border-[#e8e5e1]"
        >
          <svg width="18" height="18" viewBox="0 0 18 18">
            <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 01-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4"/>
            <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 009 18z" fill="#34A853"/>
            <path d="M3.964 10.71A5.41 5.41 0 013.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 000 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05"/>
            <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 00.957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
          </svg>
          Continue with Google
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="flex-1 border-t border-[#e8e5e1]" />
          <span className="text-[12px] text-[#bbb]">or</span>
          <div className="flex-1 border-t border-[#e8e5e1]" />
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5">
          {mode === "signup" && (
            <div className="rounded-xl bg-white shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your name"
                className="w-full rounded-xl bg-transparent px-4 py-3.5 text-[14px] text-[#1a1a1a] placeholder-[#bbb] outline-none"
              />
            </div>
          )}

          <div className="rounded-xl bg-white shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email address"
              className="w-full rounded-xl bg-transparent px-4 py-3.5 text-[14px] text-[#1a1a1a] placeholder-[#bbb] outline-none"
            />
          </div>

          <div className="rounded-xl bg-white shadow-[0_1px_3px_rgba(0,0,0,0.06)] relative">
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              className="w-full rounded-xl bg-transparent px-4 py-3.5 pr-11 text-[14px] text-[#1a1a1a] placeholder-[#bbb] outline-none"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#ccc] hover:text-[#888] transition-colors"
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>

          {mode === "signin" && (
            <div className="flex items-center justify-between px-1 pt-1">
              <label className="flex items-center gap-2 text-[12px] text-[#999] cursor-pointer">
                <input type="checkbox" className="rounded accent-[#1a1a1a]" />
                Remember me
              </label>
              <button type="button" className="text-[12px] font-medium text-[#1a1a1a] hover:text-[#555] transition-colors">
                Forgot password
              </button>
            </div>
          )}

          {error && (
            <p className="text-[12px] text-red-500 text-center px-1">{error}</p>
          )}

          <button
            type="submit"
            className="w-full rounded-xl bg-[#1a1a1a] py-3.5 text-[14px] font-medium text-white hover:bg-[#333] transition-colors shadow-[0_2px_8px_rgba(0,0,0,0.15)] mt-2"
          >
            {mode === "signin" ? "Sign In" : "Create Account"}
          </button>
        </form>

        {mode === "signin" && (
          <div className="mt-5 rounded-xl bg-white/60 px-4 py-3 text-center text-[12px] text-[#999]">
            Demo login: <span className="font-medium text-[#666]">demo@repopost.ai</span> / <span className="font-medium text-[#666]">demo123</span>
          </div>
        )}

        <p className="mt-6 text-center text-[12px] text-[#bbb]">
          {mode === "signin" ? "Don't have an account? " : "Already have an account? "}
          <button
            onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
            className="font-medium text-[#1a1a1a] hover:text-[#555] transition-colors"
          >
            {mode === "signin" ? "Sign Up" : "Sign In"}
          </button>
        </p>
      </div>
    </div>
  );
}
