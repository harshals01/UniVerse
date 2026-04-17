/**
 * components/common/PageError.jsx
 * Shown when an API fetch fails (non-toast, inline error with retry button).
 */
export default function PageError({ message = 'Something went wrong.', onRetry }) {
  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      justifyContent: 'center', padding: 'var(--space-16)',
      gap: 'var(--space-4)', textAlign: 'center',
    }}>
      <span style={{ fontSize: '3rem' }}>⚠️</span>
      <h3 style={{ fontSize: 'var(--text-lg)', fontWeight: 700, color: 'var(--text-secondary)' }}>
        Failed to load
      </h3>
      <p style={{
        color: 'var(--text-muted)', fontSize: 'var(--text-sm)',
        maxWidth: 340,
        padding: '10px 16px',
        background: 'rgba(239,68,68,0.08)',
        border: '1px solid rgba(239,68,68,0.2)',
        borderRadius: 'var(--radius-md)',
      }}>
        {message}
      </p>
      {onRetry && (
        <button className="btn btn-outline" onClick={onRetry}>
          🔄 Try again
        </button>
      )}
    </div>
  );
}
