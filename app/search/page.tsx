"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { supabase } from "../lib/supabase";

const businesses = [
  {
    id: "1",
    name: "Spice Hub Restaurant",
    category: "Food",
    area: "Gomti Nagar, Lucknow",
    rating: "4.8",
    reviews: "320",
    image:
      "https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=600&q=80",
    open: true,
  },
  {
    id: "2",
    name: "The Urban Cafe",
    category: "Cafe",
    area: "Hazratganj, Lucknow",
    rating: "4.6",
    reviews: "210",
    image:
      "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&w=600&q=80",
    open: true,
  },
  {
    id: "3",
    name: "Glow Beauty Salon",
    category: "Salon",
    area: "Aliganj, Lucknow",
    rating: "4.7",
    reviews: "185",
    image:
      "https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=600&q=80",
    open: false,
  },
  {
    id: "4",
    name: "Care Life Clinic",
    category: "Doctors",
    area: "Indira Nagar, Lucknow",
    rating: "4.9",
    reviews: "410",
    image:
      "https://images.unsplash.com/photo-1538108149393-fbbd81895907?auto=format&fit=crop&w=600&q=80",
    open: true,
  },
];

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
  const [remoteBusinesses, setRemoteBusinesses] = useState<typeof businesses>([]);
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
      if (!supabase) {
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from("businesses")
        .select("id, business_name, category, city, area, address, image_url, listing_status")
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
          rating: "4.8",
          reviews: "New",
          image: business.image_url || businesses[0].image,
          open: true,
        })),
      );
      setLoading(false);
    }

    loadBusinesses();
    return () => {
      mounted = false;
    };
  }, []);

  const availableBusinesses = remoteBusinesses.length ? remoteBusinesses : businesses;

  const filteredBusinesses = useMemo(() => {
    return availableBusinesses.filter((business) => {
      const matchesFilter =
        activeFilter === "All" || business.category === activeFilter;

      const searchText = `${business.name} ${business.category} ${business.area}`
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
                style={{ backgroundImage: `url(${business.image})` }}
              >
                <span className={business.open ? "open" : "closed"}>
                  {business.open ? "OPEN NOW" : "CLOSED"}
                </span>

                <button className="lp-result-save" aria-label="Save business">
                  ♡
                </button>
              </div>

              <div className="lp-result-content">
                <div className="lp-result-title">
                  <h3>{business.name}</h3>
                  <strong>★ {business.rating}</strong>
                </div>

                <p className="lp-result-category">{business.category}</p>

                <p className="lp-result-location">
                  ⌖ {business.area}
                </p>

                <p className="lp-result-reviews">
                  {business.reviews} reviews · Available today
                </p>

                <div className="lp-result-actions">
                  <button>☎ Call</button>
                  <button>◉ WhatsApp</button>
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
