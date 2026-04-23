/**
 * components/common/FormField.jsx
 * ─────────────────────────────────────────────────────────────────────────────
 * Reusable form field: label + input/textarea/select + validation error.
 * Cuts boilerplate across all create forms.
 *
 * Usage:
 *  <FormField id="title" label="Title *" error={errors.title}
 *    value={form.title} onChange={change} placeholder="Enter title" />
 *
 *  <FormField id="desc" label="Description" as="textarea"
 *    value={form.desc} onChange={change} />
 *
 *  <FormField id="cat" label="Category" as="select"
 *    value={form.category} onChange={change}>
 *    <option value="books">Books</option>
 *  </FormField>
 * ─────────────────────────────────────────────────────────────────────────────
 */

export default function FormField({
  id, name, label, as = 'input', type = 'text',
  value, onChange, placeholder, error, hint,
  children,        // for <select> options
  style = {},
  inputStyle = {},
  required,
  min, max, step, accept, autoComplete,
}) {
  const hasError = Boolean(error);
  // Error state: orange-red focus ring via box-shadow — no harsh border flash
  const errorStyle = hasError
    ? { boxShadow: '0 0 0 2px var(--color-danger)', background: 'var(--bg-input)' }
    : {};

  const commonProps = {
    id:          id,
    name:        name || id,
    value:       value,
    onChange:    onChange,
    placeholder: placeholder,
    required:    required,
    style:       { ...errorStyle, ...inputStyle },
    'aria-describedby': hint || error ? `${id}-hint` : undefined,
    'aria-invalid': hasError ? 'true' : undefined,
  };

  return (
    <div className="form-group" style={style}>
      {label && (
        <label htmlFor={id} className="form-label">
          {label}
        </label>
      )}

      {as === 'textarea' ? (
        <textarea {...commonProps} />
      ) : as === 'select' ? (
        <select {...commonProps}>{children}</select>
      ) : (
        <input
          {...commonProps}
          type={type}
          min={min} max={max} step={step}
          accept={accept}
          autoComplete={autoComplete}
        />
      )}

      {/* Hint / error message */}
      {(error || hint) && (
        <span
          id={`${id}-hint`}
          style={{
            fontSize: 'var(--text-xs)',
            color: hasError ? 'var(--color-danger)' : 'var(--text-muted)',
            display: 'flex', alignItems: 'center', gap: 4,
            marginTop: 2,
          }}
        >
          {hasError ? '⚠ ' : 'ℹ '}{error || hint}
        </span>
      )}

      {/* Scoped styles — placeholder contrast + input polish */}
      <style>{`
        #${id}::placeholder { color: var(--text-muted); opacity: 1; }
        #${id}:focus { background: var(--bg-hover); }
      `}</style>
    </div>
  );
}
