"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function SearchBar() {
  const router = useRouter();

  const [query, setQuery] = useState("");

  const search = () => {
    const value = query.trim();

    if (value) {
      router.push(
        `/search?q=${encodeURIComponent(value)}`
      );
    } else {
      router.push("/search");
    }
  };

  return (
    <div className="lp-search-box">

      <div className="lp-search-top">

        <span className="lp-search-icon">
          ⌕
        </span>

        <input
          value={query}
          onChange={(e) =>
            setQuery(e.target.value)
          }
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              search();
            }
          }}
          placeholder="Search business or service..."
        />

      </div>

      <div className="lp-search-bottom">

        <span className="lp-location-icon">
          ⌖
        </span>

        <span className="lp-current-city">
          Lucknow
        </span>

        <button
          type="button"
          onClick={search}
        >
          ⌕
        </button>

      </div>

    </div>
  );
}