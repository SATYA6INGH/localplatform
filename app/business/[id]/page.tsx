import type { Metadata } from "next";
import { createClient } from "@supabase/supabase-js";

type Business = {
  id: string;
  business_name: string;
  category: string;
  city: string;
  phone: string;
  image_url?: string | null;
};

type Props = {
  params: Promise<{ id: string }>;
};

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
);

async function getBusiness(id: string) {
  const { data, error } = await supabase
    .from("businesses")
    .select(
      "id, business_name, category, city, phone, image_url"
    )
    .eq("id", id)
    .maybeSingle();

  if (error || !data) {
    return null;
  }

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
      description: "Business information not found on LocalPlatform.",
    };
  }

  const title = `${business.business_name} - ${business.category} in ${business.city}`;

  const description = `Find ${business.business_name}, a ${business.category} in ${business.city}. View business information and contact details on LocalPlatform.`;

  return {
    title,
    description,

    keywords: [
      business.business_name,
      business.category,
      `${business.category} in ${business.city}`,
      `${business.business_name} ${business.city}`,
      `businesses in ${business.city}`,
      `local businesses in ${business.city}`,
    ],

    alternates: {
      canonical: `/business/${business.id}`,
    },

    openGraph: {
      title,
      description,
      type: "website",
      url: `/business/${business.id}`,
      siteName: "LocalPlatform",

      ...(business.image_url
        ? {
            images: [
              {
                url: business.image_url,
                width: 1200,
                height: 630,
                alt: business.business_name,
              },
            ],
          }
        : {}),
    },

    robots: {
      index: true,
      follow: true,
    },
  };
}

export default async function BusinessDetails({
  params,
}: Props) {
  const { id } = await params;
  const business = await getBusiness(id);

  if (!business) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gray-50 px-6">
        <div className="w-full max-w-md rounded-2xl bg-white p-10 text-center shadow-lg">
          <h1 className="text-2xl font-bold text-gray-900">
            Business Not Found
          </h1>

          <p className="mt-3 text-gray-500">
            यह business नहीं मिला।
          </p>

          <div className="mt-6 flex flex-col gap-3">
            <a
              href="/"
              className="rounded-xl bg-blue-700 px-6 py-3 font-semibold text-white hover:bg-blue-800"
            >
              🏠 Home
            </a>

            <a
              href="/search"
              className="rounded-xl bg-black px-6 py-3 font-semibold text-white hover:bg-gray-800"
            >
              ← Back to Search
            </a>
          </div>
        </div>
      </main>
    );
  }

  const phone = business.phone?.replace(/\D/g, "") || "";

  const whatsappNumber = phone.startsWith("91")
    ? phone
    : `91${phone}`;

  const siteUrl = "https://localplatform.in";
  const businessUrl = `${siteUrl}/business/${business.id}`;

  const localBusinessSchema = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name: business.business_name,
    description: `Local ${business.category} business in ${business.city}.`,
    url: businessUrl,

    ...(business.phone
      ? {
          telephone: business.phone,
        }
      : {}),

    address: {
      "@type": "PostalAddress",
      addressLocality: business.city,
      addressCountry: "IN",
    },

    ...(business.category
      ? {
          category: business.category,
        }
      : {}),

    ...(business.image_url
      ? {
          image: business.image_url,
        }
      : {}),
  };

  return (
    <main className="min-h-screen bg-gray-50">
      {/* SEO STRUCTURED DATA */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(localBusinessSchema),
        }}
      />

      {/* HEADER */}
      <header className="border-b bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-6 py-5">
          <a
            href="/"
            className="font-semibold text-gray-700 hover:text-black"
          >
            🏠 Home
          </a>

          <a
            href="/search"
            className="font-semibold text-gray-700 hover:text-black"
          >
            ← Back to Search
          </a>

          <a
            href="/list-business"
            className="rounded-xl bg-black px-5 py-3 font-semibold text-white hover:bg-gray-800"
          >
            List Your Business
          </a>
        </div>
      </header>

      {/* MAIN */}
      <section className="mx-auto max-w-5xl px-6 py-12">
        <div className="overflow-hidden rounded-3xl bg-white shadow-xl">
          
          {/* BUSINESS HERO */}
          <div className="bg-blue-700 px-8 py-14 text-white">
            
            {business.image_url && (
              <div className="mb-6">
                <img
                  src={business.image_url}
                  alt={`${business.business_name} - ${business.category} in ${business.city}`}
                  className="h-32 w-32 rounded-2xl object-cover border-4 border-white/30"
                />
              </div>
            )}

            <div className="mb-5 inline-block rounded-full bg-white/20 px-4 py-2 text-sm font-semibold">
              {business.category}
            </div>

            <h1 className="text-4xl font-bold md:text-5xl">
              {business.business_name}
            </h1>

            <p className="mt-4 text-lg text-blue-100">
              📍 {business.city}
            </p>
          </div>

          {/* DETAILS */}
          <div className="p-8 md:p-10">
            <h2 className="text-2xl font-bold text-gray-900">
              Contact Business
            </h2>

            {/* PHONE */}
            <div className="mt-6 rounded-2xl bg-gray-50 p-6">
              <p className="text-sm text-gray-500">
                Phone Number
              </p>

              <p className="mt-2 text-2xl font-bold text-gray-900">
                {business.phone || "Phone not available"}
              </p>
            </div>

            {/* CONTACT BUTTONS */}
            <div className="mt-6 grid gap-4 md:grid-cols-2">
              
              <a
                href={`tel:${business.phone}`}
                className="rounded-xl bg-black px-6 py-4 text-center font-bold text-white hover:bg-gray-800"
              >
                📞 Call Now
              </a>

              {phone && (
                <a
                  href={`https://wa.me/${whatsappNumber}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-xl bg-green-600 px-6 py-4 text-center font-bold text-white hover:bg-green-700"
                >
                  💬 WhatsApp
                </a>
              )}
            </div>

            {/* BUSINESS INFORMATION */}
            <div className="mt-10 border-t pt-8">
              <h2 className="text-2xl font-bold text-gray-900">
                Business Information
              </h2>

              <div className="mt-5 grid gap-4 md:grid-cols-3">
                
                <div className="rounded-xl bg-gray-50 p-5">
                  <p className="text-sm text-gray-500">
                    Business
                  </p>

                  <p className="mt-1 font-semibold">
                    {business.business_name}
                  </p>
                </div>

                <div className="rounded-xl bg-gray-50 p-5">
                  <p className="text-sm text-gray-500">
                    Category
                  </p>

                  <p className="mt-1 font-semibold">
                    {business.category}
                  </p>
                </div>

                <div className="rounded-xl bg-gray-50 p-5">
                  <p className="text-sm text-gray-500">
                    Location
                  </p>

                  <p className="mt-1 font-semibold">
                    {business.city}
                  </p>
                </div>
              </div>
            </div>

            {/* SEO TEXT */}
            <div className="mt-10 border-t pt-8">
              <h2 className="text-2xl font-bold text-gray-900">
                {business.category} in {business.city}
              </h2>

              <p className="mt-3 leading-7 text-gray-600">
                {business.business_name} is a local{" "}
                {business.category} business located in{" "}
                {business.city}. Find business information,
                contact details and services on LocalPlatform.
              </p>
            </div>

            {/* BOTTOM NAVIGATION */}
            <div className="mt-10 flex flex-col gap-3 border-t pt-8 sm:flex-row">
              
              <a
                href="/"
                className="flex-1 rounded-xl border border-gray-300 px-6 py-4 text-center font-semibold text-gray-800 hover:bg-gray-50"
              >
                🏠 Go to Home
              </a>

              <a
                href="/search"
                className="flex-1 rounded-xl bg-black px-6 py-4 text-center font-semibold text-white hover:bg-gray-800"
              >
                🔍 Search More Businesses
              </a>

              <a
                href="/list-business"
                className="flex-1 rounded-xl bg-blue-700 px-6 py-4 text-center font-semibold text-white hover:bg-blue-800"
              >
                ➕ List Your Business
              </a>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}