"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { getBusinessIcon } from "../lib/business-images";
import { supabase } from "../lib/supabase";

type BusinessSummary = {
  id: string;
  business_name: string;
  category: string | null;
  image_url: string | null;
  owner_id: string | null;
};

type Conversation = {
  id: string;
  business_id: string;
  customer_id: string;
  updated_at: string;
  business: BusinessSummary;
  lastMessage: string;
  lastMessageAt: string | null;
  unread: number;
};

type Message = {
  id: string;
  conversation_id: string;
  sender_id: string;
  body: string;
  created_at: string;
  read_at: string | null;
};

function formatTime(value: string | null) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
}

export default function ChatPage() {
  const [requestedBusinessId, setRequestedBusinessId] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [notice, setNotice] = useState("");

  const loadConversations = useCallback(async (currentUserId: string) => {
    setLoading(true);
    const { data: rows, error } = await supabase
      .from("chat_conversations")
      .select("id,business_id,customer_id,updated_at")
      .order("updated_at", { ascending: false });

    if (error) {
      setConversations([]);
      setNotice("Chat database is not ready yet. Apply supabase/realtime.sql once in Supabase.");
      setLoading(false);
      return;
    }

    const conversationRows = (rows ?? []) as Array<{ id: string; business_id: string; customer_id: string; updated_at: string }>;
    const businessIds = [...new Set(conversationRows.map((row) => row.business_id))];
    if (!businessIds.length) {
      setConversations([]);
      setLoading(false);
      return;
    }

    const { data: businesses } = await supabase
      .from("businesses")
      .select("id,business_name,category,image_url,owner_id")
      .in("id", businessIds);
    const businessMap = new Map(((businesses ?? []) as BusinessSummary[]).map((business) => [String(business.id), business]));
    const ids = conversationRows.map((row) => row.id);
    const { data: messageRows } = await supabase
      .from("chat_messages")
      .select("id,conversation_id,sender_id,body,created_at,read_at")
      .in("conversation_id", ids)
      .order("created_at", { ascending: false })
      .limit(500);
    const messagesByConversation = new Map<string, Message[]>();
    for (const item of (messageRows ?? []) as Message[]) {
      const existing = messagesByConversation.get(item.conversation_id) ?? [];
      existing.push(item);
      messagesByConversation.set(item.conversation_id, existing);
    }

    const next = conversationRows.flatMap<Conversation>((row) => {
      const business = businessMap.get(String(row.business_id));
      if (!business) return [];
      const threadMessages = messagesByConversation.get(row.id) ?? [];
      const latest = threadMessages[0];
      return [{
        ...row,
        business,
        lastMessage: latest?.body ?? "No messages yet",
        lastMessageAt: latest?.created_at ?? row.updated_at,
        unread: threadMessages.filter((item) => item.sender_id !== currentUserId && !item.read_at).length,
      } satisfies Conversation];
    });

    setConversations(next);
    setSelectedId((current) => current && next.some((item) => item.id === current) ? current : next[0]?.id ?? null);
    setLoading(false);
  }, []);

  useEffect(() => {
    // Read the optional business deep-link after hydration to keep static builds safe.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setRequestedBusinessId(new URLSearchParams(window.location.search).get("business"));
  }, []);

  useEffect(() => {
    let mounted = true;
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!mounted) return;
      setUserId(session?.user?.id ?? null);
      setAuthLoading(false);
    });
    const { data } = supabase.auth.onAuthStateChange((_event, session) => {
      setUserId(session?.user?.id ?? null);
      setAuthLoading(false);
    });
    return () => { mounted = false; data.subscription.unsubscribe(); };
  }, []);

  useEffect(() => {
    // Data loading is intentionally started by the effect; state updates happen asynchronously.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (userId) void loadConversations(userId);
    else { setConversations([]); setLoading(false); }
  }, [userId, loadConversations]);

  useEffect(() => {
    if (!userId || !requestedBusinessId) return;
    let cancelled = false;
    async function ensureConversation() {
      const { data: business } = await supabase.from("businesses").select("id,business_name,category,image_url,owner_id").eq("id", requestedBusinessId).maybeSingle();
      if (!business || cancelled) return;
      const existing = conversations.find((item) => item.business_id === requestedBusinessId);
      if (existing) { setSelectedId(existing.id); return; }
      const { data: created, error } = await supabase.from("chat_conversations").insert({ business_id: requestedBusinessId, customer_id: userId }).select("id,business_id,customer_id,updated_at").single();
      if (!error && created && !cancelled) {
        setConversations((items) => [{ ...(created as Conversation), business: business as BusinessSummary, lastMessage: "No messages yet", lastMessageAt: created.updated_at, unread: 0 }, ...items]);
        setSelectedId(created.id);
      }
    }
    void ensureConversation();
    return () => { cancelled = true; };
  }, [requestedBusinessId, userId, conversations]);

  useEffect(() => {
    // Clear stale messages when the selected conversation changes.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (!selectedId || !userId) { setMessages([]); return; }
    let mounted = true;
    async function loadMessages() {
      const { data, error } = await supabase.from("chat_messages").select("id,conversation_id,sender_id,body,created_at,read_at").eq("conversation_id", selectedId).order("created_at", { ascending: true });
      if (mounted) {
        if (error) setNotice("Messages could not be loaded. Check the realtime schema and RLS policies.");
        setMessages((data ?? []) as Message[]);
      }
      await supabase.from("chat_messages").update({ read_at: new Date().toISOString() }).eq("conversation_id", selectedId).neq("sender_id", userId).is("read_at", null);
      if (mounted) setConversations((items) => items.map((item) => item.id === selectedId ? { ...item, unread: 0 } : item));
    }
    void loadMessages();
    const channel = supabase.channel(`chat-messages-${selectedId}`).on("postgres_changes", { event: "INSERT", schema: "public", table: "chat_messages", filter: `conversation_id=eq.${selectedId}` }, (payload) => {
      const incoming = payload.new as Message;
      setMessages((items) => items.some((item) => item.id === incoming.id) ? items : [...items, incoming]);
      if (incoming.sender_id !== userId) void supabase.from("chat_messages").update({ read_at: new Date().toISOString() }).eq("id", incoming.id);
    }).subscribe();
    return () => { mounted = false; void supabase.removeChannel(channel); };
  }, [selectedId, userId]);

  useEffect(() => {
    if (!userId) return;
    const channel = supabase.channel(`chat-conversations-${userId}`).on("postgres_changes", { event: "*", schema: "public", table: "chat_conversations" }, () => void loadConversations(userId)).subscribe();
    return () => { void supabase.removeChannel(channel); };
  }, [userId, loadConversations]);

  const filtered = useMemo(() => conversations.filter((item) => item.business.business_name.toLowerCase().includes(query.trim().toLowerCase())), [conversations, query]);
  const selected = conversations.find((item) => item.id === selectedId) ?? null;

  async function sendMessage() {
    const body = message.trim();
    if (!userId || !selected || !body || body.length > 2000 || sending) return;
    setSending(true); setNotice("");
    const { error } = await supabase.from("chat_messages").insert({ conversation_id: selected.id, sender_id: userId, body });
    if (error) setNotice(error.code === "42501" ? "You are not allowed to send in this chat." : "Message could not be sent.");
    else setMessage("");
    setSending(false);
  }

  return (
    <main className="lp-mobile-app lp-chat-page">
      <header className="lp-chat-header"><div><h1>Chat</h1><p>Private conversations with real businesses</p></div><Link className="lp-chat-compose" href="/search" aria-label="Start a new chat">＋</Link></header>
      {notice && <p className="lp-inline-notice">{notice}</p>}
      {authLoading ? <div className="lp-chat-empty">Loading secure chat…</div> : !userId ? <div className="lp-empty-profile"><span>◌</span><h3>Sign in to use chat</h3><p><Link href="/login">Login or create an account</Link> to message a business.</p></div> : <>
        <label className="lp-chat-search"><span>⌕</span><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search conversations" /></label>
        <section className="lp-chat-layout">
          <div className="lp-conversation-list"><div className="lp-chat-list-title">Your conversations</div>{loading ? <p className="lp-chat-empty">Loading…</p> : filtered.map((chat) => <button key={chat.id} className={`lp-conversation ${chat.id === selectedId ? "active" : ""}`} onClick={() => setSelectedId(chat.id)}><span className="lp-conversation-avatar">{getBusinessIcon(chat.business.category)}<i /></span><span className="lp-conversation-copy"><strong>{chat.business.business_name}</strong><small>{chat.lastMessage}</small></span><span className="lp-conversation-meta"><small>{formatTime(chat.lastMessageAt)}</small>{chat.unread > 0 && <b>{chat.unread}</b>}</span></button>)}{!loading && filtered.length === 0 && <p className="lp-chat-empty">No conversations yet. Open a business and tap Chat.</p>}</div>
          {selected ? <section className="lp-chat-preview"><div className="lp-chat-preview-header"><span className="lp-conversation-avatar">{getBusinessIcon(selected.business.category)}<i /></span><div><strong>{selected.business.business_name}</strong><small>{selected.business.category || "Local business"}</small></div><Link href={`/business/${selected.business.id}`} aria-label="Open business">⌄</Link></div><div className="lp-message-thread"><span className="lp-date-divider">Conversation</span>{messages.length === 0 && <p className="lp-chat-empty">No messages yet. Say hello.</p>}{messages.map((item) => <p className={`lp-message ${item.sender_id === userId ? "outgoing" : "incoming"}`} key={item.id}>{item.body}<small>{formatTime(item.created_at)}</small></p>)}</div><div className="lp-message-input"><input maxLength={2000} value={message} onChange={(event) => setMessage(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter") void sendMessage(); }} placeholder="Write a message…" /><button disabled={sending || !message.trim()} onClick={() => void sendMessage()} aria-label="Send message">➤</button></div></section> : <div className="lp-chat-preview lp-chat-empty">Select a conversation to view messages.</div>}
        </section>
      </>}
      <nav className="lp-bottom-nav"><Link href="/"><span>⌂</span><small>Home</small></Link><Link href="/search"><span>⌕</span><small>Explore</small></Link><Link href="/status"><span>⊙</span><small>Status</small></Link><Link className="active" href="/chat"><span>◌</span><small>Chat</small></Link><Link href="/profile"><span>♙</span><small>Profile</small></Link></nav>
    </main>
  );
}
