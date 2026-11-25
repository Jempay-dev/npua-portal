import { useState } from "react";
import { Link } from "react-router-dom";
import PageHeader from "../../components/ui/PageHeader.jsx";
import { FilterBar, SelectFilter, SemesterFilter } from "../../components/ui/Filters.jsx";
import { useData } from "../../data/store.js";
import { groupProgress } from "../../data/queries.js";
import { FUNDING } from "../../data/constants.js";
import { CATEGORIES, formatNumber } from "../../utils/grading.js";
import { fullName } from "../../utils/format.js";

// The last fully finished semester — the current one has no approved grades yet.
const DEFAULT_SEMESTER = "2025-2026/2";

export default function ProgressPage() {
  const data = useData();
  const [semester, setSemester] = useState(DEFAULT_SEMESTER);
  const [groupId, setGroupId] = useState("");

  // Only groups that studied in the chosen semester.
  const groups = data.groups.filter((g) => data.assignments.some((a) => a.groupId === g.id && a.semester === semester));
  const group = groups.find((g) => g.id === groupId) ?? groups[0];
  const progress = group ? groupProgress(data, group.id, semester) : null;

  return (
    <>
      <PageHeader title="Առաջադիմություն" subtitle="Խմբի արդյունքները ըստ կիսամյակի (միայն հաստատված տեղեկագրեր)" />

      <FilterBar>
        <div className="filter-row">
          <SemesterFilter value={semester} onChange={setSemester} />
          <SelectFilter
            label="Խումբ"
            value={group?.id ?? ""}
            onChange={setGroupId}
            options={groups.map((g) => ({ value: g.id, label: g.code }))}
          />
        </div>
      </FilterBar>

      {!progress ? (
        <p className="empty">Այս կիսամյակում խմբեր չկան</p>
      ) : (
        <>
          <ProgressTable progress={progress} />
          <SummaryTable rows={progress.rows} />
        </>
      )}
    </>
  );
}

function ProgressTable({ progress }) {
  const { subjects, rows } = progress;

  return (
    <section className="card card--flush">
      <div className="table-wrap">
        <table className="table progress-table">
          <thead>
            <tr>
              <th className="num">Հ/Հ</th>
              <th>Ազգանուն Անուն Հայրանուն</th>
              {subjects.map((s) => (
                <th key={s.id} className="num" title={s.name}>
                  {s.code}
                </th>
              ))}
              <th className="num">Կիս. ՄՈԳ</th>
              <th>Կիս. առաջադիմություն</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {rows.map(({ student, results, summary }, i) => (
              <tr key={student.id}>
                <td className="num">{i + 1}</td>
                <td className="nowrap">
                  {fullName(student)} ({FUNDING[student.funding].short})
                </td>
                {results.map(({ subject, result }) => (
                  <td key={subject.id} className={`num ${result && !result.passed ? "cell--failed" : ""}`}>
                    {result ? result.label : "—"}
                  </td>
                ))}
                <td className="num nowrap">
                  {summary ? `${formatNumber(summary.gpa)} (${formatNumber(summary.averageScore)})` : "—"}
                </td>
                <td>{summary?.category ?? "—"}</td>
                <td className="table__actions">
                  <Link to={`/students/${student.id}/transcript`} className="btn btn--ghost btn--sm">
                    Տեղեկանք
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <ul className="legend">
        {subjects.map((s) => (
          <li key={s.id}>
            <strong>{s.code}</strong> {s.name}
          </li>
        ))}
      </ul>
    </section>
  );
}

/** Counts per category, split by Պ (state funded), Վ (paid), Ը (total). */
function SummaryTable({ rows }) {
  const columns = [
    { label: "Ուսանող", filter: () => true }, // everyone in the group
    ...CATEGORIES.map((c) => ({ label: c, filter: (r) => r.summary?.category === c })),
    { label: "Պարտք ունեն", filter: (r) => Boolean(r.summary?.hasDebt) },
  ];

  // funding: "state" | "paid" | undefined (= both)
  const count = (column, funding) =>
    rows.filter((r) => column.filter(r) && (!funding || r.student.funding === funding)).length;

  return (
    <section className="card card--flush">
      <div className="table-wrap">
        <table className="table summary-table">
          <thead>
            <tr>
              {columns.map((c) => (
                <th key={c.label} colSpan={3} className="center">
                  {c.label}
                </th>
              ))}
            </tr>
            <tr>
              {columns.flatMap((c) =>
                ["Պ", "Վ", "Ը"].map((x) => (
                  <th key={c.label + x} className="center">
                    {x}
                  </th>
                ))
              )}
            </tr>
          </thead>
          <tbody>
            <tr>
              {columns.flatMap((c) => [
                <td key={c.label + "Պ"} className="center">{count(c, "state")}</td>,
                <td key={c.label + "Վ"} className="center">{count(c, "paid")}</td>,
                <td key={c.label + "Ը"} className="center strong">{count(c)}</td>,
              ])}
            </tr>
          </tbody>
        </table>
      </div>
    </section>
  );
}
