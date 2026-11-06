"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeSlash, ArrowRight, CheckCircle } from "@phosphor-icons/react";

const STATES = [
  "Andhra Pradesh","Arunachal Pradesh","Assam","Bihar","Chhattisgarh","Goa","Gujarat",
  "Haryana","Himachal Pradesh","Jharkhand","Karnataka","Kerala","Madhya Pradesh",
  "Maharashtra","Manipur","Meghalaya","Mizoram","Nagaland","Odisha","Punjab",
  "Rajasthan","Sikkim","Tamil Nadu","Telangana","Tripura","Uttar Pradesh",
  "Uttarakhand","West Bengal","Delhi","Jammu & Kashmir","Ladakh",
];

const DISTRICTS: Record<string, string[]> = {
  "Maharashtra": ["Mumbai","Pune","Nagpur","Nashik","Aurangabad","Solapur","Kolhapur"],
  "Karnataka":   ["Bengaluru","Mysuru","Mangaluru","Hubballi","Belagavi","Tumakuru"],
  "Tamil Nadu":  ["Chennai","Coimbatore","Madurai","Tiruchirappalli","Salem","Tirunelveli"],
  "Delhi":       ["Central Delhi","East Delhi","New Delhi","North Delhi","South Delhi","West Delhi"],
  "Gujarat":     ["Ahmedabad","Surat","Vadodara","Rajkot","Bhavnagar","Jamnagar"],
  "Telangana":   ["Hyderabad","Warangal","Nizamabad","Karimnagar","Khammam"],
};

const USER_TYPES = ["Sales Executive","Sales Manager","Operations Manager","VP of Operations","Administrator","Super Admin"];

const ZIP_CODES: Record<string, string[]> = {
  "Mumbai":    ["400001","400002","400003","400004","400005"],
  "Pune":      ["411001","411002","411003","411004","411005"],
  "Bengaluru": ["560001","560002","560003","560004","560005"],
  "Chennai":   ["600001","600002","600003","600004","600005"],
  "Hyderabad": ["500001","500002","500003","500004","500005"],
  "Ahmedabad": ["380001","380002","380003","380004","380005"],
};

type Field = { value: string; focus: boolean };
const field = (): Field => ({ value: "", focus: false });

export default function RegisterPage() {
  const router = useRouter();

  const [fullName,    setFullName]    = useState(field());
  const [email,       setEmail]       = useState(field());
  const [mobile,      setMobile]      = useState(field());
  const [address,     setAddress]     = useState(field());
  const [password,    setPassword]    = useState(field());
  const [confirm,     setConfirm]     = useState(field());
  const [state,       setState]       = useState("");
  const [district,    setDistrict]    = useState("");
  const [zip,         setZip]         = useState("");
  const [userType,    setUserType]    = useState("");
  const [showPass,    setShowPass]    = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error,       setError]       = useState("");
  const [loading,     setLoading]     = useState(false);
  const [success,     setSuccess]     = useState(false);

  const districts = state ? (DISTRICTS[state] ?? ["Other"]) : [];
  const zips      = district ? (ZIP_CODES[district] ?? ["Other"]) : [];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (password.value !== confirm.value) { setError("Passwords do not match."); return; }
    if (password.value.length < 6)        { setError("Password must be at least 6 characters."); return; }
    setLoading(true);
    await new Promise(r => setTimeout(r, 800));
    setLoading(false);
    setSuccess(true);
    await new Promise(r => setTimeout(r, 1500));
    router.push("/login");
  };

  // Floating label helpers
  const active = (f: Field) => f.focus || f.value.length > 0;
  const labelStyle = (f: Field, color = "#1D4ED8"): React.CSSProperties => ({
    position: "absolute", left: 14, pointerEvents: "none", fontWeight: 500,
    top: active(f) ? 6 : "50%",
    transform: active(f) ? "translateY(0) scale(0.78)" : "translateY(-50%)",
    transformOrigin: "left",
    color: f.focus ? color : "#94A3B8",
    fontSize: active(f) ? "10px" : "13.5px",
    transition: "all 0.18s ease",
    zIndex: 10,
  });
  const inputStyle = (f: Field): React.CSSProperties => ({
    width: "100%", paddingTop: 20, paddingBottom: 6, paddingLeft: 14, paddingRight: 14,
    borderRadius: 12, fontSize: 13.5, fontWeight: 500, color: "#1E293B", outline: "none",
    background: f.focus ? "#F8FBFF" : "#F8FAFC",
    border: `1.5px solid ${f.focus ? "#1D4ED8" : "#E2E8F0"}`,
    boxShadow: f.focus ? "0 0 0 3px rgba(29,78,216,0.07)" : "none",
    transition: "all 0.18s ease",
  });
  const selectStyle = (val: string): React.CSSProperties => ({
    width: "100%", padding: "10px 14px", borderRadius: 12,
    fontSize: 13.5, fontWeight: 500, color: val ? "#1E293B" : "#94A3B8",
    background: "#F8FAFC",
    border: "1.5px solid #E2E8F0",
    outline: "none", appearance: "none", cursor: "pointer",
    transition: "all 0.18s ease",
  });

  if (success) return (
    <div className="min-h-screen flex items-center justify-center"
      style={{ background: "linear-gradient(135deg, #EFF6FF 0%, #E3ECFC 50%, #DBEAFE 100%)" }}>
      <div className="flex flex-col items-center gap-3 bg-white rounded-3xl px-10 py-8 shadow-xl border border-[#E3ECFC]">
        <CheckCircle size={48} color="#10B981" weight="fill" />
        <p className="text-[17px] font-bold text-slate-800">Account created!</p>
        <p className="text-[13px] text-slate-400 font-medium">Redirecting to sign in…</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen flex items-center justify-center p-4 py-6"
      style={{ background: "linear-gradient(135deg, #EFF6FF 0%, #E3ECFC 50%, #DBEAFE 100%)" }}>
      {/* Blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-32 -left-32 w-[500px] h-[500px] rounded-full opacity-30"
          style={{ background: "radial-gradient(circle, #BFDBFE 0%, transparent 70%)" }} />
        <div className="absolute -bottom-40 -right-40 w-[600px] h-[600px] rounded-full opacity-20"
          style={{ background: "radial-gradient(circle, #93C5FD 0%, transparent 70%)" }} />
      </div>

      <div className="relative w-full max-w-[460px] rounded-3xl shadow-2xl overflow-hidden"
        style={{
          background: "rgba(255,255,255,0.93)",
          backdropFilter: "blur(20px)",
          border: "1px solid rgba(255,255,255,0.7)",
          boxShadow: "0 25px 60px rgba(29,78,216,0.12), 0 8px 24px rgba(0,0,0,0.06)",
        }}>
        {/* Accent bar */}
        <div className="h-1 w-full" style={{ background: "linear-gradient(90deg, #1D4ED8 0%, #3B82F6 50%, #60A5FA 100%)" }} />

        <div className="px-8 pt-6 pb-5">
          {/* Logo */}
          <div className="flex justify-center mb-4">
            <img src="/logo.png" alt="EVOQ CRM" style={{ height: "26px", width: "auto" }} />
          </div>

          {/* Heading */}
          <div className="mb-4">
            <h1 className="m-0 text-[20px] font-extrabold text-slate-900 tracking-tight">Get started your journey</h1>
            <p className="text-slate-400 text-[12px] mt-0.5 font-medium">Create your EVOQ CRM account</p>
          </div>

          {/* Error */}
          {error && (
            <div className="mb-3 px-3 py-2.5 rounded-xl text-[12.5px] font-medium text-red-700 flex items-center gap-2"
              style={{ background: "#FEF2F2", border: "1px solid #FECACA" }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-2.5">
            {/* Row: Full Name + Email */}
            <div className="grid grid-cols-2 gap-2.5">
              <div className="relative">
                <label style={labelStyle(fullName)}>Full Name</label>
                <input required value={fullName.value} style={inputStyle(fullName)}
                  onChange={e => setFullName(p => ({ ...p, value: e.target.value }))}
                  onFocus={() => setFullName(p => ({ ...p, focus: true }))}
                  onBlur={() => setFullName(p => ({ ...p, focus: false }))} />
              </div>
              <div className="relative">
                <label style={labelStyle(email)}>Email</label>
                <input required type="email" value={email.value} style={inputStyle(email)}
                  onChange={e => setEmail(p => ({ ...p, value: e.target.value }))}
                  onFocus={() => setEmail(p => ({ ...p, focus: true }))}
                  onBlur={() => setEmail(p => ({ ...p, focus: false }))} />
              </div>
            </div>

            {/* Row: Mobile + User Type */}
            <div className="grid grid-cols-2 gap-2.5">
              <div className="relative">
                <label style={labelStyle(mobile)}>Mobile Number</label>
                <input required type="tel" value={mobile.value} style={inputStyle(mobile)}
                  onChange={e => setMobile(p => ({ ...p, value: e.target.value }))}
                  onFocus={() => setMobile(p => ({ ...p, focus: true }))}
                  onBlur={() => setMobile(p => ({ ...p, focus: false }))} />
              </div>
              <div className="relative">
                <select required value={userType} onChange={e => setUserType(e.target.value)}
                  style={selectStyle(userType)}
                  onFocus={e => { e.currentTarget.style.borderColor = "#1D4ED8"; e.currentTarget.style.boxShadow = "0 0 0 3px rgba(29,78,216,0.07)"; }}
                  onBlur={e  => { e.currentTarget.style.borderColor = "#E2E8F0"; e.currentTarget.style.boxShadow = "none"; }}>
                  <option value="" disabled>User Type</option>
                  {USER_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M2 4l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                </div>
              </div>
            </div>

            {/* Address */}
            <div className="relative">
              <label style={{
                ...labelStyle(address),
                top: active(address) ? 6 : 14,
                transform: active(address) ? "translateY(0) scale(0.78)" : "none",
              }}>Address</label>
              <textarea required value={address.value} rows={2}
                onChange={e => setAddress(p => ({ ...p, value: e.target.value }))}
                onFocus={() => setAddress(p => ({ ...p, focus: true }))}
                onBlur={() => setAddress(p => ({ ...p, focus: false }))}
                style={{ ...inputStyle(address), paddingTop: 22, resize: "none", lineHeight: 1.5 }} />
            </div>

            {/* Row: Password + Confirm Password */}
            <div className="grid grid-cols-2 gap-2.5">
              <div className="relative">
                <label style={labelStyle(password)}>Password</label>
                <input required type={showPass ? "text" : "password"} value={password.value}
                  style={{ ...inputStyle(password), paddingRight: 36 }}
                  onChange={e => setPassword(p => ({ ...p, value: e.target.value }))}
                  onFocus={() => setPassword(p => ({ ...p, focus: true }))}
                  onBlur={() => setPassword(p => ({ ...p, focus: false }))} />
                <button type="button" onClick={() => setShowPass(p => !p)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors">
                  {showPass ? <EyeSlash size={15} weight="duotone" /> : <Eye size={15} weight="duotone" />}
                </button>
              </div>
              <div className="relative">
                <label style={labelStyle(confirm)}>Confirm Password</label>
                <input required type={showConfirm ? "text" : "password"} value={confirm.value}
                  style={{ ...inputStyle(confirm), paddingRight: 36 }}
                  onChange={e => setConfirm(p => ({ ...p, value: e.target.value }))}
                  onFocus={() => setConfirm(p => ({ ...p, focus: true }))}
                  onBlur={() => setConfirm(p => ({ ...p, focus: false }))} />
                <button type="button" onClick={() => setShowConfirm(p => !p)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors">
                  {showConfirm ? <EyeSlash size={15} weight="duotone" /> : <Eye size={15} weight="duotone" />}
                </button>
              </div>
            </div>

            {/* Row: State + District + Zip */}
            <div className="grid grid-cols-3 gap-2.5">
              <div className="relative">
                <select required value={state} onChange={e => { setState(e.target.value); setDistrict(""); setZip(""); }}
                  style={selectStyle(state)}
                  onFocus={e => { e.currentTarget.style.borderColor = "#1D4ED8"; e.currentTarget.style.boxShadow = "0 0 0 3px rgba(29,78,216,0.07)"; }}
                  onBlur={e  => { e.currentTarget.style.borderColor = "#E2E8F0"; e.currentTarget.style.boxShadow = "none"; }}>
                  <option value="" disabled>State</option>
                  {STATES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M2 4l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                </div>
              </div>
              <div className="relative">
                <select required value={district} onChange={e => { setDistrict(e.target.value); setZip(""); }}
                  disabled={!state}
                  style={{ ...selectStyle(district), opacity: state ? 1 : 0.5 }}
                  onFocus={e => { e.currentTarget.style.borderColor = "#1D4ED8"; e.currentTarget.style.boxShadow = "0 0 0 3px rgba(29,78,216,0.07)"; }}
                  onBlur={e  => { e.currentTarget.style.borderColor = "#E2E8F0"; e.currentTarget.style.boxShadow = "none"; }}>
                  <option value="" disabled>District</option>
                  {districts.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M2 4l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                </div>
              </div>
              <div className="relative">
                <select required value={zip} onChange={e => setZip(e.target.value)}
                  disabled={!district}
                  style={{ ...selectStyle(zip), opacity: district ? 1 : 0.5 }}
                  onFocus={e => { e.currentTarget.style.borderColor = "#1D4ED8"; e.currentTarget.style.boxShadow = "0 0 0 3px rgba(29,78,216,0.07)"; }}
                  onBlur={e  => { e.currentTarget.style.borderColor = "#E2E8F0"; e.currentTarget.style.boxShadow = "none"; }}>
                  <option value="" disabled>Zip Code</option>
                  {zips.length > 0
                    ? zips.map(z => <option key={z} value={z}>{z}</option>)
                    : <option value="Other">Other</option>}
                </select>
                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M2 4l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                </div>
              </div>
            </div>

            {/* Submit */}
            <button type="submit" disabled={loading}
              className="w-full py-3 rounded-xl text-[14px] font-bold text-white flex items-center justify-center gap-2 mt-1 transition-all"
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
                  Creating account…
                </>
              ) : (
                <>Submit <ArrowRight size={14} weight="bold" /></>
              )}
            </button>
          </form>

          <p className="text-center text-[12.5px] text-slate-500 mt-3 font-medium">
            You already have an account?{" "}
            <button onClick={() => router.push("/login")}
              className="font-bold transition-colors"
              style={{ color: "#1D4ED8" }}
              onMouseEnter={e => (e.currentTarget.style.color = "#1E40AF")}
              onMouseLeave={e => (e.currentTarget.style.color = "#1D4ED8")}>
              Sign in
            </button>
          </p>
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
