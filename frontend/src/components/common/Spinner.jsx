/**
 * components/common/Spinner.jsx
 * Reusable loading indicator in two sizes.
 */
export default function Spinner({ size = 'md', text = '' }) {
  const dim = size === 'sm' ? 20 : size === 'lg' ? 56 : 36;
  const border = size === 'sm' ? 2 : 3;

  return (
    <div style={{ display: 'inline-flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
      <div style={{
        width: dim, height: dim,
        border: `${border}px solid var(--border-default)`,
        borderTopColor: 'var(--color-primary)',
        borderRadius: '50%',
        animation: 'spin 0.7s linear infinite',
      }} />
      {text && <span style={{ color: 'var(--text-muted)', fontSize: 'var(--text-sm)' }}>{text}</span>}
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

/** Full-screen loading overlay */
export function FullPageSpinner({ text = 'Loading…' }) {
  return (
    <div style={{
      position: 'fixed', inset: 0,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'var(--bg-base)', zIndex: 999,
      flexDirection: 'column', gap: '16px',
    }}>
      <Spinner size="lg" />
      <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-sm)' }}>{text}</p>
    </div>
  );
}
