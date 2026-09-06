"use client";

import Link from "next/link";

export default function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-slate-200 bg-white shadow-sm">
      <div className="mx-auto max-w-7xl px-3 sm:px-6 lg:px-8">
        <div className="flex h-[62px] items-center justify-between">
          <Link href="/" className="shrink-0">
            <div className="text-[22px] font-black tracking-[-0.06em] sm:text-[30px]">
              <span className="text-blue-700">Local</span>
              <span className="text-orange-500">Platform</span>
            </div>
            <div className="hidden text-[8px] font-bold tracking-[0.15em] text-slate-400 sm:block">
              FIND LOCAL • SUPPORT LOCAL • GROW LOCAL
            </div>
          </Link>

          <div className="flex items-center gap-1.5">
            <Link
              href="/list-business"
              className="flex h-9 items-center gap-1.5 rounded-full bg-orange-50 px-3 text-[11px] font-extrabold text-orange-600 hover:bg-orange-100 sm:h-10 sm:px-4 sm:text-xs"
            >
              <span>📣</span>
              <span>Advertise</span>
            </Link>

            <button
              type="button"
              aria-label="Notifications"
              className="flex h-9 w-9 items-center justify-center rounded-full bg-violet-50 text-base hover:bg-violet-100 sm:h-10 sm:w-10"
            >
              🔔
            </button>

            <Link
              href="/login"
              aria-label="Profile"
              className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-50 text-base hover:bg-blue-100 sm:h-10 sm:w-10"
            >
              👤
            </Link>
          </div>
        </div>

        <div className="pb-3">
          <Link
            href="/search"
            className="flex h-[46px] items-center rounded-2xl border border-slate-200 bg-slate-50 px-3.5 shadow-sm hover:border-blue-300 hover:bg-white sm:h-[50px]"
          >
            <span className="mr-2.5 text-xl text-blue-600">🔍</span>
            <span className="truncate text-[13px] font-semibold text-slate-500 sm:text-sm">
              Search businesses, services & places
            </span>
            <span className="ml-auto pl-2 text-base">🎙️</span>
          </Link>
        </div>
      </div>
    </header>
  );
}
