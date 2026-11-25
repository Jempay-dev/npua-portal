import { useId, useState } from "react";
import { CheckIcon, EyeIcon, EyeOffIcon } from "./Icons.jsx";

/**
 * Input with a label, optional left icon, password show/hide toggle,
 * and an optional "verified" (read-only, green check) state.
 */
export default function TextField({
  label,
  icon: Icon,
  type = "text",
  verified = false,
  error,
  ...inputProps
}) {
  const id = useId();
  const [visible, setVisible] = useState(false);
  const isPassword = type === "password";
  const inputType = isPassword && visible ? "text" : type;

  const classes = [
    "field__control",
    Icon && "field__control--icon",
    verified && "field__control--verified",
    error && "field__control--error",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className="field">
      <label className="field__label" htmlFor={id}>
        {label}
      </label>
      <div className={classes}>
        {Icon && <Icon className="field__icon" />}
        <input
          id={id}
          type={inputType}
          className="field__input"
          readOnly={verified}
          aria-invalid={Boolean(error)}
          {...inputProps}
        />
        {isPassword && (
          <button
            type="button"
            className="field__toggle"
            onClick={() => setVisible((v) => !v)}
            aria-label={visible ? "Թաքցնել գաղտնաբառը" : "Ցույց տալ գաղտնաբառը"}
          >
            {visible ? <EyeOffIcon /> : <EyeIcon />}
          </button>
        )}
        {verified && (
          <span className="field__verified" aria-label="Հաստատված է">
            <CheckIcon />
          </span>
        )}
      </div>
      {error && <p className="field__error">{error}</p>}
    </div>
  );
}
