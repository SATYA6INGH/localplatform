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
      storageKey: "localplatform-auth",
    },
  }
);

type Photo = {
  id: string;
  image_url: string;
  caption: string | null;
  user_id: string | null;
  created_at: string;
};

type Props = {
  businessId: string;
};

export default function BusinessGallery({
  businessId,
}: Props) {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const [selectedPhoto, setSelectedPhoto] =
    useState<Photo | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadGallery();
    loadUser();
  }, [businessId]);

  async function loadUser() {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    setUser(user);
  }

  async function loadGallery() {
    setLoading(true);

    const { data, error } = await supabase
      .from("business_photos")
      .select(
        "id, image_url, caption, user_id, created_at"
      )
      .eq("business_id", businessId)
      .order("created_at", {
        ascending: false,
      });

    if (!error) {
      setPhotos(data || []);
    }

    setLoading(false);
  }

  async function handleUpload(
    event: React.ChangeEvent<HTMLInputElement>
  ) {
    const file = event.target.files?.[0];

    if (!file) return;

    setError("");
    setMessage("");

    if (!user) {
      setError(
        "Photo upload करने के लिए पहले Login करें।"
      );
      return;
    }

    if (!file.type.startsWith("image/")) {
      setError("कृपया केवल image/photo upload करें।");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError(
        "Photo का size 5 MB से कम होना चाहिए।"
      );
      return;
    }

    setUploading(true);

    try {
      const extension =
        file.name.split(".").pop()?.toLowerCase() ||
        "jpg";

      const fileName = `${businessId}/${user.id}-${Date.now()}.${extension}`;

      const { error: uploadError } =
        await supabase.storage
          .from("business-images")
          .upload(fileName, file, {
            cacheControl: "3600",
            upsert: false,
          });

      if (uploadError) {
        throw new Error(uploadError.message);
      }

      const {
        data: publicUrlData,
      } = supabase.storage
        .from("business-images")
        .getPublicUrl(fileName);

      const imageUrl =
        publicUrlData.publicUrl;

      const { error: insertError } =
        await supabase
          .from("business_photos")
          .insert({
            business_id: businessId,
            user_id: user.id,
            image_url: imageUrl,
            caption: "",
          });

      if (insertError) {
        throw new Error(insertError.message);
      }

      setMessage("📸 Photo successfully add हो गई।");

      await loadGallery();
    } catch (err: any) {
      setError(
        err?.message ||
          "Photo upload नहीं हो पाई।"
      );
    } finally {
      setUploading(false);

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  }

  async function deletePhoto(photo: Photo) {
    if (!user || photo.user_id !== user.id) {
      return;
    }

    const confirmed = window.confirm(
      "क्या आप यह photo delete करना चाहते हैं?"
    );

    if (!confirmed) return;

    setError("");
    setMessage("");

    const { error: deleteError } =
      await supabase
        .from("business_photos")
        .delete()
        .eq("id", photo.id)
        .eq("user_id", user.id);

    if (deleteError) {
      setError(deleteError.message);
      return;
    }

    setPhotos((current) =>
      current.filter(
        (item) => item.id !== photo.id
      )
    );

    setSelectedPhoto(null);

    setMessage("Photo delete हो गई।");
  }

  return (
    <>
      <section className="mt-12 border-t pt-10">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-blue-600">
              Business Photos
            </p>

            <h2 className="mt-1 text-3xl font-bold text-gray-900">
              Photo Gallery
            </h2>

            <p className="mt-2 text-gray-500">
              Business की photos देखें और अपने experience
              की photo share करें।
            </p>
          </div>

          {user && (
            <div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleUpload}
                className="hidden"
                id={`gallery-upload-${businessId}`}
              />

              <label
                htmlFor={`gallery-upload-${businessId}`}
                className={`inline-flex cursor-pointer items-center justify-center rounded-xl bg-black px-5 py-3 font-bold text-white transition hover:bg-gray-800 ${
                  uploading
                    ? "pointer-events-none opacity-60"
                    : ""
                }`}
              >
                {uploading
                  ? "Uploading..."
                  : "📸 Add Photo"}
              </label>
            </div>
          )}
        </div>

        {error && (
          <div className="mt-5 rounded-xl bg-red-50 p-4 text-sm font-medium text-red-700">
            {error}
          </div>
        )}

        {message && (
          <div className="mt-5 rounded-xl bg-green-50 p-4 text-sm font-medium text-green-700">
            {message}
          </div>
        )}

        {!user && (
          <div className="mt-6 rounded-2xl bg-gray-50 p-5 text-sm text-gray-600">
            📸 Photo add करने के लिए Login करें।
          </div>
        )}

        {loading ? (
          <div className="mt-8 rounded-2xl bg-gray-50 p-8 text-center text-gray-500">
            Gallery loading...
          </div>
        ) : photos.length === 0 ? (
          <div className="mt-8 rounded-2xl border border-dashed p-10 text-center">
            <div className="text-5xl">📸</div>

            <h3 className="mt-4 text-xl font-bold text-gray-900">
              No photos yet
            </h3>

            <p className="mt-2 text-gray-500">
              इस business की पहली photo add करें।
            </p>
          </div>
        ) : (
          <div className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-3">
            {photos.map((photo) => (
              <div
                key={photo.id}
                className="group relative overflow-hidden rounded-2xl bg-gray-100"
              >
                <button
                  type="button"
                  onClick={() =>
                    setSelectedPhoto(photo)
                  }
                  className="block h-full w-full"
                >
                  <img
                    src={photo.image_url}
                    alt={
                      photo.caption ||
                      "Business photo"
                    }
                    className="aspect-square w-full object-cover transition duration-300 group-hover:scale-105"
                  />
                </button>

                {photo.user_id === user?.id && (
                  <button
                    type="button"
                    onClick={() =>
                      deletePhoto(photo)
                    }
                    className="absolute right-2 top-2 rounded-lg bg-black/75 px-3 py-2 text-xs font-bold text-white opacity-100 transition hover:bg-red-600"
                  >
                    Delete
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </section>

      {/* PHOTO LIGHTBOX */}
      {selectedPhoto && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4"
          onClick={() => setSelectedPhoto(null)}
        >
          <button
            type="button"
            onClick={() =>
              setSelectedPhoto(null)
            }
            className="absolute right-5 top-5 rounded-full bg-white/20 px-4 py-2 text-2xl font-bold text-white"
          >
            ×
          </button>

          <img
            src={selectedPhoto.image_url}
            alt={
              selectedPhoto.caption ||
              "Business photo"
            }
            className="max-h-[90vh] max-w-full rounded-2xl object-contain shadow-2xl"
            onClick={(event) =>
              event.stopPropagation()
            }
          />
        </div>
      )}
    </>
  );
}