import { useState } from "react";
import { Link } from "react-router-dom";
import PageHeader from "../../components/ui/PageHeader.jsx";
import DataTable from "../../components/ui/DataTable.jsx";
import { SheetStatusBadge } from "../../components/ui/Badge.jsx";
import { FilterBar, SelectFilter, SemesterFilter } from "../../components/ui/Filters.jsx";
import { ArrowRightIcon } from "../../components/ui/Icons.jsx";
import { useAuth } from "../../context/AuthContext.jsx";
import { updateItem, useData } from "../../data/store.js";
import { byId, sheetOfAssignment, teachersOfDepartment } from "../../data/queries.js";
import { CURRENT_TERM, CURRENT_YEAR, SHEET_STATUS } from "../../data/constants.js";
import { semesterKey } from "../../utils/semester.js";
import { fullName, toOptions } from "../../utils/format.js";

// Page for the ամբիոնի վարիչ: every subject of the ամբիոն, who is responsible
// for each grade sheet, and which sheets wait for the վարիչ's check.

export default function DepartmentPage() {
  const data = useData();
  const { headOf } = useAuth();
  const [semester, setSemester] = useState(semesterKey(CURRENT_YEAR, CURRENT_TERM));
  const [status, setStatus] = useState("");

  const teachers = teachersOfDepartment(data, headOf.id).filter((t) => t.active);

  const rows = data.assignments
    .filter((a) => a.semester === semester && byId(data.subjects, a.subjectId).departmentId === headOf.id)
    .map((a) => ({
      ...a,
      group: byId(data.groups, a.groupId),
      subject: byId(data.subjects, a.subjectId),
      sheet: sheetOfAssignment(data, a.id),
    }))
    .filter((r) => !status || r.sheet?.status === status)
    .sort((a, b) => a.group.code.localeCompare(b.group.code) || a.subject.code.localeCompare(b.subject.code));

  const waiting = rows.filter((r) => r.sheet?.status === "head_review").length;

  const columns = [
    { key: "group", label: "Խումբ", render: (r) => r.group.code },
    { key: "subject", label: "Առարկա", render: (r) => `${r.subject.code} ${r.subject.name}` },
    { key: "lecturer", label: "Դասախոսություն", render: (r) => fullName(byId(data.users, r.lecturerId)) },
    { key: "lab", label: "Լաբ. / գործնական", render: (r) => (r.labTeacherId ? fullName(byId(data.users, r.labTeacherId)) : "—") },
    {
      key: "responsible",
      label: "Պատասխանատու",
      render: (r) => (
        <select
          className="input input--sm"
          value={r.responsibleId}
          disabled={r.sheet?.status === "approved"}
          onChange={(e) => updateItem("assignments", r.id, { responsibleId: e.target.value })}
          aria-label="Պատասխանատու"
        >
          {teachers.map((t) => (
            <option key={t.id} value={t.id}>
              {fullName(t)}
            </option>
          ))}
        </select>
      ),
    },
    { key: "status", label: "Տեղեկագիր", render: (r) => r.sheet && <SheetStatusBadge status={r.sheet.status} /> },
    {
      key: "open",
      label: "",
      className: "table__actions",
      render: (r) =>
        r.sheet && (
          <Link to={`/sheets/${r.sheet.id}`} className="btn btn--ghost btn--sm">
            Բացել <ArrowRightIcon size={16} />
          </Link>
        ),
    },
  ];

  return (
    <>
      <PageHeader
        title={headOf.name}
        subtitle={waiting ? `${waiting} տեղեկագիր սպասում է ձեր ստուգմանը` : "Ստուգման սպասող տեղեկագրեր չկան"}
      />

      <FilterBar>
        <div className="filter-row">
          <SemesterFilter value={semester} onChange={setSemester} />
          <SelectFilter label="Տեղեկագրի կարգավիճակ" value={status} onChange={setStatus} allLabel="Բոլորը" options={toOptions(SHEET_STATUS)} />
        </div>
      </FilterBar>

      <section className="card card--flush">
        <DataTable columns={columns} rows={rows} empty="Այս կիսամյակում առարկաներ չկան" />
      </section>
    </>
  );
}
