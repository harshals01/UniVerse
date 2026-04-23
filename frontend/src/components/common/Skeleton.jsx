/**
 * components/common/Skeleton.jsx
 * ─────────────────────────────────────────────────────────────────────────────
 * Animated skeleton placeholders — Dark Modular theme.
 * Shimmer keyframe is now defined globally in globals.css (no duplication).
 *
 * Exports:
 *  Skeleton          — base rectangular shimmer block
 *  SkeletonCard      — vertical product/item card placeholder
 *  SkeletonListRow   — horizontal LF-style row placeholder
 *  SkeletonGrid      — responsive grid of N SkeletonCards
 *  SkeletonListFeed  — vertical stack of N SkeletonListRows
 *  SkeletonDetailPage— two-column detail page skeleton
 * ─────────────────────────────────────────────────────────────────────────────
 */

/* ── Base shimmer block ──────────────────────────────────────────────────────── */
export default function Skeleton({ width = '100%', height = 16, radius = 8, style = {} }) {
  return (
    <div style={{
      width,
      height,
      borderRadius:    radius,
      background:      'linear-gradient(90deg, var(--bg-elevated) 25%, var(--bg-hover) 50%, var(--bg-elevated) 75%)',
      backgroundSize:  '200% 100%',
      animation:       'skeleton-shimmer 1.6s ease-in-out infinite',
      flexShrink:      0,
      ...style,
    }} />
  );
}

/* ── Vertical card skeleton (Marketplace / grid views) ────────────────────────  */
export function SkeletonCard() {
  return (
    <div style={{
      background:   'var(--bg-surface)',
      borderRadius: 'var(--radius-lg)',
      overflow:     'hidden',
    }}>
      {/* Image area */}
      <Skeleton height={190} radius={0} />

      {/* Body */}
      <div style={{ padding: 'var(--space-4) var(--space-5)', display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
        <Skeleton height={28} width="45%" radius={6} />  {/* price */}
        <Skeleton height={16} width="80%" radius={6} />  {/* title */}
        <Skeleton height={13} radius={5} />
        <Skeleton height={13} width="65%" radius={5} />
        <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: 'var(--space-3)', marginTop: 'var(--space-1)' }}>
          <Skeleton height={12} width="38%" radius={12} />
          <Skeleton height={12} width="22%" radius={12} />
        </div>
      </div>
    </div>
  );
}

/* ── Horizontal row skeleton (Lost & Found list view) ─────────────────────────  */
export function SkeletonListRow() {
  return (
    <div style={{
      display:      'flex',
      alignItems:   'center',
      gap:          'var(--space-4)',
      background:   'var(--bg-surface)',
      borderRadius: 'var(--radius-lg)',
      padding:      'var(--space-4) var(--space-5)',
    }}>
      {/* Thumbnail */}
      <Skeleton width={88} height={88} radius={12} style={{ flexShrink: 0 }} />

      {/* Content */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
        <Skeleton height={12} width="25%" radius={10} />
        <Skeleton height={16} width="70%" radius={5} />
        <Skeleton height={13} radius={5} />
        <Skeleton height={13} width="55%" radius={5} />
      </div>

      {/* Right badges */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)', alignItems: 'flex-end', flexShrink: 0 }}>
        <Skeleton height={22} width={56} radius={20} />
        <Skeleton height={20} width={52} radius={20} />
        <Skeleton height={30} width={72} radius={20} />
      </div>
    </div>
  );
}

/* ── Responsive bento grid of cards ───────────────────────────────────────────  */
export function SkeletonGrid({ count = 8 }) {
  return (
    <div className="mkt-grid">
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  );
}

/* ── Vertical feed of list rows (Lost & Found) ────────────────────────────────  */
export function SkeletonListFeed({ count = 6 }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonListRow key={i} />
      ))}
    </div>
  );
}

/* ── Detail page skeleton (2-column layout) ───────────────────────────────────  */
export function SkeletonDetailPage() {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: 'var(--space-8)' }}>

      {/* Left — hero image + description card */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>
        <Skeleton height={420} radius={24} />
        <div style={{ background: 'var(--bg-surface)', borderRadius: 'var(--radius-lg)', padding: 'var(--space-6)', display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
          <Skeleton height={20} width="35%" radius={6} />
          <Skeleton height={14} radius={5} />
          <Skeleton height={14} radius={5} />
          <Skeleton height={14} width="75%" radius={5} />
          <div style={{ display: 'flex', gap: 'var(--space-2)', paddingTop: 'var(--space-3)' }}>
            {[60, 72, 54].map((w, i) => <Skeleton key={i} height={22} width={w} radius={20} />)}
          </div>
        </div>
      </div>

      {/* Right — info card + seller card + action skeletons */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
        <div style={{ background: 'var(--bg-surface)', borderRadius: 'var(--radius-lg)', padding: 'var(--space-6)', display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
          <div style={{ display: 'flex', gap: 8 }}>
            <Skeleton height={24} width={64} radius={20} />
            <Skeleton height={24} width={80} radius={20} />
          </div>
          <Skeleton height={38} width="65%" radius={6} />
          <Skeleton height={20} radius={5} />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 8 }}>
            {[1, 2, 3].map(i => <Skeleton key={i} height={14} width={`${45 + i * 12}%`} radius={4} />)}
          </div>
        </div>

        <div style={{ background: 'var(--bg-surface)', borderRadius: 'var(--radius-lg)', padding: 'var(--space-6)', display: 'flex', flexDirection: 'column', gap: 12 }}>
          <Skeleton height={12} width="30%" radius={4} />
          <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
            <Skeleton height={44} width={44} radius={50} style={{ flexShrink: 0 }} />
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 6 }}>
              <Skeleton height={14} width="55%" radius={4} />
              <Skeleton height={12} width="40%" radius={4} />
            </div>
          </div>
        </div>

        <Skeleton height={48} radius={50} />   {/* CTA button */}
      </div>
    </div>
  );
}
