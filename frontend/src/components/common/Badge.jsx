/**
 * components/common/Badge.jsx
 * Reusable status/type badge — maps value → color class automatically.
 */

const BADGE_MAP = {
  // Item type
  lost:      'badge-lost',
  found:     'badge-found',
  // Status
  open:      'badge-open',
  claimed:   'badge-claimed',
  resolved:  'badge-claimed',
  sold:      'badge-sold',
  // Condition
  new:       'badge-found',
  'like-new':'badge-found',
  good:      'badge-sell',
  fair:      'badge-claimed',
  // Listing type
  sell:      'badge-sell',
};

export default function Badge({ value, label }) {
  const cls = BADGE_MAP[value] || 'badge-sell';
  return (
    <span className={`badge ${cls}`}>
      {label || value}
    </span>
  );
}
