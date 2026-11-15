import { Link, useForm } from "@inertiajs/react";

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

interface MainProps {
  kategori: string;
  produk: Produk[];
}

interface MainProps {
  kategori: string;
  produk: Produk[];
  emptyMessage?: string;
}

export function CartButton({ itemId }: { itemId: number }) {
  const { post, processing } = useForm({
    item_id: itemId,
    quantity: 1,
  });

  const addToCart = () => {
    post(route("client.cart.add"), {
      preserveScroll: true,
    });
  };

  return (
    <button
      type="button"
      onClick={addToCart}
      disabled={processing}
      title="Tambah ke keranjang"
      aria-label="Tambah produk ke keranjang"
      className="absolute bottom-2 right-2 z-10 bg-white text-black rounded-full w-9 h-9 flex items-center justify-center shadow hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition"
    >
      {processing ? "..." : "+"}
    </button>
  );
}

export default function MainMenu({
  kategori,
  produk,
  emptyMessage = "Belum ada produk tersedia di kategori ini.",
}: MainProps) {
  if (!produk || produk.length === 0) {
    return (
      <div id="items" className="mx-4 md:mx-16 mt-10">
        <h1 className="font-bold text-2xl md:text-4xl">
          Menu - {kategori}
        </h1>
        <p className="text-gray-500 mt-5">
          {emptyMessage}
        </p>
      </div>
    );
  }

  return (
    <div id="items" className="mx-4 md:mx-16">
      <h1 className="font-bold text-2xl md:text-4xl mt-10">
        Menu - {kategori}
      </h1>

      <div className="flex flex-wrap gap-3 mt-5">
        {produk.map((item) => {
          const discountedPrice =
            item.discount > 0
              ? item.price - (item.price * item.discount) / 100
              : item.price;

          const imageUrl = item.image_url
            ? item.image_url.startsWith("http") ||
              item.image_url.startsWith("/")
              ? item.image_url
              : `/${item.image_url}`
            : "/img/dadar-gulung.png";

          return (
            <div
              key={item.id}
              aria-label="card menu"
              className="flex items-center justify-between gap-3 p-4 border border-gray-200 rounded-xl shadow-md bg-white w-full md:w-[28rem]"
            >
              <div className="min-w-0 flex-1">
                <Link
                  href={route("produk.show", item.id)}
                  className="text-lg font-semibold text-gray-800 hover:text-green-700"
                >
                  {item.name}
                </Link>

                <p className="text-gray-600 mt-1 text-sm line-clamp-2">
                  {item.description ?? "Tidak ada deskripsi."}
                </p>

                <div className="mt-2">
                  {item.discount > 0 ? (
                    <>
                      <span className="line-through text-gray-400 text-sm mr-2">
                        Rp {item.price.toLocaleString("id-ID")}/{item.unit}
                      </span>

                      <span className="text-green-700 font-medium">
                        Rp {Math.round(discountedPrice).toLocaleString("id-ID")}/{item.unit}
                      </span>

                      <span className="ml-2 text-xs bg-red-100 text-red-600 px-1 rounded">
                        -{item.discount}%
                      </span>
                    </>
                  ) : (
                    <span className="text-green-700 font-medium">
                      Rp {item.price.toLocaleString("id-ID")}/{item.unit}
                    </span>
                  )}
                </div>

                <span className="text-xs text-gray-400 mt-1 block">
                  Stok: {item.stock}
                </span>
              </div>

              <div className="relative w-32 h-32 md:w-64 md:h-40 flex-shrink-0">
                <Link
                  href={route("produk.show", item.id)}
                  className="block w-full h-full"
                  aria-label={`Lihat detail ${item.name}`}
                >
                  <img
                    src={imageUrl}
                    alt={item.name}
                    className="w-full h-full object-cover rounded-lg shadow-lg"
                  />
                </Link>

                <CartButton itemId={item.id} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
