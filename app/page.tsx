"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";

import SearchBar from "./SearchBar";
import CategoryCard from "./CategoryCard";
import BusinessCard from "./BusinessCard";

import {
  categories,
  allCategoryNames,
  popularSearches,
} from "./data";

import type { Business } from "./types";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL ||
    "https://ckuiskbegrlrethnlhzq.supabase.co",
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || ""
);

export default function HomePageClient() {
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAllCategories, setShowAllCategories] = useState(false);

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

  return (
    <main className="min-h-screen bg-white pb-20 text-slate-900 md:pb-0">

      {/* HERO */}
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

            <div className="mx-auto mt-4 max-w-4xl sm:mt-6">
              <SearchBar />
            </div>

            <div className="mt-3 flex gap-1.5 overflow-x-auto pb-1 sm:justify-center sm:overflow-visible">
              {popularSearches.slice(0, 8).map((item) => (
                <Link
                  key={item.label}
                  href={`/search?q=${encodeURIComponent(item.query)}`}
                  className="shrink-0 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-[10px] font-bold text-slate-600 shadow-sm hover:border-blue-200 hover:text-blue-600 sm:text-xs"
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CATEGORIES ONLY */}
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
          {(showAllCategories
            ? allCategoryNames
            : categories.map((category) => category.name)
          ).map((name) => {
            const found = categories.find(
              (category) => category.name === name
            );

            const category = found || {
              name,
              icon: "•",
              keywords: [],
            };

            return (
              <Link
                key={name}
                href={`/search?category=${encodeURIComponent(name)}`}
                className="group flex min-h-[78px] flex-col items-center justify-start text-center"
              >
                <span className="flex h-11 items-center justify-center text-[34px] leading-none transition-transform group-hover:scale-105 sm:h-14 sm:text-[42px]">
                  {category.icon}
                </span>

                <span className="mt-2 line-clamp-2 px-1 text-[10px] font-bold leading-4 text-slate-700 group-hover:text-blue-600 sm:text-xs">
                  {name}
                </span>
              </Link>
            );
          })}
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
              <div
                key={item}
                className="rounded-xl bg-white/10 px-3 py-2.5"
              >
                ✓ {item}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ACTIVE BUSINESSES */}
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
                className="h-40 animate-pulse rounded-2xl bg-slate-100"
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
            {businesses.map((business) => (
              <BusinessCard
                key={business.id}
                business={business}
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
