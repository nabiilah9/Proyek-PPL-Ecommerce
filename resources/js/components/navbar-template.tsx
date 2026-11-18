import { Link } from "@inertiajs/react";
import { usePage } from "@inertiajs/react";

const navLinks = [
  { label: "Beranda", href: "/Homepage" },
  { label: "Browser Menu", href: "/menu" },
  { label: "Special Offers", href: "/offers" },
  { label: "Pesanan Saya", href: "/pesanan-saya" },
];

export default function NavbarTemplate() {
  const { url } = usePage();

  const currentPath = url.split("?")[0].replace(/\/+$/, "") || "/";

  const isActive = (href: string) => {
    const target = href.replace(/\/+$/, "");

    if (target === "/Homepage") {
      return currentPath === "/Homepage" || currentPath === "/";
    }

    return currentPath === target || currentPath.startsWith(`${target}/`);
  };

  return (
    <nav aria-label="Primary navigation">
      <ul className="flex flex-wrap items-center justify-center gap-2">
        {navLinks.map(({ label, href }) => (
          <li key={href} className="flex">
            <Link
              href={href}
              aria-current={isActive(href) ? "page" : undefined}
              className={`inline-flex h-10 items-center justify-center whitespace-nowrap rounded-3xl px-5 py-2 text-sm transition-colors lg:px-6 ${
                isActive(href)
                  ? "bg-[#51793E] text-white"
                  : "text-gray-800 hover:bg-[#51793E] hover:text-white"
              }`}
            >
              {label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
};