import Link from "next/link";
import type { Business } from "./types";

export default function BusinessCard({
  business,
}: {
  business: Business;
}) {
  const detailSlug =
    business.business_name
      ?.toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "") || business.id;

  const detailHref = `/business/${detailSlug}`;

  const whatsappNumber = business.phone
    ? business.phone.replace(/\D/g, "")
    : "";

  return (
    <article className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:shadow-md">
      <div className="flex gap-3 p-3 sm:p-4">
        <div className="h-24 w-24 shrink-0 overflow-hidden rounded-xl bg-slate-100">
          {business.image_url ? (
            <img
              src={business.image_url}
              alt={business.business_name}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-3xl">
              🏪
            </div>
          )}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <Link
                href={detailHref}
                className="line-clamp-1 text-base font-extrabold text-slate-900 hover:text-blue-600"
              >
                {business.business_name}
              </Link>

              <div className="mt-1 text-xs font-semibold text-slate-500">
                {business.category}
              </div>
            </div>

            <span className="shrink-0 rounded-full bg-emerald-50 px-2 py-1 text-[10px] font-bold text-emerald-700">
              Local
            </span>
          </div>

          <p className="mt-2 line-clamp-2 text-xs leading-5 text-slate-600">
            {business.short_description ||
              business.description ||
              "Local business and service provider."}
          </p>

          <div className="mt-2 line-clamp-1 text-xs text-slate-500">
            📍{" "}
            {[business.area, business.city]
              .filter(Boolean)
              .join(", ") || "Location available"}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 border-t border-slate-100">
        {business.phone ? (
          <a
            href={`tel:${business.phone}`}
            className="py-3 text-center text-xs font-bold text-blue-600 hover:bg-blue-50"
          >
            Call
          </a>
        ) : (
          <span className="py-3 text-center text-xs font-bold text-slate-300">
            Call
          </span>
        )}

        {whatsappNumber ? (
          <a
            href={`https://wa.me/${whatsappNumber}`}
            target="_blank"
            rel="noreferrer"
            className="border-x border-slate-100 py-3 text-center text-xs font-bold text-emerald-600 hover:bg-emerald-50"
          >
            WhatsApp
          </a>
        ) : (
          <span className="border-x border-slate-100 py-3 text-center text-xs font-bold text-slate-300">
            WhatsApp
          </span>
        )}

        <Link
          href={detailHref}
          className="py-3 text-center text-xs font-bold text-slate-700 hover:bg-slate-50"
        >
          View Profile
        </Link>
      </div>
    </article>
  );
}