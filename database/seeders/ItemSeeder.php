<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class ItemSeeder extends Seeder
{
    public function run(): void
    {
        $items = [
            [
                'name' => 'Dadar Gulung',
                'description' => 'Kue tradisional berbentuk gulungan dadar berwarna hijau dengan isian kelapa manis.',
                'price' => 3000,
                'image_url' => '/img/dadar-gulung.png',
                'category_slug' => 'kue-basah',
            ],
            [
                'name' => 'Kue Cucur',
                'description' => 'Kue bundar kecoklatan dengan bagian tengah menonjol, tekstur lembut di dalam dan renyah di pinggir.',
                'price' => 2000,
                'image_url' => '/img/cucur.png',
                'category_slug' => 'kue-basah',
            ],
            [
                'name' => 'Koci-Koci',
                'description' => 'Kue berbentuk segitiga berwarna hijau yang terbuat dari tepung ketan dengan isian manis, dibungkus daun pisang.',
                'price' => 2000,
                'image_url' => '/img/koci-koci.png',
                'category_slug' => 'kue-basah',
            ],
            [
                'name' => 'Klepon',
                'description' => 'Kue bulat kecil berwarna hijau yang terbuat dari tepung ketan berisi gula merah dan dibalut kelapa parut',
                'price' => 5000,
                'image_url' => '/img/categories/kue-basah.png',
                'category_slug' => 'kue-basah',
            ],
            [
                'name' => 'Kue Lumpur',
                'description' => 'Kue basah berwarna kuning keemasan dengan topping kismis atau buah di atasnya, bertekstur lembut dan creamy.',
                'price' => 2500,
                'image_url' => '/img/kue-lumpur.png',
                'category_slug' => 'kue-basah',
            ],
            [
                'name' => 'Bikang Manis',
                'description' => 'Kue tradisional dengan pola warna merah muda dan putih, bertekstur lembut dengan rasa manis.',
                'price' => 2000,
                'image_url' => '/img/bikang-manis.png',
                'category_slug' => 'kue-basah',
            ],
            [
                'name' => 'Kue Putu',
                'description' => 'Kue silinder berwarna hijau yang terbuat dari tepung beras dengan isian gula merah.',
                'price' => 2000,
                'image_url' => '/img/kue-putu.png',
                'category_slug' => 'kue-basah',
            ],
            [
                'name' => 'Lemper Ayam',
                'description' => 'Kue berbentuk silinder yang terbuat dari ketan berisi ayam yang dibungkus dengan daun pisang',
                'price' => 3000,
                'image_url' => '/img/lemper-ayam.png',
                'category_slug' => 'kue-basah',
            ],
            [
                'name' => 'Kue Nagasari',
                'description' => 'Kue yang terbuat dari tepung beras dan santan dengan isian pisang, dibungkus daun pisang.',
                'price' => 2500,
                'image_url' => '/img/kue-nagasari.png',
                'category_slug' => 'kue-basah',
            ],
            [
                'name' => 'Kue Lapis',
                'description' => 'Kue berlapis-lapis dengan warna hijau dan putih, bertekstur kenyal dan lembut.',
                'price' => 2000,
                'image_url' => '/img/kue-lapis.png',
                'category_slug' => 'kue-basah',
            ],
            [
                'name' => 'Semprong renyah',
                'description' => 'Makanan ringan berbentuk silinder/gulungan tipis dan renyah dengan warna kecoklatan.',
                'price' => 50000,
                'image_url' => '/img/semprong-renyah.png',
                'category_slug' => 'kue-kering',
            ],
            [
                'name' => 'Pastel kering',
                'description' => 'Camilan kering berbentuk setengah lingkaran dengan isian, tekstur renyah berwarna keemasan',
                'price' => 50000,
                'image_url' => '/img/pastel-kering.png',
                'category_slug' => 'kue-kering',
            ],
            [
                'name' => 'Seroja/Kembang Goyang',
                'description' => 'Camilan tradisional berbentuk bunga dengan tekstur renyah dan berwarna keemasan',
                'price' => 50000,
                'image_url' => '/img/seroja.png',
                'category_slug' => 'kue-kering',
            ],
            [
                'name' => 'Telur Gabus',
                'description' => 'Camilan berbentuk lonjong kecil menyerupai telur ikan gabus, tekstur renyah dan gurih',
                'price' => 50000,
                'image_url' => '/img/telur-gabus.png',
                'category_slug' => 'kue-kering',
            ],
            [
                'name' => 'Onde-onde Ketawa',
                'description' => 'Camilan bulat dengan retakan khas di bagian luarnya yang menyerupai senyuman/tawa.',
                'price' => 50000,
                'image_url' => '/img/onde-onde-ketawa.png',
                'category_slug' => 'kue-kering',
            ],
            [
                'name' => 'Kuping Gajah',
                'description' => 'Camilan renyah berbentuk menyerupai daun atau telinga gajah dengan warna kehitaman.',
                'price' => 50000,
                'image_url' => '/img/kuping-gajah.png',
                'category_slug' => 'kue-kering',
            ],
            [
                'name' => 'Kacang Sembunyi',
                'description' => 'Camilan berupa kacang yang dibalut tepung dan digoreng hingga berwarna oranye keemasan',
                'price' => 45000,
                'image_url' => '/img/kacang-sembunyi.png',
                'category_slug' => 'kue-kering',
            ],
            [
                'name' => 'Keripik Tempe',
                'description' => 'Irisan tipis tempe yang digoreng hingga renyah dengan bumbu khas',
                'price' => 40000,
                'image_url' => '/img/keripik-tempe.png',
                'category_slug' => 'kue-kering',
            ],
            [
                'name' => 'Kue Sus kering',
                'description' => 'Kue sus versi kering berbentuk bulat berisi krim, berwarna keemasan.',
                'price' => 35000,
                'image_url' => '/img/kue-sus-kering.png',
                'category_slug' => 'kue-kering',
            ],
            [
                'name' => 'Lapis legit',
                'description' => 'Kue berlapis-lapis dengan warna keemasan, tekstur lembut dan aroma rempah.',
                'price' => 28000,
                'image_url' => '/img/lapis-legit.png',
                'category_slug' => 'kue-modern',
            ],
            [
                'name' => 'Donat',
                'description' => 'Kue bulat dengan lubang di tengah, berbagai topping warna-warni seperti gula dan coklat.',
                'price' => 3500,
                'image_url' => '/img/donat.png',
                'category_slug' => 'kue-modern',
            ],
            [
                'name' => 'Cupcake',
                'description' => 'Kue kecil berbentuk cup dengan krim berwarna-warni di atasnya.',
                'price' => 5000,
                'image_url' => '/img/cupcake.png',
                'category_slug' => 'kue-modern',
            ],
            [
                'name' => 'Burnt Cheesecake',
                'description' => 'Kue keju panggang dengan permukaan gosong khas, tekstur lembut dan creamy di dalamnya',
                'price' => 22000,
                'image_url' => '/img/burnt-cheesecake.png',
                'category_slug' => 'kue-modern',
            ],
            [
                'name' => 'Brownies',
                'description' => 'Kue coklat pekat padat dengan topping buah berry, tekstur moist dan lembut.',
                'price' => 25000,
                'image_url' => '/img/brownies.png',
                'category_slug' => 'kue-modern',
            ],
            [
                'name' => 'Croissant',
                'description' => 'Kue berlapis dengan bentuk bulan sabit, tekstur renyah dan berlapis-lapis dengan topping coklat',
                'price' => 15000,
                'image_url' => '/img/croissant.png',
                'category_slug' => 'kue-modern',
            ],
            [
                'name' => 'Pancake',
                'description' => 'Kue dadar tebal bertumpuk dengan sirup dan buah sebagai pelengkap.',
                'price' => 17000,
                'image_url' => '/img/pancake.png',
                'category_slug' => 'kue-modern',
            ],
            [
                'name' => 'Bolu',
                'description' => 'Kue kuning lembut berbentuk bundar dengan tekstur ringan dan berpori.',
                'price' => 7000,
                'image_url' => '/img/bolu.png',
                'category_slug' => 'kue-modern',
            ],
            [
                'name' => 'Pie',
                'description' => 'Kue dengan kulit renyah dan isian buah, bentuk bundar dengan pola anyaman di bagian atas.',
                'price' => 40000,
                'image_url' => '/img/pie.png',
                'category_slug' => 'kue-modern',
            ],
            [
                'name' => 'Cinnamon Roll',
                'description' => 'Kue gulung dengan aroma kayu manis dan topping berry di atasnya.',
                'price' => 18000,
                'image_url' => '/img/cinnamon-roll.png',
                'category_slug' => 'kue-modern',
            ],
            [
                'name' => 'Waffle',
                'description' => 'Kue berbentuk kotak-kotak dengan tekstur renyah di luar dan lembut di dalam.',
                'price' => 8000,
                'image_url' => '/img/waffle.png',
                'category_slug' => 'kue-modern',
            ],
            [
                'name' => 'Tiramisu cake',
                'description' => 'Kue berlapis dengan taburan coklat di atasnya, tekstur lembut dengan sentuhan kopi.',
                'price' => 20000,
                'image_url' => '/img/tiramisu-cake.png',
                'category_slug' => 'kue-modern',
            ],
            [
                'name' => 'Pastel',
                'description' => 'Makanan dengan kulit pastry renyah berisi sayuran dan daging, disajikan dengan cabai rawit merah',
                'price' => 5000,
                'image_url' => '/img/pastel.png',
                'category_slug' => 'gorengan',
            ],
            [
                'name' => 'Bakwan',
                'description' => 'Gorengan berbentuk pipih dengan campuran sayuran dan tepung, berwarna keemasan dan renyah.',
                'price' => 1500,
                'image_url' => '/img/bakwan.png',
                'category_slug' => 'gorengan',
            ],
            [
                'name' => 'Tahu Isi',
                'description' => 'Tahu yang digoreng dengan isian sayuran atau daging, tekstur renyah di luar dan lembut di dalam',
                'price' => 1500,
                'image_url' => '/img/tahu-isi.png',
                'category_slug' => 'gorengan',
            ],
            [
                'name' => 'Pisang Molen',
                'description' => 'Pisang yang dibungkus dengan kulit pastry dan digoreng hingga keemasan',
                'price' => 2000,
                'image_url' => '/img/pisang-molen.png',
                'category_slug' => 'gorengan',
            ],
            [
                'name' => 'Cireng',
                'description' => 'Makanan berbahan dasar tepung kanji yang digoreng, berbentuk bulat pipih dan disajikan dengan saus sambal',
                'price' => 1000,
                'image_url' => '/img/cireng.png',
                'category_slug' => 'gorengan',
            ],
            [
                'name' => 'Risoles',
                'description' => 'Makanan dengan kulit crepe yang diisi ragout, dibalut tepung panir dan digoreng hingga kecoklatan',
                'price' => 5500,
                'image_url' => '/img/risoles.png',
                'category_slug' => 'gorengan',
            ],
            [
                'name' => 'Tempe Mendoan',
                'description' => 'Tempe yang dipotong tipis dan digoreng dengan balutan tepung yang tidak terlalu kering, disajikan dengan cabai hijau',
                'price' => 2500,
                'image_url' => '/img/tempe-mendoan.png',
                'category_slug' => 'gorengan',
            ],
            [
                'name' => 'Bakwan Jagung',
                'description' => 'Gorengan berbahan dasar jagung dan tepung, bertekstur renyah dengan rasa gurih manis.',
                'price' => 1500,
                'image_url' => '/img/bakwan-jagung.png',
                'category_slug' => 'gorengan',
            ],
            [
                'name' => 'Pisang goreng',
                'description' => 'Pisang yang digoreng dengan balutan tepung hingga keemasan dan renyah.',
                'price' => 1500,
                'image_url' => '/img/pisang-goreng.png',
                'category_slug' => 'gorengan',
            ],
            [
                'name' => 'Es Cendol',
                'description' => 'Minuman dingin dengan potongan cendol hijau, santan, dan gula merah.',
                'price' => 10000,
                'image_url' => '/img/es-cendol.png',
                'category_slug' => 'minuman',
            ],
            [
                'name' => 'Es Oyen',
                'description' => 'Minuman es dengan campuran berbagai buah potong warna-warni seperti nanas dan mangga, alpukat',
                'price' => 10000,
                'image_url' => '/img/es-oyen.png',
                'category_slug' => 'minuman',
            ],
            [
                'name' => 'Es Campur',
                'description' => 'Minuman es dengan berbagai macam bahan seperti buah, jeli, dan cincau hitam dengan sirup',
                'price' => 10000,
                'image_url' => '/img/es-campur.png',
                'category_slug' => 'minuman',
            ],
            [
                'name' => 'Es Doger',
                'description' => 'Minuman es dengan warna merah muda dan topping buah, mengandung santan dan es serut.',
                'price' => 10000,
                'image_url' => '/img/es-doger.png',
                'category_slug' => 'minuman',
            ],
            [
                'name' => 'Es Kuwut',
                'description' => 'Minuman hijau segar dari parutan timun, sirup, dengan es batu dan potongan jeruk nipis.',
                'price' => 10000,
                'image_url' => '/img/es-kuwut.png',
                'category_slug' => 'minuman',
            ],
            [
                'name' => 'Es Teler',
                'description' => 'Minuman es dengan campuran alpukat, kelapa muda, dan buah-buahan lainnya dalam santan',
                'price' => 10000,
                'image_url' => '/img/es-teler.png',
                'category_slug' => 'minuman',
            ],
            [
                'name' => 'Es Cincau',
                'description' => 'Minuman es dengan potongan cincau hijau, daun pandan, santan, dan gula merah',
                'price' => 10000,
                'image_url' => '/img/es-cincau.png',
                'category_slug' => 'minuman',
            ],
            [
                'name' => 'Es Lilin Kacang Hijau',
                'description' => 'Camilan es beku berbentuk batang dalam plastik dengan isian kacang hijau',
                'price' => 10000,
                'image_url' => '/img/es-lilin-kacang-hijau.png',
                'category_slug' => 'minuman',
            ],
            [
                'name' => 'Es Kopyor',
                'description' => 'Minuman es dengan kelapa muda (kopyor), sirup merah, dan daun mint sebagai garnish',
                'price' => 10000,
                'image_url' => '/img/es-kopyor.png',
                'category_slug' => 'minuman',
            ],
            [
                'name' => 'Puding Tape',
                'description' => 'Puding berwarna hijau terbuat dari tape bertingkat dengan hiasan daun mint di atasnya',
                'price' => 5000,
                'image_url' => '/img/puding-tape.png',
                'category_slug' => 'puding',
            ],
            [
                'name' => 'Biji Salak',
                'description' => 'Camilan manis berbentuk bulat kecil berwarna oranye kecoklatan, terbuat dari ubi yang disajikan dengan kuah manis',
                'price' => 7500,
                'image_url' => '/img/biji-salak.png',
                'category_slug' => 'puding',
            ],
            [
                'name' => 'Pisang Ijo',
                'description' => 'Pisang yang dibungkus dengan adonan hijau, disajikan dengan saus merah dan es serut berwarna-warni',
                'price' => 10000,
                'image_url' => '/img/pisang-ijo.png',
                'category_slug' => 'puding',
            ],
            [
                'name' => 'Sagu Mutiara',
                'description' => 'Makanan penutup berbahan dasar sagu mutiara berwarna merah muda',
                'price' => 3500,
                'image_url' => '/img/sagu-mutiara.png',
                'category_slug' => 'puding',
            ],
            [
                'name' => 'Wajik Ketan',
                'description' => 'Kue tradisional berbentuk potongan persegi dari beras ketan yang dimasak dengan gula merah dan daun pandan, disajikan dengan daun pisang',
                'price' => 4500,
                'image_url' => '/img/wajik-ketan.png',
                'category_slug' => 'puding',
            ],
            [
                'name' => 'Puding Karamel',
                'description' => 'Puding berwarna kecoklatan dengan lapisan karamel di atasnya dan hiasan daun mint, tekstur lembut dan berkilau.',
                'price' => 5000,
                'image_url' => '/img/puding-karamel.png',
                'category_slug' => 'puding',
            ],
        ];

        foreach ($items as $item) {
            $category = DB::table('categories')->where('slug', $item['category_slug'])->first();

            if (!$category) {
                echo "Kategori '{$item['category_slug']}' tidak ditemukan. Item '{$item['name']}' dilewati.\n";
                continue;
            }

            DB::table('items')->insert([
                'name' => $item['name'],
                'description' => $item['description'],
                'price' => $item['price'],
                'image_url' => $item['image_url'],
                'stock' => $item['stock'] ?? 10, // Tambahkan ini
                'category_id' => $category->id,
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }

        echo "Seeder manual selesai dijalankan.\n";
    }
}