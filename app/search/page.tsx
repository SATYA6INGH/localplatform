"use client";

import { useEffect, useState } from "react";
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
};

export default function HomePage() {
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const { data, error } = await supabase
        .from("businesses")
        .select("id, business_name, category, city")
        .order("created_at", { ascending: false })
        .limit(6);

      if (!error) {
        setBusinesses(data || []);
      }

      setLoading(false);
    }

    load();
  }, []);

  return (
    <main className="min-h-screen bg-gray-50">
      {/* HEADER */}
      <header className="border-b bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
          <div>
            <h1 className="text-3xl font-bold text-blue-700">
              LocalPlatform
            </h1>

            <p className="text-sm text-gray-500">
              Find • Connect • Grow
            </p>
          </div>

          <div className="flex gap-3">
            <a
              href="/search"
              className="rounded-xl border px-5 py-3 font-semibold hover:bg-gray-50"
            >
              Search
            </a>

            <a
              href="/list-business"
              className="rounded-xl bg-black px-5 py-3 font-semibold text-white hover:bg-gray-800"
            >
              List Business
            </a>
          </div>
        </div>
      </header>

      {/* HERO */}
      <section className="bg-gradient-to-r from-blue-700 to-blue-500 py-24 text-white">
        <div className="mx-auto max-w-4xl px-6 text-center">
          <h2 className="text-5xl font-bold leading-tight">
            Discover Local Businesses
          </h2>

          <p className="mt-6 text-lg text-blue-100">
            Search architects, restaurants, salons, shops and services in your city.
          </p>

          <div className="mt-10 flex justify-center gap-4">
            <a
              href="/search"
              className="rounded-xl bg-white px-8 py-4 font-bold text-blue-700"
            >
              🔍 Find Business
            </a>

            <a
              href="/list-business"
              className="rounded-xl border border-white px-8 py-4 font-bold text-white"
            >
              ➕ List Business
            </a>
          </div>
        </div>
      </section>

      {/* CATEGORIES */}
      <section className="mx-auto max-w-6xl px-6 py-16">
        <h3 className="mb-8 text-center text-3xl font-bold">
          Popular Categories
        </h3>

        <div className="grid gap-5 md:grid-cols-4">
          {[
            "Architect",
            "Restaurant",
            "Salon",
            "Doctor",
            "Gym",
            "School",
            "Electrician",
            "Plumber",
          ].map((item) => (
            <a
              key={item}
              href={`/search?category=${encodeURIComponent(item)}`}
              className="rounded-2xl bg-white p-6 text-center font-semibold shadow transition hover:-translate-y-1 hover:shadow-lg"
            >
              {item}
            </a>
          ))}
        </div>
      </section>

      {/* RECENT BUSINESSES */}
      <section className="bg-white py-16">
        <div className="mx-auto max-w-6xl px-6">
          <div className="mb-8 flex items-center justify-between">
            <h3 className="text-3xl font-bold">
              Recent Listings
            </h3>

            <a
              href="/search"
              className="font-semibold text-blue-700"
            >
              View All →
            </a>
          </div>

          {loading ? (
            <div className="py-10 text-center text-gray-500">
              Loading businesses...
            </div>
          ) : businesses.length === 0 ? (
            <div className="rounded-2xl border bg-gray-50 p-10 text-center">
              <p className="text-gray-500">
                No businesses listed yet.
              </p>

              <a
                href="/list-business"
                className="mt-5 inline-block rounded-xl bg-blue-700 px-6 py-3 font-semibold text-white"
              >
                List Your Business
              </a>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {businesses.map((business) => (
                <div
                  key={business.id}
                  className="rounded-2xl border bg-gray-50 p-6 transition hover:shadow-lg"
                >
                  <h4 className="text-xl font-bold">
                    {business.business_name}
                  </h4>

                  <p className="mt-2 font-medium text-blue-700">
                    {business.category}
                  </p>

                  <p className="mt-3 text-gray-600">
                    📍 {business.city}
                  </p>

                  <a
                    href={`/business/${business.id}`}
                    className="mt-5 inline-block rounded-xl bg-black px-5 py-3 font-semibold text-white"
                  >
                    View Details
                  </a>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t bg-gray-900 py-12 text-white">
        <div className="mx-auto max-w-6xl px-6 text-center">
          <h3 className="text-2xl font-bold">
            LocalPlatform
          </h3>

          <p className="mt-3 text-gray-400">
            Helping local businesses reach more customers.
          </p>

          <div className="mt-6 flex justify-center gap-6">
            <a
              href="/"
              className="hover:text-blue-400"
            >
              Home
            </a>

            <a
              href="/search"
              className="hover:text-blue-400"
            >
              Search
            </a>

            <a
              href="/list-business"
              className="hover:text-blue-400"
            >
              List Business
            </a>
          </div>

          <p className="mt-8 text-sm text-gray-500">
            © 2026 LocalPlatform. All Rights Reserved.
          </p>
        </div>
      </footer>
    </main>
  );
}