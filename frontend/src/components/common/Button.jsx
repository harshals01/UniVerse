/**
 * components/common/Button.jsx
 * ─────────────────────────────────────────────────────────────────────────────
 * Reusable button primitive — Dark Modular theme.
 *
 * Props:
 *  variant  = 'primary' | 'secondary' | 'ghost' | 'danger'
 *  size     = 'sm' | 'md' | 'lg'
 *  pill     = true (default) | false
 *  loading  = bool  — shows spinner, disables click
 *  All native <button> props forwarded.
 * ─────────────────────────────────────────────────────────────────────────────
 */

const VARIANTS = {
  primary: {
    background:  'var(--color-primary)',
    color:       '#ffffff',
    border:      'none',
    '--hover-bg': 'var(--color-primary-dark)',
  },
  secondary: {
    background:  'var(--bg-elevated)',
    color:       'var(--text-primary)',
    border:      '1px solid var(--border-default)',
    '--hover-bg': 'var(--bg-hover)',
  },
  ghost: {
    background:  'transparent',
    color:       'var(--text-secondary)',
    border:      'none',
    '--hover-bg': 'var(--bg-hover)',
  },
  danger: {
    background:  'rgba(239,68,68,0.12)',
    color:       '#f87171',
    border:      '1px solid rgba(239,68,68,0.25)',
    '--hover-bg': 'rgba(239,68,68,0.22)',
  },
};

const SIZES = {
  sm: { padding: '6px 14px',  fontSize: 'var(--text-xs)', gap: '6px'  },
  md: { padding: '10px 20px', fontSize: 'var(--text-sm)', gap: '8px'  },
  lg: { padding: '13px 28px', fontSize: 'var(--text-base)', gap: '10px' },
};

export default function Button({
  children,
  variant  = 'primary',
  size     = 'md',
  pill     = true,
  loading  = false,
  disabled = false,
  style    = {},
  onClick,
  type     = 'button',
  id,
  className = '',
  ...rest
}) {
  const v = VARIANTS[variant] ?? VARIANTS.primary;
  const s = SIZES[size]       ?? SIZES.md;

  const baseStyle = {
    display:        'inline-flex',
    alignItems:     'center',
    justifyContent: 'center',
    gap:            s.gap,
    padding:        s.padding,
    fontSize:       s.fontSize,
    fontWeight:     700,
    fontFamily:     'inherit',
    borderRadius:   pill ? 'var(--radius-pill)' : 'var(--radius-md)',
    background:     v.background,
    color:          v.color,
    border:         v.border ?? 'none',
    cursor:         disabled || loading ? 'not-allowed' : 'pointer',
    opacity:        disabled || loading ? 0.55 : 1,
    transition:     'background var(--transition-fast), transform var(--transition-fast), box-shadow var(--transition-fast)',
    whiteSpace:     'nowrap',
    userSelect:     'none',
    letterSpacing:  '0.01em',
    ...style,
  };

  const handleMouseEnter = (e) => {
    if (!disabled && !loading) {
      e.currentTarget.style.background = v['--hover-bg'];
      if (variant === 'primary') {
        e.currentTarget.style.boxShadow = '0 0 18px var(--color-primary-glow)';
      }
      e.currentTarget.style.transform = 'translateY(-1px)';
    }
  };

  const handleMouseLeave = (e) => {
    e.currentTarget.style.background  = v.background;
    e.currentTarget.style.boxShadow   = 'none';
    e.currentTarget.style.transform   = 'translateY(0)';
  };

  const handleMouseDown = (e) => {
    e.currentTarget.style.transform = 'translateY(0) scale(0.97)';
  };

  const handleMouseUp = (e) => {
    e.currentTarget.style.transform = 'translateY(-1px) scale(1)';
  };

  return (
    <button
      id={id}
      type={type}
      disabled={disabled || loading}
      onClick={onClick}
      style={baseStyle}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      className={className}
      {...rest}
    >
      {loading ? (
        <span style={{
          width: '14px', height: '14px',
          border: '2px solid currentColor',
          borderTopColor: 'transparent',
          borderRadius: '50%',
          display: 'inline-block',
          animation: 'btn-spin 0.7s linear infinite',
        }} />
      ) : children}
      <style>{`@keyframes btn-spin { to { transform: rotate(360deg); } }`}</style>
    </button>
  );
}
