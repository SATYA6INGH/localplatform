"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "./lib/supabase";
import { getBusinessImage } from "./lib/business-images";
import AdSenseSlot from "./components/AdSenseSlot";
import HomeTopAds from "./components/HomeTopAds";

const categories = [
  ["Food", "🍴", "food"],
  ["Doctors", "⚕", "doctor"],
  ["Salon", "✂", "salon"],
  ["Home Services", "⌂", "home"],
  ["Real Estate", "▥", "real"],
  ["Interior", "▣", "interior"],
] as const;

type BusinessCard = {
  id: string;
  name: string;
  rating: string | null;
  area: string;
  phone: string;
  image: string;
};

export default function HomePage() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [city, setCity] = useState("Lucknow");
  const [remoteBusinesses, setRemoteBusinesses] = useState<BusinessCard[]>([]);

  useEffect(() => {
    let mounted = true;

    async function loadBusinesses() {
      if (!supabase) return;
      const { data } = await supabase
        .from("businesses")
        .select("id, business_name, category, city, area, address, phone, image_url, listing_status")
        .eq("listing_status", "active")
        .order("business_name", { ascending: true })
        .limit(12);

      if (!mounted || !data?.length) return;

      setRemoteBusinesses(
        data.map((business) => ({
          id: String(business.id),
          name: business.business_name,
          rating: null,
          area: business.area || business.address || business.city || "Nearby",
          phone: business.phone || "",
          image: getBusinessImage(business.category, business.image_url),
        })),
      );
    }

    loadBusinesses();
    return () => {
      mounted = false;
    };
  }, []);

  const availableBusinesses = remoteBusinesses;

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
          <Link className="lp-header-action" aria-label="Notifications" href="/status">
            ♧<i>2</i>
          </Link>

          <Link className="lp-header-action" aria-label="Messages" href="/chat">
            ◌
          </Link>

          <Link className="lp-profile-mini" aria-label="Profile" href="/profile">
            👤
          </Link>
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
              onClick={() => router.push(`/search?q=${encodeURIComponent(name)}`)}
            >
              <span className={`lp-category-round ${color}`}>{icon}</span>
              <small>{name}</small>
            </button>
          ))}
        </div>
      </section>

      <AdSenseSlot slot={process.env.NEXT_PUBLIC_ADSENSE_HOME_SLOT} />

      <HomeTopAds />

      <Section title="Status" action="See All" href="/status">
        <div className="lp-status-scroll">
          <button className="lp-status-item" onClick={() => router.push("/status")}><span className="lp-status-ring status-add">＋</span><strong>View live updates</strong><small>Only real statuses</small></button>
        </div>
      </Section>

      <Section title="🔥 Trending Near You" action="See All" href="/search">
        <div className="lp-business-scroll">
          {availableBusinesses.map((business) => (
            <article className="lp-mini-business" key={business.name}>
              <div
                className="lp-mini-business-image"
                style={business.image ? { backgroundImage: `url(${business.image})` } : undefined}
              >
                <span className="lp-open">LISTED</span>
                <span className="lp-save">♡</span>
              </div>

              <div className="lp-mini-business-content">
                <h3><Link href={`/business/${business.id}`}>{business.name}</Link></h3>

                <div className="lp-rating">
                  {business.rating ? <b>★ {business.rating}</b> : <span>New listing</span>}
                </div>

                <p>⌖ {business.area}</p>
              </div>

              <div className="lp-mini-actions">
                <a href={business.phone ? `tel:${business.phone}` : undefined} aria-label="Call">☎</a>
                <a href={business.phone ? `https://wa.me/${business.phone.replace(/\D/g, "")}` : undefined} target="_blank" rel="noreferrer" aria-label="WhatsApp">◉</a>
                <Link href={`/chat?business=${business.id}`} aria-label="Chat">◌</Link>
              </div>
            </article>
          ))}
          {availableBusinesses.length === 0 && <div className="lp-empty-results"><span>⌕</span><h3>No active businesses yet</h3><p>Verified listings will appear here.</p></div>}
        </div>
      </Section>

      <Section title="Popular Categories" action="See All" href="/search">
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
            <button className="lp-popular-item" key={name} onClick={() => router.push(`/search?q=${encodeURIComponent(name)}`)}>
              <span>{icon}</span>
              <small>{name}</small>
            </button>
          ))}
        </div>
      </Section>

      <Link className="lp-list-business" href="/list-business">
        <span className="lp-list-icon">🏪</span>

        <span className="lp-list-text">
          <strong>List Your Business FREE</strong>
          <small>Reach more local customers today</small>
        </span>

        <span className="lp-list-arrow">›</span>
      </Link>

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
  href,
  children,
}: {
  title: string;
  action: string;
  href: string;
  children: React.ReactNode;
}) {
  return (
    <section className="lp-section">
      <div className="lp-section-head">
        <h2>{title}</h2>
        <Link href={href}>{action}</Link>
      </div>

      {children}
    </section>
  );
}
