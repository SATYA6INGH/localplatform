"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

import SearchBar from "./SearchBar";
import {
  businesses,
  categories,
  statuses,
} from "./data";

export default function HomePageClient() {
  const router = useRouter();

  return (
    <main className="lp-app">

      {/* =========================
          HEADER
      ========================= */}

      <header className="lp-header">

        <div className="lp-header-left">

          <div className="lp-logo">
            Local<span>Platform</span>
          </div>

          <button className="lp-location">
            <span>⌖</span>
            Lucknow
            <b>⌄</b>
          </button>

        </div>

        <div className="lp-header-actions">

          <button className="lp-header-button">
            ♧
            <span>3</span>
          </button>

          <button className="lp-header-button">
            ◌
            <span>S</span>
          </button>

        </div>

      </header>


      {/* =========================
          MAIN PAGE
      ========================= */}

      <div className="lp-page">


        {/* =========================
            HERO
        ========================= */}

        <section className="lp-hero">

          <div className="lp-hero-overlay" />

          <div className="lp-hero-content">

            <h1>
              Find Local
              <br />
              Businesses Near You
            </h1>

            <p>
              Shops • Services • Professionals • Offers
            </p>

            <SearchBar />

          </div>

        </section>


        {/* =========================
            CATEGORIES
        ========================= */}

        <section className="lp-categories">

          {categories.map((category) => (

            <button
              key={category.name}
              className="lp-category"
              type="button"
              onClick={() =>
                router.push(
                  `/search?category=${encodeURIComponent(
                    category.name
                  )}`
                )
              }
            >

              <span
                className={`lp-category-icon ${category.color}`}
              >
                {category.icon}
              </span>

              <span>
                {category.name}
              </span>

            </button>

          ))}

        </section>


        {/* =========================
            LIVE STATUS
        ========================= */}

        <section className="lp-section">

          <div className="lp-section-title">

            <h2>
              Live Status
            </h2>

            <Link href="/status">
              See All
            </Link>

          </div>


          <div className="lp-status-list">

            {statuses.map(
              (status, index) => (

                <button
                  key={`${status.name}-${index}`}
                  className="lp-status"
                  type="button"
                  onClick={() => {
                    if (
                      status.name ===
                      "Spice Hub"
                    ) {
                      router.push(
                        "/business/1"
                      );
                    }
                  }}
                >

                  <div
                    className={
                      status.online
                        ? "lp-status-circle online"
                        : "lp-status-circle"
                    }
                  >

                    {status.icon}

                    {status.name ===
                      "Your Status" && (
                      <i>+</i>
                    )}

                  </div>

                  <strong>
                    {status.name}
                  </strong>

                  {status.time && (
                    <small>
                      {status.time}
                    </small>
                  )}

                </button>

              )
            )}

          </div>

        </section>


        {/* =========================
            TRENDING
        ========================= */}

        <section className="lp-section">

          <div className="lp-section-title">

            <h2>
              Trending Near You
            </h2>

            <Link href="/search">
              See All
            </Link>

          </div>


          <Link
            href="/business/1"
            className="lp-trending"
          >

            <div className="lp-trending-image" />

            <div className="lp-trending-overlay" />

            <div className="lp-trending-text">

              <b>
                Today&apos;s Special
              </b>

              <strong>
                20% OFF
              </strong>

              <span>
                on All Combos
              </span>

            </div>

          </Link>

        </section>


        {/* =========================
            POPULAR BUSINESSES
        ========================= */}

        <section className="lp-section lp-business-section">

          <div className="lp-section-title">

            <h2>
              Popular Businesses
            </h2>

            <Link href="/search">
              See All
            </Link>

          </div>


          {businesses.map(
            (business) => (

              <article
                key={business.id}
                className="lp-business-card"
              >

                {/* BUSINESS TOP */}

                <button
                  type="button"
                  className="lp-business-top"
                  onClick={() =>
                    router.push(
                      `/business/${business.id}`
                    )
                  }
                >

                  <div
                    className="lp-business-photo"
                    style={{
                      backgroundImage:
                        `url("${business.image}")`,
                    }}
                  />

                  <div className="lp-business-data">

                    <div className="lp-business-name-row">

                      <h3>
                        {business.name}
                      </h3>

                      <span>
                        ♡
                      </span>

                    </div>


                    <div className="lp-business-rating">

                      <b>
                        ● Open Now
                      </b>

                      <strong>
                        ★ {business.rating}
                      </strong>

                      <small>
                        ({business.reviews})
                      </small>

                    </div>


                    <p>
                      ⌖ {business.area}
                    </p>

                    <p>
                      ⌁ {business.category}
                    </p>


                    <div className="lp-business-offer">
                      ♥ {business.offer}
                    </div>

                  </div>

                </button>


                {/* ACTION BUTTONS */}

                <div className="lp-business-actions">

                  <button
                    type="button"
                    onClick={() =>
                      (window.location.href =
                        "tel:+919876543210")
                    }
                  >
                    ☎ Call
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      window.open(
                        "https://wa.me/919876543210",
                        "_blank"
                      )
                    }
                  >
                    ◉ WhatsApp
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      router.push("/chat")
                    }
                  >
                    ◌ Chat
                  </button>

                </div>

              </article>

            )
          )}

        </section>

      </div>


      {/* =========================
          BOTTOM NAV
      ========================= */}

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

        <Link href="/status">
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