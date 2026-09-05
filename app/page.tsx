"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
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

const categories = [
  { name: "Restaurants", icon: "🍽️" },
  { name: "Hotels", icon: "🏨" },
  { name: "Beauty & Spa", icon: "💆" },
  { name: "Home Decor", icon: "🛋️" },
  { name: "Wedding Planning", icon: "💍" },
  { name: "Education", icon: "🎓" },
  { name: "Rent & Hire", icon: "🔧" },
  { name: "Hospitals", icon: "🏥" },
  { name: "Contractors", icon: "👷" },
  { name: "Pet Shops", icon: "🐾" },
  { name: "PG/Hostels", icon: "🛏️" },
  { name: "Real Estate", icon: "🏠" },
  { name: "Dentists", icon: "🦷" },
  { name: "Gym", icon: "🏋️" },
  { name: "Loans", icon: "💰" },
  { name: "Event Organisers", icon: "🎉" },
];

export default function Home() {
  const [search, setSearch] = useState("");
  const [city, setCity] = useState("");
  const [results, setResults] = useState<Business[]>([]);
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [searched, setSearched] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadBusinesses() {
      const { data, error } = await supabase
        .from("businesses")
        .select("id, business_name, category, city, phone")
        .order("business_name", { ascending: true });

      if (!error) {
        setBusinesses(data || []);
      } else {
        console.error(error);
      }

      setLoading(false);
    }

    loadBusinesses();
  }, []);

  const handleSearch = () => {
    const searchText = search.trim().toLowerCase();
    const cityText = city.trim().toLowerCase();

    const filtered = businesses.filter((business) => {
      const name = business.business_name.toLowerCase();
      const category = business.category.toLowerCase();
      const businessCity = business.city.toLowerCase();

      const matchesSearch =
        !searchText ||
        name.includes(searchText) ||
        category.includes(searchText);

      const matchesCity =
        !cityText || businessCity.includes(cityText);

      return matchesSearch && matchesCity;
    });

    setResults(filtered);
    setSearched(true);

    setTimeout(() => {
      document
        .getElementById("search-results")
        ?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  };

  const handleCategorySearch = (category: string) => {
    setSearch(category);
    setCity("");

    const filtered = businesses.filter((business) =>
      business.category
        .toLowerCase()
        .includes(category.toLowerCase())
    );

    setResults(filtered);
    setSearched(true);

    setTimeout(() => {
      document
        .getElementById("search-results")
        ?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  };

  const clearSearch = () => {
    setSearch("");
    setCity("");
    setResults([]);
    setSearched(false);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  return (
    <main className="min-h-screen overflow-x-hidden bg-white text-slate-900">

      {/* HEADER */}
      <header className="sticky top-0 z-50 border-b bg-white/95 backdrop-blur">
        <div className="mx-auto flex h-[68px] w-full max-w-7xl items-center justify-between px-4 sm:px-6">

          <Link href="/" className="flex items-center">
            <div className="text-[25px] font-extrabold tracking-tight sm:text-3xl">
              <span className="text-blue-600">Local</span>
              <span className="text-orange-500">Platform</span>
            </div>
          </Link>

          <nav className="hidden items-center gap-7 md:flex">
            <Link
              href="/"
              className="font-semibold hover:text-blue-600"
            >
              Home
            </Link>

            <a
              href="#categories"
              className="font-semibold hover:text-blue-600"
            >
              Categories
            </a>

            <a
              href="#how-it-works"
              className="font-semibold hover:text-blue-600"
            >
              How It Works
            </a>
          </nav>

          <Link
            href="/list-business"
            className="rounded-xl bg-blue-600 px-3.5 py-2 text-xs font-bold text-white hover:bg-blue-700 sm:px-5 sm:py-2.5 sm:text-sm"
          >
            List Your Business
          </Link>
        </div>
      </header>

      {/* HERO */}
      <section className="bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800">
        <div className="mx-auto flex w-full max-w-6xl flex-col items-center px-4 py-12 text-center sm:px-6 sm:py-16 md:min-h-[540px] md:justify-center md:py-20">

          <div className="mb-4 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-xs font-semibold text-white sm:mb-6 sm:px-5 sm:py-2 sm:text-sm">
            India&apos;s Business &amp; Service Discovery Platform
          </div>

          <h1 className="max-w-4xl text-3xl font-extrabold leading-tight tracking-tight text-white sm:text-4xl md:text-5xl lg:text-6xl">
            Find the right{" "}
            <span className="text-yellow-300">business</span>,
            <br className="hidden sm:block" />
            <span className="text-yellow-300"> service</span> or
            professional near you
          </h1>

          <p className="mt-4 max-w-xl text-sm leading-6 text-blue-50 sm:mt-6 sm:text-base md:text-lg">
            Search local businesses, professionals and services near you.
          </p>

          {/* SEARCH */}
          <div className="mt-7 w-full max-w-4xl rounded-2xl bg-white p-2.5 shadow-2xl sm:mt-9 sm:p-3">

            <div className="flex flex-col gap-2.5 md:flex-row">

              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleSearch();
                  }
                }}
                placeholder="🔍 What are you looking for?"
                className="h-12 min-w-0 flex-1 rounded-xl border border-slate-200 px-4 text-sm text-slate-800 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100 sm:h-14 sm:text-base"
              />

              <input
                value={city}
                onChange={(e) => setCity(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleSearch();
                  }
                }}
                placeholder="📍 City / Location"
                className="h-12 min-w-0 flex-1 rounded-xl border border-slate-200 px-4 text-sm text-slate-800 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100 sm:h-14 sm:text-base"
              />

              <button
                type="button"
                onClick={handleSearch}
                className="h-12 rounded-xl bg-blue-600 px-7 text-sm font-bold text-white hover:bg-blue-700 sm:h-14 sm:px-9 sm:text-base"
              >
                Search
              </button>

            </div>
          </div>

          <p className="mt-4 text-xs text-white/90 sm:mt-5 sm:text-sm">
            Try: Architect in Lucknow • Interior Designer • Construction
          </p>
        </div>
      </section>

      {/* SEARCH RESULTS */}
      {searched && (
        <section
          id="search-results"
          className="bg-white px-4 py-10 sm:px-6 sm:py-14"
        >
          <div className="mx-auto max-w-6xl">

            <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-2xl font-bold sm:text-3xl">
                  Search Results
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  {results.length} business
                  {results.length === 1 ? "" : "es"} found
                </p>
              </div>

              <button
                type="button"
                onClick={clearSearch}
                className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-semibold hover:bg-slate-50 sm:w-auto"
              >
                Clear Search
              </button>
            </div>

            {loading ? (
              <div className="rounded-2xl bg-slate-50 px-5 py-12 text-center">
                Loading businesses...
              </div>
            ) : results.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-5 py-12 text-center">
                <div className="text-4xl">🔍</div>

                <h3 className="mt-4 text-lg font-bold">
                  No businesses found
                </h3>

                <p className="mt-2 text-sm text-slate-500">
                  Try another business category or city.
                </p>

                <Link
                  href="/list-business"
                  className="mt-5 inline-block rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white"
                >
                  List Your Business
                </Link>
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {results.map((business) => (
                  <div
                    key={business.id}
                    className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-xl">
                        🏢
                      </div>

                      <span className="rounded-full bg-green-50 px-2.5 py-1 text-xs font-semibold text-green-700">
                        Active
                      </span>
                    </div>

                    <h3 className="mt-4 text-lg font-bold">
                      {business.business_name}
                    </h3>

                    <p className="mt-1 font-semibold text-blue-600">
                      {business.category}
                    </p>

                    <p className="mt-2 text-sm text-slate-500">
                      📍 {business.city}
                    </p>

                    {business.phone && (
                      <p className="mt-1 text-sm text-slate-500">
                        📞 {business.phone}
                      </p>
                    )}

                    <Link
                      href={`/business/${business.id}`}
                      className="mt-4 block w-full rounded-xl bg-blue-600 py-3 text-center text-sm font-bold text-white hover:bg-blue-700"
                    >
                      View Business
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      )}

      {/* STATS */}
      {!searched && (
        <section className="border-b bg-white">
          <div className="mx-auto grid max-w-6xl grid-cols-2 divide-x px-4 py-5 sm:py-7 md:grid-cols-4">

            <div className="p-2 text-center">
              <div className="text-xl font-bold text-blue-600 sm:text-3xl">
                {businesses.length}+
              </div>
              <div className="mt-1 text-xs text-slate-500 sm:text-sm">
                Businesses
              </div>
            </div>

            <div className="p-2 text-center">
              <div className="text-xl font-bold text-blue-600 sm:text-3xl">
                {new Set(businesses.map((b) => b.city)).size}+
              </div>
              <div className="mt-1 text-xs text-slate-500 sm:text-sm">
                Cities
              </div>
            </div>

            <div className="p-2 text-center">
              <div className="text-xl font-bold text-blue-600 sm:text-3xl">
                {new Set(businesses.map((b) => b.category)).size}+
              </div>
              <div className="mt-1 text-xs text-slate-500 sm:text-sm">
                Categories
              </div>
            </div>

            <div className="p-2 text-center">
              <div className="text-xl font-bold text-blue-600 sm:text-3xl">
                24/7
              </div>
              <div className="mt-1 text-xs text-slate-500 sm:text-sm">
                Online Discovery
              </div>
            </div>

          </div>
        </section>
      )}

      {/* CATEGORIES */}
      <section
        id="categories"
        className="bg-slate-50 px-3 py-10 sm:px-6 sm:py-16"
      >
        <div className="mx-auto max-w-6xl">

          <div className="text-center">
            <p className="text-xs font-bold tracking-wide text-blue-600 sm:text-sm">
              DISCOVER SERVICES
            </p>

            <h2 className="mt-1.5 text-2xl font-bold sm:text-3xl md:text-4xl">
              Explore Popular Categories
            </h2>

            <p className="mt-2 text-xs text-slate-500 sm:text-sm">
              Find professionals and businesses near you
            </p>
          </div>

          {/* MOBILE: 4 COLUMNS */}
          <div className="mt-7 grid grid-cols-4 gap-x-2 gap-y-6 sm:mt-10 sm:grid-cols-4 sm:gap-4 lg:grid-cols-4">

            {categories.map((category) => (
              <button
                key={category.name}
                type="button"
                onClick={() =>
                  handleCategorySearch(category.name)
                }
                className="group flex min-w-0 flex-col items-center text-center"
              >

                <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-slate-200 bg-white text-[27px] shadow-sm transition group-hover:-translate-y-1 group-hover:shadow-md sm:h-20 sm:w-20 sm:text-4xl">
                  {category.icon}
                </div>

                <h3 className="mt-2 w-full text-[11px] font-semibold leading-4 text-slate-700 sm:mt-3 sm:text-sm">
                  {category.name}
                </h3>

              </button>
            ))}

          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section
        id="how-it-works"
        className="bg-white px-4 py-12 sm:px-6 sm:py-16"
      >
        <div className="mx-auto max-w-6xl">

          <div className="text-center">
            <p className="text-xs font-bold text-blue-600 sm:text-sm">
              SIMPLE &amp; FAST
            </p>

            <h2 className="mt-1.5 text-2xl font-bold sm:text-3xl md:text-4xl">
              How LocalPlatform Works
            </h2>
          </div>

          <div className="mt-8 grid gap-4 md:grid-cols-3 md:gap-6">

            <div className="rounded-2xl border p-5 text-center sm:p-7">
              <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-full bg-blue-600 text-lg font-bold text-white">
                1
              </div>

              <h3 className="mt-4 text-lg font-bold">
                Search
              </h3>

              <p className="mt-2 text-sm leading-6 text-slate-500">
                Search businesses, professionals and services by category and city.
              </p>
            </div>

            <div className="rounded-2xl border p-5 text-center sm:p-7">
              <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-full bg-blue-600 text-lg font-bold text-white">
                2
              </div>

              <h3 className="mt-4 text-lg font-bold">
                Compare
              </h3>

              <p className="mt-2 text-sm leading-6 text-slate-500">
                Discover businesses and compare the services available near you.
              </p>
            </div>

            <div className="rounded-2xl border p-5 text-center sm:p-7">
              <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-full bg-blue-600 text-lg font-bold text-white">
                3
              </div>

              <h3 className="mt-4 text-lg font-bold">
                Connect
              </h3>

              <p className="mt-2 text-sm leading-6 text-slate-500">
                Contact the business directly and get the service you need.
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* BUSINESS OWNER CTA */}
      <section className="px-4 py-10 sm:px-6 sm:py-16">
        <div className="mx-auto max-w-6xl rounded-3xl bg-gradient-to-r from-blue-600 to-indigo-700 px-5 py-10 text-center text-white sm:px-10 sm:py-14">

          <p className="text-xs font-bold text-blue-100 sm:text-sm">
            FOR BUSINESS OWNERS
          </p>

          <h2 className="mt-2 text-2xl font-bold sm:text-3xl md:text-4xl">
            Get discovered by new customers
          </h2>

          <p className="mx-auto mt-3 max-w-2xl text-sm leading-6 text-blue-100 sm:text-base">
            Create your business listing yourself and make your services searchable on LocalPlatform.
          </p>

          <Link
            href="/list-business"
            className="mt-6 inline-block rounded-xl bg-white px-6 py-3 text-sm font-bold text-blue-600 hover:bg-blue-50 sm:px-8 sm:py-4"
          >
            List Your Business
          </Link>

        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-slate-950 px-4 py-8 text-center text-slate-400">

        <div className="text-xl font-bold">
          <span className="text-blue-400">Local</span>
          <span className="text-orange-400">Platform</span>
        </div>

        <p className="mt-1 text-xs">
          Find. Connect. Grow.
        </p>

        <div className="mt-4 flex justify-center gap-5 text-xs sm:text-sm">
          <Link href="/" className="hover:text-white">
            Home
          </Link>

          <Link href="/search" className="hover:text-white">
            Search
          </Link>

          <Link href="/list-business" className="hover:text-white">
            List Business
          </Link>
        </div>

        <p className="mt-5 text-[10px]">
          © 2026 LocalPlatform. All rights reserved.
        </p>

      </footer>

    </main>
  );
}