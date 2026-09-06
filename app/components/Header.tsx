"use client";

import Link from "next/link";

export default function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-slate-200 bg-white">
      <div className="mx-auto max-w-7xl">

        {/* TOP HEADER */}
        <div className="flex h-[64px] items-center justify-between px-3 sm:h-[72px] sm:px-6 lg:px-8">

          {/* LOGO */}
          <Link href="/" className="shrink-0">
            <div className="text-[23px] font-black tracking-[-0.06em] sm:text-[30px]">
              <span className="text-blue-600">Local</span>
              <span className="text-orange-500">Platform</span>
            </div>

            <div className="hidden text-[8px] font-bold tracking-[0.14em] text-slate-400 sm:block">
              FIND LOCAL • SUPPORT LOCAL • GROW LOCAL
            </div>
          </Link>

          {/* RIGHT SIDE */}
          <div className="flex items-center gap-1 sm:gap-2">

            {/* ADVERTISE */}
            <Link
              href="/list-business"
              className="hidden h-10 items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-3 text-sm font-bold text-blue-600 sm:flex"
            >
              <span className="text-lg">📣</span>
              Advertise
            </Link>

            {/* MOBILE ADVERTISE ICON */}
            <Link
              href="/list-business"
              aria-label="Advertise"
              className="flex h-10 w-10 items-center justify-center rounded-full text-[20px] sm:hidden"
            >
              📣
            </Link>

            {/* NOTIFICATION */}
            <button
              type="button"
              aria-label="Notifications"
              className="flex h-10 w-10 items-center justify-center rounded-full text-slate-700 transition hover:bg-slate-100"
            >
              <svg
                viewBox="0 0 24 24"
                className="h-[22px] w-[22px]"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
              >
                <path d="M18 9a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9" />
                <path d="M10 21h4" />
              </svg>
            </button>

            {/* ACCOUNT */}
            <Link
              href="/login"
              aria-label="Account"
              className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-slate-600 transition hover:bg-blue-50 hover:text-blue-600"
            >
              <svg
                viewBox="0 0 24 24"
                className="h-[25px] w-[25px]"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
              >
                <circle cx="12" cy="8" r="3.5" />
                <path d="M5 20c.8-3.4 3.2-5 7-5s6.2 1.6 7 5" />
              </svg>
            </Link>

          </div>
        </div>

        {/* SEARCH BAR */}
        <div className="border-t border-slate-100 px-3 pb-3 pt-2 sm:px-6 sm:pb-4 lg:px-8">
          <Link
            href="/search"
            className="flex h-[48px] items-center rounded-xl border border-slate-300 bg-white px-4 shadow-sm transition hover:border-blue-400 sm:h-[52px]"
          >
            <svg
              viewBox="0 0 24 24"
              className="mr-3 h-[21px] w-[21px] shrink-0 text-slate-700"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <circle cx="11" cy="11" r="7" />
              <path d="m20 20-4-4" />
            </svg>

            <span className="text-[15px] font-semibold text-slate-500 sm:text-base">
              Search businesses, services &amp; places
            </span>

            <span className="ml-auto text-[20px] text-blue-600">
              🎙️
            </span>
          </Link>
        </div>

      </div>
    </header>
  );
}