import { Item } from "@/pages/Homepage";
import { useForm } from "@inertiajs/react";

interface MainProps {
  items: Item[];
}

function CartButton({ itemId }: { itemId: number }) {
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
      className="absolute bottom-2 right-2 bg-white text-black rounded-full w-8 h-8 flex items-center justify-center shadow hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition"
    >
      {processing ? "…" : "+"}
    </button>
  );
}

export default function Main({ items }: MainProps) {
  if (!items || items.length === 0) {
    return (
      <div id="items" className="mx-16 mt-10">
        <h1 className="font-bold text-5xl">Menu-menu</h1>
        <p className="text-gray-500 mt-5">Belum ada menu yang tersedia.</p>
      </div>
    );
  }

  return (
    <div id="items" className="mx-16">
      <h1 className="font-bold text-5xl mt-10">Menu-menu</h1>
      <div className="flex flex-wrap gap-3 mt-5">
        {items.map((item) => {
          const discountedPrice =
            item.discount > 0
              ? item.price - (item.price * item.discount) / 100
              : item.price;

          return (
            <div
              key={item.id}
              aria-label="card menu"
              className="flex items-center justify-between mt-5 p-4 border border-gray-200 rounded-xl shadow-md bg-white w-[28rem]"
            >
              <div className="max-w-sm">
                <h1 className="text-lg font-semibold text-gray-800">
                  {item.name}
                </h1>
                {item.category && (
                  <span className="text-xs text-gray-400">
                    {item.category.name}
                  </span>
                )}
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

              <div
                className="relative w-64 h-40 bg-cover bg-center rounded-lg shadow-lg flex-shrink-0"
                style={{
                  backgroundImage: item.image_url
                    ? `url('${item.image_url}')`
                    : "url('/img/dadar-gulung.png')",
                }}
              >
                <CartButton itemId={item.id} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}