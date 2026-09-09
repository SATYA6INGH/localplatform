"use client";

import Link from "next/link";
import { useState } from "react";

const businesses = [
  {
    id: 1,
    name: "Spice Hub Restaurant",
    category: "Restaurant",
    area: "Gomti Nagar, Lucknow",
    rating: "4.8",
    reviews: "320",
    image:
      "https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=600&q=85",
    offer: "20% OFF All Combos",
    open: true,
  },
  {
    id: 2,
    name: "The Urban Cafe",
    category: "Cafe",
    area: "Hazratganj, Lucknow",
    rating: "4.6",
    reviews: "210",
    image:
      "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&w=600&q=85",
    offer: "Free Coffee",
    open: true,
  },
  {
    id: 3,
    name: "Royal Biryani House",
    category: "Restaurant",
    area: "Aliganj, Lucknow",
    rating: "4.7",
    reviews: "480",
    image:
      "https://images.unsplash.com/photo-1563379091339-03246963d96c?auto=format&fit=crop&w=600&q=85",
    offer: "Buy 1 Get 1",
    open: true,
  },
  {
    id: 4,
    name: "City Salon",
    category: "Salon",
    area: "Aliganj, Lucknow",
    rating: "4.7",
    reviews: "180",
    image:
      "https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=600&q=85",
    offer: "30% OFF",
    open: true,
  },
];

const filters = [
  "Sort",
  "Open Now",
  "Top Rated",
  "Offers",
];

export default function SearchPage() {
  const [query, setQuery] = useState("");
  const [activeFilter, setActiveFilter] =
    useState("Sort");

  const filtered = businesses.filter((business) =>
    `${business.name} ${business.category} ${business.area}`
      .toLowerCase()
      .includes(query.toLowerCase())
  );

  return (
    <main className="lp-explore-page">

      {/* HEADER */}

      <header className="lp-explore-header">

        <Link href="/" className="lp-back">
          ‹
        </Link>

        <div>
          <h1>Explore Near You</h1>
          <p>⌖ Lucknow</p>
        </div>

        <button className="lp-explore-search">
          ⌕
        </button>

      </header>


      {/* SEARCH */}

      <div className="lp-explore-searchbox">

        <span>⌕</span>

        <input
          value={query}
          onChange={(e) =>
            setQuery(e.target.value)
          }
          placeholder="Search businesses, services..."
        />

        {query && (
          <button
            onClick={() => setQuery("")}
          >
            ×
          </button>
        )}

      </div>


      {/* FILTERS */}

      <div className="lp-filter-scroll">

        {filters.map((filter) => (

          <button
            key={filter}
            className={
              activeFilter === filter
                ? "active"
                : ""
            }
            onClick={() =>
              setActiveFilter(filter)
            }
          >
            {filter}
            {filter === "Sort" && " ⌄"}
          </button>

        ))}

      </div>


      {/* RESULT HEADER */}

      <section className="lp-result-head">

        <div>
          <h2>
            Businesses Near You
          </h2>

          <p>
            {filtered.length} places found
          </p>
        </div>

        <button>
          ☷
        </button>

      </section>


      {/* BUSINESS LIST */}

      <section className="lp-result-list">

        {filtered.map((business) => (

          <article
            key={business.id}
            className="lp-result-card"
          >

            <Link
              href={`/business/${business.id}`}
              className="lp-result-main"
            >

              <div
                className="lp-result-image"
                style={{
                  backgroundImage:
                    `url("${business.image}")`,
                }}
              >

                <span
                  className={
                    business.open
                      ? "lp-result-open"
                      : "lp-result-closed"
                  }
                >
                  {business.open
                    ? "Open Now"
                    : "Closed"}
                </span>

              </div>


              <div className="lp-result-info">

                <div className="lp-result-title">

                  <h3>
                    {business.name}
                  </h3>

                  <span>♡</span>

                </div>


                <div className="lp-result-rating">

                  <strong>
                    ★ {business.rating}
                  </strong>

                  <small>
                    ({business.reviews})
                  </small>

                </div>


                <p>
                  {business.category}
                </p>

                <p>
                  ⌖ {business.area}
                </p>


                <div className="lp-result-offer">
                  ♥ {business.offer}
                </div>

              </div>

            </Link>


            {/* ACTIONS */}

            <div className="lp-result-actions">

              <button
                onClick={() =>
                  (window.location.href =
                    "tel:+919876543210")
                }
              >
                ☎ Call
              </button>

              <button
                onClick={() =>
                  window.open(
                    "https://wa.me/919876543210",
                    "_blank"
                  )
                }
              >
                ◉ WhatsApp
              </button>

              <Link href="/chat">
                ◌ Chat
              </Link>

            </div>

          </article>

        ))}


        {filtered.length === 0 && (

          <div className="lp-no-result">

            <div>⌕</div>

            <h3>
              No businesses found
            </h3>

            <p>
              Try another business,
              service or location.
            </p>

          </div>

        )}

      </section>


      {/* BOTTOM NAV */}

      <nav className="lp-bottom-nav">

        <Link href="/">
          <span>⌂</span>
          <small>Home</small>
        </Link>

        <Link
          href="/search"
          className="active"
        >
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