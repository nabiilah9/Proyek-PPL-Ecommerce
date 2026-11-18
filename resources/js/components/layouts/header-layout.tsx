import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Link, router, usePage } from '@inertiajs/react';
import { MapPin, X } from 'lucide-react';
import axios from 'axios';

declare function route(name: string, params?: Record<string, unknown>): string;

type HeaderLayoutProps = {
  className?: string;
};

type StoreLocation = {
  name: string;
  address: string;
  city: string | null;
};

type ClientLocation = {
  destination_id: number;
  label: string;
  city: string | null;
};

type DestinationOption = {
  id: number;
  label?: string;
  subdistrict_name?: string;
  district_name?: string;
  city_name?: string;
  province_name?: string;
  zip_code?: string;
};

const HeaderLayout: React.FC<HeaderLayoutProps> = ({ className = "" }) => {
  const page = usePage().props as {
    auth?: { user?: { id: number } | null };
    storeLocation?: StoreLocation | null;
    clientLocation?: ClientLocation | null;
  };

  const [cartCount, setCartCount] = useState<number>(0);
  const [cartTotal, setCartTotal] = useState<number>(0);
  const [loadingCart, setLoadingCart] = useState<boolean>(true);
  const [errorCart, setErrorCart] = useState<string | null>(null);

  const [locationOpen, setLocationOpen] = useState(false);
  const [keyword, setKeyword] = useState('');
  const [options, setOptions] = useState<DestinationOption[]>([]);
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const searchTimer = useRef<number | null>(null);

  const formatPrice = (price: number): string => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(price).replace('IDR', 'Rp.');
  };

  const fetchCartData = useCallback(async () => {
    try {
      setLoadingCart(true);
      setErrorCart(null);

      const response = await axios.get(route('client.cart.count'));
      setCartCount(response.data.count);
      setCartTotal(response.data.total);
    } catch (error) {
      console.error("Failed to fetch cart data:", error);
      setErrorCart("Gagal memuat keranjang.");
      setCartCount(0);
      setCartTotal(0);
    } finally {
      setLoadingCart(false);
    }
  }, []);

  useEffect(() => {
    void fetchCartData();

    const handleCartUpdated = () => {
      void fetchCartData();
    };

    window.addEventListener('cart-updated', handleCartUpdated);

    return () => {
      window.removeEventListener('cart-updated', handleCartUpdated);
    };
  }, [fetchCartData]);

  const runSearch = useCallback(async (value: string) => {
    if (value.trim().length < 3) {
      setOptions([]);
      setSearchError(null);
      return;
    }

    try {
      setSearching(true);
      setSearchError(null);

      const response = await axios.get(route('client.location.search'), {
        params: { q: value },
      });

      setOptions(response.data.data ?? []);
    } catch (error) {
      console.error('Gagal mencari lokasi:', error);
      setSearchError('Lokasi tidak bisa dimuat. Coba lagi.');
      setOptions([]);
    } finally {
      setSearching(false);
    }
  }, []);

  useEffect(() => {
    if (!locationOpen) {
      return;
    }

    if (searchTimer.current) {
      window.clearTimeout(searchTimer.current);
    }

    searchTimer.current = window.setTimeout(() => {
      void runSearch(keyword);
    }, 400);

    return () => {
      if (searchTimer.current) {
        window.clearTimeout(searchTimer.current);
      }
    };
  }, [keyword, locationOpen, runSearch]);

  const chooseDestination = (option: DestinationOption) => {
    const label =
      option.label ??
      [option.subdistrict_name, option.district_name, option.city_name]
        .filter(Boolean)
        .join(', ');

    setSaving(true);

    router.post(
      route('client.location.update'),
      {
        destination_id: option.id,
        label,
        city: option.city_name ?? null,
      },
      {
        preserveScroll: true,
        onSuccess: () => {
          setLocationOpen(false);
          setKeyword('');
          setOptions([]);
        },
        onFinish: () => setSaving(false),
      }
    );
  };

  const resetLocation = () => {
    setSaving(true);

    router.delete(route('client.location.reset'), {
      preserveScroll: true,
      onSuccess: () => setLocationOpen(false),
      onFinish: () => setSaving(false),
    });
  };

  const currentLabel =
    page.clientLocation?.label ??
    page.storeLocation?.address ??
    'Lokasi toko';

  const isGuest = !page.auth?.user;

  return (
    <>
      <header
        aria-label="header navigation"
        className={`flex justify-between items-center px-4 h-14 bg-neutral-200 rounded-b-2xl ${className}`}
      >
        <p className="text-black">
          🌟 Get 5% Off your first order,{' '}
          <Link href="/offers" className="text-[#51793E] font-bold underline">
            Promo: ORDER5
          </Link>
        </p>

        <div className="flex gap-2 items-center text-black">
          <MapPin />
          <p className="text-black max-w-[22rem] truncate">
            <strong>{currentLabel}</strong>
          </p>
          {isGuest ? (
            <Link href="/login" className="text-[#51793E] font-bold underline">
              Change Location
            </Link>
          ) : (
            <button
              type="button"
              onClick={() => setLocationOpen(true)}
              className="text-[#51793E] font-bold underline"
            >
              Change Location
            </button>
          )}
        </div>

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

      {locationOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/40 p-4 pt-24">
          <div className="w-full max-w-lg rounded-2xl bg-white p-5 shadow-xl">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-lg font-bold text-neutral-900">
                  Ubah lokasi pengiriman
                </h2>
                <p className="mt-1 text-sm text-neutral-600">
                  Dipakai untuk menghitung ongkir di keranjang.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setLocationOpen(false)}
                aria-label="Tutup"
                className="rounded-full p-1 text-neutral-500 hover:bg-neutral-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <input
              autoFocus
              type="text"
              value={keyword}
              onChange={(event) => setKeyword(event.target.value)}
              placeholder="Cari kecamatan, kota, atau kode pos"
              className="mt-4 w-full rounded-xl border border-neutral-300 px-4 py-2 text-sm outline-none focus:border-[#51793E] text-black"
            />

            <div className="mt-3 max-h-64 overflow-y-auto">
              {searching && (
                <p className="p-3 text-sm text-neutral-500">Mencari...</p>
              )}

              {!searching && searchError && (
                <p className="p-3 text-sm text-red-600">{searchError}</p>
              )}

              {!searching && !searchError && keyword.trim().length < 3 && (
                <p className="p-3 text-sm text-neutral-500">
                  Ketik minimal 3 huruf untuk mencari.
                </p>
              )}

              {!searching && !searchError && keyword.trim().length >= 3 && options.length === 0 && (
                <p className="p-3 text-sm text-neutral-500">
                  Lokasi tidak ditemukan.
                </p>
              )}

              {options.map((option) => {
                const label =
                  option.label ??
                  [option.subdistrict_name, option.district_name, option.city_name]
                    .filter(Boolean)
                    .join(', ');

                return (
                  <button
                    key={option.id}
                    type="button"
                    disabled={saving}
                    onClick={() => chooseDestination(option)}
                    className="block w-full rounded-lg px-3 py-2 text-left text-sm hover:bg-neutral-100 disabled:opacity-50"
                  >
                    <span className="font-medium text-neutral-900">{label}</span>
                    {option.province_name && (
                      <span className="block text-xs text-neutral-500">
                        {option.province_name}
                        {option.zip_code ? ` · ${option.zip_code}` : ''}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            <div className="mt-4 flex items-center justify-between border-t border-neutral-200 pt-3">
              <button
                type="button"
                onClick={resetLocation}
                disabled={saving}
                className="text-sm font-semibold text-[#51793E] underline disabled:opacity-50"
              >
                Pakai lokasi toko
              </button>
              <span className="text-xs text-neutral-500">
                {page.storeLocation
                  ? `Toko: ${page.storeLocation.city ?? page.storeLocation.address}`
                  : ''}
              </span>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default HeaderLayout;
