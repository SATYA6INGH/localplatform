"use client";

import { useRouter } from "next/navigation";
import { Business } from "./types";

export default function BusinessCard({
  business,
}: {
  business: Business;
}) {
  const router = useRouter();

  return (
    <article className="lp-business-card">
      <button
        className="lp-business-main"
        onClick={() => router.push(`/business/${business.id}`)}
      >
        <div
          className="lp-business-image"
          style={{
            backgroundImage: `url("${business.image}")`,
          }}
        />

        <div className="lp-business-details">
          <div className="lp-business-title">
            <h3>{business.name}</h3>

            <span>♡</span>
          </div>

          <div className="lp-business-rating">
            <b>● Open Now</b>

            <strong>★ {business.rating}</strong>

            <span>({business.reviews})</span>
          </div>

          <p>⌖ {business.area}</p>

          <p>⌁ {business.category}</p>

          <div className="lp-offer">
            <span>♥</span>
            {business.offer}
          </div>
        </div>
      </button>

      <div className="lp-business-actions">
        <button
          onClick={() => {
            window.location.href = "tel:+919876543210";
          }}
        >
          ☎ Call
        </button>

        <button
          onClick={() => {
            window.open("https://wa.me/919876543210", "_blank");
          }}
        >
          ◉ WhatsApp
        </button>

        <button
          onClick={() => {
            router.push("/chat");
          }}
        >
          ◌ Chat
        </button>
      </div>
    </article>
  );
}