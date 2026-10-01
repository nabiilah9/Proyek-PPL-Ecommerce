<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User; // Pastikan ini adalah path yang benar ke model User Anda
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Laravel\Socialite\Facades\Socialite;
use Illuminate\Support\Str;
use Illuminate\Auth\Events\Registered;
use Illuminate\Support\Facades\Log;
// Jika belum ada, tambahkan GuzzleHttp\Client
use GuzzleHttp\Client as GuzzleClient;


class SocialiteController extends Controller
{
    /**
     * Redirect the user to the Google authentication page.
     *
     * @return \Illuminate\Http\RedirectResponse|\Symfony\Component\HttpFoundation\RedirectResponse
     */
    public function redirectToGoogle()
    {
        return Socialite::driver('google')->redirect();
    }

    /**
     * Obtain the user information from Google and handle login/registration.
     *
     * @return \Illuminate\Http\RedirectResponse
     */
    public function handleGoogleCallback()
    {
        try {
            // MEMBUAT INSTANCE GUZZLE CLIENT BARU DENGAN OPSI 'verify' => false
            $guzzleClient = new GuzzleClient([ // Menggunakan alias GuzzleClient jika sudah di-import di atas
                'verify' => false, // Menonaktifkan verifikasi SSL (HANYA LOKAL!)
            ]);

            // MENGGUNAKAN GUZZLE CLIENT YANG SUDAH DIKONFIGURASI
            $googleUser = Socialite::driver('google')
                ->stateless()
                ->setHttpClient($guzzleClient)
                ->user();

            $userEmail = $googleUser->getEmail();
            $googleDisplayName = $googleUser->getName(); // Nama dari Google, akan digunakan untuk membuat username
            $googleAvatar = $googleUser->getAvatar();   // URL Avatar dari Google

            // Cek apakah pengguna dengan email ini sudah ada
            $user = User::where('email', $userEmail)->first();

            if ($user) {
                // Pengguna sudah ada, lakukan proses login
                // Jika ini pertama kalinya pengguna login dengan Google, simpan google_id dan token
                if (empty($user->google_id)) {
                    $user->google_id = $googleUser->getId();
                    $user->google_token = $googleUser->token;
                    $user->google_refresh_token = $googleUser->refreshToken;
                    // Jika Anda ingin memperbarui avatar dengan yang dari Google setiap login:
                    // $user->avatar = $googleAvatar;
                    $user->save();
                }
                Auth::login($user);
            } else {
                // Pengguna baru, buat akun baru
                // --- Strategi Membuat Username Unik (maks 25 karakter) ---
                $baseUsername = '';
                if (!empty($googleDisplayName)) {
                    $baseUsername = Str::slug($googleDisplayName);
                }

                if (empty($baseUsername)) {
                    $emailParts = explode('@', $userEmail);
                    $baseUsername = Str::slug($emailParts[0]);
                }

                if (empty($baseUsername)) {
                    $baseUsername = 'user';
                }

                $username = Str::limit($baseUsername, 20, '');
                $originalAttemptUsername = $username; 
                $counter = 1;

                while (User::where('username', $username)->exists()) {
                    $suffix = (string)$counter;
                    $username = Str::limit($originalAttemptUsername, 25 - strlen($suffix), '') . $suffix;
                    $counter++;

                    if ($counter > 1000) {
                        Log::error("Gagal membuat username unik (setHttpClient) untuk email: " . $userEmail . " dengan nama dasar: " . $originalAttemptUsername . " setelah " . $counter . " percobaan.");
                        $username = 'user' . Str::random(15); 
                        $username = substr($username, 0, 25);   
                        if (User::where('username', $username)->exists()) {
                             throw new \Exception("Tidak dapat membuat username unik (setHttpClient) setelah banyak percobaan. Email: " . $userEmail);
                        }
                        break;
                    }
                }
                // --- Akhir Strategi Username Unik ---

                $newUser = User::create([
                    // 'name' => $googleDisplayName, // HAPUS/KOMENTARI JIKA TIDAK ADA KOLOM 'name' DI TABEL users
                    'username' => $username,          
                    'email' => $userEmail,            
                    'google_id' => $googleUser->getId(),
                    'password' => Hash::make(Str::random(24)), 
                    'email_verified_at' => now(), 
                    'google_token' => $googleUser->token,
                    'google_refresh_token' => $googleUser->refreshToken,
                    'avatar' => $googleAvatar,       
                    // 'role' => 'CLIENT',          
                    // 'status' => 'active',        
                ]);

                Auth::login($newUser);
                event(new Registered($newUser)); 
            }

            // Mengarahkan ke 'Homepage' seperti yang Anda ubah
            return redirect()->intended(route('Homepage')); 

        } catch (\Laravel\Socialite\Two\InvalidStateException $e) {
            Log::warning('Google Login Invalid State: ' . $e->getMessage());
            return redirect()->route('login')->with('error', 'Login Google gagal: Sesi tidak valid. Silakan coba lagi.');
        } catch (\Exception $e) {
            Log::error('Google Login Error (General - setHttpClient): ' . $e->getMessage() . "\nStack Trace:\n" . $e->getTraceAsString());
            return redirect()->route('login')->with('error', 'Login Google Gagal: Terjadi kesalahan internal. [' . $e->getMessage() .']');
        }
    }
}