import { useState } from "react";
import { useNavigate } from "react-router-dom";
import PageHeader from "../../components/ui/PageHeader.jsx";
import DataTable from "../../components/ui/DataTable.jsx";
import { SheetStatusBadge } from "../../components/ui/Badge.jsx";
import { FilterBar, SelectFilter, SemesterFilter } from "../../components/ui/Filters.jsx";
import { useData } from "../../data/store.js";
import { sheetDetails } from "../../data/queries.js";
import { CURRENT_TERM, CURRENT_YEAR, SHEET_STATUS } from "../../data/constants.js";
import { semesterKey } from "../../utils/semester.js";
import { fullName, toOptions } from "../../utils/format.js";

export default function SheetsPage() {
  const navigate = useNavigate();
  const data = useData();

  const [semester, setSemester] = useState(semesterKey(CURRENT_YEAR, CURRENT_TERM));
  const [status, setStatus] = useState("");
  const [groupId, setGroupId] = useState("");
  const [departmentId, setDepartmentId] = useState("");

  const rows = data.sheets
    .map((s) => sheetDetails(data, s))
    .filter(
      (d) =>
        d.assignment.semester === semester &&
        (!status || d.sheet.status === status) &&
        (!groupId || d.group.id === groupId) &&
        (!departmentId || d.department.id === departmentId)
    )
    .map((d) => ({ id: d.sheet.id, ...d }))
    .sort((a, b) => a.group.code.localeCompare(b.group.code) || a.subject.code.localeCompare(b.subject.code));

  return (
    <>
      <PageHeader title="Տեղեկագրեր" subtitle="Ամբիոններից ստացված քննական տեղեկագրեր" />

      <FilterBar>
        <div className="filter-row">
          <SemesterFilter value={semester} onChange={setSemester} />
          <SelectFilter label="Կարգավիճակ" value={status} onChange={setStatus} allLabel="Բոլորը" options={toOptions(SHEET_STATUS)} />
          <SelectFilter
            label="Խումբ"
            value={groupId}
            onChange={setGroupId}
            allLabel="Բոլոր խմբերը"
            options={data.groups.map((g) => ({ value: g.id, label: g.code }))}
          />
          <SelectFilter
            label="Ամբիոն"
            value={departmentId}
            onChange={setDepartmentId}
            allLabel="Բոլոր ամբիոնները"
            options={data.departments.map((d) => ({ value: d.id, label: d.name }))}
          />
        </div>
      </FilterBar>

      <section className="card card--flush">
        <DataTable
          rows={rows}
          empty="Տեղեկագրեր չեն գտնվել"
          onRowClick={(r) => navigate(`/sheets/${r.id}`)}
          columns={[
            { key: "group", label: "Խումբ", render: (r) => r.group.code },
            { key: "subject", label: "Առարկա", render: (r) => `${r.subject.code} ${r.subject.name}` },
            { key: "department", label: "Ամբիոն", render: (r) => r.department.name },
            { key: "responsible", label: "Պատասխանատու", render: (r) => fullName(r.responsible) },
            { key: "status", label: "Կարգավիճակ", render: (r) => <SheetStatusBadge status={r.sheet.status} /> },
          ]}
        />
      </section>
    </>
  );
}
