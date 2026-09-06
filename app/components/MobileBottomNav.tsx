"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const ITEMS = [
  { label: "Home", href: "/", icon: "🏠", bg: "bg-blue-50" },
  { label: "Services", href: "/search", icon: "🔎", bg: "bg-violet-50" },
  { label: "List", href: "/list-business", icon: "➕", bg: "bg-orange-50" },
  { label: "Leads", href: "/dashboard", icon: "📋", bg: "bg-emerald-50" },
  { label: "B2B", href: "/list-business", icon: "🏢", bg: "bg-pink-50" },
  { label: "More", href: "/dashboard", icon: "☰", bg: "bg-cyan-50" },
];

export default function MobileBottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-[100] border-t border-slate-200 bg-white shadow-[0_-5px_22px_rgba(15,23,42,0.10)] md:hidden">
      <div className="mx-auto grid max-w-lg grid-cols-6 px-1 pb-[env(safe-area-inset-bottom)]">
        {ITEMS.map((item) => {
          const active =
            item.href === "/"
              ? pathname === "/"
              : pathname.startsWith(item.href);

          return (
            <Link
              key={item.label}
              href={item.href}
              className="relative flex min-h-[62px] flex-col items-center justify-center gap-1"
            >
              <span
                className={`flex h-8 w-8 items-center justify-center rounded-full text-[16px] shadow-sm ${item.bg} ${
                  active ? "ring-2 ring-blue-200" : ""
                }`}
              >
                {item.icon}
              </span>
              <span
                className={`text-[9px] font-extrabold ${
                  active ? "text-blue-700" : "text-slate-600"
                }`}
              >
                {item.label}
              </span>
              {active && (
                <span className="absolute bottom-0 h-[3px] w-7 rounded-t-full bg-blue-600" />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
