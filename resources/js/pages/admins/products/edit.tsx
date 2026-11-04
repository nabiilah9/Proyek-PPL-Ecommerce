import type React from 'react';
import { useEffect } from 'react';
import { useForm, usePage, router } from '@inertiajs/react';
import { toast } from 'sonner';
import { ChevronLeft, LoaderCircle, Save } from 'lucide-react';
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
import type { Item } from './columns';

interface Category {
  id: number;
  name: string;
}

export default function ProductEdit() {
  const { item, categories, success, error } = usePage<
    SharedData & { item: Item; categories: Category[] }
  >().props;

  const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/admin' },
    { title: 'Produk', href: route('items.index') },
    { title: 'Edit', href: route('items.edit', item.id) },
  ];

  const { data, setData, put, processing, errors } = useForm({
    category_id: item.category ? String(item.category.id) : '',
    name: item.name,
    unit: item.unit,
    price: String(item.price),
    stock: String(item.stock),
    image_url: item.image_url ?? '',
    is_available: item.is_available,
    description: item.description ?? '',
    discount: String(item.discount),
    expired_at: item.expired_at ?? '',
  });

  useEffect(() => {
    if (success) toast.success(success as string);
    if (error) toast.error(error as string);
  }, [success, error]);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    put(route('items.update', item.id), {
      onSuccess: () => toast.success('Produk berhasil diperbarui'),
      onError: () => toast.error('Gagal memperbarui produk'),
    });
  };

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <div className="container py-6 px-2">
        <div className="bg-background border rounded-md shadow-sm">
          {/* Header */}
          <div className="px-6 py-4 border-b">
            <h1 className="text-xl font-semibold">Edit Produk</h1>
            <p className="text-sm text-muted-foreground mt-1">Perbarui informasi produk kue</p>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="p-6 grid gap-6 md:grid-cols-2">

              {/* Nama */}
              <div className="space-y-2">
                <Label htmlFor="name">Nama Produk <span className="text-destructive">*</span></Label>
                <Input
                  id="name"
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
                  min={0}
                  value={data.price}
                  onChange={(e) => setData('price', e.target.value)}
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
                  min={0}
                  value={data.stock}
                  onChange={(e) => setData('stock', e.target.value)}
                  required
                />
                {errors.stock && <InputError id="stock-error" message={errors.stock} />}
              </div>

              {/* Satuan */}
              <div className="space-y-2">
                <Label htmlFor="unit">Satuan <span className="text-destructive">*</span></Label>
                <Select value={data.unit} onValueChange={(v) => setData('unit', v)}>
                  <SelectTrigger id="unit">
                    <SelectValue />
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
                  min={0}
                  max={100}
                  value={data.discount}
                  onChange={(e) => setData('discount', e.target.value)}
                />
                {errors.discount && <InputError id="discount-error" message={errors.discount} />}
              </div>

              {/* URL Gambar */}
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="image_url">URL Gambar</Label>
                <Input
                  id="image_url"
                  value={data.image_url}
                  onChange={(e) => setData('image_url', e.target.value)}
                  placeholder="/img/nama-gambar.png"
                />
                {data.image_url && (
                  <img
                    src={data.image_url}
                    alt="Preview"
                    className="mt-2 h-24 w-24 rounded-md object-cover border"
                    onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                  />
                )}
                {errors.image_url && <InputError id="image-error" message={errors.image_url} />}
              </div>

              {/* Deskripsi */}
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="description">Deskripsi</Label>
                <textarea
                  id="description"
                  rows={3}
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
                onClick={() => router.visit(route('items.index'))}
                className="flex items-center gap-1"
              >
                <ChevronLeft className="h-4 w-4" />
                Kembali ke Daftar
              </Button>
              <Button type="submit" disabled={processing} className="min-w-[140px]">
                {processing ? (
                  <>
                    <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
                    Menyimpan...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Simpan Perubahan
                  </>
                )}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </AppLayout>
  );
}
