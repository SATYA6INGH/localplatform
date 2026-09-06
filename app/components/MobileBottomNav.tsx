"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const ITEMS = [
  {
    label: "Home",
    href: "/",
    icon: "⌂",
  },
  {
    label: "Leads",
    href: "/leads",
    icon: "▣",
  },
  {
    label: "B2B",
    href: "/b2b",
    icon: "▤",
  },
  {
    label: "News",
    href: "/news",
    icon: "▥",
  },
  {
    label: "More",
    href: "/more",
    icon: "☰",
  },
];

export default function MobileBottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-[100] border-t border-slate-200 bg-white/95 shadow-[0_-4px_18px_rgba(0,0,0,0.08)] backdrop-blur md:hidden">
      <div className="grid grid-cols-5">

        {ITEMS.map((item) => {
          const active =
            item.href === "/"
              ? pathname === "/"
              : pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex min-h-[62px] flex-col items-center justify-center gap-1 transition ${
                active
                  ? "text-blue-600"
                  : "text-slate-500 hover:text-blue-600"
              }`}
            >
              <span
                className={`flex h-7 w-7 items-center justify-center rounded-full text-[20px] leading-none ${
                  active ? "bg-blue-50" : ""
                }`}
              >
                {item.icon}
              </span>

              <span className="text-[10px] font-bold">
                {item.label}
              </span>
            </Link>
          );
        })}

      </div>
    </nav>
  );
}