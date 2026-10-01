import { FormEventHandler } from 'react';
import { LoaderCircle } from 'lucide-react';
import { Head, useForm } from '@inertiajs/react';

import { Button } from '@/components/elements/button';
import TextLink from '@/components/elements/text-link';

export default function VerifyEmail({ status }: { status?: string }) {
  const { post, processing } = useForm({});

  const submit: FormEventHandler = (e) => {
    e.preventDefault();
    post(route('verification.send'));
  };

  return (
    <div className="min-h-screen bg-white p-4 flex flex-col">
      <div className="mt-4 flex justify-center md:justify-start">
        <img 
          src="RB-Store1.png" 
          alt="RB Store Logo" 
          className="rounded-lg w-25 h-auto mb-6"
        />
      </div>

      <div className="flex-grow flex flex-col md:flex-row border border-gray-200 rounded-t-7xl overflow-hidden">
        {/* Left Side */}
        <div className="bg-white md:w-2/3 flex flex-col p-8 justify-center">
          <div className="w-full px-2 md:px-12">
            <p className="text-[#51793E] text-sm md:text-1xl font-semibold mb-1 md:mb-4 leading-relaxed">
              Pesan aneka kue tradisional, kudapan siap saji dan penawaran spesial lainya!
            </p>

            <h2 className="text-3xl md:text-5xl font-bold text-gray-900 mb-1 leading-tight">
              Cita Rasa Nusantara,
            </h2>
            <h3 className="text-[#51793E] text-3xl md:text-5xl font-bold leading-tight">
              Tradisi dalam <br /> Genggaman
            </h3>

            <div className="relative -mt-25 md:-mt-35 flex justify-center md:justify-end md:-mr-4 z-20">
              <img 
                src="/img/klepon.png" 
                alt="Klepon - Traditional Indonesian dessert" 
                className="rounded-lg max-w-[550px] md:max-w-[620px] h-auto drop-shadow-2xl"
              />
            </div>
          </div>
        </div>

        {/* Right Side */}
        <div className="bg-[#51793E] md:w-1/2 flex items-center justify-center p-6 relative overflow-hidden rounded-l-[100px]">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <Head title="Email Verification" />
            
            <div className="mb-6">
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Verify Email</h2>
              <p className="text-gray-600 text-sm">
                Silakan verifikasi alamat email Anda dengan mengklik link yang telah kami kirim ke email Anda.
              </p>
            </div>

            {status === 'verification-link-sent' && (
              <div className="mb-4 text-center text-sm font-medium text-green-600">
                Link verifikasi baru telah dikirim ke alamat email yang Anda berikan saat registrasi.
              </div>
            )}

            <form className="flex flex-col gap-5 text-center" onSubmit={submit}>
              <div className="flex justify-center">
                <Button
                  type="submit"
                  className="bg-[#51793E] hover:bg-[#3f5d31] text-white flex items-center justify-center py-2 px-6 rounded-md"
                  disabled={processing}
                >
                  {processing ? (
                    <LoaderCircle className="h-4 w-4 animate-spin mr-2" />
                  ) : (
                    <>
                      KIRIM ULANG EMAIL VERIFIKASI
                      <svg className="ml-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 7.89a1 1 0 001.42 0L21 7M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                    </>
                  )}
                </Button>
              </div>

              <TextLink 
                href={route('logout')} 
                method="post" 
                className="mx-auto block text-sm text-gray-600 hover:text-[#51793E] underline"
              >
                Keluar
              </TextLink>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}