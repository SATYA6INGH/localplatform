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

const categories = [
  {
    name: "Architect",
    label: "Architecture",
    icon: "⌂",
  },
  {
    name: "Interior Designer",
    label: "Interiors",
    icon: "◫",
  },
  {
    name: "Construction",
    label: "Construction",
    icon: "▦",
  },
  {
    name: "Doctor",
    label: "Healthcare",
    icon: "✚",
  },
  {
    name: "Restaurant",
    label: "Food & Dining",
    icon: "◉",
  },
  {
    name: "Salon",
    label: "Beauty",
    icon: "✂",
  },
  {
    name: "Electrician",
    label: "Electrical",
    icon: "ϟ",
  },
  {
    name: "Real Estate",
    label: "Property",
    icon: "▥",
  },
];

const popularSearches = [
  "Architect",
  "Interior Designer",
  "Doctor",
  "Restaurant",
  "Salon",
];

export default function HomePage() {
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [query, setQuery] = useState("");
  const [location, setLocation] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
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

  const featuredBusinesses = useMemo(() => {
    return businesses.slice(0, 6);
  }, [businesses]);

  const searchResults = useMemo(() => {
    const q = query.trim().toLowerCase();
    const loc = location.trim().toLowerCase();

    if (!q && !loc) return [];

    return businesses
      .map((business) => {
        const name = business.business_name?.toLowerCase() || "";
        const cat = business.category?.toLowerCase() || "";
        const sub = business.subcategory?.toLowerCase() || "";
        const city = business.city?.toLowerCase() || "";
        const area = business.area?.toLowerCase() || "";
        const description =
          business.description?.toLowerCase() || "";
        const services =
          business.services?.join(" ").toLowerCase() || "";

        let score = 0;

        if (q) {
          if (name.includes(q)) score += 100;
          if (cat.includes(q)) score += 80;
          if (sub.includes(q)) score += 70;
          if (services.includes(q)) score += 60;
          if (city.includes(q)) score += 50;
          if (area.includes(q)) score += 40;
          if (description.includes(q)) score += 20;
        }

        if (loc) {
          if (city.includes(loc)) score += 60;
          if (area.includes(loc)) score += 50;
        }

        return { business, score };
      })
      .filter((item) => item.score > 0)
      .sort((a, b) => b.score - a.score)
      .map((item) => item.business)
      .slice(0, 6);
  }, [businesses, query, location]);

  function search() {
    const params = new URLSearchParams();

    if (query.trim()) {
      params.set("q", query.trim());
    }

    if (location.trim()) {
      params.set("location", location.trim());
    }

    window.location.href = `/search${
      params.toString() ? `?${params.toString()}` : ""
    }`;
  }

  function categorySearch(category: string) {
    window.location.href = `/search?q=${encodeURIComponent(
      category
    )}`;
  }

  return (
    <main className="min-h-screen overflow-x-hidden bg-white text-slate-900">
      {/* ================= HEADER ================= */}
      <header className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/90 backdrop-blur-xl">
        <div className="mx-auto flex h-[68px] max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link href="/" className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-950 text-lg font-black text-white shadow-lg shadow-slate-900/10">
              L
            </div>

            <div>
              <div className="text-[17px] font-black tracking-tight sm:text-lg">
                LocalPlatform
              </div>

              <div className="hidden text-[9px] font-bold tracking-[0.18em] text-slate-400 sm:block">
                FIND LOCAL · CHOOSE BETTER
              </div>
            </div>
          </Link>

          <nav className="hidden items-center gap-7 md:flex">
            <Link
              href="/"
              className="text-sm font-bold text-slate-950"
            >
              Home
            </Link>

            <Link
              href="/search"
              className="text-sm font-medium text-slate-500 transition hover:text-slate-950"
            >
              Search
            </Link>

            <Link
              href="/list-business"
              className="text-sm font-medium text-slate-500 transition hover:text-slate-950"
            >
              List Business
            </Link>

            <Link
              href="/dashboard"
              className="text-sm font-medium text-slate-500 transition hover:text-slate-950"
            >
              Dashboard
            </Link>

            <Link
              href="/login"
              className="rounded-xl bg-slate-950 px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-slate-900/10 transition hover:-translate-y-0.5 hover:bg-slate-800"
            >
              Login
            </Link>
          </nav>

          <Link
            href="/search"
            className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-bold text-slate-700 shadow-sm md:hidden"
          >
            Search
          </Link>
        </div>
      </header>

      {/* ================= HERO ================= */}
      <section className="relative overflow-hidden bg-slate-950">
        {/* decorative background */}
        <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-sky-500/20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-32 -left-24 h-80 w-80 rounded-full bg-indigo-500/15 blur-3xl" />

        <div className="relative mx-auto max-w-7xl px-4 pb-14 pt-14 sm:px-6 sm:pb-20 sm:pt-20 lg:px-8 lg:pb-24 lg:pt-24">
          <div className="mx-auto max-w-5xl text-center">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.06] px-4 py-2 text-[10px] font-bold tracking-[0.14em] text-slate-300 sm:text-xs">
              <span className="h-1.5 w-1.5 rounded-full bg-sky-400" />
              YOUR LOCAL BUSINESS DISCOVERY PLATFORM
            </div>

            <h1 className="text-[42px] font-black leading-[1.02] tracking-[-0.04em] text-white sm:text-6xl lg:text-7xl">
              Find the right
              <span className="block bg-gradient-to-r from-sky-300 via-cyan-300 to-blue-400 bg-clip-text text-transparent">
                business near you.
              </span>
            </h1>

            <p className="mx-auto mt-6 max-w-2xl text-sm leading-6 text-slate-300 sm:text-base sm:leading-7 lg:text-lg">
              Discover local professionals, services and businesses
              by category, service and location.
            </p>

            {/* SEARCH */}
            <div className="mx-auto mt-9 max-w-4xl rounded-[22px] border border-white/10 bg-white p-2 shadow-2xl shadow-black/30">
              <div className="grid gap-2 md:grid-cols-[1fr_0.72fr_auto]">
                <div className="flex min-w-0 items-center rounded-2xl border border-slate-200 bg-slate-50 px-4">
                  <span className="mr-3 text-xl text-slate-400">
                    ⌕
                  </span>

                  <input
                    value={query}
                    onChange={(e) =>
                      setQuery(e.target.value)
                    }
                    onKeyDown={(e) => {
                      if (e.key === "Enter") search();
                    }}
                    placeholder="What are you looking for?"
                    className="h-12 w-full min-w-0 bg-transparent text-sm font-medium outline-none placeholder:text-slate-400"
                  />
                </div>

                <div className="flex min-w-0 items-center rounded-2xl border border-slate-200 bg-slate-50 px-4">
                  <span className="mr-3 text-lg text-slate-400">
                    ◉
                  </span>

                  <input
                    value={location}
                    onChange={(e) =>
                      setLocation(e.target.value)
                    }
                    onKeyDown={(e) => {
                      if (e.key === "Enter") search();
                    }}
                    placeholder="City or area"
                    className="h-12 w-full min-w-0 bg-transparent text-sm font-medium outline-none placeholder:text-slate-400"
                  />
                </div>

                <button
                  onClick={search}
                  className="h-12 rounded-2xl bg-slate-950 px-8 text-sm font-black text-white transition hover:bg-slate-800"
                >
                  Search
                </button>
              </div>
            </div>

            {/* QUICK SEARCH */}
            <div className="mt-5 flex flex-wrap justify-center gap-2">
              <span className="mr-1 py-2 text-[11px] font-medium text-slate-500">
                Popular:
              </span>

              {popularSearches.map((item) => (
                <button
                  key={item}
                  onClick={() => categorySearch(item)}
                  className="rounded-full border border-white/10 bg-white/[0.06] px-3.5 py-2 text-[11px] font-semibold text-slate-300 transition hover:border-white/20 hover:bg-white/10 hover:text-white"
                >
                  {item}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ================= SEARCH PREVIEW ================= */}
      {(query || location) && (
        <section className="border-b border-slate-200 bg-slate-50">
          <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
            <div className="mb-6 flex items-end justify-between gap-4">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.16em] text-sky-600">
                  Search
                </p>

                <h2 className="mt-1 text-2xl font-black tracking-tight">
                  Matching businesses
                </h2>
              </div>

              <Link
                href={`/search?q=${encodeURIComponent(
                  query
                )}&location=${encodeURIComponent(location)}`}
                className="hidden text-xs font-black text-sky-600 sm:block"
              >
                View all →
              </Link>
            </div>

            {loading ? (
              <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center text-sm text-slate-500">
                Finding businesses...
              </div>
            ) : searchResults.length === 0 ? (
              <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center">
                <div className="text-3xl">⌕</div>

                <h3 className="mt-3 font-bold">
                  No matching business found
                </h3>

                <p className="mt-1 text-xs text-slate-500">
                  Try another business, service or location.
                </p>
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {searchResults.map((business) => (
                  <BusinessCard
                    key={business.id}
                    business={business}
                  />
                ))}
              </div>
            )}
          </div>
        </section>
      )}

      {/* ================= CATEGORIES ================= */}
      <section className="bg-white">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.16em] text-sky-600">
                Explore
              </p>

              <h2 className="mt-2 text-3xl font-black tracking-tight sm:text-4xl">
                Browse by category
              </h2>

              <p className="mt-2 max-w-xl text-sm leading-6 text-slate-500">
                Start with a category and discover businesses
                offering the services you need.
              </p>
            </div>

            <Link
              href="/search"
              className="text-xs font-black text-slate-900"
            >
              Explore all →
            </Link>
          </div>

          <div className="mt-9 grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-8">
            {categories.map((category) => (
              <button
                key={category.name}
                onClick={() =>
                  categorySearch(category.name)
                }
                className="group rounded-2xl border border-slate-200 bg-white p-4 text-left transition duration-200 hover:-translate-y-1 hover:border-slate-300 hover:shadow-xl"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-base font-black text-slate-700 transition group-hover:bg-slate-950 group-hover:text-white">
                  {category.icon}
                </div>

                <h3 className="mt-4 line-clamp-1 text-xs font-black text-slate-900">
                  {category.name}
                </h3>

                <p className="mt-1 text-[10px] font-medium text-slate-400">
                  {category.label}
                </p>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ================= FEATURED ================= */}
      <section className="border-y border-slate-200 bg-slate-50">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.16em] text-sky-600">
                Discover
              </p>

              <h2 className="mt-2 text-3xl font-black tracking-tight sm:text-4xl">
                Local businesses
              </h2>

              <p className="mt-2 text-sm text-slate-500">
                Explore recently listed active businesses.
              </p>
            </div>

            <Link
              href="/search"
              className="hidden rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-black text-slate-700 shadow-sm sm:block"
            >
              View all
            </Link>
          </div>

          {loading ? (
            <div className="mt-9 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <div
                  key={i}
                  className="h-[360px] animate-pulse rounded-2xl bg-white"
                />
              ))}
            </div>
          ) : featuredBusinesses.length === 0 ? (
            <div className="mt-9 rounded-3xl border border-slate-200 bg-white px-6 py-14 text-center">
              <div className="text-4xl text-slate-300">
                ◫
              </div>

              <h3 className="mt-4 text-lg font-black">
                Businesses coming soon
              </h3>

              <p className="mx-auto mt-2 max-w-md text-sm text-slate-500">
                Be one of the first businesses listed on
                LocalPlatform.
              </p>

              <Link
                href="/list-business"
                className="mt-5 inline-flex rounded-xl bg-slate-950 px-5 py-3 text-xs font-black text-white"
              >
                List Your Business
              </Link>
            </div>
          ) : (
            <div className="mt-9 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {featuredBusinesses.map((business) => (
                <BusinessCard
                  key={business.id}
                  business={business}
                />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ================= OWNER CTA ================= */}
      <section className="bg-white">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
          <div className="relative overflow-hidden rounded-[30px] bg-slate-950 px-7 py-10 sm:px-10 lg:px-14 lg:py-14">
            <div className="pointer-events-none absolute -right-20 -top-24 h-64 w-64 rounded-full bg-sky-500/20 blur-3xl" />

            <div className="relative flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
              <div className="max-w-2xl">
                <p className="text-[10px] font-black uppercase tracking-[0.16em] text-sky-400">
                  For Business Owners
                </p>

                <h2 className="mt-3 text-3xl font-black tracking-tight text-white sm:text-4xl">
                  Put your business in front of local customers.
                </h2>

                <p className="mt-4 text-sm leading-6 text-slate-300 sm:text-base">
                  Create your LocalPlatform listing, add your
                  services and location, and make your business
                  easier to discover.
                </p>
              </div>

              <Link
                href="/list-business"
                className="shrink-0 rounded-2xl bg-white px-6 py-4 text-center text-sm font-black text-slate-950 shadow-xl transition hover:-translate-y-1 hover:bg-slate-100"
              >
                List Your Business →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ================= FOOTER ================= */}
      <footer className="border-t border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-5 px-4 py-8 sm:px-6 md:flex-row md:items-center md:justify-between lg:px-8">
          <div>
            <div className="font-black">
              LocalPlatform
            </div>

            <p className="mt-1 text-xs text-slate-400">
              Discover local businesses. Connect locally.
            </p>
          </div>

          <div className="flex flex-wrap gap-5 text-xs font-semibold text-slate-500">
            <Link href="/" className="hover:text-slate-950">
              Home
            </Link>

            <Link
              href="/search"
              className="hover:text-slate-950"
            >
              Search
            </Link>

            <Link
              href="/list-business"
              className="hover:text-slate-950"
            >
              List Business
            </Link>

            <Link
              href="/dashboard"
              className="hover:text-slate-950"
            >
              Dashboard
            </Link>

            <Link
              href="/login"
              className="hover:text-slate-950"
            >
              Login
            </Link>
          </div>
        </div>

        <div className="border-t border-slate-100 py-4 text-center text-[10px] text-slate-400">
          © {new Date().getFullYear()} LocalPlatform. All rights reserved.
        </div>
      </footer>
    </main>
  );
}

/* ================= BUSINESS CARD ================= */

function BusinessCard({
  business,
}: {
  business: Business;
}) {
  return (
    <article className="group overflow-hidden rounded-[22px] border border-slate-200 bg-white shadow-sm transition duration-300 hover:-translate-y-1.5 hover:shadow-2xl">
      <Link href={`/business/${business.id}`}>
        <div className="relative h-52 overflow-hidden bg-slate-100">
          {business.image_url ? (
            <img
              src={business.image_url}
              alt={business.business_name}
              className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white text-2xl font-black text-slate-300 shadow-sm">
                L
              </div>
            </div>
          )}

          <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/50 to-transparent" />

          <div className="absolute left-4 top-4 rounded-full bg-white/95 px-3 py-1.5 text-[10px] font-black text-slate-800 shadow-lg">
            {business.category}
          </div>
        </div>
      </Link>

      <div className="p-5">
        <Link href={`/business/${business.id}`}>
          <h3 className="line-clamp-1 text-base font-black tracking-tight text-slate-950 transition group-hover:text-sky-600">
            {business.business_name}
          </h3>
        </Link>

        {business.subcategory && (
          <p className="mt-1 text-xs font-bold text-sky-600">
            {business.subcategory}
          </p>
        )}

        <div className="mt-3 flex items-start gap-2 text-xs text-slate-500">
          <span className="mt-0.5">◉</span>

          <span className="line-clamp-1">
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
            <div className="mt-4 flex flex-wrap gap-1.5">
              {business.services
                .slice(0, 3)
                .map((service) => (
                  <span
                    key={service}
                    className="rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-semibold text-slate-600"
                  >
                    {service}
                  </span>
                ))}
            </div>
          )}

        <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-4">
          <span className="text-xs font-black text-slate-950">
            View Business
          </span>

          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 text-sm font-bold transition group-hover:bg-slate-950 group-hover:text-white">
            →
          </span>
        </div>
      </div>
    </article>
  );
}