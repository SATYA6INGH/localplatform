"use client";

import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import Link from "next/link";

const supabase = createClient(
  "https://ckuiskbegrlrethnlhzq.supabase.co",
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      storageKey: "localplatform-auth",
    },
  }
);

type Business = {
  business_name: string;
  category: string;
  city: string;
  image_url: string | null;
};

type HomeAd = {
  id: string;
  title: string | null;
  image_url: string | null;
  business_id: string;
  business: Business | Business[] | null;
};

export default function HomeTopAds() {
  const [ads, setAds] = useState<HomeAd[]>([]);
  const [active, setActive] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAds();
  }, []);

  async function loadAds() {
    try {
      const now = new Date().toISOString();

      const { data, error } = await supabase
        .from("home_ads")
        .select(`
          id,
          title,
          image_url,
          business_id,
          business:businesses(
            business_name,
            category,
            city,
            image_url
          )
        `)
        .eq("status", "approved")
        .lte("starts_at", now)
        .gt("expires_at", now);

      if (error) {
        console.error("HOME ADS ERROR:", error);
        return;
      }

      const validAds = ((data || []) as unknown as HomeAd[]).filter(
        (ad) => {
          const business = Array.isArray(ad.business)
            ? ad.business[0]
            : ad.business;

          return !!business;
        }
      );

      setAds(validAds);
    } catch (error) {
      console.error("HOME ADS ERROR:", error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (ads.length <= 1) return;

    const timer = setInterval(() => {
      setActive((current) =>
        current >= ads.length - 1 ? 0 : current + 1
      );
    }, 5000);

    return () => clearInterval(timer);
  }, [ads.length]);

  if (loading || ads.length === 0) {
    return null;
  }

  const currentAd = ads[active];

  if (!currentAd) {
    return null;
  }

  const business = Array.isArray(currentAd.business)
    ? currentAd.business[0]
    : currentAd.business;

  if (!business) {
    return null;
  }

  const image =
    currentAd.image_url ||
    business.image_url ||
    "";

  return (
    <section className="bg-slate-50 px-4 py-8 sm:px-6 sm:py-10">
      <div className="mx-auto w-full max-w-6xl">

        {/* HEADER */}
        <div className="mb-4 flex items-end justify-between gap-3">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.18em] text-orange-600 sm:text-xs">
              Sponsored
            </p>

            <h2 className="mt-1 text-xl font-black tracking-tight text-slate-950 sm:text-2xl">
              Featured Businesses
            </h2>
          </div>

          <div className="shrink-0 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-[9px] font-bold text-slate-500 sm:px-4 sm:text-[10px]">
            Premium Ads
          </div>
        </div>

        {/* AD CARD */}
        <div className="relative overflow-hidden rounded-[22px] border border-slate-200 bg-white shadow-lg sm:rounded-[28px]">

          <Link
            href={`/business/${currentAd.business_id}`}
            className="block"
          >
            <div className="grid min-h-[430px] md:min-h-[320px] md:grid-cols-2">

              {/* IMAGE */}
              <div className="relative min-h-[230px] overflow-hidden bg-slate-100 sm:min-h-[280px] md:min-h-[320px]">

                {image ? (
                  <img
                    src={image}
                    alt={business.business_name}
                    className="h-full w-full object-cover transition-transform duration-700 hover:scale-105"
                  />
                ) : (
                  <div className="flex h-full min-h-[230px] items-center justify-center text-6xl sm:min-h-[280px]">
                    🏢
                  </div>
                )}

                <div className="absolute left-4 top-4 rounded-full bg-orange-500 px-3 py-1.5 text-[9px] font-black text-white shadow-lg sm:left-5 sm:top-5">
                  🔥 FEATURED
                </div>
              </div>

              {/* CONTENT */}
              <div className="flex flex-col justify-center p-5 sm:p-7 md:p-9">

                <div className="text-[10px] font-black uppercase tracking-[0.15em] text-blue-600 sm:text-xs">
                  {business.category}
                </div>

                <h3 className="mt-2 text-2xl font-black leading-tight tracking-tight text-slate-950 sm:text-3xl">
                  {currentAd.title ||
                    business.business_name}
                </h3>

                <p className="mt-3 text-xs font-medium text-slate-500 sm:text-sm">
                  📍 {business.city}
                </p>

                <p className="mt-4 max-w-md text-xs leading-5 text-slate-500 sm:mt-5 sm:text-sm sm:leading-6">
                  Discover this featured local business
                  on LocalPlatform.
                </p>

                <div className="mt-5 inline-flex w-fit rounded-xl bg-slate-950 px-5 py-3 text-[10px] font-black text-white transition hover:bg-blue-600 sm:mt-6 sm:text-xs">
                  View Business →
                </div>

              </div>
            </div>
          </Link>

          {/* SLIDER DOTS */}
          {ads.length > 1 && (
            <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 items-center gap-1.5 rounded-full bg-white/90 px-3 py-2 shadow-md backdrop-blur">

              {ads.map((ad, index) => (
                <button
                  key={ad.id}
                  type="button"
                  aria-label={`Show featured business ${index + 1}`}
                  onClick={() => setActive(index)}
                  className={`h-2 rounded-full transition-all ${
                    active === index
                      ? "w-6 bg-slate-950"
                      : "w-2 bg-slate-300"
                  }`}
                />
              ))}

            </div>
          )}

        </div>

        {/* ROTATION TEXT */}
        {ads.length > 1 && (
          <p className="mt-3 text-center text-[9px] font-medium text-slate-400 sm:text-[10px]">
            Featured businesses automatically rotate
          </p>
        )}

      </div>
    </section>
  );
}