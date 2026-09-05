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
  const [city, setCity] = useState("");
  const [phone, setPhone] = useState("");

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
        .select("id, business_name, category, city, phone")
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
        setCity(data.city || "");
        setPhone(data.phone || "");
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
        city: city.trim(),
        phone: phone.trim(),
      })
      .eq("id", id)
      .eq("owner_id", user.id);

    if (error) {
      console.error(error);
      setErrorMessage(`Update nahi hua: ${error.message}`);
    } else {
      setMessage("Business successfully updated! ✅");

      setTimeout(() => {
        router.push("/dashboard");
      }, 1000);
    }

    setSaving(false);
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
            Apne business ki information update karein.
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

              <div>
                <label className="mb-2 block font-semibold">
                  Business Name
                </label>

                <input
                  required
                  value={businessName}
                  onChange={(e) =>
                    setBusinessName(e.target.value)
                  }
                  className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
                />
              </div>


              <div>
                <label className="mb-2 block font-semibold">
                  Category
                </label>

                <input
                  required
                  value={category}
                  onChange={(e) =>
                    setCategory(e.target.value)
                  }
                  className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
                />
              </div>


              <div>
                <label className="mb-2 block font-semibold">
                  City
                </label>

                <input
                  required
                  value={city}
                  onChange={(e) =>
                    setCity(e.target.value)
                  }
                  className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
                />
              </div>


              <div>
                <label className="mb-2 block font-semibold">
                  Phone Number
                </label>

                <input
                  required
                  type="tel"
                  value={phone}
                  onChange={(e) =>
                    setPhone(e.target.value)
                  }
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