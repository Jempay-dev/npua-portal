import { useState } from "react";
import Modal from "./Modal.jsx";

/**
 * A modal with a form built from a list of fields.
 *
 * fields: [{ name, label, type, options, required, full }]
 *   type: "text" | "email" | "number" | "date" | "select" | "checkboxes"
 *   options (select / checkboxes): [{ value, label }]
 *   full: take the whole row instead of half
 *   hidden(values): return true to hide the field
 */
export default function FormModal({ title, fields, initialValues = {}, submitLabel = "Պահպանել", onSubmit, onClose }) {
  const [values, setValues] = useState(() => {
    const start = {};
    for (const f of fields) start[f.name] = initialValues[f.name] ?? (f.type === "checkboxes" ? [] : "");
    return start;
  });
  const [error, setError] = useState("");

  const set = (name, value) => setValues((v) => ({ ...v, [name]: value }));
  const visibleFields = fields.filter((f) => !f.hidden?.(values));

  const handleSubmit = (e) => {
    e.preventDefault();
    const missing = visibleFields.find((f) => f.required && String(values[f.name]).trim() === "");
    if (missing) return setError(`Լրացրեք «${missing.label}» դաշտը։`);

    // Convert number fields from text to numbers.
    const result = { ...values };
    for (const f of fields) if (f.type === "number" && result[f.name] !== "") result[f.name] = Number(result[f.name]);
    onSubmit(result);
  };

  return (
    <Modal
      title={title}
      onClose={onClose}
      footer={
        <>
          <button type="button" className="btn btn--ghost" onClick={onClose}>
            Չեղարկել
          </button>
          <button type="submit" form="form-modal" className="btn btn--primary">
            {submitLabel}
          </button>
        </>
      }
    >
      <form id="form-modal" className="form-grid" onSubmit={handleSubmit} noValidate>
        {visibleFields.map((f) => (
          <div key={f.name} className={`form-field ${f.full ? "form-field--full" : ""}`}>
            <span className="form-label">
              {f.label}
              {f.required && <span className="form-required"> *</span>}
            </span>
            <FieldInput field={f} value={values[f.name]} onChange={(v) => set(f.name, v)} />
          </div>
        ))}
        {error && <p className="form-error form-field--full">{error}</p>}
      </form>
    </Modal>
  );
}

function FieldInput({ field, value, onChange }) {
  if (field.type === "select") {
    return (
      <select className="input" value={value} onChange={(e) => onChange(e.target.value)} aria-label={field.label}>
        <option value="">— Ընտրել —</option>
        {field.options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    );
  }

  if (field.type === "checkboxes") {
    const toggle = (v) => onChange(value.includes(v) ? value.filter((x) => x !== v) : [...value, v]);
    return (
      <div className="checkbox-list">
        {field.options.map((o) => (
          <label key={o.value} className="checkbox-item">
            <input type="checkbox" checked={value.includes(o.value)} onChange={() => toggle(o.value)} />
            {o.label}
          </label>
        ))}
      </div>
    );
  }

  return (
    <input
      className="input"
      type={field.type ?? "text"}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      aria-label={field.label}
      step={field.type === "number" ? "any" : undefined}
    />
  );
}
