import FigureCap from '../fragments/figcap';
import NavbarTemplate from '../navbar-template';
import { Link } from "@inertiajs/react";
import { useEffect, useState } from 'react';

// Tipe user
type User = {
  id: number;
  username: string;
  email: string;
};

// Props untuk komponen ini
type NavbarLayoutProps = {
  className?: string;
  user?: User | null;
};

export default function NavbarLayout({ className = "", user: initialUser = null }: NavbarLayoutProps) {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    setUser(initialUser);
  }, [initialUser]);

  return (
    <section
      aria-label="navigation"
      className={`flex flex-wrap items-center justify-between gap-4 ${className}`}
    >
      <FigureCap src="RB-Store1.png" alt="Roni Bakery Store" className="w-48 lg:w-72" />

      <div className="flex flex-1 flex-wrap items-center justify-end gap-4">
        <NavbarTemplate />
        <div className="flex items-center rounded-4xl bg-black px-5 py-2 text-white">
          {!user ? (
            <>
              <img src="/svg/male.svg" alt="user" className="pr-2 h-6 w-6" />
              <Link href="/login" className="hover:underline">Login</Link>
              <span className="px-1">/</span>
              <Link href="/register" className="hover:underline">Register</Link>
            </>
          ) : (
            <>
              <img src="/svg/male.svg" alt="user" className="pr-2 h-6 w-6" />
              <Link href={route('profile.show')} className="hover:underline"> {/* Diubah */}
                Halo, {user.username}
              </Link>
              <Link href={route('logout')} method="post" as="button" className="ml-4 underline hover:text-gray-300 transition">Logout</Link>
            </>
          )}
        </div>
      </div>
    </section>
  );
}
