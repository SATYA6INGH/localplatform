"use client";

import Link from "next/link";
import { useState } from "react";

export default function BusinessProfilePage() {
  const [tab, setTab] = useState("Overview");

  const tabs = [
    "Overview",
    "Posts",
    "Offers",
    "Services",
    "Reviews",
  ];

  return (
    <main className="lp-profile-page">

      {/* ================= COVER ================= */}

      <section className="lp-business-cover">

        <div className="lp-cover-image" />

        <div className="lp-cover-overlay" />

        <Link
          href="/"
          className="lp-profile-back"
        >
          ‹
        </Link>

        <button className="lp-cover-more">
          ⋯
        </button>

        <div className="lp-cover-count">
          1 / 10
        </div>

        {/* BUSINESS LOGO */}

        <div className="lp-business-logo">
          🍛
        </div>

      </section>


      {/* ================= BUSINESS INFO ================= */}

      <section className="lp-profile-info">

        <div className="lp-profile-title-row">

          <div>

            <h1>
              Spice Hub Restaurant
              <span className="lp-verified">
                ✓
              </span>
            </h1>

            <p>
              ⌖ Restaurant • North Indian • Chinese
            </p>

            <p>
              ⌖ Gomti Nagar, Lucknow
            </p>

          </div>

          <button className="lp-profile-menu">
            ⋯
          </button>

        </div>


        <div className="lp-open-status">
          <b>Open Now</b>
          <span>• Closes at 11:00 PM</span>
        </div>


        {/* STATS */}

        <div className="lp-profile-stats">

          <div>
            <strong>1.2K</strong>
            <small>Followers</small>
          </div>

          <div>
            <strong>86</strong>
            <small>Posts</small>
          </div>

          <div>
            <strong>4.8</strong>
            <small>Rating</small>
          </div>

        </div>


        {/* FOLLOW / CHAT */}

        <div className="lp-follow-row">

          <button className="lp-follow-button">
            ♡ Follow
          </button>

          <Link
            href="/chat"
            className="lp-profile-chat-button"
          >
            ◌ Chat
          </Link>

        </div>


        {/* QUICK ACTIONS */}

        <div className="lp-quick-actions">

          <button
            onClick={() =>
              (window.location.href =
                "tel:+919876543210")
            }
          >
            <span>☎</span>
            <small>Call</small>
          </button>

          <button
            onClick={() =>
              window.open(
                "https://wa.me/919876543210",
                "_blank"
              )
            }
          >
            <span>◉</span>
            <small>WhatsApp</small>
          </button>

          <button
            onClick={() =>
              window.open(
                "https://maps.google.com/?q=Gomti+Nagar+Lucknow",
                "_blank"
              )
            }
          >
            <span>⌖</span>
            <small>Directions</small>
          </button>

          <button>
            <span>♡</span>
            <small>Save</small>
          </button>

        </div>

      </section>


      {/* ================= TABS ================= */}

      <div className="lp-profile-tabs">

        {tabs.map((item) => (

          <button
            key={item}
            className={
              tab === item
                ? "active"
                : ""
            }
            onClick={() =>
              setTab(item)
            }
          >
            {item}
          </button>

        ))}

      </div>


      {/* ================= CONTENT ================= */}

      <section className="lp-profile-content">

        {tab === "Overview" && (
          <>
            <h2>About</h2>

            <p className="lp-about">
              Delicious food, great ambience and
              unforgettable experiences. Visit
              Spice Hub for the best dining in
              Lucknow.
            </p>

            <button className="lp-read-more">
              Read More
            </button>


            <div className="lp-info-box">

              <div>
                <span>⌖</span>

                <div>
                  <strong>Address</strong>
                  <small>
                    Gomti Nagar, Lucknow
                  </small>
                </div>
              </div>

              <div>
                <span>◷</span>

                <div>
                  <strong>Opening Hours</strong>
                  <small>
                    Today · 11:00 AM – 11:00 PM
                  </small>
                </div>
              </div>

              <div>
                <span>₹</span>

                <div>
                  <strong>Price Range</strong>
                  <small>
                    ₹₹ · Moderate
                  </small>
                </div>
              </div>

            </div>
          </>
        )}


        {tab === "Posts" && (

          <div className="lp-empty-profile">

            <span>▣</span>

            <h3>
              No posts yet
            </h3>

            <p>
              Business posts will appear here.
            </p>

          </div>

        )}


        {tab === "Offers" && (

          <div className="lp-profile-offer">

            <div className="lp-profile-offer-image" />

            <div>

              <strong>
                20% OFF
              </strong>

              <h3>
                20% OFF on All Combos
              </h3>

              <p>
                Valid today · Spice Hub Restaurant
              </p>

              <button>
                View Offer
              </button>

            </div>

          </div>

        )}


        {tab === "Services" && (

          <div className="lp-services">

            <div>
              <span>🍛</span>
              <strong>
                North Indian
              </strong>
            </div>

            <div>
              <span>🥡</span>
              <strong>
                Chinese
              </strong>
            </div>

            <div>
              <span>🍽</span>
              <strong>
                Fast Food
              </strong>
            </div>

            <div>
              <span>🚚</span>
              <strong>
                Home Delivery
              </strong>
            </div>

          </div>

        )}


        {tab === "Reviews" && (

          <div className="lp-review-summary">

            <strong>
              4.8
            </strong>

            <span>
              ★★★★★
            </span>

            <small>
              Based on 320 reviews
            </small>

          </div>

        )}

      </section>


      {/* ================= BOTTOM NAV ================= */}

      <nav className="lp-bottom-nav">

        <Link href="/">
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

    </main>
  );
}