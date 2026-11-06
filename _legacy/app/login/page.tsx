"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeSlash, GoogleLogo, ArrowRight, LockSimple, EnvelopeSimple } from "@phosphor-icons/react";

const VALID_EMAIL    = "tech@evoq.one";
const VALID_PASSWORD = "Sdl@T3#1";

export default function LoginPage() {
  const router = useRouter();

  const [email,       setEmail]       = useState("");
  const [password,    setPassword]    = useState("");
  const [showPass,    setShowPass]    = useState(false);
  const [remember,    setRemember]    = useState(false);
  const [error,       setError]       = useState("");
  const [loading,     setLoading]     = useState(false);
  const [emailFocus,  setEmailFocus]  = useState(false);
  const [passFocus,   setPassFocus]   = useState(false);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    await new Promise(r => setTimeout(r, 600));

    if (email === VALID_EMAIL && password === VALID_PASSWORD) {
      // Set cookie so middleware can protect routes server-side
      const maxAge = remember ? 60 * 60 * 24 * 30 : 60 * 60 * 8; // 30 days or 8 hours
      document.cookie = `crm_auth=true; path=/; max-age=${maxAge}; SameSite=Lax`;
      localStorage.setItem("crm_auth", "true");
      router.push("/");
    } else {
      setError("Invalid email or password. Please try again.");
    }
    setLoading(false);
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4"
      style={{ background: "linear-gradient(135deg, #EFF6FF 0%, #E3ECFC 50%, #DBEAFE 100%)" }}
    >
      {/* Decorative blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-32 -left-32 w-[500px] h-[500px] rounded-full opacity-30"
          style={{ background: "radial-gradient(circle, #BFDBFE 0%, transparent 70%)" }} />
        <div className="absolute -bottom-40 -right-40 w-[600px] h-[600px] rounded-full opacity-20"
          style={{ background: "radial-gradient(circle, #93C5FD 0%, transparent 70%)" }} />
        <div className="absolute top-1/2 left-1/4 w-[300px] h-[300px] rounded-full opacity-15"
          style={{ background: "radial-gradient(circle, #1D4ED8 0%, transparent 70%)" }} />
      </div>

      {/* Card */}
      <div
        className="relative w-full max-w-[460px] rounded-3xl shadow-2xl overflow-hidden"
        style={{
          background: "rgba(255,255,255,0.92)",
          backdropFilter: "blur(20px)",
          border: "1px solid rgba(255,255,255,0.7)",
          boxShadow: "0 25px 60px rgba(29,78,216,0.12), 0 8px 24px rgba(0,0,0,0.06)",
        }}
      >
        {/* Top accent bar */}
        <div className="h-1 w-full" style={{ background: "linear-gradient(90deg, #1D4ED8 0%, #3B82F6 50%, #60A5FA 100%)" }} />

        <div className="px-10 py-7">
          {/* Logo */}
          <div className="flex justify-center mb-5">
            <img src="/logo.png" alt="EVOQ CRM" style={{ height: "28px", width: "auto" }} />
          </div>

          {/* Heading */}
          <div className="mb-5">
            <h1 className="m-0 text-[22px] font-extrabold text-slate-900 tracking-tight leading-tight">
              Welcome back
            </h1>
            <p className="text-slate-400 text-[13px] mt-0.5 font-medium">
              Sign in to your EVOQ CRM workspace
            </p>
          </div>

          {/* Error */}
          {error && (
            <div className="mb-5 px-4 py-3 rounded-xl text-[13px] font-medium text-red-700 flex items-center gap-2"
              style={{ background: "#FEF2F2", border: "1px solid #FECACA" }}>
              <LockSimple size={14} weight="fill" className="flex-shrink-0 text-red-500" />
              {error}
            </div>
          )}

          <form onSubmit={handleSignIn} className="space-y-3">
            {/* Email */}
            <div className="relative">
              <label
                className="absolute left-4 transition-all duration-200 pointer-events-none font-medium z-10"
                style={{
                  top: emailFocus || email ? "8px" : "50%",
                  transform: emailFocus || email ? "translateY(0) scale(0.8)" : "translateY(-50%)",
                  transformOrigin: "left",
                  color: emailFocus ? "#1D4ED8" : "#94A3B8",
                  fontSize: emailFocus || email ? "10px" : "14px",
                }}
              >
                Email or mobile number
              </label>
              <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" style={{ opacity: emailFocus || email ? 0 : 0.4 }}>
              </div>
              <input
                type="text"
                value={email}
                onChange={e => setEmail(e.target.value)}
                onFocus={() => setEmailFocus(true)}
                onBlur={() => setEmailFocus(false)}
                required
                className="w-full pt-5 pb-2 px-4 rounded-xl text-[14px] font-medium text-slate-800 outline-none transition-all"
                style={{
                  background: emailFocus ? "#F8FBFF" : "#F8FAFC",
                  border: `1.5px solid ${emailFocus ? "#1D4ED8" : "#E2E8F0"}`,
                  boxShadow: emailFocus ? "0 0 0 3px rgba(29,78,216,0.08)" : "none",
                }}
              />
            </div>

            {/* Password */}
            <div className="relative">
              <label
                className="absolute left-4 transition-all duration-200 pointer-events-none font-medium z-10"
                style={{
                  top: passFocus || password ? "8px" : "50%",
                  transform: passFocus || password ? "translateY(0) scale(0.8)" : "translateY(-50%)",
                  transformOrigin: "left",
                  color: passFocus ? "#1D4ED8" : "#94A3B8",
                  fontSize: passFocus || password ? "10px" : "14px",
                }}
              >
                Password
              </label>
              <input
                type={showPass ? "text" : "password"}
                value={password}
                onChange={e => setPassword(e.target.value)}
                onFocus={() => setPassFocus(true)}
                onBlur={() => setPassFocus(false)}
                required
                className="w-full pt-5 pb-2 px-4 pr-12 rounded-xl text-[14px] font-medium text-slate-800 outline-none transition-all"
                style={{
                  background: passFocus ? "#F8FBFF" : "#F8FAFC",
                  border: `1.5px solid ${passFocus ? "#1D4ED8" : "#E2E8F0"}`,
                  boxShadow: passFocus ? "0 0 0 3px rgba(29,78,216,0.08)" : "none",
                }}
              />
              <button
                type="button"
                onClick={() => setShowPass(p => !p)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors p-1 rounded-lg hover:bg-slate-100"
              >
                {showPass ? <EyeSlash size={17} weight="duotone" /> : <Eye size={17} weight="duotone" />}
              </button>
            </div>

            {/* Remember + Forgot */}
            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center gap-2.5 cursor-pointer group">
                <div
                  onClick={() => setRemember(r => !r)}
                  className="w-4 h-4 rounded flex items-center justify-center flex-shrink-0 transition-all"
                  style={{
                    border: `1.5px solid ${remember ? "#1D4ED8" : "#CBD5E1"}`,
                    background: remember ? "#1D4ED8" : "white",
                  }}
                >
                  {remember && (
                    <svg width="9" height="7" viewBox="0 0 9 7" fill="none">
                      <path d="M1 3.5L3.5 6L8 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  )}
                </div>
                <span className="text-[13px] font-medium text-slate-600 group-hover:text-slate-800 transition-colors select-none">
                  Remember me
                </span>
              </label>
              <button
                type="button"
                onClick={() => router.push("/forgot-password")}
                className="text-[13px] font-semibold transition-colors"
                style={{ color: "#1D4ED8" }}
                onMouseEnter={e => (e.currentTarget.style.color = "#1E40AF")}
                onMouseLeave={e => (e.currentTarget.style.color = "#1D4ED8")}
              >
                Forgot password?
              </button>
            </div>

            {/* Sign in button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl text-[14px] font-bold text-white transition-all flex items-center justify-center gap-2 mt-1"
              style={{
                background: loading ? "#93C5FD" : "linear-gradient(135deg, #1D4ED8 0%, #2563EB 100%)",
                boxShadow: loading ? "none" : "0 4px 16px rgba(29,78,216,0.35)",
                transform: loading ? "scale(0.99)" : "scale(1)",
              }}
              onMouseEnter={e => { if (!loading) e.currentTarget.style.background = "linear-gradient(135deg, #1E40AF 0%, #1D4ED8 100%)"; }}
              onMouseLeave={e => { if (!loading) e.currentTarget.style.background = "linear-gradient(135deg, #1D4ED8 0%, #2563EB 100%)"; }}
            >
              {loading ? (
                <>
                  <svg className="animate-spin" width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="10" stroke="white" strokeWidth="3" strokeOpacity="0.3"/>
                    <path d="M12 2a10 10 0 0 1 10 10" stroke="white" strokeWidth="3" strokeLinecap="round"/>
                  </svg>
                  Signing in…
                </>
              ) : (
                <>
                  Sign in
                  <ArrowRight size={15} weight="bold" />
                </>
              )}
            </button>
          </form>

          {/* Create account */}
          <p className="text-center text-[13px] text-slate-500 mt-3 font-medium">
            Don&apos;t have an account?{" "}
            <button
              className="font-bold transition-colors"
              style={{ color: "#1D4ED8" }}
              onClick={() => router.push("/register")}
              onMouseEnter={e => (e.currentTarget.style.color = "#1E40AF")}
              onMouseLeave={e => (e.currentTarget.style.color = "#1D4ED8")}
            >
              Create your account
            </button>
          </p>

          {/* Divider */}
          <div className="flex items-center gap-3 my-3">
            <div className="flex-1 h-px" style={{ background: "#E3ECFC" }} />
            <span className="text-[12px] font-semibold text-slate-400 uppercase tracking-wider">Or</span>
            <div className="flex-1 h-px" style={{ background: "#E3ECFC" }} />
          </div>

          {/* OTP */}
          <button
            type="button"
            className="w-full py-2.5 rounded-xl text-[13.5px] font-bold transition-all flex items-center justify-center gap-2 mb-3"
            style={{
              color: "#1D4ED8",
              background: "#F0F5FF",
              border: "1.5px solid #BFDBFE",
            }}
            onMouseEnter={e => { e.currentTarget.style.background = "#EFF6FF"; e.currentTarget.style.borderColor = "#1D4ED8"; }}
            onMouseLeave={e => { e.currentTarget.style.background = "#F0F5FF"; e.currentTarget.style.borderColor = "#BFDBFE"; }}
          >
            <EnvelopeSimple size={15} weight="duotone" />
            Get OTP
          </button>

          {/* Social login */}
          <div className="flex items-center gap-3 mb-3">
            <div className="flex-1 h-px" style={{ background: "#E3ECFC" }} />
            <span className="text-[12px] font-semibold text-slate-400 uppercase tracking-wider whitespace-nowrap">Or, login with</span>
            <div className="flex-1 h-px" style={{ background: "#E3ECFC" }} />
          </div>

          <div className="grid grid-cols-2 gap-3">
            {/* Google */}
            <button
              type="button"
              className="flex items-center justify-center gap-2.5 py-2.5 rounded-xl text-[13px] font-bold transition-all"
              style={{ color: "#374151", background: "white", border: "1.5px solid #E2E8F0" }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = "#93C5FD"; e.currentTarget.style.background = "#F8FBFF"; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = "#E2E8F0"; e.currentTarget.style.background = "white"; }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              Google
            </button>

            {/* Microsoft */}
            <button
              type="button"
              className="flex items-center justify-center gap-2.5 py-2.5 rounded-xl text-[13px] font-bold transition-all"
              style={{ color: "#374151", background: "white", border: "1.5px solid #E2E8F0" }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = "#93C5FD"; e.currentTarget.style.background = "#F8FBFF"; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = "#E2E8F0"; e.currentTarget.style.background = "white"; }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24">
                <path d="M11.4 2H2v9.4h9.4V2z" fill="#F25022"/>
                <path d="M22 2h-9.4v9.4H22V2z" fill="#7FBA00"/>
                <path d="M11.4 12.6H2V22h9.4v-9.4z" fill="#00A4EF"/>
                <path d="M22 12.6h-9.4V22H22v-9.4z" fill="#FFB900"/>
              </svg>
              Microsoft
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="px-10 py-4 border-t text-center" style={{ borderColor: "#E3ECFC", background: "#F8FBFF" }}>
          <p className="text-[11.5px] text-slate-400 font-medium">
            © 2026 Social DNA Labs · <span className="text-[#1D4ED8] cursor-pointer hover:underline">Privacy</span> · <span className="text-[#1D4ED8] cursor-pointer hover:underline">Terms</span>
          </p>
        </div>
      </div>
    </div>
  );
}
