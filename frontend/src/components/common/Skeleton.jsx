/**
 * components/common/Skeleton.jsx
 * ─────────────────────────────────────────────────────────────────────────────
 * Animated skeleton placeholders for loading states.
 *
 * Exports:
 *  Skeleton          - base rectangular shimmer block
 *  SkeletonCard      - full item/product card placeholder
 *  SkeletonGrid      - grid of N SkeletonCards (default 6)
 *  SkeletonDetailPage- two-column detail page skeleton
 * ─────────────────────────────────────────────────────────────────────────────
 */

// ── Base shimmer block ─────────────────────────────────────────────────────────
export default function Skeleton({ width = '100%', height = 16, radius = 6, style = {} }) {
  return (
    <div style={{
      width, height,
      borderRadius: radius,
      background: 'linear-gradient(90deg, var(--bg-elevated) 25%, var(--bg-hover) 50%, var(--bg-elevated) 75%)',
      backgroundSize: '200% 100%',
      animation: 'skeleton-shimmer 1.5s infinite',
      flexShrink: 0,
      ...style,
    }} />
  );
}

// ── Single card skeleton ───────────────────────────────────────────────────────
export function SkeletonCard() {
  return (
    <div style={{
      background: 'var(--bg-surface)',
      border: '1px solid var(--border-subtle)',
      borderRadius: 'var(--radius-lg)',
      overflow: 'hidden',
    }}>
      {/* Image area */}
      <Skeleton height={180} radius={0} />

      {/* Body */}
      <div style={{ padding: 'var(--space-4)', display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
        <Skeleton height={12} width="60%" radius={4} />
        <Skeleton height={18} width="85%" radius={4} />
        <Skeleton height={14} radius={4} />
        <Skeleton height={14} width="70%" radius={4} />
        <div style={{ paddingTop: 'var(--space-3)', borderTop: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'space-between' }}>
          <Skeleton height={12} width="40%" radius={4} />
          <Skeleton height={12} width="25%" radius={4} />
        </div>
      </div>
    </div>
  );
}

// ── Grid of skeleton cards (default 6) ────────────────────────────────────────
export function SkeletonGrid({ count = 6 }) {
  return (
    <>
      <style>{`
        @keyframes skeleton-shimmer {
          0%   { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
      `}</style>
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
        gap: 'var(--space-5)',
      }}>
        {Array.from({ length: count }).map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
    </>
  );
}

// ── Detail page skeleton (2-column) ───────────────────────────────────────────
export function SkeletonDetailPage() {
  return (
    <>
      <style>{`
        @keyframes skeleton-shimmer {
          0%   { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
      `}</style>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: 'var(--space-8)' }}>
        {/* Left */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>
          <Skeleton height={420} radius={16} />
          <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
            <Skeleton height={20} width="40%" />
            <Skeleton height={14} />
            <Skeleton height={14} />
            <Skeleton height={14} width="80%" />
          </div>
        </div>
        {/* Right */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
          <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
            <div style={{ display: 'flex', gap: 8 }}>
              <Skeleton height={24} width={60} radius={20} />
              <Skeleton height={24} width={60} radius={20} />
            </div>
            <Skeleton height={32} width="70%" radius={6} />
            <Skeleton height={22} radius={6} />
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 8 }}>
              {[1,2,3].map(i => <Skeleton key={i} height={14} width={`${50 + i * 10}%`} radius={4} />)}
            </div>
          </div>
          <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <Skeleton height={14} width="40%" />
            <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
              <Skeleton height={42} width={42} radius={50} />
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 6 }}>
                <Skeleton height={14} width="60%" />
                <Skeleton height={12} width="40%" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
