import KategoriJumbotron from "@/components/layouts/kategori-jumbotron";
import MainMenu from "@/components/layouts/main-menu";
import AppTemplate from "@/components/templates/app-template";
import CustomerReview from "@/components/layouts/review";
import { Link } from "@inertiajs/react";

interface Category {
  id: number;
  name: string;
  slug: string;
}

interface Produk {
  id: number;
  name: string;
  description: string | null;
  price: number;
  unit: string;
  stock: number;
  image_url: string;
  discount: number;
}

interface Props {
  kategori: string;
  slug: string;
  categories: Category[];
  produk: Produk[];
}

export default function KategoriPage({
  kategori,
  slug,
  categories,
  produk,
}: Props) {
  return (
    <AppTemplate className="bg-white">
      <KategoriJumbotron
        judul={kategori}
        keterangan={`Produk kategori ${kategori}`}
        gambar="/img/default.png"
      />

      <nav aria-label="Navigasi kategori produk">
        <ul className="mt-5 flex flex-wrap justify-center gap-3 bg-[#F3F3F3] p-4">
          <li>
            <Link
              href="/menu"
              className="rounded-full px-5 py-2 font-bold text-black transition hover:bg-black hover:text-white"
            >
              Semua Produk
            </Link>
          </li>

          {categories.map((cat) => {
            const aktif = cat.slug === slug;

            return (
              <li key={cat.id}>
                <Link
                  href={`/menu/${cat.slug}`}
                  aria-current={aktif ? "page" : undefined}
                  className={`rounded-full px-5 py-2 font-bold transition ${
                    aktif
                      ? "bg-black text-white"
                      : "text-black hover:bg-black hover:text-white"
                  }`}
                >
                  {cat.name}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <MainMenu kategori={kategori} produk={produk} />

      <CustomerReview />
    </AppTemplate>
  );
}