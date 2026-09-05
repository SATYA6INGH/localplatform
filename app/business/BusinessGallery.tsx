"use client";

import { useEffect, useRef, useState } from "react";
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

type Photo = {
  id: string;
  business_id: string;
  user_id: string | null;
  image_url: string;
  caption: string | null;
  created_at: string;
};

export default function BusinessGallery({
  businessId,
}: {
  businessId: string;
}) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [photos, setPhotos] = useState<Photo[]>([]);
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null);

  useEffect(() => {
    loadGallery();
  }, [businessId]);

  async function loadGallery() {
    setLoading(true);
    setError("");

    const {
      data: { user },
    } = await supabase.auth.getUser();

    setUserId(user?.id ?? null);

    const { data, error } = await supabase
      .from("business_photos")
      .select(
        "id, business_id, user_id, image_url, caption, created_at"
      )
      .eq("business_id", businessId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error(error);
      setError("Photos load nahi ho paayi.");
      setLoading(false);
      return;
    }

    setPhotos((data || []) as Photo[]);
    setLoading(false);
  }

  async function uploadPhoto(
    event: React.ChangeEvent<HTMLInputElement>
  ) {
    const file = event.target.files?.[0];

    if (!file) return;

    setError("");
    setMessage("");

    if (!userId) {
      setError("Photo upload karne ke liye login karein.");
      return;
    }

    if (!file.type.startsWith("image/")) {
      setError("Sirf image file upload karein.");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError("Image maximum 5MB ki honi chahiye.");
      return;
    }

    setUploading(true);

    try {
      const extension =
        file.name.split(".").pop()?.toLowerCase() || "jpg";

      const filePath = `${businessId}/${userId}-${Date.now()}.${extension}`;

      const { error: uploadError } = await supabase.storage
        .from("business-images")
        .upload(filePath, file, {
          cacheControl: "3600",
          upsert: false,
          contentType: file.type,
        });

      if (uploadError) {
        console.error(uploadError);
        setError("Photo upload nahi ho paayi.");
        setUploading(false);
        return;
      }

      const {
        data: { publicUrl },
      } = supabase.storage
        .from("business-images")
        .getPublicUrl(filePath);

      const { error: insertError } = await supabase
        .from("business_photos")
        .insert({
          business_id: businessId,
          user_id: userId,
          image_url: publicUrl,
          caption: file.name,
        });

      if (insertError) {
        console.error(insertError);
        setError("Photo database mein save nahi ho paayi.");
        setUploading(false);
        return;
      }

      setMessage("Photo successfully add ho gayi.");

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }

      await loadGallery();
    } catch (err) {
      console.error(err);
      setError("Photo upload mein problem aayi.");
    }

    setUploading(false);
  }

  async function deletePhoto(photo: Photo) {
    if (!userId || photo.user_id !== userId) {
      setError("Aap sirf apni uploaded photo delete kar sakte hain.");
      return;
    }

    const confirmed = window.confirm(
      "Kya aap ye photo delete karna chahte hain?"
    );

    if (!confirmed) return;

    setError("");
    setMessage("");

    const { error } = await supabase
      .from("business_photos")
      .delete()
      .eq("id", photo.id)
      .eq("user_id", userId);

    if (error) {
      console.error(error);
      setError("Photo delete nahi ho paayi.");
      return;
    }

    setPhotos((current) =>
      current.filter((item) => item.id !== photo.id)
    );

    setMessage("Photo delete ho gayi.");
  }

  return (
    <section className="mt-10 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-8">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-900">
            📸 Business Photos
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Business ki photos dekhein aur new photos add karein.
          </p>
        </div>

        {userId ? (
          <>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={uploadPhoto}
              className="hidden"
            />

            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="rounded-xl bg-blue-600 px-5 py-3 font-bold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {uploading ? "Uploading..." : "＋ Add Photo"}
            </button>
          </>
        ) : (
          <a
            href="/login"
            className="rounded-xl border border-blue-200 px-5 py-3 text-center font-bold text-blue-600 hover:bg-blue-50"
          >
            Login to Add Photo
          </a>
        )}
      </div>

      {error && (
        <div className="mt-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
          {error}
        </div>
      )}

      {message && (
        <div className="mt-5 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm font-semibold text-green-700">
          {message}
        </div>
      )}

      {loading ? (
        <div className="mt-6 rounded-2xl bg-slate-50 p-10 text-center text-slate-500">
          Photos load ho rahi hain...
        </div>
      ) : photos.length === 0 ? (
        <div className="mt-6 rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-10 text-center">
          <div className="text-5xl">📷</div>

          <p className="mt-3 font-bold text-slate-700">
            Abhi koi business photo nahi hai
          </p>

          <p className="mt-1 text-sm text-slate-500">
            Login karke first photo add karein.
          </p>
        </div>
      ) : (
        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
          {photos.map((photo) => (
            <div
              key={photo.id}
              className="group relative overflow-hidden rounded-2xl bg-slate-100"
            >
              <button
                type="button"
                onClick={() => setSelectedPhoto(photo)}
                className="block aspect-square w-full"
              >
                <img
                  src={photo.image_url}
                  alt={photo.caption || "Business photo"}
                  className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                />
              </button>

              {userId && photo.user_id === userId && (
                <button
                  type="button"
                  onClick={() => deletePhoto(photo)}
                  className="absolute right-2 top-2 rounded-lg bg-red-600 px-2.5 py-1.5 text-xs font-bold text-white shadow hover:bg-red-700"
                >
                  Delete
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {selectedPhoto && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 p-4"
          onClick={() => setSelectedPhoto(null)}
        >
          <div
            className="relative max-h-[90vh] max-w-5xl"
            onClick={(event) => event.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setSelectedPhoto(null)}
              className="absolute right-2 top-2 z-10 rounded-full bg-black/70 px-4 py-2 text-xl font-bold text-white"
            >
              ×
            </button>

            <img
              src={selectedPhoto.image_url}
              alt={selectedPhoto.caption || "Business photo"}
              className="max-h-[85vh] max-w-full rounded-2xl object-contain"
            />
          </div>
        </div>
      )}
    </section>
  );
}