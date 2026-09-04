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
    <main className="min-h-screen bg-white text-slate-900">

      {/* HEADER */}
      <header className="sticky top-0 z-50 border-b bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 md:px-6">

          <Link href="/" className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-600 text-xl font-extrabold text-white">
              L
            </div>

            <div>
              <div className="text-lg font-bold md:text-xl">
                LocalPlatform
              </div>

              <div className="hidden text-xs text-slate-500 sm:block">
                Find. Connect. Grow.
              </div>
            </div>
          </Link>

          <nav className="hidden items-center gap-7 md:flex">
            <Link
              href="/"
              className="font-medium hover:text-blue-600"
            >
              Home
            </Link>

            <a
              href="#categories"
              className="font-medium hover:text-blue-600"
            >
              Categories
            </a>

            <a
              href="#how-it-works"
              className="font-medium hover:text-blue-600"
            >
              How It Works
            </a>
          </nav>

          <Link
            href="/list-business"
            className="rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-blue-700 md:px-6 md:py-3 md:text-base"
          >
            List Your Business
          </Link>

        </div>
      </header>


      {/* HERO */}
      <section className="bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800">

        <div className="mx-auto flex min-h-[620px] max-w-6xl flex-col items-center justify-center px-5 py-20 text-center">

          <div className="mb-7 rounded-full border border-white/20 bg-white/10 px-5 py-2 text-sm font-medium text-white">
            India&apos;s Business &amp; Service Discovery Platform
          </div>

          <h1 className="max-w-5xl text-4xl font-extrabold leading-tight tracking-tight text-white sm:text-5xl md:text-6xl lg:text-7xl">
            Find the right{" "}
            <span className="text-yellow-300">business</span>,
            <br />

            <span className="text-yellow-300">service</span>{" "}
            or professional
            <br />

            near you
          </h1>

          <p className="mt-7 max-w-2xl text-base leading-7 text-blue-50 md:text-lg">
            Search local businesses, professionals and services.
            Business owners can list themselves and reach customers
            searching for their services.
          </p>


          {/* SEARCH */}
          <div className="mt-10 w-full max-w-4xl rounded-2xl bg-white p-3 shadow-2xl">

            <div className="flex flex-col gap-3 md:flex-row">

              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleSearch();
                  }
                }}
                placeholder="What are you looking for?"
                className="h-14 flex-1 rounded-xl border border-slate-300 px-5 text-slate-800 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
              />

              <input
                value={city}
                onChange={(e) => setCity(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleSearch();
                  }
                }}
                placeholder="City / Location"
                className="h-14 flex-1 rounded-xl border border-slate-300 px-5 text-slate-800 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
              />

              <button
                type="button"
                onClick={handleSearch}
                className="h-14 rounded-xl bg-blue-600 px-9 font-bold text-white transition hover:bg-blue-700"
              >
                Search
              </button>

            </div>
          </div>

          <p className="mt-5 text-sm text-white/90">
            Try: Architect in Lucknow • Interior Designer • Construction Company
          </p>

        </div>
      </section>


      {/* SEARCH RESULTS */}
      {searched && (
        <section
          id="search-results"
          className="bg-white px-5 py-16 md:px-6"
        >
          <div className="mx-auto max-w-6xl">

            <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">

              <div>
                <h2 className="text-3xl font-bold">
                  Search Results
                </h2>

                <p className="mt-2 text-slate-500">
                  {results.length} business
                  {results.length === 1 ? "" : "es"} found
                </p>
              </div>

              <button
                type="button"
                onClick={clearSearch}
                className="rounded-xl border border-slate-300 px-5 py-3 font-semibold hover:bg-slate-50"
              >
                Clear Search
              </button>

            </div>


            {loading ? (
              <div className="rounded-2xl bg-slate-50 px-6 py-14 text-center">
                Loading businesses...
              </div>
            ) : results.length === 0 ? (

              <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-6 py-14 text-center">

                <div className="text-5xl">
                  🔍
                </div>

                <h3 className="mt-5 text-xl font-bold">
                  No businesses found
                </h3>

                <p className="mt-2 text-slate-500">
                  Try another business category or city.
                </p>

                <Link
                  href="/list-business"
                  className="mt-6 inline-block rounded-xl bg-blue-600 px-6 py-3 font-semibold text-white"
                >
                  List Your Business
                </Link>

              </div>

            ) : (

              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">

                {results.map((business) => (

                  <div
                    key={business.id}
                    className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-xl"
                  >

                    <div className="flex items-start justify-between">

                      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-xl">
                        🏢
                      </div>

                      <span className="rounded-full bg-green-50 px-3 py-1 text-xs font-semibold text-green-700">
                        Active
                      </span>

                    </div>

                    <h3 className="mt-5 text-xl font-bold">
                      {business.business_name}
                    </h3>

                    <p className="mt-2 font-semibold text-blue-600">
                      {business.category}
                    </p>

                    <p className="mt-3 text-sm text-slate-500">
                      📍 {business.city}
                    </p>

                    <p className="mt-2 text-sm text-slate-500">
                      📞 {business.phone}
                    </p>

                    <Link
                      href={`/business/${business.id}`}
                      className="mt-5 block w-full rounded-xl bg-blue-600 py-3 text-center font-semibold text-white hover:bg-blue-700"
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

          <div className="mx-auto grid max-w-6xl grid-cols-2 divide-x px-5 py-9 md:grid-cols-4">

            <div className="p-3 text-center">
              <div className="text-3xl font-bold text-blue-600">
                {businesses.length}+
              </div>
              <div className="mt-1 text-sm text-slate-500">
                Businesses
              </div>
            </div>

            <div className="p-3 text-center">
              <div className="text-3xl font-bold text-blue-600">
                {new Set(businesses.map((b) => b.city)).size}+
              </div>
              <div className="mt-1 text-sm text-slate-500">
                Cities
              </div>
            </div>

            <div className="p-3 text-center">
              <div className="text-3xl font-bold text-blue-600">
                {new Set(businesses.map((b) => b.category)).size}+
              </div>
              <div className="mt-1 text-sm text-slate-500">
                Categories
              </div>
            </div>

            <div className="p-3 text-center">
              <div className="text-3xl font-bold text-blue-600">
                24/7
              </div>
              <div className="mt-1 text-sm text-slate-500">
                Online Discovery
              </div>
            </div>

          </div>

        </section>
      )}


      {/* CATEGORIES */}
      <section
        id="categories"
        className="bg-slate-50 px-5 py-20 md:px-6"
      >

        <div className="mx-auto max-w-6xl">

          <div className="text-center">

            <p className="font-semibold text-blue-600">
              DISCOVER SERVICES
            </p>

            <h2 className="mt-2 text-3xl font-bold md:text-4xl">
              Explore Popular Categories
            </h2>

            <p className="mt-3 text-slate-500">
              Find professionals and businesses near you
            </p>

          </div>


          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">

            {[
              "Architect",
              "Interior Designer",
              "Construction Company",
              "Contractor",
              "Real Estate",
              "Electrician",
              "Plumber",
              "Home Services",
            ].map((category) => (

              <button
                key={category}
                type="button"
                onClick={() => handleCategorySearch(category)}
                className="rounded-2xl border border-slate-200 bg-white p-7 text-left shadow-sm transition hover:-translate-y-1 hover:shadow-xl"
              >

                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-2xl">
                  🏢
                </div>

                <h3 className="mt-5 font-bold">
                  {category}
                </h3>

                <p className="mt-2 text-sm text-slate-500">
                  Find local professionals
                </p>

              </button>

            ))}

          </div>

        </div>
      </section>


      {/* HOW IT WORKS */}
      <section
        id="how-it-works"
        className="bg-white px-5 py-20 md:px-6"
      >

        <div className="mx-auto max-w-6xl">

          <div className="text-center">

            <p className="font-semibold text-blue-600">
              SIMPLE &amp; FAST
            </p>

            <h2 className="mt-2 text-3xl font-bold md:text-4xl">
              How LocalPlatform Works
            </h2>

          </div>


          <div className="mt-12 grid gap-7 md:grid-cols-3">

            <div className="rounded-2xl border p-8 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-blue-600 text-xl font-bold text-white">
                1
              </div>

              <h3 className="mt-5 text-xl font-bold">
                Search
              </h3>

              <p className="mt-3 text-slate-500">
                Search for any business, professional or service by category
                and city.
              </p>
            </div>


            <div className="rounded-2xl border p-8 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-blue-600 text-xl font-bold text-white">
                2
              </div>

              <h3 className="mt-5 text-xl font-bold">
                Compare
              </h3>

              <p className="mt-3 text-slate-500">
                Discover businesses and compare the services available near
                you.
              </p>
            </div>


            <div className="rounded-2xl border p-8 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-blue-600 text-xl font-bold text-white">
                3
              </div>

              <h3 className="mt-5 text-xl font-bold">
                Connect
              </h3>

              <p className="mt-3 text-slate-500">
                Contact the business directly and get the service you need.
              </p>
            </div>

          </div>

        </div>
      </section>


      {/* BUSINESS OWNER CTA */}
      <section className="px-5 py-20 md:px-6">

        <div className="mx-auto max-w-6xl rounded-3xl bg-gradient-to-r from-blue-600 to-indigo-700 px-7 py-14 text-center text-white md:px-10">

          <p className="font-semibold text-blue-100">
            FOR BUSINESS OWNERS
          </p>

          <h2 className="mt-3 text-3xl font-bold md:text-4xl">
            Get discovered by new customers
          </h2>

          <p className="mx-auto mt-4 max-w-2xl text-blue-100">
            Create your business listing yourself and make your services
            searchable on LocalPlatform.
          </p>

          <Link
            href="/list-business"
            className="mt-8 inline-block rounded-xl bg-white px-8 py-4 font-bold text-blue-600 transition hover:bg-blue-50"
          >
            List Your Business
          </Link>

        </div>

      </section>


      {/* FOOTER */}
      <footer className="bg-slate-950 px-5 py-10 text-center text-slate-400">

        <div className="text-xl font-bold text-white">
          LocalPlatform
        </div>

        <p className="mt-2 text-sm">
          Find. Connect. Grow.
        </p>

        <div className="mt-5 flex justify-center gap-6 text-sm">
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

        <p className="mt-6 text-xs">
          © 2026 LocalPlatform. All rights reserved.
        </p>

      </footer>

    </main>
  );
}