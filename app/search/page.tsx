"use client";

import { useEffect, useMemo, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import Link from "next/link";

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
  subcategory?: string | null;
  services?: string[] | null;
  city: string;
  area?: string | null;
  state?: string | null;
  phone?: string | null;
  image_url?: string | null;
  description?: string | null;
  short_description?: string | null;
  highlights?: string[] | null;
  listing_status?: string | null;
  listing_expires_at?: string | null;
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
  "Gym",
];

export default function SearchPage() {
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [query, setQuery] = useState("");
  const [location, setLocation] = useState("");
  const [category, setCategory] = useState("");
  const [city, setCity] = useState("");
  const [area, setArea] = useState("");
  const [loading, setLoading] = useState(true);
  const [mobileFilters, setMobileFilters] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);

    setQuery(params.get("q") || "");
    setLocation(params.get("location") || "");

    fetchBusinesses();
  }, []);

  async function fetchBusinesses() {
    setLoading(true);

    const now = new Date().toISOString();

    const { data, error } = await supabase
      .from("businesses")
      .select(
        `
        id,
        business_name,
        category,
        subcategory,
        services,
        city,
        area,
        state,
        phone,
        image_url,
        description,
        short_description,
        highlights,
        listing_status,
        listing_expires_at
      `
      )
      .eq("listing_status", "active")
      .gt("listing_expires_at", now)
      .order("created_at", { ascending: false });

    if (!error && data) {
      setBusinesses(data as Business[]);
    }

    setLoading(false);
  }

  const cities = useMemo(() => {
    return Array.from(
      new Set(
        businesses
          .map((business) => business.city)
          .filter(Boolean)
      )
    ).sort();
  }, [businesses]);

  const areas = useMemo(() => {
    return Array.from(
      new Set(
        businesses
          .map((business) => business.area)
          .filter(Boolean) as string[]
      )
    ).sort();
  }, [businesses]);

  const categories = useMemo(() => {
    return Array.from(
      new Set(
        businesses
          .map((business) => business.category)
          .filter(Boolean)
      )
    ).sort();
  }, [businesses]);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    const loc = location.trim().toLowerCase();

    return businesses
      .map((business) => {
        const name = business.business_name?.toLowerCase() || "";
        const businessCategory =
          business.category?.toLowerCase() || "";
        const subcategory =
          business.subcategory?.toLowerCase() || "";
        const businessCity =
          business.city?.toLowerCase() || "";
        const businessArea =
          business.area?.toLowerCase() || "";
        const state =
          business.state?.toLowerCase() || "";
        const description =
          business.description?.toLowerCase() || "";
        const shortDescription =
          business.short_description?.toLowerCase() || "";

        const services =
          business.services
            ?.join(" ")
            .toLowerCase() || "";

        const highlights =
          business.highlights
            ?.join(" ")
            .toLowerCase() || "";

        const searchableText = [
          name,
          businessCategory,
          subcategory,
          businessCity,
          businessArea,
          state,
          description,
          shortDescription,
          services,
          highlights,
        ].join(" ");

        let score = 0;

        if (q) {
          if (name.includes(q)) score += 100;
          if (businessCategory.includes(q)) score += 80;
          if (subcategory.includes(q)) score += 70;
          if (services.includes(q)) score += 60;
          if (businessCity.includes(q)) score += 50;
          if (businessArea.includes(q)) score += 40;
          if (description.includes(q)) score += 30;
          if (searchableText.includes(q)) score += 20;
        }

        if (loc) {
          if (businessCity.includes(loc)) score += 60;
          if (businessArea.includes(loc)) score += 50;
          if (state.includes(loc)) score += 30;
          if (searchableText.includes(loc)) score += 10;
        }

        if (
          category &&
          businessCategory !== category.toLowerCase()
        ) {
          return null;
        }

        if (
          city &&
          businessCity !== city.toLowerCase()
        ) {
          return null;
        }

        if (
          area &&
          businessArea !== area.toLowerCase()
        ) {
          return null;
        }

        if (!q && !loc) score = 1;

        return {
          business,
          score,
        };
      })
      .filter(Boolean)
      .filter((item) => item!.score > 0)
      .sort((a, b) => b!.score - a!.score)
      .map((item) => item!.business);
  }, [
    businesses,
    query,
    location,
    category,
    city,
    area,
  ]);

  function doSearch() {
    const params = new URLSearchParams();

    if (query.trim()) {
      params.set("q", query.trim());
    }

    if (location.trim()) {
      params.set("location", location.trim());
    }

    window.history.replaceState(
      {},
      "",
      `/search${params.toString() ? `?${params}` : ""}`
    );
  }

  function clearFilters() {
    setQuery("");
    setLocation("");
    setCategory("");
    setCity("");
    setArea("");

    window.history.replaceState({}, "", "/search");
  }

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      {/* HEADER */}
      <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link
            href="/"
            className="flex items-center gap-2"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-900 text-lg font-bold text-white">
              L
            </div>

            <div>
              <div className="text-lg font-bold tracking-tight">
                LocalPlatform
              </div>

              <div className="hidden text-[10px] font-medium text-slate-500 sm:block">
                FIND LOCAL. CHOOSE BETTER.
              </div>
            </div>
          </Link>

          <nav className="hidden items-center gap-7 md:flex">
            <Link
              href="/"
              className="text-sm font-medium text-slate-600 hover:text-slate-900"
            >
              Home
            </Link>

            <Link
              href="/search"
              className="text-sm font-semibold text-slate-900"
            >
              Search
            </Link>

            <Link
              href="/list-business"
              className="text-sm font-medium text-slate-600 hover:text-slate-900"
            >
              List Business
            </Link>

            <Link
              href="/dashboard"
              className="text-sm font-medium text-slate-600 hover:text-slate-900"
            >
              Dashboard
            </Link>

            <Link
              href="/login"
              className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800"
            >
              Login
            </Link>
          </nav>

          <Link
            href="/"
            className="text-sm font-semibold text-slate-600 md:hidden"
          >
            ← Home
          </Link>
        </div>
      </header>

      {/* SEARCH HERO */}
      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <p className="text-xs font-bold uppercase tracking-wider text-sky-600">
              Local Search
            </p>

            <h1 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">
              Find local businesses
            </h1>

            <p className="mt-2 text-sm leading-6 text-slate-500 sm:text-base">
              Search businesses, professionals and services by
              name, category and location.
            </p>
          </div>

          <div className="mt-7 rounded-2xl border border-slate-200 bg-slate-50 p-2">
            <div className="grid gap-2 md:grid-cols-[1fr_0.8fr_auto]">
              <div className="flex items-center rounded-xl border border-slate-200 bg-white px-4">
                <span className="mr-3 text-lg text-slate-400">
                  ⌕
                </span>

                <input
                  value={query}
                  onChange={(e) =>
                    setQuery(e.target.value)
                  }
                  onKeyDown={(e) => {
                    if (e.key === "Enter") doSearch();
                  }}
                  placeholder="Business, service or category"
                  className="h-12 w-full bg-transparent text-sm outline-none placeholder:text-slate-400"
                />
              </div>

              <div className="flex items-center rounded-xl border border-slate-200 bg-white px-4">
                <span className="mr-3 text-lg text-slate-400">
                  ◉
                </span>

                <input
                  value={location}
                  onChange={(e) =>
                    setLocation(e.target.value)
                  }
                  onKeyDown={(e) => {
                    if (e.key === "Enter") doSearch();
                  }}
                  placeholder="City or area"
                  className="h-12 w-full bg-transparent text-sm outline-none placeholder:text-slate-400"
                />
              </div>

              <button
                onClick={doSearch}
                className="h-12 rounded-xl bg-slate-900 px-7 text-sm font-bold text-white hover:bg-slate-800"
              >
                Search
              </button>
            </div>
          </div>

          {/* POPULAR SEARCHES */}
          <div className="mt-5 flex gap-2 overflow-x-auto pb-1">
            {popularCategories.map((item) => (
              <button
                key={item}
                onClick={() => {
                  setQuery(item);
                  setCategory("");
                }}
                className="shrink-0 rounded-full border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-600 hover:border-slate-900 hover:text-slate-900"
              >
                {item}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* MOBILE FILTER BUTTON */}
      <div className="border-b border-slate-200 bg-white px-4 py-3 md:hidden">
        <button
          onClick={() =>
            setMobileFilters(!mobileFilters)
          }
          className="flex w-full items-center justify-between rounded-xl border border-slate-200 px-4 py-3 text-sm font-bold"
        >
          <span>Filters</span>
          <span>{mobileFilters ? "−" : "+"}</span>
        </button>
      </div>

      {/* MOBILE FILTERS */}
      {mobileFilters && (
        <div className="border-b border-slate-200 bg-white px-4 py-5 md:hidden">
          <FilterBox
            category={category}
            city={city}
            area={area}
            categories={categories}
            cities={cities}
            areas={areas}
            setCategory={setCategory}
            setCity={setCity}
            setArea={setArea}
            clearFilters={clearFilters}
          />
        </div>
      )}

      {/* MAIN */}
      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-[240px_1fr]">
          {/* DESKTOP FILTERS */}
          <aside className="hidden lg:block">
            <div className="sticky top-24 rounded-2xl border border-slate-200 bg-white p-5">
              <div className="mb-5 flex items-center justify-between">
                <h2 className="text-sm font-bold">
                  Filters
                </h2>

                <button
                  onClick={clearFilters}
                  className="text-xs font-semibold text-sky-600"
                >
                  Clear
                </button>
              </div>

              <FilterBox
                category={category}
                city={city}
                area={area}
                categories={categories}
                cities={cities}
                areas={areas}
                setCategory={setCategory}
                setCity={setCity}
                setArea={setArea}
                clearFilters={clearFilters}
                hideClear
              />
            </div>
          </aside>

          {/* RESULTS */}
          <div className="min-w-0">
            <div className="mb-5 flex items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold">
                  {loading
                    ? "Finding businesses..."
                    : `${results.length} ${
                        results.length === 1
                          ? "business"
                          : "businesses"
                      } found`}
                </h2>

                {(query || location) && (
                  <p className="mt-1 text-xs text-slate-500">
                    {query && `"${query}"`}
                    {query && location && " · "}
                    {location && location}
                  </p>
                )}
              </div>

              <Link
                href="/list-business"
                className="hidden rounded-lg bg-slate-900 px-4 py-2 text-xs font-bold text-white sm:block"
              >
                List Business
              </Link>
            </div>

            {loading ? (
              <LoadingGrid />
            ) : results.length === 0 ? (
              <EmptyState
                query={query}
                location={location}
                clearFilters={clearFilters}
              />
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {results.map((business) => (
                  <BusinessCard
                    key={business.id}
                    business={business}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="rounded-3xl bg-slate-900 p-7 sm:p-10">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-sky-400">
                  Business Owners
                </p>

                <h2 className="mt-2 text-2xl font-bold text-white sm:text-3xl">
                  Want your business here?
                </h2>

                <p className="mt-2 max-w-xl text-sm leading-6 text-slate-300">
                  Create your LocalPlatform listing and help local
                  customers discover your business.
                </p>
              </div>

              <Link
                href="/list-business"
                className="inline-flex items-center justify-center rounded-xl bg-white px-6 py-3.5 text-sm font-bold text-slate-900 hover:bg-slate-100"
              >
                List Your Business →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-7 sm:px-6 md:flex-row md:items-center md:justify-between lg:px-8">
          <div>
            <div className="font-bold">
              LocalPlatform
            </div>

            <p className="mt-1 text-xs text-slate-500">
              Discover local businesses. Connect locally.
            </p>
          </div>

          <div className="flex flex-wrap gap-5 text-xs font-medium text-slate-500">
            <Link href="/" className="hover:text-slate-900">
              Home
            </Link>

            <Link
              href="/search"
              className="hover:text-slate-900"
            >
              Search
            </Link>

            <Link
              href="/list-business"
              className="hover:text-slate-900"
            >
              List Business
            </Link>

            <Link
              href="/login"
              className="hover:text-slate-900"
            >
              Login
            </Link>
          </div>
        </div>

        <div className="border-t border-slate-100 py-4 text-center text-[11px] text-slate-400">
          © {new Date().getFullYear()} LocalPlatform. All rights reserved.
        </div>
      </footer>
    </main>
  );
}

function FilterBox({
  category,
  city,
  area,
  categories,
  cities,
  areas,
  setCategory,
  setCity,
  setArea,
  clearFilters,
  hideClear = false,
}: {
  category: string;
  city: string;
  area: string;
  categories: string[];
  cities: string[];
  areas: string[];
  setCategory: (value: string) => void;
  setCity: (value: string) => void;
  setArea: (value: string) => void;
  clearFilters: () => void;
  hideClear?: boolean;
}) {
  return (
    <div className="space-y-5">
      {!hideClear && (
        <button
          onClick={clearFilters}
          className="mb-1 text-xs font-semibold text-sky-600"
        >
          Clear all filters
        </button>
      )}

      <div>
        <label className="mb-2 block text-xs font-bold text-slate-700">
          Category
        </label>

        <select
          value={category}
          onChange={(e) =>
            setCategory(e.target.value)
          }
          className="w-full rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm outline-none focus:border-slate-900"
        >
          <option value="">All categories</option>

          {categories.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="mb-2 block text-xs font-bold text-slate-700">
          City
        </label>

        <select
          value={city}
          onChange={(e) => setCity(e.target.value)}
          className="w-full rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm outline-none focus:border-slate-900"
        >
          <option value="">All cities</option>

          {cities.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="mb-2 block text-xs font-bold text-slate-700">
          Area
        </label>

        <select
          value={area}
          onChange={(e) => setArea(e.target.value)}
          className="w-full rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm outline-none focus:border-slate-900"
        >
          <option value="">All areas</option>

          {areas.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}

function BusinessCard({
  business,
}: {
  business: Business;
}) {
  return (
    <article className="group overflow-hidden rounded-2xl border border-slate-200 bg-white transition duration-200 hover:-translate-y-1 hover:shadow-xl">
      <Link href={`/business/${business.id}`}>
        <div className="relative h-48 overflow-hidden bg-slate-100">
          {business.image_url ? (
            <img
              src={business.image_url}
              alt={business.business_name}
              className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-5xl text-slate-300">
              ◫
            </div>
          )}

          <div className="absolute left-3 top-3 rounded-full bg-white/95 px-3 py-1.5 text-[10px] font-bold text-slate-700 shadow-sm">
            {business.category}
          </div>
        </div>
      </Link>

      <div className="p-5">
        <Link href={`/business/${business.id}`}>
          <h3 className="line-clamp-1 text-base font-bold text-slate-900 hover:text-sky-600">
            {business.business_name}
          </h3>
        </Link>

        {business.subcategory && (
          <p className="mt-1 text-xs font-semibold text-sky-600">
            {business.subcategory}
          </p>
        )}

        <div className="mt-3 flex items-start gap-2 text-xs text-slate-500">
          <span>◉</span>

          <span className="line-clamp-2">
            {[
              business.area,
              business.city,
              business.state,
            ]
              .filter(Boolean)
              .join(", ")}
          </span>
        </div>

        {(business.short_description ||
          business.description) && (
          <p className="mt-3 line-clamp-2 text-xs leading-5 text-slate-500">
            {business.short_description ||
              business.description}
          </p>
        )}

        {business.services &&
          business.services.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-1.5">
              {business.services
                .slice(0, 3)
                .map((service) => (
                  <span
                    key={service}
                    className="rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-medium text-slate-600"
                  >
                    {service}
                  </span>
                ))}
            </div>
          )}

        <div className="mt-5 flex gap-2">
          <Link
            href={`/business/${business.id}`}
            className="flex-1 rounded-lg bg-slate-900 px-3 py-2.5 text-center text-xs font-bold text-white hover:bg-slate-800"
          >
            View Business
          </Link>

          {business.phone && (
            <a
              href={`tel:${business.phone}`}
              onClick={(e) => e.stopPropagation()}
              className="rounded-lg border border-slate-200 px-3 py-2.5 text-xs font-bold text-slate-700 hover:border-slate-900"
            >
              Call
            </a>
          )}
        </div>
      </div>
    </article>
  );
}

function EmptyState({
  query,
  location,
  clearFilters,
}: {
  query: string;
  location: string;
  clearFilters: () => void;
}) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white px-5 py-14 text-center sm:px-10">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-2xl text-slate-500">
        ⌕
      </div>

      <h3 className="mt-5 text-lg font-bold">
        No business found
      </h3>

      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
        {query || location
          ? "Try another business name, service, category or location."
          : "No active businesses are currently available."}
      </p>

      {(query || location) && (
        <button
          onClick={clearFilters}
          className="mt-5 rounded-xl bg-slate-900 px-5 py-3 text-sm font-bold text-white hover:bg-slate-800"
        >
          Clear Search
        </button>
      )}
    </div>
  );
}

function LoadingGrid() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {Array.from({ length: 6 }).map((_, index) => (
        <div
          key={index}
          className="overflow-hidden rounded-2xl border border-slate-200 bg-white"
        >
          <div className="h-48 animate-pulse bg-slate-200" />

          <div className="space-y-3 p-5">
            <div className="h-4 w-3/4 animate-pulse rounded bg-slate-200" />
            <div className="h-3 w-1/2 animate-pulse rounded bg-slate-200" />
            <div className="h-3 w-full animate-pulse rounded bg-slate-200" />
            <div className="h-3 w-5/6 animate-pulse rounded bg-slate-200" />
          </div>
        </div>
      ))}
    </div>
  );
}