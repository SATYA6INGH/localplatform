"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "../lib/supabase";

export default function ProfilePage() {
  const router = useRouter();
  const [email, setEmail] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [savedOpen, setSavedOpen] = useState(false);

  useEffect(() => {
    let mounted = true;

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!mounted) return;
      setEmail(session?.user?.email ?? null);
      setUserId(session?.user?.id ?? null);
      setLoading(false);
    });

    const { data } = supabase.auth.onAuthStateChange((_event, session) => {
      setEmail(session?.user?.email ?? null);
      setUserId(session?.user?.id ?? null);
    });

    return () => {
      mounted = false;
      data.subscription.unsubscribe();
    };
  }, []);

  async function handleLogout() {
    await supabase.auth.signOut();
    router.replace("/profile");
  }

  const initials = email ? email.slice(0, 1).toUpperCase() : "?";
  const displayName = email ? email.split("@")[0] : "Guest";

  return (
    <main className="lp-mobile-app lp-profile-v2">
      {/* Gradient Header */}
      <div className="lp-profile-hero">
        <div className="lp-profile-hero-top">
          <div>
            <h1>My Profile</h1>
            <p>Your local discovery space</p>
          </div>
          {email ? (
            <button onClick={handleLogout} className="lp-profile-logout-btn">
              Logout
            </button>
          ) : (
            <Link href="/login" className="lp-profile-login-btn">
              Login
            </Link>
          )}
        </div>

        <div className="lp-profile-identity">
          <div className="lp-profile-avatar-ring">
            <div className="lp-profile-avatar">{initials}</div>
          </div>
          <div className="lp-profile-identity-text">
            <h2>{loading ? "…" : displayName}</h2>
            <p>{email ? email : "Sign in to save places & chat"}</p>
            {email && <span className="lp-profile-badge">Verified account</span>}
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="lp-profile-stats">
        <div className="lp-profile-stat">
          <strong>0</strong>
          <span>Saved</span>
        </div>
        <div className="lp-profile-stat">
          <strong>0</strong>
          <span>Following</span>
        </div>
        <div className="lp-profile-stat">
          <strong>0</strong>
          <span>Activity</span>
        </div>
      </div>

      {/* Saved businesses */}
      <section className="lp-profile-card">
        <div className="lp-profile-card-head">
          <h3>Saved businesses</h3>
          <button onClick={() => setSavedOpen((v) => !v)}>
            {savedOpen ? "Hide" : "View"}
          </button>
        </div>
        {savedOpen ? (
          <div className="lp-profile-empty">
            <div className="lp-profile-empty-icon">♡</div>
            <strong>No saved businesses yet</strong>
            <p>Businesses you save will appear here for quick access.</p>
            <Link href="/search" className="lp-profile-empty-cta">
              Explore nearby
            </Link>
          </div>
        ) : (
          <p className="lp-profile-hint">Your saved listings will stay here.</p>
        )}
      </section>

      {/* Quick settings */}
      <section className="lp-profile-card">
        <h3 className="lp-profile-card-title">Quick settings</h3>
        <div className="lp-profile-settings">
          <button className="lp-profile-setting-row">
            <span className="lp-profile-setting-icon loc">⌖</span>
            <div>
              <strong>Location</strong>
              <small>Choose city while searching</small>
            </div>
            <span className="lp-profile-chevron">›</span>
          </button>
          <button className="lp-profile-setting-row">
            <span className="lp-profile-setting-icon help">?</span>
            <div>
              <strong>Help & Support</strong>
              <small>Contact us anytime</small>
            </div>
            <span className="lp-profile-chevron">›</span>
          </button>
          {email && (
            <Link href="/dashboard" className="lp-profile-setting-row">
              <span className="lp-profile-setting-icon dash">▣</span>
              <div>
                <strong>Business Dashboard</strong>
                <small>Manage your listings</small>
              </div>
              <span className="lp-profile-chevron">›</span>
            </Link>
          )}
        </div>
      </section>

      {/* CTA */}
      <Link href="/list-business" className="lp-profile-cta">
        <span className="lp-profile-cta-icon">🏪</span>
        <div>
          <strong>List your business</strong>
          <small>Reach local customers for free</small>
        </div>
        <span className="lp-profile-cta-arrow">→</span>
      </Link>

      {/* Bottom Nav */}
      <nav className="lp-bottom-nav">
        <Link href="/">
          <span>⌂</span>
          <small>Home</small>
        </Link>
        <Link href="/search">
          <span>⌕</span>
          <small>Explore</small>
        </Link>
        <Link href="/status">
          <span>⊙</span>
          <small>Status</small>
        </Link>
        <Link href="/chat">
          <span>◌</span>
          <small>Chat</small>
        </Link>
        <Link href="/profile" className="active">
          <span>♙</span>
          <small>Profile</small>
        </Link>
      </nav>
    </main>
  );
}