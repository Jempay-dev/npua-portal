import { useState } from "react";
import { Navigate, useNavigate, useParams } from "react-router-dom";
import PageHeader from "../../components/ui/PageHeader.jsx";
import { SheetStatusBadge } from "../../components/ui/Badge.jsx";
import { ArrowLeftIcon, PrintIcon } from "../../components/ui/Icons.jsx";
import { useAuth } from "../../context/AuthContext.jsx";
import { updateItem, useData } from "../../data/store.js";
import { byId, sheetDetails } from "../../data/queries.js";
import { SUBJECT_TYPES } from "../../data/constants.js";
import { MAX, formatNumber, subjectResult } from "../../utils/grading.js";
import { semesterLabel } from "../../utils/semester.js";
import { fullName } from "../../utils/format.js";
import { sheetAccess } from "../../utils/sheetRules.js";

// Grade sheet (քննական տեղեկագիր / ведомость) of one group in one subject.

export default function SheetPage() {
  const { id } = useParams();
  const data = useData();
  const sheet = byId(data.sheets, id);
  if (!sheet) return <Navigate to="/" replace />;

  // `key` resets the editor when the sheet moves to another step.
  return <SheetEditor key={`${sheet.id}-${sheet.status}`} details={sheetDetails(data, sheet)} />;
}

function SheetEditor({ details }) {
  const navigate = useNavigate();
  const data = useData();
  const auth = useAuth();
  const { sheet, assignment, group, subject, department, students } = details;
  const access = sheetAccess(auth, details);

  const [rows, setRows] = useState(sheet.rows);
  const [dirty, setDirty] = useState(false);
  const [message, setMessage] = useState(null); // { tone, text }

  if (!access.canView) return <Navigate to="/" replace />;

  const isExam = subject.type === "exam";
  const teacher = (userId) => (userId ? fullName(byId(data.users, userId)) : "—");

  const setCell = (studentId, field, value) => {
    setRows((r) => ({ ...r, [studentId]: { ...r[studentId], [field]: value } }));
    setDirty(true);
    setMessage(null);
  };

  const problems = findProblems(students, rows, isExam);
  const graded = students.filter((s) => subjectResult(subject, rows[s.id]).complete);
  const passed = graded.filter((s) => subjectResult(subject, rows[s.id]).passed);

  const save = () => {
    updateItem("sheets", sheet.id, { rows });
    setDirty(false);
    setMessage({ tone: "success", text: "Փոփոխությունները պահպանված են։" });
  };

  const moveTo = (status, requireComplete = true) => {
    if (requireComplete && problems.length) {
      return setMessage({ tone: "danger", text: problems[0] });
    }
    updateItem("sheets", sheet.id, { rows, status });
  };

  return (
    <>
      <div className="no-print">
        <button type="button" className="link-btn back-btn" onClick={() => navigate(-1)}>
          <ArrowLeftIcon size={16} /> Հետ
        </button>
        <PageHeader
          title={`Տեղեկագիր · ${group.code}`}
          subtitle={`${subject.code} ${subject.name}`}
          actions={
            <button type="button" className="btn btn--ghost" onClick={() => window.print()}>
              <PrintIcon /> Տպել / PDF
            </button>
          }
        />
      </div>

      {/* Only visible on paper */}
      <div className="print-only print-title">
        <p>ՀԱՅԱՍՏԱՆԻ ԱԶԳԱՅԻՆ ՊՈԼԻՏԵԽՆԻԿԱԿԱՆ ՀԱՄԱԼՍԱՐԱՆ</p>
        <h1>ՔՆՆԱԿԱՆ ՏԵՂԵԿԱԳԻՐ</h1>
      </div>

      <section className="card sheet-info">
        <Info label="Խումբ" value={group.code} />
        <Info label="Առարկա" value={`${subject.code} ${subject.name}`} />
        <Info label="Տեսակ" value={`${SUBJECT_TYPES[subject.type]} · ${subject.credits} կրեդիտ`} />
        <Info label="Կիսամյակ" value={semesterLabel(assignment.semester)} />
        <Info label="Ամբիոն" value={department.name} />
        <Info label="Դասախոսություն" value={teacher(assignment.lecturerId)} />
        <Info label="Լաբ. / գործնական" value={teacher(assignment.labTeacherId)} />
        <Info label="Պատասխանատու" value={teacher(assignment.responsibleId)} />
        <div className="no-print">
          <span className="info__label">Կարգավիճակ</span>
          <SheetStatusBadge status={sheet.status} />
        </div>
      </section>

      <section className="card card--flush">
        <div className="table-wrap">
          <table className="table sheet-table">
            <thead>
              <tr>
                <th className="num">Հ/Հ</th>
                <th>Ազգանուն Անուն Հայրանուն</th>
                {isExam ? (
                  <>
                    <th className="num">Մ1 (0–{MAX.m1})</th>
                    <th className="num">Մ2 (0–{MAX.m2})</th>
                    <th className="num">Եզրափ. (0–{MAX.final})</th>
                    <th className="num">Ընդհանուր</th>
                    <th className="num">Գնահատական</th>
                    <th className="num">Թվանիշ</th>
                  </>
                ) : (
                  <th>Արդյունք</th>
                )}
              </tr>
            </thead>
            <tbody>
              {students.map((student, i) => {
                const row = rows[student.id] ?? {};
                const result = subjectResult(subject, row);
                return (
                  <tr key={student.id} className={result.complete && !result.passed ? "is-failed" : undefined}>
                    <td className="num">{i + 1}</td>
                    <td className="nowrap">{fullName(student)}</td>
                    {isExam ? (
                      <>
                        {["m1", "m2", "final"].map((field) => (
                          <td key={field} className="num">
                            <ScoreInput
                              value={row[field]}
                              max={MAX[field]}
                              disabled={!access.canEdit}
                              onChange={(v) => setCell(student.id, field, v)}
                            />
                          </td>
                        ))}
                        <td className="num strong">{result.total ?? "—"}</td>
                        <td className="num">{result.letter ?? "—"}</td>
                        <td className="num">{result.complete ? formatNumber(result.points) : "—"}</td>
                      </>
                    ) : (
                      <td>
                        <select
                          className="input input--sm"
                          value={row.passed === undefined ? "" : String(row.passed)}
                          disabled={!access.canEdit}
                          onChange={(e) => setCell(student.id, "passed", e.target.value === "" ? undefined : e.target.value === "true")}
                          aria-label={`${fullName(student)} արդյունք`}
                        >
                          <option value="">—</option>
                          <option value="true">Ստուգված (S)</option>
                          <option value="false">Չստուգված (U)</option>
                        </select>
                      </td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <p className="sheet-summary">
          Գնահատված՝ {graded.length}/{students.length} · Անցել՝ {passed.length} · Չի անցել՝ {graded.length - passed.length}
        </p>
      </section>

      {/* Signature lines, only on paper */}
      <div className="print-only signatures">
        <p>Քննող՝ ____________________ {teacher(assignment.responsibleId)}</p>
        <p>Ամբիոնի վարիչ՝ ____________________</p>
        <p>Դեկան՝ ____________________</p>
      </div>

      {message && <p className={`notice notice--${message.tone} no-print`}>{message.text}</p>}

      <div className="sheet-actions no-print">
        {access.canEdit && (
          <button type="button" className="btn btn--ghost" onClick={save} disabled={!dirty}>
            Պահպանել
          </button>
        )}
        {access.canReturn && (
          <button type="button" className="btn btn--ghost" onClick={() => moveTo("draft", false)}>
            Վերադարձնել դասախոսին
          </button>
        )}
        {access.nextStep && (
          <button type="button" className="btn btn--primary" onClick={() => moveTo(access.nextStep.status)}>
            {access.nextStep.label}
          </button>
        )}
      </div>
    </>
  );
}

function Info({ label, value }) {
  return (
    <div>
      <span className="info__label">{label}</span>
      <span className="info__value">{value}</span>
    </div>
  );
}

/** Number box that stores null when empty. */
function ScoreInput({ value, max, disabled, onChange }) {
  const invalid = typeof value === "number" && (value < 0 || value > max || !Number.isInteger(value));
  return (
    <input
      type="number"
      min="0"
      max={max}
      className={`grade-input ${invalid ? "is-invalid" : ""}`}
      value={value ?? ""}
      disabled={disabled}
      onChange={(e) => onChange(e.target.value === "" ? null : Number(e.target.value))}
    />
  );
}

/** List of reasons the sheet can't be sent yet (empty = OK). */
function findProblems(students, rows, isExam) {
  const problems = [];
  for (const s of students) {
    const row = rows[s.id] ?? {};
    if (isExam) {
      for (const field of ["m1", "m2", "final"]) {
        const v = row[field];
        if (typeof v !== "number") problems.push(`${fullName(s)}՝ բոլոր գնահատականները լրացված չեն։`);
        else if (v < 0 || v > MAX[field] || !Number.isInteger(v)) problems.push(`${fullName(s)}՝ սխալ գնահատական (0–${MAX[field]})։`);
      }
    } else if (typeof row.passed !== "boolean") {
      problems.push(`${fullName(s)}՝ արդյունքը նշված չէ։`);
    }
  }
  return problems;
}
