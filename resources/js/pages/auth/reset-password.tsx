import { FormEventHandler } from 'react';
import { LoaderCircle } from 'lucide-react';
import { Head, useForm } from '@inertiajs/react';

import Input from '@/components/elements/input';
import { Button } from '@/components/elements/button';
import InputError from '@/components/elements/input-error';

interface ResetPasswordProps {
  token: string;
  email: string;
}

type ResetPasswordForm = {
  token: string;
  email: string;
  password: string;
  password_confirmation: string;
};

export default function ResetPassword({ token, email }: ResetPasswordProps) {
  const { data, setData, post, processing, errors, reset } =
    useForm<Required<ResetPasswordForm>>({
      token: token,
      email: email,
      password: '',
      password_confirmation: '',
    });

  const submit: FormEventHandler = (e) => {
    e.preventDefault();
    post(route('password.store'), {
      onFinish: () => reset('password', 'password_confirmation'),
    });
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
            <Head title="Reset Password" />
            
            <div className="mb-6">
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Reset Password</h2>
              <p className="text-gray-600 text-sm">
                Masukkan password baru untuk akun Anda
              </p>
            </div>

            <form className="flex flex-col gap-5" onSubmit={submit}>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <Input
                  id="email"
                  type="email"
                  className="w-full bg-green-50 border-green-100 focus:border-[#51793E] focus:ring focus:ring-green-200 focus:ring-opacity-50"
                  readOnly
                  value={data.email}
                  onChange={(e) => setData('email', e.target.value)}
                />
                <InputError message={errors.email} />
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                  Password Baru
                </label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Masukkan password baru"
                  className="w-full bg-green-50 border-green-100 focus:border-[#51793E] focus:ring focus:ring-green-200 focus:ring-opacity-50"
                  required
                  value={data.password}
                  onChange={(e) => setData('password', e.target.value)}
                  autoFocus
                  autoComplete="new-password"
                />
                <InputError message={errors.password} />
              </div>

              <div>
                <label htmlFor="password_confirmation" className="block text-sm font-medium text-gray-700 mb-1">
                  Konfirmasi Password
                </label>
                <Input
                  id="password_confirmation"
                  type="password"
                  placeholder="Konfirmasi password baru"
                  className="w-full bg-green-50 border-green-100 focus:border-[#51793E] focus:ring focus:ring-green-200 focus:ring-opacity-50"
                  required
                  value={data.password_confirmation}
                  onChange={(e) => setData('password_confirmation', e.target.value)}
                  autoComplete="new-password"
                />
                <InputError message={errors.password_confirmation} />
              </div>

              <div className="flex justify-center mt-2">
                <Button
                  type="submit"
                  className="bg-[#51793E] hover:bg-[#3f5d31] text-white flex items-center justify-center py-2 px-6 rounded-md"
                  disabled={processing}
                >
                  {processing ? (
                    <LoaderCircle className="h-4 w-4 animate-spin mr-2" />
                  ) : (
                    <>
                      RESET PASSWORD
                      <svg className="ml-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                      </svg>
                    </>
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}