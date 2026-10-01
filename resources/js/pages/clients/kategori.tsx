import KategoriJumbotron from "@/components/layouts/kategori-jumbotron";
import Main from "@/components/layouts/main-menu";
import AppTemplate from "@/components/templates/app-template";
import CustomerReview from "@/components/layouts/review";

interface Produk {
  id: number;
  name: string;
  description: string;
  price: number;
  image_url: string;
}

interface Props {
  kategori: string;
  produk: Produk[];
}

export default function KategoriPage({ kategori, produk }: Props) {
  return (
    <AppTemplate>
      <KategoriJumbotron
        judul={kategori}
        keterangan={`Kategori ${kategori}`}
        gambar="/img/default.png" // Kamu bisa ubah berdasarkan kategori jika ingin
      />

      {/* Search input */}
      <form className="mx-16 mt-4">
        <input type="text" placeholder="Search For Menu.." className="w-full rounded-full p-3 border" />
      </form>

      {/* Tampilkan produk */}
      <Main kategori={kategori} produk={produk} />

      <CustomerReview />
    </AppTemplate>
  );
}
