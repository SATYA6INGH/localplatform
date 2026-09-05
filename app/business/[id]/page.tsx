"use client";

import BusinessGallery from "./BusinessGallery";
import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  "https://ckuiskbegrlrethnlhzq.supabase.co",
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      storageKey: "localplatform-auth",
    },
  }
);

type Business = {
  id: string;
  business_name: string;
  category: string;
  subcategory: string | null;
  services: string[] | null;
  description: string | null;
  short_description: string | null;
  highlights: string[] | null;
  city: string;
  state: string | null;
  address: string | null;
  area: string | null;
  landmark: string | null;
  pincode: string | null;
  latitude: number | null;
  longitude: number | null;
  maps_url: string | null;
  phone: string | null;
  image_url: string | null;
};

type Review = {
  id: string;
  reviewer_name: string;
  rating: number;
  review_text: string | null;
  created_at: string;
  user_id: string | null;
};

type Props = {
  params: Promise<{ id: string }>;
};

export default function BusinessDetails({ params }: Props) {
  const [business, setBusiness] = useState<Business | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [reviewsLoading, setReviewsLoading] = useState(true);

  const [user, setUser] = useState<any>(null);

  const [rating, setRating] = useState(5);
  const [reviewText, setReviewText] = useState("");
  const [reviewerName, setReviewerName] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const [businessId, setBusinessId] = useState("");

  useEffect(() => {
    async function loadPage() {
      const { id } = await params;

      setBusinessId(id);

      const { data: businessData, error: businessError } =
        await supabase
          .from("businesses")
          .select(
            `
              id,
              business_name,
              category,
              subcategory,
              services,
              description,
              short_description,
              highlights,
              city,
              state,
              address,
              area,
              landmark,
              pincode,
              latitude,
              longitude,
              maps_url,
              phone,
              image_url
            `
          )
          .eq("id", id)
          .maybeSingle();

      if (businessError) {
        console.error(businessError);
      }

      if (businessData) {
        setBusiness(businessData as Business);
      }

      const {
        data: { user },
      } = await supabase.auth.getUser();

      setUser(user);

      if (user) {
        const metadataName =
          user.user_metadata?.full_name ||
          user.user_metadata?.name ||
          "";

        setReviewerName(metadataName);
      }

      await loadReviews(id);

      setLoading(false);
    }

    loadPage();
  }, []);

  async function loadReviews(id: string) {
    setReviewsLoading(true);

    const { data, error } = await supabase
      .from("business_reviews")
      .select(
        "id, reviewer_name, rating, review_text, created_at, user_id"
      )
      .eq("business_id", id)
      .order("created_at", { ascending: false });

    if (error) {
      console.error(error);
    }

    if (!error) {
      setReviews(data || []);
    }

    setReviewsLoading(false);
  }

  async function submitReview() {
    setMessage("");
    setError("");

    if (!user) {
      setError("Review देने के लिए पहले Login करें।");
      return;
    }

    if (!reviewerName.trim()) {
      setError("अपना नाम भरें।");
      return;
    }

    if (!reviewText.trim()) {
      setError("Review लिखें।");
      return;
    }

    if (reviewText.trim().length < 5) {
      setError("Review कम से कम 5 characters का होना चाहिए।");
      return;
    }

    setSubmitting(true);

    try {
      const { data: existingReview, error: existingError } =
        await supabase
          .from("business_reviews")
          .select("id")
          .eq("business_id", businessId)
          .eq("user_id", user.id)
          .maybeSingle();

      if (existingError) {
        console.error(existingError);
      }

      if (existingReview) {
        throw new Error(
          "आप इस business को पहले ही review दे चुके हैं।"
        );
      }

      const { error: insertError } = await supabase
        .from("business_reviews")
        .insert({
          business_id: businessId,
          user_id: user.id,
          reviewer_name: reviewerName.trim(),
          rating,
          review_text: reviewText.trim(),
        });

      if (insertError) {
        throw new Error(insertError.message);
      }

      setReviewText("");
      setRating(5);

      setMessage("⭐ आपका review successfully submit हो गया।");

      await loadReviews(businessId);
    } catch (err: any) {
      setError(
        err?.message || "Review submit नहीं हो पाया।"
      );
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
        <div className="rounded-2xl bg-white px-7 py-6 text-center shadow-sm">
          <div className="text-3xl">⏳</div>
          <p className="mt-3 text-sm font-semibold text-slate-600">
            Loading business...
          </p>
        </div>
      </main>
    );
  }

  if (!business) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
        <div className="w-full max-w-md rounded-3xl bg-white p-7 text-center shadow-lg sm:p-10">
          <div className="text-5xl">🏢</div>

          <h1 className="mt-4 text-2xl font-bold text-slate-900">
            Business Not Found
          </h1>

          <p className="mt-2 text-sm leading-6 text-slate-500">
            यह business नहीं मिला या उपलब्ध नहीं है।
          </p>

          <div className="mt-6 grid gap-3">
            <Link
              href="/search"
              className="rounded-xl bg-blue-600 px-6 py-3 text-sm font-bold text-white"
            >
              ← Back to Search
            </Link>

            <Link
              href="/"
              className="rounded-xl border border-slate-200 px-6 py-3 text-sm font-bold text-slate-700"
            >
              🏠 Home
            </Link>
          </div>
        </div>
      </main>
    );
  }

  const phone = business.phone?.replace(/\D/g, "") || "";

  const whatsappNumber = phone.startsWith("91")
    ? phone
    : `91${phone}`;

  const averageRating =
    reviews.length > 0
      ? reviews.reduce(
          (sum, review) => sum + review.rating,
          0
        ) / reviews.length
      : 0;

  const roundedAverage =
    Math.round(averageRating * 10) / 10;

  const addressParts = [
    business.address,
    business.area,
    business.landmark,
    business.city,
    business.state,
    business.pincode,
  ].filter(Boolean);

  const fullAddress = addressParts.join(", ");

  const directionsUrl =
    business.maps_url ||
    (business.latitude != null &&
    business.longitude != null
      ? `https://www.google.com/maps?q=${business.latitude},${business.longitude}`
      : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
          fullAddress || business.city
        )}`);

  function renderStars(value: number) {
    return (
      <span
        className="whitespace-nowrap tracking-wide"
        aria-label={`${value} out of 5 stars`}
      >
        {[1, 2, 3, 4, 5].map((star) => (
          <span
            key={star}
            className={
              star <= Math.round(value)
                ? "text-yellow-500"
                : "text-slate-300"
            }
          >
            ★
          </span>
        ))}
      </span>
    );
  }

  return (
    <main className="min-h-screen overflow-x-hidden bg-slate-50 text-slate-900">

      {/* HEADER */}
      <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex min-h-16 w-full max-w-7xl items-center justify-between gap-3 px-4 sm:min-h-[72px] sm:px-6">

          <Link
            href="/"
            className="shrink-0 text-[21px] font-extrabold tracking-tight sm:text-3xl"
          >
            <span className="text-blue-600">Local</span>
            <span className="text-orange-500">Platform</span>
          </Link>

          <div className="flex items-center gap-2 sm:gap-3">
            <Link
              href="/search"
              className="rounded-xl border border-slate-200 px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 sm:px-4 sm:text-sm"
            >
              ← Search
            </Link>

            <Link
              href="/list-business"
              className="hidden rounded-xl bg-blue-600 px-4 py-2.5 text-xs font-bold text-white hover:bg-blue-700 sm:block sm:text-sm"
            >
              List Business
            </Link>
          </div>
        </div>
      </header>

      {/* HERO */}
      <section className="bg-gradient-to-br from-blue-700 via-blue-700 to-indigo-800">
        <div className="mx-auto w-full max-w-7xl px-4 py-7 sm:px-6 sm:py-10 lg:py-12">

          <div className="grid gap-6 lg:grid-cols-[minmax(0,1.6fr)_360px] lg:items-center">

            {/* LEFT */}
            <div className="min-w-0 text-white">

              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-full bg-white/15 px-3 py-1.5 text-[11px] font-bold backdrop-blur sm:text-xs">
                  {business.category}
                </span>

                {business.subcategory && (
                  <span className="rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-[11px] font-semibold text-blue-50">
                    {business.subcategory}
                  </span>
                )}

                <span className="rounded-full bg-emerald-400/20 px-3 py-1.5 text-[11px] font-bold text-emerald-100">
                  ✓ Active Listing
                </span>
              </div>

              <h1 className="mt-4 break-words text-3xl font-extrabold leading-tight tracking-tight sm:text-4xl lg:text-5xl">
                {business.business_name}
              </h1>

              {business.short_description && (
                <p className="mt-3 max-w-2xl text-sm leading-6 text-blue-100 sm:text-base">
                  {business.short_description}
                </p>
              )}

              <p className="mt-4 flex items-start gap-2 text-sm text-blue-100 sm:text-base">
                <span className="shrink-0">📍</span>
                <span>
                  {[business.area, business.city, business.state]
                    .filter(Boolean)
                    .join(", ")}
                </span>
              </p>

              {/* RATING */}
              <div className="mt-5 flex flex-wrap items-center gap-3">
                <div className="rounded-2xl bg-white px-4 py-2.5 text-slate-900 shadow-sm">
                  <div className="flex items-center gap-2">
                    <span className="text-xl font-extrabold">
                      {reviews.length > 0
                        ? roundedAverage
                        : "New"}
                    </span>

                    {reviews.length > 0 &&
                      renderStars(roundedAverage)}
                  </div>
                </div>

                <span className="text-xs font-medium text-blue-100 sm:text-sm">
                  {reviews.length === 0
                    ? "No reviews yet"
                    : `${reviews.length} ${
                        reviews.length === 1
                          ? "review"
                          : "reviews"
                      }`}
                </span>
              </div>
            </div>

            {/* IMAGE */}
            <div className="w-full">
              {business.image_url ? (
                <div className="overflow-hidden rounded-3xl border border-white/20 bg-white/10 shadow-2xl">
                  <img
                    src={business.image_url}
                    alt={`${business.business_name} - ${business.category}`}
                    className="h-56 w-full object-cover sm:h-64 lg:h-72"
                  />
                </div>
              ) : (
                <div className="flex h-52 w-full items-center justify-center rounded-3xl border border-white/20 bg-white/10 shadow-2xl sm:h-64 lg:h-72">
                  <div className="text-center">
                    <div className="text-6xl">🏢</div>
                    <p className="mt-2 text-sm font-semibold text-blue-100">
                      Business Profile
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* QUICK ACTIONS */}
          <div className="mt-6 grid grid-cols-2 gap-2.5 sm:grid-cols-4">
            {phone && (
              <a
                href={`tel:${business.phone}`}
                className="rounded-xl bg-white px-3 py-3 text-center text-xs font-extrabold text-blue-700 shadow-sm hover:bg-blue-50 sm:py-3.5 sm:text-sm"
              >
                📞 Call
              </a>
            )}

            {phone && (
              <a
                href={`https://wa.me/${whatsappNumber}`}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-xl bg-emerald-500 px-3 py-3 text-center text-xs font-extrabold text-white shadow-sm hover:bg-emerald-600 sm:py-3.5 sm:text-sm"
              >
                💬 WhatsApp
              </a>
            )}

            <a
              href={directionsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-xl bg-white/10 px-3 py-3 text-center text-xs font-extrabold text-white ring-1 ring-white/25 hover:bg-white/20 sm:py-3.5 sm:text-sm"
            >
              📍 Directions
            </a>

            <a
              href="#reviews"
              className="rounded-xl bg-white/10 px-3 py-3 text-center text-xs font-extrabold text-white ring-1 ring-white/25 hover:bg-white/20 sm:py-3.5 sm:text-sm"
            >
              ⭐ Reviews
            </a>
          </div>
        </div>
      </section>

      {/* MAIN */}
      <section className="mx-auto w-full max-w-7xl px-4 py-7 sm:px-6 sm:py-10">

        <div className="grid min-w-0 gap-6 lg:grid-cols-[minmax(0,1fr)_330px]">

          {/* MAIN COLUMN */}
          <div className="min-w-0 space-y-6">

            {/* ABOUT */}
            <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
              <p className="text-xs font-bold uppercase tracking-wider text-blue-600">
                About Business
              </p>

              <h2 className="mt-1 text-2xl font-extrabold sm:text-3xl">
                {business.business_name}
              </h2>

              <p className="mt-4 text-sm leading-7 text-slate-600 sm:text-base">
                {business.description ||
                  `${business.business_name} is a local ${business.category} business located in ${business.city}. Find business information, services, reviews and contact details on LocalPlatform.`}
              </p>
            </section>

            {/* SERVICES */}
            {Array.isArray(business.services) &&
              business.services.length > 0 && (
                <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
                  <p className="text-xs font-bold uppercase tracking-wider text-blue-600">
                    Services
                  </p>

                  <h2 className="mt-1 text-2xl font-extrabold">
                    Services Offered
                  </h2>

                  <div className="mt-5 grid gap-2 sm:grid-cols-2">
                    {business.services.map((service) => (
                      <div
                        key={service}
                        className="flex min-w-0 items-start gap-3 rounded-2xl border border-slate-100 bg-slate-50 p-4"
                      >
                        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-blue-100 text-sm text-blue-700">
                          ✓
                        </span>

                        <span className="min-w-0 break-words text-sm font-semibold text-slate-700">
                          {service}
                        </span>
                      </div>
                    ))}
                  </div>
                </section>
              )}

            {/* HIGHLIGHTS */}
            {Array.isArray(business.highlights) &&
              business.highlights.length > 0 && (
                <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
                  <p className="text-xs font-bold uppercase tracking-wider text-blue-600">
                    Highlights
                  </p>

                  <h2 className="mt-1 text-2xl font-extrabold">
                    Why Choose This Business
                  </h2>

                  <div className="mt-5 grid gap-3 sm:grid-cols-2">
                    {business.highlights.map((highlight) => (
                      <div
                        key={highlight}
                        className="rounded-2xl border border-blue-100 bg-blue-50 p-4"
                      >
                        <p className="text-sm font-semibold leading-6 text-blue-900">
                          ✓ {highlight}
                        </p>
                      </div>
                    ))}
                  </div>
                </section>
              )}

            {/* GALLERY */}
            <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
              <p className="text-xs font-bold uppercase tracking-wider text-blue-600">
                Photos
              </p>

              <h2 className="mb-5 mt-1 text-2xl font-extrabold">
                Business Gallery
              </h2>

              <BusinessGallery businessId={business.id} />
            </section>

            {/* REVIEWS */}
            <section
              id="reviews"
              className="scroll-mt-24 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7"
            >
              <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-blue-600">
                    Customer Reviews
                  </p>

                  <h2 className="mt-1 text-2xl font-extrabold sm:text-3xl">
                    Ratings & Reviews
                  </h2>
                </div>

                <div className="rounded-2xl bg-slate-50 px-4 py-3">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl font-extrabold">
                      {reviews.length > 0
                        ? roundedAverage
                        : "—"}
                    </span>

                    {reviews.length > 0 &&
                      renderStars(roundedAverage)}
                  </div>

                  <p className="mt-1 text-xs text-slate-500">
                    {reviews.length}{" "}
                    {reviews.length === 1
                      ? "review"
                      : "reviews"}
                  </p>
                </div>
              </div>

              {/* REVIEW FORM */}
              <div className="mt-7 rounded-2xl bg-slate-50 p-4 sm:p-6">
                <h3 className="text-lg font-bold">
                  Write a Review
                </h3>

                {!user ? (
                  <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-5">
                    <p className="text-sm leading-6 text-slate-600">
                      Review देने के लिए Login करना जरूरी है।
                    </p>

                    <Link
                      href="/login"
                      className="mt-4 inline-block rounded-xl bg-blue-600 px-5 py-3 text-sm font-bold text-white"
                    >
                      Login to Review
                    </Link>
                  </div>
                ) : (
                  <>
                    <div className="mt-5">
                      <label className="mb-2 block text-sm font-bold text-slate-700">
                        Your Name
                      </label>

                      <input
                        value={reviewerName}
                        onChange={(e) =>
                          setReviewerName(e.target.value)
                        }
                        placeholder="अपना नाम"
                        className="h-12 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
                      />
                    </div>

                    <div className="mt-5">
                      <label className="mb-2 block text-sm font-bold text-slate-700">
                        Your Rating
                      </label>

                      <div className="flex items-center gap-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            type="button"
                            onClick={() => setRating(star)}
                            aria-label={`Rate ${star} stars`}
                            className={`text-3xl transition hover:scale-110 sm:text-4xl ${
                              star <= rating
                                ? "text-yellow-500"
                                : "text-slate-300"
                            }`}
                          >
                            ★
                          </button>
                        ))}

                        <span className="ml-2 text-sm font-bold text-slate-600">
                          {rating}/5
                        </span>
                      </div>
                    </div>

                    <div className="mt-5">
                      <label className="mb-2 block text-sm font-bold text-slate-700">
                        Your Review
                      </label>

                      <textarea
                        value={reviewText}
                        onChange={(e) =>
                          setReviewText(e.target.value)
                        }
                        rows={5}
                        placeholder="इस business के बारे में अपना experience लिखें..."
                        className="w-full resize-none rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm leading-6 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
                      />
                    </div>

                    {error && (
                      <div className="mt-4 rounded-xl bg-red-50 p-4 text-sm font-semibold text-red-700">
                        {error}
                      </div>
                    )}

                    {message && (
                      <div className="mt-4 rounded-xl bg-emerald-50 p-4 text-sm font-semibold text-emerald-700">
                        {message}
                      </div>
                    )}

                    <button
                      type="button"
                      onClick={submitReview}
                      disabled={submitting}
                      className="mt-5 w-full rounded-xl bg-blue-600 px-6 py-3.5 text-sm font-bold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {submitting
                        ? "Submitting..."
                        : "⭐ Submit Review"}
                    </button>
                  </>
                )}
              </div>

              {/* REVIEW LIST */}
              <div className="mt-7">
                {reviewsLoading ? (
                  <div className="rounded-2xl bg-slate-50 p-6 text-center text-sm text-slate-500">
                    Reviews loading...
                  </div>
                ) : reviews.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-slate-300 p-8 text-center">
                    <div className="text-4xl">⭐</div>

                    <h3 className="mt-3 font-bold">
                      No reviews yet
                    </h3>

                    <p className="mt-2 text-sm text-slate-500">
                      इस business के लिए पहला review आप दें।
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {reviews.map((review) => (
                      <article
                        key={review.id}
                        className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5"
                      >
                        <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                          <div className="min-w-0">
                            <p className="break-words font-bold text-slate-900">
                              {review.reviewer_name}
                            </p>

                            <div className="mt-1 text-base">
                              {renderStars(review.rating)}
                            </div>
                          </div>

                          <p className="text-xs text-slate-400">
                            {new Date(
                              review.created_at
                            ).toLocaleDateString("en-IN", {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            })}
                          </p>
                        </div>

                        {review.review_text && (
                          <p className="mt-3 break-words text-sm leading-6 text-slate-600">
                            {review.review_text}
                          </p>
                        )}
                      </article>
                    ))}
                  </div>
                )}
              </div>
            </section>

            {/* ADDRESS */}
            <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
              <p className="text-xs font-bold uppercase tracking-wider text-blue-600">
                Location
              </p>

              <h2 className="mt-1 text-2xl font-extrabold">
                Complete Address
              </h2>

              <div className="mt-5 rounded-2xl bg-slate-50 p-5">
                <p className="text-sm leading-7 text-slate-700">
                  {fullAddress || business.city}
                </p>
              </div>

              <a
                href={directionsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 block rounded-xl bg-blue-600 px-5 py-3 text-center text-sm font-bold text-white hover:bg-blue-700"
              >
                📍 Get Directions on Google Maps
              </a>
            </section>

          </div>

          {/* SIDEBAR */}
          <aside className="min-w-0 space-y-5 lg:sticky lg:top-24 lg:h-fit">

            {/* CONTACT CARD */}
            <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
              <p className="text-xs font-bold uppercase tracking-wider text-blue-600">
                Contact
              </p>

              <h2 className="mt-1 text-xl font-extrabold">
                Contact Business
              </h2>

              <div className="mt-5 rounded-2xl bg-slate-50 p-4">
                <p className="text-xs font-semibold text-slate-500">
                  Phone Number
                </p>

                <p className="mt-1 break-all text-lg font-extrabold text-slate-900">
                  {business.phone ||
                    "Phone not available"}
                </p>
              </div>

              {phone && (
                <div className="mt-3 grid gap-2">
                  <a
                    href={`tel:${business.phone}`}
                    className="rounded-xl bg-blue-600 px-5 py-3 text-center text-sm font-bold text-white hover:bg-blue-700"
                  >
                    📞 Call Now
                  </a>

                  <a
                    href={`https://wa.me/${whatsappNumber}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded-xl bg-emerald-500 px-5 py-3 text-center text-sm font-bold text-white hover:bg-emerald-600"
                  >
                    💬 WhatsApp
                  </a>
                </div>
              )}

              <a
                href={directionsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-2 block rounded-xl border border-slate-200 px-5 py-3 text-center text-sm font-bold text-slate-700 hover:bg-slate-50"
              >
                📍 Get Directions
              </a>
            </div>

            {/* BUSINESS INFO */}
            <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
              <p className="text-xs font-bold uppercase tracking-wider text-blue-600">
                Business Details
              </p>

              <h2 className="mt-1 text-xl font-extrabold">
                Business Information
              </h2>

              <div className="mt-5 space-y-3">
                <div className="rounded-2xl bg-slate-50 p-4">
                  <p className="text-xs text-slate-500">
                    Business
                  </p>

                  <p className="mt-1 break-words text-sm font-bold">
                    {business.business_name}
                  </p>
                </div>

                <div className="rounded-2xl bg-slate-50 p-4">
                  <p className="text-xs text-slate-500">
                    Category
                  </p>

                  <p className="mt-1 text-sm font-bold">
                    {business.category}
                  </p>
                </div>

                {business.subcategory && (
                  <div className="rounded-2xl bg-slate-50 p-4">
                    <p className="text-xs text-slate-500">
                      Subcategory
                    </p>

                    <p className="mt-1 text-sm font-bold">
                      {business.subcategory}
                    </p>
                  </div>
                )}

                <div className="rounded-2xl bg-slate-50 p-4">
                  <p className="text-xs text-slate-500">
                    Location
                  </p>

                  <p className="mt-1 break-words text-sm font-bold">
                    {business.city}
                    {business.state
                      ? `, ${business.state}`
                      : ""}
                  </p>
                </div>
              </div>
            </div>

            {/* LISTING CTA */}
            <div className="rounded-3xl bg-gradient-to-br from-blue-600 to-indigo-700 p-6 text-white shadow-lg">
              <p className="text-xs font-bold uppercase tracking-wider text-blue-100">
                Business Owner?
              </p>

              <h2 className="mt-2 text-xl font-extrabold">
                Get discovered by more customers
              </h2>

              <p className="mt-2 text-sm leading-6 text-blue-100">
                Create your business listing on LocalPlatform.
              </p>

              <Link
                href="/list-business"
                className="mt-5 block rounded-xl bg-white px-5 py-3 text-center text-sm font-bold text-blue-600 hover:bg-blue-50"
              >
                List Your Business
              </Link>
            </div>

          </aside>
        </div>
      </section>

      {/* SEO CONTENT */}
      <section className="border-t border-slate-200 bg-white">
        <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 sm:py-10">
          <h2 className="text-xl font-extrabold sm:text-2xl">
            {business.category} in {business.city}
          </h2>

          <p className="mt-3 max-w-4xl text-sm leading-7 text-slate-600">
            {business.business_name} is a local{" "}
            {business.category} business located in{" "}
            {business.city}
            {business.state
              ? `, ${business.state}`
              : ""}
            . Find business information, services, customer
            reviews, ratings, location and contact details on
            LocalPlatform.
          </p>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-slate-950 px-4 py-8 text-center text-slate-400">
        <div className="text-xl font-extrabold">
          <span className="text-blue-400">Local</span>
          <span className="text-orange-400">Platform</span>
        </div>

        <p className="mt-1 text-xs">
          Find. Connect. Grow.
        </p>

        <div className="mt-5 flex flex-wrap justify-center gap-x-5 gap-y-2 text-xs sm:text-sm">
          <Link href="/" className="hover:text-white">
            Home
          </Link>

          <Link href="/search" className="hover:text-white">
            Search
          </Link>

          <Link
            href="/list-business"
            className="hover:text-white"
          >
            List Business
          </Link>
        </div>

        <p className="mt-5 text-[10px]">
          © 2026 LocalPlatform. All rights reserved.
        </p>
      </footer>
    </main>
  );
}