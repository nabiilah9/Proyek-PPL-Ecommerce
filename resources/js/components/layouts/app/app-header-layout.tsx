import { type BreadcrumbItem } from '@/types';
import type { PropsWithChildren } from 'react';

import AppContent from './app-content';
import { AppHeader } from './app-header';
import { AppShell } from './app-shell';

export default function AppHeaderLayout({
  children,
  breadcrumbs
}: PropsWithChildren<{ breadcrumbs?: BreadcrumbItem[] }>) {
  return (
    <AppShell>
      <AppHeader breadcrumbs={breadcrumbs} />
      <AppContent>{children}</AppContent>
    </AppShell>
  );
};