/**
 * hooks/useFormValidation.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Reusable form validation hook.
 *
 * Usage:
 *   const { errors, validate, clearError } = useFormValidation(rules);
 *   const ok = validate(formValues);  // returns true if all pass
 *
 * Rules format:
 *   {
 *     fieldName: [
 *       { test: (val) => val.trim().length > 0, message: 'Required' },
 *       { test: (val) => val.length >= 6,       message: 'Min 6 chars' },
 *     ]
 *   }
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { useState } from 'react';

export function useFormValidation(rules) {
  const [errors, setErrors] = useState({});

  const validate = (values) => {
    const newErrors = {};

    for (const [field, fieldRules] of Object.entries(rules)) {
      const value = values[field] ?? '';
      for (const rule of fieldRules) {
        if (!rule.test(value)) {
          newErrors[field] = rule.message;
          break; // Stop at first failing rule per field
        }
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const clearError = (field) =>
    setErrors(prev => ({ ...prev, [field]: '' }));

  const clearAll = () => setErrors({});

  return { errors, validate, clearError, clearAll };
}

// ── Built-in rule factories (use these to avoid repetition) ───────────────────
export const rules = {
  required:    (msg = 'This field is required')             => ({ test: v => String(v).trim().length > 0, message: msg }),
  minLength:   (n, msg)                                     => ({ test: v => String(v).trim().length >= n, message: msg || `Must be at least ${n} characters` }),
  maxLength:   (n, msg)                                     => ({ test: v => String(v).trim().length <= n, message: msg || `Must be at most ${n} characters` }),
  email:       (msg = 'Enter a valid email address')        => ({ test: v => /\S+@\S+\.\S+/.test(v),    message: msg }),
  numeric:     (msg = 'Must be a number')                   => ({ test: v => !isNaN(Number(v)),          message: msg }),
  min:         (n, msg)                                     => ({ test: v => Number(v) >= n,             message: msg || `Must be at least ${n}` }),
  positiveNum: (msg = 'Must be 0 or more')                  => ({ test: v => !isNaN(Number(v)) && Number(v) >= 0, message: msg }),
  matches:     (otherValue, msg = 'Values do not match')    => ({ test: v => v === otherValue,           message: msg }),
  pattern:     (regex, msg)                                 => ({ test: v => regex.test(v),              message: msg }),
};
