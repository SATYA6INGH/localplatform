"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { getBusinessIcon } from "../lib/business-images";
import { supabase } from "../lib/supabase";

type Business = { id: string; business_name: string; category: string | null; image_url: string | null; owner_id: string | null };
type StatusRow = { id: string; author_id: string; business_id: string | null; body: string; media_url: string | null; expires_at: string; created_at: string };
type StatusItem = StatusRow & { business: Business | null; liked: boolean; likes: number; replies: number };

function age(value: string) {
  const minutes = Math.max(1, Math.floor((Date.now() - new Date(value).getTime()) / 60000));
  if (minutes < 60) return `${minutes}m ago`;
  if (minutes < 1440) return `${Math.floor(minutes / 60)}h ago`;
  return "Today";
}

export default function StatusPage() {
  const [userId, setUserId] = useState<string | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [items, setItems] = useState<StatusItem[]>([]);
  const [activeTab, setActiveTab] = useState<"All" | "Business">("All");
  const [body, setBody] = useState("");
  const [mediaUrl, setMediaUrl] = useState("");
  const [businessId, setBusinessId] = useState("");
  const [replyDrafts, setReplyDrafts] = useState<Record<string, string>>({});
  const [composerOpen, setComposerOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState("");

  const loadStatuses = useCallback(async () => {
    const now = new Date().toISOString();
    const { data: rows, error } = await supabase.from("statuses").select("id,author_id,business_id,body,media_url,expires_at,created_at").gt("expires_at", now).order("created_at", { ascending: false });
    if (error) {
      setItems([]);
      setNotice("Status database is not ready yet. Apply supabase/realtime.sql once in Supabase.");
      return;
    }
    const raw = (rows ?? []) as StatusRow[];
    const businessIds = [...new Set(raw.flatMap((row) => row.business_id ? [row.business_id] : []))];
    const { data: businessRows } = businessIds.length ? await supabase.from("businesses").select("id,business_name,category,image_url,owner_id").in("id", businessIds) : { data: [] as Business[] };
    const businessMap = new Map((businessRows as Business[]).map((business) => [String(business.id), business]));
    const statusIds = raw.map((row) => row.id);
    const { data: reactions } = statusIds.length ? await supabase.from("status_reactions").select("status_id,user_id").in("status_id", statusIds) : { data: [] as Array<{ status_id: string; user_id: string }> };
    const { data: replies } = statusIds.length ? await supabase.from("status_replies").select("status_id").in("status_id", statusIds) : { data: [] as Array<{ status_id: string }> };
    const reactionRows = (reactions ?? []) as Array<{ status_id: string; user_id: string }>;
    const replyRows = (replies ?? []) as Array<{ status_id: string }>;
    setItems(raw.map((row) => ({
      ...row,
      business: row.business_id ? businessMap.get(String(row.business_id)) ?? null : null,
      liked: Boolean(userId && reactionRows.some((reaction) => reaction.status_id === row.id && reaction.user_id === userId)),
      likes: reactionRows.filter((reaction) => reaction.status_id === row.id).length,
      replies: replyRows.filter((reply) => reply.status_id === row.id).length,
    })));
  }, [userId]);

  useEffect(() => {
    let mounted = true;
    supabase.auth.getSession().then(({ data: { session } }) => { if (mounted) { setUserId(session?.user?.id ?? null); setAuthLoading(false); } });
    const { data } = supabase.auth.onAuthStateChange((_event, session) => { setUserId(session?.user?.id ?? null); setAuthLoading(false); });
    return () => { mounted = false; data.subscription.unsubscribe(); };
  }, []);

  useEffect(() => {
    // Realtime data is loaded after mount and refreshed by channel callbacks.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void loadStatuses();
    const channel = supabase.channel("localplatform-status").on("postgres_changes", { event: "*", schema: "public", table: "statuses" }, () => void loadStatuses()).on("postgres_changes", { event: "*", schema: "public", table: "status_reactions" }, () => void loadStatuses()).on("postgres_changes", { event: "*", schema: "public", table: "status_replies" }, () => void loadStatuses()).subscribe();
    return () => { void supabase.removeChannel(channel); };
  }, [loadStatuses]);

  useEffect(() => {
    // Owner businesses are loaded from the authenticated Supabase session.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (!userId) { setBusinesses([]); return; }
    supabase.from("businesses").select("id,business_name,category,image_url,owner_id").eq("owner_id", userId).eq("listing_status", "active").order("business_name").then(({ data }) => setBusinesses((data ?? []) as Business[]));
  }, [userId]);

  const visibleItems = useMemo(() => activeTab === "Business" ? items.filter((item) => Boolean(item.business_id)) : items, [activeTab, items]);
  const people = useMemo(() => items.reduce<StatusItem[]>((result, item) => result.some((entry) => (entry.business_id ?? entry.author_id) === (item.business_id ?? item.author_id)) ? result : [...result, item], []), [items]);

  async function createStatus() {
    const text = body.trim();
    if (!userId || !text || text.length > 500 || busy) return;
    if (mediaUrl && !/^https?:\/\//i.test(mediaUrl.trim())) { setNotice("Visual URL must start with http:// or https://."); return; }
    setBusy(true); setNotice("");
    const { error } = await supabase.from("statuses").insert({ author_id: userId, business_id: businessId || null, body: text, media_url: mediaUrl.trim() || null, expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() });
    if (error) setNotice(error.code === "42501" ? "You can only post for your own business." : "Status could not be created.");
    else { setBody(""); setMediaUrl(""); setBusinessId(""); setComposerOpen(false); await loadStatuses(); }
    setBusy(false);
  }

  async function toggleLike(item: StatusItem) {
    if (!userId) { setNotice("Login to react to a status."); return; }
    if (item.liked) await supabase.from("status_reactions").delete().eq("status_id", item.id).eq("user_id", userId);
    else await supabase.from("status_reactions").upsert({ status_id: item.id, user_id: userId, reaction: "like" }, { onConflict: "status_id,user_id" });
    await loadStatuses();
  }

  async function reply(item: StatusItem) {
    if (!userId) { setNotice("Login to reply to a status."); return; }
    const text = (replyDrafts[item.id] ?? "").trim();
    if (!text || text.length > 500) return;
    const { error } = await supabase.from("status_replies").insert({ status_id: item.id, user_id: userId, body: text });
    if (error) setNotice("Reply could not be sent.");
    else { setReplyDrafts((drafts) => ({ ...drafts, [item.id]: "" })); await loadStatuses(); }
  }

  async function deleteStatus(item: StatusItem) {
    if (item.author_id !== userId) return;
    const { error } = await supabase.from("statuses").delete().eq("id", item.id).eq("author_id", userId);
    if (error) setNotice("Only the author can delete this status.");
    else await loadStatuses();
  }

  return (
    <main className="lp-status-page">
      <header className="lp-status-header"><div><h1>Status</h1><p>Real updates that expire after 24 hours</p></div><button className="lp-status-search" onClick={() => setComposerOpen((open) => !open)} aria-label="Create status">＋</button></header>
      {notice && <p className="lp-inline-notice">{notice}</p>}
      {userId && composerOpen && <section className="lp-status-composer"><textarea maxLength={500} value={body} onChange={(event) => setBody(event.target.value)} placeholder="Share an update…" /><select value={businessId} onChange={(event) => setBusinessId(event.target.value)}><option value="">Personal status</option>{businesses.map((business) => <option value={business.id} key={business.id}>{business.business_name}</option>)}</select><input value={mediaUrl} onChange={(event) => setMediaUrl(event.target.value)} placeholder="Optional visual URL (your own upload)" inputMode="url" /><button disabled={busy || !body.trim()} onClick={() => void createStatus()}>{busy ? "Posting…" : "Post for 24 hours"}</button></section>}
      <section className="lp-status-users-section"><div className="lp-status-users"><button className="lp-status-user" onClick={() => { if (!userId) setNotice("Login to add your status."); else setComposerOpen(true); }}><div className="lp-status-user-ring own"><span>＋</span><b>+</b></div><strong>Your Status</strong><small>{userId ? "Add update" : "Login first"}</small></button>{people.map((item) => <button className="lp-status-user" key={item.id} onClick={() => document.getElementById(`status-${item.id}`)?.scrollIntoView({ behavior: "smooth" })}><div className="lp-status-user-ring"><span>{getBusinessIcon(item.business?.category)}</span></div><strong>{item.business?.business_name ?? "Community member"}</strong><small>{age(item.created_at)}</small></button>)}</div></section>
      <div className="lp-status-tabs">{(["All", "Business"] as const).map((tab) => <button key={tab} className={activeTab === tab ? "active" : ""} onClick={() => setActiveTab(tab)}>{tab}</button>)}</div>
      <section className="lp-status-feed">{authLoading ? <div className="lp-empty-profile"><span>⊙</span><h3>Loading statuses…</h3></div> : visibleItems.map((item) => <article id={`status-${item.id}`} key={item.id} className="lp-status-card"><div className="lp-status-card-header"><div className="lp-status-avatar">{getBusinessIcon(item.business?.category)}</div><div className="lp-status-author"><strong>{item.business?.business_name ?? "Community member"}</strong><small>{age(item.created_at)} · expires in 24h</small></div>{item.author_id === userId && <button onClick={() => void deleteStatus(item)} aria-label="Delete your status">×</button>}</div><div className={`lp-status-image ${item.media_url ? "has-image" : "no-image"}`} style={item.media_url ? { backgroundImage: `url("${item.media_url}")` } : undefined}><div className="lp-status-image-overlay"><p>{item.body}</p></div></div><div className="lp-status-actions"><button className={item.liked ? "selected" : ""} onClick={() => void toggleLike(item)}> {item.liked ? "♥" : "♡"}<small>{item.likes}</small></button><button onClick={() => document.getElementById(`reply-${item.id}`)?.focus()}>◌<small>{item.replies}</small></button><button onClick={() => { if (navigator.share) void navigator.share({ title: item.business?.business_name ?? "LocalPlatform status", text: item.body }); }}>↗<small>Share</small></button><Link href={item.business_id ? `/business/${item.business_id}` : "/profile"}>⌂<small>Open</small></Link></div><div className="lp-status-reply"><input id={`reply-${item.id}`} maxLength={500} value={replyDrafts[item.id] ?? ""} onChange={(event) => setReplyDrafts((drafts) => ({ ...drafts, [item.id]: event.target.value }))} placeholder="Reply to this status…" /><button onClick={() => void reply(item)} disabled={!replyDrafts[item.id]?.trim()}>Send</button></div></article>)}{!authLoading && visibleItems.length === 0 && <div className="lp-empty-profile"><span>⊙</span><h3>No active statuses yet</h3><p>Updates posted by real members will appear here for 24 hours.</p></div>}</section>
      <nav className="lp-bottom-nav"><Link href="/"><span>⌂</span><small>Home</small></Link><Link href="/search"><span>⌕</span><small>Explore</small></Link><Link className="active" href="/status"><span>⊙</span><small>Status</small></Link><Link href="/chat"><span>◌</span><small>Chat</small></Link><Link href="/profile"><span>♙</span><small>Profile</small></Link></nav>
    </main>
  );
}
