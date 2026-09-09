"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "./lib/supabase";

const categories = [
  ["Food", "🍴", "food"],
  ["Doctors", "⚕", "doctor"],
  ["Salon", "✂", "salon"],
  ["Home Services", "⌂", "home"],
  ["Real Estate", "▥", "real"],
  ["Interior", "▣", "interior"],
] as const;

const statuses = [
  ["Your Status", "👤", "", "add"],
  ["Spice Hub", "🍛", "Online", "online"],
  ["City Salon", "👩", "2h ago", ""],
  ["Care Life", "❤", "Online", "online"],
  ["FitZone", "🏋", "8h ago", ""],
] as const;

const businesses = [
  {
    id: "1",
    name: "Spice Hub",
    rating: "4.8",
    area: "Gomti Nagar",
    image:
      "https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=400&q=80",
  },
  {
    id: "2",
    name: "Urban Cafe",
    rating: "4.6",
    area: "Hazratganj",
    image:
      "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&w=400&q=80",
  },
  {
    id: "3",
    name: "Glow Salon",
    rating: "4.7",
    area: "Aliganj",
    image:
      "https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=400&q=80",
  },
  {
    id: "4",
    name: "Studio Nest",
    rating: "4.9",
    area: "Indira Nagar",
    image:
      "https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=400&q=80",
  },
];

export default function HomePage() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [city, setCity] = useState("Lucknow");
  const [remoteBusinesses, setRemoteBusinesses] = useState<typeof businesses>([]);

  useEffect(() => {
    let mounted = true;

    async function loadBusinesses() {
      if (!supabase) return;
      const { data } = await supabase
        .from("businesses")
        .select("id, business_name, category, city, area, address, image_url, listing_status")
        .eq("listing_status", "active")
        .order("business_name", { ascending: true })
        .limit(12);

      if (!mounted || !data?.length) return;

      setRemoteBusinesses(
        data.map((business) => ({
          id: String(business.id),
          name: business.business_name,
          rating: "4.8",
          area: business.area || business.address || business.city || "Nearby",
          image: business.image_url || businesses[0].image,
        })),
      );
    }

    loadBusinesses();
    return () => {
      mounted = false;
    };
  }, []);

  const availableBusinesses = remoteBusinesses.length ? remoteBusinesses : businesses;

  const search = (event: FormEvent) => {
    event.preventDefault();

    const value = query.trim();
    router.push(value ? `/search?q=${encodeURIComponent(value)}` : "/search");
  };

  const changeCity = () => {
    const next = prompt("Enter your city", city);

    if (next?.trim()) {
      setCity(next.trim());
    }
  };

  return (
    <main className="lp-mobile-app">
      <header className="lp-top-header">
        <div>
          <div className="lp-brand">
            <span>Local</span>
            <strong>Platform</strong>
          </div>

          <button className="lp-city" onClick={changeCity}>
            ⌖ {city} <span>⌄</span>
          </button>
        </div>

        <div className="lp-header-actions">
          <button className="lp-header-action" aria-label="Notifications">
            ♧<i>2</i>
          </button>

          <button className="lp-header-action" aria-label="Messages">
            ◌
          </button>

          <button className="lp-profile-mini" aria-label="Profile">
            👤
          </button>
        </div>
      </header>

      <form className="lp-main-search" onSubmit={search}>
        <label className="lp-search-input-wrap">
          <span>⌕</span>

          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search businesses or services..."
          />
        </label>

        <button
          className="lp-filter-button"
          aria-label="Search filters"
          type="submit"
        >
          ☷
        </button>
      </form>

      <section className="lp-category-section" aria-label="Categories">
        <div className="lp-horizontal-list">
          {categories.map(([name, icon, color]) => (
            <button
              className="lp-category-item"
              key={name}
              onClick={() => setQuery(name)}
            >
              <span className={`lp-category-round ${color}`}>{icon}</span>
              <small>{name}</small>
            </button>
          ))}
        </div>
      </section>

      <Section title="Status" action="See All">
        <div className="lp-status-scroll">
          {statuses.map(([name, icon, time, state]) => (
            <button className="lp-status-item" key={name}>
              <span
                className={`lp-status-ring ${
                  state === "online" ? "status-online" : ""
                } ${state === "add" ? "status-add" : ""}`}
              >
                {icon}
                {state === "add" && <b>+</b>}
              </span>

              <strong>{name}</strong>

              {time && (
                <small className={state === "online" ? "online-text" : ""}>
                  {time}
                </small>
              )}
            </button>
          ))}
        </div>
      </Section>

      <Section title="🔥 Trending Near You" action="See All">
        <div className="lp-business-scroll">
          {availableBusinesses.map((business) => (
            <article className="lp-mini-business" key={business.name}>
              <div
                className="lp-mini-business-image"
                style={{ backgroundImage: `url(${business.image})` }}
              >
                <span className="lp-open">OPEN</span>
                <span className="lp-save">♡</span>
              </div>

              <div className="lp-mini-business-content">
                <h3><Link href={`/business/${business.id}`}>{business.name}</Link></h3>

                <div className="lp-rating">
                  <b>★ {business.rating}</b>
                  <span>(120)</span>
                </div>

                <p>⌖ {business.area}</p>
              </div>

              <div className="lp-mini-actions">
                <button>☎</button>
                <button>◉</button>
                <button>◌</button>
              </div>
            </article>
          ))}
        </div>
      </Section>

      <Section title="🏷 Offers Near You" action="See All">
        <div className="lp-offers-scroll">
          <Offer
            image="https://images.unsplash.com/photo-1515003197210-e0cd71810b5f?auto=format&fit=crop&w=200&q=80"
            title="20% OFF"
            text="on all food combos"
            shop="Spice Hub"
          />

          <Offer
            image="https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=200&q=80"
            title="30% OFF"
            text="on salon services"
            shop="Glow Salon"
          />

          <Offer
            image="https://images.unsplash.com/photo-1556761175-b413da4baf72?auto=format&fit=crop&w=200&q=80"
            title="FREE"
            text="first consultation"
            shop="Care Life"
          />
        </div>
      </Section>

      <Section title="Popular Categories" action="See All">
        <div className="lp-popular-scroll">
          {[
            ["⌂", "Architect"],
            ["ϟ", "Electrician"],
            ["♨", "Plumber"],
            ["❄", "AC"],
            ["▰", "Car"],
            ["♧", "Fitness"],
            ["•••", "More"],
          ].map(([icon, name]) => (
            <button className="lp-popular-item" key={name}>
              <span>{icon}</span>
              <small>{name}</small>
            </button>
          ))}
        </div>
      </Section>

      <button className="lp-list-business">
        <span className="lp-list-icon">🏪</span>

        <span className="lp-list-text">
          <strong>List Your Business FREE</strong>
          <small>Reach more local customers today</small>
        </span>

        <span className="lp-list-arrow">›</span>
      </button>

      <nav className="lp-bottom-nav">
        <Link className="active" href="/">
          <span>⌂</span>
          <small>Home</small>
        </Link>

        <Link href="/search">
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

function Section({
  title,
  action,
  children,
}: {
  title: string;
  action: string;
  children: React.ReactNode;
}) {
  return (
    <section className="lp-section">
      <div className="lp-section-head">
        <h2>{title}</h2>
        <a href="#all">{action}</a>
      </div>

      {children}
    </section>
  );
}

function Offer({
  image,
  title,
  text,
  shop,
}: {
  image: string;
  title: string;
  text: string;
  shop: string;
}) {
  return (
    <article className="lp-offer-card">
      <div
        className="lp-offer-image"
        style={{ backgroundImage: `url(${image})` }}
      />

      <div className="lp-offer-info">
        <strong>{title}</strong>
        <span>{text}</span>
        <small>{shop}</small>
      </div>
    </article>
  );
}
