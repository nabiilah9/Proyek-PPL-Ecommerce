import { LucideIcon } from 'lucide-react';
import type { Config } from 'ziggy-js';

export interface Auth {
  user: User;
}

export interface BreadcrumbItem {
  href: string;
  title: string;
}

export interface NavItem {
  title: string;
  href?: string;
  items?: NavItem[];
  isActive?: boolean;
  icon?: LucideIcon | null;
}

export interface SharedData {
  auth: Auth;
  name: string;
  [key: string]: unknown;
  ziggy: Config & { location: string };
  quote: { message: string; author: string };
}

export interface User {
  id: number;
  email: string;
  username: string;
  avatar?: string;
  role: string;
  status: string;
  deleted_at: Date | null;
  email_verified_at: string | null;
  created_at: string;
  updated_at: string;
  [key: string]: unknown; // This allows for additional properties...
}

export interface Contact {
  id: number;
  user_id: number;
  name: string;
  phone: string;
  profile?: string;           // nullable di migration
  gender: 'MAN' | 'WOMAN';
  birthday: string;           // tanggal dalam format YYYY-MM-DD
  favourite?: string[];       // json di-DB, map ke array
  created_at: string;         // ISO timestamp
  updated_at: string;         // ISO timestamp
  deleted_at?: string | null; // softDeletes
  [key: string]: unknown;     // untuk properti tambahan
}

export interface Address {
  id: number;
  contact_id: number;
  post_code: string;
  country: string;
  province: string;
  city: string;
  street: string;
  more?: string;          // nullable di migration
  created_at: string;
  updated_at: string;
  [key: string]: unknown;
}