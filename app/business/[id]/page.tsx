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
  city: string;
  phone: string | null;
  image_url?: string | null;
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

      const { data: businessData } = await supabase
        .from("businesses")
        .select(
          "id, business_name, category, city, phone, image_url"
        )
        .eq("id", id)
        .maybeSingle();

      if (businessData) {
        setBusiness(businessData);
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
      const { data: existingReview } = await supabase
        .from("business_reviews")
        .select("id")
        .eq("business_id", businessId)
        .eq("user_id", user.id)
        .maybeSingle();

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
      <main className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="rounded-2xl bg-white px-8 py-6 shadow">
          Loading business...
        </div>
      </main>
    );
  }

  if (!business) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gray-50 px-6">
        <div className="w-full max-w-md rounded-2xl bg-white p-10 text-center shadow-lg">
          <h1 className="text-2xl font-bold text-gray-900">
            Business Not Found
          </h1>

          <p className="mt-3 text-gray-500">
            यह business नहीं मिला।
          </p>

          <div className="mt-6 flex flex-col gap-3">
            <Link
              href="/"
              className="rounded-xl bg-blue-700 px-6 py-3 font-semibold text-white"
            >
              🏠 Home
            </Link>

            <Link
              href="/search"
              className="rounded-xl bg-black px-6 py-3 font-semibold text-white"
            >
              ← Back to Search
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
      ? reviews.reduce((sum, review) => sum + review.rating, 0) /
        reviews.length
      : 0;

  const roundedAverage = Math.round(averageRating * 10) / 10;

  function renderStars(value: number) {
    return (
      <span className="tracking-wide">
        {[1, 2, 3, 4, 5].map((star) => (
          <span
            key={star}
            className={
              star <= Math.round(value)
                ? "text-yellow-500"
                : "text-gray-300"
            }
          >
            ★
          </span>
        ))}
      </span>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50">
      {/* HEADER */}
      <header className="border-b bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-6 py-5">
          <Link
            href="/"
            className="font-semibold text-gray-700 hover:text-black"
          >
            🏠 Home
          </Link>

          <Link
            href="/search"
            className="font-semibold text-gray-700 hover:text-black"
          >
            ← Back to Search
          </Link>

          <Link
            href="/list-business"
            className="rounded-xl bg-black px-5 py-3 font-semibold text-white"
          >
            List Your Business
          </Link>
        </div>
      </header>

      {/* MAIN */}
      <section className="mx-auto max-w-5xl px-4 py-8 md:px-6 md:py-12">
        <div className="overflow-hidden rounded-3xl bg-white shadow-xl">

          {/* HERO */}
          <div className="bg-blue-700 px-6 py-10 text-white md:px-8 md:py-14">
            {business.image_url && (
              <div className="mb-6">
                <img
                  src={business.image_url}
                  alt={`${business.business_name} - ${business.category}`}
                  className="h-32 w-32 rounded-2xl border-4 border-white/30 object-cover"
                />
              </div>
            )}

            <div className="mb-5 inline-block rounded-full bg-white/20 px-4 py-2 text-sm font-semibold">
              {business.category}
            </div>

            <h1 className="text-3xl font-bold md:text-5xl">
              {business.business_name}
            </h1>

            <p className="mt-4 text-lg text-blue-100">
              📍 {business.city}
            </p>

            {/* RATING SUMMARY */}
            <div className="mt-6 flex flex-wrap items-center gap-3">
              <div className="rounded-xl bg-white px-4 py-3 text-gray-900">
                <span className="text-2xl font-bold">
                  {roundedAverage || "New"}
                </span>

                {reviews.length > 0 && (
                  <span className="ml-2">
                    {renderStars(roundedAverage)}
                  </span>
                )}
              </div>

              <div className="text-blue-100">
                {reviews.length === 0
                  ? "No reviews yet"
                  : `${reviews.length} ${
                      reviews.length === 1 ? "review" : "reviews"
                    }`}
              </div>
            </div>
          </div>

          {/* DETAILS */}
          <div className="p-6 md:p-10">

            {/* CONTACT */}
            <h2 className="text-2xl font-bold text-gray-900">
              Contact Business
            </h2>

            <div className="mt-6 rounded-2xl bg-gray-50 p-6">
              <p className="text-sm text-gray-500">
                Phone Number
              </p>

              <p className="mt-2 text-2xl font-bold text-gray-900">
                {business.phone || "Phone not available"}
              </p>
            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-2">
              {phone && (
                <a
                  href={`tel:${business.phone}`}
                  className="rounded-xl bg-black px-6 py-4 text-center font-bold text-white"
                >
                  📞 Call Now
                </a>
              )}

              {phone && (
                <a
                  href={`https://wa.me/${whatsappNumber}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-xl bg-green-600 px-6 py-4 text-center font-bold text-white"
                >
                  💬 WhatsApp
                </a>
              )}
            </div>

            {/* REVIEWS */}
            <div className="mt-12 border-t pt-10">
              <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-wide text-blue-600">
                    Customer Reviews
                  </p>

                  <h2 className="mt-1 text-3xl font-bold text-gray-900">
                    Ratings & Reviews
                  </h2>

                  <div className="mt-3 flex items-center gap-3">
                    <span className="text-3xl font-bold">
                      {roundedAverage || "—"}
                    </span>

                    {reviews.length > 0 &&
                      renderStars(roundedAverage)}

                    <span className="text-gray-500">
                      {reviews.length} reviews
                    </span>
                  </div>
                </div>
              </div>

              {/* REVIEW FORM */}
              <div className="mt-8 rounded-2xl border bg-gray-50 p-6">
                <h3 className="text-xl font-bold text-gray-900">
                  Write a Review
                </h3>

                {!user ? (
                  <div className="mt-5 rounded-xl bg-white p-5">
                    <p className="text-gray-600">
                      Review देने के लिए Login करना जरूरी है।
                    </p>

                    <Link
                      href="/login"
                      className="mt-4 inline-block rounded-xl bg-black px-6 py-3 font-semibold text-white"
                    >
                      Login to Review
                    </Link>
                  </div>
                ) : (
                  <>
                    {/* NAME */}
                    <div className="mt-5">
                      <label className="mb-2 block text-sm font-semibold text-gray-700">
                        Your Name
                      </label>

                      <input
                        value={reviewerName}
                        onChange={(e) =>
                          setReviewerName(e.target.value)
                        }
                        placeholder="अपना नाम"
                        className="w-full rounded-xl border bg-white px-4 py-3 outline-none focus:border-blue-600"
                      />
                    </div>

                    {/* STAR SELECT */}
                    <div className="mt-5">
                      <label className="mb-2 block text-sm font-semibold text-gray-700">
                        Your Rating
                      </label>

                      <div className="flex gap-2">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            type="button"
                            onClick={() => setRating(star)}
                            className={`text-4xl transition ${
                              star <= rating
                                ? "text-yellow-500"
                                : "text-gray-300"
                            }`}
                          >
                            ★
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* REVIEW */}
                    <div className="mt-5">
                      <label className="mb-2 block text-sm font-semibold text-gray-700">
                        Your Review
                      </label>

                      <textarea
                        value={reviewText}
                        onChange={(e) =>
                          setReviewText(e.target.value)
                        }
                        rows={4}
                        placeholder="इस business के बारे में अपना experience लिखें..."
                        className="w-full resize-none rounded-xl border bg-white px-4 py-3 outline-none focus:border-blue-600"
                      />
                    </div>

                    {error && (
                      <div className="mt-4 rounded-xl bg-red-50 p-4 text-sm font-medium text-red-700">
                        {error}
                      </div>
                    )}

                    {message && (
                      <div className="mt-4 rounded-xl bg-green-50 p-4 text-sm font-medium text-green-700">
                        {message}
                      </div>
                    )}

                    <button
                      type="button"
                      onClick={submitReview}
                      disabled={submitting}
                      className="mt-5 w-full rounded-xl bg-blue-700 px-6 py-4 font-bold text-white disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {submitting
                        ? "Submitting..."
                        : "⭐ Submit Review"}
                    </button>
                  </>
                )}
              </div>

              {/* REVIEW LIST */}
              <BusinessGallery businessId={business.id} />
              <div className="mt-8">
                {reviewsLoading ? (
                  <div className="rounded-2xl bg-gray-50 p-6 text-gray-500">
                    Reviews loading...
                  </div>
                ) : reviews.length === 0 ? (
                  <div className="rounded-2xl border border-dashed p-8 text-center">
                    <div className="text-4xl">⭐</div>

                    <h3 className="mt-3 text-lg font-bold text-gray-900">
                      No reviews yet
                    </h3>

                    <p className="mt-2 text-gray-500">
                      इस business के लिए पहला review आप दें।
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {reviews.map((review) => (
                      <div
                        key={review.id}
                        className="rounded-2xl border bg-white p-5"
                      >
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                          <div>
                            <p className="font-bold text-gray-900">
                              {review.reviewer_name}
                            </p>

                            <div className="mt-1">
                              {renderStars(review.rating)}
                            </div>
                          </div>

                          <p className="text-sm text-gray-400">
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
                          <p className="mt-4 leading-7 text-gray-600">
                            {review.review_text}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* BUSINESS INFORMATION */}
            <div className="mt-12 border-t pt-10">
              <h2 className="text-2xl font-bold text-gray-900">
                Business Information
              </h2>

              <div className="mt-5 grid gap-4 md:grid-cols-3">
                <div className="rounded-xl bg-gray-50 p-5">
                  <p className="text-sm text-gray-500">
                    Business
                  </p>

                  <p className="mt-1 font-semibold">
                    {business.business_name}
                  </p>
                </div>

                <div className="rounded-xl bg-gray-50 p-5">
                  <p className="text-sm text-gray-500">
                    Category
                  </p>

                  <p className="mt-1 font-semibold">
                    {business.category}
                  </p>
                </div>

                <div className="rounded-xl bg-gray-50 p-5">
                  <p className="text-sm text-gray-500">
                    Location
                  </p>

                  <p className="mt-1 font-semibold">
                    {business.city}
                  </p>
                </div>
              </div>
            </div>

            {/* SEO */}
            <div className="mt-10 border-t pt-8">
              <h2 className="text-2xl font-bold text-gray-900">
                {business.category} in {business.city}
              </h2>

              <p className="mt-3 leading-7 text-gray-600">
                {business.business_name} is a local{" "}
                {business.category} business located in{" "}
                {business.city}. Find business information,
                customer reviews, ratings and contact details
                on LocalPlatform.
              </p>
            </div>

            {/* NAVIGATION */}
            <div className="mt-10 flex flex-col gap-3 border-t pt-8 sm:flex-row">
              <Link
                href="/"
                className="flex-1 rounded-xl border border-gray-300 px-6 py-4 text-center font-semibold text-gray-800"
              >
                🏠 Go to Home
              </Link>

              <Link
                href="/search"
                className="flex-1 rounded-xl bg-black px-6 py-4 text-center font-semibold text-white"
              >
                🔍 Search More Businesses
              </Link>

              <Link
                href="/list-business"
                className="flex-1 rounded-xl bg-blue-700 px-6 py-4 text-center font-semibold text-white"
              >
                ➕ List Your Business
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}