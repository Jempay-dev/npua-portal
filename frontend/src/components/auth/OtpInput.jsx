import { useId, useRef } from "react";

/**
 * Row of single-digit boxes.
 * `value` is an array of strings (one per box), e.g. ["1","2","","","",""].
 * Auto-advances on type, goes back on Backspace, accepts a pasted code.
 */
export default function OtpInput({ value, onChange, label }) {
  const labelId = useId();
  const refs = useRef([]);
  const length = value.length;

  const focus = (i) => refs.current[Math.max(0, Math.min(length - 1, i))]?.focus();

  const setDigit = (index, digit) => {
    if (index < 0 || index >= length) return;
    const next = value.slice();
    next[index] = digit;
    onChange(next);
  };

  const handleChange = (i, e) => {
    const digit = e.target.value.replace(/\D/g, "").slice(-1);
    if (!digit) return;
    setDigit(i, digit);
    focus(i + 1);
  };

  const handleKeyDown = (i, e) => {
    if (e.key === "Backspace") {
      e.preventDefault();
      if (value[i]) setDigit(i, "");
      else {
        setDigit(i - 1, "");
        focus(i - 1);
      }
    } else if (e.key === "ArrowLeft") focus(i - 1);
    else if (e.key === "ArrowRight") focus(i + 1);
  };

  const handlePaste = (e) => {
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, length);
    if (!pasted) return;
    e.preventDefault();
    onChange(Array.from({ length }, (_, i) => pasted[i] ?? ""));
    focus(pasted.length);
  };

  return (
    <div className="field">
      <span className="field__label" id={labelId}>
        {label}
      </span>
      <div className="otp" role="group" aria-labelledby={labelId}>
        {value.map((d, i) => (
          <input
            key={i}
            ref={(el) => (refs.current[i] = el)}
            className="otp__box"
            inputMode="numeric"
            autoComplete={i === 0 ? "one-time-code" : "off"}
            maxLength={1}
            placeholder="–"
            value={d}
            aria-label={`Նիշ ${i + 1}`}
            onChange={(e) => handleChange(i, e)}
            onKeyDown={(e) => handleKeyDown(i, e)}
            onPaste={handlePaste}
            onFocus={(e) => e.target.select()}
          />
        ))}
      </div>
    </div>
  );
}
