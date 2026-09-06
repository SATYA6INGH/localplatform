"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_ITEMS = [
  { label: "Home", href: "/", icon: "⌂", tone: "text-blue-600 bg-blue-50" },
  { label: "Services", href: "/search", icon: "⌕", tone: "text-violet-600 bg-violet-50" },
  { label: "List Business", href: "/list-business", icon: "+", tone: "text-orange-600 bg-orange-50" },
  { label: "Leads", href: "/dashboard", icon: "▣", tone: "text-emerald-600 bg-emerald-50" },
  { label: "B2B", href: "/list-business", icon: "▤", tone: "text-pink-600 bg-pink-50" },
  { label: "News", href: "/search", icon: "▥", tone: "text-cyan-600 bg-cyan-50" },
  { label: "More", href: "/dashboard", icon: "•••", tone: "text-amber-600 bg-amber-50" },
];

export default function Header() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200 bg-white shadow-sm">
      <div className="mx-auto max-w-7xl">

        {/* TOP BAR */}
        <div className="flex h-[62px] items-center justify-between px-3 sm:h-[70px] sm:px-6 lg:px-8">

          <Link href="/" className="shrink-0">
            <div className="text-[22px] font-black tracking-[-0.06em] sm:text-[30px]">
              <span className="text-blue-600">Local</span>
              <span className="text-orange-500">Platform</span>
            </div>
            <div className="hidden text-[8px] font-bold tracking-[0.15em] text-slate-400 sm:block">
              FIND LOCAL • SUPPORT LOCAL • GROW LOCAL
            </div>
          </Link>

          <div className="flex items-center gap-1">
            <Link
              href="/list-business"
              className="hidden rounded-xl bg-orange-50 px-3 py-2 text-xs font-black text-orange-600 sm:block"
            >
              📣 Advertise
            </Link>

            <Link
              href="/list-business"
              aria-label="Advertise"
              className="flex h-9 w-9 items-center justify-center rounded-full bg-orange-50 text-base sm:hidden"
            >
              📣
            </Link>

            <button
              type="button"
              aria-label="Notifications"
              className="flex h-9 w-9 items-center justify-center rounded-full bg-violet-50 text-violet-600"
            >
              🔔
            </button>

            <Link
              href="/login"
              aria-label="Account"
              className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-50 text-blue-600"
            >
              👤
            </Link>
          </div>
        </div>

        {/* SEARCH */}
        <div className="border-t border-slate-100 px-3 pb-3 pt-2 sm:px-6 lg:px-8">
          <Link
            href="/search"
            className="flex h-[46px] items-center rounded-xl border border-slate-200 bg-slate-50 px-3 shadow-sm sm:h-[50px]"
          >
            <span className="mr-2 text-lg text-slate-600">⌕</span>
            <span className="text-[13px] font-semibold text-slate-500 sm:text-sm">
              Search businesses, services & places
            </span>
            <span className="ml-auto text-base">🎙️</span>
          </Link>
        </div>

        {/* COLORFUL HEADER NAV */}
        <nav className="border-t border-slate-100 bg-white px-1">
          <div className="grid grid-cols-7">
            {NAV_ITEMS.map((item) => {
              const active =
                item.href === "/"
                  ? pathname === "/"
                  : pathname.startsWith(item.href);

              return (
                <Link
                  key={item.label}
                  href={item.href}
                  className="relative flex min-w-0 flex-col items-center justify-center gap-0.5 py-1.5"
                >
                  <span
                    className={`flex h-7 w-7 items-center justify-center rounded-full text-[14px] font-black ${item.tone}`}
                  >
                    {item.icon}
                  </span>
                  <span
                    className={`max-w-full truncate px-0.5 text-[8px] font-extrabold sm:text-[10px] ${
                      active ? "text-blue-600" : "text-slate-600"
                    }`}
                  >
                    {item.label}
                  </span>
                  <span
                    className={`absolute bottom-0 h-[2px] rounded-full ${
                      active ? "left-3 right-3 bg-blue-600" : "left-6 right-6 bg-transparent"
                    }`}
                  />
                </Link>
              );
            })}
          </div>
        </nav>
      </div>
    </header>
  );
}
