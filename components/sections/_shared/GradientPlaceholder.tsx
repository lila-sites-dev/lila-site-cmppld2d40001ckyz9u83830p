// CSS-only image placeholder. Renders a diagonal gradient from `--brand-primary`
// into `--brand-accent` with a soft radial highlight on top — looks intentional
// rather than "missing image". Used everywhere a cue resolved to nothing
// (no crawled asset, no Unsplash hit, no committed source).
//
// Variants control aspect ratio so the same component works in a hero
// (4/3 wide) and a thumbnail slot (square, smaller). Pure CSS so SSR / RSC safe.

type AspectVariant = 'wide' | 'square' | 'portrait';

const ASPECT_CLASS: Record<AspectVariant, string> = {
  wide:     'aspect-[4/3]',
  square:   'aspect-square',
  portrait: 'aspect-[3/4]',
};

interface Props {
  aspect?: AspectVariant;
  className?: string;
  /** Optional decorative label (e.g. category name). Kept aria-hidden so
   *  screen readers don't announce a stylistic flourish. */
  label?: string;
}

export function GradientPlaceholder({ aspect = 'wide', className = '', label }: Props) {
  return (
    <div
      className={`relative overflow-hidden rounded-card ${ASPECT_CLASS[aspect]} ${className}`}
      style={{ background: 'linear-gradient(135deg, var(--brand-primary), var(--brand-accent))' }}
      aria-hidden="true"
    >
      <div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(60% 80% at 25% 20%, rgba(255,255,255,0.18) 0%, rgba(255,255,255,0) 60%)',
        }}
      />
      {label && (
        <span
          className="absolute bottom-3 left-4 text-on-primary font-sans text-xs font-medium uppercase tracking-[0.18em] opacity-80"
        >
          {label}
        </span>
      )}
    </div>
  );
}
