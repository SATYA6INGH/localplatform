"use client";

import { useState } from "react";
import Link from "next/link";

const savedBusinesses = [
  { name: "Spice Hub Restaurant", type: "Restaurant · Gomti Nagar", icon: "🍛", rating: "4.8" },
  { name: "Glow Beauty Salon", type: "Salon · Aliganj", icon: "💇", rating: "4.7" },
];

export default function ProfilePage() {
  const [saved, setSaved] = useState(true);
  return (
    <main className="lp-mobile-app lp-user-page">
      <header className="lp-user-header"><div><h1>My Profile</h1><p>Your local discovery space</p></div><button aria-label="Settings">⚙</button></header>
      <section className="lp-user-card"><div className="lp-user-avatar">A</div><div className="lp-user-copy"><h2>Alex Kumar</h2><p>Lucknow · Member since 2024</p></div><button className="lp-edit-profile">Edit</button></section>
      <div className="lp-user-stats"><div><strong>12</strong><small>Saved</small></div><div><strong>8</strong><small>Following</small></div><div><strong>24</strong><small>Activities</small></div></div>
      <section className="lp-user-section"><div className="lp-user-section-head"><h2>Saved businesses</h2><button onClick={() => setSaved(!saved)}>{saved ? "See All" : "Show Saved"}</button></div>{saved ? <div className="lp-saved-list">{savedBusinesses.map((business) => <Link className="lp-saved-item" href="/business/1" key={business.name}><span>{business.icon}</span><div><strong>{business.name}</strong><small>{business.type}</small></div><b>★ {business.rating}</b><i>›</i></Link>)}</div> : <div className="lp-profile-empty"><span>♡</span><strong>No saved businesses</strong><small>Save places you want to visit later.</small></div>}</section>
      <section className="lp-user-section"><h2>Quick settings</h2><div className="lp-settings-list"><button><span>⌖</span><div><strong>Location</strong><small>Lucknow</small></div><i>›</i></button><button><span>🔔</span><div><strong>Notifications</strong><small>Offers and updates</small></div><i>›</i></button><button><span>?</span><div><strong>Help &amp; Support</strong><small>We are here to help</small></div><i>›</i></button></div></section>
      <button className="lp-business-cta"><span>🏪</span><div><strong>List your business</strong><small>Reach more local customers</small></div><b>›</b></button>
      <nav className="lp-bottom-nav"><Link href="/"><span>⌂</span><small>Home</small></Link><Link href="/search"><span>⌕</span><small>Explore</small></Link><Link href="/status"><span>⊙</span><small>Status</small></Link><Link href="/chat"><span>◌</span><small>Chat</small></Link><Link className="active" href="/profile"><span>♙</span><small>Profile</small></Link></nav>
    </main>
  );
}
