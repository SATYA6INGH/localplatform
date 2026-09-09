"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navigationItems = [
  {
    href: "/",
    icon: "⌂",
    label: "Home",
  },
  {
    href: "/search",
    icon: "⌕",
    label: "Explore",
  },
  {
    href: "/status",
    icon: "◉",
    label: "Status",
  },
  {
    href: "/chat",
    icon: "◌",
    label: "Chat",
  },
  {
    href: "/profile",
    icon: "♙",
    label: "Profile",
  },
];

export default function MobileBottomNav() {
  const pathname = usePathname();

  return (
    <nav className="lp-bottom-nav">
      {navigationItems.map((item) => {
        const isActive =
          item.href === "/"
            ? pathname === "/"
            : pathname.startsWith(item.href);

        return (
          <Link
            key={item.href}
            href={item.href}
            className={
              isActive
                ? "lp-nav-item active"
                : "lp-nav-item"
            }
          >
            <span className="lp-nav-icon">
              {item.icon}
            </span>

            <span className="lp-nav-label">
              {item.label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}