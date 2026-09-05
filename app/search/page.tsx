"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";

type Business = {
  id: string;
  business_name: string;
  category: string;
  subcategory: string | null;
  services: string[] | null;
  description: string | null;
  city: string;
  area: string | null;
  state: string | null;
  pincode: string | null;
  phone: string | null;
  image_url: string | null;
};

const SUPABASE_URL =
  "https://ckuiskbegrlrethnlhzq.supabase.co";

const SUPABASE_KEY =
  "sb_publishable_RnrbgHC56vWK6cSA1hmfkA_VVP74VPL";

const CATEGORIES = [
  "All",
  "Architect",
  "Interior Designer",
  "Construction",
  "Doctor",
  "Dentist",
  "Restaurant",
  "Salon",
  "Electrician",
  "Plumber",
  "Real Estate",
  "Auto Repair",
  "Photographer",
  "Gym",
  "Coaching Institute",
  "Hotel",
  "Other",
];

function getSearchScore(
  business: Business,
  search: string
) {
  const q = search.toLowerCase().trim();

  if (!q) return 0;

  const name = business.business_name.toLowerCase();
  const category = business.category.toLowerCase();
  const subcategory =
    business.subcategory?.toLowerCase() || "";
  const city = business.city.toLowerCase();
  const area = business.area?.toLowerCase() || "";
  const services = Array.isArray(business.services)
    ? business.services.join(" ").toLowerCase()
    : "";
  const description =
    business.description?.toLowerCase() || "";

  let score = 0;

  if (name.includes(q)) score += 100;
  if (category.includes(q)) score += 80;
  if (subcategory.includes(q)) score += 70;
  if (services.includes(q)) score += 60;
  if (city.includes(q)) score += 50;
  if (area.includes(q)) score += 40;
  if (description.includes(q)) score += 20;

  const words = q.split(/\s+/).filter(Boolean);

  for (const word of words) {
    if (name.includes(word)) score += 25;
    if (category.includes(word)) score += 20;
    if (subcategory.includes(word)) score += 15;
    if (services.includes(word)) score += 15;
    if (city.includes(word)) score += 12;
    if (area.includes(word)) score += 10;
  }

  return score;
}

export default function SearchPage() {
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [city, setCity] = useState("");
  const [area, setArea] = useState("");

  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    const loadBusinesses = async () => {
      try {
        const response = await fetch(
          `${SUPABASE_URL}/rest/v1/businesses?select=id,business_name,category,subcategory,services,description,city,area,state,pincode,phone,image_url&order=business_name.asc`,
          {
            headers: {
              apikey: SUPABASE_KEY,
              Authorization: `Bearer ${SUPABASE_KEY}`,
            },
          }
        );

        if (!response.ok) {
          throw new Error("Businesses load nahi hue.");
        }

        const data = await response.json();

        setBusinesses(data || []);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    loadBusinesses();
  }, []);

  const filteredBusinesses = useMemo(() => {
    const normalizedCity = city.toLowerCase().trim();
    const normalizedArea = area.toLowerCase().trim();

    return businesses
      .filter((business) => {
        const matchesCategory =
          category === "All" ||
          business.category.toLowerCase() ===
            category.toLowerCase();

        const matchesCity =
          !normalizedCity ||
          business.city
            .toLowerCase()
            .includes(normalizedCity);

        const matchesArea =
          !normalizedArea ||
          (business.area || "")
            .toLowerCase()
            .includes(normalizedArea);

        return (
          matchesCategory &&
          matchesCity &&
          matchesArea
        );
      })
      .map((business) => ({
        business,
        score: getSearchScore(business, search),
      }))
      .filter(({ score }) => {
        if (!search.trim()) return true;
        return score > 0;
      })
      .sort((a, b) => {
        if (b.score !== a.score) {
          return b.score - a.score;
        }

        return a.business.business_name.localeCompare(
          b.business.business_name
        );
      })
      .map(({ business }) => business);
  }, [businesses, search, category, city, area]);

  const clearFilters = () => {
    setSearch("");
    setCategory("All");
    setCity("");
    setArea("");
  };

  const popularCategories = CATEGORIES.filter(
    (item) => item !== "All"
  ).slice(0, 8);

  return (
    <main className="min-h-screen bg-slate-50">

      {/* SEARCH HERO */}
      <section className="bg-slate-950 px-4 py-10 text-white sm:py-14">
        <div className="mx-auto max-w-6xl">

          <div className="text-center">
            <span className="rounded-full bg-blue-500/20 px-4 py-2 text-xs font-black text-blue-300">
              SMART LOCAL SEARCH
            </span>

            <h1 className="mt-4 text-3xl font-black sm:text-5xl">
              Find Local Businesses
            </h1>

            <p className="mx-auto mt-3 max-w-2xl text-sm text-slate-300 sm:text-base">
              Business, service, category, city ya area se search karo.
            </p>
          </div>

          {/* MAIN SEARCH */}
          <div className="mx-auto mt-8 max-w-4xl rounded-2xl bg-white p-2 shadow-2xl">
            <div className="flex flex-col gap-2 md:flex-row">

              <div className="flex flex-1 items-center rounded-xl bg-slate-50 px-4">
                <span className="mr-3 text-xl">🔎</span>

                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="e.g. 3D elevation architect"
                  className="w-full bg-transparent py-4 text-sm font-medium text-slate-900 outline-none"
                />
              </div>

              <div className="flex items-center rounded-xl bg-slate-50 px-4">
                <span className="mr-3">📍</span>

                <input
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="City"
                  className="w-full bg-transparent py-4 text-sm font-medium text-slate-900 outline-none md:w-32"
                />
              </div>

              <button
                type="button"
                onClick={() => setShowFilters(!showFilters)}
                className="rounded-xl bg-slate-900 px-6 py-4 text-sm font-black text-white md:hidden"
              >
                ⚙ Filters
              </button>
            </div>
          </div>

        </div>
      </section>

      {/* CONTENT */}
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">

        <div className="grid gap-6 lg:grid-cols-4">

          {/* FILTERS */}
          <aside
            className={`${
              showFilters ? "block" : "hidden"
            } lg:block`}
          >
            <div className="rounded-3xl bg-white p-5 shadow-sm">

              <div className="flex items-center justify-between">
                <h2 className="font-black text-slate-900">
                  Filters
                </h2>

                <button
                  type="button"
                  onClick={clearFilters}
                  className="text-xs font-bold text-blue-600"
                >
                  Clear
                </button>
              </div>

              <div className="mt-6">
                <label className="mb-2 block text-xs font-black uppercase text-slate-400">
                  Category
                </label>

                <select
                  value={category}
                  onChange={(e) =>
                    setCategory(e.target.value)
                  }
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm font-semibold outline-none focus:border-blue-500"
                >
                  {CATEGORIES.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </select>
              </div>

              <div className="mt-5">
                <label className="mb-2 block text-xs font-black uppercase text-slate-400">
                  City
                </label>

                <input
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="Lucknow"
                  className="w-full rounded-xl border border-slate-200 px-3 py-3 text-sm outline-none focus:border-blue-500"
                />
              </div>

              <div className="mt-5">
                <label className="mb-2 block text-xs font-black uppercase text-slate-400">
                  Area
                </label>

                <input
                  value={area}
                  onChange={(e) => setArea(e.target.value)}
                  placeholder="Gomti Nagar"
                  className="w-full rounded-xl border border-slate-200 px-3 py-3 text-sm outline-none focus:border-blue-500"
                />
              </div>

              <button
                type="button"
                onClick={clearFilters}
                className="mt-6 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm font-bold text-slate-700 hover:bg-slate-50"
              >
                Reset Filters
              </button>
            </div>
          </aside>

          {/* RESULTS */}
          <section className="lg:col-span-3">

            {/* CATEGORY SHORTCUTS */}
            <div className="mb-6">
              <div className="mb-3 flex items-center justify-between">
                <h2 className="font-black text-slate-900">
                  Popular Categories
                </h2>
              </div>

              <div className="flex gap-2 overflow-x-auto pb-2">
                {popularCategories.map((item) => (
                  <button
                    key={item}
                    type="button"
                    onClick={() => setCategory(item)}
                    className={`shrink-0 rounded-full border px-4 py-2 text-xs font-bold ${
                      category === item
                        ? "border-blue-600 bg-blue-600 text-white"
                        : "border-slate-200 bg-white text-slate-700"
                    }`}
                  >
                    {item}
                  </button>
                ))}
              </div>
            </div>

            {/* RESULT HEADER */}
            <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">

              <div>
                <h2 className="text-xl font-black text-slate-900">
                  {loading
                    ? "Finding businesses..."
                    : `${filteredBusinesses.length} Businesses Found`}
                </h2>

                {(search || city || area || category !== "All") && (
                  <p className="mt-1 text-xs text-slate-500">
                    Showing results matching your search
                  </p>
                )}
              </div>

            </div>

            {/* LOADING */}
            {loading && (
              <div className="rounded-3xl bg-white p-10 text-center shadow-sm">
                <div className="text-3xl">⏳</div>

                <p className="mt-3 font-bold text-slate-700">
                  Businesses load ho rahe hain...
                </p>
              </div>
            )}

            {/* EMPTY */}
            {!loading &&
              filteredBusinesses.length === 0 && (
                <div className="rounded-3xl bg-white p-10 text-center shadow-sm">

                  <div className="text-5xl">🔎</div>

                  <h3 className="mt-4 text-xl font-black text-slate-900">
                    No business found
                  </h3>

                  <p className="mx-auto mt-2 max-w-md text-sm text-slate-500">
                    Search term ya location change karke dobara try
                    karo.
                  </p>

                  <button
                    type="button"
                    onClick={clearFilters}
                    className="mt-5 rounded-xl bg-slate-900 px-5 py-3 text-sm font-bold text-white"
                  >
                    Clear Search
                  </button>
                </div>
              )}

            {/* CARDS */}
            <div className="space-y-4">

              {!loading &&
                filteredBusinesses.map((business) => (
                  <article
                    key={business.id}
                    className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg"
                  >
                    <div className="flex flex-col sm:flex-row">

                      {/* IMAGE */}
                      <div className="h-52 w-full shrink-0 bg-slate-100 sm:h-auto sm:w-56">
                        {business.image_url ? (
                          <img
                            src={business.image_url}
                            alt={business.business_name}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="flex h-full min-h-52 items-center justify-center text-5xl">
                            🏢
                          </div>
                        )}
                      </div>

                      {/* DETAILS */}
                      <div className="flex-1 p-5 sm:p-6">

                        <div className="flex flex-wrap gap-2">
                          <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-black text-blue-700">
                            {business.category}
                          </span>

                          {business.subcategory && (
                            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-600">
                              {business.subcategory}
                            </span>
                          )}
                        </div>

                        <h3 className="mt-3 text-xl font-black text-slate-900">
                          {business.business_name}
                        </h3>

                        <p className="mt-2 text-sm text-slate-500">
                          📍{" "}
                          {[business.area, business.city, business.pincode]
                            .filter(Boolean)
                            .join(", ")}
                        </p>

                        {business.description && (
                          <p className="mt-3 line-clamp-2 text-sm leading-6 text-slate-600">
                            {business.description}
                          </p>
                        )}

                        {/* SERVICES */}
                        {Array.isArray(business.services) &&
                          business.services.length > 0 && (
                            <div className="mt-4 flex flex-wrap gap-2">
                              {business.services
                                .slice(0, 5)
                                .map((service) => (
                                  <span
                                    key={service}
                                    className="rounded-full bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-600"
                                  >
                                    {service}
                                  </span>
                                ))}
                            </div>
                          )}

                        <div className="mt-5 flex flex-col gap-2 sm:flex-row">

                          <Link
                            href={`/business/${business.id}`}
                            className="rounded-xl bg-blue-600 px-5 py-3 text-center text-sm font-black text-white hover:bg-blue-700"
                          >
                            View Business
                          </Link>

                          {business.phone && (
                            <a
                              href={`tel:${business.phone}`}
                              className="rounded-xl border border-slate-200 px-5 py-3 text-center text-sm font-bold text-slate-700 hover:bg-slate-50"
                            >
                              📞 Call
                            </a>
                          )}

                        </div>
                      </div>
                    </div>
                  </article>
                ))}
            </div>

          </section>
        </div>
      </div>
    </main>
  );
}