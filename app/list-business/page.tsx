"use client";

import {
  useEffect,
  useState,
  type ChangeEvent,
  type FormEvent,
} from "react";
import { createClient } from "@supabase/supabase-js";
import { useRouter } from "next/navigation";
import Link from "next/link";

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

export default function ListBusinessPage() {
  const router = useRouter();

  const [businessName, setBusinessName] = useState("");
  const [category, setCategory] = useState("");
  const [address, setAddress] = useState("");
  const [area, setArea] = useState("");
  const [landmark, setLandmark] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [pincode, setPincode] = useState("");
  const [phone, setPhone] = useState("");
  const [mapsUrl, setMapsUrl] = useState("");
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");

  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;

    async function checkUser() {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (!mounted) return;

        if (!session?.user) {
          setLoading(false);
          router.replace("/login");
          return;
        }

        setLoading(false);
      } catch {
        if (mounted) {
          setError("Login session नहीं मिली। कृपया दोबारा Login करें।");
          setLoading(false);
        }
      }
    }

    checkUser();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!mounted) return;

      if (!session?.user) {
        setLoading(false);
        router.replace("/login");
        return;
      }

      setLoading(false);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [router]);

  function handleImageChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("कृपया केवल फोटो चुनें।");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError("फोटो का size 5 MB से कम होना चाहिए।");
      return;
    }

    setError("");
    setImage(file);

    const previewUrl = URL.createObjectURL(file);
    setImagePreview(previewUrl);
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    setSaving(true);
    setMessage("");
    setError("");

    try {
      if (!businessName.trim()) {
        throw new Error("Business Name भरें।");
      }

      if (!category.trim()) {
        throw new Error("Category भरें।");
      }

      if (!address.trim()) {
        throw new Error("Complete Address भरें।");
      }

      if (!city.trim()) {
        throw new Error("City भरें।");
      }

      if (!state.trim()) {
        throw new Error("State भरें।");
      }

      if (!pincode.trim()) {
        throw new Error("Pincode भरें।");
      }

      if (!phone.trim()) {
        throw new Error("Phone Number भरें।");
      }

      if (pincode.trim().length !== 6 || !/^\d{6}$/.test(pincode.trim())) {
        throw new Error("Pincode 6 digit का होना चाहिए।");
      }

      if (mapsUrl.trim()) {
        try {
          new URL(mapsUrl.trim());
        } catch {
          throw new Error("Google Maps URL सही डालें।");
        }
      }

      let parsedLatitude: number | null = null;
      let parsedLongitude: number | null = null;

      if (latitude.trim()) {
        parsedLatitude = Number(latitude.trim());

        if (
          Number.isNaN(parsedLatitude) ||
          parsedLatitude < -90 ||
          parsedLatitude > 90
        ) {
          throw new Error("Latitude -90 से 90 के बीच होना चाहिए।");
        }
      }

      if (longitude.trim()) {
        parsedLongitude = Number(longitude.trim());

        if (
          Number.isNaN(parsedLongitude) ||
          parsedLongitude < -180 ||
          parsedLongitude > 180
        ) {
          throw new Error("Longitude -180 से 180 के बीच होना चाहिए।");
        }
      }

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        throw new Error(
          "Login session समाप्त हो गई। कृपया दोबारा Login करें।"
        );
      }

      let imageUrl = "";

      if (image) {
        const fileExtension =
          image.name.split(".").pop()?.toLowerCase() || "jpg";

        const fileName = `${crypto.randomUUID()}.${fileExtension}`;
        const filePath = `${user.id}/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from("business-images")
          .upload(filePath, image, {
            cacheControl: "3600",
            upsert: false,
          });

        if (uploadError) {
          throw new Error(uploadError.message);
        }

        const { data: publicUrlData } = supabase.storage
          .from("business-images")
          .getPublicUrl(filePath);

        imageUrl = publicUrlData.publicUrl;
      }

      const { error: insertError } = await supabase
        .from("businesses")
        .insert({
          business_name: businessName.trim(),
          category: category.trim(),
          address: address.trim(),
          area: area.trim(),
          landmark: landmark.trim(),
          city: city.trim(),
          state: state.trim(),
          pincode: pincode.trim(),
          phone: phone.trim(),
          maps_url: mapsUrl.trim() || null,
          latitude: parsedLatitude,
          longitude: parsedLongitude,
          owner_id: user.id,
          image_url: imageUrl || null,
        });

      if (insertError) {
        throw new Error(insertError.message);
      }

      setMessage("Business successfully listed! ✅");

      setBusinessName("");
      setCategory("");
      setAddress("");
      setArea("");
      setLandmark("");
      setCity("");
      setState("");
      setPincode("");
      setPhone("");
      setMapsUrl("");
      setLatitude("");
      setLongitude("");
      setImage(null);
      setImagePreview("");

      setTimeout(() => {
        router.push("/dashboard");
      }, 1200);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "कुछ गलत हो गया।"
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleLogout() {
    await supabase.auth.signOut();
    router.replace("/login");
  }

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gray-50">
        <p className="text-gray-600">Loading...</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <header className="border-b bg-white">
        <div className="mx-auto flex max-w-4xl items-center justify-between gap-3 px-4 py-4 sm:px-6">
          <Link
            href="/"
            className="text-xl font-bold text-blue-600 sm:text-2xl"
          >
            LocalPlatform
          </Link>

          <div className="flex gap-2 sm:gap-3">
            <Link
              href="/dashboard"
              className="rounded-lg border border-gray-300 px-3 py-2 text-sm hover:bg-gray-100 sm:px-4"
            >
              Dashboard
            </Link>

            <button
              type="button"
              onClick={handleLogout}
              className="rounded-lg border border-gray-300 px-3 py-2 text-sm hover:bg-gray-100 sm:px-4"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <section className="mx-auto w-full max-w-3xl px-4 py-6 sm:px-6 sm:py-10">
        <div className="rounded-2xl border bg-white p-5 shadow-sm sm:rounded-3xl sm:p-8">
          <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">
            List Your Business
          </h1>

          <p className="mt-2 text-sm text-gray-600 sm:text-base">
            अपने business की पूरी जानकारी भरें ताकि customers आपको आसानी से
            खोज सकें।
          </p>

          <form onSubmit={handleSubmit} className="mt-8 space-y-6">
            {/* PHOTO */}
            <div>
              <label className="mb-2 block font-semibold text-gray-800">
                Business Photo / Logo
              </label>

              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="w-full rounded-xl border border-gray-300 p-3"
              />

              <p className="mt-1 text-sm text-gray-500">
                JPG, PNG या WebP — अधिकतम 5 MB
              </p>

              {imagePreview && (
                <div className="mt-4">
                  <img
                    src={imagePreview}
                    alt="Business preview"
                    className="h-40 w-40 rounded-xl border object-cover"
                  />
                </div>
              )}
            </div>

            {/* BUSINESS BASIC INFO */}
            <div className="border-t pt-6">
              <h2 className="text-xl font-bold text-gray-900">
                Business Information
              </h2>

              <div className="mt-5 space-y-5">
                <div>
                  <label className="mb-2 block font-semibold text-gray-800">
                    Business Name *
                  </label>

                  <input
                    type="text"
                    required
                    value={businessName}
                    onChange={(e) => setBusinessName(e.target.value)}
                    placeholder="जैसे ABC Architects"
                    className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
                  />
                </div>

                <div>
                  <label className="mb-2 block font-semibold text-gray-800">
                    Category *
                  </label>

                  <input
                    type="text"
                    required
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    placeholder="जैसे Architect, Restaurant, Doctor"
                    className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
                  />
                </div>

                <div>
                  <label className="mb-2 block font-semibold text-gray-800">
                    Phone Number *
                  </label>

                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="जैसे 9876543210"
                    className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
                  />
                </div>
              </div>
            </div>

            {/* ADDRESS */}
            <div className="border-t pt-6">
              <h2 className="text-xl font-bold text-gray-900">
                Business Address
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                पूरा address डालें ताकि customer सही location तक पहुँच सके।
              </p>

              <div className="mt-5 space-y-5">
                <div>
                  <label className="mb-2 block font-semibold text-gray-800">
                    Complete Address *
                  </label>

                  <textarea
                    required
                    rows={3}
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="House/Shop No., Building, Road, Street..."
                    className="w-full resize-none rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
                  />
                </div>

                <div>
                  <label className="mb-2 block font-semibold text-gray-800">
                    Area / Locality
                  </label>

                  <input
                    type="text"
                    value={area}
                    onChange={(e) => setArea(e.target.value)}
                    placeholder="जैसे Gomti Nagar"
                    className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
                  />
                </div>

                <div>
                  <label className="mb-2 block font-semibold text-gray-800">
                    Landmark
                  </label>

                  <input
                    type="text"
                    value={landmark}
                    onChange={(e) => setLandmark(e.target.value)}
                    placeholder="जैसे Near Phoenix Mall"
                    className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
                  />
                </div>

                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                  <div>
                    <label className="mb-2 block font-semibold text-gray-800">
                      City *
                    </label>

                    <input
                      type="text"
                      required
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      placeholder="Lucknow"
                      className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block font-semibold text-gray-800">
                      State *
                    </label>

                    <input
                      type="text"
                      required
                      value={state}
                      onChange={(e) => setState(e.target.value)}
                      placeholder="Uttar Pradesh"
                      className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-2 block font-semibold text-gray-800">
                    Pincode *
                  </label>

                  <input
                    type="text"
                    inputMode="numeric"
                    maxLength={6}
                    required
                    value={pincode}
                    onChange={(e) =>
                      setPincode(e.target.value.replace(/\D/g, ""))
                    }
                    placeholder="226010"
                    className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
                  />
                </div>
              </div>
            </div>

            {/* GOOGLE MAPS */}
            <div className="border-t pt-6">
              <h2 className="text-xl font-bold text-gray-900">
                Google Maps Location
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                Google Maps से location का link paste करें।
              </p>

              <div className="mt-5 space-y-5">
                <div>
                  <label className="mb-2 block font-semibold text-gray-800">
                    Google Maps URL
                  </label>

                  <input
                    type="url"
                    value={mapsUrl}
                    onChange={(e) => setMapsUrl(e.target.value)}
                    placeholder="https://maps.google.com/..."
                    className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
                  />
                </div>

                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                  <div>
                    <label className="mb-2 block font-semibold text-gray-800">
                      Latitude
                    </label>

                    <input
                      type="number"
                      step="any"
                      value={latitude}
                      onChange={(e) => setLatitude(e.target.value)}
                      placeholder="26.8467"
                      className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block font-semibold text-gray-800">
                      Longitude
                    </label>

                    <input
                      type="number"
                      step="any"
                      value={longitude}
                      onChange={(e) => setLongitude(e.target.value)}
                      placeholder="80.9462"
                      className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* MESSAGES */}
            {error && (
              <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-700">
                {error}
              </div>
            )}

            {message && (
              <div className="rounded-xl border border-green-200 bg-green-50 p-4 text-sm font-medium text-green-700">
                {message}
              </div>
            )}

            {/* SUBMIT */}
            <button
              type="submit"
              disabled={saving}
              className="w-full rounded-xl bg-blue-600 px-5 py-4 font-bold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {saving ? "Saving..." : "List My Business"}
            </button>
          </form>
        </div>
      </section>
    </main>
  );
}