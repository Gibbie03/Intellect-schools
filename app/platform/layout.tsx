import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'SchoolOS Platform Admin',
  description: 'Manage schools on the SchoolOS platform.',
};

export default function PlatformLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return children;
}
