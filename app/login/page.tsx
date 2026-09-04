"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
);

export default function LoginPage() {
  const [isSignup, setIsSignup] = useState(false);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setLoading(true);
    setMessage("");
    setErrorMessage("");

    if (!email || !password) {
      setErrorMessage("Please enter email and password.");
      setLoading(false);
      return;
    }

    if (password.length < 6) {
      setErrorMessage("Password must be at least 6 characters.");
      setLoading(false);
      return;
    }

    if (isSignup) {
      const { error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
      });

      if (error) {
        setErrorMessage(error.message);
      } else {
        setMessage(
          "Account created successfully. Please check your email to confirm your account."
        );
        setEmail("");
        setPassword("");
      }
    } else {
      const { error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (error) {
        setErrorMessage(error.message);
      } else {
        window.location.href = "/list-business";
      }
    }

    setLoading(false);
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
              <div className="text-xl font-bold">
                LocalPlatform
              </div>

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


      {/* LOGIN / SIGNUP */}
      <section className="flex min-h-[calc(100vh-82px)] items-center justify-center px-5 py-12">

        <div className="w-full max-w-md">

          <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-xl md:p-10">

            <div className="text-center">

              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-600 text-2xl font-extrabold text-white">
                L
              </div>

              <h1 className="mt-6 text-3xl font-bold">
                {isSignup
                  ? "Create Your Account"
                  : "Welcome Back"}
              </h1>

              <p className="mt-2 text-sm text-slate-500">
                {isSignup
                  ? "Create an account to manage your business listing."
                  : "Login to manage your LocalPlatform business."}
              </p>

            </div>


            {/* MESSAGE */}
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


            {/* FORM */}
            <form
              onSubmit={handleSubmit}
              className="mt-8 space-y-5"
            >

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
                  className="h-14 w-full rounded-xl border border-slate-300 px-4 outline-none transition focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
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
                  className="h-14 w-full rounded-xl border border-slate-300 px-4 outline-none transition focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
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


            {/* SWITCH */}
            <div className="mt-7 text-center text-sm text-slate-500">

              {isSignup
                ? "Already have an account?"
                : "Don't have an account?"}

              <button
                type="button"
                onClick={() => {
                  setIsSignup(!isSignup);
                  setMessage("");
                  setErrorMessage("");
                }}
                className="ml-2 font-bold text-blue-600 hover:text-blue-700"
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