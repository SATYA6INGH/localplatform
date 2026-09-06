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

const categories: Category[] = [
  ["Beauty & Salon","💇"],["Coaching & Tuition","📚"],["School & Education","🏫"],
  ["College & University","🎓"],["Training & Skill Development","🧑‍🏫"],["Doctor & Clinic","🩺"],
  ["Hospital & Healthcare","🏥"],["Pharmacy & Medical","💊"],["Diagnostic & Pathology","🔬"],
  ["Dental Care","🦷"],["Fitness & Wellness","🏋️"],["Restaurant & Food","🍽️"],
  ["Cafe & Bakery","☕"],["Sweet & Namkeen","🍬"],["Caterers","🍱"],
  ["Hotel & Accommodation","🏨"],["Travel & Tourism","✈️"],["Real Estate","🏠"],
  ["Architect & Interior","📐"],["Construction & Contractor","👷"],["Building Material","🧱"],
  ["Home Services","🛠️"],["Repair & Maintenance","🔧"],["Furniture & Home Decor","🛋️"],
  ["Electrical & Electronics","⚡"],["Hardware & Sanitary","🚿"],["Tiles, Marble & Flooring","⬜"],
  ["Paint & Wallpaper","🎨"],["Aluminium, Glass & UPVC","🪟"],["Fabrication & Welding","⚙️"],
  ["Solar & Energy","☀️"],["Security & CCTV","📹"],["Automobile","🚗"],
  ["Rental & Leasing","🔑"],["Driving School","🚘"],["Transport & Logistics","🚚"],
  ["Courier & Delivery","📦"],["Clothing & Fashion","👗"],["Boutique & Tailoring","🧵"],
  ["Jewellery & Accessories","💎"],["Footwear & Bags","👟"],["Cosmetics & Beauty Products","💄"],
  ["Grocery & Supermarket","🛒"],["Mobile & Computer","📱"],["IT & Software Services","💻"],
  ["Printing & Advertising","🖨️"],["Photography & Videography","📷"],["Event & Wedding Services","💍"],
  ["Entertainment & Recreation","🎬"],["Sports & Games","⚽"],["Kids & Childcare","🧒"],
  ["Pet & Veterinary","🐾"],["Agriculture & Farming","🌾"],["Nursery & Landscaping","🌱"],
  ["Manufacturing","🏭"],["Wholesale & Distribution","📦"],["Dealer & Supplier","🏪"],
  ["Industrial Services","🏗️"],["Machinery & Equipment","⚙️"],["Business & Management Consulting","📊"],
  ["CA & Tax Services","🧾"],["Legal Services","⚖️"],["Finance & Loan","💰"],
  ["Insurance","🛡️"],["Banking & ATM","🏦"],["Digital Marketing","📈"],
  ["Graphic & Creative Services","🖌️"],["Recruitment & Manpower","👥"],["Cleaning Services","🧹"],
  ["Domestic Help","🏠"],["Laundry & Dry Cleaning","👕"],["Property Services","🏢"],
  ["Government & Public Services","🏛️"],["NGO & Social Services","🤝"],["Religious & Community Services","🛕"],
  ["Professional Services","💼"],["Security Services","👮"],["Party & Event Rental","🎪"],
  ["Repair, Installation & Maintenance","🔩"],["Other Services","➕"],
].map(([name, icon]) => ({ name, icon }));

const popularSearches = [
  "Beauty Parlour","Restaurant","Doctor","Gym","Coaching",
  "Salon","Electrician","Plumber"
];

const fallbackImages = [
  "https://images.unsplash.com/photo-1524758631624-e2822e304c36?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1556761175-b413da4baf72?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1497366811353-6870744d04b2?auto=format&fit=crop&w=900&q=80",
];

function BusinessCard({ business, index }: { business: Business; index: number }) {
  const image = business.image_url || fallbackImages[index % fallbackImages.length];

  const slug = encodeURIComponent(
    business.business_name.toLowerCase().replace(/\s+/g, "-")
  );

  return (
    <Link
      href={`/business/${slug}?id=${encodeURIComponent(business.id)}`}
      className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
    >
      <div className="h-40 overflow-hidden bg-slate-100">
        <img
          src={image}
          alt={business.business_name}
          className="h-full w-full object-cover"
          loading="lazy"
        />
      </div>

      <div className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="line-clamp-1 text-base font-black text-slate-900">
              {business.business_name}
            </h3>
            <p className="mt-1 text-xs font-semibold text-blue-600">
              {business.category}
            </p>
          </div>
          <span className="rounded-full bg-green-50 px-2 py-1 text-[10px] font-bold text-green-700">
            Active
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

        {business.phone && (
          <div className="mt-3 flex gap-2">
            <span className="flex-1 rounded-lg bg-blue-50 py-2 text-center text-xs font-black text-blue-700">
              Call
            </span>
            <span className="flex-1 rounded-lg bg-green-50 py-2 text-center text-xs font-black text-green-700">
              WhatsApp
            </span>
          </div>
        )}
      </div>
    </Link>
  );
}

export default function HomePage() {
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAllCategories, setShowAllCategories] = useState(false);
  const [query, setQuery] = useState("");

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
    () => (showAllCategories ? categories : categories.slice(0, 16)),
    [showAllCategories]
  );

  function submitSearch(e: React.FormEvent) {
    e.preventDefault();
    const value = query.trim();

    if (value) {
      window.location.href = `/search?q=${encodeURIComponent(value)}`;
    } else {
      window.location.href = "/search";
    }
  }

  return (
    <main className="min-h-screen bg-white pb-20 text-slate-900 md:pb-0">

      {/* HERO + SEARCH */}
      <section className="border-b border-slate-100 bg-gradient-to-b from-blue-50 via-white to-white">
        <div className="mx-auto max-w-7xl px-3 pb-7 pt-5 sm:px-6 sm:pb-10 sm:pt-8 lg:px-8">
          <div className="mx-auto max-w-5xl text-center">

            <p className="mb-1.5 text-[10px] font-extrabold uppercase tracking-[0.18em] text-blue-600 sm:text-xs">
              India Local Business Directory
            </p>

            <h1 className="text-[29px] font-black leading-[1.03] tracking-[-0.035em] sm:text-5xl">
              Find Local Businesses &amp; Services
              <br className="hidden sm:block" />
              <span className="sm:hidden"> </span>
              Near You
            </h1>

            <p className="mx-auto mt-2 max-w-xl text-xs leading-5 text-slate-500 sm:mt-3 sm:text-base">
              Discover trusted businesses, shops and professionals in your city.
            </p>

            <form
              onSubmit={submitSearch}
              className="mx-auto mt-4 flex max-w-4xl overflow-hidden rounded-2xl border border-slate-200 bg-white p-1.5 shadow-md sm:mt-6 sm:rounded-xl"
            >
              <div className="flex min-w-0 flex-1 items-center">
                <span className="px-2 text-lg">🔎</span>
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search business, service, category or city"
                  className="min-w-0 flex-1 bg-transparent px-1 py-3 text-xs font-medium outline-none sm:text-sm"
                />
              </div>

              <button
                type="submit"
                className="rounded-xl bg-blue-600 px-5 text-xs font-black text-white hover:bg-blue-700 sm:px-7 sm:text-sm"
              >
                Search
              </button>
            </form>

            <div className="mt-3 flex gap-1.5 overflow-x-auto pb-1 sm:justify-center sm:overflow-visible">
              {popularSearches.map((item) => (
                <Link
                  key={item}
                  href={`/search?q=${encodeURIComponent(item)}`}
                  className="shrink-0 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-[10px] font-bold text-slate-600 shadow-sm hover:border-blue-200 hover:text-blue-600 sm:text-xs"
                >
                  {item}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CATEGORIES */}
      <section className="mx-auto max-w-7xl px-3 py-6 sm:px-6 sm:py-8 lg:px-8">
        <div className="mb-5 flex items-end justify-between">
          <div>
            <h2 className="text-lg font-black sm:text-2xl">
              Browse Categories
            </h2>
            <p className="mt-1 text-[11px] text-slate-500 sm:text-sm">
              Find the right local service faster.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setShowAllCategories((value) => !value)}
            className="text-[11px] font-extrabold text-blue-600 sm:text-sm"
          >
            {showAllCategories ? "Show Less" : "View All"}
          </button>
        </div>

        <div className="grid grid-cols-4 gap-x-2 gap-y-6 sm:grid-cols-4 sm:gap-5 md:grid-cols-6 lg:grid-cols-8">
          {visibleCategories.map((category) => (
            <Link
              key={category.name}
              href={`/search?category=${encodeURIComponent(category.name)}`}
              className="group flex min-h-[78px] flex-col items-center text-center"
            >
              <span className="flex h-11 items-center justify-center text-[32px] leading-none transition-transform group-hover:scale-105 sm:h-14 sm:text-[40px]">
                {category.icon}
              </span>

              <span className="mt-2 line-clamp-2 px-1 text-[10px] font-bold leading-4 text-slate-700 group-hover:text-blue-600 sm:text-xs">
                {category.name}
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* BUSINESS OWNER CTA */}
      <section className="mx-auto max-w-7xl px-3 py-3 sm:px-6 sm:py-5 lg:px-8">
        <div className="overflow-hidden rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 p-5 text-white shadow-sm sm:rounded-3xl sm:p-8">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
            <div>
              <p className="text-[10px] font-extrabold uppercase tracking-[0.16em] text-blue-100">
                For Business Owners
              </p>

              <h2 className="mt-1 text-xl font-black sm:text-3xl">
                Grow Your Business Online
              </h2>

              <p className="mt-1.5 max-w-xl text-xs leading-5 text-blue-100 sm:text-sm">
                List your business and get discovered by customers near you.
              </p>
            </div>

            <Link
              href="/list-business"
              className="inline-flex min-h-11 items-center justify-center rounded-xl bg-white px-5 text-sm font-black text-blue-700 shadow-sm hover:bg-blue-50"
            >
              List Your Business
            </Link>
          </div>

          <div className="mt-5 grid grid-cols-2 gap-2 text-[10px] font-bold text-blue-50 sm:grid-cols-4 sm:text-xs">
            {[
              "Online visibility",
              "Customer enquiries",
              "Business profile",
              "Photos & reviews",
            ].map((item) => (
              <div key={item} className="rounded-xl bg-white/10 px-3 py-2.5">
                ✓ {item}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* BUSINESSES */}
      <section className="mx-auto max-w-7xl px-3 py-6 sm:px-6 sm:py-8 lg:px-8">
        <div className="mb-4 flex items-end justify-between">
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
            className="text-[11px] font-extrabold text-blue-600 sm:text-sm"
          >
            View All
          </Link>
        </div>

        {loading ? (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((number) => (
              <div
                key={number}
                className="h-64 animate-pulse rounded-2xl bg-slate-100"
              />
            ))}
          </div>
        ) : businesses.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-7 text-center">
            <div className="text-3xl">🏪</div>
            <h3 className="mt-2 text-sm font-black">
              No businesses listed yet
            </h3>
            <p className="mt-1 text-xs text-slate-500">
              Be one of the first businesses on LocalPlatform.
            </p>
            <Link
              href="/list-business"
              className="mt-4 inline-flex rounded-xl bg-blue-600 px-5 py-3 text-xs font-black text-white"
            >
              List Your Business
            </Link>
          </div>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
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

      {/* MOBILE BOTTOM NAV */}
      <nav
        aria-label="Mobile navigation"
        className="fixed bottom-0 left-0 right-0 z-[100] border-t border-slate-200 bg-white shadow-[0_-5px_22px_rgba(15,23,42,0.10)] md:hidden"
      >
        <div className="mx-auto grid max-w-lg grid-cols-6 px-1 pb-[env(safe-area-inset-bottom)]">
          {[
            ["Home", "/", "🏠"],
            ["Services", "/search", "🔎"],
            ["List", "/list-business", "➕"],
            ["Leads", "/dashboard", "📋"],
            ["B2B", "/list-business", "🏢"],
            ["More", "/dashboard", "☰"],
          ].map(([label, href, icon]) => (
            <Link
              key={label}
              href={href}
              className="flex min-h-[62px] flex-col items-center justify-center gap-1 text-slate-600"
            >
              <span className="flex h-8 w-8 items-center justify-center text-[18px] leading-none">
                {icon}
              </span>
              <span className="text-[9px] font-extrabold">{label}</span>
            </Link>
          ))}
        </div>
      </nav>
    </main>
  );
}
