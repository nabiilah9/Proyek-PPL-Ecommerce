import type React from 'react';

import type { BreadcrumbItem, SharedData, User } from '@/types';
import { router, useForm, usePage } from '@inertiajs/react';
import { ChevronLeft, Eye, EyeOff, LoaderCircle, Save } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

import { Button } from '@/components/elements/button';
import Input from '@/components/elements/input';
import InputError from '@/components/elements/input-error';
import Label from '@/components/elements/label';
import Separator from '@/components/elements/separator';
import AppLayout from '@/components/layouts/app-layout';
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function UsersEdit() {
  const { user, success, error } = usePage<SharedData & { user: { data: User } }>().props;

  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data, setData, put, processing, errors, reset } = useForm({
    email: user.data.email,
    username: user.data.username,
    password: '',
    role: user.data.role,
    status: user.data.status,
    isDelete: user.data.deleted_at,
  });
  console.log(`User ID: ${user.data.id}`);

  const breadcrumbs: BreadcrumbItem[] = [
    {
      title: 'Users',
      href: route('users.index'),
    },
    {
      title: 'Edit',
      href: route('users.edit', user.data.id),
    },
  ];

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    put(route('users.update', user.data.id), {
      onSuccess: () => {
        toast.success('User updated successfully');
        reset('password');
      },
      onError: (errors) => {
        console.error(errors);
        toast.error('Failed to update user');
      },
      onFinish: () => {
        setIsSubmitting(false);
      },
    });
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  useEffect(() => {
    if (success) toast.success(success as string);
    if (error) toast.error(error as string);
  }, [success, error]);

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <div className="container py-6 px-2">
        <div className="bg-background rounded-md border shadow-sm">
          <div className="border-b px-6 py-4">
            <h1 className="text-xl font-semibold">Edit User</h1>
            <p className="text-muted-foreground mt-1 text-sm">Update user information and permissions</p>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="p-6">
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="username" className="font-medium">
                    Username
                  </Label>
                  <Input
                    id="username"
                    name="username"
                    placeholder="Enter username"
                    value={data.username}
                    onChange={(e) => setData('username', e.target.value)}
                    aria-invalid={errors.username ? 'true' : 'false'}
                    aria-describedby={errors.username ? 'username-error' : undefined}
                    className="max-w-md"
                  />
                  {errors.username && <InputError id="username-error" message={errors.username} />}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email" className="font-medium">
                    Email
                  </Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="Enter email address"
                    value={data.email}
                    onChange={(e) => setData('email', e.target.value)}
                    aria-invalid={errors.email ? 'true' : 'false'}
                    aria-describedby={errors.email ? 'email-error' : undefined}
                    className="max-w-md"
                  />
                  {errors.email && <InputError id="email-error" message={errors.email} />}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password" className="font-medium">
                    Password
                  </Label>
                  <div className="relative max-w-md">
                    <Input
                      id="password"
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Leave blank to keep current password"
                      value={data.password}
                      onChange={(e) => setData('password', e.target.value)}
                      aria-invalid={errors.password ? 'true' : 'false'}
                      aria-describedby={errors.password ? 'password-error' : undefined}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute top-1/2 right-2 -translate-y-1/2"
                      onClick={togglePasswordVisibility}
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                  {errors.password && <InputError id="password-error" message={errors.password} />}
                  <p className="text-muted-foreground text-xs">Leave blank to keep the current password</p>
                </div>

                <div className="grid grid-cols-3">
                  <div className="space-y-2">
                    <Label htmlFor="role" className="font-medium">
                      Role
                    </Label>
                    <Select value={data.role} onValueChange={(value) => setData('role', value)} name="role">
                      <SelectTrigger id="role" aria-invalid={errors.role ? 'true' : 'false'} className="max-w-md">
                        <SelectValue placeholder="Select a role" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          <SelectLabel>Roles</SelectLabel>
                          <SelectItem value="ADMIN">Admin</SelectItem>
                          <SelectItem value="CLIENT">Client</SelectItem>
                          <SelectItem value="COURIER">Courier</SelectItem>
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                    {errors.role && <InputError id="role-error" message={errors.role} />}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="status" className="font-medium">
                      Status
                    </Label>
                    <Select value={data.status} onValueChange={(value) => setData('status', value)} name="status">
                      <SelectTrigger id="status" aria-invalid={errors.status ? 'true' : 'false'} className="max-w-md">
                        <SelectValue placeholder="Select a status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          <SelectLabel>Status</SelectLabel>
                          <SelectItem value="active">Active</SelectItem>
                          <SelectItem value="inactive">Inactive</SelectItem>
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                    {errors.status && <InputError id="status-error" message={errors.status} />}
                  </div>

                </div>
              </div>
            </div>

            <Separator />

            <div className="flex justify-between">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.visit(route('users.index'))}
                className="flex items-center gap-1"
              >
                <ChevronLeft className="h-4 w-4" />
                Back to Users
              </Button>
              <Button type="submit" disabled={processing || isSubmitting} className="min-w-[120px]">
                {processing || isSubmitting ? (
                  <>
                    <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Save Changes
                  </>
                )}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </AppLayout>
  );
};