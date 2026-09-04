"use client";

import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import { useRouter } from "next/navigation";
import Link from "next/link";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
);

export default function ListBusinessPage() {
  const router = useRouter();

  const [businessName, setBusinessName] = useState("");
  const [category, setCategory] = useState("");
  const [city, setCity] = useState("");
  const [phone, setPhone] = useState("");

  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState("");

  const [userId, setUserId] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    async function checkUser() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push("/login");
        return;
      }

      setUserId(user.id);
      setLoading(false);
    }

    checkUser();
  }, [router]);

  function handleImageChange(
    e: React.ChangeEvent<HTMLInputElement>
  ) {
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

  async function handleSubmit(
    e: React.FormEvent<HTMLFormElement>
  ) {
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

      if (!city.trim()) {
        throw new Error("City भरें।");
      }

      if (!userId) {
        throw new Error("User login नहीं है।");
      }

      let imageUrl = "";

      // PHOTO UPLOAD
      if (image) {
        const fileExtension =
          image.name.split(".").pop()?.toLowerCase() || "jpg";

        const fileName = `${crypto.randomUUID()}.${fileExtension}`;

        const filePath = `${userId}/${fileName}`;

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

      // SAVE BUSINESS
      const { error: insertError } = await supabase
        .from("businesses")
        .insert({
          business_name: businessName.trim(),
          category: category.trim(),
          city: city.trim(),
          phone: phone.trim(),
          owner_id: userId,
          image_url: imageUrl || null,
        });

      if (insertError) {
        throw new Error(insertError.message);
      }

      setMessage("Business successfully listed! ✅");

      setBusinessName("");
      setCategory("");
      setCity("");
      setPhone("");
      setImage(null);
      setImagePreview("");

      setTimeout(() => {
        router.push("/dashboard");
      }, 1200);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "कुछ गलत हो गया।"
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push("/login");
  }

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <p>Loading...</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50">
      {/* HEADER */}
      <header className="bg-white border-b">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link
            href="/"
            className="text-2xl font-bold text-blue-600"
          >
            LocalPlatform
          </Link>

          <div className="flex gap-3">
            <Link
              href="/dashboard"
              className="border border-gray-300 px-4 py-2 rounded-lg hover:bg-gray-100"
            >
              Dashboard
            </Link>

            <button
              onClick={handleLogout}
              className="border border-gray-300 px-4 py-2 rounded-lg hover:bg-gray-100"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* FORM */}
      <section className="max-w-2xl mx-auto px-6 py-10">
        <div className="bg-white border rounded-2xl p-6 md:p-8 shadow-sm">
          <h1 className="text-3xl font-bold text-gray-900">
            List Your Business
          </h1>

          <p className="text-gray-600 mt-2 mb-8">
            अपने business की जानकारी भरें।
          </p>

          <form
            onSubmit={handleSubmit}
            className="space-y-5"
          >
            {/* IMAGE */}
            <div>
              <label className="block font-semibold text-gray-800 mb-2">
                Business Photo / Logo
              </label>

              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="w-full border border-gray-300 rounded-lg p-3"
              />

              <p className="text-sm text-gray-500 mt-1">
                JPG, PNG या WebP — अधिकतम 5 MB
              </p>

              {imagePreview && (
                <div className="mt-4">
                  <img
                    src={imagePreview}
                    alt="Business preview"
                    className="w-40 h-40 object-cover rounded-xl border"
                  />
                </div>
              )}
            </div>

            {/* BUSINESS NAME */}
            <div>
              <label className="block font-semibold text-gray-800 mb-2">
                Business Name
              </label>

              <input
                type="text"
                value={businessName}
                onChange={(e) =>
                  setBusinessName(e.target.value)
                }
                placeholder="जैसे ABC Architects"
                className="w-full border border-gray-300 rounded-lg px-4 py-3"
              />
            </div>

            {/* CATEGORY */}
            <div>
              <label className="block font-semibold text-gray-800 mb-2">
                Category
              </label>

              <input
                type="text"
                value={category}
                onChange={(e) =>
                  setCategory(e.target.value)
                }
                placeholder="जैसे Architect"
                className="w-full border border-gray-300 rounded-lg px-4 py-3"
              />
            </div>

            {/* CITY */}
            <div>
              <label className="block font-semibold text-gray-800 mb-2">
                City
              </label>

              <input
                type="text"
                value={city}
                onChange={(e) =>
                  setCity(e.target.value)
                }
                placeholder="जैसे Lucknow"
                className="w-full border border-gray-300 rounded-lg px-4 py-3"
              />
            </div>

            {/* PHONE */}
            <div>
              <label className="block font-semibold text-gray-800 mb-2">
                Phone
              </label>

              <input
                type="tel"
                value={phone}
                onChange={(e) =>
                  setPhone(e.target.value)
                }
                placeholder="जैसे 9005798632"
                className="w-full border border-gray-300 rounded-lg px-4 py-3"
              />
            </div>

            {/* ERROR */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-3">
                {error}
              </div>
            )}

            {/* SUCCESS */}
            {message && (
              <div className="bg-green-50 border border-green-200 text-green-700 rounded-lg p-3">
                {message}
              </div>
            )}

            {/* BUTTON */}
            <button
              type="submit"
              disabled={saving}
              className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50"
            >
              {saving
                ? "Saving..."
                : "List My Business"}
            </button>
          </form>
        </div>
      </section>
    </main>
  );
}