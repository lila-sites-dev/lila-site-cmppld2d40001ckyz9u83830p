import { Fragment } from 'react';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import type { Metadata } from 'next';
import { listBlogSlugs, getBlogPost, getServicePage } from '@/lib/content';
import { renderSection } from '@/components/sections/registry';
import { getBrandFeed, businessName, businessPhone } from '@/lib/brand';
import { LeadCaptureForm } from '@/app/components/LeadCaptureForm';

export async function generateStaticParams() {
  return (await listBlogSlugs()).map((slug) => ({ slug }));
}

export async function generateMetadata(
  { params }: { params: Promise<{ slug: string }> },
): Promise<Metadata> {
  const { slug } = await params;
  const post = await getBlogPost(slug);
  if (!post) return {};
  return { title: post.title, description: post.description || undefined };
}

/**
 * Blog post route. Reads `content/blog/<slug>.md` and renders it. If the
 * post's frontmatter declares typed `sections:`, uses them verbatim;
 * otherwise composes a default (hero + prose + target-service CTA + lead form).
 *
 * The `targetService` field is the post's conversion funnel — when present
 * we add an inline CTA pointing to that service. This is the Avenue map's
 * "Blog → Service" link type, automatic.
 */
export default async function BlogPostRoute({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const [post, feed] = await Promise.all([getBlogPost(slug), getBrandFeed()]);
  if (!post) notFound();

  const target = post.targetService ? await getServicePage(post.targetService) : null;
  const phone = businessPhone(feed);
  const name  = businessName(feed);
  const ctaText = target ? `Book ${target.title.toLowerCase()}` : phone ? `Call ${phone}` : `Get in touch with ${name}`;
  const ctaHref = target ? `/services/${target.slug}` : phone ? `tel:${phone.replace(/\s/g, '')}` : '#book';

  return (
    <article>
      {post.sections.length > 0 ? (
        post.sections.map((spec, i) => (
          <Fragment key={i}>{renderSection(spec)}</Fragment>
        ))
      ) : (
        <>
          <Fragment>{renderSection({
            type: 'hero',
            variant: 'centered-stacked',
            eyebrow: 'Blog',
            title: post.title,
            subtitle: post.description || undefined,
          })}</Fragment>
          <Fragment>{renderSection({ type: 'prose', html: post.html })}</Fragment>
        </>
      )}

      {target && (
        <Fragment>{renderSection({
          type: 'cta',
          variant: 'centered-band',
          title: `Ready for ${target.title.toLowerCase()}?`,
          body: `Browse ${target.title.toLowerCase()} options or book a slot now.`,
          ctaText,
          ctaHref,
        })}</Fragment>
      )}

      <section className="bg-surface">
        <div className="mx-auto max-w-3xl px-6 py-8">
          <Link href="/blog" className="text-sm text-primary">← All posts</Link>
        </div>
      </section>

      <section id="book" className="bg-surface-alt">
        <div className="mx-auto max-w-3xl px-6 py-16">
          <LeadCaptureForm source="blog_form" />
        </div>
      </section>
    </article>
  );
}
