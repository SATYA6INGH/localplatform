"use client";

import { useState } from "react";
import Link from "next/link";

const categories = [
  { name: "Food", icon: "🍴", color: "food" },
  { name: "Doctors", icon: "⚕", color: "doctor" },
  { name: "Salon", icon: "✂", color: "salon" },
  { name: "Home Services", icon: "⌂", color: "home" },
  { name: "Real Estate", icon: "▥", color: "real" },
  { name: "Interior", icon: "▣", color: "interior" },
];

const statuses = [
  { name: "Your Status", image: "👤", time: "", add: true },
  { name: "Spice Hub", image: "🍛", time: "Online", online: true },
  { name: "City Salon", image: "👩", time: "2h ago" },
  { name: "Care Life", image: "👩", time: "5h ago", online: true },
  { name: "FitzZone", image: "🏋", time: "8h ago", online: true },
  { name: "More", image: "•••", time: "" },
];

const trending = [
  {
    name: "Spice Hub",
    category: "Restaurant",
    rating: "4.8",
    reviews: "320",
    location: "Gomti Nagar",
    image:
      "https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=600&q=85",
    status: "Open",
  },
  {
    name: "The Urban Cafe",
    category: "Cafe",
    rating: "4.6",
    reviews: "210",
    location: "Hazratganj",
    image:
      "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&w=600&q=85",
    status: "Open",
  },
  {
    name: "City Salon",
    category: "Salon",
    rating: "4.7",
    reviews: "180",
    location: "Aliganj",
    image:
      "https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=600&q=85",
    status: "Open",
  },
  {
    name: "Dream Interiors",
    category: "Interior",
    rating: "4.5",
    reviews: "120",
    location: "Indira Nagar",
    image:
      "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=600&q=85",
    status: "Closed",
  },
];

const offers = [
  {
    title: "20% OFF",
    sub: "on All Combos",
    name: "Spice Hub",
    image:
      "https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=500&q=80",
  },
  {
    title: "Flat 30% OFF",
    sub: "on Hair Services",
    name: "City Salon",
    image:
      "https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=500&q=80",
  },
  {
    title: "Free Consultation",
    sub: "Interior Design",
    name: "Dream Interiors",
    image:
      "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=500&q=80",
  },
];

const popularCategories = [
  { name: "Architect", icon: "▥" },
  { name: "Electrician", icon: "ϟ" },
  { name: "Plumber", icon: "♒" },
  { name: "AC Service", icon: "▤" },
  { name: "Car Service", icon: "🚗" },
  { name: "Fitness", icon: "🏋" },
  { name: "More", icon: "•••" },
];

export default function HomePage() {
  const [search, setSearch] = useState("");

  return (
    <>
      <div className="lp-mobile-app">

        {/* ================= HEADER ================= */}

        <header className="lp-top-header">

          <div className="lp-brand-block">
            <div className="lp-brand">
              <span>Local</span>
              <strong>Platform</strong>
            </div>

            <button className="lp-city">
              <span>⌖</span>
              Lucknow
              <span className="lp-chevron">⌄</span>
            </button>
          </div>

          <div className="lp-header-actions">

            <button
              className="lp-header-action"
              aria-label="Notifications"
            >
              ♧
              <i>3</i>
            </button>

            <button
              className="lp-header-action"
              aria-label="Messages"
            >
              ◌
              <i>5</i>
            </button>

            <button
              className="lp-profile-mini"
              aria-label="Profile"
            >
              👨🏻
            </button>

          </div>

        </header>


        {/* ================= SEARCH ================= */}

        <section className="lp-main-search">

          <div className="lp-search-input-wrap">

            <span>⌕</span>

            <input
              value={search}
              onChange={(e) =>
                setSearch(e.target.value)
              }
              placeholder="Search businesses or services..."
            />

          </div>

          <Link
            href="/search"
            className="lp-filter-button"
          >
            ☷
          </Link>

        </section>


        {/* ================= CATEGORIES ================= */}

        <section className="lp-category-section">

          <div className="lp-horizontal-list">

            {categories.map((category) => (

              <Link
                key={category.name}
                href={`/search?category=${encodeURIComponent(
                  category.name
                )}`}
                className="lp-category-item"
              >

                <span
                  className={`lp-category-round ${category.color}`}
                >
                  {category.icon}
                </span>

                <small>
                  {category.name}
                </small>

              </Link>

            ))}

          </div>

        </section>


        {/* ================= STATUS ================= */}

        <section className="lp-section">

          <div className="lp-section-head">

            <div>
              <h2>Status</h2>
            </div>

            <Link href="/status">
              See All ›
            </Link>

          </div>


          <div className="lp-status-scroll">

            {statuses.map((status) => (

              <Link
                key={status.name}
                href={
                  status.name === "More"
                    ? "/status"
                    : "/status"
                }
                className="lp-status-item"
              >

                <div
                  className={`lp-status-ring ${
                    status.online
                      ? "status-online"
                      : ""
                  } ${
                    status.add
                      ? "status-add"
                      : ""
                  }`}
                >

                  <span>
                    {status.image}
                  </span>

                  {status.add && (
                    <b>+</b>
                  )}

                </div>

                <strong>
                  {status.name}
                </strong>

                {status.time && (
                  <small
                    className={
                      status.online
                        ? "online-text"
                        : ""
                    }
                  >
                    {status.time}
                  </small>
                )}

              </Link>

            ))}

          </div>

        </section>


        {/* ================= TRENDING ================= */}

        <section className="lp-section">

          <div className="lp-section-head">

            <h2>
              🔥 Trending Near You
            </h2>

            <Link href="/search">
              See All ›
            </Link>

          </div>


          <div className="lp-business-scroll">

            {trending.map((business) => (

              <Link
                key={business.name}
                href="/business/1"
                className="lp-mini-business"
              >

                <div
                  className="lp-mini-business-image"
                  style={{
                    backgroundImage:
                      `url("${business.image}")`,
                  }}
                >

                  <span
                    className={
                      business.status === "Open"
                        ? "lp-open"
                        : "lp-closed"
                    }
                  >
                    {business.status}
                  </span>

                  <span className="lp-save">
                    ♡
                  </span>

                </div>


                <div className="lp-mini-business-content">

                  <h3>
                    {business.name}
                  </h3>

                  <div className="lp-rating">
                    <b>★ {business.rating}</b>
                    <span>
                      ({business.reviews})
                    </span>
                  </div>

                  <p>
                    ⌖ {business.location}
                  </p>

                </div>


                <div className="lp-mini-actions">

                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      window.location.href =
                        "tel:+919876543210";
                    }}
                  >
                    ☎
                  </button>

                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      window.open(
                        "https://wa.me/919876543210",
                        "_blank"
                      );
                    }}
                  >
                    ◉
                  </button>

                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      window.location.href =
                        "/chat";
                    }}
                  >
                    ◌
                  </button>

                </div>

              </Link>

            ))}

          </div>

        </section>


        {/* ================= OFFERS ================= */}

        <section className="lp-section">

          <div className="lp-section-head">

            <h2>
              🏷 Offers Near You
            </h2>

            <Link href="/search">
              See All ›
            </Link>

          </div>


          <div className="lp-offers-scroll">

            {offers.map((offer) => (

              <Link
                href="/business/1"
                key={offer.name}
                className="lp-offer-card"
              >

                <div
                  className="lp-offer-image"
                  style={{
                    backgroundImage:
                      `url("${offer.image}")`,
                  }}
                />

                <div className="lp-offer-info">

                  <strong>
                    {offer.title}
                  </strong>

                  <span>
                    {offer.sub}
                  </span>

                  <small>
                    {offer.name}
                  </small>

                </div>

              </Link>

            ))}

          </div>

        </section>


        {/* ================= POPULAR CATEGORIES ================= */}

        <section className="lp-section">

          <div className="lp-section-head">

            <h2>
              Popular Categories
            </h2>

            <Link href="/search">
              See All ›
            </Link>

          </div>


          <div className="lp-popular-scroll">

            {popularCategories.map(
              (category) => (

                <Link
                  href={`/search?category=${encodeURIComponent(
                    category.name
                  )}`}
                  key={category.name}
                  className="lp-popular-item"
                >

                  <span>
                    {category.icon}
                  </span>

                  <small>
                    {category.name}
                  </small>

                </Link>

              )
            )}

          </div>

        </section>


        {/* ================= LIST BUSINESS ================= */}

        <section className="lp-list-business">

          <div className="lp-list-icon">
            🏪
          </div>

          <div className="lp-list-text">

            <strong>
              List Your Business for FREE
            </strong>

            <small>
              Grow your business with LocalPlatform
            </small>

          </div>

          <Link
            href="/list-business"
            className="lp-list-arrow"
          >
            →
          </Link>

        </section>


        {/* ================= BOTTOM NAV ================= */}

        <nav className="lp-bottom-nav">

          <Link
            href="/"
            className="active"
          >
            <span>⌂</span>
            <small>Home</small>
          </Link>

          <Link href="/search">
            <span>⌕</span>
            <small>Explore</small>
          </Link>

          <Link href="/search">
            <span>⊙</span>
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

      </div>
    </>
  );
}