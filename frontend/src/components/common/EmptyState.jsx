/**
 * components/common/EmptyState.jsx
 * ─────────────────────────────────────────────────────────────────────────────
 * Premium empty state — Dark Modular theme.
 * Uses a dark surface card container with subtle icon circle.
 *
 * Props:
 *  icon        — text/emoji icon (default '◎')
 *  title       — heading text
 *  description — supporting text
 *  action      — optional { label, onClick } for the CTA button
 * ─────────────────────────────────────────────────────────────────────────────
 */
export default function EmptyState({
  icon        = '◎',
  title       = 'Nothing here yet',
  description = '',
  action,
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
      {/* Icon circle */}
      <div style={{
        width:          72,
        height:         72,
        borderRadius:   '50%',
        background:     'var(--bg-elevated)',
        display:        'flex',
        alignItems:     'center',
        justifyContent: 'center',
        fontSize:       '1.8rem',
        marginBottom:   'var(--space-2)',
      }}>
        {icon}
      </div>

      {/* Heading */}
      <h3 style={{
        fontSize:   'var(--text-xl)',
        fontWeight: 700,
        color:      'var(--text-secondary)',
        margin:     0,
      }}>
        {title}
      </h3>

      {/* Supporting text */}
      {description && (
        <p style={{
          color:     'var(--text-muted)',
          fontSize:  'var(--text-sm)',
          maxWidth:  340,
          lineHeight: 1.6,
          margin:    0,
        }}>
          {description}
        </p>
      )}

      {/* CTA button */}
      {action && (
        <button
          onClick={action.onClick}
          style={{
            marginTop:    'var(--space-2)',
            padding:      'var(--space-3) var(--space-6)',
            borderRadius: 'var(--radius-pill)',
            background:   'var(--color-primary)',
            color:        '#fff',
            fontWeight:   700,
            fontSize:     'var(--text-sm)',
            border:       'none',
            cursor:       'pointer',
            transition:   'background var(--transition-fast), box-shadow var(--transition-fast)',
          }}
          onMouseEnter={e => { e.currentTarget.style.background = 'var(--color-primary-dark)'; e.currentTarget.style.boxShadow = '0 0 18px var(--color-primary-glow)'; }}
          onMouseLeave={e => { e.currentTarget.style.background = 'var(--color-primary)'; e.currentTarget.style.boxShadow = 'none'; }}
        >
          {action.label}
        </button>
      )}
    </div>
  );
}
