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
});

const ADMIN_EMAIL = "architectsunlight@gmail.com";

export default function LoginPage() {
  const router = useRouter();

  const [mode, setMode] = useState<"login" | "register" | "admin">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [adminEmail, setAdminEmail] = useState("");
  const [adminPassword, setAdminPassword] = useState("");

  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  function clearStatus() {
    setError("");
    setMessage("");
  }

  function validEmail(value: string) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
  }

  async function loginUser() {
    clearStatus();

    const cleanEmail = email.trim().toLowerCase();

    if (!validEmail(cleanEmail)) {
      setError("Valid email address डालें.");
      return;
    }

    if (password.length < 6) {
      setError("Password कम से कम 6 characters का होना चाहिए.");
      return;
    }

    setBusy(true);

    const { error: loginError } = await supabase.auth.signInWithPassword({
      email: cleanEmail,
      password,
    });

    setBusy(false);

    if (loginError) {
      if (
        loginError.message.toLowerCase().includes("invalid login credentials")
      ) {
        setError("Email या password गलत है.");
      } else {
        setError(loginError.message);
      }
      return;
    }

    router.replace("/list-business");
  }

  async function registerUser() {
    clearStatus();

    const cleanEmail = email.trim().toLowerCase();

    if (!validEmail(cleanEmail)) {
      setError("Valid email address डालें.");
      return;
    }

    if (password.length < 6) {
      setError("Password कम से कम 6 characters का होना चाहिए.");
      return;
    }

    if (password !== confirmPassword) {
      setError("दोनों passwords match नहीं कर रहे.");
      return;
    }

    setBusy(true);

    const { data, error: signupError } = await supabase.auth.signUp({
      email: cleanEmail,
      password,
      options: {
        data: {
          account_type: "business_owner",
        },
      },
    });

    setBusy(false);

    if (signupError) {
      if (signupError.message.toLowerCase().includes("already registered")) {
        setError("यह email पहले से registered है. Login करें.");
      } else {
        setError(signupError.message);
      }
      return;
    }

    if (data.session) {
      router.replace("/list-business");
      return;
    }

    setMessage(
      "Registration successful. अब इसी email और password से Login करें."
    );
    setMode("login");
    setPassword("");
    setConfirmPassword("");
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
      setError("यह account admin के रूप में authorized नहीं है.");
      return;
    }

    router.replace("/admin");
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-blue-50 via-white to-orange-50 px-4 pb-16 pt-8">
      <div className="mx-auto max-w-md">

        <Link
          href="/"
          className="block text-center text-3xl font-black tracking-tight"
        >
          <span className="text-blue-600">Local</span>
          <span className="text-orange-500">Platform</span>
        </Link>

        <p className="mt-2 text-center text-xs font-semibold text-slate-500">
          Find Local • Support Local • Grow Local
        </p>

        <section className="mt-7 rounded-[28px] border border-slate-200 bg-white p-5 shadow-xl sm:p-7">

          {/* USER LOGIN / REGISTER */}
          {mode !== "admin" && (
            <>
              <div className="grid grid-cols-2 gap-1 rounded-2xl bg-slate-100 p-1">
                <button
                  type="button"
                  onClick={() => {
                    setMode("login");
                    clearStatus();
                  }}
                  className={`rounded-xl py-3 text-sm font-black ${
                    mode === "login"
                      ? "bg-white text-blue-600 shadow-sm"
                      : "text-slate-500"
                  }`}
                >
                  Login
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setMode("register");
                    clearStatus();
                  }}
                  className={`rounded-xl py-3 text-sm font-black ${
                    mode === "register"
                      ? "bg-white text-blue-600 shadow-sm"
                      : "text-slate-500"
                  }`}
                >
                  Register
                </button>
              </div>

              <h1 className="mt-7 text-2xl font-black">
                {mode === "login"
                  ? "Welcome Back"
                  : "Create Business Account"}
              </h1>

              <p className="mt-1 text-xs leading-5 text-slate-500">
                {mode === "login"
                  ? "Email और password से तुरंत login करें."
                  : "Business owner के लिए simple और free registration."}
              </p>

              <label className="mt-6 block text-xs font-black text-slate-700">
                Email Address
              </label>

              <input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                type="email"
                autoComplete="email"
                placeholder="business@example.com"
                className="mt-2 h-14 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm font-semibold outline-none transition focus:border-blue-400 focus:bg-white"
              />

              <label className="mt-4 block text-xs font-black text-slate-700">
                Password
              </label>

              <input
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                type="password"
                autoComplete={
                  mode === "register" ? "new-password" : "current-password"
                }
                placeholder="Minimum 6 characters"
                className="mt-2 h-14 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm font-semibold outline-none transition focus:border-blue-400 focus:bg-white"
              />

              {mode === "register" && (
                <>
                  <label className="mt-4 block text-xs font-black text-slate-700">
                    Confirm Password
                  </label>

                  <input
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    type="password"
                    autoComplete="new-password"
                    placeholder="Enter password again"
                    className="mt-2 h-14 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm font-semibold outline-none transition focus:border-blue-400 focus:bg-white"
                  />
                </>
              )}

              <button
                type="button"
                onClick={mode === "login" ? loginUser : registerUser}
                disabled={busy}
                className="mt-5 w-full rounded-2xl bg-blue-600 py-4 text-sm font-black text-white shadow-lg shadow-blue-100 transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {busy
                  ? "Please wait..."
                  : mode === "login"
                    ? "Login"
                    : "Create Account"}
              </button>

              <div className="mt-5 border-t border-slate-100 pt-4 text-center">
                <button
                  type="button"
                  onClick={() => {
                    setMode("admin");
                    clearStatus();
                  }}
                  className="text-xs font-bold text-slate-400 hover:text-orange-500"
                >
                  Admin Login
                </button>
              </div>
            </>
          )}

          {/* ADMIN */}
          {mode === "admin" && (
            <>
              <button
                type="button"
                onClick={() => {
                  setMode("login");
                  clearStatus();
                }}
                className="text-xs font-bold text-blue-600"
              >
                ← Back to User Login
              </button>

              <h1 className="mt-6 text-2xl font-black">
                Admin Login
              </h1>

              <p className="mt-1 text-xs text-slate-500">
                Authorized LocalPlatform administrator only.
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
                className="mt-4 w-full rounded-2xl bg-orange-500 py-4 text-sm font-black text-white disabled:opacity-60"
              >
                {busy ? "Signing in..." : "Admin Login"}
              </button>
            </>
          )}

          {message && (
            <p className="mt-4 rounded-xl bg-emerald-50 p-3 text-xs font-bold leading-5 text-emerald-700">
              {message}
            </p>
          )}

          {error && (
            <p className="mt-4 rounded-xl bg-red-50 p-3 text-xs font-bold leading-5 text-red-700">
              {error}
            </p>
          )}
        </section>

        <p className="mt-5 text-center text-[11px] leading-5 text-slate-400">
          By continuing, you agree to use LocalPlatform responsibly.
        </p>
      </div>
    </main>
  );
}
