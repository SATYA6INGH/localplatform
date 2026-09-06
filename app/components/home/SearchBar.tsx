"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

export default function SearchBar() {
  const router = useRouter();

  const [query, setQuery] = useState("");
  const [location, setLocation] = useState("");

  function submit(e: FormEvent) {
    e.preventDefault();

    const params = new URLSearchParams();

    if (query.trim()) {
      params.set("q", query.trim());
    }

    if (location.trim()) {
      params.set("location", location.trim());
    }

    router.push(
      `/search${params.toString() ? `?${params.toString()}` : ""}`
    );
  }

  return (
    <form
      onSubmit={submit}
      className="flex w-full flex-col gap-2 sm:flex-row sm:gap-0"
    >
      <label className="flex min-h-12 flex-1 items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 shadow-sm sm:rounded-r-none">
        <span>🔎</span>

        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="What are you looking for?"
          aria-label="What are you looking for"
          className="min-w-0 flex-1 bg-transparent text-sm text-slate-800 outline-none placeholder:text-slate-400"
        />
      </label>

      <label className="flex min-h-12 flex-1 items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 shadow-sm sm:rounded-none sm:border-l-0">
        <span>📍</span>

        <input
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          placeholder="City, area or pincode"
          aria-label="Location"
          className="min-w-0 flex-1 bg-transparent text-sm text-slate-800 outline-none placeholder:text-slate-400"
        />

        <button
          type="button"
          className="shrink-0 text-xs font-bold text-blue-600"
          onClick={() => {
            if (navigator.geolocation) {
              navigator.geolocation.getCurrentPosition(() => {});
            }
          }}
        >
          Near me
        </button>
      </label>

      <button
        type="submit"
        className="min-h-12 rounded-xl bg-blue-600 px-7 text-sm font-bold text-white hover:bg-blue-700 sm:rounded-l-none"
      >
        Search
      </button>
    </form>
  );
}