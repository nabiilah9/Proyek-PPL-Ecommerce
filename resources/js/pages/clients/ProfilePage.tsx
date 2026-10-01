import React, { useState, useEffect, FormEvent, ChangeEvent } from 'react';
import { ChevronDown, ChevronUp, User, ArrowLeft, MapPin, XCircle, PlusCircle, Trash2 } from 'lucide-react'; // Tambahkan ChevronUp
import { useForm, Head } from '@inertiajs/react';

// Define interfaces for better type checking
interface UserProps {
  id: number;
  name: string;
  username: string;
  email: string;
}

interface ContactProps {
  id: number;
  phone: string;
  gender: 'MAN' | 'WOMAN';
  birthday: string;
  profile?: string | null;
}

export interface AddressProps {
  id?: number;
  post_code: string;
  country: string;
  province: string;
  city: string;
  street: string;
  more: string;
  [key: string]: string | number | undefined;
}

interface ProfilePageProps {
  user: UserProps;
  contact?: ContactProps | null;
  addresses: AddressProps[];
  flash?: {
    success?: string;
    error?: string;
  };
  errors: Record<string, string>;
}

// Explicitly define the type for the form data
interface ProfileFormData {
  _method: 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  name: string;
  username: string;
  email: string;
  password?: string;
  password_confirmation?: string;
  phone: string;
  gender: 'MAN' | 'WOMAN';
  birthday: string;
  profile: File | null;
  current_profile_url: string | null;
  profile_removed: boolean;
  addresses: AddressProps[];
  [key: string]: string | boolean | File | null | AddressProps[] | ('POST' | 'PUT' | 'PATCH' | 'DELETE') | ('MAN' | 'WOMAN') | undefined;
}

export default function ProfilePage({ user, contact, addresses: initialAddresses, flash, errors: serverErrors }: ProfilePageProps) {

  const { data, setData, post, processing, errors, reset, progress } = useForm<ProfileFormData>({
    _method: 'POST', // Default method, can be overridden by specific actions if needed.
    name: user.name,
    username: user.username,
    email: user.email,
    password: '',
    password_confirmation: '',
    phone: contact?.phone || '',
    gender: contact?.gender || 'MAN',
    birthday: contact?.birthday || '',
    profile: null,
    current_profile_url: contact?.profile ? `/storage/${contact.profile}` : null,
    profile_removed: false,
    addresses: initialAddresses || [],
  });

  const [profilePreview, setProfilePreview] = useState<string | null>(data.current_profile_url);
  // State untuk mengontrol alamat mana yang terbuka
  const [openAddressIndexes, setOpenAddressIndexes] = useState<number[]>([]);

  useEffect(() => {
    setData('addresses', initialAddresses || []);
    // Secara default, semua alamat tertutup saat pertama kali dimuat
    setOpenAddressIndexes([]);
  }, [initialAddresses]);

  useEffect(() => {
    setProfilePreview(data.current_profile_url);
  }, [data.current_profile_url]);

  // Fungsi untuk toggle visibilitas form alamat
  const toggleAddressForm = (index: number) => {
    setOpenAddressIndexes(prevIndexes =>
      prevIndexes.includes(index)
        ? prevIndexes.filter(i => i !== index)
        : [...prevIndexes, index]
    );
  };

  const handleAddressChange = (index: number, field: keyof AddressProps, value: string) => {
    setData(prevData => {
      const updatedAddresses = [...prevData.addresses];
      const currentAddress = updatedAddresses[index] || {};
      updatedAddresses[index] = {
        ...currentAddress,
        [field]: value
      } as AddressProps;
      return { ...prevData, addresses: updatedAddresses };
    });
  };

  const handleAddAddress = () => {
    const newAddressIndex = data.addresses.length;
    setData(prevData => ({
      ...prevData,
      addresses: [
        ...prevData.addresses,
        { id: undefined, post_code: '', country: '', province: '', city: '', street: '', more: '' }
      ]
    }));
    // Buka form alamat yang baru ditambahkan
    setOpenAddressIndexes(prevIndexes => [...prevIndexes, newAddressIndex]);
  };

  const handleRemoveAddress = (index: number) => {
    if (confirm('Are you sure you want to remove this address?')) {
      setData(prevData => {
        const updatedAddresses = [...prevData.addresses];
        updatedAddresses.splice(index, 1);
        return { ...prevData, addresses: updatedAddresses };
      });
      // Tutup form jika alamat yang dihapus sedang terbuka dan sesuaikan indeks
      setOpenAddressIndexes(prevIndexes => prevIndexes.filter(i => i !== index).map(i => i > index ? i -1 : i) );
    }
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setData(prevData => ({
        ...prevData,
        profile: file,
        profile_removed: false
      }));
      setProfilePreview(URL.createObjectURL(file));
    }
  };

  const handleRemoveProfile = () => {
    if (confirm('Are you sure you want to remove your profile picture?')) {
      setData(prevData => ({
        ...prevData,
        profile: null,
        profile_removed: true,
      }));
      setProfilePreview(null);
    }
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    post(route('profile.update'), {
      forceFormData: true, // Penting jika ada file upload
      onSuccess: (page) => {
        const pageProps = page.props as unknown as ProfilePageProps;
        const newFlash = pageProps.flash;
        if (newFlash?.success) {
            alert(newFlash.success);
        } else {
            alert('Profile updated successfully!');
        }
        reset('password', 'password_confirmation');
      },
      onError: (formErrors) => {
        console.error("Form submission errors:", formErrors);
        alert('Failed to update profile. Please check the form for errors.');
      },
    });
  };

  const formatAddress = (addressItem: AddressProps): string => {
    const relevantFields = [
        addressItem.street,
        addressItem.city,
        addressItem.province,
        addressItem.country,
        addressItem.post_code,
        addressItem.more
    ];
    const parts = relevantFields.filter(Boolean); // Filter nilai yang kosong atau null
    if (parts.length === 0) {
        return 'Alamat belum diisi lengkap'; // Atau pesan default lainnya
    }
    return parts.join(', ');
  };


  const displayErrors = errors || serverErrors || {};
  const typedErrors = displayErrors as Record<string, string>;

  const inputClassName = "w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900";
  const errorClassName = "text-red-500 text-sm mt-1";

  return (
    <div className="min-h-screen bg-gray-50">
      <Head title="Profile" />

      {/* Header Section */}
      <div className="bg-white shadow-sm">
        <div className="w-full px-4 py-4">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => window.history.back()}
              className="p-2 hover:bg-gray-100 rounded-full"
            >
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </button>
            <div className="flex items-center space-x-4">
              <div className="relative">
                <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center overflow-hidden">
                  {profilePreview ? (
                    <img
                      src={profilePreview}
                      alt="Profile Preview"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <User className="w-6 h-6 text-gray-400" />
                  )}
                </div>
                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white"></div>
              </div>
              <div>
                <h1 className="text-lg font-semibold text-gray-900">{data.name || 'User'}</h1>
                <p className="text-sm text-gray-500">{data.email || 'user@example.com'}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="w-full px-4 py-6">
        <form onSubmit={handleSubmit}>
          <div className="space-y-6">
            {/* Profile Information Form Section */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                  <input type="text" value={data.name} onChange={(e) => setData('name', e.target.value)} className={inputClassName} placeholder="Seinal Arifin"/>
                  {typedErrors.name && <p className={errorClassName}>{typedErrors.name}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Username</label>
                  <input type="text" value={data.username} onChange={(e) => setData('username', e.target.value)} className={inputClassName} placeholder="Seinal"/>
                  {typedErrors.username && <p className={errorClassName}>{typedErrors.username}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                  <input type="email" value={data.email} onChange={(e) => setData('email', e.target.value)} className={inputClassName} placeholder="seinalarifin@gmail.com"/>
                  {typedErrors.email && <p className={errorClassName}>{typedErrors.email}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">No. handphone</label>
                  <input type="text" value={data.phone} onChange={(e) => setData('phone', e.target.value)} className={inputClassName} placeholder="08234567890"/>
                  {typedErrors.phone && <p className={errorClassName}>{typedErrors.phone}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Password (leave blank to keep current)</label>
                  <input type="password" value={data.password || ''} onChange={(e) => setData('password', e.target.value)} className={inputClassName} placeholder="••••••••••••••" autoComplete="new-password"/>
                  {typedErrors.password && <p className={errorClassName}>{typedErrors.password}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Konfirmasi Password</label>
                  <input type="password" value={data.password_confirmation || ''} onChange={(e) => setData('password_confirmation', e.target.value)} className={inputClassName} placeholder="••••••••••••••" autoComplete="new-password"/>
                  {typedErrors.password_confirmation && <p className={errorClassName}>{typedErrors.password_confirmation}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Jenis Kelamin</label>
                  <div className="relative">
                    <select value={data.gender} onChange={(e) => setData('gender', e.target.value as 'MAN' | 'WOMAN')} className={`${inputClassName} appearance-none`}>
                      <option value="MAN">Laki-laki</option>
                      <option value="WOMAN">Perempuan</option>
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                  </div>
                  {typedErrors.gender && <p className={errorClassName}>{typedErrors.gender}</p>}
                </div>
                <div className="md:col-span-1">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Tanggal Lahir</label>
                  <input type="date" value={data.birthday} onChange={(e) => setData('birthday', e.target.value)} className={inputClassName} />
                  {typedErrors.birthday && <p className={errorClassName}>{typedErrors.birthday}</p>}
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Profile Picture</label>
                  <input type="file" accept="image/*" onChange={handleFileChange} className={`${inputClassName} mb-2`} />
                   {progress && (
                     <div className="w-full bg-gray-200 rounded-full h-2.5 mb-2">
                       <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: `${progress.percentage}%` }}></div>
                     </div>
                   )}
                  {typedErrors.profile && <p className={errorClassName}>{typedErrors.profile}</p>}
                  {profilePreview && (
                    <div className="mt-2 flex items-center space-x-2">
                      <img src={profilePreview} alt="Profile Preview" className="w-16 h-16 object-cover rounded-full" />
                      <button type="button" onClick={handleRemoveProfile} className="text-red-500 hover:text-red-700 flex items-center text-sm">
                        <XCircle className="w-4 h-4 mr-1" /> Hapus Foto
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Addresses Section */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Alamat saya</h3>
                <button
                  type="button"
                  onClick={handleAddAddress}
                  className="px-4 py-2 bg-[#51793E] text-white font-medium rounded-md hover:bg-opacity-90 flex items-center text-sm"
                >
                  <PlusCircle className="w-4 h-4 mr-2" /> Tambah Alamat
                </button>
              </div>
              {data.addresses.length === 0 && (
                <p className="text-gray-500 text-sm">Belum ada alamat tersimpan. Klik "Tambah Alamat" untuk menambahkan.</p>
              )}
              {data.addresses.map((addressItem, index) => {
                const isOpen = openAddressIndexes.includes(index);
                return (
                  <div key={addressItem.id || `new-address-${index}`} className="border border-gray-200 rounded-lg mb-4 overflow-hidden">
                    {/* Tombol untuk Hapus Alamat */}
                    <button
                        type="button"
                        onClick={() => handleRemoveAddress(index)}
                        className="absolute top-2 right-2 z-10 text-red-500 hover:text-red-700 p-1 rounded-full bg-white bg-opacity-75 hover:bg-opacity-100"
                        title="Hapus alamat ini"
                        style={{ transform: 'translate(-8px, 8px)' }} // Sedikit penyesuaian posisi
                      >
                        <Trash2 className="w-4 h-4" />
                    </button>
                    {/* Header Alamat yang bisa di-klik */}
                    <div
                      className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50"
                      onClick={() => toggleAddressForm(index)}
                    >
                      <div className="flex items-start space-x-3">
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center mt-1 ${isOpen ? 'bg-green-500' : 'bg-gray-200'}`}>
                          <MapPin className={`w-4 h-4 ${isOpen ? 'text-white' : 'text-gray-500'}`} />
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-gray-900">Alamat {index + 1}</p>
                          {!isOpen && ( // Tampilkan ringkasan hanya jika tertutup
                            <p className="text-sm text-gray-600 mt-1 truncate max-w-md">
                              {formatAddress(addressItem) || 'Klik untuk mengisi alamat'}
                            </p>
                          )}
                        </div>
                      </div>
                      {isOpen ? <ChevronUp className="w-5 h-5 text-gray-600" /> : <ChevronDown className="w-5 h-5 text-gray-600" />}
                    </div>

                    {/* Form Input Alamat (Collapsible) */}
                    {isOpen && (
                      <div className="p-4 border-t border-gray-200">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Kode Pos</label>
                            <input type="text" value={addressItem.post_code} onChange={(e) => handleAddressChange(index, 'post_code', e.target.value)} className={inputClassName} placeholder="12345" />
                            {typedErrors[`addresses.${index}.post_code`] && <p className={errorClassName}>{typedErrors[`addresses.${index}.post_code`]}</p>}
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Negara</label>
                            <input type="text" value={addressItem.country} onChange={(e) => handleAddressChange(index, 'country', e.target.value)} className={inputClassName} placeholder="Indonesia" />
                            {typedErrors[`addresses.${index}.country`] && <p className={errorClassName}>{typedErrors[`addresses.${index}.country`]}</p>}
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Provinsi</label>
                            <input type="text" value={addressItem.province} onChange={(e) => handleAddressChange(index, 'province', e.target.value)} className={inputClassName} placeholder="Jawa Timur" />
                            {typedErrors[`addresses.${index}.province`] && <p className={errorClassName}>{typedErrors[`addresses.${index}.province`]}</p>}
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Kota</label>
                            <input type="text" value={addressItem.city} onChange={(e) => handleAddressChange(index, 'city', e.target.value)} className={inputClassName} placeholder="Bangkalan" />
                            {typedErrors[`addresses.${index}.city`] && <p className={errorClassName}>{typedErrors[`addresses.${index}.city`]}</p>}
                          </div>
                          <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Jalan</label>
                            <input type="text" value={addressItem.street} onChange={(e) => handleAddressChange(index, 'street', e.target.value)} className={inputClassName} placeholder="Jl telang indah 2 timur" />
                            {typedErrors[`addresses.${index}.street`] && <p className={errorClassName}>{typedErrors[`addresses.${index}.street`]}</p>}
                          </div>
                          <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Detail Tambahan</label>
                            <input type="text" value={addressItem.more} onChange={(e) => handleAddressChange(index, 'more', e.target.value)} className={inputClassName} placeholder="Rumah nomor 69162" />
                            {typedErrors[`addresses.${index}.more`] && <p className={errorClassName}>{typedErrors[`addresses.${index}.more`]}</p>}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>

            {/* Submit Button */}
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={processing}
                className="px-6 py-2 bg-[#51793E] text-white font-medium rounded-md hover:bg-opacity-90 focus:outline-none focus:ring-2 focus:ring-[#51793E] focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {processing ? 'Menyimpan...' : 'Simpan'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}