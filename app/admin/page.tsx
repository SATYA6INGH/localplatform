"use client";

import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  "https://ckuiskbegrlrethnlhzq.supabase.co",
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
      storageKey: "localplatform-auth",
    },
  }
);

type Payment = {
  id: string;
  business_id: string;
  user_id: string;
  plan: string;
  amount: number;
  utr_number: string;
  payment_screenshot: string | null;
  status: string;
  created_at: string;
};

type HomeAd = {
  id: string;
  business_id: string;
  owner_id: string;
  title: string | null;
  image_url: string | null;
  status: string;
  starts_at: string | null;
  expires_at: string | null;
  created_at: string;
};

type Business = {
  id: string;
  business_name: string;
  category: string;
  city: string;
};

export default function AdminPage() {
  const [loading, setLoading] = useState(true);
  const [authorized, setAuthorized] = useState(false);
  const [error, setError] = useState("");

  const [payments, setPayments] = useState<Payment[]>([]);
  const [ads, setAds] = useState<HomeAd[]>([]);
  const [businesses, setBusinesses] = useState<
    Record<string, Business>
  >({});

  const [actionId, setActionId] = useState("");

  useEffect(() => {
    checkAdmin();
  }, []);

  async function checkAdmin() {
    setLoading(true);
    setError("");

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setAuthorized(false);
        setError("Please login first.");
        return;
      }

      const { data: admin, error: adminError } = await supabase
        .from("admin_users")
        .select("user_id")
        .eq("user_id", user.id)
        .maybeSingle();

      if (adminError) {
        console.error(adminError);
        setError("Unable to verify admin access.");
        return;
      }

      if (!admin) {
        setAuthorized(false);
        setError("Access denied. Admin only.");
        return;
      }

      setAuthorized(true);

      await Promise.all([
        loadPayments(),
        loadAds(),
      ]);
    } catch (err) {
      console.error(err);
      setError("Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  async function loadPayments() {
    const { data, error } = await supabase
      .from("listing_payments")
      .select("*")
      .order("created_at", {
        ascending: false,
      });

    if (error) {
      console.error("PAYMENTS ERROR:", error);
      setError("Unable to load payments.");
      return;
    }

    setPayments((data || []) as Payment[]);

    const ids = [
      ...new Set(
        (data || []).map(
          (payment) => payment.business_id
        )
      ),
    ];

    if (ids.length === 0) return;

    const { data: businessData } = await supabase
      .from("businesses")
      .select(
        "id, business_name, category, city"
      )
      .in("id", ids);

    const map: Record<string, Business> = {};

    (businessData || []).forEach((business) => {
      map[business.id] = business as Business;
    });

    setBusinesses((current) => ({
      ...current,
      ...map,
    }));
  }

  async function loadAds() {
    const { data, error } = await supabase
      .from("home_ads")
      .select("*")
      .order("created_at", {
        ascending: false,
      });

    if (error) {
      console.error("ADS ERROR:", error);
      setError("Unable to load home ads.");
      return;
    }

    setAds((data || []) as HomeAd[]);

    const ids = [
      ...new Set(
        (data || []).map(
          (ad) => ad.business_id
        )
      ),
    ];

    if (ids.length === 0) return;

    const { data: businessData } = await supabase
      .from("businesses")
      .select(
        "id, business_name, category, city"
      )
      .in("id", ids);

    const map: Record<string, Business> = {};

    (businessData || []).forEach((business) => {
      map[business.id] = business as Business;
    });

    setBusinesses((current) => ({
      ...current,
      ...map,
    }));
  }

  async function approvePayment(payment: Payment) {
    if (actionId) return;

    const business = businesses[payment.business_id];

    if (!business) {
      alert("Business not found.");
      return;
    }

    setActionId(payment.id);
    setError("");

    try {
      const now = new Date();

      const expires = new Date(now);

      if (payment.plan === "6_month") {
        expires.setMonth(
          expires.getMonth() + 6
        );
      } else if (payment.plan === "1_year") {
        expires.setFullYear(
          expires.getFullYear() + 1
        );
      } else {
        throw new Error("Invalid plan.");
      }

      const {
        data: {
          user,
        },
      } = await supabase.auth.getUser();

      if (!user) {
        throw new Error("Admin session expired.");
      }

      const { error: paymentError } =
        await supabase
          .from("listing_payments")
          .update({
            status: "approved",
            verified_at: now.toISOString(),
            verified_by: user.id,
          })
          .eq("id", payment.id)
          .eq("status", "pending");

      if (paymentError) {
        throw paymentError;
      }

      const { error: businessError } =
        await supabase
          .from("businesses")
          .update({
            listing_plan: payment.plan,
            listing_status: "active",
            listing_started_at:
              now.toISOString(),
            listing_expires_at:
              expires.toISOString(),
            paid_at: now.toISOString(),
            payment_id: payment.id,
          })
          .eq("id", payment.business_id);

      if (businessError) {
        throw businessError;
      }

      alert(
        `Payment approved for ${business.business_name}`
      );

      await Promise.all([
        loadPayments(),
        loadAds(),
      ]);
    } catch (err) {
      console.error(err);
      setError(
        "Payment approval failed. Please try again."
      );
    } finally {
      setActionId("");
    }
  }

  async function rejectPayment(payment: Payment) {
    if (actionId) return;

    const confirmed = window.confirm(
      "Reject this payment?"
    );

    if (!confirmed) return;

    setActionId(payment.id);
    setError("");

    try {
      const { error } = await supabase
        .from("listing_payments")
        .update({
          status: "rejected",
        })
        .eq("id", payment.id)
        .eq("status", "pending");

      if (error) {
        throw error;
      }

      await loadPayments();
    } catch (err) {
      console.error(err);
      setError(
        "Payment rejection failed."
      );
    } finally {
      setActionId("");
    }
  }

  async function approveAd(ad: HomeAd) {
    if (actionId) return;

    const confirmed = window.confirm(
      "Approve this Home Top Ad?"
    );

    if (!confirmed) return;

    setActionId(ad.id);
    setError("");

    try {
      const now = new Date();
      const startsAt = now.toISOString();

      const expiresAt = new Date(now);

      // Default Home Ad duration:
      // 7 days
      expiresAt.setDate(
        expiresAt.getDate() + 7
      );

      const { error } = await supabase
        .from("home_ads")
        .update({
          status: "approved",
          starts_at: startsAt,
          expires_at:
            expiresAt.toISOString(),
        })
        .eq("id", ad.id)
        .eq("status", "pending");

      if (error) {
        throw error;
      }

      await loadAds();
    } catch (err) {
      console.error(err);
      setError(
        "Home ad approval failed."
      );
    } finally {
      setActionId("");
    }
  }

  async function rejectAd(ad: HomeAd) {
    if (actionId) return;

    const confirmed = window.confirm(
      "Reject this Home Top Ad?"
    );

    if (!confirmed) return;

    setActionId(ad.id);
    setError("");

    try {
      const { error } = await supabase
        .from("home_ads")
        .update({
          status: "rejected",
        })
        .eq("id", ad.id)
        .eq("status", "pending");

      if (error) {
        throw error;
      }

      await loadAds();
    } catch (err) {
      console.error(err);
      setError(
        "Home ad rejection failed."
      );
    } finally {
      setActionId("");
    }
  }

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-950 text-white">
        <div className="text-center">
          <div className="text-lg font-black">
            LocalPlatform Admin
          </div>
          <p className="mt-2 text-sm text-slate-400">
            Checking admin access...
          </p>
        </div>
      </main>
    );
  }

  if (!authorized) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-950 px-5 text-white">
        <div className="w-full max-w-md rounded-3xl border border-white/10 bg-white/5 p-7 text-center shadow-2xl">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-red-500/10 text-2xl">
            🔒
          </div>

          <h1 className="mt-5 text-2xl font-black">
            Admin Access Required
          </h1>

          <p className="mt-2 text-sm leading-6 text-slate-400">
            {error ||
              "You do not have permission to access this page."}
          </p>

          <a
            href="/login"
            className="mt-6 inline-flex rounded-xl bg-white px-5 py-3 text-sm font-black text-slate-950"
          >
            Go to Login
          </a>
        </div>
      </main>
    );
  }

  const pendingPayments =
    payments.filter(
      (payment) =>
        payment.status === "pending"
    );

  const pendingAds =
    ads.filter(
      (ad) => ad.status === "pending"
    );

  return (
    <main className="min-h-screen bg-slate-100 text-slate-900">

      {/* HEADER */}
      <header className="border-b border-slate-200 bg-slate-950 text-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-5 sm:px-6 lg:px-8">

          <div>
            <p className="text-[9px] font-black uppercase tracking-[0.18em] text-sky-400">
              LocalPlatform
            </p>

            <h1 className="mt-1 text-xl font-black sm:text-2xl">
              Admin Dashboard
            </h1>
          </div>

          <a
            href="/"
            className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-xs font-bold text-slate-200 hover:bg-white/10"
          >
            View Website
          </a>

        </div>
      </header>

      <div className="mx-auto max-w-7xl px-4 py-7 sm:px-6 sm:py-10 lg:px-8">

        {/* ERROR */}
        {error && (
          <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
            {error}
          </div>
        )}

        {/* STATS */}
        <div className="grid gap-4 sm:grid-cols-3">

          <StatCard
            label="Pending Payments"
            value={pendingPayments.length}
            icon="💳"
          />

          <StatCard
            label="Pending Home Ads"
            value={pendingAds.length}
            icon="📢"
          />

          <StatCard
            label="Total Payments"
            value={payments.length}
            icon="📊"
          />

        </div>

        {/* PAYMENTS */}
        <section className="mt-8">

          <div className="mb-4">
            <p className="text-[10px] font-black uppercase tracking-[0.16em] text-sky-600">
              Listing Payments
            </p>

            <h2 className="mt-1 text-2xl font-black">
              Payment Requests
            </h2>
          </div>

          {payments.length === 0 ? (
            <EmptyState text="No payment submissions yet." />
          ) : (
            <div className="space-y-4">

              {payments.map((payment) => {
                const business =
                  businesses[payment.business_id];

                return (
                  <article
                    key={payment.id}
                    className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
                  >
                    <div className="p-5 sm:p-6">

                      <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">

                        <div className="min-w-0">

                          <div className="flex flex-wrap items-center gap-2">

                            <h3 className="text-base font-black sm:text-lg">
                              {business?.business_name ||
                                "Unknown Business"}
                            </h3>

                            <StatusBadge
                              status={payment.status}
                            />

                          </div>

                          <p className="mt-1 text-xs text-slate-500">
                            {business?.category ||
                              "Unknown Category"}{" "}
                            •{" "}
                            {business?.city ||
                              "Unknown City"}
                          </p>

                          <div className="mt-4 grid gap-3 sm:grid-cols-3">

                            <Info
                              label="Plan"
                              value={
                                payment.plan ===
                                "6_month"
                                  ? "6 Months"
                                  : "1 Year"
                              }
                            />

                            <Info
                              label="Amount"
                              value={`₹${payment.amount}`}
                            />

                            <Info
                              label="UTR"
                              value={
                                payment.utr_number
                              }
                            />

                          </div>

                          <p className="mt-4 text-[10px] text-slate-400">
                            Submitted{" "}
                            {new Date(
                              payment.created_at
                            ).toLocaleString()}
                          </p>

                        </div>

                        <div className="flex shrink-0 flex-col gap-2 sm:flex-row lg:flex-col">

                          {payment.payment_screenshot && (
                            <a
                              href={
                                payment.payment_screenshot
                              }
                              target="_blank"
                              rel="noreferrer"
                              className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-center text-xs font-black text-slate-700 hover:bg-slate-100"
                            >
                              View Screenshot
                            </a>
                          )}

                          {payment.status ===
                            "pending" && (
                            <>
                              <button
                                type="button"
                                onClick={() =>
                                  approvePayment(
                                    payment
                                  )
                                }
                                disabled={
                                  !!actionId
                                }
                                className="rounded-xl bg-emerald-600 px-5 py-2.5 text-xs font-black text-white hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
                              >
                                {actionId ===
                                payment.id
                                  ? "Processing..."
                                  : "Approve"}
                              </button>

                              <button
                                type="button"
                                onClick={() =>
                                  rejectPayment(
                                    payment
                                  )
                                }
                                disabled={
                                  !!actionId
                                }
                                className="rounded-xl bg-red-50 px-5 py-2.5 text-xs font-black text-red-600 hover:bg-red-100 disabled:opacity-50"
                              >
                                Reject
                              </button>
                            </>
                          )}

                        </div>

                      </div>

                    </div>
                  </article>
                );
              })}

            </div>
          )}

        </section>

        {/* HOME ADS */}
        <section className="mt-12">

          <div className="mb-4">
            <p className="text-[10px] font-black uppercase tracking-[0.16em] text-orange-600">
              Home Top Ads
            </p>

            <h2 className="mt-1 text-2xl font-black">
              Sponsored Ad Requests
            </h2>
          </div>

          {ads.length === 0 ? (
            <EmptyState text="No Home Top Ads yet." />
          ) : (
            <div className="space-y-4">

              {ads.map((ad) => {
                const business =
                  businesses[ad.business_id];

                return (
                  <article
                    key={ad.id}
                    className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
                  >
                    <div className="p-5 sm:p-6">

                      <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">

                        <div>

                          <div className="flex flex-wrap items-center gap-2">

                            <h3 className="text-base font-black sm:text-lg">
                              {ad.title ||
                                business?.business_name ||
                                "Home Advertisement"}
                            </h3>

                            <StatusBadge
                              status={ad.status}
                            />

                          </div>

                          <p className="mt-1 text-xs text-slate-500">
                            {business?.business_name ||
                              "Unknown Business"}{" "}
                            •{" "}
                            {business?.category ||
                              "Unknown Category"}{" "}
                            •{" "}
                            {business?.city ||
                              "Unknown City"}
                          </p>

                          <p className="mt-3 text-[10px] text-slate-400">
                            Created{" "}
                            {new Date(
                              ad.created_at
                            ).toLocaleString()}
                          </p>

                          {ad.status ===
                            "approved" &&
                            ad.starts_at &&
                            ad.expires_at && (
                              <p className="mt-1 text-[10px] font-semibold text-emerald-600">
                                Active from{" "}
                                {new Date(
                                  ad.starts_at
                                ).toLocaleDateString()}{" "}
                                to{" "}
                                {new Date(
                                  ad.expires_at
                                ).toLocaleDateString()}
                              </p>
                            )}

                        </div>

                        <div className="flex flex-wrap gap-2">

                          {ad.image_url && (
                            <a
                              href={ad.image_url}
                              target="_blank"
                              rel="noreferrer"
                              className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-xs font-black text-slate-700 hover:bg-slate-100"
                            >
                              View Ad Image
                            </a>
                          )}

                          {ad.status ===
                            "pending" && (
                            <>
                              <button
                                type="button"
                                onClick={() =>
                                  approveAd(ad)
                                }
                                disabled={
                                  !!actionId
                                }
                                className="rounded-xl bg-emerald-600 px-5 py-2.5 text-xs font-black text-white hover:bg-emerald-700 disabled:opacity-50"
                              >
                                {actionId === ad.id
                                  ? "Processing..."
                                  : "Approve"}
                              </button>

                              <button
                                type="button"
                                onClick={() =>
                                  rejectAd(ad)
                                }
                                disabled={
                                  !!actionId
                                }
                                className="rounded-xl bg-red-50 px-5 py-2.5 text-xs font-black text-red-600 hover:bg-red-100 disabled:opacity-50"
                              >
                                Reject
                              </button>
                            </>
                          )}

                        </div>

                      </div>

                    </div>
                  </article>
                );
              })}

            </div>
          )}

        </section>

      </div>
    </main>
  );
}

function StatCard({
  label,
  value,
  icon,
}: {
  label: string;
  value: number;
  icon: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400">
            {label}
          </p>

          <p className="mt-2 text-3xl font-black text-slate-950">
            {value}
          </p>
        </div>

        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100 text-xl">
          {icon}
        </div>
      </div>
    </div>
  );
}

function StatusBadge({
  status,
}: {
  status: string;
}) {
  const styles: Record<string, string> = {
    pending:
      "bg-amber-50 text-amber-700 border-amber-200",
    approved:
      "bg-emerald-50 text-emerald-700 border-emerald-200",
    rejected:
      "bg-red-50 text-red-700 border-red-200",
    expired:
      "bg-slate-100 text-slate-600 border-slate-200",
  };

  return (
    <span
      className={`rounded-full border px-2.5 py-1 text-[9px] font-black uppercase ${
        styles[status] ||
        "bg-slate-100 text-slate-600 border-slate-200"
      }`}
    >
      {status}
    </span>
  );
}

function Info({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl bg-slate-50 p-3">
      <p className="text-[9px] font-bold uppercase tracking-wide text-slate-400">
        {label}
      </p>

      <p className="mt-1 break-all text-xs font-black text-slate-800">
        {value}
      </p>
    </div>
  );
}

function EmptyState({
  text,
}: {
  text: string;
}) {
  return (
    <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-5 py-12 text-center">
      <div className="text-3xl">📭</div>

      <p className="mt-3 text-sm font-bold text-slate-600">
        {text}
      </p>
    </div>
  );
}