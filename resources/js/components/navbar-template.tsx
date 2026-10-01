import { Link } from "@inertiajs/react";
import { usePage } from "@inertiajs/react";

const navLinks = [
  { label: "Home", href: "/" },
  { label: "Browser Menu", href: "/menu" },
  { label: "Special Offers", href: "/offers" },
  // { label: "Track Order", href: "/order" },
];

export default function NavbarTemplate() {
  const { url } = usePage();
  console.log( url )

  return (
    <nav aria-label="Primary navigation">
      <ul className="flex items-center gap-10">
        {navLinks.map(({ label, href }) => (
          <li key={ href }>
            <Link
              href={ href }
              className={ url === href
                ? "bg-[#51793E] text-white rounded-3xl px-8 py-2"
                : ""
              }
            >
              { label }
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
};