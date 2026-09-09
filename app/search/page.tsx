"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { supabase } from "../lib/supabase";
import { getBusinessImage } from "../lib/business-images";

type BusinessCard = {
  id: string;
  name: string;
  category: string;
  area: string;
  rating: string | null;
  reviews: string | null;
  phone: string;
  keywords: string;
  image: string;
  open: boolean | null;
};

const filters = [
  "All",
  "Food",
  "Doctors",
  "Salon",
  "Cafe",
  "Architect",
  "Construction",
  "Real Estate",
];

export default function SearchPage() {
  const [query, setQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState("All");
  const [remoteBusinesses, setRemoteBusinesses] = useState<BusinessCard[]>([]);
  const [loading, setLoading] = useState(true);

  // Read the URL only after hydration so the server and client render the same markup.
  useEffect(() => {
    const value = new URLSearchParams(window.location.search).get("q");
    if (value) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setQuery(value);
    }
  }, []);

  useEffect(() => {
    let mounted = true;

    async function loadBusinesses() {
      const { data, error } = await supabase
        .from("businesses")
        .select("id, business_name, category, city, area, address, phone, subcategory, services, seo_keywords, highlights, image_url, listing_status")
        .eq("listing_status", "active")
        .order("business_name", { ascending: true })
        .limit(40);

      if (!mounted) return;

      if (error || !data?.length) {
        setLoading(false);
        return;
      }

      setRemoteBusinesses(
        data.map((business) => ({
          id: String(business.id),
          name: business.business_name,
          category: business.category || "Local business",
          area: business.area || business.address || business.city || "Nearby",
          rating: null,
          reviews: null,
          phone: business.phone || "",
          keywords: [
            business.subcategory,
            ...(Array.isArray(business.services) ? business.services : []),
            ...(Array.isArray(business.seo_keywords) ? business.seo_keywords : []),
            ...(Array.isArray(business.highlights) ? business.highlights : []),
          ].filter(Boolean).join(" "),
          image: getBusinessImage(business.category, business.image_url),
          open: null,
        })),
      );
      setLoading(false);
    }

    loadBusinesses();
    return () => {
      mounted = false;
    };
  }, []);

  const availableBusinesses = remoteBusinesses;

  const filteredBusinesses = useMemo(() => {
    return availableBusinesses.filter((business) => {
      const matchesFilter =
        activeFilter === "All" || business.category.toLowerCase().includes(activeFilter.toLowerCase());

      const searchText = `${business.name} ${business.category} ${business.area} ${business.keywords}`
        .toLowerCase()
        .includes(query.toLowerCase());

      return matchesFilter && searchText;
    });
  }, [query, activeFilter, availableBusinesses]);

  return (
    <main className="lp-mobile-app lp-search-page">
      <header className="lp-search-header">
        <Link href="/" className="lp-back-button" aria-label="Go back">
          ‹
        </Link>

        <div>
          <h1>Explore</h1>
          <p>Find the best places near you</p>
        </div>

        <button className="lp-header-action" aria-label="Filter">
          ☷
        </button>
      </header>

      <section className="lp-explore-search">
        <span>⌕</span>

        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search businesses or services..."
        />

        {query && (
          <button
            className="lp-clear-search"
            onClick={() => setQuery("")}
            aria-label="Clear search"
          >
            ×
          </button>
        )}
      </section>

      <section className="lp-filter-scroll">
        {filters.map((filter) => (
          <button
            key={filter}
            className={activeFilter === filter ? "selected" : ""}
            onClick={() => setActiveFilter(filter)}
          >
            {filter}
          </button>
        ))}
      </section>

      <section className="lp-results-section">
        <div className="lp-results-heading">
          <div>
            <h2>{query ? `Results for “${query}”` : "Popular near you"}</h2>
            <p>{filteredBusinesses.length} places found</p>
          </div>

          <button className="lp-sort-button">Sort⌄</button>
        </div>

        {loading && <p className="lp-loading-text">Loading local businesses...</p>}

        <div className="lp-results-list">
          {filteredBusinesses.map((business) => (
              <article className="lp-result-card" key={business.name}>
              <div
                className="lp-result-image"
                style={business.image ? { backgroundImage: `url(${business.image})` } : undefined}
              >
                {business.open !== null && <span className={business.open ? "open" : "closed"}>{business.open ? "OPEN NOW" : "CLOSED"}</span>}

                <button className="lp-result-save" aria-label="Save business">
                  ♡
                </button>
              </div>

              <div className="lp-result-content">
                <div className="lp-result-title">
                  <h3>{business.name}</h3>
                  {business.rating ? <strong>★ {business.rating}</strong> : <strong className="lp-muted-rating">New listing</strong>}
                </div>

                <p className="lp-result-category">{business.category}</p>

                <p className="lp-result-location">
                  ⌖ {business.area}
                </p>

                <p className="lp-result-reviews">
                  {business.reviews ? `${business.reviews} reviews` : "No reviews yet"}
                </p>

                <div className="lp-result-actions">
                  <a href={business.phone ? `tel:${business.phone}` : undefined}>☎ Call</a>
                  <a
                    href={business.phone ? `https://wa.me/${business.phone.replace(/\D/g, "")}` : undefined}
                    target="_blank"
                    rel="noreferrer"
                  >
                    ◉ WhatsApp
                  </a>
                  <Link className="lp-result-view" href={`/business/${business.id ?? "1"}`}>View</Link>
                </div>
              </div>
            </article>
          ))}
        </div>

        {filteredBusinesses.length === 0 && (
          <div className="lp-empty-results">
            <span>⌕</span>
            <h3>No businesses found</h3>
            <p>Try another search or category.</p>
          </div>
        )}
      </section>

      <nav className="lp-bottom-nav">
        <Link href="/">
          <span>⌂</span>
          <small>Home</small>
        </Link>

        <Link className="active" href="/search">
          <span>⌕</span>
          <small>Explore</small>
        </Link>

        <Link href="/search">
          <span>⌖</span>
          <small>Nearby</small>
        </Link>

        <Link href="/chat">
          <span>◌</span>
          <small>Chat</small>
        </Link>

        <Link href="/profile">
          <span>♙</span>
          <small>Profile</small>
        </Link>
      </nav>
    </main>
  );
}
