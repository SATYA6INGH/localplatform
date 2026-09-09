"use client";

import Link from "next/link";
import { useEffect, useMemo, useState, type FormEvent } from "react";
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

type StatusRecord = {
  id?: string;
  business_id?: string | null;
  businessId?: string | null;
  image_url?: string | null;
  media_url?: string | null;
  image?: string | null;
  media?: string | null;
  content?: string | null;
  text?: string | null;
  caption?: string | null;
  created_at?: string | null;
  expires_at?: string | null;
  expiry?: string | null;
  expiresAt?: string | null;
  [key: string]: unknown;
};

type LiveStatus = {
  id: string;
  businessId: string;
  businessName: string;
  category: string;
  city: string;
  image: string;
  caption: string;
  createdAt: string;
};

type Category = {
  name: string;
  icon: string;
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
].map(([name, icon]) => ({
  name,
  icon,
}));

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

function getStatusBusinessId(status: StatusRecord) {
  return String(status.business_id || status.businessId || "");
}

function getStatusImage(status: StatusRecord, business: Business) {
  return (
    String(
      status.image_url ||
        status.media_url ||
        status.image ||
        status.media ||
        business.image_url ||
        ""
    ) || fallbackImages[0]
  );
}

function getStatusCaption(status: StatusRecord) {
  return String(
    status.content ||
      status.text ||
      status.caption ||
      ""
  );
}

function getStatusCreatedAt(status: StatusRecord) {
  return String(status.created_at || "");
}

function isStatusLive(status: StatusRecord) {
  const now = Date.now();

  const explicitExpiry =
    status.expires_at ||
    status.expiry ||
    status.expiresAt;

  if (explicitExpiry) {
    const expiryTime = new Date(String(explicitExpiry)).getTime();

    if (!Number.isNaN(expiryTime)) {
      return expiryTime > now;
    }
  }

  if (status.created_at) {
    const createdTime = new Date(
      String(status.created_at)
    ).getTime();

    if (!Number.isNaN(createdTime)) {
      return now - createdTime <= 24 * 60 * 60 * 1000;
    }
  }

  return false;
}

function formatStatusTime(createdAt: string) {
  if (!createdAt) return "Live now";

  const created = new Date(createdAt).getTime();

  if (Number.isNaN(created)) {
    return "Live now";
  }

  const diff = Date.now() - created;

  if (diff < 60 * 1000) {
    return "Just now";
  }

  const minutes = Math.floor(diff / (60 * 1000));

  if (minutes < 60) {
    return `${minutes} min ago`;
  }

  const hours = Math.floor(minutes / 60);

  if (hours < 24) {
    return `${hours} hr ago`;
  }

  return "Today";
}

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
      className="group overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition duration-200 hover:-translate-y-1 hover:shadow-lg"
    >
      <div className="relative h-44 overflow-hidden bg-slate-100">
        <img
          src={image}
          alt={business.business_name}
          className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
          loading="lazy"
        />

        <div className="absolute left-3 top-3 rounded-full bg-white/95 px-2.5 py-1 text-[10px] font-black text-green-700 shadow-sm">
          ● Active
        </div>
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
        </div>

        {(business.short_description ||
          business.description) && (
          <p className="mt-2 line-clamp-2 text-xs leading-5 text-slate-500">
            {business.short_description ||
              business.description}
          </p>
        )}

        {(business.area || business.city) && (
          <p className="mt-3 text-xs font-semibold text-slate-600">
            📍{" "}
            {[business.area, business.city]
              .filter(Boolean)
              .join(", ")}
          </p>
        )}

        {business.phone && (
          <div className="mt-4 grid grid-cols-2 gap-2">
            <span className="rounded-xl bg-blue-50 py-2.5 text-center text-xs font-black text-blue-700">
              📞 Call
            </span>

            <span className="rounded-xl bg-green-50 py-2.5 text-center text-xs font-black text-green-700">
              💬 WhatsApp
            </span>
          </div>
        )}
      </div>
    </Link>
  );
}

function StatusViewer({
  status,
  onClose,
}: {
  status: LiveStatus;
  onClose: () => void;
}) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const started = Date.now();
    const duration = 7000;

    const timer = window.setInterval(() => {
      const elapsed = Date.now() - started;
      const value = Math.min(
        100,
        (elapsed / duration) * 100
      );

      setProgress(value);

      if (value >= 100) {
        window.clearInterval(timer);
        onClose();
      }
    }, 50);

    return () => window.clearInterval(timer);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center bg-black/90 p-3 sm:p-6">
      <div className="relative h-[min(90vh,760px)] w-full max-w-md overflow-hidden rounded-3xl bg-black shadow-2xl">
        <img
          src={status.image}
          alt={status.businessName}
          className="absolute inset-0 h-full w-full object-cover"
        />

        <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-transparent to-black/80" />

        <div className="absolute left-3 right-3 top-3 z-10">
          <div className="h-1 overflow-hidden rounded-full bg-white/30">
            <div
              className="h-full rounded-full bg-white transition-[width] duration-75"
              style={{
                width: `${progress}%`,
              }}
            />
          </div>

          <div className="mt-3 flex items-center justify-between">
            <div className="flex min-w-0 items-center gap-3">
              <div className="h-10 w-10 overflow-hidden rounded-full border-2 border-white">
                <img
                  src={status.image}
                  alt=""
                  className="h-full w-full object-cover"
                />
              </div>

              <div className="min-w-0 text-white">
                <p className="truncate text-sm font-black">
                  {status.businessName}
                </p>

                <p className="text-[10px] font-semibold text-white/75">
                  {formatStatusTime(status.createdAt)}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="flex h-10 w-10 items-center justify-center rounded-full bg-black/40 text-xl text-white backdrop-blur"
            >
              ×
            </button>
          </div>
        </div>

        <div className="absolute bottom-5 left-5 right-5 text-white">
          <p className="text-xs font-bold text-white/80">
            {status.category}
            {status.city
              ? ` • ${status.city}`
              : ""}
          </p>

          {status.caption && (
            <p className="mt-2 text-lg font-black leading-6">
              {status.caption}
            </p>
          )}

          <Link
            href={`/business/${encodeURIComponent(
              status.businessId
            )}`}
            className="mt-4 inline-flex rounded-xl bg-white px-5 py-3 text-xs font-black text-slate-900"
          >
            View Business
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function HomePage() {
  const [businesses, setBusinesses] =
    useState<Business[]>([]);

  const [liveStatuses, setLiveStatuses] =
    useState<LiveStatus[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [statusLoading, setStatusLoading] =
    useState(true);

  const [showAllCategories, setShowAllCategories] =
    useState(false);

  const [query, setQuery] = useState("");

  const [selectedStatus, setSelectedStatus] =
    useState<LiveStatus | null>(null);

  useEffect(() => {
    let mounted = true;

    async function loadHomeData() {
      setLoading(true);
      setStatusLoading(true);

      const now = new Date().toISOString();

      const businessesResult = await supabase
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
        .or(
          `listing_expires_at.is.null,listing_expires_at.gt.${now}`
        )
        .order("created_at", {
          ascending: false,
        })
        .limit(24);

      if (!mounted) return;

      const activeBusinesses =
        (businessesResult.data ||
          []) as Business[];

      setBusinesses(activeBusinesses);
      setLoading(false);

      /*
       * REAL 24-HOUR STATUS
       *
       * Statuses are loaded from Supabase "statuses" table.
       * We intentionally use select("*") so the homepage
       * remains compatible with status records containing
       * image_url/media_url/content/expires_at etc.
       */
      const statusesResult = await supabase
        .from("statuses")
        .select("*")
        .order("created_at", {
          ascending: false,
        })
        .limit(100);

      if (!mounted) return;

      if (
        statusesResult.error ||
        !statusesResult.data
      ) {
        console.error(
          "Status loading error:",
          statusesResult.error
        );

        setLiveStatuses([]);
        setStatusLoading(false);
        return;
      }

      const businessMap = new Map<
        string,
        Business
      >();

      activeBusinesses.forEach((business) => {
        businessMap.set(
          String(business.id),
          business
        );
      });

      const finalStatuses: LiveStatus[] = [];

      (
        statusesResult.data as StatusRecord[]
      ).forEach((status, index) => {
        const businessId =
          getStatusBusinessId(status);

        if (!businessId) return;

        const business =
          businessMap.get(businessId);

        /*
         * Only registered ACTIVE businesses
         * are allowed to appear in Live Status.
         */
        if (!business) return;

        if (!isStatusLive(status)) return;

        finalStatuses.push({
          id:
            String(status.id || `${businessId}-${index}`),

          businessId,

          businessName:
            business.business_name,

          category:
            business.category,

          city:
            business.city || "",

          image:
            getStatusImage(status, business),

          caption:
            getStatusCaption(status),

          createdAt:
            getStatusCreatedAt(status),
        });
      });

      /*
       * One business should appear only once in the
       * top Live Status row. Latest status wins because
       * the database query is ordered newest first.
       */
      const uniqueStatuses: LiveStatus[] = [];
      const seenBusinesses = new Set<string>();

      for (const status of finalStatuses) {
        if (seenBusinesses.has(status.businessId)) {
          continue;
        }

        seenBusinesses.add(status.businessId);
        uniqueStatuses.push(status);
      }

      setLiveStatuses(
        uniqueStatuses.slice(0, 12)
      );

      setStatusLoading(false);
    }

    loadHomeData();

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

  function submitSearch(e: FormEvent) {
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
    <main className="min-h-screen overflow-x-hidden bg-white pb-20 text-slate-900 md:pb-0">

      {/* =========================
          HERO
      ========================= */}
      <section className="relative overflow-hidden border-b border-slate-100 bg-gradient-to-br from-blue-50 via-white to-indigo-50">
        <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-blue-200/30 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-indigo-200/30 blur-3xl" />

        <div className="relative mx-auto max-w-7xl px-3 pb-8 pt-7 sm:px-6 sm:pb-12 sm:pt-10 lg:px-8">
          <div className="mx-auto max-w-5xl text-center">
            <div className="mb-2 inline-flex rounded-full border border-blue-100 bg-white/80 px-3 py-1 text-[10px] font-black uppercase tracking-[0.16em] text-blue-600 shadow-sm">
              India Local Business Platform
            </div>

            <h1 className="text-[32px] font-black leading-[1.02] tracking-[-0.04em] sm:text-5xl lg:text-6xl">
              Find Local Businesses
              <br />
              <span className="text-blue-600">
                & Services Near You
              </span>
            </h1>

            <p className="mx-auto mt-3 max-w-2xl text-xs leading-5 text-slate-500 sm:text-base sm:leading-6">
              Discover trusted businesses, shops,
              professionals and services in your city.
            </p>

            {/* SEARCH */}
            <form
              onSubmit={submitSearch}
              className="mx-auto mt-5 flex max-w-4xl overflow-hidden rounded-2xl border border-slate-200 bg-white p-1.5 shadow-xl shadow-blue-100/50"
            >
              <div className="flex min-w-0 flex-1 items-center">
                <span className="px-2 text-xl">
                  🔎
                </span>

                <input
                  value={query}
                  onChange={(e) =>
                    setQuery(e.target.value)
                  }
                  placeholder="Search business, service, category or city"
                  className="min-w-0 flex-1 bg-transparent px-1 py-3 text-xs font-semibold outline-none sm:text-sm"
                />
              </div>

              <button
                type="submit"
                className="rounded-xl bg-blue-600 px-5 text-xs font-black text-white transition hover:bg-blue-700 sm:px-8 sm:text-sm"
              >
                Search
              </button>
            </form>

            {/* POPULAR SEARCHES */}
            <div className="mt-3 flex gap-1.5 overflow-x-auto pb-1 sm:justify-center sm:overflow-visible">
              {popularSearches.map((item) => (
                <Link
                  key={item}
                  href={`/search?q=${encodeURIComponent(
                    item
                  )}`}
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
          LIVE 24H STATUS
      ========================= */}
      <section className="mx-auto max-w-7xl px-3 pt-6 sm:px-6 sm:pt-8 lg:px-8">
        <div className="rounded-3xl border border-slate-100 bg-white p-4 shadow-sm sm:p-6">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-red-50 text-sm">
                  🔴
                </span>

                <h2 className="text-lg font-black sm:text-2xl">
                  Live Near You
                </h2>
              </div>

              <p className="mt-1 text-[11px] text-slate-500 sm:text-sm">
                Fresh business updates from the last 24 hours.
              </p>
            </div>

            <span className="hidden rounded-full bg-green-50 px-3 py-1.5 text-[10px] font-black text-green-700 sm:block">
              24H STATUS
            </span>
          </div>

          {statusLoading ? (
            <div className="flex gap-4 overflow-hidden">
              {[1, 2, 3, 4, 5, 6].map(
                (item) => (
                  <div
                    key={item}
                    className="flex w-[78px] shrink-0 flex-col items-center"
                  >
                    <div className="h-[70px] w-[70px] animate-pulse rounded-full bg-slate-100" />

                    <div className="mt-2 h-3 w-16 animate-pulse rounded bg-slate-100" />
                  </div>
                )
              )}
            </div>
          ) : liveStatuses.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-5 py-7 text-center">
              <div className="text-3xl">
                📸
              </div>

              <p className="mt-2 text-sm font-black text-slate-800">
                No live business updates yet
              </p>

              <p className="mt-1 text-xs text-slate-500">
                Business owners can post a 24-hour status from their dashboard.
              </p>
            </div>
          ) : (
            <div className="flex gap-4 overflow-x-auto pb-1">
              {liveStatuses.map((status) => (
                <button
                  type="button"
                  key={status.id}
                  onClick={() =>
                    setSelectedStatus(status)
                  }
                  className="group w-[78px] shrink-0 text-center"
                >
                  <div className="mx-auto h-[72px] w-[72px] rounded-full bg-gradient-to-tr from-orange-500 via-pink-500 to-purple-600 p-[3px] shadow-md">
                    <div className="h-full w-full rounded-full bg-white p-[2px]">
                      <img
                        src={status.image}
                        alt={status.businessName}
                        className="h-full w-full rounded-full object-cover transition group-hover:scale-105"
                      />
                    </div>
                  </div>

                  <p className="mt-2 line-clamp-1 text-[10px] font-black text-slate-800">
                    {status.businessName}
                  </p>

                  <p className="mt-0.5 text-[9px] font-semibold text-slate-400">
                    {formatStatusTime(
                      status.createdAt
                    )}
                  </p>
                </button>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* =========================
          QUICK DISCOVERY
      ========================= */}
      <section className="mx-auto max-w-7xl px-3 py-6 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            ["📍", "Nearby", "Find services around you"],
            ["⚡", "Quick Search", "Search by category"],
            ["⭐", "Trusted", "Discover active listings"],
            ["💬", "Connect", "Call or message businesses"],
          ].map(
            ([icon, title, description]) => (
              <Link
                key={title}
                href="/search"
                className="rounded-2xl border border-slate-100 bg-slate-50 p-4 transition hover:border-blue-100 hover:bg-blue-50"
              >
                <div className="text-2xl">
                  {icon}
                </div>

                <p className="mt-2 text-xs font-black text-slate-900 sm:text-sm">
                  {title}
                </p>

                <p className="mt-1 text-[10px] leading-4 text-slate-500 sm:text-xs">
                  {description}
                </p>
              </Link>
            )
          )}
        </div>
      </section>

      {/* =========================
          CATEGORIES
      ========================= */}
      <section className="mx-auto max-w-7xl px-3 py-5 sm:px-6 sm:py-8 lg:px-8">
        <div className="mb-5 flex items-end justify-between">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.16em] text-blue-600">
              Explore
            </p>

            <h2 className="mt-1 text-lg font-black sm:text-2xl">
              Browse Categories
            </h2>

            <p className="mt-1 text-[11px] text-slate-500 sm:text-sm">
              Find the right local service faster.
            </p>
          </div>

          <button
            type="button"
            onClick={() =>
              setShowAllCategories(
                (value) => !value
              )
            }
            className="text-[11px] font-extrabold text-blue-600 sm:text-sm"
          >
            {showAllCategories
              ? "Show Less"
              : "View All"}
          </button>
        </div>

        <div className="grid grid-cols-4 gap-x-2 gap-y-6 sm:grid-cols-4 sm:gap-5 md:grid-cols-6 lg:grid-cols-8">
          {visibleCategories.map(
            (category) => (
              <Link
                key={category.name}
                href={`/search?category=${encodeURIComponent(
                  category.name
                )}`}
                className="group flex min-h-[82px] flex-col items-center text-center"
              >
                <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-50 text-[28px] shadow-sm transition group-hover:-translate-y-1 group-hover:bg-blue-50 sm:h-14 sm:w-14 sm:text-[34px]">
                  {category.icon}
                </span>

                <span className="mt-2 line-clamp-2 px-1 text-[10px] font-bold leading-4 text-slate-700 group-hover:text-blue-600 sm:text-xs">
                  {category.name}
                </span>
              </Link>
            )
          )}
        </div>
      </section>

      {/* =========================
          BUSINESS OWNER CTA
      ========================= */}
      <section className="mx-auto max-w-7xl px-3 py-4 sm:px-6 sm:py-6 lg:px-8">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 p-5 text-white shadow-xl sm:p-8">
          <div className="pointer-events-none absolute -right-20 -top-20 h-60 w-60 rounded-full bg-white/10 blur-3xl" />

          <div className="relative flex flex-col justify-between gap-5 sm:flex-row sm:items-center">
            <div>
              <p className="text-[10px] font-extrabold uppercase tracking-[0.16em] text-blue-100">
                For Business Owners
              </p>

              <h2 className="mt-1 text-xl font-black sm:text-3xl">
                Grow Your Business Online
              </h2>

              <p className="mt-2 max-w-xl text-xs leading-5 text-blue-100 sm:text-sm">
                List your business and get discovered by customers near you.
              </p>
            </div>

            <Link
              href="/list-business"
              className="inline-flex min-h-11 items-center justify-center rounded-xl bg-white px-6 text-sm font-black text-blue-700 shadow-lg transition hover:bg-blue-50"
            >
              List Your Business
            </Link>
          </div>

          <div className="relative mt-5 grid grid-cols-2 gap-2 text-[10px] font-bold text-blue-50 sm:grid-cols-4 sm:text-xs">
            {[
              "Online visibility",
              "Customer enquiries",
              "Business profile",
              "24H Status",
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
      ========================= */}
      <section className="mx-auto max-w-7xl px-3 py-6 sm:px-6 sm:py-8 lg:px-8">
        <div className="mb-4 flex items-end justify-between">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.16em] text-blue-600">
              Discover
            </p>

            <h2 className="mt-1 text-lg font-black sm:text-2xl">
              Popular Businesses
            </h2>

            <p className="mt-1 text-[11px] text-slate-500 sm:text-sm">
              Active local listings on LocalPlatform.
            </p>
          </div>

          <Link
            href="/search"
            className="text-[11px] font-extrabold text-blue-600 sm:text-sm"
          >
            View All
          </Link>
        </div>

        {loading ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map(
              (number) => (
                <div
                  key={number}
                  className="h-72 animate-pulse rounded-2xl bg-slate-100"
                />
              )
            )}
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
              className="mt-5 inline-flex rounded-xl bg-blue-600 px-5 py-3 text-xs font-black text-white"
            >
              List Your Business
            </Link>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {businesses
              .slice(0, 6)
              .map((business, index) => (
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
      ========================= */}
      <section className="mx-auto max-w-7xl px-3 py-6 sm:px-6 sm:py-10 lg:px-8">
        <div className="rounded-3xl bg-slate-950 p-6 text-white sm:p-10">
          <div className="max-w-2xl">
            <p className="text-[10px] font-black uppercase tracking-[0.18em] text-blue-300">
              LocalPlatform
            </p>

            <h2 className="mt-2 text-2xl font-black sm:text-4xl">
              Everything Local,
              <br />
              in One Place.
            </h2>

            <p className="mt-3 text-xs leading-5 text-slate-400 sm:text-sm">
              Search, discover and connect with local businesses and professionals.
            </p>
          </div>

          <div className="mt-7 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {[
              ["🔎", "Smart Search", "Find businesses by service, category and city."],
              ["📸", "24H Status", "See fresh updates from local businesses."],
              ["📞", "Direct Contact", "Call or connect with businesses directly."],
              ["📍", "Local Discovery", "Discover services available around you."],
            ].map(
              ([icon, title, description]) => (
                <div
                  key={title}
                  className="rounded-2xl border border-white/10 bg-white/5 p-4"
                >
                  <div className="text-2xl">
                    {icon}
                  </div>

                  <h3 className="mt-3 text-sm font-black">
                    {title}
                  </h3>

                  <p className="mt-1 text-[10px] leading-4 text-slate-400 sm:text-xs">
                    {description}
                  </p>
                </div>
              )
            )}
          </div>
        </div>
      </section>

      {/* =========================
          MOBILE NAV
      ========================= */}
      <nav
        aria-label="Mobile navigation"
        className="fixed bottom-0 left-0 right-0 z-[100] border-t border-slate-200 bg-white/95 shadow-[0_-5px_22px_rgba(15,23,42,0.10)] backdrop-blur md:hidden"
      >
        <div className="mx-auto grid max-w-lg grid-cols-5 px-1 pb-[env(safe-area-inset-bottom)]">
          {[
            ["Home", "/", "🏠"],
            ["Search", "/search", "🔎"],
            ["Status", "/", "📸"],
            ["List", "/list-business", "➕"],
            ["Account", "/dashboard", "👤"],
          ].map(
            ([label, href, icon]) => (
              <Link
                key={label}
                href={href}
                className="flex min-h-[62px] flex-col items-center justify-center gap-1 text-slate-600 transition hover:text-blue-600"
              >
                <span className="flex h-8 w-8 items-center justify-center text-[18px] leading-none">
                  {icon}
                </span>

                <span className="text-[9px] font-extrabold">
                  {label}
                </span>
              </Link>
            )
          )}
        </div>
      </nav>

      {/* =========================
          STATUS VIEWER
      ========================= */}
      {selectedStatus && (
        <StatusViewer
          status={selectedStatus}
          onClose={() =>
            setSelectedStatus(null)
          }
        />
      )}
    </main>
  );
}