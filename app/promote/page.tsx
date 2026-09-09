"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "../lib/supabase";

type Business = { id: string; business_name: string; category: string; city: string };

export default function PromotePage() {
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [businessId, setBusinessId] = useState("");
  const [title, setTitle] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let mounted = true;

    async function loadBusinesses() {
      if (!supabase) return;
      const { data: sessionData } = await supabase.auth.getSession();
      const user = sessionData.session?.user;
      if (!user) return;

      const { data } = await supabase
        .from("businesses")
        .select("id, business_name, category, city")
        .eq("owner_id", user.id)
        .order("business_name", { ascending: true });

      if (mounted) {
        setBusinesses((data || []) as Business[]);
        if (data?.[0]) setBusinessId(String(data[0].id));
      }
    }

    loadBusinesses();
    return () => {
      mounted = false;
    };
  }, []);

  async function submitRequest(event: FormEvent) {
    event.preventDefault();
    setError("");
    setMessage("");

    if (!supabase) {
      setError("Supabase configuration missing hai.");
      return;
    }

    const { data: sessionData } = await supabase.auth.getSession();
    const user = sessionData.session?.user;

    if (!user) {
      setError("Pehle business owner account se login karo.");
      return;
    }

    if (!businessId) {
      setError("Pehle apna business select karo.");
      return;
    }

    setSaving(true);
    const { error: insertError } = await supabase.from("home_ads").insert({
      business_id: businessId,
      owner_id: user.id,
      title: title.trim() || null,
      image_url: imageUrl.trim() || null,
      status: "pending",
    });
    setSaving(false);

    if (insertError) {
      setError(insertError.message);
      return;
    }

    setTitle("");
    setImageUrl("");
    setMessage("Banner request submit ho gayi. Payment verify hone ke baad admin banner approve karega.");
  }

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-6 text-slate-900 sm:px-6 sm:py-10">
      <div className="mx-auto max-w-2xl">
        <Link href="/dashboard" className="text-sm font-bold text-blue-600">← Dashboard</Link>
        <section className="mt-5 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-8">
          <p className="text-xs font-black uppercase tracking-[0.18em] text-orange-600">Premium visibility</p>
          <h1 className="mt-2 text-3xl font-black">Home par apna banner dikhayein</h1>
          <p className="mt-2 text-sm leading-6 text-slate-500">
            Small sponsored banner ke liye request bhejo. Admin payment verify karke approve karega, tab banner Home par live hoga.
          </p>

          <form onSubmit={submitRequest} className="mt-7 space-y-5">
            <label className="block text-sm font-bold">
              Business
              <select value={businessId} onChange={(event) => setBusinessId(event.target.value)} className="mt-2 h-12 w-full rounded-xl border border-slate-200 bg-white px-3 font-medium">
                <option value="">Select business</option>
                {businesses.map((business) => <option key={business.id} value={business.id}>{business.business_name} · {business.category}</option>)}
              </select>
            </label>

            <label className="block text-sm font-bold">
              Banner title
              <input value={title} onChange={(event) => setTitle(event.target.value)} placeholder="20% OFF — Visit us today" className="mt-2 h-12 w-full rounded-xl border border-slate-200 px-3 font-medium" />
            </label>

            <label className="block text-sm font-bold">
              Banner image URL (optional)
              <input value={imageUrl} onChange={(event) => setImageUrl(event.target.value)} placeholder="https://..." type="url" className="mt-2 h-12 w-full rounded-xl border border-slate-200 px-3 font-medium" />
            </label>

            <div className="rounded-2xl bg-amber-50 p-4 text-xs font-semibold leading-5 text-amber-800">
              Banner pricing/payment details admin approval ke time confirm karega. Automatic payment tab enable hoga jab payment gateway credentials configure honge.
            </div>

            {error && <p className="rounded-xl bg-red-50 p-3 text-sm font-semibold text-red-700">{error}</p>}
            {message && <p className="rounded-xl bg-emerald-50 p-3 text-sm font-semibold text-emerald-700">{message}</p>}

            <button disabled={saving} className="w-full rounded-xl bg-slate-950 py-3.5 text-sm font-black text-white disabled:opacity-60">
              {saving ? "Submitting..." : "Submit banner request"}
            </button>
          </form>
        </section>
      </div>
    </main>
  );
}
