export default function CustomerReview() {
  return (
    <div className="relative bg-[#D9D9D9] py-12 mb-24 pb-20 mt-10">
      <div className="mx-16 px-4">
        {/* Header Section */}
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900">Customer Reviews</h2>
          <div className="flex gap-4">
            <button className="px-4 py-1 rounded-full bg-[#51793E] hover:bg-green-500 transition-colors">
              <span className="text-2xl text-gray-600">&laquo;</span>
            </button>
            <button className="px-4 py-1 rounded-full bg-[#51793E] hover:bg-green-500 transition-colors">
              <span className="text-2xl text-gray-600">&raquo;</span>
            </button>
          </div>
        </div>

        {/* Reviews Container */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* Review Card 1 */}
          <div className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow">
            <div className="flex items-start gap-4 mb-4">
              <img 
                src="/client/seinal.png" 
                alt="seinal" 
                className="w-16 h-16 rounded-full object-cover"
              />
              <div className="h-14 w-[1px] bg-black"></div>
              <div className="flex-1">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold text-gray-900">Seinal</h3>
                    <p className="text-sm text-gray-500">Telang City</p>
                  </div>
                  <div className="text-right">
                    <div className="text-yellow-400 text-xl">⭐⭐⭐⭐⭐</div>
                    <p className="text-sm text-gray-400">24 September, 2024</p>
                  </div>
                </div>
              </div>
            </div>
            <p className="text-gray-600 leading-relaxed">
              Sering bgt balik² ke RB Store buat REPURCHASE 😭🔥 soalnya kuenya tuh UDAH LAH enak bgtt 😩❤️‍🔥 
              Favorit aku tuh yaa si klepon, kue lapis, ama kue sus 🥺💅 manisnya GAK NYIKSA, lembutnya BIKIN NANGIS 😭 
              dan yg paling penting—FRESHH BEUD!! 🤤✨ ketauan banget ini mah bukan kue kemaren sore, asli masih anget2 sayangg 🫶
            </p>
          </div>

          {/* Review Card 2 */}
          <div className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow">
            <div className="flex items-start gap-4 mb-4">
              <img 
                src="/client/ridho.png" 
                alt="ridho" 
                className="w-16 h-16 rounded-full object-cover"
              />
              <div className="h-14 w-[1px] bg-black"></div>
              <div className="flex-1">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold text-gray-900">Ridho</h3>
                    <p className="text-sm text-gray-500">Telang City</p>
                  </div>
                  <div className="text-right">
                    <div className="text-yellow-400 text-xl">⭐⭐⭐⭐⭐</div>
                    <p className="text-sm text-gray-400">24 September, 2024</p>
                  </div>
                </div>
              </div>
            </div>
            <p className="text-gray-600 leading-relaxed">
              Webnya RB Store tuh user-friendly parah, gak pake ribet harus login-login segala cuma buat pesen 😎👌 
              langsung bisa pesen 😎👌 Pengiriman cepet, gratis ongkir pula 🛵💨 Bayar juga gampang, semua metode ada. 
              Tinggal klik, bayar, kue dateng. Gitu doang.
            </p>
          </div>

          {/* Review Card 3 */}
          <div className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow">
            <div className="flex items-start gap-4 mb-4">
              <img 
                src="/client/yichang.png" 
                alt="yichang" 
                className="w-16 h-16 rounded-full object-cover"
              />
              <div className="h-14 w-[1px] bg-black"></div>
              <div className="flex-1">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold text-gray-900">Yichang</h3>
                    <p className="text-sm text-gray-500">Telang City</p>
                  </div>
                  <div className="text-right">
                    <div className="text-yellow-400 text-xl">⭐⭐⭐⭐⭐</div>
                    <p className="text-sm text-gray-400">24 September, 2024</p>
                  </div>
                </div>
              </div>
            </div>
            <p className="text-gray-600 leading-relaxed">
              Kue basahnya GOKIL BETTZZZ 🤯🔥 dari rasa, tekstur, sampe tampilannya tuh niat abis 😭❤️‍🔥 
              Baru coba beberapa varian aja udah ketagihan, apalagi yang lain... fix bakal balik lagi dan 
              nyobain semua menunya satu-satu sampe hafal urutan etalase 😤🍰
            </p>
          </div>
        </div>
      </div>
      <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1/2 flex flex-col items-center bg-white text-black rounded p-2">
        <h1 className="text-7xl font-bold">4.9</h1>
        <div>
          <span>⭐️⭐️⭐️⭐️⭐️</span>
          <p className="">407,155</p>
        </div>
      </div>
    </div>
  );
}