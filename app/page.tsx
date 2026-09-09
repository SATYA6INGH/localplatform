"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL ||
    "https://ckuiskbegrlrethnlhzq.supabase.co",
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || ""
);

type Business = {
  id: string;
  business_name: string;
  category: string;
  subcategory?: string | null;
  services?: string[] | null;
  short_description?: string | null;
  description?: string | null;
  phone?: string | null;
  image_url?: string | null;
  address?: string | null;
  area?: string | null;
  city?: string | null;
  state?: string | null;
  pincode?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  maps_url?: string | null;
  listing_status?: string | null;
  listing_expires_at?: string | null;
};

type Category = {
  name: string;
  icon: string;
};

type StatusItem = {
  id: number;
  name: string;
  category: string;
  image: string;
  time: string;
  color: string;
};

const categories: Category[] = [
  ["Beauty & Salon", "💇"],
  ["Coaching & Tuition", "📚"],
  ["School & Education", "🏫"],
  ["College & University", "🎓"],
  ["Training & Skill Development", "🧑‍🏫"],
  ["Doctor & Clinic", "🩺"],
  ["Hospital & Healthcare", "🏥"],
  ["Pharmacy & Medical", "💊"],
  ["Diagnostic & Pathology", "🔬"],
  ["Dental Care", "🦷"],
  ["Fitness & Wellness", "🏋️"],
  ["Restaurant & Food", "🍽️"],
  ["Cafe & Bakery", "☕"],
  ["Sweet & Namkeen", "🍬"],
  ["Caterers", "🍱"],
  ["Hotel & Accommodation", "🏨"],
  ["Travel & Tourism", "✈️"],
  ["Real Estate", "🏠"],
  ["Architect & Interior", "📐"],
  ["Construction & Contractor", "👷"],
  ["Building Material", "🧱"],
  ["Home Services", "🛠️"],
  ["Repair & Maintenance", "🔧"],
  ["Furniture & Home Decor", "🛋️"],
  ["Electrical & Electronics", "⚡"],
  ["Hardware & Sanitary", "🚿"],
  ["Tiles, Marble & Flooring", "⬜"],
  ["Paint & Wallpaper", "🎨"],
  ["Aluminium, Glass & UPVC", "🪟"],
  ["Fabrication & Welding", "⚙️"],
  ["Solar & Energy", "☀️"],
  ["Security & CCTV", "📹"],
  ["Automobile", "🚗"],
  ["Rental & Leasing", "🔑"],
  ["Driving School", "🚘"],
  ["Transport & Logistics", "🚚"],
  ["Courier & Delivery", "📦"],
  ["Clothing & Fashion", "👗"],
  ["Boutique & Tailoring", "🧵"],
  ["Jewellery & Accessories", "💎"],
  ["Footwear & Bags", "👟"],
  ["Cosmetics & Beauty Products", "💄"],
  ["Grocery & Supermarket", "🛒"],
  ["Mobile & Computer", "📱"],
  ["IT & Software Services", "💻"],
  ["Printing & Advertising", "🖨️"],
  ["Photography & Videography", "📷"],
  ["Event & Wedding Services", "💍"],
  ["Entertainment & Recreation", "🎬"],
  ["Sports & Games", "⚽"],
  ["Kids & Childcare", "🧒"],
  ["Pet & Veterinary", "🐾"],
  ["Agriculture & Farming", "🌾"],
  ["Nursery & Landscaping", "🌱"],
  ["Manufacturing", "🏭"],
  ["Wholesale & Distribution", "📦"],
  ["Dealer & Supplier", "🏪"],
  ["Industrial Services", "🏗️"],
  ["Machinery & Equipment", "⚙️"],
  ["Business & Management Consulting", "📊"],
  ["CA & Tax Services", "🧾"],
  ["Legal Services", "⚖️"],
  ["Finance & Loan", "💰"],
  ["Insurance", "🛡️"],
  ["Banking & ATM", "🏦"],
  ["Digital Marketing", "📈"],
  ["Graphic & Creative Services", "🖌️"],
  ["Recruitment & Manpower", "👥"],
  ["Cleaning Services", "🧹"],
  ["Domestic Help", "🏠"],
  ["Laundry & Dry Cleaning", "👕"],
  ["Property Services", "🏢"],
  ["Government & Public Services", "🏛️"],
  ["NGO & Social Services", "🤝"],
  ["Religious & Community Services", "🛕"],
  ["Professional Services", "💼"],
  ["Security Services", "👮"],
  ["Party & Event Rental", "🎪"],
  ["Repair, Installation & Maintenance", "🔩"],
  ["Other Services", "➕"],
].map(([name, icon]) => ({ name, icon }));

const popularSearches = [
  "Beauty Parlour",
  "Restaurant",
  "Doctor",
  "Gym",
  "Coaching",
  "Salon",
  "Electrician",
  "Plumber",
];

const fallbackImages = [
  "https://images.unsplash.com/photo-1524758631624-e2822e304c36?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1556761175-b413da4baf72?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1497366811353-6870744d04b2?auto=format&fit=crop&w=900&q=80",
];

const liveStatuses: StatusItem[] = [
  {
    id: 1,
    name: "Royal Cafe",
    category: "Restaurant",
    image:
      "https://images.unsplash.com/photo-1552566626-52f8b828add9?auto=format&fit=crop&w=500&q=80",
    time: "12 min",
    color: "from-orange-400 to-red-500",
  },
  {
    id: 2,
    name: "Style Studio",
    category: "Salon",
    image:
      "https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=500&q=80",
    time: "28 min",
    color: "from-pink-400 to-purple-600",
  },
  {
    id: 3,
    name: "City Care",
    category: "Healthcare",
    image:
      "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&w=500&q=80",
    time: "41 min",
    color: "from-blue-400 to-cyan-500",
  },
  {
    id: 4,
    name: "Home Decor",
    category: "Furniture",
    image:
      "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=500&q=80",
    time: "1 hr",
    color: "from-amber-400 to-orange-600",
  },
  {
    id: 5,
    name: "Auto Care",
    category: "Automobile",
    image:
      "https://images.unsplash.com/photo-1487754180451-c456f719a1fc?auto=format&fit=crop&w=500&q=80",
    time: "1 hr",
    color: "from-slate-500 to-slate-800",
  },
  {
    id: 6,
    name: "Tech World",
    category: "IT Services",
    image:
      "https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=500&q=80",
    time: "2 hr",
    color: "from-indigo-400 to-blue-700",
  },
];

function BusinessCard({
  business,
  index,
}: {
  business: Business;
  index: number;
}) {
  const image =
    business.image_url ||
    fallbackImages[index % fallbackImages.length];

  return (
    <Link
      href={`/business/${encodeURIComponent(business.id)}`}
      className="group overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl"
    >
      <div className="relative h-48 overflow-hidden bg-slate-100">
        <img
          src={image}
          alt={business.business_name}
          className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
          loading="lazy"
        />

        <div className="absolute left-3 top-3 rounded-full bg-white/95 px-3 py-1.5 text-[10px] font-black text-green-700 shadow-sm backdrop-blur">
          ✓ ACTIVE
        </div>

        <div className="absolute right-3 top-3 rounded-full bg-white/95 px-3 py-1.5 text-[10px] font-black text-slate-700 shadow-sm">
          ★ Local
        </div>

        <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-black/50 to-transparent" />
      </div>

      <div className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h3 className="line-clamp-1 text-base font-black text-slate-900">
              {business.business_name}
            </h3>

            <p className="mt-1 text-xs font-bold text-blue-600">
              {business.category}
            </p>
          </div>

          <span className="shrink-0 rounded-full bg-amber-50 px-2 py-1 text-[10px] font-black text-amber-700">
            ★ 4.8
          </span>
        </div>

        {(business.short_description || business.description) && (
          <p className="mt-2 line-clamp-2 text-xs leading-5 text-slate-500">
            {business.short_description || business.description}
          </p>
        )}

        {(business.area || business.city) && (
          <p className="mt-3 text-xs font-semibold text-slate-600">
            📍 {[business.area, business.city].filter(Boolean).join(", ")}
          </p>
        )}

        <div className="mt-4 grid grid-cols-3 gap-2">
          {business.phone ? (
            <>
              <span className="rounded-xl bg-blue-50 py-2.5 text-center text-[11px] font-black text-blue-700">
                ☎ Call
              </span>

              <span className="rounded-xl bg-green-50 py-2.5 text-center text-[11px] font-black text-green-700">
                WhatsApp
              </span>

              <span className="rounded-xl bg-slate-900 py-2.5 text-center text-[11px] font-black text-white">
                View
              </span>
            </>
          ) : (
            <span className="col-span-3 rounded-xl bg-slate-100 py-2.5 text-center text-[11px] font-black text-slate-700">
              View Business
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}

export default function HomePage() {
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAllCategories, setShowAllCategories] = useState(false);
  const [query, setQuery] = useState("");
  const [selectedStatus, setSelectedStatus] =
    useState<StatusItem | null>(null);

  useEffect(() => {
    let mounted = true;

    async function loadBusinesses() {
      const { data } = await supabase
        .from("businesses")
        .select(
          `
          id,
          business_name,
          category,
          subcategory,
          services,
          short_description,
          description,
          phone,
          image_url,
          address,
          area,
          city,
          state,
          pincode,
          latitude,
          longitude,
          maps_url,
          listing_status,
          listing_expires_at
        `
        )
        .eq("listing_status", "active")
        .or("listing_expires_at.is.null,listing_expires_at.gt.now()")
        .order("created_at", { ascending: false })
        .limit(6);

      if (!mounted) return;

      setBusinesses((data || []) as Business[]);
      setLoading(false);
    }

    loadBusinesses();

    return () => {
      mounted = false;
    };
  }, []);

  const visibleCategories = useMemo(
    () =>
      showAllCategories
        ? categories
        : categories.slice(0, 16),
    [showAllCategories]
  );

  function submitSearch(e: React.FormEvent) {
    e.preventDefault();

    const value = query.trim();

    if (value) {
      window.location.href =
        `/search?q=${encodeURIComponent(value)}`;
    } else {
      window.location.href = "/search";
    }
  }

  return (
    <main className="min-h-screen bg-white pb-20 text-slate-900 md:pb-0">

      {/* =========================
          HEADER
      ========================== */}

      <header className="sticky top-0 z-[80] border-b border-slate-200/80 bg-white/90 shadow-sm backdrop-blur-xl">
        <div className="mx-auto flex h-[64px] max-w-7xl items-center justify-between px-3 sm:h-[72px] sm:px-6 lg:px-8">

          <Link
            href="/"
            className="flex items-center gap-2.5"
          >
            <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 text-lg font-black text-white shadow-lg shadow-blue-200">
              L
            </span>

            <div>
              <div className="text-base font-black tracking-tight sm:text-lg">
                LocalPlatform
              </div>

              <div className="hidden text-[9px] font-bold text-slate-400 sm:block">
                LOCAL • CONNECT • DISCOVER
              </div>
            </div>
          </Link>

          <div className="hidden items-center gap-7 md:flex">
            <Link
              href="/"
              className="text-sm font-black text-blue-600"
            >
              Home
            </Link>

            <Link
              href="/search"
              className="text-sm font-bold text-slate-600 hover:text-blue-600"
            >
              Explore
            </Link>

            <Link
              href="/search"
              className="text-sm font-bold text-slate-600 hover:text-blue-600"
            >
              Services
            </Link>

            <Link
              href="/list-business"
              className="text-sm font-bold text-slate-600 hover:text-blue-600"
            >
              For Business
            </Link>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              className="hidden h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-lg shadow-sm hover:bg-slate-50 sm:flex"
            >
              🔔
            </button>

            <Link
              href="/login"
              className="rounded-xl bg-slate-900 px-4 py-2.5 text-xs font-black text-white shadow-sm transition hover:bg-blue-600 sm:px-5 sm:text-sm"
            >
              Login
            </Link>
          </div>

        </div>
      </header>


      {/* =========================
          HERO
      ========================== */}

      <section className="relative overflow-hidden border-b border-slate-100 bg-gradient-to-b from-blue-50 via-white to-white">

        <div className="pointer-events-none absolute -left-24 top-0 h-64 w-64 rounded-full bg-blue-200/30 blur-3xl" />
        <div className="pointer-events-none absolute -right-24 top-10 h-72 w-72 rounded-full bg-indigo-200/30 blur-3xl" />

        <div className="relative mx-auto max-w-7xl px-3 pb-7 pt-7 sm:px-6 sm:pb-12 sm:pt-12 lg:px-8">

          <div className="mx-auto max-w-5xl text-center">

            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-blue-100 bg-white px-3 py-1.5 text-[9px] font-black uppercase tracking-[0.14em] text-blue-600 shadow-sm sm:text-[10px]">
              <span className="h-2 w-2 animate-pulse rounded-full bg-green-500" />
              India Local Business Network
            </div>

            <h1 className="text-[34px] font-black leading-[1.02] tracking-[-0.045em] text-slate-950 sm:text-5xl lg:text-6xl">
              Find Local Businesses
              <br />
              <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                & Services Near You
              </span>
            </h1>

            <p className="mx-auto mt-3 max-w-2xl text-xs leading-5 text-slate-500 sm:mt-5 sm:text-base sm:leading-7">
              Discover trusted businesses, shops and professionals.
              See live updates, offers and connect directly with local
              businesses.
            </p>

            {/* SEARCH */}

            <form
              onSubmit={submitSearch}
              className="mx-auto mt-5 flex max-w-4xl overflow-hidden rounded-2xl border border-slate-200 bg-white p-1.5 shadow-xl shadow-slate-200/60 sm:mt-7 sm:rounded-2xl"
            >
              <div className="flex min-w-0 flex-1 items-center">
                <span className="px-2 text-lg sm:text-xl">
                  🔎
                </span>

                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search business, service, category or city"
                  className="min-w-0 flex-1 bg-transparent px-1 py-3 text-xs font-semibold outline-none sm:text-sm"
                />
              </div>

              <button
                type="submit"
                className="rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-5 text-xs font-black text-white shadow-sm transition hover:from-blue-700 hover:to-indigo-700 sm:px-8 sm:text-sm"
              >
                Search
              </button>
            </form>

            {/* POPULAR SEARCHES */}

            <div className="mt-3 flex gap-1.5 overflow-x-auto pb-1 sm:justify-center sm:overflow-visible">
              {popularSearches.map((item) => (
                <Link
                  key={item}
                  href={`/search?q=${encodeURIComponent(item)}`}
                  className="shrink-0 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-[10px] font-bold text-slate-600 shadow-sm transition hover:border-blue-200 hover:text-blue-600 sm:text-xs"
                >
                  {item}
                </Link>
              ))}
            </div>

          </div>
        </div>
      </section>


      {/* =========================
          24 HOUR LIVE STATUS
      ========================== */}

      <section className="mx-auto max-w-7xl px-3 pt-5 sm:px-6 sm:pt-8 lg:px-8">

        <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">

          <div className="flex items-center justify-between px-4 pt-4 sm:px-6 sm:pt-5">

            <div>
              <div className="flex items-center gap-2">

                <span className="relative flex h-2.5 w-2.5">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75" />
                  <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-red-500" />
                </span>

                <h2 className="text-lg font-black tracking-tight text-slate-900 sm:text-2xl">
                  Live Near You
                </h2>

                <span className="rounded-full bg-red-50 px-2 py-1 text-[8px] font-black text-red-600 sm:text-[9px]">
                  24H
                </span>

              </div>

              <p className="mt-1 text-[10px] text-slate-500 sm:text-sm">
                Fresh updates from local businesses
              </p>
            </div>

            <Link
              href="/search"
              className="shrink-0 rounded-full bg-blue-50 px-3 py-2 text-[10px] font-black text-blue-600 hover:bg-blue-100 sm:px-4 sm:text-xs"
            >
              View All
            </Link>

          </div>


          <div className="flex gap-4 overflow-x-auto px-4 py-5 pb-6 sm:gap-6 sm:px-6">

            {/* YOUR STATUS */}

            <button
              type="button"
              className="group flex w-[74px] shrink-0 flex-col items-center"
              onClick={() =>
                alert(
                  "Status posting feature will be connected to Supabase in the next step."
                )
              }
            >

              <div className="relative">

                <div className="flex h-[70px] w-[70px] items-center justify-center rounded-full border-[3px] border-dashed border-blue-200 bg-blue-50 shadow-sm transition group-hover:scale-105">

                  <div className="flex h-[58px] w-[58px] items-center justify-center rounded-full bg-white text-2xl font-light text-blue-600 shadow-inner">
                    +
                  </div>

                </div>

                <span className="absolute bottom-0 right-0 flex h-5 w-5 items-center justify-center rounded-full border-2 border-white bg-blue-600 text-[10px] font-black text-white">
                  +
                </span>

              </div>

              <span className="mt-2 w-full truncate text-center text-[10px] font-extrabold text-slate-700">
                Your Status
              </span>

            </button>


            {/* BUSINESS STATUSES */}

            {liveStatuses.map((status) => (
              <button
                key={status.id}
                type="button"
                onClick={() => setSelectedStatus(status)}
                className="group flex w-[74px] shrink-0 flex-col items-center"
              >

                <div
                  className={`rounded-full bg-gradient-to-br ${status.color} p-[3px] shadow-sm transition duration-200 group-hover:scale-105 group-hover:shadow-lg`}
                >

                  <div className="rounded-full bg-white p-[3px]">

                    <img
                      src={status.image}
                      alt={status.name}
                      className="h-[62px] w-[62px] rounded-full object-cover"
                    />

                  </div>

                </div>

                <span className="mt-2 w-full truncate text-center text-[10px] font-extrabold text-slate-800">
                  {status.name}
                </span>

                <span className="mt-0.5 w-full truncate text-center text-[9px] font-medium text-slate-400">
                  {status.time} ago
                </span>

              </button>
            ))}

          </div>

        </div>

      </section>


      {/* =========================
          QUICK DISCOVERY STRIP
      ========================== */}

      <section className="mx-auto max-w-7xl px-3 pt-5 sm:px-6 sm:pt-7 lg:px-8">

        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 sm:gap-3">

          <Link
            href="/search"
            className="group rounded-2xl border border-slate-200 bg-gradient-to-br from-blue-50 to-white p-4 transition hover:-translate-y-0.5 hover:shadow-md"
          >
            <div className="text-xl">📍</div>
            <div className="mt-2 text-xs font-black text-slate-900">
              Nearby
            </div>
            <div className="mt-1 text-[10px] text-slate-500">
              Find services around you
            </div>
          </Link>

          <Link
            href="/search"
            className="group rounded-2xl border border-slate-200 bg-gradient-to-br from-orange-50 to-white p-4 transition hover:-translate-y-0.5 hover:shadow-md"
          >
            <div className="text-xl">🔥</div>
            <div className="mt-2 text-xs font-black text-slate-900">
              Trending
            </div>
            <div className="mt-1 text-[10px] text-slate-500">
              Popular local businesses
            </div>
          </Link>

          <Link
            href="/search"
            className="group rounded-2xl border border-slate-200 bg-gradient-to-br from-green-50 to-white p-4 transition hover:-translate-y-0.5 hover:shadow-md"
          >
            <div className="text-xl">🎁</div>
            <div className="mt-2 text-xs font-black text-slate-900">
              Offers
            </div>
            <div className="mt-1 text-[10px] text-slate-500">
              Deals available today
            </div>
          </Link>

          <Link
            href="/search"
            className="group rounded-2xl border border-slate-200 bg-gradient-to-br from-purple-50 to-white p-4 transition hover:-translate-y-0.5 hover:shadow-md"
          >
            <div className="text-xl">✓</div>
            <div className="mt-2 text-xs font-black text-slate-900">
              Trusted
            </div>
            <div className="mt-1 text-[10px] text-slate-500">
              Discover active listings
            </div>
          </Link>

        </div>

      </section>


      {/* =========================
          CATEGORIES
      ========================== */}

      <section className="mx-auto max-w-7xl px-3 py-7 sm:px-6 sm:py-9 lg:px-8">

        <div className="mb-5 flex items-end justify-between">

          <div>
            <h2 className="text-lg font-black tracking-tight sm:text-2xl">
              Browse Categories
            </h2>

            <p className="mt-1 text-[11px] text-slate-500 sm:text-sm">
              Find the right local service faster.
            </p>
          </div>

          <button
            type="button"
            onClick={() =>
              setShowAllCategories((value) => !value)
            }
            className="rounded-full bg-blue-50 px-3 py-1.5 text-[10px] font-extrabold text-blue-600 sm:text-sm"
          >
            {showAllCategories ? "Show Less" : "View All"}
          </button>

        </div>


        <div className="grid grid-cols-4 gap-x-2 gap-y-6 sm:grid-cols-4 sm:gap-5 md:grid-cols-6 lg:grid-cols-8">

          {visibleCategories.map((category) => (
            <Link
              key={category.name}
              href={`/search?category=${encodeURIComponent(
                category.name
              )}`}
              className="group flex min-h-[82px] flex-col items-center rounded-2xl border border-transparent px-1 py-2 text-center transition hover:border-blue-100 hover:bg-blue-50/50"
            >

              <span className="flex h-11 items-center justify-center text-[30px] leading-none transition-transform group-hover:scale-110 sm:h-14 sm:text-[38px]">
                {category.icon}
              </span>

              <span className="mt-2 line-clamp-2 px-1 text-[10px] font-bold leading-4 text-slate-700 group-hover:text-blue-600 sm:text-xs">
                {category.name}
              </span>

            </Link>
          ))}

        </div>

      </section>


      {/* =========================
          OFFERS
      ========================== */}

      <section className="mx-auto max-w-7xl px-3 pb-7 sm:px-6 sm:pb-9 lg:px-8">

        <div className="mb-5 flex items-end justify-between">

          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-black sm:text-2xl">
                Today&apos;s Offers
              </h2>

              <span className="rounded-full bg-red-50 px-2 py-1 text-[8px] font-black text-red-600">
                NEW
              </span>
            </div>

            <p className="mt-1 text-[11px] text-slate-500 sm:text-sm">
              Deals and promotions from local businesses.
            </p>
          </div>

          <Link
            href="/search"
            className="text-[11px] font-extrabold text-blue-600 sm:text-sm"
          >
            All Offers →
          </Link>

        </div>


        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">

          <div className="relative overflow-hidden rounded-3xl border border-orange-100 bg-gradient-to-br from-orange-50 via-white to-red-50 p-5">

            <div className="absolute -right-7 -top-7 h-24 w-24 rounded-full bg-orange-200/40" />

            <span className="relative rounded-full bg-white px-3 py-1.5 text-[9px] font-black text-orange-600 shadow-sm">
              TODAY ONLY
            </span>

            <h3 className="relative mt-4 text-xl font-black">
              20% OFF Dining
            </h3>

            <p className="relative mt-1 text-xs leading-5 text-slate-500">
              Special dining offer from selected local restaurants.
            </p>

            <Link
              href="/search?q=Restaurant"
              className="relative mt-4 inline-flex rounded-xl bg-slate-900 px-4 py-2.5 text-[11px] font-black text-white"
            >
              View Offer
            </Link>

          </div>


          <div className="relative overflow-hidden rounded-3xl border border-purple-100 bg-gradient-to-br from-purple-50 via-white to-pink-50 p-5">

            <div className="absolute -right-7 -top-7 h-24 w-24 rounded-full bg-purple-200/40" />

            <span className="relative rounded-full bg-white px-3 py-1.5 text-[9px] font-black text-purple-600 shadow-sm">
              LIMITED
            </span>

            <h3 className="relative mt-4 text-xl font-black">
              Salon Special
            </h3>

            <p className="relative mt-1 text-xs leading-5 text-slate-500">
              Discover beauty and salon services near your location.
            </p>

            <Link
              href="/search?q=Salon"
              className="relative mt-4 inline-flex rounded-xl bg-slate-900 px-4 py-2.5 text-[11px] font-black text-white"
            >
              Explore
            </Link>

          </div>


          <div className="relative overflow-hidden rounded-3xl border border-blue-100 bg-gradient-to-br from-blue-50 via-white to-cyan-50 p-5">

            <div className="absolute -right-7 -top-7 h-24 w-24 rounded-full bg-blue-200/40" />

            <span className="relative rounded-full bg-white px-3 py-1.5 text-[9px] font-black text-blue-600 shadow-sm">
              DISCOVER
            </span>

            <h3 className="relative mt-4 text-xl font-black">
              Local Services
            </h3>

            <p className="relative mt-1 text-xs leading-5 text-slate-500">
              Connect directly with professionals and service providers.
            </p>

            <Link
              href="/search"
              className="relative mt-4 inline-flex rounded-xl bg-slate-900 px-4 py-2.5 text-[11px] font-black text-white"
            >
              Discover
            </Link>

          </div>

        </div>

      </section>


      {/* =========================
          BUSINESS OWNER CTA
      ========================== */}

      <section className="mx-auto max-w-7xl px-3 py-4 sm:px-6 sm:py-6 lg:px-8">

        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-blue-700 via-blue-600 to-indigo-700 p-5 text-white shadow-xl shadow-blue-100 sm:p-8">

          <div className="absolute -right-16 -top-16 h-48 w-48 rounded-full bg-white/10" />
          <div className="absolute -bottom-20 left-1/3 h-48 w-48 rounded-full bg-indigo-300/10" />

          <div className="relative flex flex-col justify-between gap-5 sm:flex-row sm:items-center">

            <div>

              <p className="text-[9px] font-extrabold uppercase tracking-[0.18em] text-blue-100 sm:text-[10px]">
                For Business Owners
              </p>

              <h2 className="mt-1 text-xl font-black tracking-tight sm:text-3xl">
                Grow Your Business Online
              </h2>

              <p className="mt-2 max-w-xl text-xs leading-5 text-blue-100 sm:text-sm">
                Create your business profile, get discovered by customers,
                share updates and generate enquiries.
              </p>

            </div>

            <Link
              href="/list-business"
              className="inline-flex min-h-11 items-center justify-center rounded-xl bg-white px-5 text-sm font-black text-blue-700 shadow-sm transition hover:bg-blue-50"
            >
              List Your Business →
            </Link>

          </div>


          <div className="relative mt-5 grid grid-cols-2 gap-2 text-[10px] font-bold text-blue-50 sm:grid-cols-4 sm:text-xs">

            {[
              "Online visibility",
              "Customer enquiries",
              "Business profile",
              "Photos & reviews",
            ].map((item) => (
              <div
                key={item}
                className="rounded-xl bg-white/10 px-3 py-2.5 backdrop-blur"
              >
                ✓ {item}
              </div>
            ))}

          </div>

        </div>

      </section>


      {/* =========================
          POPULAR BUSINESSES
      ========================== */}

      <section className="mx-auto max-w-7xl px-3 py-7 sm:px-6 sm:py-9 lg:px-8">

        <div className="mb-5 flex items-end justify-between">

          <div>
            <h2 className="text-lg font-black sm:text-2xl">
              Popular Businesses Near You
            </h2>

            <p className="mt-1 text-[11px] text-slate-500 sm:text-sm">
              Active local listings on LocalPlatform.
            </p>
          </div>

          <Link
            href="/search"
            className="rounded-full bg-blue-50 px-3 py-1.5 text-[10px] font-extrabold text-blue-600 sm:text-sm"
          >
            View All →
          </Link>

        </div>


        {loading ? (

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">

            {[1, 2, 3].map((number) => (
              <div
                key={number}
                className="h-80 animate-pulse rounded-3xl bg-slate-100"
              />
            ))}

          </div>

        ) : businesses.length === 0 ? (

          <div className="rounded-3xl border border-dashed border-slate-300 bg-slate-50 p-10 text-center">

            <div className="text-4xl">
              🏪
            </div>

            <h3 className="mt-3 text-base font-black">
              No businesses listed yet
            </h3>

            <p className="mt-1 text-xs text-slate-500">
              Be one of the first businesses on LocalPlatform.
            </p>

            <Link
              href="/list-business"
              className="mt-5 inline-flex rounded-xl bg-blue-600 px-5 py-3 text-xs font-black text-white shadow-sm"
            >
              List Your Business
            </Link>

          </div>

        ) : (

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">

            {businesses.map((business, index) => (
              <BusinessCard
                key={business.id}
                business={business}
                index={index}
              />
            ))}

          </div>

        )}

      </section>


      {/* =========================
          PLATFORM FEATURES
      ========================== */}

      <section className="mx-auto max-w-7xl px-3 py-5 sm:px-6 sm:py-8 lg:px-8">

        <div className="mb-5">
          <h2 className="text-lg font-black sm:text-2xl">
            Everything Local, In One Place
          </h2>

          <p className="mt-1 text-[11px] text-slate-500 sm:text-sm">
            Built for customers and local businesses.
          </p>
        </div>


        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">

          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">

            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-lg">
              ◉
            </div>

            <h3 className="mt-3 text-sm font-black">
              24h Status
            </h3>

            <p className="mt-1 text-[10px] leading-4 text-slate-500">
              See fresh updates from local businesses.
            </p>

          </div>


          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">

            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-50 text-lg">
              🔎
            </div>

            <h3 className="mt-3 text-sm font-black">
              Smart Discovery
            </h3>

            <p className="mt-1 text-[10px] leading-4 text-slate-500">
              Find relevant businesses and services.
            </p>

          </div>


          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">

            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-50 text-lg">
              💬
            </div>

            <h3 className="mt-3 text-sm font-black">
              Direct Chat
            </h3>

            <p className="mt-1 text-[10px] leading-4 text-slate-500">
              Connect directly with businesses.
            </p>

          </div>


          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">

            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-50 text-lg">
              📊
            </div>

            <h3 className="mt-3 text-sm font-black">
              Business Analytics
            </h3>

            <p className="mt-1 text-[10px] leading-4 text-slate-500">
              Track views, calls and enquiries.
            </p>

          </div>

        </div>

      </section>


      {/* =========================
          MOBILE NAVIGATION
      ========================== */}

      <nav
        aria-label="Mobile navigation"
        className="fixed bottom-0 left-0 right-0 z-[100] border-t border-slate-200 bg-white/95 shadow-[0_-5px_22px_rgba(15,23,42,0.10)] backdrop-blur-xl md:hidden"
      >

        <div className="mx-auto grid max-w-lg grid-cols-5 px-1 pb-[env(safe-area-inset-bottom)]">

          <Link
            href="/"
            className="flex min-h-[62px] flex-col items-center justify-center gap-1 text-blue-600"
          >
            <span className="text-[19px]">🏠</span>
            <span className="text-[9px] font-extrabold">
              Home
            </span>
          </Link>

          <Link
            href="/search"
            className="flex min-h-[62px] flex-col items-center justify-center gap-1 text-slate-500"
          >
            <span className="text-[19px]">🔎</span>
            <span className="text-[9px] font-extrabold">
              Explore
            </span>
          </Link>

          <Link
            href="/list-business"
            className="flex min-h-[62px] flex-col items-center justify-center gap-1 text-slate-500"
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-600 text-xl text-white shadow-lg shadow-blue-200">
              +
            </span>
            <span className="text-[9px] font-extrabold">
              List
            </span>
          </Link>

          <Link
            href="/dashboard"
            className="flex min-h-[62px] flex-col items-center justify-center gap-1 text-slate-500"
          >
            <span className="text-[19px]">📋</span>
            <span className="text-[9px] font-extrabold">
              Dashboard
            </span>
          </Link>

          <Link
            href="/login"
            className="flex min-h-[62px] flex-col items-center justify-center gap-1 text-slate-500"
          >
            <span className="text-[19px]">👤</span>
            <span className="text-[9px] font-extrabold">
              Profile
            </span>
          </Link>

        </div>

      </nav>


      {/* =========================
          STATUS VIEWER MODAL
      ========================== */}

      {selectedStatus && (
        <div
          className="fixed inset-0 z-[200] flex items-center justify-center bg-black/80 p-0 backdrop-blur-sm sm:p-5"
          onClick={() => setSelectedStatus(null)}
        >

          <div
            className="relative h-full w-full overflow-hidden bg-slate-950 sm:h-[90vh] sm:max-w-md sm:rounded-3xl"
            onClick={(e) => e.stopPropagation()}
          >

            {/* STATUS IMAGE */}

            <img
              src={selectedStatus.image}
              alt={selectedStatus.name}
              className="h-full w-full object-cover"
            />

            {/* TOP GRADIENT */}

            <div className="absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-black/70 to-transparent" />

            {/* PROGRESS */}

            <div className="absolute left-4 right-4 top-3 h-1 overflow-hidden rounded-full bg-white/30">

              <div
                className="h-full w-[45%] rounded-full bg-white"
                style={{
                  animation:
                    "statusProgress 5s linear forwards",
                }}
              />

            </div>


            {/* HEADER */}

            <div className="absolute left-4 right-4 top-7 flex items-center justify-between">

              <div className="flex items-center gap-3">

                <img
                  src={selectedStatus.image}
                  alt=""
                  className="h-10 w-10 rounded-full border-2 border-white object-cover"
                />

                <div>

                  <div className="text-sm font-black text-white">
                    {selectedStatus.name}
                  </div>

                  <div className="text-[10px] font-medium text-white/75">
                    {selectedStatus.category} •{" "}
                    {selectedStatus.time} ago
                  </div>

                </div>

              </div>

              <button
                type="button"
                onClick={() => setSelectedStatus(null)}
                className="flex h-9 w-9 items-center justify-center rounded-full bg-black/30 text-xl text-white backdrop-blur"
              >
                ×
              </button>

            </div>


            {/* BOTTOM CONTENT */}

            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent px-5 pb-7 pt-28">

              <div className="text-xl font-black text-white">
                {selectedStatus.name}
              </div>

              <p className="mt-1 text-xs text-white/80">
                Fresh update from this local business.
              </p>

              <div className="mt-4 flex gap-2">

                <Link
                  href="/search"
                  onClick={() => setSelectedStatus(null)}
                  className="flex-1 rounded-xl bg-white px-4 py-3 text-center text-xs font-black text-slate-900"
                >
                  View Business
                </Link>

                <button
                  type="button"
                  onClick={() => {
                    setSelectedStatus(null);
                    alert(
                      "Reply / Chat feature will be connected in the next step."
                    );
                  }}
                  className="flex-1 rounded-xl bg-blue-600 px-4 py-3 text-xs font-black text-white"
                >
                  💬 Reply
                </button>

              </div>

            </div>

          </div>

          <style jsx>{`
            @keyframes statusProgress {
              from {
                width: 0%;
              }
              to {
                width: 100%;
              }
            }
          `}</style>

        </div>
      )}

    </main>
  );
}