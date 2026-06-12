import type { Metadata } from 'next';
import { SpecialPage } from '@/app/components/SpecialPage';
import { getSpecialPage } from '@/lib/content';

export async function generateMetadata(): Promise<Metadata> {
  const p = await getSpecialPage('privacy');
  return { title: p?.title || 'Privacy policy', description: p?.description || '' };
}

// Legal pages don't get the lead-capture form appended — feels pushy and
// the visitor is here for reading rights, not converting.
export default function Page() {
  return <SpecialPage slug="privacy" appendForm={false} />;
}
