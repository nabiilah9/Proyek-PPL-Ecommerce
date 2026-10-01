import { FormEventHandler, useState } from 'react';
import { LoaderCircle, Calendar, User, Phone, Home, MapPin, Globe, Building } from 'lucide-react';
import { Head, useForm } from '@inertiajs/react';

import Input from '@/components/elements/input';
import Label from '@/components/elements/label';
import { Button } from '@/components/elements/button';
import InputError from '@/components/elements/input-error';

type ProfileForm = {
  name: string;
  phone: string;
  gender: "MAN" | "WOMAN";
  birthday: string;
  // New address fields
  post_code: string;
  country: string;
  province: string;
  city: string;
  street: string;
  more: string;
};

export default function CompleteProfile() {
  const { data, setData, post, processing, errors, reset } =
  useForm<ProfileForm>({
    name: '',
    phone: '',
    gender: 'MAN',
    birthday: '',
    // Initialize new address fields
    post_code: '',
    country: '',
    province: '',
    city: '',
    street: '',
    more: '',
  });

  const submit: FormEventHandler = (e) => {
    e.preventDefault();
    post(route('profile.store'), { 
    onError: (e) => console.log(e)
});
  };

  return (
    <div className="min-h-screen bg-white p-4 flex flex-col">
      <div className="mt-4 flex justify-center md:justify-start">
        {/* Logo image */}
        <img 
          src="RB-Store1.png" 
          alt="RB Store Logo" 
          className="rounded-lg w-25 h-auto mb-6"
        />
      </div>
      
      {/* Main content with border */}
      <div className="flex-grow flex flex-col md:flex-row border border-gray-200 rounded-t-7xl overflow-hidden">
        
        {/* Left side with traditional food image and text */}
        <div className="bg-white md:w-2/3 flex flex-col p-8 justify-center">
          <div className="w-full px-2 md:px-12">
            {/* Headline Atas */}
            <p className="text-[#51793E] text-sm md:text-1xl font-semibold mb-1 md:mb-4 leading-relaxed">
              Lengkapi profil Anda untuk pengalaman belanja yang lebih personal!
            </p>
            
            {/* Judul utama */}
            <h2 className="text-3xl md:text-5xl font-bold text-gray-900 mb-1 leading-tight">
              Satu Langkah Lagi,
            </h2>
            
            <h3 className="text-[#51793E] text-3xl md:text-5xl font-bold leading-tight">
              Untuk Pengalaman <br></br> Terbaik
            </h3>
            
            <div className="relative -mt-25 md:-mt-35 flex justify-center md:justify-end md:-mr-4 z-20">
              <img 
                src="img/klepon.png" 
                alt="Jajanan Tradisional Indonesia" 
                className="rounded-lg max-w-[550px] md:max-w-[620px] h-auto drop-shadow-2xl"
              />
            </div>
          </div>
        </div>
        
        {/* Right side with profile form */}
        <div className="bg-[#51793E] md:w-1/2 flex items-center justify-center p-6 relative overflow-hidden rounded-l-[100px]">
          <div className="bg-white rounded-lg p-5 w-full max-w-md overflow-y-auto max-h-[90vh] mt-8 mb-8 ml-6">
            <Head title="Complete Profile" />
            
            <div className="mb-6">
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Complete Profile</h2>
              <p className="text-gray-600">Lengkapi informasi profil Anda</p>
            </div>
            
            <form className="flex flex-col gap-4" onSubmit={submit}>
              {/* Personal Information Section */}
              <div className="mb-4">
                <h3 className="text-lg font-semibold text-gray-800 mb-3">Informasi Pribadi</h3>
                
                <div className="mb-3">
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                    Nama Lengkap
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <User className="h-5 w-5 text-gray-400" />
                    </div>
                    <Input 
                      id="name"
                      type="text"
                      className="w-full bg-green-50 border-green-100 pl-10 focus:border-[#51793E] focus:ring focus:ring-green-200 focus:ring-opacity-50"
                      placeholder="Nama lengkap Anda"
                      required
                      value={data.name}
                      onChange={(e) => setData('name', e.target.value)}
                      disabled={processing}
                    />
                  </div>
                  <InputError message={errors.name} className="mt-2" />
                </div>
                
                <div className="mb-3">
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                    Nomor Telepon
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Phone className="h-5 w-5 text-gray-400" />
                    </div>
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="08123456789"
                      className="w-full bg-green-50 border-green-100 pl-10 focus:border-[#51793E] focus:ring focus:ring-green-200 focus:ring-opacity-50"
                      required
                      value={data.phone}
                      onChange={(e) => setData('phone', e.target.value)}
                    />
                  </div>
                  <InputError message={errors.phone} />
                </div>
                
                <div className="mb-3">
                  <label htmlFor="gender" className="block text-sm font-medium text-gray-700 mb-1">
                    Jenis Kelamin
                  </label>
                  <div className="flex gap-4">
                    <div className="flex items-center">
                      <input
                        id="gender-man"
                        name="gender"
                        type="radio"
                        className="h-4 w-4 text-[#51793E] focus:ring-[#51793E] border-gray-300"
                        checked={data.gender === 'MAN'}
                        onChange={() => setData('gender', 'MAN')}
                        required
                      />
                      <label htmlFor="gender-man" className="ml-2 block text-sm text-gray-700">
                        Laki-laki
                      </label>
                    </div>
                    <div className="flex items-center">
                      <input
                        id="gender-woman"
                        name="gender"
                        type="radio"
                        className="h-4 w-4 text-[#51793E] focus:ring-[#51793E] border-gray-300"
                        checked={data.gender === 'WOMAN'}
                        onChange={() => setData('gender', 'WOMAN')}
                        required
                      />
                      <label htmlFor="gender-woman" className="ml-2 block text-sm text-gray-700">
                        Perempuan
                      </label>
                    </div>
                  </div>
                  <InputError message={errors.gender} />
                </div>
                
                <div className="mb-3">
                  <label htmlFor="birthday" className="block text-sm font-medium text-gray-700 mb-1">
                    Tanggal Lahir
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Calendar className="h-5 w-5 text-gray-400" />
                    </div>
                    <Input
                      id="birthday"
                      type="date"
                      className="w-full bg-green-50 border-green-100 pl-10 focus:border-[#51793E] focus:ring focus:ring-green-200 focus:ring-opacity-50"
                      required
                      value={data.birthday}
                      onChange={(e) => setData('birthday', e.target.value)}
                    />
                  </div>
                  <InputError message={errors.birthday} />
                </div>
              </div>

              {/* Address Section */}
              <div className="mb-4">
                <h3 className="text-lg font-semibold text-gray-800 mb-3">Alamat</h3>
                
                <div className="mb-3">
                  <label htmlFor="street" className="block text-sm font-medium text-gray-700 mb-1">
                    Alamat Jalan
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Home className="h-5 w-5 text-gray-400" />
                    </div>
                    <Input 
                      id="street"
                      type="text"
                      className="w-full bg-green-50 border-green-100 pl-10 focus:border-[#51793E] focus:ring focus:ring-green-200 focus:ring-opacity-50"
                      placeholder="Jalan dan nomor rumah"
                      required
                      value={data.street}
                      onChange={(e) => setData('street', e.target.value)}
                      disabled={processing}
                    />
                  </div>
                  <InputError message={errors.street} className="mt-2" />
                </div>
                
                <div className="mb-3">
                  <label htmlFor="more" className="block text-sm font-medium text-gray-700 mb-1">
                    Detail Tambahan
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Building className="h-5 w-5 text-gray-400" />
                    </div>
                    <Input 
                      id="more"
                      type="text"
                      className="w-full bg-green-50 border-green-100 pl-10 focus:border-[#51793E] focus:ring focus:ring-green-200 focus:ring-opacity-50"
                      placeholder="RT/RW, Apartemen, dll (opsional)"
                      value={data.more}
                      onChange={(e) => setData('more', e.target.value)}
                      disabled={processing}
                    />
                  </div>
                  <InputError message={errors.more} className="mt-2" />
                </div>
                
                <div className="grid grid-cols-2 gap-3 mb-3">
                  <div>
                    <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-1">
                      Kota
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Building className="h-5 w-5 text-gray-400" />
                      </div>
                      <Input 
                        id="city"
                        type="text"
                        className="w-full bg-green-50 border-green-100 pl-10 focus:border-[#51793E] focus:ring focus:ring-green-200 focus:ring-opacity-50"
                        placeholder="Kota"
                        required
                        value={data.city}
                        onChange={(e) => setData('city', e.target.value)}
                        disabled={processing}
                      />
                    </div>
                    <InputError message={errors.city} className="mt-2" />
                  </div>
                  
                  <div>
                    <label htmlFor="post_code" className="block text-sm font-medium text-gray-700 mb-1">
                      Kode Pos
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <MapPin className="h-5 w-5 text-gray-400" />
                      </div>
                      <Input 
                        id="post_code"
                        type="text"
                        className="w-full bg-green-50 border-green-100 pl-10 focus:border-[#51793E] focus:ring focus:ring-green-200 focus:ring-opacity-50"
                        placeholder="Kode Pos"
                        required
                        value={data.post_code}
                        onChange={(e) => setData('post_code', e.target.value)}
                        disabled={processing}
                      />
                    </div>
                    <InputError message={errors.post_code} className="mt-2" />
                  </div>
                </div>
                
                <div className="mb-3">
                  <label htmlFor="province" className="block text-sm font-medium text-gray-700 mb-1">
                    Provinsi
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <MapPin className="h-5 w-5 text-gray-400" />
                    </div>
                    <Input 
                      id="province"
                      type="text"
                      className="w-full bg-green-50 border-green-100 pl-10 focus:border-[#51793E] focus:ring focus:ring-green-200 focus:ring-opacity-50"
                      placeholder="Provinsi"
                      required
                      value={data.province}
                      onChange={(e) => setData('province', e.target.value)}
                      disabled={processing}
                    />
                  </div>
                  <InputError message={errors.province} className="mt-2" />
                </div>
                
                <div className="mb-3">
                  <label htmlFor="country" className="block text-sm font-medium text-gray-700 mb-1">
                    Negara
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Globe className="h-5 w-5 text-gray-400" />
                    </div>
                    <Input 
                      id="country"
                      type="text"
                      className="w-full bg-green-50 border-green-100 pl-10 focus:border-[#51793E] focus:ring focus:ring-green-200 focus:ring-opacity-50"
                      placeholder="Negara"
                      required
                      value={data.country}
                      onChange={(e) => setData('country', e.target.value)}
                      disabled={processing}
                    />
                  </div>
                  <InputError message={errors.country} className="mt-2" />
                </div>
              </div>
              
              <div className="flex justify-center mt-6">
                <Button 
                  type="submit" 
                  className="bg-[#51793E] hover:bg-[#3f5d31] text-white flex items-center justify-center py-2 px-6 rounded-md w-full"
                  disabled={processing}
                >
                  {processing ? (
                    <LoaderCircle className="h-4 w-4 animate-spin mr-2" />
                  ) : (
                    <>
                      SIMPAN PROFIL
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