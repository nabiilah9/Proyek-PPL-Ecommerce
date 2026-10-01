import { FormEventHandler } from 'react';
import { LoaderCircle, Eye, EyeOff } from 'lucide-react';
import { Head, useForm, Link } from '@inertiajs/react'; // Tambahkan Link jika belum ada
import { useState } from 'react';
import { FcGoogle } from 'react-icons/fc'; // Import ikon Google

import Input from '@/components/elements/input';
import { Button } from '@/components/elements/button';
import InputError from '@/components/elements/input-error';

type LoginForm = {
  email: string;
  username: string; // username masih ada di form login standar
  password: string;
  remember: boolean;
};

interface LoginProps {
  status?: string;
  canResetPassword: boolean;
  // Tambahkan error dari Google login jika ada
  errors?: {
      email?: string;
      username?: string;
      password?: string;
      google?: string; // Untuk menampilkan error dari socialite
  } & Record<string, string>; // Untuk error lainnya dari useForm
};

export default function Login({ status, canResetPassword, errors: pageErrors }: LoginProps) { // Ganti 'errors' menjadi 'pageErrors' untuk menghindari konflik dengan errors dari useForm
  const [showPassword, setShowPassword] = useState(false);
  
  const { data, setData, post, processing, errors, reset } = // 'errors' di sini adalah dari useForm
    useForm<Required<LoginForm>>({
      email: '',
      username: '', //
      password: '',
      remember: false,
    });

  const submit: FormEventHandler = (e) => {
    e.preventDefault();
    post(route('login'), {
      onFinish: () => reset('password'),
    });
  };

  return (
    <div className="min-h-screen bg-white p-4 flex flex-col">
        <div className="mt-4 flex justify-center md:justify-start">
            <img 
                src="/RB-Store1.png" // Pastikan path ini benar dan gambar ada di public folder
                alt="RB Store Logo" 
                className="rounded-lg w-25 h-auto mb-6" //
            />
        </div>
        <div className="flex-grow flex flex-col md:flex-row border border-gray-200 rounded-t-7xl overflow-hidden">
            <div className="bg-white md:w-2/3 flex flex-col p-8 justify-center">
                <div className="w-full px-2 md:px-12">
                    <p className="text-[#51793E] text-sm md:text-1xl font-semibold mb-1 md:mb-4 leading-relaxed">
                        Pesan aneka kue tradisional, kudapan siap saji dan penawaran spesial lainya!
                    </p>
                    <h2 className="text-3xl md:text-5xl font-bold text-gray-900 mb-1 leading-tight">
                        Cita Rasa Nusantara,
                    </h2>
                    <h3 className="text-[#51793E] text-3xl md:text-5xl font-bold leading-tight">
                        Tradisi dalam <br></br> Genggaman
                    </h3>
                    <div className="relative -mt-25 md:-mt-35 flex justify-center md:justify-end md:-mr-4 z-20">
                        <img 
                            src="/img/klepon.png" // Pastikan path ini benar dan gambar ada di public/img folder
                            alt="Klepon - Traditional Indonesian dessert" //
                            className="rounded-lg max-w-[550px] md:max-w-[620px] h-auto drop-shadow-2xl" //
                        />
                    </div>
                </div>
            </div>
            
              <div className="bg-[#51793E] md:w-1/2 flex items-center justify-center p-6 relative overflow-hidden rounded-l-[100px]">        
                <div className="bg-white rounded-lg p-6 w-full max-w-md"> 
                    <Head title="Sign In" />
                    
                    <div className="mb-6">
                        <p className="text-gray-600 text-sm">Welcome back !!!</p>
                        <h2 className="text-3xl font-bold text-gray-900 mb-6">Sign in</h2>
                    </div>

                    {/* Menampilkan error dari Google login jika ada */}
                    {pageErrors && pageErrors.google && (
                        <div className="mb-4 font-medium text-sm text-red-600">
                            {pageErrors.google}
                        </div>
                    )}
                    {/* Menampilkan status seperti reset password */}
                    {status && !pageErrors?.google && (
                        <div className="mb-4 font-medium text-sm text-green-600">
                            {status}
                        </div>
                    )}


                    <form className="flex flex-col gap-5" onSubmit={submit}> {/* */}
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1"> {/* */}
                                Email
                            </label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="test@gmail.com" //
                                className="w-full bg-green-50 border-green-100 focus:border-[#51793E] focus:ring focus:ring-green-200 focus:ring-opacity-50" //
                                required
                                value={data.email}
                                onChange={(e) => setData('email', e.target.value)}
                                autoComplete="email"
                            />
                            <InputError message={errors.email || pageErrors?.email} /> {/* Gabungkan error dari useForm dan pageErrors */}
                        </div>

                        <div>
                            <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1"> {/* */}
                                Username
                            </label>
                            <Input
                                id="username"
                                type="text"
                                placeholder="Username" //
                                className="w-full bg-green-50 border-green-100 focus:border-[#51793E] focus:ring focus:ring-green-200 focus:ring-opacity-50" //
                                required
                                value={data.username}
                                onChange={(e) => setData('username', e.target.value)}
                                autoComplete="username"
                            />
                            <InputError message={errors.username || pageErrors?.username} /> {/* Gabungkan error */}
                        </div>

                        <div>
                            <div className="flex justify-between mb-1"> {/* */}
                                <label htmlFor="password" className="block text-sm font-medium text-gray-700"> {/* */}
                                    Password
                                </label>
                                {canResetPassword && (
                                    <Link // Gunakan Link dari Inertia untuk navigasi internal
                                        href={route('password.request')}
                                        className="text-sm text-gray-500 hover:text-[#51793E]" //
                                    >
                                        Forgot Password?
                                    </Link>
                                )}
                            </div>
                            <div className="relative"> {/* */}
                                <Input
                                    id="password"
                                    type={showPassword ? "text" : "password"}
                                    placeholder="••••••••••••" //
                                    className="w-full bg-green-50 border-green-100 focus:border-[#51793E] focus:ring focus:ring-green-200 focus:ring-opacity-50" //
                                    required
                                    value={data.password}
                                    onChange={(e) => setData('password', e.target.value)}
                                    autoComplete="current-password"
                                />
                                <button 
                                    type="button"
                                    className="absolute inset-y-0 right-0 pr-3 flex items-center" //
                                    onClick={() => setShowPassword(!showPassword)}
                                >
                                    {showPassword ? (
                                        <EyeOff className="h-5 w-5 text-gray-400" /> //
                                    ) : (
                                        <Eye className="h-5 w-5 text-gray-400" /> //
                                    )}
                                </button>
                            </div>
                            <InputError message={errors.password || pageErrors?.password} /> {/* Gabungkan error */}
                        </div>

                        <div className="flex justify-center mt-2"> {/* */}
                            <Button 
                                type="submit" 
                                className="bg-[#51793E] hover:bg-[#3f5d31] text-white flex items-center justify-center py-2 px-6 rounded-md w-full" // Tambahkan w-full untuk lebar penuh
                                disabled={processing}
                            >
                                {processing ? (
                                    <LoaderCircle className="h-4 w-4 animate-spin mr-2" /> //
                                ) : (
                                    <>
                                        SIGN IN
                                        <svg className="ml-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"> {/* */}
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" /> {/* */}
                                        </svg>
                                    </>
                                )}
                            </Button>
                        </div>
                    </form>

                    {/* Pembatas "OR" */}
                    <div className="my-6 flex items-center"> {/* style original */}
                        <div className="flex-grow border-t border-gray-300"></div>
                        <span className="mx-4 flex-shrink text-sm text-gray-500">OR</span>
                        <div className="flex-grow border-t border-gray-300"></div>
                    </div>

                    {/* Tombol Login dengan Google */}
                    <a // Gunakan tag 'a' untuk mengarahkan ke rute backend
                        href={route('login.google.redirect')} // Arahkan ke rute redirect Google
                        className="w-full flex items-center justify-center py-2.5 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#51793E]"
                    >
                        <FcGoogle className="h-5 w-5 mr-3" />
                        Sign in with Google
                    </a>
                    
                    <div className="text-center text-gray-500 text-sm mt-6"> {/* style original, tambahkan margin atas */}
                        I don't have an account? {' '}
                        <Link // Gunakan Link dari Inertia
                            href={route('register')} 
                            className="text-[#51793E] hover:underline font-medium" //
                        >
                            Sign up
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    </div>
  );
}