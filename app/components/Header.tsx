"use client";

import Link from "next/link";
import { useState } from "react";

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="border-b bg-white">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4">

        {/* LOGO */}
        <Link
          href="/"
          className="text-2xl font-bold text-black"
          onClick={() => setMenuOpen(false)}
        >
          LocalPlatform
        </Link>

        {/* DESKTOP MENU */}
        <nav className="hidden items-center gap-6 md:flex">
          <Link href="/" className="text-gray-700 hover:text-black">
            Home
          </Link>

          <Link href="/search" className="text-gray-700 hover:text-black">
            Search
          </Link>

          <Link href="/list-business" className="text-gray-700 hover:text-black">
            List Business
          </Link>

          <Link href="/dashboard" className="text-gray-700 hover:text-black">
            Dashboard
          </Link>

          <Link
            href="/login"
            className="rounded-lg bg-black px-4 py-2 text-white hover:bg-gray-800"
          >
            Login
          </Link>
        </nav>

        {/* MOBILE BUTTON */}
        <button
          type="button"
          onClick={() => setMenuOpen(!menuOpen)}
          className="rounded-lg border px-3 py-2 text-xl md:hidden"
          aria-label="Toggle menu"
        >
          {menuOpen ? "✕" : "☰"}
        </button>
      </div>

      {/* MOBILE MENU */}
      {menuOpen && (
        <nav className="border-t bg-white px-4 py-4 md:hidden">
          <div className="flex flex-col gap-3">

            <Link
              href="/"
              onClick={() => setMenuOpen(false)}
              className="rounded-lg px-3 py-3 hover:bg-gray-100"
            >
              Home
            </Link>

            <Link
              href="/search"
              onClick={() => setMenuOpen(false)}
              className="rounded-lg px-3 py-3 hover:bg-gray-100"
            >
              Search
            </Link>

            <Link
              href="/list-business"
              onClick={() => setMenuOpen(false)}
              className="rounded-lg px-3 py-3 hover:bg-gray-100"
            >
              List Business
            </Link>

            <Link
              href="/dashboard"
              onClick={() => setMenuOpen(false)}
              className="rounded-lg px-3 py-3 hover:bg-gray-100"
            >
              Dashboard
            </Link>

            <Link
              href="/login"
              onClick={() => setMenuOpen(false)}
              className="rounded-lg bg-black px-3 py-3 text-center text-white"
            >
              Login
            </Link>

          </div>
        </nav>
      )}
    </header>
  );
}