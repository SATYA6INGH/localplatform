"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
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

const mainCategories = [
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
  { name: "Estate Agent", icon: "🏠" },
  { name: "Dentists", icon: "🦷" },
  { name: "Gym", icon: "🏋️" },
  { name: "Loans", icon: "💰" },
  { name: "Event Organisers", icon: "🎉" },
  { name: "Driving Schools", icon: "🚗" },
  { name: "Packers & Movers", icon: "📦" },
];

const serviceSections = [
  {
    title: "Wedding Requisites",
    items: [
      { name: "Banquet Halls", icon: "🏛️" },
      { name: "Catering Services", icon: "🍽️" },
      { name: "Bridal Wear", icon: "👰" },
      { name: "Makeup Artists", icon: "💄" },
    ],
  },
  {
    title: "Beauty & Spa",
    items: [
      { name: "Spa & Salons", icon: "💆" },
      { name: "Skin Care", icon: "✨" },
      { name: "Hair Care", icon: "💇" },
      { name: "Nail Art", icon: "💅" },
    ],
  },
];

export default function HomePage() {
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [search, setSearch] = useState("");
  const [location, setLocation] = useState("Lucknow");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadBusinesses();
  }, []);

  async function loadBusinesses() {
    const { data, error } = await supabase
      .from("businesses")
      .select(
        "id, business_name, category, city, phone, image_url"
      )
      .order("created_at", { ascending: false })
      .limit(12);

    if (!error && data) {
      setBusinesses(data as Business[]);
    }

    setLoading(false);
  }

  const filteredBusinesses = useMemo(() => {
    if (!search.trim()) return businesses;

    const q = search.toLowerCase();

    return businesses.filter(
      (business) =>
        business.business_name.toLowerCase().includes(q) ||
        business.category.toLowerCase().includes(q) ||
        business.city.toLowerCase().includes(q)
    );
  }, [businesses, search]);

  function submitSearch(e: React.FormEvent) {
    e.preventDefault();

    const params = new URLSearchParams();

    if (search.trim()) {
      params.set("q", search.trim());
    }

    if (location.trim()) {
      params.set("city", location.trim());
    }

    window.location.href = `/search?${params.toString()}`;
  }

  return (
    <main className="min-h-screen bg-white text-slate-900">
      {/* ================= HEADER ================= */}
      <header className="sticky top-0 z-50 border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-[1400px] items-center justify-between px-4 py-3 lg:px-8">
          {/* LOGO */}
          <Link
            href="/"
            className="text-2xl font-black tracking-tight sm:text-3xl"
          >
            <span className="text-blue-600">Local</span>
            <span className="text-orange-500">Platform</span>
          </Link>

          {/* DESKTOP NAV */}
          <nav className="hidden items-center gap-6 text-sm font-semibold lg:flex">
            <button className="flex items-center gap-1 text-slate-700">
              📍 {location}⌄
            </button>

            <button className="text-slate-700">
              🌐 EN⌄
            </button>

            <span className="text-slate-600">We are Hiring</span>

            <span className="text-slate-600">
              Investor Relations
            </span>

            <span className="rounded-lg border border-slate-300 px-4 py-2">
              👑 Leads
            </span>

            <span>📢 Advertise</span>

            <Link
              href="/list-business"
              className="font-bold text-slate-700"
            >
              🏢 Free Listing
            </Link>

            <span className="text-xl">🔔</span>

            <Link
              href="/login"
              className="rounded-lg bg-blue-600 px-5 py-3 font-bold text-white hover:bg-blue-700"
            >
              Login / Sign Up
            </Link>
          </nav>

          {/* MOBILE HEADER */}
          <div className="flex items-center gap-3 lg:hidden">
            <span className="text-xl">🔔</span>

            <Link
              href="/login"
              className="rounded-lg border border-blue-200 px-3 py-2 text-sm font-bold text-blue-600"
            >
              Login
            </Link>
          </div>
        </div>
      </header>

      {/* ================= HERO ================= */}
      <section className="border-b border-slate-100 bg-gradient-to-b from-slate-50 to-white">
        <div className="mx-auto max-w-[1400px] px-4 py-8 sm:py-10 lg:px-8 lg:py-12">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <h1 className="text-3xl font-extrabold leading-tight sm:text-4xl lg:text-5xl">
                Search across{" "}
                <span className="text-blue-600">
                  Local Businesses
                </span>
                <br className="hidden sm:block" />
                <span className="text-orange-500">
                  Products & Services
                </span>
              </h1>

              <p className="mt-3 max-w-2xl text-sm text-slate-500 sm:text-base">
                Find trusted local businesses, professionals and
                services near you.
              </p>
            </div>

            <div className="hidden rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold shadow-sm lg:block">
              📱 Download App
            </div>
          </div>

          {/* SEARCH */}
          <form
            onSubmit={submitSearch}
            className="mt-7 flex flex-col gap-2 lg:flex-row"
          >
            <div className="flex h-14 items-center rounded-xl border border-slate-300 bg-white px-4 shadow-sm lg:w-64">
              <span className="mr-2 text-lg">📍</span>

              <input
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full bg-transparent font-medium outline-none"
                placeholder="Location"
              />

              <span>⌄</span>
            </div>

            <div className="flex h-14 flex-1 overflow-hidden rounded-xl border border-slate-300 bg-white shadow-sm">
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="min-w-0 flex-1 px-4 outline-none"
                placeholder="Search for Spa, Salons, Doctors, Architects..."
              />

              <button
                type="submit"
                className="w-16 bg-orange-500 text-xl font-bold text-white hover:bg-orange-600"
              >
                🔍
              </button>
            </div>
          </form>
        </div>
      </section>

      {/* ================= PROMOTIONAL CARDS ================= */}
      <section className="mx-auto max-w-[1400px] px-4 pt-7 lg:px-8">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5">
          {/* MAIN */}
          <div className="relative min-h-[210px] overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-950 via-purple-800 to-purple-500 p-6 text-white sm:col-span-2 lg:col-span-2">
            <div className="absolute right-[-30px] top-[-40px] h-44 w-44 rounded-full bg-white/10" />

            <p className="text-sm font-bold">
              LOCALPLATFORM
            </p>

            <h2 className="mt-5 max-w-xs text-3xl font-black">
              Discover the Best Local Services
            </h2>

            <p className="mt-3 text-sm text-purple-100">
              Search. Compare. Connect.
            </p>

            <Link
              href="/search"
              className="mt-5 inline-block rounded-lg bg-orange-500 px-5 py-3 font-bold hover:bg-orange-600"
            >
              Search Now
            </Link>
          </div>

          <PromoCard
            title="B2B"
            subtitle="Quick Quotes"
            text="Find trusted vendors"
            className="bg-blue-600"
          />

          <PromoCard
            title="REPAIRS & SERVICES"
            subtitle="Nearest Vendor"
            text="Get service near you"
            className="bg-indigo-700"
          />

          <PromoCard
            title="REAL ESTATE"
            subtitle="Find Properties"
            text="Verified local agents"
            className="bg-violet-600"
          />
        </div>
      </section>

      {/* ================= CATEGORY GRID ================= */}
      <section className="mx-auto max-w-[1400px] px-4 py-8 lg:px-8">
        <div className="grid grid-cols-4 gap-y-7 sm:grid-cols-6 md:grid-cols-9 lg:grid-cols-10">
          {mainCategories.map((category) => (
            <Link
              key={category.name}
              href={`/search?q=${encodeURIComponent(
                category.name
              )}`}
              className="group flex flex-col items-center text-center"
            >
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-slate-200 bg-white text-3xl shadow-sm transition group-hover:-translate-y-1 group-hover:border-blue-300 group-hover:shadow-md">
                {category.icon}
              </div>

              <span className="mt-2 max-w-[90px] text-xs font-medium leading-4 text-slate-700 sm:text-sm">
                {category.name}
              </span>
            </Link>
          ))}

          <Link
            href="/search"
            className="group flex flex-col items-center text-center"
          >
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-600 text-2xl text-white shadow-sm">
              •••
            </div>

            <span className="mt-2 text-xs font-bold text-blue-600 sm:text-sm">
              More
            </span>
          </Link>
        </div>
      </section>

      {/* ================= SERVICE SECTIONS ================= */}
      <section className="mx-auto grid max-w-[1400px] gap-5 px-4 pb-8 lg:grid-cols-2 lg:px-8">
        {serviceSections.map((section) => (
          <div
            key={section.title}
            className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5"
          >
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xl font-extrabold">
                {section.title}
              </h2>

              <Link
                href="/search"
                className="text-sm font-bold text-blue-600"
              >
                View All →
              </Link>
            </div>

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {section.items.map((item) => (
                <Link
                  key={item.name}
                  href={`/search?q=${encodeURIComponent(item.name)}`}
                  className="group overflow-hidden rounded-xl border border-slate-100 bg-slate-50 p-4 text-center transition hover:-translate-y-1 hover:bg-white hover:shadow-md"
                >
                  <div className="flex h-24 items-center justify-center rounded-lg bg-gradient-to-br from-blue-50 to-orange-50 text-5xl">
                    {item.icon}
                  </div>

                  <p className="mt-3 text-sm font-bold text-slate-700">
                    {item.name}
                  </p>
                </Link>
              ))}
            </div>
          </div>
        ))}
      </section>

      {/* ================= LATEST BUSINESSES ================= */}
      <section className="bg-slate-50 py-10">
        <div className="mx-auto max-w-[1400px] px-4 lg:px-8">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-extrabold">
                Latest Local Businesses
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Recently listed businesses on LocalPlatform
              </p>
            </div>

            <Link
              href="/search"
              className="font-bold text-blue-600"
            >
              View All →
            </Link>
          </div>

          {loading ? (
            <div className="rounded-2xl bg-white p-10 text-center">
              Loading businesses...
            </div>
          ) : filteredBusinesses.length === 0 ? (
            <div className="rounded-2xl bg-white p-10 text-center">
              <div className="text-4xl">🔎</div>

              <p className="mt-3 font-bold text-slate-700">
                No businesses found
              </p>

              <Link
                href="/list-business"
                className="mt-4 inline-block rounded-lg bg-blue-600 px-5 py-3 font-bold text-white"
              >
                List Your Business
              </Link>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {filteredBusinesses.slice(0, 8).map((business) => (
                <Link
                  key={business.id}
                  href={`/business/${business.id}`}
                  className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
                >
                  <div className="h-40 overflow-hidden bg-gradient-to-br from-blue-50 to-slate-100">
                    {business.image_url ? (
                      <img
                        src={business.image_url}
                        alt={business.business_name}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-5xl">
                        🏢
                      </div>
                    )}
                  </div>

                  <div className="p-4">
                    <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-blue-600">
                      {business.category}
                    </span>

                    <h3 className="mt-3 line-clamp-1 text-lg font-extrabold">
                      {business.business_name}
                    </h3>

                    <p className="mt-1 text-sm text-slate-500">
                      📍 {business.city}
                    </p>

                    {business.phone && (
                      <p className="mt-2 text-sm font-semibold text-slate-600">
                        📞 {business.phone}
                      </p>
                    )}

                    <div className="mt-4 flex items-center justify-between">
                      <span className="text-sm font-bold text-blue-600">
                        View Business
                      </span>

                      <span>→</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ================= OWNER CTA ================= */}
      <section className="mx-auto max-w-[1400px] px-4 py-10 lg:px-8">
        <div className="overflow-hidden rounded-3xl bg-gradient-to-r from-blue-700 to-indigo-700 p-7 text-white sm:p-10">
          <div className="flex flex-col justify-between gap-7 lg:flex-row lg:items-center">
            <div>
              <p className="font-bold text-blue-200">
                BUSINESS OWNERS
              </p>

              <h2 className="mt-2 text-3xl font-black sm:text-4xl">
                Grow your business with LocalPlatform
              </h2>

              <p className="mt-3 max-w-2xl text-blue-100">
                Create your free business profile and let local
                customers discover your services.
              </p>
            </div>

            <Link
              href="/list-business"
              className="shrink-0 rounded-xl bg-orange-500 px-7 py-4 text-center font-extrabold text-white hover:bg-orange-600"
            >
              List Your Business FREE
            </Link>
          </div>
        </div>
      </section>

      {/* ================= FOOTER ================= */}
      <footer className="border-t border-slate-200 bg-white">
        <div className="mx-auto flex max-w-[1400px] flex-col gap-5 px-4 py-8 text-sm text-slate-500 sm:flex-row sm:items-center sm:justify-between lg:px-8">
          <div>
            <span className="font-black text-blue-600">
              Local
            </span>
            <span className="font-black text-orange-500">
              Platform
            </span>

            <p className="mt-1">
              Find local businesses near you.
            </p>
          </div>

          <div className="flex flex-wrap gap-5">
            <Link href="/search">Search</Link>
            <Link href="/list-business">List Business</Link>
            <Link href="/dashboard">Dashboard</Link>
            <Link href="/login">Login</Link>
          </div>
        </div>
      </footer>

      {/* ================= MOBILE BOTTOM NAV ================= */}
      <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-slate-200 bg-white px-2 py-2 shadow-[0_-4px_15px_rgba(0,0,0,0.08)] lg:hidden">
        <div className="grid grid-cols-5">
          <MobileNav href="/" icon="⌂" label="Home" />

          <MobileNav
            href="/search"
            icon="⌕"
            label="Search"
          />

          <MobileNav
            href="/list-business"
            icon="＋"
            label="Add Business"
          />

          <MobileNav
            href="/dashboard"
            icon="♛"
            label="Dashboard"
          />

          <MobileNav
            href="/login"
            icon="☰"
            label="More"
          />
        </div>
      </div>

      <div className="h-20 lg:hidden" />
    </main>
  );
}

/* ================= PROMO CARD ================= */

function PromoCard({
  title,
  subtitle,
  text,
  className,
}: {
  title: string;
  subtitle: string;
  text: string;
  className: string;
}) {
  return (
    <div
      className={`relative min-h-[210px] overflow-hidden rounded-2xl p-5 text-white ${className}`}
    >
      <div className="absolute -bottom-10 -right-10 h-32 w-32 rounded-full bg-white/10" />

      <p className="text-xl font-black leading-tight">
        {title}
      </p>

      <p className="mt-4 text-lg font-bold">
        {subtitle}
      </p>

      <p className="mt-2 text-sm text-white/80">
        {text}
      </p>

      <span className="absolute bottom-4 right-4 flex h-9 w-9 items-center justify-center rounded-full bg-white/20 text-xl">
        →
      </span>
    </div>
  );
}

/* ================= MOBILE NAV ================= */

function MobileNav({
  href,
  icon,
  label,
}: {
  href: string;
  icon: string;
  label: string;
}) {
  return (
    <Link
      href={href}
      className="flex flex-col items-center justify-center gap-1 py-1 text-slate-500"
    >
      <span className="text-xl">{icon}</span>
      <span className="text-[10px] font-semibold">
        {label}
      </span>
    </Link>
  );
}