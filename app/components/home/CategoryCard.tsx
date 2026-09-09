import type { Category } from "./types";

export default function CategoryCard({
  category,
}: {
  category: Category;
}) {
  return (
    <button
      type="button"
      className="lp-category-card"
    >
      <span
        className={`lp-category-icon ${category.color}`}
      >
        {category.icon}
      </span>

      <span className="lp-category-name">
        {category.name}
      </span>
    </button>
  );
}