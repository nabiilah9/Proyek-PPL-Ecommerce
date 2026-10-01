import { Head } from '@inertiajs/react';
import { type BreadcrumbItem } from '@/types';

import AppLayout from '@/components/layouts/app-layout';
import { HeadingSmall } from '@/components/fragments/heading';
import SettingsLayout from '@/components/layouts/settings/layout';
import AppearanceToggleTab from '@/components/fragments/appearance-tabs';

const breadcrumbs: BreadcrumbItem[] = [{
  title: 'Appearance settings',
  href: '/settings/appearance',
}];

export default function Appearance() {
  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Appearance settings" />

      <SettingsLayout>
        <div className="space-y-6">
          <HeadingSmall title="Appearance settings" description="Update your account's appearance settings" />
          <AppearanceToggleTab />
        </div>
      </SettingsLayout>
    </AppLayout>
  );
};