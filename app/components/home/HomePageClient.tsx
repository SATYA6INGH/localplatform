"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { createClient } from "@supabase/supabase-js";

import CategoryCard from "./CategoryCard";
import BusinessCard from "./BusinessCard";

import {
  categories,
  allCategoryNames,
  popularSearches,
  popularServices,
  popularLocations,
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
        .order("created_at", { ascending: false })
        .limit(12);

      if (!mounted) return;

      setBusinesses((data || []) as Business[]);
      setLoading(false);
    }

    loadBusinesses();

    return () => {
      mounted = false;
    };
  }, []);

  const categoryBusinessGroups = useMemo(() => {
    return categories
      .map((category) => ({
        category,
        businesses: businesses
          .filter((business) => business.category === category.name)
          .slice(0, 4),
      }))
      .filter((group) => group.businesses.length > 0);
  }, [businesses]);

  return (
    <main className="min-h-screen bg-slate-50 pb-20 text-slate-900 md:pb-0">

      {/* HERO / SEARCH */}

      <section className="border-b border-slate-200 bg-gradient-to-b from-blue-50 to-slate-50">
        <div className="mx-auto max-w-7xl px-4 pb-5 pt-5 sm:px-6 sm:pb-8 sm:pt-7 lg:px-8">
          <div className="mx-auto max-w-4xl text-center">

            <p className="mb-2 text-xs font-extrabold uppercase tracking-[0.18em] text-blue-600">
              India Local Business Directory
            </p>

            <h1 className="text-3xl font-black tracking-tight sm:text-5xl">
              Find Local Businesses &amp; Services Near You
            </h1>

            <p className="mx-auto mt-3 max-w-2xl text-sm leading-6 text-slate-600 sm:text-base">
              Discover trusted businesses, shops and professionals in your city.
            </p>

            <div className="mt-4 flex flex-wrap justify-center gap-2">
              {popularSearches.slice(0, 8).map((item) => (
                <Link
                  key={item.label}
                  href={`/search?q=${encodeURIComponent(item.query)}`}
                  className="rounded-full bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 shadow-sm hover:text-blue-600"
                >
                  {item.label}
                </Link>
              ))}
            </div>

          </div>
        </div>
      </section>

      {/* CATEGORIES */}

      <section className="mx-auto max-w-7xl px-4 py-5 sm:px-6 sm:py-7 lg:px-8">
        <div className="mb-4 flex items-end justify-between">

          <div>
            <h2 className="text-xl font-black sm:text-2xl">
              Browse Categories
            </h2>

            <p className="mt-1 text-xs text-slate-500 sm:text-sm">
              Find the right service faster.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setShowAllCategories((value) => !value)}
            className="text-xs font-bold text-blue-600 sm:text-sm"
          >
            {showAllCategories
              ? "Show Less"
              : "View All Categories"}
          </button>

        </div>

        <div className="grid grid-cols-6 gap-1 sm:grid-cols-4 sm:gap-3 md:grid-cols-6 lg:grid-cols-8">
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
              <CategoryCard
                key={name}
                category={category}
              />
            );
          })}
        </div>
      </section>

      {/* BUSINESS OWNER CTA */}

      <section className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-100 sm:p-7">

          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">

            <div>
              <p className="text-xs font-extrabold uppercase tracking-wider text-orange-500">
                For Business Owners
              </p>

              <h2 className="mt-1 text-2xl font-black">
                Grow Your Business Online
              </h2>

              <p className="mt-2 max-w-xl text-sm text-slate-600">
                List your business and get discovered by customers near you.
              </p>
            </div>

            <Link
              href="/list-business"
              className="inline-flex min-h-11 items-center justify-center rounded-xl bg-blue-600 px-5 text-sm font-bold text-white hover:bg-blue-700"
            >
              Add Your Business
            </Link>

          </div>

          <div className="mt-5 grid grid-cols-2 gap-2 text-xs font-semibold text-slate-600 sm:grid-cols-4">
            {[
              "Online visibility",
              "Customer enquiries",
              "Business profile",
              "Photos & reviews",
            ].map((item) => (
              <div
                key={item}
                className="rounded-xl bg-slate-50 p-3"
              >
                ✓ {item}
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* SERVICES */}

      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">

        <div className="mb-5">
          <h2 className="text-xl font-black sm:text-2xl">
            Popular Services
          </h2>

          <p className="mt-1 text-xs text-slate-500 sm:text-sm">
            Quickly find frequently searched local services.
          </p>
        </div>

        <div className="flex gap-2 overflow-x-auto pb-2">
          {popularServices.map((item) => (
            <Link
              key={item.label}
              href={`/search?q=${encodeURIComponent(item.query)}`}
              className="shrink-0 rounded-xl border border-slate-200 bg-white px-4 py-3 text-xs font-bold text-slate-700 shadow-sm hover:border-blue-200 hover:text-blue-600"
            >
              {item.label}
            </Link>
          ))}
        </div>

      </section>

      {/* BUSINESSES */}

      <section className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">

        <div className="mb-5 flex items-end justify-between">

          <div>
            <h2 className="text-xl font-black sm:text-2xl">
              Popular Businesses Near You
            </h2>

            <p className="mt-1 text-xs text-slate-500 sm:text-sm">
              Active local listings on LocalPlatform.
            </p>
          </div>

          <Link
            href="/search"
            className="text-xs font-bold text-blue-600 sm:text-sm"
          >
            View All
          </Link>

        </div>

        {loading ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((number) => (
              <div
                key={number}
                className="h-44 animate-pulse rounded-2xl bg-white"
              />
            ))}
          </div>
        ) : businesses.length === 0 ? (

          <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center">

            <div className="text-3xl">
              🏪
            </div>

            <h3 className="mt-2 font-bold">
              No businesses listed yet
            </h3>

            <p className="mt-1 text-sm text-slate-500">
              Be one of the first businesses on LocalPlatform.
            </p>

            <Link
              href="/list-business"
              className="mt-4 inline-flex rounded-xl bg-blue-600 px-5 py-3 text-sm font-bold text-white"
            >
              List Your Business
            </Link>

          </div>

        ) : (

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {businesses.slice(0, 6).map((business) => (
              <BusinessCard
                key={business.id}
                business={business}
              />
            ))}
          </div>

        )}

      </section>

      {/* CATEGORY-WISE BUSINESSES */}

      {categoryBusinessGroups.map((group) => (
        <section
          key={group.category.name}
          className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8"
        >

          <div className="mb-4 flex items-center justify-between">

            <h2 className="text-lg font-black sm:text-xl">
              {group.category.name}
            </h2>

            <Link
              href={`/search?category=${encodeURIComponent(
                group.category.name
              )}`}
              className="text-xs font-bold text-blue-600"
            >
              See all
            </Link>

          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {group.businesses.map((business) => (
              <BusinessCard
                key={business.id}
                business={business}
              />
            ))}
          </div>

        </section>
      ))}

      {/* LOCATIONS */}

      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">

        <h2 className="text-xl font-black sm:text-2xl">
          Popular Locations
        </h2>

        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-5">

          {popularLocations.map((city) => (
            <Link
              key={city}
              href={`/location/${city
                .toLowerCase()
                .replace(/\s+/g, "-")}`}
              className="rounded-xl border border-slate-200 bg-white p-4 text-sm font-bold text-slate-700 hover:border-blue-200 hover:text-blue-600"
            >
              📍 {city}
            </Link>
          ))}

        </div>

      </section>

      {/* HOW IT WORKS */}

      <section className="border-y border-slate-200 bg-white">

        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">

          <h2 className="text-center text-xl font-black sm:text-2xl">
            How It Works
          </h2>

          <div className="mt-7 grid gap-4 md:grid-cols-3">

            {[
              [
                "1",
                "Search",
                "Find the business or service you need.",
              ],
              [
                "2",
                "Compare",
                "Check ratings, reviews, photos and business information.",
              ],
              [
                "3",
                "Contact",
                "Call, WhatsApp, visit or send an enquiry.",
              ],
            ].map(([number, title, description]) => (

              <div
                key={number}
                className="rounded-2xl bg-slate-50 p-5 text-center"
              >

                <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-blue-600 text-sm font-black text-white">
                  {number}
                </div>

                <h3 className="mt-3 font-extrabold">
                  {title}
                </h3>

                <p className="mt-1 text-sm leading-6 text-slate-600">
                  {description}
                </p>

              </div>

            ))}

          </div>

        </div>

      </section>

      {/* TRUST */}

      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">

        <div className="rounded-3xl bg-slate-900 p-6 text-white sm:p-9">

          <h2 className="text-2xl font-black">
            Why Use LocalPlatform?
          </h2>

          <div className="mt-5 grid grid-cols-2 gap-3 text-sm sm:grid-cols-3 lg:grid-cols-6">

            {[
              "Verified Businesses",
              "Real Customer Reviews",
              "Local Search",
              "Easy Contact",
              "Accurate Location",
              "Complete Information",
            ].map((item) => (
              <div
                key={item}
                className="rounded-xl bg-white/10 p-3 font-semibold"
              >
                ✓ {item}
              </div>
            ))}

          </div>

        </div>

      </section>

      <div className="mx-auto max-w-7xl px-4 pb-12 text-center text-xs text-slate-400 sm:px-6 lg:px-8">
        LocalPlatform is designed for businesses, shops, professionals,
        freelancers and service providers across India.
      </div>

    </main>
  );
}