"use client";

import { useState } from "react";
import { createClient } from "@supabase/supabase-js";
import { useRouter } from "next/navigation";
import Link from "next/link";

const supabase = createClient(
  "https://ckuiskbegrlrethnlhzq.supabase.co",
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      storageKey: "localplatform-auth",
    },
  }
);

const ADMIN_EMAIL = "architectsunlight@gmail.com";

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<"phone" | "admin">("phone");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [adminEmail, setAdminEmail] = useState("");
  const [adminPassword, setAdminPassword] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const normalizedPhone = () => {
    const digits = phone.replace(/\D/g, "");
    if (digits.length === 10) return `+91${digits}`;
    if (digits.startsWith("91") && digits.length === 12) return `+${digits}`;
    return "";
  };

  async function sendOtp() {
    setError("");
    setMessage("");

    const fullPhone = normalizedPhone();
    if (!fullPhone) {
      setError("10 digit Indian mobile number डालें.");
      return;
    }

    setBusy(true);
    const { error: otpError } = await supabase.auth.signInWithOtp({
      phone: fullPhone,
    });
    setBusy(false);

    if (otpError) {
      setError(otpError.message);
      return;
    }

    setOtpSent(true);
    setMessage("OTP आपके mobile पर भेज दिया गया है.");
  }

  async function verifyOtp() {
    setError("");
    setMessage("");

    const fullPhone = normalizedPhone();
    if (!fullPhone || !/^\d{6}$/.test(otp)) {
      setError("6 digit OTP डालें.");
      return;
    }

    setBusy(true);
    const { data, error: verifyError } = await supabase.auth.verifyOtp({
      phone: fullPhone,
      token: otp,
      type: "sms",
    });
    setBusy(false);

    if (verifyError) {
      setError(verifyError.message);
      return;
    }

    if (!data.session) {
      setError("Login session नहीं मिला. फिर से OTP verify करें.");
      return;
    }

    router.replace("/list-business");
  }

  async function adminLogin() {
    setError("");
    setMessage("");

    if (adminEmail.trim().toLowerCase() !== ADMIN_EMAIL) {
      setError(`Admin login सिर्फ ${ADMIN_EMAIL} के लिए है.`);
      return;
    }

    setBusy(true);
    const { data, error: loginError } =
      await supabase.auth.signInWithPassword({
        email: adminEmail.trim(),
        password: adminPassword,
      });

    if (loginError) {
      setBusy(false);
      setError(loginError.message);
      return;
    }

    const { data: adminRow, error: adminError } = await supabase
      .from("admin_users")
      .select("user_id")
      .eq("user_id", data.user.id)
      .maybeSingle();

    setBusy(false);

    if (adminError || !adminRow) {
      await supabase.auth.signOut();
      setError("Ye account admin ke roop me authorized nahi hai.");
      return;
    }

    router.replace("/admin");
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-blue-50 via-white to-orange-50 px-4 pb-24 pt-8">
      <div className="mx-auto max-w-md">
        <Link href="/" className="block text-center text-3xl font-black tracking-tight">
          <span className="text-blue-600">Local</span>
          <span className="text-orange-500">Platform</span>
        </Link>

        <p className="mt-2 text-center text-xs font-semibold text-slate-500">
          Find local • Support local • Grow local
        </p>

        <section className="mt-8 rounded-[28px] border border-slate-200 bg-white p-5 shadow-xl sm:p-7">
          <div className="grid grid-cols-2 gap-2 rounded-2xl bg-slate-100 p-1">
            <button
              type="button"
              onClick={() => { setMode("phone"); setError(""); setMessage(""); }}
              className={`rounded-xl px-3 py-3 text-xs font-black ${mode === "phone" ? "bg-white text-blue-600 shadow-sm" : "text-slate-500"}`}
            >
              📱 Mobile OTP
            </button>
            <button
              type="button"
              onClick={() => { setMode("admin"); setError(""); setMessage(""); }}
              className={`rounded-xl px-3 py-3 text-xs font-black ${mode === "admin" ? "bg-white text-orange-600 shadow-sm" : "text-slate-500"}`}
            >
              🔐 Admin
            </button>
          </div>

          {mode === "phone" ? (
            <>
              <h1 className="mt-7 text-2xl font-black">Login / Register</h1>
              <p className="mt-1 text-xs text-slate-500">
                Email या password की जरूरत नहीं. Mobile OTP से account बनाएं.
              </p>

              <label className="mt-6 block text-xs font-black text-slate-700">
                Mobile Number
              </label>
              <div className="mt-2 flex overflow-hidden rounded-2xl border border-slate-200 bg-slate-50">
                <span className="flex items-center border-r border-slate-200 px-3 text-sm font-black text-slate-500">+91</span>
                <input
                  value={phone.replace(/^\+91/, "")}
                  onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
                  inputMode="numeric"
                  placeholder="9876543210"
                  className="h-14 w-full bg-transparent px-4 text-base font-bold outline-none"
                />
              </div>

              {!otpSent ? (
                <button
                  type="button"
                  onClick={sendOtp}
                  disabled={busy}
                  className="mt-4 w-full rounded-2xl bg-blue-600 py-3.5 text-sm font-black text-white disabled:opacity-60"
                >
                  {busy ? "Sending OTP..." : "Send OTP"}
                </button>
              ) : (
                <>
                  <label className="mt-5 block text-xs font-black text-slate-700">6 Digit OTP</label>
                  <input
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                    inputMode="numeric"
                    placeholder="123456"
                    className="mt-2 h-14 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 text-center text-xl font-black tracking-[0.35em] outline-none"
                  />
                  <button
                    type="button"
                    onClick={verifyOtp}
                    disabled={busy}
                    className="mt-4 w-full rounded-2xl bg-blue-600 py-3.5 text-sm font-black text-white disabled:opacity-60"
                  >
                    {busy ? "Verifying..." : "Verify OTP & Continue"}
                  </button>
                  <button
                    type="button"
                    onClick={() => { setOtpSent(false); setOtp(""); }}
                    className="mt-3 w-full py-2 text-xs font-bold text-slate-500"
                  >
                    Change mobile number
                  </button>
                </>
              )}
            </>
          ) : (
            <>
              <h1 className="mt-7 text-2xl font-black">Admin Login</h1>
              <p className="mt-1 text-xs text-slate-500">
                Admin account के लिए email/password इस्तेमाल करें.
              </p>

              <input
                value={adminEmail}
                onChange={(e) => setAdminEmail(e.target.value)}
                type="email"
                placeholder="Admin email"
                className="mt-6 h-14 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm font-semibold outline-none"
              />
              <input
                value={adminPassword}
                onChange={(e) => setAdminPassword(e.target.value)}
                type="password"
                placeholder="Admin password"
                className="mt-3 h-14 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm font-semibold outline-none"
              />
              <button
                type="button"
                onClick={adminLogin}
                disabled={busy}
                className="mt-4 w-full rounded-2xl bg-orange-500 py-3.5 text-sm font-black text-white disabled:opacity-60"
              >
                {busy ? "Signing in..." : "Admin Login"}
              </button>
            </>
          )}

          {message && <p className="mt-4 rounded-xl bg-emerald-50 p-3 text-xs font-bold text-emerald-700">{message}</p>}
          {error && <p className="mt-4 rounded-xl bg-red-50 p-3 text-xs font-bold text-red-700">{error}</p>}
        </section>
      </div>
    </main>
  );
}
