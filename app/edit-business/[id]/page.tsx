"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";

type BusinessForm = { business_name: string; category: string; city: string; area: string; address: string; description: string; image_url: string; phone: string };

export default function EditBusinessPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const businessId = String(params.id);
  const [form, setForm] = useState<BusinessForm>({ business_name: "", category: "", city: "", area: "", address: "", description: "", image_url: "", phone: "" });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;
    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.replace(`/login?next=/edit-business/${businessId}`); return; }
      const { data, error: loadError } = await supabase.from("businesses").select("business_name,category,city,area,address,description,short_description,image_url,phone,owner_id").eq("id", businessId).maybeSingle();
      if (!mounted) return;
      if (loadError || !data || data.owner_id !== user.id) { setError("Business nahi mila ya aap owner nahi hain."); setLoading(false); return; }
      setForm({ business_name: data.business_name ?? "", category: data.category ?? "", city: data.city ?? "", area: data.area ?? "", address: data.address ?? "", description: data.description ?? data.short_description ?? "", image_url: data.image_url ?? "", phone: data.phone ?? "" });
      setLoading(false);
    }
    void load();
    return () => { mounted = false; };
  }, [businessId, router]);

  function update(key: keyof BusinessForm, value: string) { setForm((current) => ({ ...current, [key]: value })); }

  async function save(event: React.FormEvent) {
    event.preventDefault();
    if (!form.business_name.trim() || !form.category.trim() || saving) return;
    if (form.image_url && !/^https?:\/\//i.test(form.image_url.trim())) { setError("Visual URL http:// ya https:// se start hona chahiye."); return; }
    setSaving(true); setError(""); setMessage("");
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setError("Session expire ho gaya. Dobara login karein."); setSaving(false); return; }
    const { error: saveError } = await supabase.from("businesses").update({ business_name: form.business_name.trim(), category: form.category.trim(), city: form.city.trim() || null, area: form.area.trim() || null, address: form.address.trim() || null, description: form.description.trim() || null, image_url: form.image_url.trim() || null, phone: form.phone.trim() || null }).eq("id", businessId).eq("owner_id", user.id);
    if (saveError) setError("Changes save nahi ho paaye.");
    else setMessage("Business profile updated.");
    setSaving(false);
  }

  return <main className="lp-mobile-app lp-profile-page"><header className="lp-search-header"><Link href={`/business/${businessId}`} className="lp-back-button">‹</Link><div><h1>Edit listing</h1><p>Only your business details and visual</p></div></header>{loading ? <div className="lp-empty-profile"><span>⌛</span><h3>Loading listing…</h3></div> : error && !form.business_name ? <div className="lp-empty-profile"><span>!</span><h3>{error}</h3><p><Link href="/dashboard">Back to dashboard</Link></p></div> : <form className="lp-edit-form" onSubmit={save}><label>Business name<input value={form.business_name} onChange={(event) => update("business_name", event.target.value)} maxLength={120} required /></label><label>Category<input value={form.category} onChange={(event) => update("category", event.target.value)} maxLength={80} required /></label><label>City<input value={form.city} onChange={(event) => update("city", event.target.value)} maxLength={80} /></label><label>Area<input value={form.area} onChange={(event) => update("area", event.target.value)} maxLength={120} /></label><label>Address<input value={form.address} onChange={(event) => update("address", event.target.value)} maxLength={240} /></label><label>Phone<input value={form.phone} onChange={(event) => update("phone", event.target.value)} maxLength={30} inputMode="tel" /></label><label>Business visual URL<input value={form.image_url} onChange={(event) => update("image_url", event.target.value)} placeholder="Paste your own image URL" inputMode="url" /></label><label>Description<textarea value={form.description} onChange={(event) => update("description", event.target.value)} maxLength={1000} /></label>{error && <p className="lp-inline-notice">{error}</p>}{message && <p className="lp-inline-success">{message}</p>}<button className="lp-edit-submit" disabled={saving}>{saving ? "Saving…" : "Save changes"}</button><Link href={`/business/${businessId}`} className="lp-edit-cancel">Cancel</Link></form>}<nav className="lp-bottom-nav"><Link href="/"><span>⌂</span><small>Home</small></Link><Link href="/search"><span>⌕</span><small>Explore</small></Link><Link href="/status"><span>⊙</span><small>Status</small></Link><Link href="/chat"><span>◌</span><small>Chat</small></Link><Link href="/profile"><span>♙</span><small>Profile</small></Link></nav></main>;
}
