import Link from 'next/link';
import { getBrandFeed, businessName, businessPhone } from '@/lib/brand';
import { listServiceSlugs, getServicePage } from '@/lib/content';
import { LeadCaptureForm } from '@/app/components/LeadCaptureForm';

export default async function HomePage() {
  const feed = await getBrandFeed();
  const name = businessName(feed);
  const phone = businessPhone(feed);
  const slugs = await listServiceSlugs();
  const services = (await Promise.all(slugs.map(getServicePage))).filter((s): s is NonNullable<typeof s> => !!s);

  return (
    <>
      <h1>{name}</h1>
      {phone && (
        <p>
          Call <a href={`tel:${phone.replace(/\s/g, '')}`}>{phone}</a> to book.
        </p>
      )}
      {services.length > 0 && (
        <>
          <h2>Services</h2>
          <ul className="service-list">
            {services.map((s) => (
              <li key={s.slug}>
                <Link href={`/services/${s.slug}`}>{s.title}</Link>
                {s.description && <div style={{ color: 'var(--soft)' }}>{s.description}</div>}
              </li>
            ))}
          </ul>
        </>
      )}
      <LeadCaptureForm source="website_form" />
    </>
  );
}
