"use client";

import { useState } from "react";
import { createClient } from "@supabase/supabase-js";
import { useRouter } from "next/navigation";
import Link from "next/link";

const SUPABASE_URL =
  process.env.NEXT_PUBLIC_SUPABASE_URL ||
  "https://ckuiskbegrlrethnlhzq.supabase.co";

const SUPABASE_KEY =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
  "sb_publishable_RnrbgHC56vWK6cSA1hmfkA_VVP74VPL";

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
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

  const [mode, setMode] = useState<"email" | "admin">("email");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");

  const [adminEmail, setAdminEmail] = useState("");
  const [adminPassword, setAdminPassword] = useState("");

  const [otpSent, setOtpSent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  function clearStatus() {
    setError("");
    setMessage("");
  }

  async function sendOtp() {
    clearStatus();

    const cleanEmail = email.trim().toLowerCase();

    if (!cleanEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
      setError("Valid email address डालें.");
      return;
    }

    setBusy(true);

    const { error: otpError } = await supabase.auth.signInWithOtp({
      email: cleanEmail,
      options: {
        shouldCreateUser: true,
      },
    });

    setBusy(false);

    if (otpError) {
      setError(
        otpError.message === "Failed to fetch"
          ? "Supabase से connection नहीं हो पा रहा. Internet और Supabase URL/Key check करें."
          : otpError.message
      );
      return;
    }

    setOtpSent(true);
    setMessage("OTP आपके email पर भेज दिया गया है.");
  }

  async function verifyOtp() {
    clearStatus();

    const cleanEmail = email.trim().toLowerCase();

    if (!cleanEmail) {
      setError("Email address डालें.");
      return;
    }

    if (!/^\d{8}$/.test(otp)) {
      setError("8 digit OTP डालें.");
      return;
    }

    setBusy(true);

    const { data, error: verifyError } = await supabase.auth.verifyOtp({
      email: cleanEmail,
      token: otp,
      type: "email",
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
    clearStatus();

    const cleanAdminEmail = adminEmail.trim().toLowerCase();

    if (cleanAdminEmail !== ADMIN_EMAIL) {
      setError(`Admin login सिर्फ ${ADMIN_EMAIL} के लिए है.`);
      return;
    }

    if (!adminPassword) {
      setError("Admin password डालें.");
      return;
    }

    setBusy(true);

    const { data, error: loginError } =
      await supabase.auth.signInWithPassword({
        email: cleanAdminEmail,
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
        <Link
          href="/"
          className="block text-center text-3xl font-black tracking-tight"
        >
          <span className="text-blue-600">Local</span>
          <span className="text-orange-500">Platform</span>
        </Link>

        <p className="mt-2 text-center text-xs font-semibold text-slate-500">
          Find local • Support local • Grow local
        </p>

        <section className="mt-8 rounded-[28px] border border-slate-200 bg-white p-5 shadow-xl sm:p-7">
          {/* MODE SWITCH */}
          <div className="grid grid-cols-2 gap-2 rounded-2xl bg-slate-100 p-1">
            <button
              type="button"
              onClick={() => {
                setMode("email");
                clearStatus();
              }}
              className={`rounded-xl px-3 py-3 text-xs font-black ${
                mode === "email"
                  ? "bg-white text-blue-600 shadow-sm"
                  : "text-slate-500"
              }`}
            >
              ✉️ Email OTP
            </button>

            <button
              type="button"
              onClick={() => {
                setMode("admin");
                clearStatus();
              }}
              className={`rounded-xl px-3 py-3 text-xs font-black ${
                mode === "admin"
                  ? "bg-white text-orange-600 shadow-sm"
                  : "text-slate-500"
              }`}
            >
              🔐 Admin
            </button>
          </div>

          {mode === "email" ? (
            <>
              <h1 className="mt-7 text-2xl font-black">
                Login / Register
              </h1>

              <p className="mt-1 text-xs text-slate-500">
                Mobile number की जरूरत नहीं. Email OTP से account बनाएं या
                login करें.
              </p>

              <label className="mt-6 block text-xs font-black text-slate-700">
                Email Address
              </label>

              <input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                type="email"
                autoComplete="email"
                placeholder="you@example.com"
                disabled={otpSent}
                className="mt-2 h-14 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm font-semibold outline-none focus:border-blue-400 disabled:opacity-70"
              />

              {!otpSent ? (
                <button
                  type="button"
                  onClick={sendOtp}
                  disabled={busy}
                  className="mt-4 w-full rounded-2xl bg-blue-600 py-3.5 text-sm font-black text-white disabled:opacity-60"
                >
                  {busy ? "Sending OTP..." : "Send Email OTP"}
                </button>
              ) : (
                <>
                  <label className="mt-5 block text-xs font-black text-slate-700">
                    8 Digit OTP
                  </label>

                  <input
                    value={otp}
                    onChange={(e) =>
                      setOtp(e.target.value.replace(/\D/g, "").slice(0, 8))
                    }
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    placeholder="12345678"
                    className="mt-2 h-14 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 text-center text-xl font-black tracking-[0.25em] outline-none focus:border-blue-400"
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
                    onClick={() => {
                      setOtpSent(false);
                      setOtp("");
                      clearStatus();
                    }}
                    className="mt-3 w-full py-2 text-xs font-bold text-slate-500"
                  >
                    Change email address
                  </button>
                </>
              )}
            </>
          ) : (
            <>
              <h1 className="mt-7 text-2xl font-black">
                Admin Login
              </h1>

              <p className="mt-1 text-xs text-slate-500">
                Admin account के लिए email/password इस्तेमाल करें.
              </p>

              <input
                value={adminEmail}
                onChange={(e) => setAdminEmail(e.target.value)}
                type="email"
                autoComplete="username"
                placeholder="Admin email"
                className="mt-6 h-14 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm font-semibold outline-none focus:border-orange-400"
              />

              <input
                value={adminPassword}
                onChange={(e) => setAdminPassword(e.target.value)}
                type="password"
                autoComplete="current-password"
                placeholder="Admin password"
                className="mt-3 h-14 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm font-semibold outline-none focus:border-orange-400"
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

          {message && (
            <p className="mt-4 rounded-xl bg-emerald-50 p-3 text-xs font-bold text-emerald-700">
              {message}
            </p>
          )}

          {error && (
            <p className="mt-4 rounded-xl bg-red-50 p-3 text-xs font-bold text-red-700">
              {error}
            </p>
          )}
        </section>
      </div>
    </main>
  );
}
