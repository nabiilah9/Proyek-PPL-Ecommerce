import Jumbotron from "@/components/layouts/jumbotron";
import Main from "@/components/layouts/main";
import CustomerReview from "@/components/layouts/review";
import AppTemplate from "@/components/templates/app-template";
import { Link, router } from "@inertiajs/react";
import { useState, type FormEvent } from "react";

export interface Item {
  id: number;
  name: string;
  description: string | null;
  price: number;
  unit: string;
  stock: number;
  image_url: string;
  discount: number;
  is_available: boolean;
  category?: {
    id: number;
    name: string;
    slug: string;
  };
}

interface Category {
  id: number;
  name: string;
  slug: string;
}

interface BestSeller {
  id: number;
  name: string;
  slug: string | null;
  price: number;
  discount: number;
  image_url: string | null;
  unit: string;
  category: string | null;
  score: number;
  sold: number;
  rating: number;
  reviews: number;
}

interface HomepageProps {
  items: Item[];
  categories: Category[];
  bestSellers?: BestSeller[];
}

const Homepage = ({ items, categories, bestSellers = [] }: HomepageProps) => {
  const [keyword, setKeyword] = useState("");

  function handleSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    router.get("/menu", { search: keyword.trim() });
  }

  return (
    <AppTemplate className="bg-[#FFFFFF]">
      <Jumbotron />

      {/* Pencarian Produk */}
      <form onSubmit={handleSearch} className="mx-16 mt-4">
        <div className="flex overflow-hidden rounded-full border border-gray-400 bg-white">
          <input
            type="search"
            value={keyword}
            onChange={(event) => setKeyword(event.target.value)}
            placeholder="Cari nama kue atau produk..."
            className="min-w-0 flex-1 bg-white p-3 text-black placeholder:text-black outline-none"
          />
          <button
            type="submit"
            className="bg-[#51793E] px-6 font-semibold text-white hover:bg-green-800"
          >
            Search
          </button>
        </div>
      </form>

      {/* Navigasi Kategori */}
      <nav aria-label="Filter kategori produk" className="mt-5">
        <ul className="flex flex-wrap justify-center gap-3 bg-[#F3F3F3] p-4">
          <li>
            <Link
              href="/menu"
              className="inline-block rounded-lg bg-white px-5 py-3 text-sm font-semibold text-gray-800 shadow-sm transition hover:bg-gray-200"
            >
              Semua Produk
            </Link>
          </li>

          {categories.map((category) => (
            <li key={category.id}>
              <Link
                href={`/menu/${category.slug}`}
                className="inline-block rounded-lg bg-white px-5 py-3 text-sm font-semibold text-gray-800 shadow-sm transition hover:bg-gray-200"
              >
                {category.name}
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      {/* Promo Produk */}
      <div id="hero-section" className="mx-16">
        <div
          id="nav"
          className="mt-10 flex items-center justify-between text-black"
        >
          <h1 className="text-xl font-bold md:text-3xl">
            Up to -40% 🎊 exclusive deals
          </h1>
        </div>

        <div className="mt-6 flex gap-2.5 overflow-auto">
          <div className="relative h-60 w-full rounded-2xl bg-[url('/img/dadar-gulung.png')] bg-cover bg-center">
            <h1 className="pt-44 pl-10 text-[#51793E]">Kue Basah</h1>
            <p className="pl-10 text-2xl font-bold text-white">
              Dadar Gulung
            </p>
            <div className="absolute top-0 right-4 flex h-14 w-20 items-center justify-center rounded-b-2xl bg-black font-bold text-white">
              -40%
            </div>
          </div>

          <div className="relative h-60 w-full rounded-2xl bg-[url('/img/cucur.png')] bg-cover bg-center">
            <h1 className="pt-44 pl-10 text-[#51793E]">Kue Basah</h1>
            <p className="pl-10 text-2xl font-bold text-white">
              Kue Cucur
            </p>
            <div className="absolute top-0 right-4 flex h-14 w-20 items-center justify-center rounded-b-2xl bg-black font-bold text-white">
              -40%
            </div>
          </div>

          <div className="relative h-60 w-full rounded-2xl bg-[url('/img/koci-koci.png')] bg-cover bg-center">
            <h1 className="pt-44 pl-10 text-[#51793E]">Kue Basah</h1>
            <p className="pl-10 text-2xl font-bold text-white">
              Koci-koci
            </p>
            <div className="absolute top-0 right-4 flex h-14 w-20 items-center justify-center rounded-b-2xl bg-black font-bold text-white">
              -40%
            </div>
          </div>
        </div>
      </div>

      {/* Menu dari database */}
      {/* PPL-07: rekomendasi terlaris hasil perhitungan skor */}
      {bestSellers.length > 0 && (
        <section className="mx-16 mt-12">
          <div className="flex items-end justify-between">
            <div>
              <h2 className="text-2xl font-bold text-[#2f4f2f]">Produk Terlaris</h2>
              <p className="text-sm text-gray-500">
                Skor gabungan: 50% penjualan, 30% rating, 20% jumlah ulasan.
              </p>
            </div>
            <Link href="/menu" className="text-sm font-semibold text-[#51793E] underline">
              Lihat semua
            </Link>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
            {bestSellers.map((product, index) => (
              <Link
                key={product.id}
                href={`/menu?search=${encodeURIComponent(product.name)}`}
                className="relative overflow-hidden rounded-2xl border border-green-100 bg-white p-3 shadow-sm transition hover:shadow-md"
              >
                <span className="absolute top-2 left-2 z-10 rounded-full bg-[#51793E] px-2 py-0.5 text-xs font-bold text-white">
                  #{index + 1}
                </span>
                <img
                  src={product.image_url ?? '/placeholder.png'}
                  alt={product.name}
                  className="h-28 w-full rounded-xl object-cover"
                />
                <h3 className="mt-2 line-clamp-2 text-sm font-semibold text-gray-800">
                  {product.name}
                </h3>
                <p className="text-sm font-bold text-[#51793E]">
                  Rp {product.price.toLocaleString('id-ID')}
                </p>
                <p className="mt-1 text-xs text-gray-500">
                  skor {product.score} · {product.sold} terjual
                  {product.reviews > 0 ? ` · bintang ${product.rating}` : ''}
                </p>
              </Link>
            ))}
          </div>
        </section>
      )}

      <Main items={items} />

      <CustomerReview />
    </AppTemplate>
  );
};

export default Homepage;