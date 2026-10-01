<?php

namespace Database\Seeders;

use App\Models\Address;
use App\Models\Contact;
use App\Models\User;
use Illuminate\Support\Str;
use Illuminate\Database\Seeder;
use Illuminate\Support\Arr;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    public function run(): void
    {
        $edho = User::factory()->edho()->admin()->create();
        $roni = User::factory()->roni()->courier()->create();
        Contact::factory()->create([
            'user_id'   => $roni->id,
            'name'      => 'Backend Sejati',
            'phone'     => '08123456789',
            'gender'    => 'MAN',
            'birthday'  => '1945-08-17',
            'profile'   => 'https://example.com/roni.jpg',
        ]);
        $prasetyo = User::factory()->prasetyo()->client()->create();
        $prasetyoContact = Contact::factory()->create([
            'user_id'   => $prasetyo->id,
            'name'      => 'Fullstacknya UTM',
            'phone'     => '08123987465',
            'gender'    => 'MAN',
            'birthday'  => '2000-02-02',
            'profile'   => 'https://example.com/prasetyo.jpg',
            'favourite' => json_encode(['Kue Basah']),
        ]);
        Address::factory()->create([
            'contact_id' => $prasetyoContact->id,
            'post_code' => '12345',
            'country'   => 'Indonesia',
            'province'  => 'Jawa Timur',
            'city'      => 'Bangkalan',
            'street'    => 'Jl. Telang No.1',
            'more'      => 'RT 01/RW 02',
        ]);

        User::factory()->ainun()->create();
        User::factory()->khoir()->create();
        User::factory()->seinal()->create();
        User::factory()->yichang()->create();

        User::factory()->nur()->create();
        User::factory()->suhaila()->create();
        User::factory()->layli()->create();

        User::factory()->count(10)->create([
            "role" => "COURIER",
        ]);
        $inactiveClients = User::factory()->count(40)->make([
            'role' => 'CLIENT',
            'status' => 'inactive',
        ]);
        $activeClients = User::factory()->count(40)->make([
            'role' => 'CLIENT',
            'status' => 'active',
        ]);
        $clients = $inactiveClients->concat($activeClients)->shuffle();
        $clients->each(fn($client) => $client->save());

        User::where('role', 'ADMIN')->where('id', '!=', $edho->id)->inRandomOrder()->first()?->delete();
        User::where('role', 'COURIER')->where('id', '!=', $roni->id)->inRandomOrder()->first()?->delete();
        User::where('role', 'CLIENT')->where('id', '!=', $prasetyo->id)->inRandomOrder()->first()?->delete();

        $userIds = User::where('role', '!=', 'ADMIN')->pluck('id')->toArray();
        Contact::factory()
            ->count(250)
            ->make()
            ->each(function (Contact $contact) use ($userIds) {
                $contact->user_id = Arr::random($userIds);
                $contact->save();
            });


        $clientContactIds = Contact::whereHas('user', fn($q) => $q->where('role', 'CLIENT'))
                                ->pluck('id')
                                ->toArray();
        Address::factory()
            ->count(500)
            ->make()
            ->each(function (Address $address) use ($clientContactIds) {
                $address->contact_id = Arr::random($clientContactIds);
                $address->save();
            });
    }
}
