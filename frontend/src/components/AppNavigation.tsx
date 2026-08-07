"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navigationItems = [
  { href: "/", label: "Dashboard" },
  { href: "/plan", label: "Plan" },
];

export default function AppNavigation() {
  const pathname = usePathname();

  return (
    <nav className="mb-6 flex items-center gap-1" aria-label="Primary navigation">
      {navigationItems.map((item) => {
        const isActive = pathname === item.href;

        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={isActive ? "page" : undefined}
            className={`rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
              isActive
                ? "bg-blue-600 text-white shadow-sm"
                : "text-gray-600 hover:bg-gray-200 hover:text-gray-900"
            }`}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
