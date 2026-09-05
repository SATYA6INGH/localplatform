"use client";

import { useEffect, useMemo, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import Link from "next/link";
import HomeTopAds from "./components/HomeTopAds";

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

type Category = {
  name: string;
  label: string;
  bg: string;
  text: string;
  icon: React.ReactNode;
};

const categories: Category[] = [
  {
    name: "Architect",
    label: "Architecture",
    bg: "bg-blue-50",
    text: "text-blue-600",
    icon: <BuildingIcon />,
  },
  {
    name: "Interior Designer",
    label: "Interior",
    bg: "bg-violet-50",
    text: "text-violet-600",
    icon: <InteriorIcon />,
  },
  {
    name: "Construction",
    label: "Builders",
    bg: "bg-orange-50",
    text: "text-orange-600",
    icon: <ConstructionIcon />,
  },
  {
    name: "Doctor",
    label: "Healthcare",
    bg: "bg-red-50",
    text: "text-red-600",
    icon: <DoctorIcon />,
  },
  {
    name: "Restaurant",
    label: "Food",
    bg: "bg-rose-50",
    text: "text-rose-600",
    icon: <RestaurantIcon />,
  },
  {
    name: "Salon",
    label: "Beauty",
    bg: "bg-pink-50",
    text: "text-pink-600",
    icon: <SalonIcon />,
  },
  {
    name: "Electrician",
    label: "Electrical",
    bg: "bg-amber-50",
    text: "text-amber-600",
    icon: <ElectricIcon />,
  },
  {
    name: "Real Estate",
    label: "Property",
    bg: "bg-emerald-50",
    text: "text-emerald-600",
    icon: <PropertyIcon />,
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
        const name =
          business.business_name?.toLowerCase() || "";

        const category =
          business.category?.toLowerCase() || "";

        const subcategory =
          business.subcategory?.toLowerCase() || "";

        const city =
          business.city?.toLowerCase() || "";

        const area =
          business.area?.toLowerCase() || "";

        const description =
          business.description?.toLowerCase() || "";

        const services =
          business.services?.join(" ").toLowerCase() || "";

        let score = 0;

        if (q) {
          if (name.includes(q)) score += 100;
          if (category.includes(q)) score += 80;
          if (subcategory.includes(q)) score += 70;
          if (services.includes(q)) score += 60;
          if (city.includes(q)) score += 50;
          if (area.includes(q)) score += 40;
          if (description.includes(q)) score += 20;
        }

        if (loc) {
          if (city.includes(loc)) score += 60;
          if (area.includes(loc)) score += 50;
        }

        return {
          business,
          score,
        };
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
      params.toString()
        ? `?${params.toString()}`
        : ""
    }`;
  }

  function categorySearch(category: string) {
    window.location.href =
      `/search?q=${encodeURIComponent(category)}`;
  }

  return (
    <main className="min-h-screen overflow-x-hidden bg-white text-slate-900">

      {/* =====================================================
          HERO
      ====================================================== */}

      <section className="relative overflow-hidden bg-slate-950">

        <div
          className="pointer-events-none absolute inset-0 opacity-[0.045]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,.7) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.7) 1px, transparent 1px)",
            backgroundSize: "38px 38px",
          }}
        />

        <div className="pointer-events-none absolute -right-40 -top-40 h-[480px] w-[480px] rounded-full bg-sky-500/20 blur-[100px]" />

        <div className="pointer-events-none absolute -bottom-40 -left-40 h-[480px] w-[480px] rounded-full bg-violet-500/15 blur-[100px]" />

        <div className="relative mx-auto max-w-7xl px-4 pb-14 pt-12 sm:px-6 sm:pb-20 sm:pt-20 lg:px-8 lg:pb-24 lg:pt-24">

          <div className="mx-auto max-w-5xl text-center">

            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.07] px-3.5 py-2 text-[9px] font-bold tracking-[0.13em] text-slate-300 sm:px-4 sm:text-xs">
              <span className="h-1.5 w-1.5 rounded-full bg-sky-400 shadow-lg shadow-sky-400/50 sm:h-2 sm:w-2" />
              LOCAL BUSINESS DISCOVERY
            </div>

            <h1 className="text-[40px] font-black leading-[1] tracking-[-0.045em] text-white sm:text-6xl lg:text-7xl">
              Find the right
              <span className="block bg-gradient-to-r from-cyan-300 via-sky-400 to-violet-400 bg-clip-text pb-2 text-transparent">
                business near you.
              </span>
            </h1>

            <p className="mx-auto mt-5 max-w-2xl text-sm leading-6 text-slate-300 sm:mt-6 sm:text-base sm:leading-7 lg:text-lg">
              Discover local professionals, services and businesses
              by category, service and location.
            </p>

            {/* SEARCH BOX */}

            <div className="mx-auto mt-8 max-w-4xl rounded-[22px] border border-white/10 bg-white p-2 shadow-2xl shadow-black/40 sm:mt-9 sm:rounded-[25px]">

              <div className="grid gap-2 md:grid-cols-[1fr_0.72fr_auto]">

                <div className="flex min-w-0 items-center rounded-2xl border border-slate-200 bg-slate-50 px-3.5 sm:px-4">

                  <SearchIcon />

                  <input
                    value={query}
                    onChange={(e) =>
                      setQuery(e.target.value)
                    }
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        search();
                      }
                    }}
                    placeholder="Business, service or category"
                    className="h-11 w-full min-w-0 bg-transparent text-sm font-medium outline-none placeholder:text-slate-400 sm:h-12"
                  />

                </div>

                <div className="flex min-w-0 items-center rounded-2xl border border-slate-200 bg-slate-50 px-3.5 sm:px-4">

                  <LocationIcon />

                  <input
                    value={location}
                    onChange={(e) =>
                      setLocation(e.target.value)
                    }
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        search();
                      }
                    }}
                    placeholder="City or area"
                    className="h-11 w-full min-w-0 bg-transparent text-sm font-medium outline-none placeholder:text-slate-400 sm:h-12"
                  />

                </div>

                <button
                  onClick={search}
                  className="h-11 rounded-2xl bg-slate-950 px-7 text-sm font-black text-white transition hover:bg-slate-800 sm:h-12 sm:px-8"
                >
                  Search
                </button>

              </div>
            </div>

            {/* POPULAR */}

            <div className="mt-4 flex flex-wrap items-center justify-center gap-1.5 sm:mt-5 sm:gap-2">

              <span className="mr-1 text-[10px] font-medium text-slate-500 sm:text-[11px]">
                Popular:
              </span>

              {popularSearches.map((item) => (
                <button
                  key={item}
                  onClick={() => categorySearch(item)}
                  className="rounded-full border border-white/10 bg-white/[0.06] px-3 py-1.5 text-[10px] font-semibold text-slate-300 transition hover:bg-white/10 hover:text-white sm:px-3.5 sm:py-2 sm:text-[11px]"
                >
                  {item}
                </button>
              ))}

            </div>

          </div>
        </div>
      </section>

      {/* =====================================================
          PAID HOME TOP ADS
      ====================================================== */}

      <HomeTopAds />

      {/* =====================================================
          SEARCH RESULTS
      ====================================================== */}

      {(query || location) && (
        <section className="border-b border-slate-200 bg-slate-50">

          <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8">

            <div className="mb-5 flex items-end justify-between">

              <div>

                <p className="text-[9px] font-black uppercase tracking-[0.16em] text-sky-600 sm:text-[10px]">
                  Search Results
                </p>

                <h2 className="mt-1.5 text-xl font-black tracking-tight sm:text-2xl">
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

              <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center text-sm text-slate-500">
                Finding businesses...
              </div>

            ) : searchResults.length === 0 ? (

              <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center sm:p-10">

                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100">
                  <SearchIcon />
                </div>

                <h3 className="mt-4 font-black">
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

      {/* =====================================================
          CATEGORIES
      ====================================================== */}

      <section className="bg-white">

        <div className="mx-auto max-w-7xl px-4 py-11 sm:px-6 sm:py-16 lg:px-8 lg:py-20">

          <div className="flex items-end justify-between gap-3">

            <div>

              <div className="mb-2 inline-flex rounded-full bg-sky-50 px-2.5 py-1 text-[9px] font-black uppercase tracking-[0.14em] text-sky-600 sm:px-3 sm:py-1.5 sm:text-[10px]">
                Explore Categories
              </div>

              <h2 className="text-2xl font-black tracking-tight sm:text-4xl">
                What are you looking for?
              </h2>

              <p className="mt-1.5 max-w-xl text-xs leading-5 text-slate-500 sm:mt-2 sm:text-sm sm:leading-6">
                Explore popular local services and professionals.
              </p>

            </div>

            <Link
              href="/search"
              className="shrink-0 text-[10px] font-black text-slate-900 sm:text-xs"
            >
              All →
            </Link>

          </div>

          {/* =================================================
              COMPACT MOBILE CATEGORY GRID
          ================================================== */}

          <div className="mt-6 grid grid-cols-4 gap-2 sm:mt-9 sm:grid-cols-4 sm:gap-3 lg:grid-cols-8">

            {categories.map((category) => (
              <button
                key={category.name}
                onClick={() =>
                  categorySearch(category.name)
                }
                className="group flex min-h-[86px] flex-col items-center justify-center rounded-xl border border-slate-200 bg-white px-1.5 py-2 shadow-sm transition duration-200 active:scale-95 hover:-translate-y-0.5 hover:shadow-md sm:min-h-[105px] sm:rounded-2xl sm:px-2 sm:py-3"
              >

                {/* SMALL COLOUR ICON */}

                <div
                  className={`flex h-9 w-9 items-center justify-center rounded-full ${category.bg} ${category.text} transition duration-200 group-hover:scale-105 sm:h-11 sm:w-11 sm:rounded-2xl`}
                >
                  {category.icon}
                </div>

                <span className="mt-2 line-clamp-2 min-h-[26px] w-full text-center text-[9px] font-bold leading-3 text-slate-700 sm:mt-2.5 sm:text-[10px] sm:leading-3.5">
                  {category.name}
                </span>

                <span className="hidden text-[9px] font-medium text-slate-400 sm:block">
                  {category.label}
                </span>

              </button>
            ))}

          </div>
        </div>
      </section>

      {/* =====================================================
          FEATURED BUSINESSES
      ====================================================== */}

      <section className="relative overflow-hidden border-y border-slate-200 bg-slate-50">

        <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-sky-100/70 blur-3xl" />

        <div className="relative mx-auto max-w-7xl px-4 py-11 sm:px-6 sm:py-16 lg:px-8 lg:py-20">

          <div className="flex items-end justify-between gap-3">

            <div>

              <div className="mb-2 inline-flex rounded-full bg-white px-2.5 py-1 text-[9px] font-black uppercase tracking-[0.14em] text-sky-600 shadow-sm sm:px-3 sm:py-1.5 sm:text-[10px]">
                Discover
              </div>

              <h2 className="text-2xl font-black tracking-tight sm:text-4xl">
                Local businesses
              </h2>

              <p className="mt-1.5 text-xs text-slate-500 sm:text-sm">
                Recently listed active businesses.
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

            <div className="mt-7 grid gap-4 sm:mt-9 sm:grid-cols-2 lg:grid-cols-3">

              {Array.from({ length: 6 }).map((_, index) => (
                <div
                  key={index}
                  className="h-[350px] animate-pulse rounded-[22px] bg-white"
                />
              ))}

            </div>

          ) : featuredBusinesses.length === 0 ? (

            <div className="mt-7 rounded-2xl border border-slate-200 bg-white px-5 py-12 text-center sm:mt-9 sm:rounded-[28px] sm:px-6 sm:py-16">

              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
                <BuildingIcon />
              </div>

              <h3 className="mt-4 text-base font-black sm:text-lg">
                Businesses coming soon
              </h3>

              <p className="mx-auto mt-2 max-w-md text-xs leading-5 text-slate-500 sm:text-sm sm:leading-6">
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

            <div className="mt-7 grid gap-4 sm:mt-9 sm:grid-cols-2 lg:grid-cols-3">

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

      {/* =====================================================
          BUSINESS OWNER CTA
      ====================================================== */}

      <section className="bg-white">

        <div className="mx-auto max-w-7xl px-4 py-11 sm:px-6 sm:py-16 lg:px-8 lg:py-20">

          <div className="relative overflow-hidden rounded-[25px] bg-slate-950 px-6 py-9 sm:rounded-[32px] sm:px-10 sm:py-12 lg:px-14 lg:py-14">

            <div className="pointer-events-none absolute -right-24 -top-32 h-72 w-72 rounded-full bg-sky-500/20 blur-[80px]" />

            <div className="relative flex flex-col gap-7 lg:flex-row lg:items-center lg:justify-between">

              <div className="max-w-2xl">

                <div className="inline-flex rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-[9px] font-black uppercase tracking-[0.15em] text-sky-400 sm:text-[10px]">
                  For Business Owners
                </div>

                <h2 className="mt-3 text-2xl font-black tracking-tight text-white sm:text-4xl">
                  Make your business easier to discover.
                </h2>

                <p className="mt-3 text-xs leading-5 text-slate-300 sm:mt-4 sm:text-base sm:leading-6">
                  Create your LocalPlatform listing and connect
                  with customers searching for your services.
                </p>

              </div>

              <Link
                href="/list-business"
                className="shrink-0 rounded-xl bg-white px-5 py-3.5 text-center text-xs font-black text-slate-950 shadow-xl transition hover:-translate-y-1 hover:bg-slate-100 sm:rounded-2xl sm:px-6 sm:py-4 sm:text-sm"
              >
                List Your Business →
              </Link>

            </div>

          </div>
        </div>
      </section>

      {/* =====================================================
          FOOTER
      ====================================================== */}

      <footer className="border-t border-slate-200 bg-white">

        <div className="mx-auto flex max-w-7xl flex-col gap-5 px-4 py-7 sm:px-6 sm:py-8 md:flex-row md:items-center md:justify-between lg:px-8">

          <div>
            <div className="text-sm font-black">
              LocalPlatform
            </div>

            <p className="mt-1 text-[10px] text-slate-400 sm:text-xs">
              Discover local businesses. Connect locally.
            </p>
          </div>

          <div className="flex flex-wrap gap-4 text-[10px] font-semibold text-slate-500 sm:gap-5 sm:text-xs">

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

        <div className="border-t border-slate-100 py-3 text-center text-[9px] text-slate-400 sm:py-4 sm:text-[10px]">
          © {new Date().getFullYear()} LocalPlatform. All rights reserved.
        </div>

      </footer>
    </main>
  );
}

/* =========================================================
   BUSINESS CARD
========================================================= */

function BusinessCard({
  business,
}: {
  business: Business;
}) {
  return (
    <article className="group overflow-hidden rounded-[20px] border border-slate-200 bg-white shadow-sm transition duration-300 hover:-translate-y-1.5 hover:shadow-xl sm:rounded-[24px]">

      <Link href={`/business/${business.id}`}>

        <div className="relative h-44 overflow-hidden bg-slate-100 sm:h-52">

          {business.image_url ? (
            <img
              src={business.image_url}
              alt={business.business_name}
              className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full items-center justify-center bg-gradient-to-br from-slate-100 via-white to-slate-200">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-blue-600 shadow-lg sm:h-16 sm:w-16">
                <BuildingIcon />
              </div>
            </div>
          )}

          <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/55 to-transparent" />

          <div className="absolute left-3 top-3 rounded-full bg-white/95 px-2.5 py-1.5 text-[9px] font-black text-slate-800 shadow-lg sm:left-4 sm:top-4 sm:px-3 sm:text-[10px]">
            {business.category}
          </div>

        </div>
      </Link>

      <div className="p-4 sm:p-5">

        <Link href={`/business/${business.id}`}>
          <h3 className="line-clamp-1 text-sm font-black tracking-tight text-slate-950 transition group-hover:text-sky-600 sm:text-base">
            {business.business_name}
          </h3>
        </Link>

        {business.subcategory && (
          <p className="mt-1 text-[10px] font-bold text-sky-600 sm:text-xs">
            {business.subcategory}
          </p>
        )}

        <div className="mt-2.5 flex items-start gap-1.5 text-[10px] text-slate-500 sm:mt-3 sm:gap-2 sm:text-xs">

          <LocationIcon small />

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
          <p className="mt-2.5 line-clamp-2 text-[10px] leading-4 text-slate-500 sm:mt-3 sm:text-xs sm:leading-5">
            {business.short_description ||
              business.description}
          </p>
        )}

        {business.services &&
          business.services.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-1 sm:mt-4 sm:gap-1.5">

              {business.services
                .slice(0, 3)
                .map((service) => (
                  <span
                    key={service}
                    className="rounded-full bg-slate-100 px-2 py-1 text-[8px] font-semibold text-slate-600 sm:px-2.5 sm:text-[10px]"
                  >
                    {service}
                  </span>
                ))}

            </div>
          )}

        <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3.5 sm:mt-5 sm:pt-4">

          <span className="text-[10px] font-black text-slate-950 sm:text-xs">
            View Business
          </span>

          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-100 text-xs font-bold transition group-hover:bg-slate-950 group-hover:text-white sm:h-9 sm:w-9 sm:text-sm">
            →
          </span>

        </div>

      </div>
    </article>
  );
}

/* =========================================================
   SVG ICONS
========================================================= */

function BuildingIcon() {
  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M3 21h18" />
      <path d="M5 21V5l7-3 7 3v16" />
      <path d="M9 21v-4h6v4" />
      <path d="M8 8h1" />
      <path d="M15 8h1" />
      <path d="M8 12h1" />
      <path d="M15 12h1" />
    </svg>
  );
}

function InteriorIcon() {
  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <path d="M3 9h18" />
      <path d="M9 9v12" />
      <path d="M14 14h4" />
      <path d="M14 17h3" />
    </svg>
  );
}

function ConstructionIcon() {
  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M3 21h18" />
      <path d="M5 21V8l7-5 7 5v13" />
      <path d="M8 21v-5h8v5" />
      <path d="M8 10h2" />
      <path d="M14 10h2" />
    </svg>
  );
}

function DoctorIcon() {
  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M8 3v6a4 4 0 0 0 8 0V3" />
      <path d="M6 3h4" />
      <path d="M14 3h4" />
      <path d="M12 13v4" />
      <path d="M9 20h6" />
      <path d="M10 17h4" />
    </svg>
  );
}

function RestaurantIcon() {
  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M7 3v7" />
      <path d="M4 3v4a3 3 0 0 0 6 0V3" />
      <path d="M7 10v11" />
      <path d="M17 3v18" />
      <path d="M17 3c3 2 3 7 0 9" />
    </svg>
  );
}

function SalonIcon() {
  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="6" cy="7" r="3" />
      <circle cx="6" cy="17" r="3" />
      <path d="m8 9 11 11" />
      <path d="m8 15 11-11" />
    </svg>
  );
}

function ElectricIcon() {
  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="currentColor"
    >
      <path d="M13.4 2 4 13h6.1L9 22l9.8-12h-6.2z" />
    </svg>
  );
}

function PropertyIcon() {
  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M3 21h18" />
      <path d="M5 21V9l7-6 7 6v12" />
      <path d="M9 21v-6h6v6" />
      <path d="M9 10h1" />
      <path d="M14 10h1" />
    </svg>
  );
}

function SearchIcon() {
  return (
    <svg
      className="mr-2.5 shrink-0 text-slate-400"
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-4-4" />
    </svg>
  );
}

function LocationIcon({
  small = false,
}: {
  small?: boolean;
}) {
  return (
    <svg
      className={`shrink-0 ${
        small
          ? "text-slate-400"
          : "mr-2.5 text-slate-400"
      }`}
      width={small ? "14" : "18"}
      height={small ? "14" : "18"}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 1 1 16 0Z" />
      <circle cx="12" cy="10" r="2.5" />
    </svg>
  );
}