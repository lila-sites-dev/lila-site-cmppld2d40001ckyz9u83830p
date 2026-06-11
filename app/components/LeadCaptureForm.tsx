'use client';

import { useState } from 'react';

// Every page ships with lead capture. Submissions POST to the Lila inbound endpoint,
// which stamps a Customer with leadSource 'lila:website_form' and hands off to Cora.
// The endpoint URL is injected at build time (NEXT_PUBLIC_LILA_INBOUND_URL).
const INBOUND = process.env.NEXT_PUBLIC_LILA_INBOUND_URL ?? '';

export function LeadCaptureForm({ source }: { source: string }) {
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus('sending');
    const form = new FormData(e.currentTarget);
    try {
      const res = await fetch(INBOUND, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          name: form.get('name'),
          email: form.get('email'),
          phone: form.get('phone'),
          message: form.get('message'),
          source: `lila:${source}`,
        }),
      });
      setStatus(res.ok ? 'sent' : 'error');
    } catch {
      setStatus('error');
    }
  }

  if (status === 'sent') {
    return <p data-lila-capture="done">Thanks — we&apos;ll be in touch shortly.</p>;
  }

  return (
    <form onSubmit={onSubmit} data-lila-capture="form" className="lead-form">
      <h3>Book or ask a question</h3>
      <input name="name" placeholder="Your name" required />
      <input name="email" type="email" placeholder="Email" required />
      <input name="phone" placeholder="Phone (optional)" />
      <textarea name="message" placeholder="What are you looking for?" rows={3} />
      <button type="submit" disabled={status === 'sending'}>
        {status === 'sending' ? 'Sending…' : 'Request a booking'}
      </button>
      {status === 'error' && <p role="alert">Something went wrong — please call us instead.</p>}
    </form>
  );
}
