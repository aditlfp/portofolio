type SectionBlobDividerProps = {
  position: 'top' | 'bottom';
  fromTone: 'surface' | 'surface-low';
  toTone: 'surface' | 'surface-low';
  variant?: 'alpha' | 'beta' | 'gamma';
  animate?: boolean;
  intensity?: 'medium';
};

const toneClassMap: Record<'surface' | 'surface-low', string> = {
  surface: 'landing-tone-surface',
  'surface-low': 'landing-tone-surface-low'
};

const toneCssValueMap: Record<'surface' | 'surface-low', string> = {
  surface: 'var(--color-surface)',
  'surface-low': 'var(--color-surface-container-low)'
};

const blobPathMap: Record<'alpha' | 'beta' | 'gamma', string> = {
  alpha: 'M0 52C166 20 315 14 454 33C594 52 734 80 876 61C1021 42 1135 8 1264 13C1343 17 1397 37 1440 56V160H0Z',
  beta: 'M0 70C111 84 252 86 388 75C557 61 696 20 834 14C989 8 1100 30 1236 26C1331 23 1391 37 1440 52V160H0Z',
  gamma: 'M0 44C136 26 257 37 388 57C525 77 668 74 806 49C966 21 1087 2 1227 13C1328 21 1398 43 1440 66V160H0Z'
};

export default function SectionBlobDivider({
  position,
  fromTone,
  toTone,
  variant = 'alpha',
  animate = true,
  intensity = 'medium'
}: SectionBlobDividerProps) {
  return (
    <div
      aria-hidden="true"
      className={[
        'landing-blob-divider-shell',
        `landing-blob-divider--${intensity}`,
        `landing-divider-from-${toneClassMap[fromTone]}`
      ].join(' ')}
      style={{ backgroundColor: toneCssValueMap[fromTone] }}
    >
      <svg
        viewBox="0 0 1440 160"
        preserveAspectRatio="none"
        aria-hidden="true"
        className={[
          'landing-blob-divider',
          `landing-blob-divider--${position}`,
          `landing-blob-divider--${variant}`,
          animate ? 'landing-blob-divider--animated' : '',
          `landing-divider-to-${toneClassMap[toTone]}`
        ].join(' ')}
        style={{ color: toneCssValueMap[toTone] }}
      >
        <path d={blobPathMap[variant]} fill="currentColor" />
      </svg>
    </div>
  );
}
