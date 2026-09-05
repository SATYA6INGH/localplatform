"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
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

export default function EditBusiness() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

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

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    async function loadBusiness() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.replace("/login");
        return;
      }

      const { data, error } = await supabase
        .from("businesses")
        .select(
          "id, business_name, category, address, area, landmark, city, state, pincode, phone, maps_url, latitude, longitude"
        )
        .eq("id", id)
        .eq("owner_id", user.id)
        .maybeSingle();

      if (error) {
        console.error(error);
        setErrorMessage(error.message);
      } else if (!data) {
        setErrorMessage(
          "Business nahi mila ya aapko is business ko edit karne ki permission nahi hai."
        );
      } else {
        setBusinessName(data.business_name || "");
        setCategory(data.category || "");
        setAddress(data.address || "");
        setArea(data.area || "");
        setLandmark(data.landmark || "");
        setCity(data.city || "");
        setState(data.state || "");
        setPincode(data.pincode || "");
        setPhone(data.phone || "");
        setMapsUrl(data.maps_url || "");
        setLatitude(
          data.latitude !== null && data.latitude !== undefined
            ? String(data.latitude)
            : ""
        );
        setLongitude(
          data.longitude !== null && data.longitude !== undefined
            ? String(data.longitude)
            : ""
        );
      }

      setLoading(false);
    }

    if (id) {
      loadBusiness();
    }
  }, [id, router]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    setSaving(true);
    setMessage("");
    setErrorMessage("");

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

      if (!/^\d{6}$/.test(pincode.trim())) {
        throw new Error("Pincode 6 digit का होना चाहिए।");
      }

      if (!phone.trim()) {
        throw new Error("Phone Number भरें।");
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
        router.replace("/login");
        return;
      }

      const { error } = await supabase
        .from("businesses")
        .update({
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
        })
        .eq("id", id)
        .eq("owner_id", user.id);

      if (error) {
        console.error(error);
        throw new Error(`Update nahi hua: ${error.message}`);
      }

      setMessage("Business successfully updated! ✅");

      setTimeout(() => {
        router.push("/dashboard");
      }, 1000);
    } catch (err) {
      setErrorMessage(
        err instanceof Error ? err.message : "कुछ गलत हो गया।"
      );
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="text-lg font-semibold text-slate-700">
          Loading business...
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-6 sm:px-6 sm:py-10">
      <div className="mx-auto max-w-2xl">
        <div className="mb-6 flex items-center justify-between">
          <button
            type="button"
            onClick={() => router.push("/dashboard")}
            className="font-semibold text-blue-600 hover:text-blue-700"
          >
            ← Dashboard
          </button>

          <button
            type="button"
            onClick={() => router.push("/")}
            className="font-semibold text-slate-600 hover:text-blue-600"
          >
            Home
          </button>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-lg sm:p-8">
          <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">
            Edit Business
          </h1>

          <p className="mt-2 text-sm text-slate-500 sm:text-base">
            अपने business की पूरी information update करें।
          </p>

          {errorMessage && (
            <div className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-700">
              {errorMessage}
            </div>
          )}

          {message && (
            <div className="mt-6 rounded-xl border border-green-200 bg-green-50 p-4 text-sm font-medium text-green-700">
              {message}
            </div>
          )}

          {!errorMessage && (
            <form onSubmit={handleSubmit} className="mt-8 space-y-6">
              {/* BASIC INFORMATION */}
              <div>
                <h2 className="mb-4 text-xl font-bold text-slate-900">
                  Business Information
                </h2>

                <div className="space-y-5">
                  <div>
                    <label className="mb-2 block font-semibold">
                      Business Name *
                    </label>
                    <input
                      required
                      value={businessName}
                      onChange={(e) => setBusinessName(e.target.value)}
                      className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block font-semibold">
                      Category *
                    </label>
                    <input
                      required
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block font-semibold">
                      Phone Number *
                    </label>
                    <input
                      required
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
                    />
                  </div>
                </div>
              </div>

              {/* ADDRESS */}
              <div className="border-t border-slate-200 pt-6">
                <h2 className="mb-2 text-xl font-bold text-slate-900">
                  Business Address
                </h2>

                <p className="mb-5 text-sm text-slate-500">
                  Customer को सही location दिखाने के लिए पूरा address भरें।
                </p>

                <div className="space-y-5">
                  <div>
                    <label className="mb-2 block font-semibold">
                      Complete Address *
                    </label>

                    <textarea
                      required
                      rows={3}
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      placeholder="House/Shop No., Building, Road, Street..."
                      className="w-full resize-none rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block font-semibold">
                      Area / Locality
                    </label>

                    <input
                      value={area}
                      onChange={(e) => setArea(e.target.value)}
                      placeholder="जैसे Gomti Nagar"
                      className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block font-semibold">
                      Landmark
                    </label>

                    <input
                      value={landmark}
                      onChange={(e) => setLandmark(e.target.value)}
                      placeholder="जैसे Near Phoenix Mall"
                      className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
                    />
                  </div>

                  <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                    <div>
                      <label className="mb-2 block font-semibold">
                        City *
                      </label>

                      <input
                        required
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
                      />
                    </div>

                    <div>
                      <label className="mb-2 block font-semibold">
                        State *
                      </label>

                      <input
                        required
                        value={state}
                        onChange={(e) => setState(e.target.value)}
                        className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="mb-2 block font-semibold">
                      Pincode *
                    </label>

                    <input
                      required
                      inputMode="numeric"
                      maxLength={6}
                      value={pincode}
                      onChange={(e) =>
                        setPincode(e.target.value.replace(/\D/g, ""))
                      }
                      placeholder="226010"
                      className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
                    />
                  </div>
                </div>
              </div>

              {/* MAP LOCATION */}
              <div className="border-t border-slate-200 pt-6">
                <h2 className="mb-2 text-xl font-bold text-slate-900">
                  Google Maps Location
                </h2>

                <p className="mb-5 text-sm text-slate-500">
                  Google Maps location customer को directions देने में मदद करेगी।
                </p>

                <div className="space-y-5">
                  <div>
                    <label className="mb-2 block font-semibold">
                      Google Maps URL
                    </label>

                    <input
                      type="url"
                      value={mapsUrl}
                      onChange={(e) => setMapsUrl(e.target.value)}
                      placeholder="https://maps.google.com/..."
                      className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
                    />
                  </div>

                  <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                    <div>
                      <label className="mb-2 block font-semibold">
                        Latitude
                      </label>

                      <input
                        type="number"
                        step="any"
                        value={latitude}
                        onChange={(e) => setLatitude(e.target.value)}
                        placeholder="26.8467"
                        className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
                      />
                    </div>

                    <div>
                      <label className="mb-2 block font-semibold">
                        Longitude
                      </label>

                      <input
                        type="number"
                        step="any"
                        value={longitude}
                        onChange={(e) => setLongitude(e.target.value)}
                        placeholder="80.9462"
                        className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={saving}
                className="w-full rounded-xl bg-blue-600 px-5 py-4 font-bold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {saving ? "Saving..." : "Save Changes"}
              </button>
            </form>
          )}
        </div>
      </div>
    </main>
  );
}