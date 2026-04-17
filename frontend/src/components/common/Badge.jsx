/**
 * components/common/Badge.jsx
 * Reusable status/type badge — maps value → color class automatically.
 */

const BADGE_MAP = {
  lost:     'badge-lost',
  found:    'badge-found',
  open:     'badge-open',
  claimed:  'badge-claimed',
  resolved: 'badge-claimed',
  sell:     'badge-sell',
  new:      'badge-found',
  'like-new':'badge-found',
  good:     'badge-sell',
  fair:     'badge-claimed',
};

export default function Badge({ value, label }) {
  const cls = BADGE_MAP[value] || 'badge-sell';
  return (
    <span className={`badge ${cls}`}>
      {label || value}
    </span>
  );
}
