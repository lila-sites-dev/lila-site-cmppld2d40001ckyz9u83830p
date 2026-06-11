import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { listServiceSlugs, getServicePage } from '@/lib/content';
import { LeadCaptureForm } from '@/app/components/LeadCaptureForm';

export async function generateStaticParams() {
  return (await listServiceSlugs()).map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const page = await getServicePage(slug);
  if (!page) return {};
  return { title: page.title, description: page.description || undefined };
}

export default async function ServicePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const page = await getServicePage(slug);
  if (!page) notFound();

  return (
    <article>
      <div dangerouslySetInnerHTML={{ __html: page.html }} />
      <LeadCaptureForm source="website_form" />
    </article>
  );
}
