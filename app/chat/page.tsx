"use client";

import { useMemo, useState } from "react";
import Link from "next/link";

const conversations = [
  { id: 1, name: "Spice Hub Restaurant", icon: "🍛", message: "Your table is confirmed for 8 PM.", time: "2m", unread: 2, online: true },
  { id: 2, name: "Glow Beauty Salon", icon: "💇", message: "We have an appointment slot tomorrow.", time: "1h", unread: 0, online: true },
  { id: 3, name: "Care Life Clinic", icon: "❤", message: "Please bring your previous reports.", time: "Yesterday", unread: 0, online: false },
];

export default function ChatPage() {
  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState(1);
  const [message, setMessage] = useState("");
  const [sent, setSent] = useState<string[]>([]);

  const filtered = useMemo(
    () => conversations.filter((chat) => chat.name.toLowerCase().includes(query.toLowerCase())),
    [query],
  );
  const selected = conversations.find((chat) => chat.id === selectedId) ?? conversations[0];

  const sendMessage = () => {
    const value = message.trim();
    if (!value) return;
    setSent((items) => [...items, value]);
    setMessage("");
  };

  return (
    <main className="lp-mobile-app lp-chat-page">
      <header className="lp-chat-header">
        <div><h1>Chat</h1><p>Connect with local businesses</p></div>
        <button className="lp-chat-compose" aria-label="New chat">＋</button>
      </header>

      <label className="lp-chat-search"><span>⌕</span><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search conversations" /></label>

      <section className="lp-chat-layout">
        <div className="lp-conversation-list">
          <div className="lp-chat-list-title">Recent conversations</div>
          {filtered.map((chat) => (
            <button key={chat.id} className={`lp-conversation ${chat.id === selectedId ? "active" : ""}`} onClick={() => setSelectedId(chat.id)}>
              <span className="lp-conversation-avatar">{chat.icon}<i className={chat.online ? "online" : ""} /></span>
              <span className="lp-conversation-copy"><strong>{chat.name}</strong><small>{chat.message}</small></span>
              <span className="lp-conversation-meta"><small>{chat.time}</small>{chat.unread > 0 && <b>{chat.unread}</b>}</span>
            </button>
          ))}
          {filtered.length === 0 && <p className="lp-chat-empty">No conversations found.</p>}
        </div>

        <section className="lp-chat-preview">
          <div className="lp-chat-preview-header"><span className="lp-conversation-avatar">{selected.icon}<i className={selected.online ? "online" : ""} /></span><div><strong>{selected.name}</strong><small>{selected.online ? "Online now" : "Replies within a day"}</small></div><Link href={`/business/${selected.id}`} aria-label="Open business">⌄</Link></div>
          <div className="lp-message-thread"><span className="lp-date-divider">Today</span><p className="lp-message incoming">Hi! How can we help you today?<small>7:56 PM</small></p><p className="lp-message outgoing">I would like to know about today&apos;s offer.<small>7:58 PM</small></p>{sent.map((item, index) => <p className="lp-message outgoing" key={`${item}-${index}`}>{item}<small>Now</small></p>)}</div>
          <div className="lp-message-input"><input value={message} onChange={(event) => setMessage(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter") sendMessage(); }} placeholder="Write a message..." /><button onClick={sendMessage} aria-label="Send message">➤</button></div>
        </section>
      </section>

      <nav className="lp-bottom-nav"><Link href="/"><span>⌂</span><small>Home</small></Link><Link href="/search"><span>⌕</span><small>Explore</small></Link><Link href="/status"><span>⊙</span><small>Status</small></Link><Link className="active" href="/chat"><span>◌</span><small>Chat</small></Link><Link href="/profile"><span>♙</span><small>Profile</small></Link></nav>
    </main>
  );
}
