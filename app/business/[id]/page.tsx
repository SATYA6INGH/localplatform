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

function supabase() {
  return createClient(
    SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
  );
}

async function getBusiness(id: string) {
  const { data, error } = await supabase()
    .from("businesses")
    .select(
      "id,business_name,category,address,area,landmark,city,state,pincode,phone,image_url,maps_url,latitude,longitude"
    )
    .eq("id", id)
    .maybeSingle();

  if (error || !data) return null;

  return data as Business;
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

  return {
    title: `${business.business_name} - ${business.category} in ${business.city}`,
    description: `Find ${business.business_name}, ${business.category} in ${location}. View address, phone number, location and directions on LocalPlatform.`,
    keywords: [
      business.business_name,
      business.category,
      `${business.category} in ${business.city}`,
      `${business.business_name} ${business.city}`,
      business.area || "",
      business.city,
      business.state || "",
      business.pincode || "",
    ].filter(Boolean),
    alternates: {
      canonical: `/business/${business.id}`,
    },
    openGraph: {
      title: `${business.business_name} - ${business.category}`,
      description: `Find ${business.business_name} in ${location}.`,
      type: "website",
      url: `/business/${business.id}`,
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

  const phone = business.phone?.trim() || "";
  const phoneDigits = phone.replace(/\D/g, "");

  const whatsappNumber =
    phoneDigits.length === 10 ? `91${phoneDigits}` : phoneDigits;

  const whatsappUrl = whatsappNumber
    ? `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(
        `Hello, I found ${business.business_name} on LocalPlatform.`
      )}`
    : "";

  const mapEmbed =
    business.latitude !== null && business.longitude !== null
      ? `https://www.google.com/maps?q=${business.latitude},${business.longitude}&z=15&output=embed`
      : `https://www.google.com/maps?q=${encodeURIComponent(
          fullAddress
        )}&z=15&output=embed`;

  const schema = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name: business.business_name,
    description: `${business.business_name} - ${business.category} in ${business.city}`,
    url: `https://localplatform.in/business/${business.id}`,
    telephone: phone || undefined,
    image: business.image_url || undefined,
    address: {
      "@type": "PostalAddress",
      streetAddress: [business.address, business.area, business.landmark]
        .filter(Boolean)
        .join(", "),
      addressLocality: business.city,
      addressRegion: business.state || undefined,
      postalCode: business.pincode || undefined,
      addressCountry: "IN",
    },
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
  };

  return (
    <main className="min-h-screen bg-slate-50">
      {/* HERO */}
      <section className="relative overflow-hidden bg-slate-950">
        {business.image_url ? (
          <div className="relative h-[300px] sm:h-[390px] lg:h-[450px]">
            <img
              src={business.image_url}
              alt={`${business.business_name} ${business.category}`}
              className="h-full w-full object-cover"
            />

            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/55 to-slate-900/10" />
          </div>
        ) : (
          <div className="h-[300px] bg-gradient-to-br from-blue-700 via-blue-900 to-slate-950 sm:h-[390px] lg:h-[450px]" />
        )}

        <div className="absolute inset-x-0 bottom-0">
          <div className="mx-auto max-w-7xl px-4 pb-7 sm:px-6 lg:px-8 lg:pb-10">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-end">
              <div className="min-w-0 flex-1">
                <span className="inline-flex rounded-full bg-blue-600 px-4 py-2 text-xs font-bold text-white shadow-lg sm:text-sm">
                  ✓ {business.category}
                </span>

                <h1 className="mt-3 text-3xl font-extrabold tracking-tight text-white sm:text-5xl">
                  {business.business_name}
                </h1>

                <p className="mt-2 text-base font-medium text-blue-100 sm:text-xl">
                  📍 {business.category} in {business.city}
                </p>

                <p className="mt-3 text-sm text-slate-200 sm:text-base">
                  📍{" "}
                  {[
                    business.area,
                    business.city,
                    business.state,
                    business.pincode,
                  ]
                    .filter(Boolean)
                    .join(", ")}
                </p>
              </div>

              <div className="flex shrink-0 items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm font-semibold text-white backdrop-blur-md">
                ⭐ 4.8
                <span className="text-slate-300">(Verified Listing)</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ACTION BAR */}
      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto grid max-w-7xl grid-cols-1 gap-3 px-4 py-4 sm:grid-cols-3 sm:px-6 lg:px-8">
          {phone && (
            <a
              href={`tel:${phone}`}
              className="flex items-center justify-center gap-3 rounded-2xl bg-blue-600 px-5 py-4 font-bold text-white shadow-sm transition hover:bg-blue-700 active:scale-[0.98]"
            >
              <span className="text-xl">📞</span>
              <span>
                <span className="block">Call Now</span>
                <span className="text-xs font-normal text-blue-100">
                  {phone}
                </span>
              </span>
            </a>
          )}

          {whatsappUrl && (
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-3 rounded-2xl bg-emerald-500 px-5 py-4 font-bold text-white shadow-sm transition hover:bg-emerald-600 active:scale-[0.98]"
            >
              <span className="text-xl">💬</span>
              <span>
                <span className="block">WhatsApp</span>
                <span className="text-xs font-normal text-emerald-50">
                  Chat with us
                </span>
              </span>
            </a>
          )}

          <a
            href={mapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-3 rounded-2xl bg-slate-900 px-5 py-4 font-bold text-white shadow-sm transition hover:bg-slate-800 active:scale-[0.98]"
          >
            <span className="text-xl">📍</span>
            <span>
              <span className="block">Get Directions</span>
              <span className="text-xs font-normal text-slate-300">
                Open in Google Maps
              </span>
            </span>
          </a>
        </div>
      </section>

      {/* CONTENT */}
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-10 lg:px-8">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* LEFT */}
          <div className="space-y-6 lg:col-span-2">
            {/* ADDRESS + MAP */}
            <section className="grid grid-cols-1 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm md:grid-cols-2">
              <div className="p-6 sm:p-8">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-50 text-xl">
                    📍
                  </div>
                  <h2 className="text-xl font-extrabold text-slate-900">
                    Complete Address
                  </h2>
                </div>

                <p className="mt-5 text-base font-semibold leading-7 text-slate-800">
                  {business.address || "Address not available"}
                </p>

                <div className="mt-5 space-y-4">
                  {business.area && (
                    <div className="flex justify-between gap-4 border-b border-slate-100 pb-3">
                      <span className="text-sm text-slate-500">
                        Area / Locality
                      </span>
                      <span className="text-right text-sm font-semibold text-slate-800">
                        {business.area}
                      </span>
                    </div>
                  )}

                  {business.landmark && (
                    <div className="flex justify-between gap-4 border-b border-slate-100 pb-3">
                      <span className="text-sm text-slate-500">
                        Landmark
                      </span>
                      <span className="text-right text-sm font-semibold text-slate-800">
                        {business.landmark}
                      </span>
                    </div>
                  )}

                  <div className="flex justify-between gap-4 border-b border-slate-100 pb-3">
                    <span className="text-sm text-slate-500">City</span>
                    <span className="text-right text-sm font-semibold text-slate-800">
                      {business.city}
                    </span>
                  </div>

                  {business.state && (
                    <div className="flex justify-between gap-4 border-b border-slate-100 pb-3">
                      <span className="text-sm text-slate-500">State</span>
                      <span className="text-right text-sm font-semibold text-slate-800">
                        {business.state}
                      </span>
                    </div>
                  )}

                  {business.pincode && (
                    <div className="flex justify-between gap-4">
                      <span className="text-sm text-slate-500">Pincode</span>
                      <span className="text-right text-sm font-semibold text-slate-800">
                        {business.pincode}
                      </span>
                    </div>
                  )}
                </div>

                <a
                  href={mapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-6 inline-flex font-bold text-blue-600 hover:text-blue-700"
                >
                  🗺️ View on Google Maps →
                </a>
              </div>

              <div className="min-h-[300px] bg-slate-100 md:min-h-full">
                <iframe
                  src={mapEmbed}
                  width="100%"
                  height="100%"
                  style={{ border: 0, minHeight: "300px" }}
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title={`${business.business_name} location map`}
                />
              </div>
            </section>

            {/* LOCATION */}
            <section className="rounded-3xl border border-blue-100 bg-gradient-to-br from-blue-50 to-white p-6 sm:p-8">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-xl shadow-sm">
                  📌
                </div>

                <div>
                  <h2 className="text-xl font-extrabold text-slate-900">
                    Location
                  </h2>
                  <p className="text-sm text-slate-500">
                    Exact business location and directions
                  </p>
                </div>
              </div>

              <p className="mt-5 text-sm font-medium leading-7 text-slate-700 sm:text-base">
                {fullAddress}
              </p>

              <div className="mt-5 flex flex-col gap-3 sm:flex-row">
                <a
                  href={mapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-xl bg-blue-600 px-6 py-3 text-center font-bold text-white hover:bg-blue-700"
                >
                  📍 Get Directions
                </a>

                <a
                  href={mapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-xl border border-slate-300 bg-white px-6 py-3 text-center font-bold text-slate-800 hover:bg-slate-50"
                >
                  🗺️ Open Google Maps
                </a>
              </div>
            </section>

            {/* ABOUT */}
            <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-50 text-xl">
                  🏢
                </div>

                <h2 className="text-xl font-extrabold text-slate-900 sm:text-2xl">
                  About {business.business_name}
                </h2>
              </div>

              <p className="mt-5 leading-7 text-slate-600">
                {business.business_name} is a{" "}
                {business.category.toLowerCase()} located in{" "}
                {business.city}
                {business.state ? `, ${business.state}` : ""}. Customers can
                find the complete address, contact information and location
                details on LocalPlatform.
              </p>

              <p className="mt-4 leading-7 text-slate-600">
                Looking for {business.category.toLowerCase()} in{" "}
                {business.city}? View the complete location and use Google
                Maps directions to reach {business.business_name}.
              </p>

              {business.area && (
                <div className="mt-6 rounded-2xl bg-blue-50 p-4 text-sm font-medium leading-6 text-blue-800">
                  📍 Located in {business.area}, {business.business_name} can
                  be easily found by customers searching for local services
                  in this area.
                </div>
              )}
            </section>
          </div>

          {/* RIGHT SIDEBAR */}
          <aside className="space-y-6">
            {/* BUSINESS INFO */}
            <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="text-xl font-extrabold text-slate-900">
                Business Information
              </h2>

              <div className="mt-5 space-y-5">
                <InfoRow
                  icon="🏢"
                  label="Business Name"
                  value={business.business_name}
                />

                <InfoRow
                  icon="📋"
                  label="Category"
                  value={business.category}
                />

                <InfoRow
                  icon="📍"
                  label="City"
                  value={business.city}
                />

                {business.state && (
                  <InfoRow
                    icon="🗺️"
                    label="State"
                    value={business.state}
                  />
                )}

                {business.pincode && (
                  <InfoRow
                    icon="📌"
                    label="Pincode"
                    value={business.pincode}
                  />
                )}

                {phone && (
                  <InfoRow
                    icon="📞"
                    label="Phone"
                    value={phone}
                    href={`tel:${phone}`}
                  />
                )}
              </div>

              <div className="mt-6 rounded-2xl bg-emerald-50 p-4">
                <div className="flex gap-3">
                  <span className="text-xl">✓</span>

                  <div>
                    <p className="font-bold text-emerald-700">
                      Verified Business
                    </p>

                    <p className="mt-1 text-xs leading-5 text-emerald-700">
                      This business is registered on LocalPlatform.
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* QUICK ACTIONS */}
            <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="text-xl font-extrabold text-slate-900">
                Quick Actions
              </h2>

              <div className="mt-4 divide-y divide-slate-100">
                {phone && (
                  <a
                    href={`tel:${phone}`}
                    className="flex items-center justify-between py-4"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-xl">📞</span>
                      <div>
                        <p className="font-bold text-slate-800">Call Now</p>
                        <p className="text-xs text-slate-500">{phone}</p>
                      </div>
                    </div>
                    <span className="text-slate-400">›</span>
                  </a>
                )}

                {whatsappUrl && (
                  <a
                    href={whatsappUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between py-4"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-xl">💬</span>
                      <div>
                        <p className="font-bold text-slate-800">WhatsApp</p>
                        <p className="text-xs text-slate-500">Chat with us</p>
                      </div>
                    </div>
                    <span className="text-slate-400">›</span>
                  </a>
                )}

                <a
                  href={mapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between py-4"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xl">📍</span>
                    <div>
                      <p className="font-bold text-slate-800">
                        Get Directions
                      </p>
                      <p className="text-xs text-slate-500">
                        Open in Google Maps
                      </p>
                    </div>
                  </div>
                  <span className="text-slate-400">›</span>
                </a>
              </div>
            </section>

            {/* LOCATION SUMMARY */}
            <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="text-xl font-extrabold text-slate-900">
                📍 Location
              </h2>

              <p className="mt-4 text-sm leading-6 text-slate-600">
                {fullAddress}
              </p>

              <a
                href={mapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-5 block rounded-xl bg-slate-900 px-5 py-3 text-center font-bold text-white hover:bg-slate-800"
              >
                Open Location
              </a>
            </section>

            {/* TAGS */}
            <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="text-lg font-extrabold text-slate-900">
                Services & Tags
              </h2>

              <div className="mt-4 flex flex-wrap gap-2">
                <span className="rounded-full bg-blue-50 px-3 py-2 text-xs font-semibold text-blue-700">
                  {business.category}
                </span>

                {business.area && (
                  <span className="rounded-full bg-slate-100 px-3 py-2 text-xs font-semibold text-slate-700">
                    {business.area}
                  </span>
                )}

                <span className="rounded-full bg-slate-100 px-3 py-2 text-xs font-semibold text-slate-700">
                  {business.city}
                </span>

                {business.state && (
                  <span className="rounded-full bg-slate-100 px-3 py-2 text-xs font-semibold text-slate-700">
                    {business.state}
                  </span>
                )}
              </div>
            </section>
          </aside>
        </div>
      </div>

      {/* FOOTER STRIP */}
      <section className="border-t border-slate-200 bg-white">
        <div className="mx-auto grid max-w-7xl grid-cols-1 gap-6 px-4 py-8 sm:grid-cols-3 sm:px-6 lg:px-8">
          <Feature
            icon="📍"
            title="Local Business"
            text="Find trusted local businesses near you"
          />

          <Feature
            icon="🔎"
            title="Better Visibility"
            text="Discover businesses by service and location"
          />

          <Feature
            icon="⭐"
            title="Trusted Listings"
            text="Useful business information for customers"
          />
        </div>
      </section>

      {/* SEO SCHEMA */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(schema),
        }}
      />
    </main>
  );
}

function InfoRow({
  icon,
  label,
  value,
  href,
}: {
  icon: string;
  label: string;
  value: string;
  href?: string;
}) {
  const content = (
    <div className="flex items-start gap-3">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-50">
        {icon}
      </div>

      <div className="min-w-0">
        <p className="text-xs text-slate-500">{label}</p>
        <p className="mt-1 break-words text-sm font-semibold text-slate-800">
          {value}
        </p>
      </div>
    </div>
  );

  return href ? (
    <a href={href} className="block hover:opacity-80">
      {content}
    </a>
  ) : (
    content
  );
}

function Feature({
  icon,
  title,
  text,
}: {
  icon: string;
  title: string;
  text: string;
}) {
  return (
    <div className="flex items-center gap-4">
      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-blue-50 text-xl">
        {icon}
      </div>

      <div>
        <p className="font-bold text-slate-900">{title}</p>
        <p className="mt-1 text-sm text-slate-500">{text}</p>
      </div>
    </div>
  );
}