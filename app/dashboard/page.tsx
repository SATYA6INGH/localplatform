"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@supabase/supabase-js";

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

type Business = {
  id: string;
  business_name: string;
  category: string;
  city: string;
  phone: string | null;
};

export default function DashboardPage() {
  const router = useRouter();

  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [userEmail, setUserEmail] = useState("");
  const [userId, setUserId] = useState("");
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;

    async function loadDashboard() {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (!mounted) return;

        if (!session?.user) {
          router.replace("/login");
          return;
        }

        const user = session.user;

        setUserEmail(user.email || "");
        setUserId(user.id);

        const { data, error } = await supabase
          .from("businesses")
          .select("id, business_name, category, city, phone")
          .eq("owner_id", user.id)
          .order("business_name", { ascending: true });

        if (!mounted) return;

        if (error) {
          setError(error.message);
        } else {
          setBusinesses(data || []);
        }

        setLoading(false);
      } catch (err) {
        if (!mounted) return;

        setError(
          err instanceof Error
            ? err.message
            : "Dashboard load नहीं हो सका।"
        );

        setLoading(false);
      }
    }

    loadDashboard();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!mounted) return;

      if (!session?.user) {
        router.replace("/login");
        return;
      }

      setUserEmail(session.user.email || "");
      setUserId(session.user.id);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [router]);

  async function handleDelete(id: string) {
    const confirmed = window.confirm(
      "Are you sure you want to delete this business?"
    );

    if (!confirmed) return;

    setDeletingId(id);
    setError("");

    const { error } = await supabase
      .from("businesses")
      .delete()
      .eq("id", id)
      .eq("owner_id", userId);

    if (error) {
      setError(error.message);
    } else {
      setBusinesses((prev) =>
        prev.filter((business) => business.id !== id)
      );
    }

    setDeletingId(null);
  }

  async function handleLogout() {
    await supabase.auth.signOut();
    router.replace("/login");
  }

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
        <p className="text-gray-600">Loading dashboard...</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50">
      {/* DASHBOARD CONTENT */}
      <section className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 sm:py-10">
        
        {/* TOP BAR */}
        <div className="mb-8 flex flex-col gap-4 rounded-2xl bg-white p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">
              Business Dashboard
            </h1>

            <p className="mt-2 break-all text-sm text-gray-600 sm:text-base">
              Welcome, {userEmail}
            </p>
          </div>

          <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
            <Link
              href="/list-business"
              className="rounded-lg bg-blue-600 px-4 py-3 text-center text-sm font-semibold text-white hover:bg-blue-700 sm:py-2"
            >
              + Add Business
            </Link>

            <button
              onClick={handleLogout}
              className="rounded-lg border border-gray-300 px-4 py-3 text-sm font-semibold hover:bg-gray-100 sm:py-2"
            >
              Logout
            </button>
          </div>
        </div>

        {/* STATS */}
        <div className="mb-10 grid grid-cols-1 gap-4 sm:grid-cols-3 sm:gap-5">
          <div className="rounded-xl border bg-white p-5 sm:p-6">
            <p className="text-sm text-gray-500">
              Total Businesses
            </p>

            <p className="mt-2 text-3xl font-bold">
              {businesses.length}
            </p>
          </div>

          <div className="rounded-xl border bg-white p-5 sm:p-6">
            <p className="text-sm text-gray-500">
              Account
            </p>

            <p className="mt-2 text-lg font-semibold">
              Business Owner
            </p>
          </div>

          <div className="rounded-xl border bg-white p-5 sm:p-6">
            <p className="text-sm text-gray-500">
              Status
            </p>

            <p className="mt-2 text-lg font-semibold text-green-600">
              Active
            </p>
          </div>
        </div>

        {/* ERROR */}
        {error && (
          <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {/* BUSINESS TITLE */}
        <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-2xl font-bold text-gray-900">
            My Businesses
          </h2>

          <Link
            href="/list-business"
            className="w-full rounded-lg border border-blue-600 px-4 py-2.5 text-center font-medium text-blue-600 hover:bg-blue-50 sm:w-auto"
          >
            Add New
          </Link>
        </div>

        {/* NO BUSINESSES */}
        {businesses.length === 0 ? (
          <div className="rounded-xl border bg-white p-6 text-center sm:p-10">
            <h3 className="text-xl font-semibold text-gray-900">
              No businesses listed yet
            </h3>

            <p className="mt-2 mb-6 text-gray-500">
              Add your first business to LocalPlatform.
            </p>

            <Link
              href="/list-business"
              className="inline-block w-full rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white hover:bg-blue-700 sm:w-auto"
            >
              List Your Business
            </Link>
          </div>
        ) : (
          /* BUSINESS LIST */
          <div className="grid gap-5">
            {businesses.map((business) => (
              <div
                key={business.id}
                className="rounded-xl border bg-white p-5 shadow-sm sm:p-6"
              >
                <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                  
                  {/* INFO */}
                  <div className="min-w-0">
                    <h3 className="break-words text-xl font-bold text-gray-900">
                      {business.business_name}
                    </h3>

                    <p className="mt-1 font-medium text-blue-600">
                      {business.category}
                    </p>

                    <p className="mt-2 text-gray-500">
                      📍 {business.city}
                    </p>

                    {business.phone && (
                      <p className="mt-1 break-all text-gray-500">
                        📞 {business.phone}
                      </p>
                    )}
                  </div>

                  {/* ACTIONS */}
                  <div className="grid w-full grid-cols-1 gap-2 sm:grid-cols-3 lg:w-auto">
                    <Link
                      href={`/business/${business.id}`}
                      className="rounded-lg border border-gray-300 px-4 py-3 text-center font-medium hover:bg-gray-100 sm:py-2"
                    >
                      View
                    </Link>

                    <Link
                      href={`/edit-business/${business.id}`}
                      className="rounded-lg bg-blue-600 px-4 py-3 text-center font-medium text-white hover:bg-blue-700 sm:py-2"
                    >
                      Edit
                    </Link>

                    <button
                      onClick={() => handleDelete(business.id)}
                      disabled={deletingId === business.id}
                      className="rounded-lg bg-red-600 px-4 py-3 font-medium text-white hover:bg-red-700 disabled:opacity-50 sm:py-2"
                    >
                      {deletingId === business.id
                        ? "Deleting..."
                        : "Delete"}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}