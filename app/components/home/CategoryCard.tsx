import Link from "next/link";
import type { Category } from "./types";

export default function CategoryCard({
  category,
}: {
  category: Category;
}) {
  const slug = category.name
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

  return (
    <Link
      href={`/category/${slug}`}
      className="group flex min-h-[100px] flex-col items-center justify-center rounded-2xl border border-slate-100 bg-white p-3 text-center shadow-sm transition hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-md"
    >
      <span className="mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-slate-50 text-2xl group-hover:bg-blue-50">
        {category.icon}
      </span>

      <span className="text-xs font-bold leading-tight text-slate-700">
        {category.name}
      </span>
    </Link>
  );
}