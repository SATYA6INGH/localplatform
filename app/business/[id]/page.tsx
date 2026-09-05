import { createClient } from "@supabase/supabase-js";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

const SUPABASE_URL =
  "https://ckuiskbegrlrethnlhzq.supabase.co";

const SUPABASE_KEY =
  "sb_publishable_RnrbgHC56vWK6cSA1hmfkA_VVP74VPL";

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

type Business = {
  id: string;
  business_name: string;
  category: string;
  subcategory: string | null;
  services: string[] | null;
  description: string | null;
  short_description: string | null;
  highlights: string[] | null;
  seo_keywords: string[] | null;
  city: string;
  state: string | null;
  address: string | null;
  area: string | null;
  landmark: string | null;
  pincode: string | null;
  latitude: number | null;
  longitude: number | null;
  maps_url: string | null;
  phone: string | null;
  image_url: string | null;
};

async function getBusiness(id: string): Promise<Business | null> {
  const { data, error } = await supabase
    .from("businesses")
    .select(`
      id,
      business_name,
      category,
      subcategory,
      services,
      description,
      short_description,
      highlights,
      seo_keywords,
      city,
      state,
      address,
      area,
      landmark,
      pincode,
      latitude,
      longitude,
      maps_url,
      phone,
      image_url
    `)
    .eq("id", id)
    .maybeSingle();

  if (error) {
    console.error("Business detail error:", error);
    return null;
  }

  return data as Business | null;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const business = await getBusiness(id);

  if (!business) {
    return {
      title: "Business Not Found | LocalPlatform",
    };
  }

  const location = [business.area, business.city, business.state]
    .filter(Boolean)
    .join(", ");

  return {
    title: `${business.business_name} - ${business.category} in ${location}`,
    description:
      business.short_description ||
      business.description ||
      `Find ${business.business_name}, ${business.category} in ${location} on LocalPlatform.`,
    alternates: {
      canonical: `/business/${business.id}`,
    },
    robots: {
      index: true,
      follow: true,
    },
    openGraph: {
      title: business.business_name,
      description:
        business.short_description ||
        business.description ||
        `${business.category} in ${location}`,
      images: business.image_url
        ? [{ url: business.image_url }]
        : undefined,
    },
  };
}

export default async function BusinessPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const business = await getBusiness(id);

  if (!business) {
    notFound();
  }

  const services = Array.isArray(business.services)
    ? business.services
    : [];

  const highlights = Array.isArray(business.highlights)
    ? business.highlights
    : [];

  const keywords = Array.isArray(business.seo_keywords)
    ? business.seo_keywords
    : [];

  const fullAddress = [
    business.address,
    business.area,
    business.landmark,
    business.city,
    business.state,
    business.pincode,
  ]
    .filter(Boolean)
    .join(", ");

  const mapsLink =
    business.maps_url ||
    (business.latitude !== null &&
    business.longitude !== null
      ? `https://www.google.com/maps?q=${business.latitude},${business.longitude}`
      : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
          fullAddress || `${business.business_name}, ${business.city}`
        )}`);

  const whatsappNumber = business.phone
    ? business.phone.replace(/\D/g, "")
    : "";

  const whatsappLink = whatsappNumber
    ? `https://wa.me/91${whatsappNumber}?text=${encodeURIComponent(
        `Hello ${business.business_name}, I found your business on LocalPlatform.`
      )}`
    : "";

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name: business.business_name,
    description:
      business.description ||
      business.short_description ||
      undefined,
    image: business.image_url || undefined,
    telephone: business.phone || undefined,
    url: `https://localplatform.in/business/${business.id}`,
    address: {
      "@type": "PostalAddress",
      streetAddress: business.address || undefined,
      addressLocality: business.area || business.city,
      addressRegion: business.state || undefined,
      postalCode: business.pincode || undefined,
      addressCountry: "IN",
    },
    geo:
      business.latitude !== null &&
      business.longitude !== null
        ? {
            "@type": "GeoCoordinates",
            latitude: business.latitude,
            longitude: business.longitude,
          }
        : undefined,
    areaServed: business.city,
    keywords: keywords.join(", "),
  };

  return (
    <main className="min-h-screen bg-slate-50">

      {/* HERO */}
      <section className="bg-slate-950 text-white">
        <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">

          <div className="overflow-hidden rounded-3xl bg-slate-900 shadow-2xl">

            {business.image_url ? (
              <div className="relative h-64 sm:h-80 lg:h-96">
                <img
                  src={business.image_url}
                  alt={business.business_name}
                  className="h-full w-full object-cover"
                />

                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />

                <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-8">
                  <div className="flex flex-wrap gap-2">
                    <span className="rounded-full bg-blue-600 px-3 py-1 text-xs font-black">
                      {business.category}
                    </span>

                    {business.subcategory && (
                      <span className="rounded-full bg-white/15 px-3 py-1 text-xs font-bold backdrop-blur">
                        {business.subcategory}
                      </span>
                    )}
                  </div>

                  <h1 className="mt-3 text-3xl font-black sm:text-4xl">
                    {business.business_name}
                  </h1>

                  <p className="mt-2 text-sm text-slate-200 sm:text-base">
                    📍 {[business.area, business.city, business.pincode]
                      .filter(Boolean)
                      .join(", ")}
                  </p>
                </div>
              </div>
            ) : (
              <div className="p-7 sm:p-10">
                <span className="rounded-full bg-blue-600 px-3 py-1 text-xs font-black">
                  {business.category}
                </span>

                <h1 className="mt-4 text-3xl font-black sm:text-4xl">
                  {business.business_name}
                </h1>

                <p className="mt-2 text-slate-300">
                  📍 {[business.area, business.city, business.pincode]
                    .filter(Boolean)
                    .join(", ")}
                </p>
              </div>
            )}

            {/* ACTIONS */}
            <div className="grid gap-3 p-5 sm:grid-cols-3 sm:p-6">

              {business.phone ? (
                <a
                  href={`tel:${business.phone}`}
                  className="rounded-xl bg-blue-600 px-5 py-3 text-center font-black hover:bg-blue-700"
                >
                  📞 Call Now
                </a>
              ) : (
                <div className="rounded-xl bg-slate-800 px-5 py-3 text-center font-bold text-slate-500">
                  📞 Call
                </div>
              )}

              {whatsappLink ? (
                <a
                  href={whatsappLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-xl bg-green-600 px-5 py-3 text-center font-black hover:bg-green-700"
                >
                  💬 WhatsApp
                </a>
              ) : (
                <div className="rounded-xl bg-slate-800 px-5 py-3 text-center font-bold text-slate-500">
                  💬 WhatsApp
                </div>
              )}

              <a
                href={mapsLink}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-xl bg-white px-5 py-3 text-center font-black text-slate-900 hover:bg-slate-100"
              >
                🗺️ Get Directions
              </a>

            </div>
          </div>
        </div>
      </section>

      {/* CONTENT */}
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">

        <div className="grid gap-6 lg:grid-cols-3">

          {/* MAIN */}
          <div className="space-y-6 lg:col-span-2">

            {/* ABOUT */}
            <section className="rounded-3xl bg-white p-6 shadow-sm sm:p-8">
              <h2 className="text-2xl font-black text-slate-900">
                About {business.business_name}
              </h2>

              <p className="mt-4 whitespace-pre-line text-sm leading-7 text-slate-600 sm:text-base">
                {business.description ||
                  business.short_description ||
                  `${business.business_name} provides ${business.category.toLowerCase()} services in ${business.city}.`}
              </p>
            </section>

            {/* SERVICES */}
            {services.length > 0 && (
              <section className="rounded-3xl bg-white p-6 shadow-sm sm:p-8">
                <h2 className="text-2xl font-black text-slate-900">
                  Services
                </h2>

                <div className="mt-5 grid gap-3 sm:grid-cols-2">
                  {services.map((service) => (
                    <div
                      key={service}
                      className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 font-semibold text-slate-700"
                    >
                      ✓ {service}
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* HIGHLIGHTS */}
            {highlights.length > 0 && (
              <section className="rounded-3xl bg-white p-6 shadow-sm sm:p-8">
                <h2 className="text-2xl font-black text-slate-900">
                  Business Highlights
                </h2>

                <div className="mt-5 space-y-3">
                  {highlights.map((highlight) => (
                    <div
                      key={highlight}
                      className="flex gap-3 rounded-xl bg-blue-50 p-4"
                    >
                      <span className="font-black text-blue-600">
                        ✓
                      </span>

                      <span className="text-sm font-semibold text-slate-700">
                        {highlight}
                      </span>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* ADDRESS */}
            <section className="rounded-3xl bg-white p-6 shadow-sm sm:p-8">
              <h2 className="text-2xl font-black text-slate-900">
                Complete Address
              </h2>

              <p className="mt-4 text-sm leading-7 text-slate-600">
                {fullAddress || "Address not available"}
              </p>

              <a
                href={mapsLink}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-5 inline-flex rounded-xl bg-slate-900 px-5 py-3 font-bold text-white"
              >
                🗺️ Open in Google Maps
              </a>
            </section>

          </div>

          {/* SIDEBAR */}
          <aside className="space-y-6">

            {/* BUSINESS INFO */}
            <section className="rounded-3xl bg-white p-6 shadow-sm">
              <h2 className="text-xl font-black text-slate-900">
                Business Information
              </h2>

              <div className="mt-5 space-y-4 text-sm">

                <div>
                  <p className="text-xs font-bold uppercase text-slate-400">
                    Category
                  </p>

                  <p className="mt-1 font-bold text-slate-800">
                    {business.category}
                  </p>
                </div>

                {business.subcategory && (
                  <div>
                    <p className="text-xs font-bold uppercase text-slate-400">
                      Subcategory
                    </p>

                    <p className="mt-1 font-bold text-slate-800">
                      {business.subcategory}
                    </p>
                  </div>
                )}

                {business.phone && (
                  <div>
                    <p className="text-xs font-bold uppercase text-slate-400">
                      Phone
                    </p>

                    <a
                      href={`tel:${business.phone}`}
                      className="mt-1 block font-bold text-blue-600"
                    >
                      {business.phone}
                    </a>
                  </div>
                )}

                <div>
                  <p className="text-xs font-bold uppercase text-slate-400">
                    Location
                  </p>

                  <p className="mt-1 font-bold text-slate-800">
                    {business.city}
                  </p>
                </div>

              </div>
            </section>

            {/* MAP */}
            <section className="overflow-hidden rounded-3xl bg-white shadow-sm">
              <div className="bg-slate-900 p-5 text-white">
                <h2 className="font-black">
                  Find This Business
                </h2>

                <p className="mt-1 text-xs text-slate-300">
                  Open the exact location in Google Maps.
                </p>
              </div>

              <a
                href={mapsLink}
                target="_blank"
                rel="noopener noreferrer"
                className="block p-6 text-center"
              >
                <div className="rounded-2xl bg-slate-100 p-8">
                  <div className="text-5xl">📍</div>

                  <p className="mt-3 font-black text-slate-900">
                    View on Google Maps
                  </p>

                  <p className="mt-1 text-xs text-slate-500">
                    Get directions to this business
                  </p>
                </div>
              </a>
            </section>

            {/* VERIFIED */}
            <section className="rounded-3xl border border-blue-100 bg-blue-50 p-6">
              <div className="flex gap-3">
                <div className="text-2xl">✓</div>

                <div>
                  <h3 className="font-black text-slate-900">
                    LocalPlatform Listing
                  </h3>

                  <p className="mt-1 text-sm leading-6 text-slate-600">
                    Business information is published on LocalPlatform.
                  </p>
                </div>
              </div>
            </section>

          </aside>
        </div>
      </div>

      {/* SEO JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd),
        }}
      />
    </main>
  );
}