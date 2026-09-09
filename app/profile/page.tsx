"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "../lib/supabase";

export default function ProfilePage() {
  const [email, setEmail] = useState<string | null>(null);
  const [savedOpen, setSavedOpen] = useState(false);

  useEffect(() => {
    let mounted = true;
    supabase.auth.getSession().then(({ data: { session } }) => { if (mounted) setEmail(session?.user?.email ?? null); });
    const { data } = supabase.auth.onAuthStateChange((_event, session) => setEmail(session?.user?.email ?? null));
    return () => { mounted = false; data.subscription.unsubscribe(); };
  }, []);

  const initials = email ? email.slice(0, 1).toUpperCase() : "?";
  return (
    <main className="lp-mobile-app lp-user-page">
      <header className="lp-user-header"><div><h1>My Profile</h1><p>Your local discovery space</p></div><Link href={email ? "/dashboard" : "/login"} className="lp-profile-login">{email ? "Dashboard" : "⇥ Login"}</Link></header>
      <section className="lp-user-card"><div className="lp-user-avatar">{initials}</div><div className="lp-user-copy"><h2>{email ?? "Guest"}</h2><p>{email ? "Signed in securely" : "Sign in to save places and chat"}</p></div>{!email && <Link href="/login" className="lp-edit-profile">Login</Link>}</section>
      <div className="lp-user-stats"><div><strong>0</strong><small>Saved</small></div><div><strong>0</strong><small>Following</small></div><div><strong>0</strong><small>Activities</small></div></div>
      <section className="lp-user-section"><div className="lp-user-section-head"><h2>Saved businesses</h2><button onClick={() => setSavedOpen((open) => !open)}>{savedOpen ? "Hide" : "View"}</button></div>{savedOpen ? <div className="lp-profile-empty"><span>♡</span><strong>No saved businesses</strong><small>Only businesses you save will appear here.</small></div> : <p className="lp-profile-helper">Your saved listings will stay here.</p>}</section>
      <section className="lp-user-section"><h2>Quick settings</h2><div className="lp-settings-list"><div><span>⌖</span><div><strong>Location</strong><small>Choose a location while searching</small></div></div><div><span>?</span><div><strong>Help &amp; Support</strong><small>Contact support from your account</small></div></div></div></section>
      <Link className="lp-business-cta" href="/list-business"><span>🏪</span><div><strong>List your business</strong><small>Reach local customers with a real listing</small></div><b>›</b></Link>
      <nav className="lp-bottom-nav"><Link href="/"><span>⌂</span><small>Home</small></Link><Link href="/search"><span>⌕</span><small>Explore</small></Link><Link href="/status"><span>⊙</span><small>Status</small></Link><Link href="/chat"><span>◌</span><small>Chat</small></Link><Link className="active" href="/profile"><span>♙</span><small>Profile</small></Link></nav>
    </main>
  );
}
