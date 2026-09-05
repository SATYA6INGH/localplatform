"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { createClient } from "@supabase/supabase-js";

const ADMIN_EMAIL = "architectsunlight@gmail.com";

const supabase = createClient(
  "https://ckuiskbegrlrethnlhzq.supabase.co",
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
      storageKey: "localplatform-auth",
    },
  }
);

type LoginMode = "user" | "admin";

export default function LoginPage() {
  const [mode, setMode] = useState<LoginMode>("user");
  const [isSignup, setIsSignup] = useState(false);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const switchMode = (newMode: LoginMode) => {
    setMode(newMode);
    setIsSignup(false);
    setEmail("");
    setPassword("");
    setMessage("");
    setErrorMessage("");
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (loading) return;

    setLoading(true);
    setMessage("");
    setErrorMessage("");

    const cleanEmail = email.trim().toLowerCase();

    if (!cleanEmail || !password) {
      setErrorMessage("Email aur password enter karo.");
      setLoading(false);
      return;
    }

    if (password.length < 6) {
      setErrorMessage("Password kam se kam 6 characters ka hona chahiye.");
      setLoading(false);
      return;
    }

    try {
      // ==========================================
      // ADMIN LOGIN
      // ==========================================
      if (mode === "admin") {
        if (cleanEmail !== ADMIN_EMAIL.toLowerCase()) {
          setErrorMessage(
            "Admin login ke liye sirf authorized admin email allowed hai."
          );
          setLoading(false);
          return;
        }

        const { data, error } = await supabase.auth.signInWithPassword({
          email: cleanEmail,
          password,
        });

        if (error) {
          setErrorMessage(error.message);
          setLoading(false);
          return;
        }

        if (!data.user || !data.session) {
          setErrorMessage("Admin login session create nahi hui.");
          setLoading(false);
          return;
        }

        // Database me admin authorization check
        const { data: admin, error: adminError } = await supabase
          .from("admin_users")
          .select("user_id")
          .eq("user_id", data.user.id)
          .maybeSingle();

        if (adminError) {
          console.error("ADMIN CHECK ERROR:", adminError);

          setErrorMessage(
            "Admin verification failed. Please try again."
          );

          setLoading(false);
          return;
        }

        if (!admin) {
          setErrorMessage(
            "Ye account admin ke roop me authorized nahi hai."
          );
          setLoading(false);
          return;
        }

        window.location.replace("/admin");
        return;
      }

      // ==========================================
      // USER SIGNUP
      // ==========================================
      if (isSignup) {
        const { data, error } = await supabase.auth.signUp({
          email: cleanEmail,
          password,
        });

        if (error) {
          setErrorMessage(error.message);
          setLoading(false);
          return;
        }

        if (!data.user) {
          setErrorMessage("Account create nahi ho paya.");
          setLoading(false);
          return;
        }

        // Email confirmation OFF hone par direct login
        if (data.session) {
          window.location.replace("/list-business");
          return;
        }

        setMessage(
          "Account create ho gaya. Ab Login par jaakar isi email aur password se login karo."
        );

        setIsSignup(false);
        setPassword("");
        setLoading(false);
        return;
      }

      // ==========================================
      // USER LOGIN
      // ==========================================
      const { data, error } = await supabase.auth.signInWithPassword({
        email: cleanEmail,
        password,
      });

      if (error) {
        setErrorMessage(error.message);
        setLoading(false);
        return;
      }

      if (!data.user || !data.session) {
        setErrorMessage("Login session create nahi hui.");
        setLoading(false);
        return;
      }

      // Normal user ko business listing page
      window.location.replace("/list-business");
    } catch (error) {
      console.error("AUTH ERROR:", error);

      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Something went wrong. Please try again."
      );

      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-50">
      {/* HEADER */}
      <header className="border-b bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4">
          <Link href="/" className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-600 text-xl font-extrabold text-white">
              L
            </div>

            <div>
              <div className="text-xl font-bold">LocalPlatform</div>
              <div className="text-xs text-slate-500">
                Find. Connect. Grow.
              </div>
            </div>
          </Link>

          <Link
            href="/"
            className="font-semibold text-slate-600 hover:text-blue-600"
          >
            Home
          </Link>
        </div>
      </header>

      {/* LOGIN AREA */}
      <section className="flex min-h-[calc(100vh-82px)] items-center justify-center px-5 py-12">
        <div className="w-full max-w-md">

          {/* MODE SWITCH */}
          <div className="mb-5 grid grid-cols-2 rounded-2xl border border-slate-200 bg-white p-1.5 shadow-sm">
            <button
              type="button"
              onClick={() => switchMode("user")}
              className={`rounded-xl py-3 text-sm font-bold transition ${
                mode === "user"
                  ? "bg-blue-600 text-white shadow"
                  : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              👤 User Login
            </button>

            <button
              type="button"
              onClick={() => switchMode("admin")}
              className={`rounded-xl py-3 text-sm font-bold transition ${
                mode === "admin"
                  ? "bg-slate-900 text-white shadow"
                  : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              🔐 Admin Login
            </button>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-xl md:p-10">

            {/* LOGO */}
            <div className="text-center">
              <div
                className={`mx-auto flex h-16 w-16 items-center justify-center rounded-2xl text-2xl font-extrabold text-white ${
                  mode === "admin"
                    ? "bg-slate-900"
                    : "bg-blue-600"
                }`}
              >
                {mode === "admin" ? "A" : "L"}
              </div>

              <h1 className="mt-6 text-3xl font-bold">
                {mode === "admin"
                  ? "Admin Login"
                  : isSignup
                    ? "Create Your Account"
                    : "Welcome Back"}
              </h1>

              <p className="mt-2 text-sm text-slate-500">
                {mode === "admin"
                  ? "Login to manage LocalPlatform."
                  : isSignup
                    ? "Create an account to manage your business listing."
                    : "Login to manage your LocalPlatform business."}
              </p>
            </div>

            {/* SUCCESS MESSAGE */}
            {message && (
              <div className="mt-6 rounded-xl bg-green-50 p-4 text-sm font-medium text-green-700">
                {message}
              </div>
            )}

            {/* ERROR MESSAGE */}
            {errorMessage && (
              <div className="mt-6 rounded-xl bg-red-50 p-4 text-sm font-medium text-red-700">
                {errorMessage}
              </div>
            )}

            {/* FORM */}
            <form onSubmit={handleSubmit} className="mt-8 space-y-5">

              {/* EMAIL */}
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Email Address
                </label>

                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={
                    mode === "admin"
                      ? "architectsunlight@gmail.com"
                      : "you@example.com"
                  }
                  autoComplete="email"
                  disabled={loading}
                  className="h-14 w-full rounded-xl border border-slate-300 px-4 outline-none transition focus:border-blue-600 focus:ring-2 focus:ring-blue-100 disabled:bg-slate-100"
                />
              </div>

              {/* PASSWORD */}
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Password
                </label>

                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  autoComplete={
                    isSignup ? "new-password" : "current-password"
                  }
                  disabled={loading}
                  className="h-14 w-full rounded-xl border border-slate-300 px-4 outline-none transition focus:border-blue-600 focus:ring-2 focus:ring-blue-100 disabled:bg-slate-100"
                />
              </div>

              {/* BUTTON */}
              <button
                type="submit"
                disabled={loading}
                className={`h-14 w-full rounded-xl font-bold text-white transition disabled:cursor-not-allowed disabled:opacity-60 ${
                  mode === "admin"
                    ? "bg-slate-900 hover:bg-slate-800"
                    : "bg-blue-600 hover:bg-blue-700"
                }`}
              >
                {loading
                  ? "Please wait..."
                  : mode === "admin"
                    ? "Admin Login"
                    : isSignup
                      ? "Create Account"
                      : "Login"}
              </button>
            </form>

            {/* USER SIGNUP */}
            {mode === "user" && (
              <div className="mt-7 text-center text-sm text-slate-500">
                {isSignup
                  ? "Already have an account?"
                  : "Don't have an account?"}

                <button
                  type="button"
                  disabled={loading}
                  onClick={() => {
                    setIsSignup(!isSignup);
                    setMessage("");
                    setErrorMessage("");
                  }}
                  className="ml-2 font-bold text-blue-600 hover:text-blue-700 disabled:opacity-50"
                >
                  {isSignup ? "Login" : "Create Account"}
                </button>
              </div>
            )}

            {/* ADMIN INFO */}
            {mode === "admin" && (
              <div className="mt-7 rounded-xl bg-slate-50 p-4 text-center text-xs text-slate-500">
                Authorized administrator access only.
              </div>
            )}
          </div>

          <p className="mt-6 text-center text-xs text-slate-400">
            By continuing, you agree to use LocalPlatform responsibly.
          </p>
        </div>
      </section>
    </main>
  );
}