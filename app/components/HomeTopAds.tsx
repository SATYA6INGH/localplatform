"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getBusinessImage } from "../lib/business-images";
import { supabase } from "../lib/supabase";

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
    // The loader is intentionally invoked once when the component mounts.
    // eslint-disable-next-line react-hooks/immutability
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
    getBusinessImage(business.category, business.image_url);

  return (
    <section className="bg-slate-50 px-4 py-3 sm:px-6 sm:py-4">
      <div className="mx-auto w-full max-w-6xl">

        {/* HEADER */}
        <div className="mb-2 flex items-end justify-between gap-3">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.18em] text-orange-600 sm:text-xs">
              Sponsored
            </p>

            <h2 className="mt-1 text-base font-black tracking-tight text-slate-950 sm:text-lg">
              Featured Businesses
            </h2>
          </div>

          <div className="shrink-0 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-[9px] font-bold text-slate-500 sm:px-4 sm:text-[10px]">
            Premium Ads
          </div>
        </div>

        {/* AD CARD */}
        <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm sm:rounded-[20px]">

          <Link
            href={`/business/${currentAd.business_id}`}
            className="block"
          >
            <div className="grid min-h-[116px] grid-cols-[112px_1fr] md:min-h-[140px] md:grid-cols-[170px_1fr]">

              {/* IMAGE */}
              <div className="relative min-h-[116px] overflow-hidden bg-slate-100 md:min-h-[140px]">

                {image ? (
                  <img
                    src={image}
                    alt={business.business_name}
                    className="h-full w-full object-cover transition-transform duration-700 hover:scale-105"
                  />
                ) : (
                  <div className="flex h-full min-h-[116px] items-center justify-center text-4xl">
                    🏢
                  </div>
                )}

                <div className="absolute left-2 top-2 rounded-full bg-orange-500 px-2 py-1 text-[7px] font-black text-white shadow-lg">
                  🔥 FEATURED
                </div>
              </div>

              {/* CONTENT */}
              <div className="flex min-w-0 flex-col justify-center p-3 sm:p-4">

                <div className="text-[10px] font-black uppercase tracking-[0.15em] text-blue-600 sm:text-xs">
                  {business.category}
                </div>

                <h3 className="mt-1 truncate text-sm font-black leading-tight tracking-tight text-slate-950 sm:text-base">
                  {currentAd.title ||
                    business.business_name}
                </h3>

                <p className="mt-1 truncate text-[9px] font-medium text-slate-500 sm:text-xs">
                  📍 {business.city}
                </p>

                <p className="mt-1 truncate text-[9px] leading-4 text-slate-500 sm:text-[10px]">
                  Featured local business on LocalPlatform.
                </p>

                <div className="mt-2 inline-flex w-fit rounded-lg bg-slate-950 px-3 py-1.5 text-[8px] font-black text-white transition hover:bg-blue-600 sm:text-[10px]">
                  View →
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
