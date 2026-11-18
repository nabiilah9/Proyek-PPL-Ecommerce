import AppTemplate from "@/components/templates/app-template";
import { CartButton } from "@/components/layouts/main-menu";
import { Link } from "@inertiajs/react";

interface Item {
  id: number;
  name: string;
  description: string | null;
  price: number;
  unit: string;
  stock: number;
  image_url: string;
  discount: number;
  category?: {
    id: number;
    name: string;
  } | null;
  ratings: Rating[];
}

interface Rating {
  id: number;
  score: number;
  comment: string | null;
  user?: {
    name: string | null;
    username: string;
  } | null;
  created_at?: string;
}

interface Props {
  item: Item;
}

export default function ProductDetail({ item }: Props) {
  const discountedPrice =
    item.discount > 0
      ? item.price - (item.price * item.discount) / 100
      : item.price;

    const ratings = item.ratings ?? [];

    const averageRating =
    ratings.length > 0
        ? ratings.reduce((total, rating) => total + rating.score, 0) /
        ratings.length
        : 0;

  const imageUrl = item.image_url
    ? item.image_url.startsWith("http") ||
      item.image_url.startsWith("/")
      ? item.image_url
      : `/${item.image_url}`
    : "/img/dadar-gulung.png";

  return (
    <AppTemplate className="bg-white">
      <div className="mx-4 md:mx-16 mt-8">
        <Link
          href="/menu"
          className="text-green-700 hover:underline"
        >
          &larr; Kembali ke menu
        </Link>

        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <img
              src={imageUrl}
              alt={item.name}
              className="w-full max-h-[450px] object-cover rounded-xl shadow"
            />
          </div>

          <div>
            {item.category && (
              <p className="text-sm text-gray-500">
                Kategori: {item.category.name}
              </p>
            )}

            <h1 className="text-3xl font-bold text-gray-900 mt-2">
              {item.name}
            </h1>

            <div className="mt-5">
              {item.discount > 0 && (
                <p className="text-gray-400 line-through">
                  Rp {item.price.toLocaleString("id-ID")}/{item.unit}
                </p>
              )}

              <p className="text-2xl font-bold text-green-700">
                Rp {Math.round(discountedPrice).toLocaleString("id-ID")}/{item.unit}
              </p>

              {item.discount > 0 && (
                <span className="inline-block mt-2 bg-red-100 text-red-600 px-2 py-1 rounded text-sm">
                  Diskon {item.discount}%
                </span>
              )}
            </div>

            <div className="mt-5">
              <p className="font-semibold">Deskripsi Produk</p>
              <p className="text-gray-600 mt-2">
                {item.description ?? "Tidak ada deskripsi produk."}
              </p>
            </div>

            <p className="mt-5 text-gray-600">
              Stok tersedia: {item.stock} {item.unit}
            </p>

            {item.stock > 0 && (
              <div className="mt-6">
                <CartButton itemId={item.id} />
              </div>
            )}

            {item.stock <= 0 && (
              <p className="mt-5 text-red-600 font-semibold">
                Produk sedang habis.
              </p>
            )}
          </div>
        </div>
        {/* Rating dan Ulasan Produk */}
        <section className="mt-12 border-t border-gray-200 pt-8">
        <h2 className="text-2xl font-bold text-gray-900">
            Rating dan Ulasan Produk
        </h2>

        <div className="mt-4">
            {ratings.length > 0 ? (
            <>
                <div className="flex items-center gap-3">
                <span className="text-4xl font-bold text-gray-900">
                    {averageRating.toFixed(1)}
                </span>

                <div>
                    <div className="text-yellow-500 text-xl">
                    {"\u2605".repeat(Math.round(averageRating))}
                    {"\u2606".repeat(5 - Math.round(averageRating))}
                    </div>
                    <p className="text-sm text-gray-500">
                    {ratings.length} ulasan
                    </p>
                </div>
                </div>

                <div className="mt-6 space-y-4">
                {ratings.map((rating) => (
                    <div
                    key={rating.id}
                    className="rounded-xl border border-gray-200 p-4"
                    >
                    <div className="flex items-center justify-between">
                        <p className="font-semibold text-gray-800">
                        {rating.user?.name || rating.user?.username || "Pembeli"}
                        </p>

                        <span className="text-sm text-gray-500">
                        {rating.created_at
                            ? new Date(rating.created_at).toLocaleDateString("id-ID")
                            : ""}
                        </span>
                    </div>

                    <div className="mt-2 text-yellow-500">
                        {"\u2605".repeat(rating.score)}
                        {"\u2606".repeat(5 - rating.score)}
                    </div>

                    <p className="mt-2 text-gray-600">
                        {rating.comment || "Tidak ada komentar tertulis."}
                    </p>
                    </div>
                ))}
                </div>
            </>
            ) : (
            <p className="mt-4 text-gray-500">
                Belum ada rating dan ulasan untuk produk ini.
            </p>
            )}
        </div>
        </section>
      </div>
    </AppTemplate>
  );
}
