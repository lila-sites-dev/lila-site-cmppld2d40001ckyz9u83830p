import type { Metadata } from 'next';
import { SpecialPage } from '@/app/components/SpecialPage';
import { getSpecialPage } from '@/lib/content';

export async function generateMetadata(): Promise<Metadata> {
  const p = await getSpecialPage('about');
  return { title: p?.title || 'About', description: p?.description || '' };
}

export default function Page() {
  return <SpecialPage slug="about" />;
}
