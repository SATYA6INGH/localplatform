"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
);

type Business = {
  id: string;
  business_name: string;
  category: string;
  subcategory: string | null;
  services: string[] | null;
  description: string | null;
  city: string;
  area: string | null;
  state: string | null;
  pincode: string | null;
  phone: string | null;
  image_url: string | null;
};

const popularCategories = [
  "Architect",
  "Interior Designer",
  "Construction",
  "Doctor",
  "Dentist",
  "Restaurant",
  "Salon",
  "Electrician",
  "Plumber",
  "Real Estate",
  "Auto Repair",
  "Photographer",
  "Gym",
  "Hotel",
];

export default function SearchPage() {
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [city, setCity] = useState("");
  const [category, setCategory] = useState("");
  const [area, setArea] = useState("");

  const [searched, setSearched] = useState(false);
  const [mobileFilters, setMobileFilters] = useState(false);

  useEffect(() => {
    async function loadBusinesses() {
      const { data, error } = await supabase
        .from("businesses")
        .select(
          "id, business_name, category, subcategory, services, description, city, area, state, pincode, phone, image_url"
        )
        .order("business_name", { ascending: true });

      if (error) {
        console.error(error);
      } else {
        setBusinesses((data || []) as Business[]);
      }

      setLoading(false);
    }

    loadBusinesses();
  }, []);

  const results = useMemo(() => {
    const searchText = search.trim().toLowerCase();
    const cityText = city.trim().toLowerCase();
    const categoryText = category.trim().toLowerCase();
    const areaText = area.trim().toLowerCase();

    if (!searchText && !cityText && !categoryText && !areaText) {
      return businesses;
    }

    return businesses
      .map((business) => {
        const name = (business.business_name || "").toLowerCase();
        const cat = (business.category || "").toLowerCase();
        const subcat = (business.subcategory || "").toLowerCase();
        const serviceText = Array.isArray(business.services)
          ? business.services.join(" ").toLowerCase()
          : "";
        const businessCity = (business.city || "").toLowerCase();
        const businessArea = (business.area || "").toLowerCase();
        const description = (business.description || "").toLowerCase();

        let score = 0;

        if (searchText) {
          if (name.includes(searchText)) score += 100;
          if (cat.includes(searchText)) score += 80;
          if (subcat.includes(searchText)) score += 70;
          if (serviceText.includes(searchText)) score += 60;
          if (businessCity.includes(searchText)) score += 50;
          if (businessArea.includes(searchText)) score += 40;
          if (description.includes(searchText)) score += 20;

          const words = searchText.split(/\s+/).filter(Boolean);

          words.forEach((word) => {
            if (name.includes(word)) score += 15;
            if (cat.includes(word)) score += 12;
            if (subcat.includes(word)) score += 10;
            if (serviceText.includes(word)) score += 8;
            if (businessCity.includes(word)) score += 6;
            if (businessArea.includes(word)) score += 5;
          });
        }

        const matchesCity =
          !cityText || businessCity.includes(cityText);

        const matchesCategory =
          !categoryText || cat.includes(categoryText);

        const matchesArea =
          !areaText || businessArea.includes(areaText);

        if (!matchesCity || !matchesCategory || !matchesArea) {
          return { business, score: -1 };
        }

        if (!searchText) score = 1;

        return { business, score };
      })
      .filter((item) => item.score >= 0)
      .sort((a, b) => b.score - a.score)
      .map((item) => item.business);
  }, [businesses, search, city, category, area]);

  function runSearch() {
    setSearched(true);

    setTimeout(() => {
      document
        .getElementById("results")
        ?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 100);
  }

  function categorySearch(value: string) {
    setSearch(value);
    setCategory("");
    setArea("");
    setSearched(true);

    setTimeout(() => {
      document
        .getElementById("results")
        ?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 100);
  }

  function clearSearch() {
    setSearch("");
    setCity("");
    setCategory("");
    setArea("");
    setSearched(false);
    setMobileFilters(false);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  function handleEnter(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") {
      runSearch();
    }
  }

  return (
    <main className="min-h-screen overflow-x-hidden bg-slate-50 text-slate-900">
      {/* HEADER */}
      <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between px-4 sm:h-[72px] sm:px-6">
          <Link
            href="/"
            className="shrink-0 text-[22px] font-extrabold tracking-tight sm:text-3xl"
          >
            <span className="text-blue-600">Local</span>
            <span className="text-orange-500">Platform</span>
          </Link>

          <nav className="hidden items-center gap-7 md:flex">
            <Link
              href="/"
              className="text-sm font-semibold text-slate-700 hover:text-blue-600"
            >
              Home
            </Link>

            <Link
              href="/search"
              className="text-sm font-semibold text-blue-600"
            >
              Search
            </Link>

            <Link
              href="/list-business"
              className="text-sm font-semibold text-slate-700 hover:text-blue-600"
            >
              List Business
            </Link>

            <Link
              href="/dashboard"
              className="text-sm font-semibold text-slate-700 hover:text-blue-600"
            >
              Dashboard
            </Link>
          </nav>

          <Link
            href="/list-business"
            className="rounded-xl bg-blue-600 px-3 py-2 text-xs font-bold text-white hover:bg-blue-700 sm:px-5 sm:py-2.5 sm:text-sm"
          >
            List Your Business
          </Link>
        </div>
      </header>

      {/* SEARCH HERO */}
      <section className="bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800">
        <div className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 sm:py-14 md:py-16">
          <div className="mx-auto max-w-3xl text-center">
            <p className="text-xs font-bold uppercase tracking-wider text-blue-100 sm:text-sm">
              Local Business Search
            </p>

            <h1 className="mt-2 text-3xl font-extrabold leading-tight text-white sm:text-4xl md:text-5xl">
              Find the right business near you
            </h1>

            <p className="mx-auto mt-3 max-w-2xl text-sm leading-6 text-blue-100 sm:text-base">
              Search businesses, professionals and services by name,
              category, city or area.
            </p>
          </div>

          {/* SEARCH BOX */}
          <div className="mx-auto mt-7 max-w-5xl rounded-2xl bg-white p-2 shadow-2xl sm:mt-9 sm:p-3">
            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-[1.5fr_1fr_auto]">
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={handleEnter}
                placeholder="What are you looking for?"
                className="h-12 min-w-0 rounded-xl border border-slate-200 px-4 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 sm:h-14 sm:text-base"
              />

              <input
                value={city}
                onChange={(e) => setCity(e.target.value)}
                onKeyDown={handleEnter}
                placeholder="City / Location"
                className="h-12 min-w-0 rounded-xl border border-slate-200 px-4 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 sm:h-14 sm:text-base"
              />

              <button
                type="button"
                onClick={runSearch}
                className="h-12 rounded-xl bg-blue-600 px-7 text-sm font-bold text-white transition hover:bg-blue-700 sm:h-14 sm:px-9 sm:text-base"
              >
                Search
              </button>
            </div>
          </div>

          <p className="mt-4 text-center text-xs text-white/90 sm:text-sm">
            Try: Architect in Lucknow • Interior Designer • Restaurant
          </p>
        </div>
      </section>

      {/* POPULAR CATEGORIES */}
      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto w-full max-w-7xl px-4 py-5 sm:px-6 sm:py-7">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-base font-bold sm:text-lg">
              Popular Searches
            </h2>

            <span className="text-xs text-slate-500 sm:text-sm">
              Tap to search
            </span>
          </div>

          <div className="flex gap-2 overflow-x-auto pb-1">
            {popularCategories.map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => categorySearch(item)}
                className="shrink-0 rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-xs font-semibold text-slate-700 transition hover:border-blue-300 hover:bg-blue-50 hover:text-blue-600 sm:text-sm"
              >
                {item}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* MAIN CONTENT */}
      <section className="mx-auto w-full max-w-7xl px-4 py-7 sm:px-6 sm:py-10">
        <div className="grid min-w-0 gap-6 lg:grid-cols-[260px_minmax(0,1fr)]">
          {/* DESKTOP FILTERS */}
          <aside className="hidden h-fit rounded-2xl border border-slate-200 bg-white p-5 shadow-sm lg:block">
            <h2 className="text-lg font-bold">Filters</h2>

            <div className="mt-5 space-y-4">
              <div>
                <label className="mb-1.5 block text-xs font-bold text-slate-600">
                  Category
                </label>

                <input
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  placeholder="e.g. Architect"
                  className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-bold text-slate-600">
                  City
                </label>

                <input
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="e.g. Lucknow"
                  className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-bold text-slate-600">
                  Area
                </label>

                <input
                  value={area}
                  onChange={(e) => setArea(e.target.value)}
                  placeholder="e.g. Gomti Nagar"
                  className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-blue-500"
                />
              </div>

              <button
                type="button"
                onClick={runSearch}
                className="w-full rounded-xl bg-blue-600 py-3 text-sm font-bold text-white hover:bg-blue-700"
              >
                Apply Filters
              </button>

              <button
                type="button"
                onClick={clearSearch}
                className="w-full rounded-xl border border-slate-200 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"
              >
                Reset
              </button>
            </div>
          </aside>

          {/* RESULTS */}
          <div id="results" className="min-w-0 scroll-mt-24">
            <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-xl font-bold sm:text-2xl">
                  {searched ? "Search Results" : "All Businesses"}
                </h2>

                <p className="mt-1 text-xs text-slate-500 sm:text-sm">
                  {loading
                    ? "Loading businesses..."
                    : `${results.length} business${
                        results.length === 1 ? "" : "es"
                      } found`}
                </p>
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setMobileFilters((value) => !value)}
                  className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold lg:hidden"
                >
                  Filters
                </button>

                <button
                  type="button"
                  onClick={clearSearch}
                  className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Clear
                </button>
              </div>
            </div>

            {/* MOBILE FILTERS */}
            {mobileFilters && (
              <div className="mb-5 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm lg:hidden">
                <div className="grid gap-3">
                  <input
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    placeholder="Category"
                    className="h-11 rounded-xl border border-slate-200 px-3 text-sm outline-none focus:border-blue-500"
                  />

                  <input
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="City"
                    className="h-11 rounded-xl border border-slate-200 px-3 text-sm outline-none focus:border-blue-500"
                  />

                  <input
                    value={area}
                    onChange={(e) => setArea(e.target.value)}
                    placeholder="Area"
                    className="h-11 rounded-xl border border-slate-200 px-3 text-sm outline-none focus:border-blue-500"
                  />

                  <button
                    type="button"
                    onClick={() => {
                      setMobileFilters(false);
                      runSearch();
                    }}
                    className="h-11 rounded-xl bg-blue-600 text-sm font-bold text-white"
                  >
                    Apply Filters
                  </button>
                </div>
              </div>
            )}

            {loading ? (
              <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center">
                <div className="text-3xl">⏳</div>
                <p className="mt-3 text-sm font-semibold text-slate-600">
                  Loading businesses...
                </p>
              </div>
            ) : results.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center sm:p-12">
                <div className="text-4xl">🔍</div>

                <h3 className="mt-4 text-lg font-bold">
                  No businesses found
                </h3>

                <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
                  Try another business name, category, city or area.
                </p>

                <div className="mt-5 flex flex-col justify-center gap-2 sm:flex-row">
                  <button
                    type="button"
                    onClick={clearSearch}
                    className="rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-semibold"
                  >
                    Clear Search
                  </button>

                  <Link
                    href="/list-business"
                    className="rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white"
                  >
                    List Your Business
                  </Link>
                </div>
              </div>
            ) : (
              <div className="grid min-w-0 gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {results.map((business) => (
                  <article
                    key={business.id}
                    className="min-w-0 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
                  >
                    {/* IMAGE */}
                    <div className="relative h-40 w-full bg-slate-100 sm:h-44">
                      {business.image_url ? (
                        <img
                          src={business.image_url}
                          alt={business.business_name}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
                          <div className="text-5xl">🏢</div>
                        </div>
                      )}

                      <span className="absolute right-3 top-3 rounded-full bg-white/95 px-2.5 py-1 text-[11px] font-bold text-green-700 shadow-sm">
                        Active
                      </span>
                    </div>

                    {/* CARD BODY */}
                    <div className="p-4 sm:p-5">
                      <p className="text-xs font-bold text-blue-600">
                        {business.category}
                      </p>

                      <h3 className="mt-1 line-clamp-2 text-base font-bold leading-6 text-slate-900 sm:text-lg">
                        {business.business_name}
                      </h3>

                      {business.subcategory && (
                        <p className="mt-1 text-xs font-medium text-slate-500">
                          {business.subcategory}
                        </p>
                      )}

                      <p className="mt-3 truncate text-sm text-slate-600">
                        📍{" "}
                        {[business.area, business.city]
                          .filter(Boolean)
                          .join(", ")}
                      </p>

                      {business.description && (
                        <p className="mt-2 line-clamp-2 text-xs leading-5 text-slate-500">
                          {business.description}
                        </p>
                      )}

                      {Array.isArray(business.services) &&
                        business.services.length > 0 && (
                          <div className="mt-3 flex flex-wrap gap-1.5">
                            {business.services.slice(0, 3).map((service) => (
                              <span
                                key={service}
                                className="max-w-full truncate rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-semibold text-slate-600"
                              >
                                {service}
                              </span>
                            ))}
                          </div>
                        )}

                      <div className="mt-4 grid grid-cols-2 gap-2">
                        <Link
                          href={`/business/${business.id}`}
                          className="rounded-xl bg-blue-600 py-2.5 text-center text-xs font-bold text-white hover:bg-blue-700 sm:text-sm"
                        >
                          View Business
                        </Link>

                        {business.phone ? (
                          <a
                            href={`tel:${business.phone}`}
                            className="rounded-xl border border-slate-200 py-2.5 text-center text-xs font-bold text-slate-700 hover:bg-slate-50 sm:text-sm"
                          >
                            Call
                          </a>
                        ) : (
                          <Link
                            href={`/business/${business.id}`}
                            className="rounded-xl border border-slate-200 py-2.5 text-center text-xs font-bold text-slate-700 hover:bg-slate-50 sm:text-sm"
                          >
                            Contact
                          </Link>
                        )}
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-4 pb-10 sm:px-6 sm:pb-16">
        <div className="mx-auto max-w-7xl rounded-3xl bg-gradient-to-r from-blue-600 to-indigo-700 px-5 py-9 text-center text-white sm:px-10 sm:py-12">
          <h2 className="text-2xl font-bold sm:text-3xl">
            Don&apos;t see your business?
          </h2>

          <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-blue-100 sm:text-base">
            Add your business to LocalPlatform and get discovered by
            customers.
          </p>

          <Link
            href="/list-business"
            className="mt-5 inline-block rounded-xl bg-white px-6 py-3 text-sm font-bold text-blue-600 hover:bg-blue-50"
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

        <p className="mt-1 text-xs">Find. Connect. Grow.</p>

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