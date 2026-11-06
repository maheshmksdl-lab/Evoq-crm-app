"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { EnvelopeSimple, ArrowLeft, CheckCircle, ArrowRight } from "@phosphor-icons/react";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [email,     setEmail]     = useState("");
  const [focus,     setFocus]     = useState(false);
  const [loading,   setLoading]   = useState(false);
  const [sent,      setSent]      = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await new Promise(r => setTimeout(r, 800));
    setLoading(false);
    setSent(true);
  };

  const active = focus || email.length > 0;

  return (
    <div className="min-h-screen flex items-center justify-center p-4"
      style={{ background: "linear-gradient(135deg, #EFF6FF 0%, #E3ECFC 50%, #DBEAFE 100%)" }}>
      {/* Blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-32 -left-32 w-[500px] h-[500px] rounded-full opacity-30"
          style={{ background: "radial-gradient(circle, #BFDBFE 0%, transparent 70%)" }} />
        <div className="absolute -bottom-40 -right-40 w-[600px] h-[600px] rounded-full opacity-20"
          style={{ background: "radial-gradient(circle, #93C5FD 0%, transparent 70%)" }} />
      </div>

      <div className="relative w-full max-w-[420px] rounded-3xl shadow-2xl overflow-hidden"
        style={{
          background: "rgba(255,255,255,0.93)",
          backdropFilter: "blur(20px)",
          border: "1px solid rgba(255,255,255,0.7)",
          boxShadow: "0 25px 60px rgba(29,78,216,0.12), 0 8px 24px rgba(0,0,0,0.06)",
        }}>
        {/* Accent bar */}
        <div className="h-1 w-full" style={{ background: "linear-gradient(90deg, #1D4ED8 0%, #3B82F6 50%, #60A5FA 100%)" }} />

        <div className="px-8 py-8">
          {/* Logo */}
          <div className="flex justify-center mb-6">
            <img src="/logo.png" alt="EVOQ CRM" style={{ height: "26px", width: "auto" }} />
          </div>

          {!sent ? (
            <>
              {/* Lock icon */}
              <div className="flex justify-center mb-5">
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center"
                  style={{ background: "linear-gradient(135deg, #EFF6FF, #DBEAFE)", border: "1.5px solid #BFDBFE" }}>
                  <EnvelopeSimple size={26} color="#1D4ED8" weight="duotone" />
                </div>
              </div>

              <div className="mb-6 text-center">
                <h1 className="m-0 text-[20px] font-extrabold text-slate-900 tracking-tight">Forgot password?</h1>
                <p className="text-slate-400 text-[13px] mt-1 font-medium leading-relaxed">
                  Enter your email and we&apos;ll send you a link to reset your password.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Email field */}
                <div className="relative">
                  <label
                    className="absolute left-4 pointer-events-none font-medium transition-all duration-200 z-10"
                    style={{
                      top: active ? 7 : "50%",
                      transform: active ? "translateY(0) scale(0.78)" : "translateY(-50%)",
                      transformOrigin: "left",
                      color: focus ? "#1D4ED8" : "#94A3B8",
                      fontSize: active ? "10px" : "13.5px",
                    }}
                  >
                    Email address
                  </label>
                  <input
                    type="email" required value={email}
                    onChange={e => setEmail(e.target.value)}
                    onFocus={() => setFocus(true)}
                    onBlur={() => setFocus(false)}
                    className="w-full outline-none font-medium text-slate-800 transition-all"
                    style={{
                      paddingTop: 20, paddingBottom: 7, paddingLeft: 16, paddingRight: 16,
                      borderRadius: 12, fontSize: 13.5,
                      background: focus ? "#F8FBFF" : "#F8FAFC",
                      border: `1.5px solid ${focus ? "#1D4ED8" : "#E2E8F0"}`,
                      boxShadow: focus ? "0 0 0 3px rgba(29,78,216,0.08)" : "none",
                    }}
                  />
                </div>

                <button type="submit" disabled={loading}
                  className="w-full py-3 rounded-xl text-[14px] font-bold text-white flex items-center justify-center gap-2 transition-all"
                  style={{
                    background: loading ? "#93C5FD" : "linear-gradient(135deg, #1D4ED8 0%, #2563EB 100%)",
                    boxShadow: loading ? "none" : "0 4px 16px rgba(29,78,216,0.3)",
                  }}
                  onMouseEnter={e => { if (!loading) e.currentTarget.style.background = "linear-gradient(135deg, #1E40AF 0%, #1D4ED8 100%)"; }}
                  onMouseLeave={e => { if (!loading) e.currentTarget.style.background = "linear-gradient(135deg, #1D4ED8 0%, #2563EB 100%)"; }}>
                  {loading ? (
                    <>
                      <svg className="animate-spin" width="15" height="15" viewBox="0 0 24 24" fill="none">
                        <circle cx="12" cy="12" r="10" stroke="white" strokeWidth="3" strokeOpacity="0.3"/>
                        <path d="M12 2a10 10 0 0 1 10 10" stroke="white" strokeWidth="3" strokeLinecap="round"/>
                      </svg>
                      Sending…
                    </>
                  ) : (
                    <>Send reset link <ArrowRight size={14} weight="bold" /></>
                  )}
                </button>
              </form>
            </>
          ) : (
            /* Success state */
            <div className="text-center py-2">
              <div className="flex justify-center mb-4">
                <div className="w-16 h-16 rounded-2xl flex items-center justify-center"
                  style={{ background: "linear-gradient(135deg, #ECFDF5, #D1FAE5)", border: "1.5px solid #A7F3D0" }}>
                  <CheckCircle size={32} color="#10B981" weight="fill" />
                </div>
              </div>
              <h2 className="text-[19px] font-extrabold text-slate-900 mb-2">Check your email</h2>
              <p className="text-slate-400 text-[13px] font-medium leading-relaxed mb-1">
                We sent a reset link to
              </p>
              <p className="text-[#1D4ED8] font-bold text-[13.5px] mb-6">{email}</p>
              <div className="px-4 py-3 rounded-xl text-[12px] text-slate-500 font-medium mb-6"
                style={{ background: "#F8FBFF", border: "1px solid #E3ECFC" }}>
                Didn&apos;t receive it? Check your spam folder or{" "}
                <button onClick={() => setSent(false)} className="text-[#1D4ED8] font-bold hover:underline">
                  try again
                </button>
              </div>
            </div>
          )}

          {/* Back to sign in */}
          <button
            type="button"
            onClick={() => { window.location.href = "/login"; }}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-[13px] font-bold transition-all mt-2"
            style={{ color: "#64748B", background: "#F8FAFC", border: "1.5px solid #E2E8F0" }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = "#CBD5E1"; e.currentTarget.style.color = "#334155"; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = "#E2E8F0"; e.currentTarget.style.color = "#64748B"; }}>
            <ArrowLeft size={14} weight="bold" />
            Back to Sign in
          </button>
        </div>

        <div className="px-8 py-3 border-t text-center" style={{ borderColor: "#E3ECFC", background: "#F8FBFF" }}>
          <p className="text-[11px] text-slate-400 font-medium">
            © 2026 Social DNA Labs ·{" "}
            <span className="text-[#1D4ED8] cursor-pointer hover:underline">Privacy</span> ·{" "}
            <span className="text-[#1D4ED8] cursor-pointer hover:underline">Terms</span>
          </p>
        </div>
      </div>
    </div>
  );
}
