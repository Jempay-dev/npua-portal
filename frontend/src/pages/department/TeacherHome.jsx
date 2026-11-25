import { useState } from "react";
import { useNavigate } from "react-router-dom";
import PageHeader from "../../components/ui/PageHeader.jsx";
import DataTable from "../../components/ui/DataTable.jsx";
import { SheetStatusBadge } from "../../components/ui/Badge.jsx";
import { FilterBar, SemesterFilter } from "../../components/ui/Filters.jsx";
import { useAuth } from "../../context/AuthContext.jsx";
import { useData } from "../../data/store.js";
import { byId, sheetOfAssignment } from "../../data/queries.js";
import { CURRENT_TERM, CURRENT_YEAR, SUBJECT_TYPES } from "../../data/constants.js";
import { semesterKey } from "../../utils/semester.js";

// "Իմ առարկաները" — every subject this teacher is involved in.

function myRole(assignment, userId) {
  const roles = [];
  if (assignment.responsibleId === userId) roles.push("Պատասխանատու");
  if (assignment.lecturerId === userId) roles.push("Դասախոսություն");
  if (assignment.labTeacherId === userId) roles.push("Լաբ. / գործնական");
  return roles.join(", ");
}

export default function TeacherHome() {
  const navigate = useNavigate();
  const data = useData();
  const { user } = useAuth();
  const [semester, setSemester] = useState(semesterKey(CURRENT_YEAR, CURRENT_TERM));

  const rows = data.assignments
    .filter((a) => a.semester === semester && myRole(a, user.id))
    .map((a) => ({
      ...a,
      group: byId(data.groups, a.groupId),
      subject: byId(data.subjects, a.subjectId),
      sheet: sheetOfAssignment(data, a.id),
    }))
    .sort((a, b) => a.group.code.localeCompare(b.group.code));

  const toFill = rows.filter((r) => r.responsibleId === user.id && r.sheet?.status === "draft").length;

  return (
    <>
      <PageHeader
        title="Իմ առարկաները"
        subtitle={toFill ? `${toFill} տեղեկագիր սպասում է լրացման` : "Բոլոր տեղեկագրերն ուղարկված են"}
      />

      <FilterBar>
        <div className="filter-row">
          <SemesterFilter value={semester} onChange={setSemester} />
        </div>
      </FilterBar>

      <section className="card card--flush">
        <DataTable
          rows={rows}
          empty="Այս կիսամյակում առարկաներ չունեք"
          onRowClick={(r) => r.sheet && navigate(`/sheets/${r.sheet.id}`)}
          columns={[
            { key: "group", label: "Խումբ", render: (r) => r.group.code },
            { key: "subject", label: "Առարկա", render: (r) => `${r.subject.code} ${r.subject.name}` },
            { key: "type", label: "Տեսակ", render: (r) => SUBJECT_TYPES[r.subject.type] },
            { key: "role", label: "Իմ դերը", render: (r) => myRole(r, user.id) },
            { key: "status", label: "Տեղեկագիր", render: (r) => r.sheet && <SheetStatusBadge status={r.sheet.status} /> },
          ]}
        />
      </section>
    </>
  );
}
