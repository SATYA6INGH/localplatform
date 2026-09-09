"use client";

import Link from "next/link";
import { useState } from "react";
import { useEffect } from "react";
import { useParams } from "next/navigation";
import { supabase } from "../../lib/supabase";
import { getBusinessIcon, getBusinessImage } from "../../lib/business-images";

export default function BusinessProfilePage() {
  const params = useParams<{ id: string }>();
  const businessId = String(params.id);
  const [tab, setTab] = useState("Overview");
  const [expanded, setExpanded] = useState(false);
  const [business, setBusiness] = useState({
    business_name: "Business",
    category: "Local business",
    city: "",
    area: "",
    address: "",
    description: "Business description not added yet.",
    image_url: "",
    phone: "",
  });

  useEffect(() => {
    let mounted = true;

    async function loadBusiness() {
      if (!businessId) return;

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

  const coverImage = getBusinessImage(business.category, business.image_url);
  const businessIcon = getBusinessIcon(business.category);

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

        <div className={`lp-cover-image ${coverImage ? "has-image" : "no-image"}`} style={coverImage ? { backgroundImage: `url("${coverImage}")` } : undefined} />

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

        {/* BUSINESS LOGO */}

        <div className="lp-business-logo">
          {businessIcon}
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

            <p>⌖ {business.address || [business.area, business.city].filter(Boolean).join(", ") || "Address not added"}</p>

          </div>

          <button className="lp-profile-menu">
            ⋯
          </button>

        </div>


        <div className="lp-open-status">
          <b>Hours not added</b>
          <span>• Contact the business for availability</span>
        </div>


        {/* STATS */}

        <div className="lp-profile-stats">

          <div>
            <strong>0</strong>
            <small>Followers</small>
          </div>

          <div>
            <strong>0</strong>
            <small>Posts</small>
          </div>

          <div>
            <strong>—</strong>
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
                    {business.address || [business.area, business.city].filter(Boolean).join(", ") || "Address not added"}
                  </small>
                </div>
              </div>

              <div>
                <span>◷</span>

                <div>
                  <strong>Opening Hours</strong>
                  <small>
                    Not added yet
                  </small>
                </div>
              </div>

              <div>
                <span>₹</span>

                <div>
                  <strong>Price Range</strong>
                  <small>
                    Not added yet
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


        {tab === "Offers" && <div className="lp-empty-profile"><span>🏷</span><h3>No offers yet</h3><p>Offers added by this business will appear here.</p></div>}


        {tab === "Services" && (

          <div className="lp-empty-profile"><span>⌂</span><h3>No services added yet</h3><p>The owner can add services from the dashboard.</p></div>

        )}


        {tab === "Reviews" && (

          <div className="lp-review-summary"><strong>—</strong><span>No reviews yet</span><small>Ratings will appear after real customer reviews.</small></div>

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
