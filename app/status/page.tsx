"use client";

import Link from "next/link";
import { useState } from "react";

const statusUsers = [
  {
    name: "Your Status",
    image: "👤",
    time: "",
    own: true,
  },
  {
    name: "Spice Hub",
    image: "🍛",
    time: "Online",
    online: true,
  },
  {
    name: "City Salon",
    image: "👩",
    time: "2h ago",
  },
  {
    name: "Care Life",
    image: "👩🏻",
    time: "5h ago",
  },
  {
    name: "FitzZone",
    image: "🏋️",
    time: "8h ago",
  },
  {
    name: "Narayan RMC",
    image: "🏗️",
    time: "Yesterday",
  },
];

const statusPosts = [
  {
    id: 1,
    name: "Spice Hub Restaurant",
    time: "2 hours ago",
    image:
      "https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=900&q=85",
    title: "Today's Special",
    offer: "20% OFF",
    text: "20% OFF on All Combos",
  },
  {
    id: 2,
    name: "City Salon",
    time: "5 hours ago",
    image:
      "https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=900&q=85",
    title: "Special Offer",
    offer: "30% OFF",
    text: "Flat 30% OFF on Hair Services",
  },
  {
    id: 3,
    name: "Narayan RMC",
    time: "Yesterday",
    image:
      "https://images.unsplash.com/photo-1503387762-592deb58ef4e?auto=format&fit=crop&w=900&q=85",
    title: "New Project",
    offer: "",
    text: "Construction & Civil Work",
  },
];

export default function StatusPage() {
  const [activeTab, setActiveTab] =
    useState("All");

  const tabs = [
    "All",
    "Following",
    "Nearby",
    "Business",
  ];

  return (
    <main className="lp-status-page">

      {/* HEADER */}

      <header className="lp-status-header">

        <div>
          <h1>Status</h1>
          <p>What&apos;s happening near you</p>
        </div>

        <button className="lp-status-search">
          ⌕
        </button>

      </header>


      {/* STATUS USERS */}

      <section className="lp-status-users-section">

        <div className="lp-status-users">

          {statusUsers.map((user) => (

            <button
              key={user.name}
              className="lp-status-user"
            >

              <div
                className={`
                  lp-status-user-ring
                  ${user.online ? "online" : ""}
                  ${user.own ? "own" : ""}
                `}
              >

                <span>
                  {user.image}
                </span>

                {user.own && (
                  <b>+</b>
                )}

                {user.online && (
                  <i />
                )}

              </div>

              <strong>
                {user.name}
              </strong>

              <small
                className={
                  user.online
                    ? "online-text"
                    : ""
                }
              >
                {user.own
                  ? "Add Status"
                  : user.time}
              </small>

            </button>

          ))}

        </div>

      </section>


      {/* FILTER TABS */}

      <div className="lp-status-tabs">

        {tabs.map((tab) => (

          <button
            key={tab}
            className={
              activeTab === tab
                ? "active"
                : ""
            }
            onClick={() =>
              setActiveTab(tab)
            }
          >
            {tab}
          </button>

        ))}

      </div>


      {/* STATUS FEED */}

      <section className="lp-status-feed">

        {statusPosts.map((post) => (

          <article
            key={post.id}
            className="lp-status-card"
          >

            {/* POST HEADER */}

            <div className="lp-status-card-header">

              <div className="lp-status-avatar">
                {post.name ===
                "Spice Hub Restaurant"
                  ? "🍛"
                  : post.name ===
                    "City Salon"
                  ? "👩"
                  : "🏗️"}
              </div>

              <div className="lp-status-author">

                <strong>
                  {post.name}
                </strong>

                <small>
                  {post.time}
                </small>

              </div>

              <button>
                ⋯
              </button>

            </div>


            {/* IMAGE */}

            <div
              className="lp-status-image"
              style={{
                backgroundImage:
                  `url("${post.image}")`,
              }}
            >

              <div className="lp-status-image-overlay">

                {post.title && (
                  <span>
                    {post.title}
                  </span>
                )}

                {post.offer && (
                  <strong>
                    {post.offer}
                  </strong>
                )}

                <p>
                  {post.text}
                </p>

              </div>

            </div>


            {/* ACTIONS */}

            <div className="lp-status-actions">

              <button>
                ♡
                <small>Like</small>
              </button>

              <Link href="/chat">
                ◌
                <small>Reply</small>
              </Link>

              <button>
                ↗
                <small>Share</small>
              </button>

              <button>
                🔖
                <small>Save</small>
              </button>

            </div>


            {/* REPLY */}

            <div className="lp-status-reply">

              <Link href="/chat">
                Reply to this status...
              </Link>

              <span>
                ♡
              </span>

            </div>

          </article>

        ))}

      </section>


      {/* BOTTOM NAV */}

      <nav className="lp-bottom-nav">

        <Link href="/">
          <span>⌂</span>
          <small>Home</small>
        </Link>

        <Link href="/search">
          <span>⌕</span>
          <small>Explore</small>
        </Link>

        <Link
          href="/status"
          className="active"
        >
          <span>⊙</span>
          <small>Status</small>
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
