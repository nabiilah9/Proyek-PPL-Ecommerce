import React, { useState, useEffect } from 'react';
import { Link } from "@inertiajs/react";
import { MapPin } from "lucide-react";
import axios from 'axios';

declare function route(name: string, params?: Record<string, any>): string;

type HeaderLayoutProps = {
  className?: string;
};

const HeaderLayout: React.FC<HeaderLayoutProps> = ({ className = "" }) => {
  const [cartCount, setCartCount] = useState<number>(0);
  const [cartTotal, setCartTotal] = useState<number>(0);
  const [loadingCart, setLoadingCart] = useState<boolean>(true);
  const [errorCart, setErrorCart] = useState<string | null>(null);

  const formatPrice = (price: number): string => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(price).replace('IDR', 'Rp.');
  };

  useEffect(() => {
    const fetchCartData = async () => {
      try {
        setLoadingCart(true);
        setErrorCart(null);

        // Fetch cart count and total from the backend API
        const response = await axios.get(route('client.cart.count')); // Corrected route name
        setCartCount(response.data.count);
        setCartTotal(response.data.total); // getCartCount now returns total too

      } catch (error) {
        console.error("Failed to fetch cart data:", error);
        setErrorCart("Gagal memuat keranjang.");
        setCartCount(0);
        setCartTotal(0);
      } finally {
        setLoadingCart(false);
      }
    };

    fetchCartData();
  }, []);

  return (
    <header
      aria-label="header navigation"
      className={`flex justify-between items-center px-4 h-14 bg-neutral-200 rounded-b-2xl ${className}`}
    >
      <p className="text-black">
        🌟 Get 5% Off your first order,{" "}
        <Link href="#" className="text-[#51793E] font-bold underline">
          Promo: ORDER5
        </Link>
      </p>

      <div className="flex gap-2 items-center text-black">
        <MapPin />
        <p className="text-black">
          <strong>Jl. Telang Indah Barat, Bangkalan</strong>
        </p>
        <Link href="#" className="text-[#51793E] font-bold underline">
          Change Location
        </Link>
      </div>

      {/* Bagian Keranjang yang bisa diklik */}
      {/* Link to the cart page */}
      <Link href={route('client.cart.index')} className="flex items-center gap-1 h-full text-white bg-[#028643] rounded-b-2xl">
        <img src="/svg/cart.svg" alt="cart" className="h-14 w-20 p-2" />
        <div className="h-full w-[1px] bg-[#F0F0FF]"></div>
        <div className="p-4">
          {loadingCart ? (
            "Memuat..."
          ) : errorCart ? (
            "Error"
          ) : (
            `${cartCount} Items`
          )}
        </div>
        <div className="h-full w-[1px] bg-[#F0F0FF]"></div>
        <div className="p-4">
          {loadingCart ? (
            "..."
          ) : errorCart ? (
            "Error"
          ) : (
            formatPrice(cartTotal)
          )}
        </div>
        <div className="h-full w-[1px] bg-[#F0F0FF]"></div>
        <img src="/svg/download.svg" alt="download" className="h-14 w-20 p-2" />
      </Link>
    </header>
  );
};

export default HeaderLayout;