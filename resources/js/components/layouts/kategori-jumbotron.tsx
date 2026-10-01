interface JumbotronProps {
  judul: string;
  keterangan: string;
  gambar: string;
}

export default function KategoriJumbotron({ judul, keterangan, gambar }: JumbotronProps) {
  return (
    <section className="relative mx-16 mt-6 rounded-2xl bg-white shadow-lg overflow-hidden">
      <div className="flex justify-between items-center p-10">
        {/* Konten kiri */}
        <div className="flex-1 z-10">
          <p className="text-lg text-gray-600 mb-2">{keterangan}</p>
          <h1 className="text-4xl font-bold text-[#1C1C1E] mb-6">{judul}</h1>

          {/* Fitur info */}
          <div className="flex flex-wrap gap-4 mb-6">
            <div className="flex items-center bg-[#03081f] text-white px-4 py-2 rounded-full gap-2">
              <img src="/img/extra/Order Completed.png" className="w-6 h-6" />
              <span className="text-sm font-semibold">tanpa minimal order</span>
            </div>
            <div className="flex items-center bg-[#03081f] text-white px-4 py-2 rounded-full gap-2">
              <img src="/img/extra/Motocross.png" className="w-6 h-6" />
              <span className="text-sm font-semibold">pengiriman cepat 20 - 30 menit</span>
            </div>
            <div className="absolute bottom-4 left-10 bg-[#51793E] text-white px-4 py-2 rounded-lg flex items-center gap-2 shadow">
              <img src="/img/extra/Clock.png" className="w-5 h-5" />
              <span className="text-sm font-semibold">Buka sampai jam 03:00 AM</span>
            </div>
          </div>
        </div>

        {/* Gambar kanan */}
        <div className="relative w-[420px] h-[320px]">
          <img src={gambar} alt={judul} className="w-full h-full object-cover rounded-lg shadow-md" />
          {/* Badge rating */}
          <div className="absolute -left-6 bottom-4 bg-white rounded-xl shadow-md px-4 py-2 flex flex-col items-center">
            <span className="text-2xl font-bold">4.9</span>
            <div className="text-blue-500 text-sm">★★★★★</div>
            <div className="text-xs text-gray-500">407,155</div>
          </div>
        </div>
      </div>
    </section>
  );
}
