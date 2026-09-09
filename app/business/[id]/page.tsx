"use client";

import Link from "next/link";
import { useState } from "react";
import { useEffect } from "react";
import { useParams } from "next/navigation";
import { supabase } from "../../lib/supabase";

export default function BusinessProfilePage() {
  const params = useParams<{ id: string }>();
  const businessId = String(params.id);
  const [tab, setTab] = useState("Overview");
  const [expanded, setExpanded] = useState(false);
  const [business, setBusiness] = useState({
    business_name: "Spice Hub Restaurant",
    category: "Restaurant • North Indian • Chinese",
    city: "Lucknow",
    area: "Gomti Nagar",
    address: "Gomti Nagar, Lucknow",
    description: "Delicious food, great ambience and unforgettable experiences. Visit Spice Hub for the best dining in Lucknow.",
    image_url: "",
    phone: "+919876543210",
  });

  useEffect(() => {
    let mounted = true;

    async function loadBusiness() {
      if (!supabase || !businessId) return;

      const { data } = await supabase
        .from("businesses")
        .select("business_name, category, city, area, address, description, short_description, image_url, phone")
        .eq("id", businessId)
        .maybeSingle();

      if (!mounted || !data) return;

      setBusiness((current) => ({
        ...current,
        business_name: data.business_name || current.business_name,
        category: data.category || current.category,
        city: data.city || current.city,
        area: data.area || current.area,
        address: data.address || data.area || current.address,
        description: data.description || data.short_description || current.description,
        image_url: data.image_url || current.image_url,
        phone: data.phone || current.phone,
      }));
    }

    loadBusiness();
    return () => {
      mounted = false;
    };
  }, [businessId]);

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

        <div
          className="lp-cover-image"
          style={business.image_url ? { backgroundImage: `url("${business.image_url}")` } : undefined}
        />

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
              {business.business_name}
              <span className="lp-verified">
                ✓
              </span>
            </h1>

            <p>
              ⌖ {business.category}
            </p>

            <p>
              ⌖ {business.address || `${business.area}, ${business.city}`}
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
                `tel:${business.phone}`)
            }
          >
            <span>☎</span>
            <small>Call</small>
          </button>

          <button
            onClick={() =>
              window.open(
                `https://wa.me/${business.phone.replace(/\D/g, "")}`,
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
                `https://maps.google.com/?q=${encodeURIComponent(
                  business.address || `${business.area}, ${business.city}`,
                )}`,
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

            <p className={`lp-about ${expanded ? "expanded" : ""}`}>
              {business.description}
            </p>

            <button className="lp-read-more" onClick={() => setExpanded((value) => !value)}>
              {expanded ? "Show Less" : "Read More"}
            </button>


            <div className="lp-info-box">

              <div>
                <span>⌖</span>

                <div>
                  <strong>Address</strong>
                  <small>
                    {business.address || `${business.area}, ${business.city}`}
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
