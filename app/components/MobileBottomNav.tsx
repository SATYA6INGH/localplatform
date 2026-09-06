"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const ITEMS = [
  { label: "Home", href: "/", icon: "🏠", tone: "text-blue-600 bg-blue-50" },
  { label: "Leads", href: "/dashboard", icon: "📋", tone: "text-emerald-600 bg-emerald-50" },
  { label: "B2B", href: "/list-business", icon: "🏢", tone: "text-violet-600 bg-violet-50" },
  { label: "News", href: "/search", icon: "📰", tone: "text-orange-600 bg-orange-50" },
  { label: "More", href: "/dashboard", icon: "☰", tone: "text-pink-600 bg-pink-50" },
];

export default function MobileBottomNav() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Mobile navigation"
      className="fixed bottom-0 left-0 right-0 z-[100] border-t border-slate-200 bg-white/95 shadow-[0_-4px_18px_rgba(0,0,0,0.08)] backdrop-blur md:hidden"
    >
      <div className="mx-auto grid max-w-lg grid-cols-5">
        {ITEMS.map((item) => {
          const active =
            item.href === "/"
              ? pathname === "/"
              : pathname.startsWith(item.href);

          return (
            <Link
              key={item.label}
              href={item.href}
              className={`relative flex min-h-[62px] flex-col items-center justify-center gap-1 ${
                active ? "text-blue-600" : "text-slate-500"
              }`}
            >
              <span
                className={`flex h-8 w-8 items-center justify-center rounded-full text-[17px] font-black ${item.tone}`}
              >
                {item.icon}
              </span>
              <span className="text-[10px] font-extrabold">{item.label}</span>
              {active && (
                <span className="absolute bottom-0 h-[3px] w-8 rounded-t-full bg-blue-600" />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
