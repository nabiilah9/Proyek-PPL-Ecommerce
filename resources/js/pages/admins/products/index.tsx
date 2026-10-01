import { Head } from '@inertiajs/react';
import { type BreadcrumbItem } from '@/types';

import AppLayout from '@/components/layouts/app-layout';

const breadcrumbs: BreadcrumbItem[] = [{
  title: 'Dashboard',
  href: '/dashboard',
}];

export default function Categories() {
  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Categories" />
      <h1>Hello World</h1>
    </AppLayout>
  );
};