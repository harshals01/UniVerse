/**
 * components/common/EmptyState.jsx
 * Reusable empty state for any list page.
 * Props: icon, title, description, action (optional button config)
 */
export default function EmptyState({ icon = '📭', title = 'Nothing here yet', description = '', action }) {
  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      justifyContent: 'center', padding: 'var(--space-16)',
      gap: 'var(--space-4)', textAlign: 'center',
    }}>
      <span style={{ fontSize: '3.5rem' }}>{icon}</span>
      <h3 style={{ fontSize: 'var(--text-xl)', fontWeight: 700, color: 'var(--text-secondary)' }}>
        {title}
      </h3>
      {description && (
        <p style={{ color: 'var(--text-muted)', fontSize: 'var(--text-sm)', maxWidth: 340 }}>
          {description}
        </p>
      )}
      {action && (
        <button className="btn btn-primary" onClick={action.onClick}>
          {action.label}
        </button>
      )}
    </div>
  );
}
