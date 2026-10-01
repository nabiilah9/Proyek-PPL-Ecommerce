import React, { useState, useEffect } from 'react';
import { usePage } from '@inertiajs/react';

import HeaderLayout from '@/components/layouts/header-layout';
import NavbarLayout from '@/components/layouts/navbar-layout';
import FooterLayout from '@/components/layouts/footer-layout';

type User = {
  id: number;
  name: string;
  email: string;
};

type AppTemplateProps = {
  children: React.ReactNode;
  className?: string;
};

const AppTemplate: React.FC<AppTemplateProps> = ({ children, className = '' }) => {
  // Ambil user dari props Inertia saat load awal
  const { auth } = usePage().props as { auth?: { user: User | null } };
  const initialUser = auth?.user || null;

  // Buat state user yang bisa di-update kalau perlu
  const [user, setUser] = useState<User | null>(initialUser);

  // Sync state jika data user dari Inertia berubah (misal setelah navigasi)
  useEffect(() => {
    setUser(initialUser);
  }, [initialUser]);

  return (
    <div className={`bg-[#FFFFFF] ${className}`}>
      <HeaderLayout className="flex justify-between items-center mx-16 h-14 bg-neutral-200 rounded-b-2xl" />
      {/* Kirim user sebagai prop ke NavbarLayout */}
      <NavbarLayout className="flex justify-between items-center mx-16 my-5 font-bold" user={user} />
      {children}
      <FooterLayout className="mt-10" />
    </div>
  );
};

export default AppTemplate;
