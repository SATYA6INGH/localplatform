"use client";

import { useEffect, useState, type ChangeEvent } from "react";
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
  const [city, setCity] = useState("");
  const [phone, setPhone] = useState("");

  const [currentImage, setCurrentImage] = useState("");
  const [newImage, setNewImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState("");

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
          "id, business_name, category, city, phone, image_url"
        )
        .eq("id", id)
        .eq("owner_id", user.id)
        .maybeSingle();

      if (error) {
        setErrorMessage(error.message);
      } else if (!data) {
        setErrorMessage(
          "Business nahi mila ya aapko is business ko edit karne ki permission nahi hai."
        );
      } else {
        setBusinessName(data.business_name || "");
        setCategory(data.category || "");
        setCity(data.city || "");
        setPhone(data.phone || "");
        setCurrentImage(data.image_url || "");
      }

      setLoading(false);
    }

    if (id) {
      loadBusiness();
    }
  }, [id, router]);

  function handleImageChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setErrorMessage("कृपया केवल image file चुनें।");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setErrorMessage("Image का size 5 MB से कम होना चाहिए।");
      return;
    }

    setErrorMessage("");
    setNewImage(file);
    setImagePreview(URL.createObjectURL(file));
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    setSaving(true);
    setMessage("");
    setErrorMessage("");

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.replace("/login");
        return;
      }

      let imageUrl = currentImage;

      if (newImage) {
        const extension =
          newImage.name.split(".").pop()?.toLowerCase() || "jpg";

        const fileName = `${crypto.randomUUID()}.${extension}`;
        const filePath = `${user.id}/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from("business-images")
          .upload(filePath, newImage, {
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

      const { error } = await supabase
        .from("businesses")
        .update({
          business_name: businessName.trim(),
          category: category.trim(),
          city: city.trim(),
          phone: phone.trim(),
          image_url: imageUrl || null,
        })
        .eq("id", id)
        .eq("owner_id", user.id);

      if (error) {
        throw new Error(error.message);
      }

      setMessage("Business successfully updated! ✅");

      setTimeout(() => {
        router.push("/dashboard");
      }, 1000);
    } catch (err) {
      setErrorMessage(
        err instanceof Error
          ? err.message
          : "Business update नहीं हो सका।"
      );
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="text-lg font-semibold">
          Loading business...
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 px-5 py-10">
      <div className="mx-auto max-w-xl">

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

        <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-lg md:p-10">

          <h1 className="text-3xl font-bold text-slate-900">
            Edit Business
          </h1>

          <p className="mt-2 text-slate-500">
            अपने business की information और photo update करें।
          </p>

          {errorMessage && (
            <div className="mt-6 rounded-xl bg-red-50 p-4 text-sm font-medium text-red-700">
              {errorMessage}
            </div>
          )}

          {message && (
            <div className="mt-6 rounded-xl bg-green-50 p-4 text-sm font-medium text-green-700">
              {message}
            </div>
          )}

          {!errorMessage && (
            <form
              onSubmit={handleSubmit}
              className="mt-8 space-y-5"
            >

              {/* BUSINESS PHOTO */}
              <div>
                <label className="mb-2 block font-semibold">
                  Business Photo / Logo
                </label>

                {imagePreview ? (
                  <img
                    src={imagePreview}
                    alt="New business preview"
                    className="mb-4 h-40 w-40 rounded-2xl border object-cover"
                  />
                ) : currentImage ? (
                  <img
                    src={currentImage}
                    alt={businessName}
                    className="mb-4 h-40 w-40 rounded-2xl border object-cover"
                  />
                ) : (
                  <div className="mb-4 flex h-40 w-40 items-center justify-center rounded-2xl border bg-slate-50 text-5xl">
                    🏢
                  </div>
                )}

                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="w-full rounded-xl border border-slate-300 p-3"
                />

                <p className="mt-1 text-sm text-slate-500">
                  JPG, PNG या WebP — अधिकतम 5 MB
                </p>
              </div>

              {/* BUSINESS NAME */}
              <div>
                <label className="mb-2 block font-semibold">
                  Business Name
                </label>

                <input
                  required
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
                />
              </div>

              {/* CATEGORY */}
              <div>
                <label className="mb-2 block font-semibold">
                  Category
                </label>

                <input
                  required
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
                />
              </div>

              {/* CITY */}
              <div>
                <label className="mb-2 block font-semibold">
                  City
                </label>

                <input
                  required
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
                />
              </div>

              {/* PHONE */}
              <div>
                <label className="mb-2 block font-semibold">
                  Phone Number
                </label>

                <input
                  required
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
                />
              </div>

              <button
                type="submit"
                disabled={saving}
                className="w-full rounded-xl bg-blue-600 px-5 py-3 font-bold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
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