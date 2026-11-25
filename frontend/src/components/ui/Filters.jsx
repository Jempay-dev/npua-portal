import { ACADEMIC_YEARS } from "../../data/constants.js";
import { semesterKey, semesterLabel } from "../../utils/semester.js";
import { SearchIcon } from "./Icons.jsx";

/** The white box that holds search + filter controls above a list. */
export function FilterBar({ children }) {
  return <div className="filter-bar">{children}</div>;
}

export function SearchBox({ value, onChange, placeholder }) {
  return (
    <label className="search-box">
      <SearchIcon />
      <input
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        aria-label={placeholder}
      />
    </label>
  );
}

/** Labeled <select>. options: [{ value, label }]. `allLabel` adds an "all" choice with value "". */
export function SelectFilter({ label, value, onChange, options, allLabel }) {
  return (
    <label className="form-field">
      <span className="form-label">{label}</span>
      <select className="input" value={value} onChange={(e) => onChange(e.target.value)}>
        {allLabel && <option value="">{allLabel}</option>}
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </label>
  );
}

const SEMESTER_OPTIONS = ACADEMIC_YEARS.flatMap((year) =>
  [1, 2].map((term) => ({ value: semesterKey(year, term), label: semesterLabel(semesterKey(year, term)) }))
).reverse();

/** Academic year + semester picker used on every list that depends on time. */
export function SemesterFilter({ value, onChange, allLabel }) {
  return <SelectFilter label="Ուսումնական կիսամյակ" value={value} onChange={onChange} options={SEMESTER_OPTIONS} allLabel={allLabel} />;
}

/** Row of toggle buttons, e.g. Բոլորը | Բակալավր | Մագիստրոս */
export function Segmented({ label, value, onChange, options }) {
  return (
    <div className="form-field">
      <span className="form-label">{label}</span>
      <div className="segmented" role="group" aria-label={label}>
        {options.map((o) => (
          <button
            key={o.value}
            type="button"
            className={`segmented__item ${value === o.value ? "is-active" : ""}`}
            onClick={() => onChange(o.value)}
          >
            {o.label}
          </button>
        ))}
      </div>
    </div>
  );
}
