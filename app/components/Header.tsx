"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_ITEMS = [
  { label: "Home", href: "/", icon: "⌂" },
  { label: "Services", href: "/search", icon: "⌕" },
  { label: "List Business", href: "/list-business", icon: "+" },
  { label: "Leads", href: "/leads", icon: "▣" },
  { label: "B2B", href: "/b2b", icon: "▤" },
  { label: "News", href: "/news", icon: "▥" },
  { label: "More", href: "/more", icon: "•••" },
];

export default function Header() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200 bg-white shadow-sm">
      <div className="mx-auto max-w-7xl">

        {/* TOP HEADER */}
        <div className="flex h-[62px] items-center justify-between px-3 sm:h-[70px] sm:px-6 lg:px-8">

          {/* LOGO */}
          <Link href="/" className="shrink-0">
            <div className="text-[22px] font-black tracking-[-0.06em] sm:text-[30px]">
              <span className="text-blue-600">Local</span>
              <span className="text-orange-500">Platform</span>
            </div>

            <div className="hidden text-[8px] font-bold tracking-[0.15em] text-slate-400 sm:block">
              FIND LOCAL • SUPPORT LOCAL • GROW LOCAL
            </div>
          </Link>

          {/* RIGHT ICONS */}
          <div className="flex items-center gap-1 sm:gap-2">

            {/* SEARCH */}
            <Link
              href="/search"
              aria-label="Search"
              className="flex h-10 w-10 items-center justify-center rounded-full text-slate-600 transition hover:bg-blue-50 hover:text-blue-600"
            >
              <svg
                viewBox="0 0 24 24"
                className="h-[21px] w-[21px]"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <circle cx="11" cy="11" r="7" />
                <path d="m20 20-4-4" />
              </svg>
            </Link>

            {/* ACCOUNT */}
            <Link
              href="/login"
              aria-label="Account"
              className="flex h-10 w-10 items-center justify-center rounded-full text-slate-600 transition hover:bg-blue-50 hover:text-blue-600"
            >
              <svg
                viewBox="0 0 24 24"
                className="h-[21px] w-[21px]"
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

        {/* MOBILE / DESKTOP NAV */}
        <div className="border-t border-slate-100 bg-white px-2 sm:px-4">
          <nav
            aria-label="Main navigation"
            className="flex min-h-[58px] items-stretch gap-1 overflow-x-auto scrollbar-hide"
          >
            {NAV_ITEMS.map((item) => {
              const active =
                item.href === "/"
                  ? pathname === "/"
                  : pathname.startsWith(item.href);

              return (
                <Link
                  key={item.label}
                  href={item.href}
                  className={`group relative flex min-w-[72px] shrink-0 flex-1 flex-col items-center justify-center gap-[3px] rounded-t-xl px-1 py-2 transition sm:min-w-0 ${
                    active
                      ? "text-blue-600"
                      : "text-slate-500 hover:bg-slate-50 hover:text-blue-600"
                  }`}
                >
                  {/* ICON */}
                  <span
                    className={`flex h-[27px] w-[27px] items-center justify-center rounded-full text-[16px] font-black leading-none transition ${
                      active
                        ? "bg-blue-50 text-blue-600"
                        : "bg-slate-50 text-slate-500 group-hover:bg-blue-50 group-hover:text-blue-600"
                    }`}
                  >
                    {item.icon}
                  </span>

                  {/* LABEL */}
                  <span
                    className={`whitespace-nowrap text-[9px] font-extrabold sm:text-[11px] ${
                      active ? "text-blue-600" : "text-slate-600"
                    }`}
                  >
                    {item.label}
                  </span>

                  {/* ACTIVE LINE */}
                  <span
                    className={`absolute bottom-0 left-2 right-2 h-[3px] rounded-t-full transition ${
                      active
                        ? "bg-blue-600"
                        : "bg-transparent group-hover:bg-blue-200"
                    }`}
                  />
                </Link>
              );
            })}
          </nav>
        </div>

      </div>
    </header>
  );
}