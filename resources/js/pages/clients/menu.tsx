import AppTemplate from "@/components/templates/app-template";
import CustomerReview from "@/components/layouts/review";
import MainMenu from "@/components/layouts/main-menu";
import { Link, router } from "@inertiajs/react";
import { FormEvent, useState } from "react";

interface Category {
  id: number;
  name: string;
  slug: string;
}

interface Product {
  id: number;
  name: string;
  description: string | null;
  price: number;
  unit: string;
  stock: number;
  image_url: string;
  discount: number;
}

interface MenuProps {
  categories: Category[];
  produk: Product[];
  products?: Product[];
  search?: string;
}

export default function Menu({
  categories,
  produk,
  products = [],
  search = "",
}: MenuProps) {
  const [keyword, setKeyword] = useState(search);

  function handleSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    router.get(
      "/menu",
      { search: keyword.trim() },
      {
        preserveState: true,
        preserveScroll: true,
      }
    );
  }

  return (
    <AppTemplate className="bg-white">
      <div className="mx-4 mt-4 md:mx-16">
        <form onSubmit={handleSearch} role="search">
          <label htmlFor="menu-search" className="sr-only">
            Cari produk
          </label>

          <div className="flex overflow-hidden rounded-full border border-gray-400 bg-white focus-within:ring-2 focus-within:ring-green-700">
            <input
              id="menu-search"
              type="search"
              name="search"
              value={keyword}
              onChange={(event) => setKeyword(event.target.value)}
              placeholder="Cari nama kue atau produk..."
              className="min-w-0 flex-1 bg-white px-5 py-3 text-base text-black placeholder:text-black outline-none"
            />

            <button
              type="submit"
              className="bg-[#51793E] px-6 py-3 font-semibold text-white hover:bg-green-800"
            >
              Search
            </button>
          </div>
        </form>
      </div>

      <nav aria-label="Navigasi kategori produk">
        <ul className="mt-5 flex flex-wrap justify-center gap-3 bg-[#F3F3F3] p-3 text-lg font-bold md:text-2xl">
          <li>
            <Link
              href="/menu"
              aria-current="page"
              className="inline-block rounded-full bg-black px-5 py-1 text-white"
            >
              Semua Produk
            </Link>
          </li>

          {categories.map((cat) => (
            <li key={cat.id}>
              <Link
                href={`/menu/${cat.slug}`}
                className="inline-block rounded-full px-5 py-1 text-black transition hover:bg-black hover:text-white"
              >
                {cat.name}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
      <MainMenu
        kategori={
          search.trim() !== ""
            ? `Hasil pencarian: ${search}`
            : "Semua Produk"
        }
        produk={search.trim() !== "" ? products : produk}
        emptyMessage={
          search.trim() !== ""
            ? "Produk tidak ditemukan. Coba kata kunci lain."
            : "Belum ada produk tersedia."
        }
      />
      <CustomerReview />
    </AppTemplate>
  );
}