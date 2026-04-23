/**
 * components/common/Card.jsx
 * ─────────────────────────────────────────────────────────────────────────────
 * Reusable surface card — Dark Modular theme.
 *
 * Props:
 *  as        = 'div' | 'article' | 'section' | any valid element
 *  padding   = 'sm' | 'md' | 'lg' | 'none'
 *  hover     = bool — enable subtle lift on hover
 *  radius    = 'md' | 'lg' | 'xl'  (maps to --radius-*)
 *  shadow    = bool — add ambient shadow
 *  style     = style overrides
 *  className = additional class names
 *  All other native props forwarded.
 * ─────────────────────────────────────────────────────────────────────────────
 */

const PADDING = {
  none: '0',
  sm:   'var(--space-4)',
  md:   'var(--space-6)',
  lg:   'var(--space-8)',
};

const RADIUS = {
  md: 'var(--radius-md)',
  lg: 'var(--radius-lg)',
  xl: 'var(--radius-xl)',
};

export default function Card({
  children,
  as        = 'div',
  padding   = 'md',
  hover     = false,
  radius    = 'lg',
  shadow    = false,
  style     = {},
  className = '',
  onClick,
  ...rest
}) {
  const Tag = as;

  const baseStyle = {
    background:   'var(--bg-surface)',
    borderRadius: RADIUS[radius] ?? RADIUS.lg,
    padding:      PADDING[padding] ?? PADDING.md,
    boxShadow:    shadow ? 'var(--shadow-md)' : 'none',
    transition:   hover
      ? 'transform var(--transition-base), box-shadow var(--transition-base)'
      : 'none',
    cursor:       onClick ? 'pointer' : 'default',
    ...style,
  };

  const handleMouseEnter = (e) => {
    if (hover) {
      e.currentTarget.style.transform = 'translateY(-3px)';
      e.currentTarget.style.boxShadow = 'var(--shadow-lg)';
    }
  };

  const handleMouseLeave = (e) => {
    if (hover) {
      e.currentTarget.style.transform = 'translateY(0)';
      e.currentTarget.style.boxShadow = shadow ? 'var(--shadow-md)' : 'none';
    }
  };

  return (
    <Tag
      style={baseStyle}
      className={className}
      onClick={onClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      {...rest}
    >
      {children}
    </Tag>
  );
}
