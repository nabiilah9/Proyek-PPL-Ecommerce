import type React from 'react';
import { useEffect } from 'react';
import { useForm, usePage } from '@inertiajs/react';
import { toast } from 'sonner';
import { ChevronLeft, LoaderCircle, PackagePlus } from 'lucide-react';
import type { BreadcrumbItem, SharedData } from '@/types';

import AppLayout from '@/components/layouts/app-layout';
import { Button } from '@/components/elements/button';
import Input from '@/components/elements/input';
import InputError from '@/components/elements/input-error';
import Label from '@/components/elements/label';
import Separator from '@/components/elements/separator';
import {
  Select, SelectContent, SelectGroup, SelectItem,
  SelectLabel, SelectTrigger, SelectValue,
} from '@/components/ui/select';

interface Category {
  id: number;
  name: string;
}

const breadcrumbs: BreadcrumbItem[] = [
  { title: 'Dashboard', href: '/admin' },
  { title: 'Produk', href: route('items.index') },
  { title: 'Tambah', href: route('items.create') },
];

export default function ProductCreate() {
  const { categories, success, error } = usePage<SharedData & { categories: Category[] }>().props;

  const { data, setData, post, processing, errors, reset } = useForm({
    category_id: '',
    name: '',
    unit: 'pcs',
    price: '',
    stock: '',
    image_url: '',
    is_available: true,
    description: '',
    discount: '0',
    expired_at: '',
  });

  useEffect(() => {
    if (success) toast.success(success as string);
    if (error) toast.error(error as string);
  }, [success, error]);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    post(route('items.store'), {
      onSuccess: () => {
        toast.success('Produk berhasil ditambahkan');
        reset();
      },
      onError: () => toast.error('Gagal menambahkan produk'),
    });
  };

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <div className="container py-6 px-2">
        <div className="bg-background border rounded-md shadow-sm">
          {/* Header */}
          <div className="px-6 py-4 border-b flex items-center gap-2">
            <PackagePlus className="h-5 w-5 text-muted-foreground" />
            <div>
              <h1 className="text-xl font-semibold">Tambah Produk Baru</h1>
              <p className="text-sm text-muted-foreground mt-1">Isi data produk kue yang akan ditampilkan ke katalog</p>
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="p-6 grid gap-6 md:grid-cols-2">

              {/* Nama */}
              <div className="space-y-2">
                <Label htmlFor="name">Nama Produk <span className="text-destructive">*</span></Label>
                <Input
                  id="name"
                  placeholder="Contoh: Dadar Gulung"
                  value={data.name}
                  onChange={(e) => setData('name', e.target.value)}
                  aria-invalid={errors.name ? 'true' : 'false'}
                  required
                />
                {errors.name && <InputError id="name-error" message={errors.name} />}
              </div>

              {/* Kategori */}
              <div className="space-y-2">
                <Label htmlFor="category_id">Kategori</Label>
                <Select
                  value={data.category_id}
                  onValueChange={(v) => setData('category_id', v)}
                >
                  <SelectTrigger id="category_id">
                    <SelectValue placeholder="Pilih kategori" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectLabel>Kategori</SelectLabel>
                      {categories.map((cat) => (
                        <SelectItem key={cat.id} value={String(cat.id)}>
                          {cat.name}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
                {errors.category_id && <InputError id="category-error" message={errors.category_id} />}
              </div>

              {/* Harga */}
              <div className="space-y-2">
                <Label htmlFor="price">Harga (Rp) <span className="text-destructive">*</span></Label>
                <Input
                  id="price"
                  type="number"
                  placeholder="Contoh: 3000"
                  min={0}
                  value={data.price}
                  onChange={(e) => setData('price', e.target.value)}
                  aria-invalid={errors.price ? 'true' : 'false'}
                  required
                />
                {errors.price && <InputError id="price-error" message={errors.price} />}
              </div>

              {/* Stok */}
              <div className="space-y-2">
                <Label htmlFor="stock">Stok <span className="text-destructive">*</span></Label>
                <Input
                  id="stock"
                  type="number"
                  placeholder="Contoh: 50"
                  min={0}
                  value={data.stock}
                  onChange={(e) => setData('stock', e.target.value)}
                  aria-invalid={errors.stock ? 'true' : 'false'}
                  required
                />
                {errors.stock && <InputError id="stock-error" message={errors.stock} />}
              </div>

              {/* Satuan */}
              <div className="space-y-2">
                <Label htmlFor="unit">Satuan <span className="text-destructive">*</span></Label>
                <Select value={data.unit} onValueChange={(v) => setData('unit', v)}>
                  <SelectTrigger id="unit">
                    <SelectValue placeholder="Pilih satuan" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectLabel>Satuan</SelectLabel>
                      <SelectItem value="pcs">pcs</SelectItem>
                      <SelectItem value="pack">pack</SelectItem>
                      <SelectItem value="kg">kg</SelectItem>
                      <SelectItem value="loyang">loyang</SelectItem>
                      <SelectItem value="porsi">porsi</SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>
                {errors.unit && <InputError id="unit-error" message={errors.unit} />}
              </div>

              {/* Diskon */}
              <div className="space-y-2">
                <Label htmlFor="discount">Diskon (%)</Label>
                <Input
                  id="discount"
                  type="number"
                  placeholder="0"
                  min={0}
                  max={100}
                  value={data.discount}
                  onChange={(e) => setData('discount', e.target.value)}
                />
                <p className="text-xs text-muted-foreground">Kosongkan atau isi 0 jika tidak ada diskon</p>
                {errors.discount && <InputError id="discount-error" message={errors.discount} />}
              </div>

              {/* URL Gambar */}
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="image_url">URL Gambar</Label>
                <Input
                  id="image_url"
                  placeholder="Contoh: /img/dadar-gulung.png atau https://..."
                  value={data.image_url}
                  onChange={(e) => setData('image_url', e.target.value)}
                />
                {errors.image_url && <InputError id="image-error" message={errors.image_url} />}
              </div>

              {/* Deskripsi */}
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="description">Deskripsi</Label>
                <textarea
                  id="description"
                  rows={3}
                  placeholder="Deskripsi singkat produk..."
                  value={data.description}
                  onChange={(e) => setData('description', e.target.value)}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                />
                {errors.description && <InputError id="description-error" message={errors.description} />}
              </div>

              {/* Tanggal Kedaluwarsa */}
              <div className="space-y-2">
                <Label htmlFor="expired_at">Tanggal Kedaluwarsa</Label>
                <Input
                  id="expired_at"
                  type="date"
                  value={data.expired_at}
                  onChange={(e) => setData('expired_at', e.target.value)}
                />
                {errors.expired_at && <InputError id="expired-error" message={errors.expired_at} />}
              </div>

              {/* Ketersediaan */}
              <div className="space-y-2">
                <Label htmlFor="is_available">Ketersediaan</Label>
                <Select
                  value={data.is_available ? 'true' : 'false'}
                  onValueChange={(v) => setData('is_available', v === 'true')}
                >
                  <SelectTrigger id="is_available">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectItem value="true">Tersedia</SelectItem>
                      <SelectItem value="false">Nonaktif</SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Separator />

            <div className="flex items-center justify-between p-6">
              <Button
                type="button"
                variant="outline"
                onClick={() => window.history.back()}
                className="flex items-center gap-1"
              >
                <ChevronLeft className="h-4 w-4" />
                Kembali
              </Button>
              <Button type="submit" disabled={processing} className="min-w-[140px]">
                {processing ? (
                  <>
                    <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
                    Menyimpan...
                  </>
                ) : (
                  'Tambah Produk'
                )}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </AppLayout>
  );
}
