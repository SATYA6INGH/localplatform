"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
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
  image_url: string | null;
};

export default function SearchPage() {
  const searchParams = useSearchParams();

  const initialCategory = searchParams.get("category") || "";
  const initialCity = searchParams.get("city") || "";

  const [query, setQuery] = useState("");
  const [city, setCity] = useState(initialCity);
  const [category, setCategory] = useState(initialCategory);

  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (initialCategory || initialCity) {
      searchBusinesses(initialCategory, initialCity, "");
    }
  }, []);

  async function searchBusinesses(
    selectedCategory = category,
    selectedCity = city,
    selectedQuery = query
  ) {
    setLoading(true);
    setError("");
    setSearched(true);

    try {
      let request = supabase
        .from("businesses")
        .select(
          "id, business_name, category, city, phone, image_url"
        );

      const searchText = selectedQuery.trim();
      const searchCategory = selectedCategory.trim();
      const searchCity = selectedCity.trim();

      if (searchText) {
        request = request.or(
          `business_name.ilike.%${searchText}%,category.ilike.%${searchText}%,city.ilike.%${searchText}%`
        );
      }

      if (searchCategory) {
        request = request.ilike(
          "category",
          `%${searchCategory}%`
        );
      }

      if (searchCity) {
        request = request.ilike(
          "city",
          `%${searchCity}%`
        );
      }

      const { data, error } = await request
        .order("created_at", { ascending: false })
        .limit(50);

      if (error) {
        setError(error.message);
        setBusinesses([]);
      } else {
        setBusinesses(data || []);
      }
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Search failed. Please try again."
      );
      setBusinesses([]);
    }

    setLoading(false);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    searchBusinesses(category, city, query);
  }

  function clearSearch() {
    setQuery("");
    setCity("");
    setCategory("");
    setBusinesses([]);
    setSearched(false);
    setError("");
  }

  return (
    <main className="min-h-screen bg-gray-50">
      {/* HEADER */}
      <header className="border-b bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
          <a href="/" className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-600 text-xl font-extrabold text-white">
              L
            </div>

            <div>
              <div className="text-xl font-bold">
                LocalPlatform
              </div>

              <div className="text-xs text-gray-500">
                Find. Connect. Grow.
              </div>
            </div>
          </a>

          <div className="flex gap-3">
            <a
              href="/"
              className="rounded-xl border px-5 py-3 font-semibold hover:bg-gray-50"
            >
              Home
            </a>

            <a
              href="/list-business"
              className="rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white hover:bg-blue-700"
            >
              List Your Business
            </a>
          </div>
        </div>
      </header>

      {/* HERO / SEARCH */}
      <section className="bg-gradient-to-r from-blue-700 to-indigo-700 py-16 text-white">
        <div className="mx-auto max-w-6xl px-6">
          <div className="text-center">
            <h1 className="text-4xl font-bold md:text-5xl">
              Find Local Businesses
            </h1>

            <p className="mt-4 text-blue-100">
              Search businesses, professionals and services
              near you.
            </p>
          </div>

          <form
            onSubmit={handleSubmit}
            className="mx-auto mt-10 max-w-5xl rounded-2xl bg-white p-4 shadow-xl"
          >
            <div className="grid gap-3 md:grid-cols-4">
              {/* SEARCH */}
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Business / service"
                className="h-14 rounded-xl border border-gray-300 px-4 text-gray-900 outline-none focus:border-blue-600"
              />

              {/* CATEGORY */}
              <input
                type="text"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                placeholder="Category"
                className="h-14 rounded-xl border border-gray-300 px-4 text-gray-900 outline-none focus:border-blue-600"
              />

              {/* CITY */}
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="City"
                className="h-14 rounded-xl border border-gray-300 px-4 text-gray-900 outline-none focus:border-blue-600"
              />

              <button
                type="submit"
                disabled={loading}
                className="h-14 rounded-xl bg-blue-600 font-bold text-white hover:bg-blue-700 disabled:opacity-60"
              >
                {loading ? "Searching..." : "Search"}
              </button>
            </div>
          </form>
        </div>
      </section>

      {/* RESULTS */}
      <section className="mx-auto max-w-6xl px-6 py-12">
        <div className="mb-8 flex items-center justify-between gap-4">
          <div>
            <h2 className="text-3xl font-bold text-gray-900">
              Search Results
            </h2>

            <p className="mt-2 text-gray-500">
              {searched
                ? `${businesses.length} businesses found`
                : "Search for a business, category or city"}
            </p>
          </div>

          {searched && (
            <button
              onClick={clearSearch}
              className="rounded-xl border border-gray-300 bg-white px-5 py-3 font-semibold hover:bg-gray-50"
            >
              Clear Search
            </button>
          )}
        </div>

        {/* ERROR */}
        {error && (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-red-700">
            {error}
          </div>
        )}

        {/* LOADING */}
        {loading && (
          <div className="rounded-2xl border bg-white p-12 text-center">
            <p className="text-gray-500">
              Searching businesses...
            </p>
          </div>
        )}

        {/* NO RESULTS */}
        {!loading && searched && businesses.length === 0 && (
          <div className="rounded-2xl border border-dashed bg-white p-14 text-center">
            <div className="text-5xl">🔍</div>

            <h3 className="mt-5 text-2xl font-bold text-gray-900">
              No businesses found
            </h3>

            <p className="mt-2 text-gray-500">
              Try another business name, category or city.
            </p>

            <a
              href="/list-business"
              className="mt-7 inline-block rounded-xl bg-blue-600 px-6 py-3 font-bold text-white hover:bg-blue-700"
            >
              List Your Business
            </a>
          </div>
        )}

        {/* RESULTS CARDS */}
        {!loading && businesses.length > 0 && (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {businesses.map((business) => (
              <div
                key={business.id}
                className="overflow-hidden rounded-2xl border bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
              >
                {/* IMAGE */}
                {business.image_url ? (
                  <img
                    src={business.image_url}
                    alt={business.business_name}
                    className="h-52 w-full object-cover"
                  />
                ) : (
                  <div className="flex h-52 items-center justify-center bg-gray-100 text-5xl">
                    🏢
                  </div>
                )}

                <div className="p-6">
                  <p className="text-sm font-semibold uppercase text-blue-600">
                    {business.category}
                  </p>

                  <h3 className="mt-2 text-2xl font-bold text-gray-900">
                    {business.business_name}
                  </h3>

                  <p className="mt-3 text-gray-600">
                    📍 {business.city}
                  </p>

                  {business.phone && (
                    <p className="mt-2 text-gray-500">
                      📞 {business.phone}
                    </p>
                  )}

                  <a
                    href={`/business/${business.id}`}
                    className="mt-6 block rounded-xl bg-black px-5 py-3 text-center font-bold text-white hover:bg-gray-800"
                  >
                    View Details
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* FOOTER */}
      <footer className="border-t bg-gray-900 py-10 text-white">
        <div className="mx-auto max-w-6xl px-6 text-center">
          <h3 className="text-2xl font-bold">
            LocalPlatform
          </h3>

          <p className="mt-2 text-gray-400">
            Find. Connect. Grow.
          </p>

          <div className="mt-5 flex justify-center gap-6 text-sm">
            <a href="/" className="hover:text-blue-400">
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

          <p className="mt-6 text-xs text-gray-500">
            © 2026 LocalPlatform. All Rights Reserved.
          </p>
        </div>
      </footer>
    </main>
  );
}