import type { Metadata } from 'next';
import { SpecialPage } from '@/app/components/SpecialPage';
import { getSpecialPage } from '@/lib/content';

export async function generateMetadata(): Promise<Metadata> {
  const p = await getSpecialPage('memberships');
  return { title: p?.title || 'Memberships', description: p?.description || '' };
}

export default function Page() {
  return <SpecialPage slug="memberships" />;
}
