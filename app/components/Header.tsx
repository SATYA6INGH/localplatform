"use client";

import Link from "next/link";

const NAV_ITEMS = [
  { label: "Home", href: "/" },
  { label: "Services", href: "/search" },
  { label: "List Business", href: "/list-business" },
  { label: "Leads", href: "/leads" },
  { label: "B2B", href: "/b2b" },
  { label: "News", href: "/news" },
  { label: "More", href: "/more" },
];

export default function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-slate-200 bg-white">
      <div className="mx-auto max-w-7xl">

        {/* BRAND + ICONS */}
        <div className="flex h-16 items-center justify-between px-3 sm:h-[70px] sm:px-6 lg:px-8">

          <Link href="/" className="shrink-0">
            <div className="text-[22px] font-black tracking-[-0.06em] sm:text-[30px]">
              <span className="text-blue-600">Local</span>
              <span className="text-orange-500">Platform</span>
            </div>

            <div className="hidden text-[8px] font-bold tracking-[0.16em] text-slate-400 sm:block">
              FIND LOCAL • SUPPORT LOCAL • GROW LOCAL
            </div>
          </Link>

          <div className="flex items-center gap-1">

            <Link
              href="/search"
              aria-label="Search"
              className="flex h-10 w-10 items-center justify-center rounded-full text-slate-600 hover:bg-slate-100"
            >
              <svg
                viewBox="0 0 24 24"
                className="h-5 w-5"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <circle cx="11" cy="11" r="7" />
                <path d="m20 20-4-4" />
              </svg>
            </Link>

            <Link
              href="/login"
              aria-label="Account"
              className="flex h-10 w-10 items-center justify-center rounded-full text-slate-600 hover:bg-slate-100"
            >
              <svg
                viewBox="0 0 24 24"
                className="h-5 w-5"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <circle cx="12" cy="8" r="3.5" />
                <path d="M5 20c.8-3.4 3.2-5 7-5s6.2 1.6 7 5" />
              </svg>
            </Link>

          </div>
        </div>

        {/* MAIN NAVIGATION */}
        <nav className="grid grid-cols-7 border-t border-slate-100">

          {NAV_ITEMS.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className="
                flex
                min-h-[44px]
                items-center
                justify-center
                border-b-2
                border-transparent
                px-1
                text-center
                text-[10px]
                font-bold
                text-slate-700
                transition
                hover:border-blue-600
                hover:bg-slate-50
                hover:text-blue-600
                sm:min-h-[50px]
                sm:text-[13px]
              "
            >
              {item.label}
            </Link>
          ))}

        </nav>

      </div>
    </header>
  );
}