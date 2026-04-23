/**
 * components/common/PageError.jsx
 * ─────────────────────────────────────────────────────────────────────────────
 * Inline error state — Dark Modular theme.
 * Shown when an API fetch fails (non-toast, in-page with retry button).
 *
 * Props:
 *  message  — error description string
 *  onRetry  — optional retry handler
 * ─────────────────────────────────────────────────────────────────────────────
 */
export default function PageError({
  message = 'Something went wrong.',
  onRetry,
}) {
  return (
    <div style={{
      display:        'flex',
      flexDirection:  'column',
      alignItems:     'center',
      justifyContent: 'center',
      padding:        'var(--space-16) var(--space-8)',
      gap:            'var(--space-4)',
      textAlign:      'center',
    }}>
      {/* Error icon circle */}
      <div style={{
        width:          72,
        height:         72,
        borderRadius:   '50%',
        background:     'rgba(239,68,68,0.10)',
        display:        'flex',
        alignItems:     'center',
        justifyContent: 'center',
        fontSize:       '1.8rem',
        marginBottom:   'var(--space-2)',
      }}>
        ⊗
      </div>

      {/* Heading */}
      <h3 style={{
        fontSize:   'var(--text-lg)',
        fontWeight: 700,
        color:      'var(--text-secondary)',
        margin:     0,
      }}>
        Failed to load
      </h3>

      {/* Error message pill */}
      <div style={{
        padding:      'var(--space-3) var(--space-5)',
        background:   'rgba(239,68,68,0.08)',
        borderRadius: 'var(--radius-pill)',
        maxWidth:     380,
      }}>
        <p style={{
          color:     '#f87171',
          fontSize:  'var(--text-sm)',
          fontWeight: 500,
          margin:    0,
          lineHeight: 1.5,
        }}>
          {message}
        </p>
      </div>

      {/* Retry button */}
      {onRetry && (
        <button
          onClick={onRetry}
          style={{
            marginTop:    'var(--space-2)',
            padding:      'var(--space-2) var(--space-5)',
            borderRadius: 'var(--radius-pill)',
            background:   'var(--bg-elevated)',
            color:        'var(--text-secondary)',
            fontWeight:   700,
            fontSize:     'var(--text-sm)',
            border:       'none',
            cursor:       'pointer',
            transition:   'background var(--transition-fast), color var(--transition-fast)',
            display:      'flex',
            alignItems:   'center',
            gap:          'var(--space-2)',
          }}
          onMouseEnter={e => { e.currentTarget.style.background = 'var(--bg-hover)'; e.currentTarget.style.color = 'var(--text-primary)'; }}
          onMouseLeave={e => { e.currentTarget.style.background = 'var(--bg-elevated)'; e.currentTarget.style.color = 'var(--text-secondary)'; }}
        >
          ↻ Try again
        </button>
      )}
    </div>
  );
}
