"use client";

import { useEffect, useState } from "react";

type Business = {
  id: string;
  business_name: string;
  category: string;
  city: string;
  phone: string | null;
  image_url?: string | null;
};

const SUPABASE_URL = "https://ckuiskbegrlrethnlhzq.supabase.co";
const SUPABASE_KEY =
  "sb_publishable_RnrbgHC56vWK6cSA1hmfkA_VVP74VPL";

export default function SearchPage() {
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadBusinesses();
  }, []);

  async function loadBusinesses() {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        `${SUPABASE_URL}/rest/v1/businesses?select=id,business_name,category,city,phone,image_url&order=created_at.desc`,
        {
          method: "GET",
          headers: {
            apikey: SUPABASE_KEY,
            Authorization: `Bearer ${SUPABASE_KEY}`,
            "Content-Type": "application/json",
          },
          cache: "no-store",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data?.message ||
            data?.error_description ||
            "Unable to load businesses"
        );
      }

      setBusinesses(Array.isArray(data) ? data : []);
    } catch (err: any) {
      console.error("SEARCH ERROR:", err);
      setError(err?.message || "Unable to load businesses");
      setBusinesses([]);
    } finally {
      setLoading(false);
    }
  }

  const filteredBusinesses = businesses.filter((business) => {
    const text = search.trim().toLowerCase();

    const matchesSearch =
      !text ||
      business.business_name?.toLowerCase().includes(text) ||
      business.category?.toLowerCase().includes(text) ||
      business.city?.toLowerCase().includes(text);

    const matchesCategory =
      category === "all" ||
      business.category?.toLowerCase() === category.toLowerCase();

    return matchesSearch && matchesCategory;
  });

  const categories = Array.from(
    new Set(
      businesses
        .map((business) => business.category)
        .filter(Boolean)
    )
  );

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#f7f8fa",
        padding: "40px 20px",
      }}
    >
      <div
        style={{
          maxWidth: "1100px",
          margin: "0 auto",
        }}
      >
        <h1
          style={{
            fontSize: "36px",
            fontWeight: 800,
            marginBottom: "10px",
          }}
        >
          Find Local Businesses
        </h1>

        <p
          style={{
            color: "#666",
            marginBottom: "30px",
          }}
        >
          Search businesses by name, category or city.
        </p>

        <div
          style={{
            display: "flex",
            gap: "12px",
            flexWrap: "wrap",
            marginBottom: "20px",
          }}
        >
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search business, category or city..."
            style={{
              flex: 1,
              minWidth: "280px",
              padding: "15px 18px",
              border: "1px solid #ddd",
              borderRadius: "10px",
              fontSize: "16px",
              background: "#fff",
              outline: "none",
            }}
          />

          <button
            onClick={loadBusinesses}
            style={{
              padding: "15px 22px",
              border: "none",
              borderRadius: "10px",
              background: "#111",
              color: "#fff",
              fontWeight: 700,
              cursor: "pointer",
            }}
          >
            Refresh
          </button>
        </div>

        <div
          style={{
            display: "flex",
            gap: "8px",
            flexWrap: "wrap",
            marginBottom: "30px",
          }}
        >
          <button
            onClick={() => setCategory("all")}
            style={{
              padding: "9px 16px",
              borderRadius: "20px",
              border: "1px solid #ddd",
              background: category === "all" ? "#111" : "#fff",
              color: category === "all" ? "#fff" : "#111",
              cursor: "pointer",
            }}
          >
            All
          </button>

          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              style={{
                padding: "9px 16px",
                borderRadius: "20px",
                border: "1px solid #ddd",
                background:
                  category.toLowerCase() === cat.toLowerCase()
                    ? "#111"
                    : "#fff",
                color:
                  category.toLowerCase() === cat.toLowerCase()
                    ? "#fff"
                    : "#111",
                cursor: "pointer",
              }}
            >
              {cat}
            </button>
          ))}
        </div>

        {loading && (
          <div
            style={{
              background: "#fff",
              padding: "30px",
              borderRadius: "14px",
              textAlign: "center",
            }}
          >
            Loading businesses...
          </div>
        )}

        {!loading && error && (
          <div
            style={{
              background: "#fff",
              padding: "25px",
              borderRadius: "14px",
              color: "#c00",
            }}
          >
            <strong>Database Error:</strong>
            <br />
            {error}
          </div>
        )}

        {!loading && !error && (
          <>
            <div
              style={{
                marginBottom: "18px",
                fontWeight: 700,
              }}
            >
              {filteredBusinesses.length} BUSINESS
              {filteredBusinesses.length !== 1 ? "ES" : ""} FOUND
            </div>

            {filteredBusinesses.length === 0 ? (
              <div
                style={{
                  background: "#fff",
                  padding: "40px",
                  borderRadius: "14px",
                  textAlign: "center",
                  color: "#666",
                }}
              >
                No businesses found.
              </div>
            ) : (
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns:
                    "repeat(auto-fit, minmax(280px, 1fr))",
                  gap: "20px",
                }}
              >
                {filteredBusinesses.map((business) => (
                  <div
                    key={business.id}
                    style={{
                      background: "#fff",
                      borderRadius: "16px",
                      overflow: "hidden",
                      border: "1px solid #eee",
                      boxShadow: "0 4px 15px rgba(0,0,0,0.06)",
                    }}
                  >
                    {business.image_url && (
                      <img
                        src={business.image_url}
                        alt={business.business_name}
                        style={{
                          width: "100%",
                          height: "190px",
                          objectFit: "cover",
                          display: "block",
                        }}
                      />
                    )}

                    <div style={{ padding: "20px" }}>
                      <h2
                        style={{
                          fontSize: "21px",
                          margin: "0 0 10px",
                        }}
                      >
                        {business.business_name}
                      </h2>

                      <div
                        style={{
                          color: "#555",
                          marginBottom: "6px",
                        }}
                      >
                        📂 {business.category}
                      </div>

                      <div
                        style={{
                          color: "#555",
                          marginBottom: "6px",
                        }}
                      >
                        📍 {business.city}
                      </div>

                      {business.phone && (
                        <div
                          style={{
                            color: "#555",
                            marginBottom: "16px",
                          }}
                        >
                          📞 {business.phone}
                        </div>
                      )}

                      <a
                        href={`/business/${business.id}`}
                        style={{
                          display: "inline-block",
                          padding: "11px 18px",
                          borderRadius: "9px",
                          background: "#111",
                          color: "#fff",
                          textDecoration: "none",
                          fontWeight: 700,
                        }}
                      >
                        View Business
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </main>
  );
}