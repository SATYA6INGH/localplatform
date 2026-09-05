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
  { name: "Architect", icon: "⌂", desc: "Architecture & Design" },
  { name: "Interior Designer", icon: "◫", desc: "Interior & Decor" },
  { name: "Construction", icon: "▦", desc: "Builders & Contractors" },
  { name: "Doctor", icon: "✚", desc: "Doctors & Clinics" },
  { name: "Dentist", icon: "✦", desc: "Dental Care" },
  { name: "Restaurant", icon: "◉", desc: "Food & Dining" },
  { name: "Salon", icon: "✂", desc: "Beauty & Salon" },
  { name: "Electrician", icon: "⚡", desc: "Electrical Services" },
  { name: "Plumber", icon: "◌", desc: "Plumbing Services" },
  { name: "Real Estate", icon: "▥", desc: "Property & Real Estate" },
  { name: "Auto Repair", icon: "⚙", desc: "Vehicle Services" },
  { name: "Gym", icon: "♜", desc: "Fitness & Gym" },
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

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    const loc = location.trim().toLowerCase();

    if (!q && !loc) return [];

    return businesses
      .map((business) => {
        const text = [
          business.business_name,
          business.category,
          business.subcategory,
          business.city,
          business.area,
          business.state,
          business.description,
          business.short_description,
          ...(business.services || []),
          ...(business.highlights || []),
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();

        let score = 0;

        if (q) {
          if (business.business_name?.toLowerCase().includes(q))
            score += 100;

          if (business.category?.toLowerCase().includes(q))
            score += 80;

          if (business.subcategory?.toLowerCase().includes(q))
            score += 70;

          if (
            business.services?.some((service) =>
              service.toLowerCase().includes(q)
            )
          )
            score += 60;

          if (business.city?.toLowerCase().includes(q)) score += 50;

          if (business.area?.toLowerCase().includes(q)) score += 40;

          if (text.includes(q)) score += 20;
        }

        if (loc) {
          if (business.city?.toLowerCase().includes(loc)) score += 50;
          if (business.area?.toLowerCase().includes(loc)) score += 40;
          if (business.state?.toLowerCase().includes(loc)) score += 30;
        }

        return { business, score };
      })
      .filter((item) => item.score > 0)
      .sort((a, b) => b.score - a.score)
      .map((item) => item.business)
      .slice(0, 12);
  }, [businesses, query, location]);

  function search() {
    const params = new URLSearchParams();

    if (query.trim()) params.set("q", query.trim());
    if (location.trim()) params.set("location", location.trim());

    window.location.href = `/search${
      params.toString() ? `?${params.toString()}` : ""
    }`;
  }

  return (
    <main className="min-h-screen bg-white text-slate-900">
      {/* HEADER */}
      <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link href="/" className="flex items-center gap-2">
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
              className="text-sm font-semibold text-slate-900"
            >
              Home
            </Link>

            <Link
              href="/search"
              className="text-sm font-medium text-slate-600 transition hover:text-slate-900"
            >
              Search
            </Link>

            <Link
              href="/list-business"
              className="text-sm font-medium text-slate-600 transition hover:text-slate-900"
            >
              List Business
            </Link>

            <Link
              href="/dashboard"
              className="text-sm font-medium text-slate-600 transition hover:text-slate-900"
            >
              Dashboard
            </Link>

            <Link
              href="/login"
              className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-700"
            >
              Login
            </Link>
          </nav>

          <Link
            href="/search"
            className="rounded-lg border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700 md:hidden"
          >
            Search
          </Link>
        </div>
      </header>

      {/* HERO */}
      <section className="relative overflow-hidden bg-slate-950">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(59,130,246,0.18),transparent_35%),radial-gradient(circle_at_bottom_left,rgba(14,165,233,0.12),transparent_30%)]" />

        <div className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8 lg:py-24">
          <div className="mx-auto max-w-4xl text-center">
            <div className="mb-5 inline-flex rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-semibold tracking-wide text-slate-300">
              INDIA&apos;S LOCAL BUSINESS DISCOVERY PLATFORM
            </div>

            <h1 className="text-4xl font-bold leading-tight tracking-tight text-white sm:text-5xl lg:text-6xl">
              Find the right
              <span className="block text-sky-400">
                local business
              </span>
              near you.
            </h1>

            <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-slate-300 sm:text-lg">
              Search local businesses, services and professionals by
              category, service and location.
            </p>

            {/* SEARCH BOX */}
            <div className="mx-auto mt-9 max-w-4xl rounded-2xl bg-white p-2 shadow-2xl">
              <div className="grid gap-2 md:grid-cols-[1fr_0.8fr_auto]">
                <div className="flex items-center rounded-xl border border-slate-200 bg-white px-4">
                  <span className="mr-3 text-lg text-slate-400">
                    ⌕
                  </span>

                  <input
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") search();
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
                    onChange={(e) => setLocation(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") search();
                    }}
                    placeholder="City or area"
                    className="h-12 w-full bg-transparent text-sm outline-none placeholder:text-slate-400"
                  />
                </div>

                <button
                  onClick={search}
                  className="h-12 rounded-xl bg-slate-900 px-7 text-sm font-bold text-white transition hover:bg-slate-800"
                >
                  Search
                </button>
              </div>
            </div>

            <div className="mt-5 flex flex-wrap justify-center gap-2">
              {["Architect", "Doctor", "Restaurant", "Salon"].map(
                (item) => (
                  <button
                    key={item}
                    onClick={() => {
                      setQuery(item);
                    }}
                    className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-medium text-slate-300 transition hover:bg-white/10 hover:text-white"
                  >
                    {item}
                  </button>
                )
              )}
            </div>
          </div>
        </div>
      </section>

      {/* SEARCH RESULTS */}
      {(query || location) && (
        <section className="border-b border-slate-200 bg-slate-50">
          <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
            <div className="mb-6 flex items-end justify-between gap-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-sky-600">
                  Search Results
                </p>

                <h2 className="mt-1 text-2xl font-bold tracking-tight">
                  Businesses near you
                </h2>
              </div>

              <Link
                href={`/search?q=${encodeURIComponent(
                  query
                )}&location=${encodeURIComponent(location)}`}
                className="hidden text-sm font-semibold text-sky-600 sm:block"
              >
                View all →
              </Link>
            </div>

            {loading ? (
              <div className="rounded-2xl bg-white p-8 text-center text-sm text-slate-500">
                Loading businesses...
              </div>
            ) : results.length === 0 ? (
              <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center">
                <div className="text-3xl">⌕</div>
                <h3 className="mt-3 font-bold">
                  No matching business found
                </h3>
                <p className="mt-1 text-sm text-slate-500">
                  Try another business name, service, category or
                  location.
                </p>
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {results.slice(0, 6).map((business) => (
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

      {/* CATEGORIES */}
      <section className="bg-white">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-xs font-bold uppercase tracking-wider text-sky-600">
              Explore Categories
            </p>

            <h2 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">
              Find services for every need
            </h2>

            <p className="mt-3 text-sm leading-6 text-slate-500 sm:text-base">
              Explore trusted local professionals and businesses
              across different categories.
            </p>
          </div>

          <div className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
            {categories.map((category) => (
              <Link
                key={category.name}
                href={`/search?q=${encodeURIComponent(
                  category.name
                )}`}
                className="group rounded-2xl border border-slate-200 bg-white p-4 transition duration-200 hover:-translate-y-1 hover:border-slate-300 hover:shadow-lg"
              >
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100 text-lg font-bold text-slate-700 transition group-hover:bg-slate-900 group-hover:text-white">
                  {category.icon}
                </div>

                <h3 className="mt-4 text-sm font-bold text-slate-900">
                  {category.name}
                </h3>

                <p className="mt-1 text-[11px] leading-4 text-slate-500">
                  {category.desc}
                </p>
              </Link>
            ))}
          </div>

          <div className="mt-8 text-center">
            <Link
              href="/search"
              className="inline-flex rounded-xl border border-slate-200 px-5 py-3 text-sm font-bold text-slate-700 transition hover:border-slate-900 hover:text-slate-900"
            >
              Explore all businesses →
            </Link>
          </div>
        </div>
      </section>

      {/* OWNER CTA */}
      <section className="bg-slate-50">
        <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
          <div className="overflow-hidden rounded-3xl bg-slate-900">
            <div className="grid items-center gap-8 p-7 sm:p-10 lg:grid-cols-[1fr_auto] lg:p-14">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-sky-400">
                  For Business Owners
                </p>

                <h2 className="mt-3 text-3xl font-bold tracking-tight text-white sm:text-4xl">
                  Get your business discovered locally.
                </h2>

                <p className="mt-4 max-w-2xl text-sm leading-6 text-slate-300 sm:text-base">
                  Create your business listing, add your services and
                  location, and start reaching local customers.
                </p>
              </div>

              <Link
                href="/list-business"
                className="inline-flex items-center justify-center rounded-xl bg-white px-6 py-3.5 text-sm font-bold text-slate-900 transition hover:bg-slate-100"
              >
                List Your Business
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-8 sm:px-6 md:flex-row md:items-center md:justify-between lg:px-8">
          <div>
            <div className="font-bold">LocalPlatform</div>
            <p className="mt-1 text-xs text-slate-500">
              Discover local businesses. Connect locally.
            </p>
          </div>

          <div className="flex flex-wrap gap-5 text-xs font-medium text-slate-500">
            <Link
              href="/"
              className="hover:text-slate-900"
            >
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

function BusinessCard({
  business,
}: {
  business: Business;
}) {
  return (
    <Link
      href={`/business/${business.id}`}
      className="group overflow-hidden rounded-2xl border border-slate-200 bg-white transition duration-200 hover:-translate-y-1 hover:shadow-xl"
    >
      <div className="relative h-44 overflow-hidden bg-slate-100">
        {business.image_url ? (
          <img
            src={business.image_url}
            alt={business.business_name}
            className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-4xl text-slate-300">
            ◫
          </div>
        )}

        <div className="absolute left-3 top-3 rounded-full bg-white/95 px-3 py-1 text-[10px] font-bold text-slate-700 shadow-sm">
          {business.category}
        </div>
      </div>

      <div className="p-5">
        <h3 className="line-clamp-1 text-base font-bold text-slate-900">
          {business.business_name}
        </h3>

        {business.subcategory && (
          <p className="mt-1 text-xs font-medium text-sky-600">
            {business.subcategory}
          </p>
        )}

        <div className="mt-3 flex items-center gap-1 text-xs text-slate-500">
          <span>◉</span>
          <span className="line-clamp-1">
            {[business.area, business.city, business.state]
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

        <div className="mt-4 text-xs font-bold text-slate-900">
          View Business →
        </div>
      </div>
    </Link>
  );
}