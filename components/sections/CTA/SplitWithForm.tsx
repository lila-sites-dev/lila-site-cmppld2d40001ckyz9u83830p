import type { CtaSpec } from '../types';

type Props = Omit<CtaSpec, 'type' | 'variant'>;

const DEFAULT_FIELDS: NonNullable<CtaSpec['formFields']> = [
  { name: 'name',  label: 'Your name',  required: true  },
  { name: 'phone', label: 'Phone',      required: true  },
  { name: 'email', label: 'Email',      required: false },
  { name: 'message', label: 'How can we help?', required: false },
];

/** Split layout — pitch copy on the left, lead-capture form on the right.
 *  Posts to /api/lila/inbound; siteId is filled in at build time by the
 *  template's LeadCaptureForm wrapper (in `app/components/LeadCaptureForm.tsx`).
 *  Falls back to a sensible 4-field default when `formFields` is omitted. */
export function CtaSplitWithForm({ title, body, ctaText, ctaHref: _ignored, formFields }: Props) {
  const fields = formFields && formFields.length > 0 ? formFields : DEFAULT_FIELDS;
  return (
    <section className="bg-primary text-on-primary">
      <div className="mx-auto max-w-6xl px-6 py-16 sm:py-20 grid md:grid-cols-2 gap-10 items-center">
        <div>
          <h2 className="font-display text-3xl sm:text-4xl font-semibold tracking-tight">
            {title}
          </h2>
          {body && (
            <p className="mt-4 font-sans text-base sm:text-lg opacity-90 leading-relaxed">
              {body}
            </p>
          )}
        </div>
        <form
          action="/api/lila/inbound"
          method="POST"
          className="bg-surface text-ink rounded-card p-6 sm:p-7 shadow-sm"
        >
          <div className="grid gap-3">
            {fields.map((f) => (
              <label key={f.name} className="block font-sans">
                <span className="text-xs uppercase tracking-wide text-muted">
                  {f.label ?? f.name}{f.required ? ' *' : ''}
                </span>
                {f.name === 'message' ? (
                  <textarea
                    name={f.name}
                    required={f.required}
                    rows={3}
                    className="mt-1 w-full rounded-card border border-rule px-3 py-2 text-base focus:outline-none focus:ring-2 focus:ring-primary/30"
                  />
                ) : (
                  <input
                    name={f.name}
                    type={f.name === 'email' ? 'email' : f.name === 'phone' ? 'tel' : 'text'}
                    required={f.required}
                    className="mt-1 w-full rounded-card border border-rule px-3 py-2 text-base focus:outline-none focus:ring-2 focus:ring-primary/30"
                  />
                )}
              </label>
            ))}
            <button
              type="submit"
              className="mt-1 inline-flex items-center justify-center bg-primary text-on-primary font-sans font-semibold text-base px-6 py-3 rounded-card hover:opacity-90 transition-opacity"
            >
              {ctaText ?? 'Send'}
            </button>
          </div>
        </form>
      </div>
    </section>
  );
}
