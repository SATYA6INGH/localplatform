"use client";

import { useEffect, useState, type FormEvent } from "react";
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

export default function LoginPage() {
  const [isSignup, setIsSignup] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const goAfterLogin = (userEmail: string | undefined) => {
    if (
      userEmail?.trim().toLowerCase() === ADMIN_EMAIL.toLowerCase()
    ) {
      window.location.replace("/admin");
    } else {
      window.location.replace("/list-business");
    }
  };

  useEffect(() => {
    const checkSession = async () => {
      const { data, error } = await supabase.auth.getSession();

      if (error) {
        console.error("SESSION ERROR:", error);
        return;
      }

      if (data.session?.user) {
        goAfterLogin(data.session.user.email);
      }
    };

    checkSession();
  }, []);

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
      // =========================
      // SIGN UP
      // =========================
      if (isSignup) {
        const { data, error } = await supabase.auth.signUp({
          email: cleanEmail,
          password,
        });

        console.log("SIGNUP DATA:", data);
        console.log("SIGNUP ERROR:", error);

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

        // Confirm Email OFF hone par session milega
        if (data.session) {
          goAfterLogin(data.user.email);
          return;
        }

        // Agar session nahi mila
        setMessage(
          "Account create ho gaya. Ab Login tab par jaakar isi email aur password se login karo."
        );

        setIsSignup(false);
        setPassword("");
        setLoading(false);
        return;
      }

      // =========================
      // LOGIN
      // =========================
      const { data, error } = await supabase.auth.signInWithPassword({
        email: cleanEmail,
        password,
      });

      console.log("LOGIN DATA:", data);
      console.log("LOGIN ERROR:", error);

      if (error) {
        setErrorMessage(error.message);
        setLoading(false);
        return;
      }

      if (!data.user || !data.session) {
        setErrorMessage("Login session nahi bani. Dobara try karo.");
        setLoading(false);
        return;
      }

      goAfterLogin(data.user.email);
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

      <section className="flex min-h-[calc(100vh-82px)] items-center justify-center px-5 py-12">
        <div className="w-full max-w-md">
          <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-xl md:p-10">
            <div className="text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-600 text-2xl font-extrabold text-white">
                L
              </div>

              <h1 className="mt-6 text-3xl font-bold">
                {isSignup ? "Create Your Account" : "Welcome Back"}
              </h1>

              <p className="mt-2 text-sm text-slate-500">
                {isSignup
                  ? "Create an account to manage your business listing."
                  : "Login to manage your LocalPlatform business."}
              </p>
            </div>

            {message && (
              <div className="mt-6 rounded-xl bg-green-50 p-4 text-sm font-medium text-green-700">
                {message}
              </div>
            )}

            {errorMessage && (
              <div className="mt-6 rounded-xl bg-red-50 p-4 text-sm font-medium text-red-700">
                {errorMessage}
              </div>
            )}

            <form onSubmit={handleSubmit} className="mt-8 space-y-5">
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Email Address
                </label>

                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  autoComplete="email"
                  disabled={loading}
                  className="h-14 w-full rounded-xl border border-slate-300 px-4 outline-none transition focus:border-blue-600 focus:ring-2 focus:ring-blue-100 disabled:bg-slate-100"
                />
              </div>

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

              <button
                type="submit"
                disabled={loading}
                className="h-14 w-full rounded-xl bg-blue-600 font-bold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading
                  ? "Please wait..."
                  : isSignup
                    ? "Create Account"
                    : "Login"}
              </button>
            </form>

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
          </div>

          <p className="mt-6 text-center text-xs text-slate-400">
            By continuing, you agree to use LocalPlatform responsibly.
          </p>
        </div>
      </section>
    </main>
  );
}