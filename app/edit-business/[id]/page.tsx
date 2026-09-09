"use client";

import { useState } from "react";
import Link from "next/link";

const gallery = [
  "https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1515003197210-e0cd71810b5f?auto=format&fit=crop&w=400&q=80",
  "https://images.unsplash.com/photo-1552566626-52f8b828add9?auto=format&fit=crop&w=400&q=80",
];

export default function BusinessProfilePage() {
  const [saved, setSaved] = useState(false);

  return (
    <main className="lp-mobile-app lp-profile-page">
      <div className="lp-profile-hero">
        <div
          className="lp-profile-cover"
          style={{ backgroundImage: `url(${gallery[0]})` }}
        />

        <div className="lp-profile-hero-actions">
          <Link href="/" className="lp-round-action" aria-label="Go back">
            ‹
          </Link>

          <button
            className="lp-round-action"
            onClick={() => setSaved(!saved)}
            aria-label="Save business"
          >
            {saved ? "♥" : "♡"}
          </button>
        </div>
      </div>

      <section className="lp-business-summary">
        <div className="lp-business-logo">🍛</div>

        <div className="lp-business-heading">
          <div>
            <h1>Spice Hub Restaurant</h1>
            <p>North Indian · Chinese · Fast Food</p>
          </div>

          <span className="lp-verified">✓</span>
        </div>

        <div className="lp-profile-rating">
          <strong>★ 4.8</strong>
          <span>320 reviews</span>
          <b>Open Now</b>
        </div>

        <p className="lp-profile-location">
          ⌖ Gomti Nagar, Lucknow
        </p>
      </section>

      <div className="lp-profile-actions">
        <button>☎ Call</button>
        <button>◉ WhatsApp</button>
        <button>◌ Chat</button>
      </div>

      <section className="lp-profile-section">
        <div className="lp-profile-section-heading">
          <h2>About this business</h2>
        </div>

        <p className="lp-about-text">
          Spice Hub serves delicious North Indian and Chinese food made with
          fresh ingredients. Visit us for family meals, quick bites and special
          combo offers.
        </p>
      </section>

      <section className="lp-profile-section">
        <div className="lp-profile-section-heading">
          <h2>Photos</h2>
          <a href="#photos">See All</a>
        </div>

        <div className="lp-gallery">
          {gallery.map((image) => (
            <div
              key={image}
              className="lp-gallery-image"
              style={{ backgroundImage: `url(${image})` }}
            />
          ))}
        </div>
      </section>

      <section className="lp-profile-section">
        <div className="lp-profile-section-heading">
          <h2>Offers</h2>
          <a href="#offers">See All</a>
        </div>

        <div className="lp-profile-offer">
          <span>🏷</span>
          <div>
            <strong>20% OFF on All Combos</strong>
            <small>Valid this week · Spice Hub</small>
          </div>
          <button>Use</button>
        </div>
      </section>

      <section className="lp-profile-section">
        <div className="lp-profile-section-heading">
          <h2>Customer reviews</h2>
          <a href="#reviews">See All</a>
        </div>

        <article className="lp-review-card">
          <div className="lp-review-avatar">A</div>

          <div>
            <div className="lp-review-top">
              <strong>Arjun Sharma</strong>
              <span>★ 5.0</span>
            </div>

            <p>
              Great taste, quick service and very friendly staff. Recommended
              for family dinners.
            </p>

            <small>2 days ago</small>
          </div>
        </article>
      </section>

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
