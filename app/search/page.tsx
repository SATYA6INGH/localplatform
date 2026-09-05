"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  "https://ckuiskbegrlrethnlhzq.supabase.co",
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
      storageKey: "localplatform-auth",
    },
  }
);

type Business = {
  id: string;
  business_name: string;
  category: string;
  subcategory?: string | null;
  services?: string[] | null;
  city: string;
  area?: string | null;
  address?: string | null;
  landmark?: string | null;
  state?: string | null;
  pincode?: string | null;
  phone?: string | null;
  image_url?: string | null;
  description?: string | null;
  short_description?: string | null;
  highlights?: string[] | null;
  listing_status?: string | null;
  listing_expires_at?: string | null;
};

const popularCategories = [
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
  "Gym",
];

function normalize(value: unknown) {
  return String(value ?? "")
    .toLowerCase()
    .trim();
}

function arrayValues(value: unknown): string[] {
  if (!Array.isArray(value)) return [];

  return value
    .map((item) => String(item ?? "").trim())
    .filter(Boolean);
}

function scoreBusiness(
  business: Business,
  query: string,
  cityQuery: string
) {
  const q = normalize(query);
  const c = normalize(cityQuery);

  if (!q && !c) return 0;

  let score = 0;

  const businessName = normalize(business.business_name);
  const category = normalize(business.category);
  const subcategory = normalize(business.subcategory);
  const city = normalize(business.city);
  const area = normalize(business.area);
  const description = normalize(
    business.short_description || business.description
  );

  const services = arrayValues(business.services).map(normalize);

  if (q) {
    if (businessName === q) score += 120;
    else if (businessName.includes(q)) score += 100;

    if (category === q) score += 90;
    else if (category.includes(q)) score += 80;

    if (subcategory === q) score += 80;
    else if (subcategory.includes(q)) score += 70;

    if (services.some((service) => service === q)) {
      score += 70;
    } else if (services.some((service) => service.includes(q))) {
      score += 60;
    }

    if (city.includes(q)) score += 50;
    if (area.includes(q)) score += 40;
    if (description.includes(q)) score += 20;
  }

  if (c) {
    if (city === c) score += 70;
    else if (city.includes(c)) score += 55;

    if (area === c) score += 50;
    else if (area.includes(c)) score += 35;

    const fullAddress = normalize(
      `${business.address ?? ""} ${business.landmark ?? ""} ${
        business.pincode ?? ""
      }`
    );

    if (fullAddress.includes(c)) score += 25;
  }

  return score;
}

export default function SearchPage() {
  const router = useRouter();

  const [query, setQuery] = useState("");
  const [cityQuery, setCityQuery] = useState("");

  const [categoryFilter, setCategoryFilter] = useState("");
  const [cityFilter, setCityFilter] = useState("");
  const [areaFilter, setAreaFilter] = useState("");

  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);

    setQuery(params.get("q") || "");
    setCityQuery(params.get("city") || "");
  }, []);

  useEffect(() => {
    async function loadBusinesses() {
      setLoading(true);
      setError("");

      const now = new Date().toISOString();

      const { data, error } = await supabase
        .from("businesses")
        .select(`
          id,
          business_name,
          category,
          subcategory,
          services,
          city,
          area,
          address,
          landmark,
          state,
          pincode,
          phone,
          image_url,
          description,
          short_description,
          highlights,
          listing_status,
          listing_expires_at
        `)
        .eq("listing_status", "active")
        .gt("listing_expires_at", now)
        .order("created_at", { ascending: false });

      if (error) {
        console.error(error);
        setError("Businesses load nahi ho pa rahe hain.");
        setBusinesses([]);
      } else {
        setBusinesses((data || []) as Business[]);
      }

      setLoading(false);
    }

    loadBusinesses();
  }, []);

  const categories = useMemo(() => {
    return Array.from(
      new Set(
        businesses
          .map((business) => business.category)
          .filter(Boolean)
      )
    ).sort();
  }, [businesses]);

  const cities = useMemo(() => {
    return Array.from(
      new Set(
        businesses
          .map((business) => business.city)
          .filter(Boolean)
      )
    ).sort();
  }, [businesses]);

  const areas = useMemo(() => {
    let source = businesses;

    if (cityFilter) {
      source = source.filter(
        (business) =>
          normalize(business.city) === normalize(cityFilter)
      );
    }

    return Array.from(
      new Set(
        source
          .map((business) => business.area)
          .filter(Boolean) as string[]
      )
    ).sort();
  }, [businesses, cityFilter]);

  const filteredBusinesses = useMemo(() => {
    let results = [...businesses];

    if (categoryFilter) {
      results = results.filter(
        (business) =>
          normalize(business.category) ===
          normalize(categoryFilter)
      );
    }

    if (cityFilter) {
      results = results.filter(
        (business) =>
          normalize(business.city) === normalize(cityFilter)
      );
    }

    if (areaFilter) {
      results = results.filter(
        (business) =>
          normalize(business.area) === normalize(areaFilter)
      );
    }

    const hasSearch =
      normalize(query).length > 0 ||
      normalize(cityQuery).length > 0;

    if (hasSearch) {
      results = results
        .map((business) => ({
          business,
          score: scoreBusiness(
            business,
            query,
            cityQuery
          ),
        }))
        .filter((item) => item.score > 0)
        .sort((a, b) => b.score - a.score)
        .map((item) => item.business);
    }

    return results;
  }, [
    businesses,
    query,
    cityQuery,
    categoryFilter,
    cityFilter,
    areaFilter,
  ]);

  function handleSearch() {
    const params = new URLSearchParams();

    if (query.trim()) {
      params.set("q", query.trim());
    }

    if (cityQuery.trim()) {
      params.set("city", cityQuery.trim());
    }

    const url = params.toString()
      ? `/search?${params.toString()}`
      : "/search";

    router.push(url);
  }

  function handleCategory(category: string) {
    setQuery(category);
    setCityQuery("");
    setCategoryFilter("");
    setCityFilter("");
    setAreaFilter("");

    router.push(
      `/search?q=${encodeURIComponent(category)}`
    );
  }

  function clearFilters() {
    setCategoryFilter("");
    setCityFilter("");
    setAreaFilter("");
  }

  function getLocation(business: Business) {
    const parts = [
      business.area,
      business.city,
      business.state,
    ].filter(Boolean);

    return parts.join(", ");
  }

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">

      {/* SEARCH HERO */}
      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">

          <div className="mb-6">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-blue-600">
              Local Search
            </p>

            <h1 className="mt-2 text-3xl font-black tracking-tight sm:text-4xl">
              Find local businesses
            </h1>

            <p className="mt-2 max-w-2xl text-sm text-slate-500 sm:text-base">
              Search businesses, professionals and services by
              name, category and location.
            </p>
          </div>

          {/* SEARCH BOX */}
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-2 shadow-sm">
            <div className="grid gap-2 md:grid-cols-[1.2fr_1fr_auto]">

              <div className="flex items-center rounded-xl border border-slate-200 bg-white px-4">
                <span className="mr-3 text-slate-400">
                  ⌕
                </span>

                <input
                  value={query}
                  onChange={(e) =>
                    setQuery(e.target.value)
                  }
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      handleSearch();
                    }
                  }}
                  placeholder="Business, service or category"
                  className="h-12 w-full bg-transparent text-sm outline-none placeholder:text-slate-400"
                />
              </div>

              <div className="flex items-center rounded-xl border border-slate-200 bg-white px-4">
                <span className="mr-3 text-slate-400">
                  ◉
                </span>

                <input
                  value={cityQuery}
                  onChange={(e) =>
                    setCityQuery(e.target.value)
                  }
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      handleSearch();
                    }
                  }}
                  placeholder="City or area"
                  className="h-12 w-full bg-transparent text-sm outline-none placeholder:text-slate-400"
                />
              </div>

              <button
                onClick={handleSearch}
                className="h-12 rounded-xl bg-slate-950 px-7 text-sm font-bold text-white transition hover:bg-blue-700"
              >
                Search
              </button>

            </div>
          </div>

          {/* POPULAR CATEGORIES */}
          <div className="mt-4 flex gap-2 overflow-x-auto pb-1">
            {popularCategories.map((category) => (
              <button
                key={category}
                onClick={() => handleCategory(category)}
                className="shrink-0 rounded-full border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-700 transition hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700"
              >
                {category}
              </button>
            ))}
          </div>

        </div>
      </section>

      {/* RESULTS */}
      <section className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">

        {/* MOBILE FILTER BUTTON */}
        <div className="mb-5 lg:hidden">
          <button
            onClick={() =>
              setMobileFiltersOpen(
                !mobileFiltersOpen
              )
            }
            className="flex w-full items-center justify-between rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold shadow-sm"
          >
            <span>Filters</span>
            <span>
              {mobileFiltersOpen ? "▲" : "▼"}
            </span>
          </button>
        </div>

        <div className="grid gap-6 lg:grid-cols-[210px_1fr]">

          {/* FILTER SIDEBAR */}
          <aside
            className={`${
              mobileFiltersOpen
                ? "block"
                : "hidden"
            } lg:block`}
          >
            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm lg:sticky lg:top-24">

              <div className="mb-5 flex items-center justify-between">
                <h2 className="text-sm font-black">
                  Filters
                </h2>

                <button
                  onClick={clearFilters}
                  className="text-xs font-bold text-blue-600 hover:text-blue-800"
                >
                  Clear
                </button>
              </div>

              {/* CATEGORY */}
              <div className="mb-5">
                <label className="mb-2 block text-xs font-bold text-slate-700">
                  Category
                </label>

                <select
                  value={categoryFilter}
                  onChange={(e) =>
                    setCategoryFilter(
                      e.target.value
                    )
                  }
                  className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none focus:border-blue-500"
                >
                  <option value="">
                    All categories
                  </option>

                  {categories.map((category) => (
                    <option
                      key={category}
                      value={category}
                    >
                      {category}
                    </option>
                  ))}
                </select>
              </div>

              {/* CITY */}
              <div className="mb-5">
                <label className="mb-2 block text-xs font-bold text-slate-700">
                  City
                </label>

                <select
                  value={cityFilter}
                  onChange={(e) => {
                    setCityFilter(
                      e.target.value
                    );
                    setAreaFilter("");
                  }}
                  className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none focus:border-blue-500"
                >
                  <option value="">
                    All cities
                  </option>

                  {cities.map((city) => (
                    <option
                      key={city}
                      value={city}
                    >
                      {city}
                    </option>
                  ))}
                </select>
              </div>

              {/* AREA */}
              <div>
                <label className="mb-2 block text-xs font-bold text-slate-700">
                  Area
                </label>

                <select
                  value={areaFilter}
                  onChange={(e) =>
                    setAreaFilter(
                      e.target.value
                    )
                  }
                  className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none focus:border-blue-500"
                >
                  <option value="">
                    All areas
                  </option>

                  {areas.map((area) => (
                    <option
                      key={area}
                      value={area}
                    >
                      {area}
                    </option>
                  ))}
                </select>
              </div>

            </div>
          </aside>

          {/* BUSINESS RESULTS */}
          <div>

            {/* RESULTS HEADER */}
            <div className="mb-5 flex items-center justify-between gap-3">
              <div>
                <h2 className="text-xl font-black sm:text-2xl">
                  {loading
                    ? "Searching..."
                    : `${filteredBusinesses.length} ${
                        filteredBusinesses.length === 1
                          ? "business"
                          : "businesses"
                      } found`}
                </h2>

                {(query || cityQuery) && (
                  <p className="mt-1 text-xs text-slate-500">
                    Showing results for{" "}
                    {query && (
                      <span className="font-semibold text-slate-700">
                        “{query}”
                      </span>
                    )}

                    {query && cityQuery
                      ? " in "
                      : ""}

                    {cityQuery && (
                      <span className="font-semibold text-slate-700">
                        “{cityQuery}”
                      </span>
                    )}
                  </p>
                )}
              </div>

              <button
                onClick={() =>
                  router.push(
                    "/list-business"
                  )
                }
                className="hidden rounded-xl bg-slate-950 px-4 py-2.5 text-xs font-bold text-white transition hover:bg-blue-700 sm:block"
              >
                List Business
              </button>
            </div>

            {/* LOADING */}
            {loading && (
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {[1, 2, 3].map((item) => (
                  <div
                    key={item}
                    className="animate-pulse overflow-hidden rounded-2xl border border-slate-200 bg-white"
                  >
                    <div className="h-40 bg-slate-100" />

                    <div className="space-y-3 p-4">
                      <div className="h-4 w-2/3 rounded bg-slate-100" />
                      <div className="h-3 w-1/2 rounded bg-slate-100" />
                      <div className="h-3 w-full rounded bg-slate-100" />
                      <div className="h-10 rounded bg-slate-100" />
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* ERROR */}
            {!loading && error && (
              <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-center">
                <p className="text-sm font-semibold text-red-700">
                  {error}
                </p>
              </div>
            )}

            {/* NO RESULTS */}
            {!loading &&
              !error &&
              filteredBusinesses.length === 0 && (
                <div className="rounded-2xl border border-slate-200 bg-white px-6 py-12 text-center shadow-sm">

                  <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-slate-100 text-2xl">
                    ⌕
                  </div>

                  <h3 className="mt-4 text-lg font-black">
                    No businesses found
                  </h3>

                  <p className="mx-auto mt-2 max-w-md text-sm text-slate-500">
                    Search another business,
                    service, category or
                    location.
                  </p>

                  <button
                    onClick={clearFilters}
                    className="mt-5 rounded-xl bg-slate-950 px-5 py-3 text-sm font-bold text-white"
                  >
                    Clear Filters
                  </button>

                </div>
              )}

            {/* BUSINESS GRID */}
            {!loading &&
              !error &&
              filteredBusinesses.length > 0 && (
                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">

                  {filteredBusinesses.map(
                    (business) => {
                      const services =
                        arrayValues(
                          business.services
                        );

                      const highlights =
                        arrayValues(
                          business.highlights
                        );

                      const location =
                        getLocation(
                          business
                        );

                      return (
                        <article
                          key={business.id}
                          className="group overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg"
                        >

                          {/* IMAGE */}
                          <div className="relative h-40 overflow-hidden bg-slate-100">

                            {business.image_url ? (
                              <img
                                src={
                                  business.image_url
                                }
                                alt={
                                  business.business_name
                                }
                                className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                                loading="lazy"
                              />
                            ) : (
                              <div className="flex h-full items-center justify-center text-4xl text-slate-300">
                                ◫
                              </div>
                            )}

                            <div className="absolute left-3 top-3 rounded-full border border-white/70 bg-white/95 px-3 py-1 text-[10px] font-bold text-slate-700 shadow-sm">
                              {business.category}
                            </div>

                          </div>

                          {/* CONTENT */}
                          <div className="p-4">

                            <h3 className="line-clamp-1 text-base font-black text-slate-950">
                              {business.business_name}
                            </h3>

                            {business.subcategory && (
                              <p className="mt-1 line-clamp-1 text-xs font-bold text-blue-600">
                                {
                                  business.subcategory
                                }
                              </p>
                            )}

                            {location && (
                              <p className="mt-2 line-clamp-2 text-xs leading-5 text-slate-500">
                                ◉ {location}
                              </p>
                            )}

                            {(business.short_description ||
                              business.description) && (
                              <p className="mt-3 line-clamp-2 text-xs leading-5 text-slate-500">
                                {business.short_description ||
                                  business.description}
                              </p>
                            )}

                            {/* SERVICES */}
                            {services.length > 0 && (
                              <div className="mt-3 flex flex-wrap gap-1.5">
                                {services
                                  .slice(0, 3)
                                  .map(
                                    (
                                      service
                                    ) => (
                                      <span
                                        key={
                                          service
                                        }
                                        className="rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-medium text-slate-600"
                                      >
                                        {
                                          service
                                        }
                                      </span>
                                    )
                                  )}
                              </div>
                            )}

                            {/* HIGHLIGHTS */}
                            {highlights.length > 0 && (
                              <div className="mt-3">
                                <p className="line-clamp-1 text-[10px] font-semibold text-emerald-600">
                                  ✓{" "}
                                  {highlights
                                    .slice(
                                      0,
                                      2
                                    )
                                    .join(
                                      " • "
                                    )}
                                </p>
                              </div>
                            )}

                            {/* ACTIONS */}
                            <div className="mt-4 grid grid-cols-[1fr_auto] gap-2">

                              <button
                                onClick={() =>
                                  router.push(
                                    `/business/${business.id}`
                                  )
                                }
                                className="h-10 rounded-xl bg-slate-950 px-3 text-xs font-bold text-white transition hover:bg-blue-700"
                              >
                                View Business
                              </button>

                              {business.phone ? (
                                <a
                                  href={`tel:${business.phone}`}
                                  className="flex h-10 items-center justify-center rounded-xl border border-slate-200 bg-white px-3 text-xs font-bold text-slate-700 transition hover:border-blue-300 hover:text-blue-700"
                                >
                                  Call
                                </a>
                              ) : (
                                <button
                                  onClick={() =>
                                    router.push(
                                      `/business/${business.id}`
                                    )
                                  }
                                  className="flex h-10 items-center justify-center rounded-xl border border-slate-200 bg-white px-3 text-xs font-bold text-slate-700"
                                >
                                  Contact
                                </button>
                              )}

                            </div>

                          </div>
                        </article>
                      );
                    }
                  )}

                </div>
              )}

            {/* MOBILE LIST BUSINESS */}
            <div className="mt-6 sm:hidden">
              <button
                onClick={() =>
                  router.push(
                    "/list-business"
                  )
                }
                className="w-full rounded-xl bg-slate-950 py-3 text-sm font-bold text-white"
              >
                List Your Business
              </button>
            </div>

          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="mt-10 border-t border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-8 text-center sm:px-6 lg:px-8">

          <p className="text-sm font-black text-slate-900">
            LocalPlatform
          </p>

          <p className="mt-1 text-xs text-slate-500">
            Find local. Choose better.
          </p>

        </div>
      </footer>

    </main>
  );
}