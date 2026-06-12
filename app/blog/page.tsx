import Link from 'next/link';
import { Fragment } from 'react';
import type { Metadata } from 'next';
import { listBlogSlugs, getBlogPost } from '@/lib/content';
import { getBrandFeed, businessName } from '@/lib/brand';
import { renderSection } from '@/components/sections/registry';

export async function generateMetadata(): Promise<Metadata> {
  const feed = await getBrandFeed();
  const name = businessName(feed);
  return { title: `Blog — ${name}`, description: `Tips, guides, and stories from ${name}.` };
}

/**
 * Blog index. Auto-composed from `content/blog/*.md` — newest first.
 * Each card is a hub-down link into a post, which in turn funnels readers
 * to its `targetService`. The chain is: blog index → post → service →
 * booking. No ticket needed; updates on every deploy.
 */
export default async function BlogIndexPage() {
  const [feed, slugs] = await Promise.all([
    getBrandFeed(),
    listBlogSlugs(),
  ]);
  const name = businessName(feed);
  const posts = (await Promise.all(slugs.map(getBlogPost)))
    .filter((p): p is NonNullable<typeof p> => !!p)
    .sort((a, b) => {
      // Newer first; missing date sorts to the bottom.
      if (!a.publishedAt && !b.publishedAt) return 0;
      if (!a.publishedAt) return 1;
      if (!b.publishedAt) return -1;
      return b.publishedAt.localeCompare(a.publishedAt);
    });

  return (
    <>
      <Fragment>{renderSection({
        type: 'hero',
        variant: 'centered-stacked',
        eyebrow: 'Blog',
        title: `From the ${name} team`,
        subtitle: 'Tips, walkthroughs, and stories from our chair.',
      })}</Fragment>

      {posts.length === 0 ? (
        <section className="bg-surface">
          <div className="mx-auto max-w-3xl px-6 py-16 text-center">
            <p className="text-muted">
              No posts yet. Lila is drafting them — check back soon.
            </p>
          </div>
        </section>
      ) : (
        <section className="bg-surface">
          <div className="mx-auto max-w-4xl px-6 py-16">
            <ul className="m-0 p-0 list-none space-y-6">
              {posts.map((p) => (
                <li key={p.slug} className="border-b border-rule-soft pb-6 last:border-b-0">
                  <Link
                    href={`/blog/${p.slug}`}
                    className="block group hover:opacity-80 transition-opacity"
                  >
                    <h2 className="m-0 font-display text-2xl text-ink group-hover:text-primary transition-colors">
                      {p.title}
                    </h2>
                    {p.description && (
                      <p className="mt-2 text-muted">{p.description}</p>
                    )}
                    {p.publishedAt && (
                      <span className="mt-2 inline-block text-xs uppercase tracking-wide text-muted">
                        {new Date(p.publishedAt).toLocaleDateString(undefined, {
                          year: 'numeric', month: 'long', day: 'numeric',
                        })}
                      </span>
                    )}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}
    </>
  );
}
