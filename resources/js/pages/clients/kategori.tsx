import KategoriJumbotron from "@/components/layouts/kategori-jumbotron";
import MainMenu from "@/components/layouts/main-menu";
import AppTemplate from "@/components/templates/app-template";
import CustomerReview from "@/components/layouts/review";
import { Link } from "@inertiajs/react";

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

interface Category {
  id: number;
  name: string;
  slug: string;
}

interface Props {
  kategori: string;
  slug: string;
  produk: Produk[];
  categories: Category[];
}

export default function KategoriPage({ kategori, slug, produk, categories }: Props) {
  return (
    <AppTemplate>
      <KategoriJumbotron
        judul={kategori}
        keterangan={`Kategori ${kategori}`}
        gambar="/img/default.png"
      />

      {/* Search input */}
      <form className="mx-16 mt-4">
        <input
          type="text"
          placeholder="Search For Menu.."
          className="w-full rounded-full p-3 border"
        />
      </form>

      {/* Navigasi kategori dinamis */}
      <nav aria-label="category navigation">
        <ul className="flex justify-around p-3 mt-5 gap-3 bg-[#F3F3F3] text-xl font-bold flex-wrap">
          {categories.map((cat) => (
            <li key={cat.id}>
              <Link
                href={`/menu/${cat.slug}`}
                className={`px-5 py-1 rounded-full transition ${
                  cat.slug === slug
                    ? "bg-black text-white"
                    : "text-black hover:bg-black hover:text-white"
                }`}
              >
                {cat.name}
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      {/* Tampilkan produk dari DB dengan tombol add to cart */}
      <MainMenu kategori={kategori} produk={produk} />

      <CustomerReview />
    </AppTemplate>
  );
}
