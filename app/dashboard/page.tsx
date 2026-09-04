"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
);

type Business = {
  id: string;
  business_name: string;
  category: string;
  city: string;
  phone: string;
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
    async function loadDashboard() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push("/login");
        return;
      }

      setUserEmail(user.email || "");
      setUserId(user.id);

      const { data, error } = await supabase
        .from("businesses")
        .select("id, business_name, category, city, phone")
        .eq("owner_id", user.id)
        .order("business_name", { ascending: true });

      if (error) {
        setError(error.message);
      } else {
        setBusinesses(data || []);
      }

      setLoading(false);
    }

    loadDashboard();
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
      setBusinesses((prev) => prev.filter((business) => business.id !== id));
    }

    setDeletingId(null);
  }

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push("/login");
  }

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-gray-600">Loading dashboard...</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50">
      {/* HEADER */}
      <header className="bg-white border-b">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link
            href="/"
            className="text-2xl font-bold text-blue-600"
          >
            LocalPlatform
          </Link>

          <div className="flex items-center gap-4">
            <Link
              href="/list-business"
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
            >
              + Add Business
            </Link>

            <button
              onClick={handleLogout}
              className="border border-gray-300 px-4 py-2 rounded-lg hover:bg-gray-100"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* CONTENT */}
      <section className="max-w-6xl mx-auto px-6 py-10">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Business Dashboard
          </h1>

          <p className="text-gray-600 mt-2">
            Welcome, {userEmail}
          </p>
        </div>

        {/* STATS */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-10">
          <div className="bg-white rounded-xl border p-6">
            <p className="text-gray-500 text-sm">Total Businesses</p>
            <p className="text-3xl font-bold mt-2">
              {businesses.length}
            </p>
          </div>

          <div className="bg-white rounded-xl border p-6">
            <p className="text-gray-500 text-sm">Account</p>
            <p className="text-lg font-semibold mt-2">
              Business Owner
            </p>
          </div>

          <div className="bg-white rounded-xl border p-6">
            <p className="text-gray-500 text-sm">Status</p>
            <p className="text-lg font-semibold text-green-600 mt-2">
              Active
            </p>
          </div>
        </div>

        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        {/* BUSINESSES */}
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-2xl font-bold text-gray-900">
            My Businesses
          </h2>

          <Link
            href="/list-business"
            className="text-blue-600 font-medium hover:underline"
          >
            Add New
          </Link>
        </div>

        {businesses.length === 0 ? (
          <div className="bg-white border rounded-xl p-10 text-center">
            <h3 className="text-xl font-semibold text-gray-900">
              No businesses listed yet
            </h3>

            <p className="text-gray-500 mt-2 mb-6">
              Add your first business to LocalPlatform.
            </p>

            <Link
              href="/list-business"
              className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700"
            >
              List Your Business
            </Link>
          </div>
        ) : (
          <div className="grid gap-5">
            {businesses.map((business) => (
              <div
                key={business.id}
                className="bg-white border rounded-xl p-6"
              >
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-5">
                  {/* INFO */}
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">
                      {business.business_name}
                    </h3>

                    <p className="text-gray-600 mt-1">
                      {business.category}
                    </p>

                    <p className="text-gray-500 mt-1">
                      {business.city}
                    </p>

                    {business.phone && (
                      <p className="text-gray-500 mt-1">
                        {business.phone}
                      </p>
                    )}
                  </div>

                  {/* ACTIONS */}
                  <div className="flex flex-wrap gap-3">
                    <Link
                      href={`/business/${business.id}`}
                      className="px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-100"
                    >
                      View
                    </Link>

                    <Link
                      href={`/edit-business/${business.id}`}
                      className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700"
                    >
                      Edit
                    </Link>

                    <button
                      onClick={() => handleDelete(business.id)}
                      disabled={deletingId === business.id}
                      className="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 disabled:opacity-50"
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