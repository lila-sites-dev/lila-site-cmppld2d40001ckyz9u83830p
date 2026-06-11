import { getBrandFeed } from '@/lib/brand';

// Serves /llms.txt from the AI Feed (generated from verified Brand Memory) so AI
// answer engines can cite the business accurately.
export async function GET() {
  const feed = await getBrandFeed();
  return new Response(feed.llmsTxt || '# (no brand feed yet)\n', {
    headers: { 'content-type': 'text/plain; charset=utf-8' },
  });
}
