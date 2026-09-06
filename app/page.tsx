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

      {/* HERO / SEARCH */}
      <section className="bg-gradient-to-b from-slate-950 via-slate-900 to-slate-800 text-white">
        <div className="mx-auto max-w-7xl px-4 pb-10 pt-8 sm:px-6 sm:pb-14 sm:pt-12 lg:px-8">
          <div className="mx-auto max-w-5xl text-center">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-3 py-1.5 text-[9px] font-bold uppercase tracking-[0.15em] text-sky-200 sm:text-[10px]">
              <span className="h-1.5 w-1.5 rounded-full bg-sky-400" />
              India's Local Business Directory
            </div>

            <h1 className="text-[36px] font-black leading-[1.04] tracking-[-0.04em] sm:text-5xl lg:text-6xl">
              Find local businesses
              <span className="block text-sky-300">near you</span>
            </h1>

            <p className="mx-auto mt-3 max-w-2xl text-xs leading-5 text-slate-300 sm:text-sm sm:leading-6">
              Search trusted shops, professionals, services and businesses by
              category, service and city.
            </p>

            <div className="mx-auto mt-6 max-w-5xl rounded-2xl bg-white p-2 shadow-2xl sm:mt-8 sm:rounded-[22px]">
              <div className="grid gap-2 md:grid-cols-[1.15fr_0.8fr_auto]">
                <div className="flex min-w-0 items-center rounded-xl border border-slate-200 bg-slate-50 px-3.5">
                  <SearchIcon />
                  <input
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") search();
                    }}
                    placeholder="Business, service or category"
                    className="h-11 w-full min-w-0 bg-transparent text-sm font-medium text-slate-900 outline-none placeholder:text-slate-400 sm:h-12"
                  />
                </div>

                <div className="flex min-w-0 items-center rounded-xl border border-slate-200 bg-slate-50 px-3.5">
                  <LocationIcon />
                  <input
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") search();
                    }}
                    placeholder="City or area"
                    className="h-11 w-full min-w-0 bg-transparent text-sm font-medium text-slate-900 outline-none placeholder:text-slate-400 sm:h-12"
                  />
                </div>

                <button
                  type="button"
                  onClick={search}
                  className="h-11 rounded-xl bg-sky-600 px-7 text-sm font-black text-white transition hover:bg-sky-500 sm:h-12"
                >
                  Search
                </button>
              </div>
            </div>

            <div className="mt-3 flex flex-wrap items-center justify-center gap-1.5">
              <span className="mr-1 text-[10px] text-slate-400">Popular:</span>
              {popularSearches.map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => categorySearch(item)}
                  className="rounded-full border border-white/10 bg-white/10 px-3 py-1.5 text-[10px] font-semibold text-slate-200 hover:bg-white/15"
                >
                  {item}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* QUICK CATEGORIES */}
      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-7 sm:px-6 sm:py-10 lg:px-8">
          <div className="flex items-end justify-between gap-3">
            <div>
              <p className="text-[9px] font-black uppercase tracking-[0.16em] text-sky-600 sm:text-[10px]">
                Explore
              </p>
              <h2 className="mt-1 text-xl font-black tracking-tight sm:text-2xl">
                Popular categories
              </h2>
            </div>
            <Link
              href="/search"
              className="rounded-lg border border-slate-200 px-3 py-2 text-[10px] font-black text-slate-700 sm:text-xs"
            >
              View All →
            </Link>
          </div>

          <div className="mt-5 grid grid-cols-4 gap-x-2 gap-y-4 sm:grid-cols-6 sm:gap-3 lg:grid-cols-8">
            {[
              ...categories,
              {
                name: "Plumber",
                label: "Home Service",
                bg: "bg-cyan-50",
                text: "text-cyan-600",
                icon: <PlumberIcon />,
              },
              {
                name: "Painter",
                label: "Home Service",
                bg: "bg-orange-50",
                text: "text-orange-600",
                icon: <PainterIcon />,
              },
              {
                name: "Dentist",
                label: "Dental",
                bg: "bg-red-50",
                text: "text-red-600",
                icon: <DentistIcon />,
              },
              {
                name: "Gym",
                label: "Fitness",
                bg: "bg-emerald-50",
                text: "text-emerald-600",
                icon: <GymIcon />,
              },
              {
                name: "Hotel",
                label: "Hotels",
                bg: "bg-indigo-50",
                text: "text-indigo-600",
                icon: <HotelIcon />,
              },
              {
                name: "Lawyer",
                label: "Legal",
                bg: "bg-slate-100",
                text: "text-slate-700",
                icon: <LawyerIcon />,
              },
              {
                name: "Photographer",
                label: "Events",
                bg: "bg-fuchsia-50",
                text: "text-fuchsia-600",
                icon: <CameraIcon />,
              },
              {
                name: "Automobile",
                label: "Auto",
                bg: "bg-blue-50",
                text: "text-blue-600",
                icon: <CarIcon />,
              },
            ].map((category) => (
              <button
                key={category.name}
                type="button"
                onClick={() => categorySearch(category.name)}
                className="group flex min-h-[78px] flex-col items-center justify-center rounded-xl bg-white px-0.5 py-1 transition active:scale-95 sm:min-h-[100px] sm:rounded-2xl sm:border sm:border-slate-200 sm:px-1 sm:py-2 sm:shadow-sm sm:hover:-translate-y-0.5 sm:hover:shadow-md"
              >
                <div
                  className={`flex h-11 w-11 items-center justify-center rounded-full ${category.bg} ${category.text} shadow-sm transition group-hover:scale-105 sm:h-12 sm:w-12 sm:rounded-2xl`}
                >
                  {category.icon}
                </div>
                <span className="mt-1.5 line-clamp-2 min-h-[24px] w-full text-center text-[9px] font-bold leading-3 text-slate-700 sm:mt-2 sm:text-[10px]">
                  {category.name}
                </span>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* PAID HOME TOP ADS */}
      <HomeTopAds />

      {/* SEARCH RESULTS */}
      {(query || location) && (
        <section className="border-y border-slate-200 bg-slate-50">
          <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
            <div className="mb-5 flex items-end justify-between gap-3">
              <div>
                <p className="text-[9px] font-black uppercase tracking-[0.16em] text-sky-600">
                  Search Results
                </p>
                <h2 className="mt-1 text-xl font-black sm:text-2xl">
                  Matching businesses
                </h2>
              </div>
              <Link
                href={`/search?q=${encodeURIComponent(query)}&location=${encodeURIComponent(location)}`}
                className="text-xs font-black text-sky-600"
              >
                View all →
              </Link>
            </div>

            {loading ? (
              <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center text-sm text-slate-500">
                Finding businesses...
              </div>
            ) : searchResults.length === 0 ? (
              <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100">
                  <SearchIcon />
                </div>
                <h3 className="mt-4 font-black">No matching business found</h3>
                <p className="mt-1 text-xs text-slate-500">
                  Try another business, service or location.
                </p>
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {searchResults.map((business) => (
                  <BusinessCard key={business.id} business={business} />
                ))}
              </div>
            )}
          </div>
        </section>
      )}

      {/* HOME SERVICES */}
      <section className="bg-slate-50">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
          <div className="flex items-end justify-between gap-3">
            <div>
              <p className="text-[9px] font-black uppercase tracking-[0.16em] text-sky-600">
                Home Services
              </p>
              <h2 className="mt-1 text-xl font-black sm:text-2xl">
                Services at your doorstep
              </h2>
            </div>
            <Link href="/search" className="text-xs font-black text-slate-700">
              See all →
            </Link>
          </div>

          <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
            {[
              ["AC Repair & Service", "AC Repair", "❄️"],
              ["Plumbers", "Plumber", "🔧"],
              ["Electricians", "Electrician", "⚡"],
              ["Painters", "Painter", "🎨"],
              ["Pest Control", "Pest Control", "🛡️"],
              ["Carpenters", "Carpenter", "🪚"],
            ].map(([name, queryValue, icon]) => (
              <button
                key={name}
                type="button"
                onClick={() => categorySearch(queryValue)}
                className="group relative min-h-[126px] overflow-hidden rounded-2xl border border-slate-200 bg-white p-4 text-left shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
              >
                <span className="text-3xl">{icon}</span>
                <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-slate-950/75 to-transparent px-4 pb-3 pt-10 text-xs font-black text-white">
                  {name}
                </span>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* TRENDING SEARCHES */}
      <section className="bg-white">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
          <p className="text-[9px] font-black uppercase tracking-[0.16em] text-sky-600">
            Trending
          </p>
          <h2 className="mt-1 text-xl font-black sm:text-2xl">
            Popular searches near you
          </h2>

          <div className="mt-5 flex flex-wrap gap-2">
            {[
              "Architects",
              "Interior Designers",
              "Doctors",
              "Dentists",
              "Restaurants",
              "Salons",
              "Packers & Movers",
              "Real Estate",
            ].map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => categorySearch(item)}
                className="rounded-full border border-slate-200 bg-white px-4 py-2.5 text-xs font-bold text-slate-700 shadow-sm hover:border-sky-300 hover:text-sky-600"
              >
                {item}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURED BUSINESSES */}
      <section className="border-y border-slate-200 bg-slate-50">
        <div className="mx-auto max-w-7xl px-4 py-9 sm:px-6 sm:py-14 lg:px-8">
          <div className="flex items-end justify-between gap-3">
            <div>
              <p className="text-[9px] font-black uppercase tracking-[0.16em] text-sky-600">
                Discover
              </p>
              <h2 className="mt-1 text-xl font-black sm:text-3xl">
                Featured local businesses
              </h2>
              <p className="mt-1 text-xs text-slate-500">
                Recently listed active businesses.
              </p>
            </div>
            <Link
              href="/search"
              className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-black shadow-sm"
            >
              View all
            </Link>
          </div>

          {loading ? (
            <div className="mt-7 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, index) => (
                <div
                  key={index}
                  className="h-[350px] animate-pulse rounded-[22px] bg-white"
                />
              ))}
            </div>
          ) : featuredBusinesses.length === 0 ? (
            <div className="mt-7 rounded-2xl border border-slate-200 bg-white px-5 py-12 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-sky-50 text-sky-600">
                <BuildingIcon />
              </div>
              <h3 className="mt-4 font-black">Businesses coming soon</h3>
              <p className="mx-auto mt-2 max-w-md text-xs text-slate-500">
                Be one of the first businesses listed on LocalPlatform.
              </p>
              <Link
                href="/list-business"
                className="mt-5 inline-flex rounded-xl bg-slate-950 px-5 py-3 text-xs font-black text-white"
              >
                List Your Business FREE →
              </Link>
            </div>
          ) : (
            <div className="mt-7 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {featuredBusinesses.map((business) => (
                <BusinessCard key={business.id} business={business} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* BUSINESS OWNER CTA */}
      <section className="bg-white">
        <div className="mx-auto max-w-7xl px-4 py-9 sm:px-6 sm:py-14 lg:px-8">
          <div className="overflow-hidden rounded-[26px] bg-slate-950 px-6 py-8 sm:rounded-[32px] sm:px-10 sm:py-12 lg:px-14">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
              <div className="max-w-2xl">
                <p className="text-[9px] font-black uppercase tracking-[0.16em] text-sky-400">
                  For Business Owners
                </p>
                <h2 className="mt-2 text-2xl font-black tracking-tight text-white sm:text-4xl">
                  Get your business discovered locally.
                </h2>
                <p className="mt-3 text-xs leading-5 text-slate-300 sm:text-sm sm:leading-6">
                  Create your listing, add services and location, and connect
                  with customers searching for businesses like yours.
                </p>
              </div>

              <Link
                href="/list-business"
                className="shrink-0 rounded-xl bg-sky-500 px-6 py-3.5 text-center text-xs font-black text-white shadow-xl transition hover:bg-sky-400 sm:rounded-2xl sm:px-7 sm:py-4 sm:text-sm"
              >
                List Your Business FREE →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-5 px-4 py-7 sm:px-6 md:flex-row md:items-center md:justify-between lg:px-8">
          <div>
            <div className="text-sm font-black">LocalPlatform</div>
            <p className="mt-1 text-[10px] text-slate-400 sm:text-xs">
              Discover local businesses. Connect locally.
            </p>
          </div>

          <div className="flex flex-wrap gap-4 text-[10px] font-semibold text-slate-500 sm:text-xs">
            <Link href="/" className="hover:text-slate-950">Home</Link>
            <Link href="/search" className="hover:text-slate-950">Search</Link>
            <Link href="/list-business" className="hover:text-slate-950">List Business</Link>
            <Link href="/dashboard" className="hover:text-slate-950">Dashboard</Link>
            <Link href="/login" className="hover:text-slate-950">Login</Link>
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


function PlumberIcon() {
  return (
    <svg width="25" height="25" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M7 4v7a5 5 0 0 0 10 0V8" />
      <path d="M7 4H4v4h3" />
      <path d="M17 8h3v4h-3" />
      <path d="M12 16v5" />
      <path d="M9 21h6" />
    </svg>
  );
}

function PainterIcon() {
  return (
    <svg width="25" height="25" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 7h12a2 2 0 0 0 2-2V3H6v2" />
      <path d="M9 7v5a3 3 0 0 0 3 3h1v6" />
      <path d="M13 21h4" />
      <path d="M18 3h2v2h-2" />
    </svg>
  );
}

function DentistIcon() {
  return (
    <svg width="25" height="25" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M7 4c2-2 4 1 5 1s3-3 5-1c3 2 1 7 0 10-.8 2.4-1.3 6-3 6-1.8 0-1.4-5-4-5s-2.2 5-4 5c-1.7 0-2.2-3.6-3-6C2 11 4 6 7 4Z" />
      <path d="M12 6v3" />
      <path d="M10.5 7.5h3" />
    </svg>
  );
}

function GymIcon() {
  return (
    <svg width="25" height="25" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 9v6" />
      <path d="M7 7v10" />
      <path d="M17 7v10" />
      <path d="M20 9v6" />
      <path d="M7 12h10" />
      <path d="M2 10h2" />
      <path d="M20 10h2" />
    </svg>
  );
}

function HotelIcon() {
  return (
    <svg width="25" height="25" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 21V5h16v16" />
      <path d="M7 8h2" />
      <path d="M15 8h2" />
      <path d="M7 12h2" />
      <path d="M15 12h2" />
      <path d="M9 21v-5h6v5" />
      <path d="M2 21h20" />
    </svg>
  );
}

function LawyerIcon() {
  return (
    <svg width="25" height="25" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 4v16" />
      <path d="M5 7h14" />
      <path d="m7 7-3 5a3 3 0 0 0 6 0L7 7Z" />
      <path d="m17 7-3 5a3 3 0 0 0 6 0l-3-5Z" />
      <path d="M8 21h8" />
    </svg>
  );
}

function CameraIcon() {
  return (
    <svg width="25" height="25" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 7h4l2-2h4l2 2h4v12H4V7Z" />
      <circle cx="12" cy="13" r="3.5" />
    </svg>
  );
}

function CarIcon() {
  return (
    <svg width="25" height="25" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="m5 11 2-5h10l2 5" />
      <path d="M3 11h18v7H3z" />
      <circle cx="7" cy="18" r="1.5" />
      <circle cx="17" cy="18" r="1.5" />
      <path d="M5 14h2" />
      <path d="M17 14h2" />
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