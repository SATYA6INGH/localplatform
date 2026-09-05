import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { createClient } from "@supabase/supabase-js";

type Business = {
  id: string;
  business_name: string;
  category: string;
  address: string | null;
  area: string | null;
  landmark: string | null;
  city: string;
  state: string | null;
  pincode: string | null;
  phone: string | null;
  image_url: string | null;
  maps_url: string | null;
  latitude: number | null;
  longitude: number | null;
};

type Props = {
  params: Promise<{ id: string }>;
};

const SUPABASE_URL = "https://ckuiskbegrlrethnlhzq.supabase.co";

function getSupabase() {
  return createClient(
    SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
  );
}

async function getBusiness(id: string): Promise<Business | null> {
  const supabase = getSupabase();

  const { data, error } = await supabase
    .from("businesses")
    .select(
      "id, business_name, category, address, area, landmark, city, state, pincode, phone, image_url, maps_url, latitude, longitude"
    )
    .eq("id", id)
    .maybeSingle();

  if (error) {
    console.error("Business fetch error:", error);
    return null;
  }

  return data as Business | null;
}

export async function generateMetadata({
  params,
}: Props): Promise<Metadata> {
  const { id } = await params;
  const business = await getBusiness(id);

  if (!business) {
    return {
      title: "Business Not Found",
    };
  }

  const location = [
    business.area,
    business.city,
    business.state,
    business.pincode,
  ]
    .filter(Boolean)
    .join(", ");

  const title = `${business.business_name} - ${business.category} in ${business.city}`;

  const description = `Find ${
    business.business_name
  }, a ${business.category.toLowerCase()} in ${location}. View address, phone number, location and directions on LocalPlatform.`;

  return {
    title,
    description,
    keywords: [
      business.business_name,
      business.category,
      `${business.category} in ${business.city}`,
      `${business.business_name} ${business.city}`,
      `businesses in ${business.city}`,
      `local businesses ${business.city}`,
      business.area || "",
      business.city,
      business.state || "",
      business.pincode || "",
    ].filter(Boolean),

    alternates: {
      canonical: `/business/${business.id}`,
    },

    openGraph: {
      title,
      description,
      type: "website",
      url: `/business/${business.id}`,
      siteName: "LocalPlatform",
      images: business.image_url
        ? [
            {
              url: business.image_url,
              width: 1200,
              height: 630,
              alt: business.business_name,
            },
          ]
        : undefined,
    },

    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
      },
    },
  };
}

export default async function BusinessPage({ params }: Props) {
  const { id } = await params;
  const business = await getBusiness(id);

  if (!business) {
    notFound();
  }

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

  const mapsUrl =
    business.maps_url ||
    (business.latitude !== null && business.longitude !== null
      ? `https://www.google.com/maps/dir/?api=1&destination=${business.latitude},${business.longitude}`
      : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
          fullAddress
        )}`);

  const phoneDigits = business.phone?.replace(/\D/g, "") || "";

  const whatsappNumber =
    phoneDigits.length === 10 ? `91${phoneDigits}` : phoneDigits;

  const whatsappUrl = whatsappNumber
    ? `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(
        `Hello, I found ${business.business_name} on LocalPlatform.`
      )}`
    : null;

  const schemaAddress = {
    "@type": "PostalAddress",
    streetAddress: [business.address, business.area, business.landmark]
      .filter(Boolean)
      .join(", "),
    addressLocality: business.city,
    addressRegion: business.state || undefined,
    postalCode: business.pincode || undefined,
    addressCountry: "IN",
  };

  const businessSchema = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name: business.business_name,
    description: `${business.business_name} - ${business.category} in ${business.city}`,
    url: `https://localplatform.in/business/${business.id}`,
    telephone: business.phone || undefined,
    image: business.image_url || undefined,
    address: schemaAddress,
    ...(business.latitude !== null && business.longitude !== null
      ? {
          geo: {
            "@type": "GeoCoordinates",
            latitude: business.latitude,
            longitude: business.longitude,
          },
        }
      : {}),
    ...(business.maps_url
      ? {
          hasMap: business.maps_url,
        }
      : {}),
    areaServed: {
      "@type": "City",
      name: business.city,
    },
  };

  return (
    <main className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-10">
        {/* TOP NAV */}
        <div className="mb-6 flex items-center justify-between">
          <a
            href="/search"
            className="font-semibold text-blue-600 hover:text-blue-700"
          >
            ← Back to Search
          </a>

          <a
            href="/"
            className="font-semibold text-slate-600 hover:text-blue-600"
          >
            Home
          </a>
        </div>

        {/* BUSINESS CARD */}
        <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-lg">
          {/* IMAGE */}
          {business.image_url ? (
            <div className="h-64 w-full bg-slate-100 sm:h-80 md:h-96">
              <img
                src={business.image_url}
                alt={`${business.business_name} - ${business.category} in ${business.city}`}
                className="h-full w-full object-cover"
              />
            </div>
          ) : (
            <div className="flex h-64 w-full items-center justify-center bg-gradient-to-br from-blue-50 to-slate-100 sm:h-80 md:h-96">
              <span className="text-6xl">🏢</span>
            </div>
          )}

          <div className="p-5 sm:p-8 md:p-10">
            {/* NAME */}
            <div>
              <div className="mb-3 inline-flex rounded-full bg-blue-50 px-4 py-2 text-sm font-semibold text-blue-700">
                {business.category}
              </div>

              <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl md:text-5xl">
                {business.business_name}
              </h1>

              <p className="mt-3 text-base text-slate-500 sm:text-lg">
                {business.category} in {business.city}
              </p>
            </div>

            {/* ACTION BUTTONS */}
            <div className="mt-7 grid grid-cols-1 gap-3 sm:grid-cols-3">
              {business.phone && (
                <a
                  href={`tel:${business.phone}`}
                  className="rounded-xl bg-blue-600 px-5 py-3 text-center font-bold text-white transition hover:bg-blue-700"
                >
                  📞 Call Now
                </a>
              )}

              {whatsappUrl && (
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-xl bg-green-600 px-5 py-3 text-center font-bold text-white transition hover:bg-green-700"
                >
                  💬 WhatsApp
                </a>
              )}

              <a
                href={mapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-xl bg-slate-900 px-5 py-3 text-center font-bold text-white transition hover:bg-slate-800"
              >
                📍 Get Directions
              </a>
            </div>

            {/* INFORMATION GRID */}
            <div className="mt-10 grid grid-cols-1 gap-5 md:grid-cols-2">
              {/* ADDRESS */}
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                <h2 className="text-lg font-bold text-slate-900">
                  📍 Complete Address
                </h2>

                <p className="mt-3 text-base leading-7 text-slate-700">
                  {business.address || "Address not available"}
                </p>

                {business.area && (
                  <p className="mt-1 text-sm text-slate-600">
                    <strong>Area:</strong> {business.area}
                  </p>
                )}

                {business.landmark && (
                  <p className="mt-1 text-sm text-slate-600">
                    <strong>Landmark:</strong> {business.landmark}
                  </p>
                )}

                <p className="mt-1 text-sm text-slate-600">
                  {business.city}
                  {business.state ? `, ${business.state}` : ""}
                  {business.pincode ? ` - ${business.pincode}` : ""}
                </p>

                <a
                  href={mapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-4 inline-block font-semibold text-blue-600 hover:text-blue-700"
                >
                  View on Google Maps →
                </a>
              </div>

              {/* BUSINESS INFO */}
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                <h2 className="text-lg font-bold text-slate-900">
                  Business Information
                </h2>

                <div className="mt-4 space-y-3 text-sm text-slate-700">
                  <p>
                    <strong>Business:</strong> {business.business_name}
                  </p>

                  <p>
                    <strong>Category:</strong> {business.category}
                  </p>

                  <p>
                    <strong>City:</strong> {business.city}
                  </p>

                  {business.state && (
                    <p>
                      <strong>State:</strong> {business.state}
                    </p>
                  )}

                  {business.pincode && (
                    <p>
                      <strong>Pincode:</strong> {business.pincode}
                    </p>
                  )}

                  {business.phone && (
                    <p>
                      <strong>Phone:</strong>{" "}
                      <a
                        href={`tel:${business.phone}`}
                        className="font-semibold text-blue-600"
                      >
                        {business.phone}
                      </a>
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* LOCATION */}
            <div className="mt-5 rounded-2xl border border-slate-200 bg-white p-5">
              <h2 className="text-lg font-bold text-slate-900">
                📌 Location
              </h2>

              <p className="mt-2 text-sm leading-6 text-slate-600">
                {fullAddress}
              </p>

              <div className="mt-4 flex flex-col gap-3 sm:flex-row">
                <a
                  href={mapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-xl bg-blue-600 px-5 py-3 text-center font-bold text-white hover:bg-blue-700"
                >
                  📍 Get Directions
                </a>

                {business.maps_url && (
                  <a
                    href={business.maps_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded-xl border border-slate-300 px-5 py-3 text-center font-bold text-slate-700 hover:bg-slate-50"
                  >
                    🗺️ Open Google Maps
                  </a>
                )}
              </div>
            </div>

            {/* SEO CONTENT */}
            <div className="mt-10 border-t border-slate-200 pt-8">
              <h2 className="text-2xl font-bold text-slate-900">
                About {business.business_name}
              </h2>

              <p className="mt-4 leading-7 text-slate-600">
                {business.business_name} is a {business.category.toLowerCase()}{" "}
                located in {business.city}
                {business.state ? `, ${business.state}` : ""}. Customers can
                find the business address, phone number and location details
                on LocalPlatform.
              </p>

              <p className="mt-3 leading-7 text-slate-600">
                Looking for {business.category.toLowerCase()} in{" "}
                {business.city}? View the complete location and use Google
                Maps directions to reach {business.business_name}.
              </p>

              {business.area && (
                <p className="mt-3 leading-7 text-slate-600">
                  Located in {business.area}, {business.business_name} can be
                  easily found by customers searching for local businesses
                  and services in the area.
                </p>
              )}
            </div>
          </div>
        </section>
      </div>

      {/* LOCAL BUSINESS SEO SCHEMA */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(businessSchema),
        }}
      />
    </main>
  );
}