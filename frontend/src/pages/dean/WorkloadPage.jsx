import { useState } from "react";
import PageHeader from "../../components/ui/PageHeader.jsx";
import DataTable from "../../components/ui/DataTable.jsx";
import FormModal from "../../components/ui/FormModal.jsx";
import { SheetStatusBadge } from "../../components/ui/Badge.jsx";
import { FilterBar, SelectFilter, SemesterFilter } from "../../components/ui/Filters.jsx";
import { EditIcon, PlusIcon, TrashIcon } from "../../components/ui/Icons.jsx";
import { useAuth } from "../../context/AuthContext.jsx";
import { getData, newId, setValues, updateItem, useData } from "../../data/store.js";
import { byId, sheetOfAssignment } from "../../data/queries.js";
import { CURRENT_TERM, CURRENT_YEAR, SUBJECT_TYPES } from "../../data/constants.js";
import { groupSemesterNo, semesterKey } from "../../utils/semester.js";
import { fullName } from "../../utils/format.js";

// Բեռնվածություն: which teacher teaches which subject to which group.
// The ամբիոնի վարիչ later picks the responsible teacher (see DepartmentPage).

export default function WorkloadPage() {
  const data = useData();
  const { can } = useAuth();
  const canEdit = can("manageAccounts");

  const [semester, setSemester] = useState(semesterKey(CURRENT_YEAR, CURRENT_TERM));
  const [groupId, setGroupId] = useState("");
  const [editing, setEditing] = useState(null);

  const rows = data.assignments
    .filter((a) => a.semester === semester && (!groupId || a.groupId === groupId))
    .map((a) => ({
      ...a,
      group: byId(data.groups, a.groupId),
      subject: byId(data.subjects, a.subjectId),
      sheet: sheetOfAssignment(data, a.id),
    }))
    .sort((a, b) => a.group.code.localeCompare(b.group.code) || a.subject.code.localeCompare(b.subject.code));

  const groupOptions = data.groups.map((g) => ({ value: g.id, label: g.code }));
  const teacherOptions = data.users
    .filter((u) => u.type === "department")
    .map((t) => ({ value: t.id, label: `${fullName(t)} (${byId(data.departments, t.departmentId)?.name})` }));

  // Only subjects that match the group's level and its semester of study.
  const subjectOptionsFor = (id) => {
    const group = byId(data.groups, id);
    return data.subjects
      .filter((s) => s.level === group.level && s.semesterNo === groupSemesterNo(group, semester))
      .map((s) => ({ value: s.id, label: `${s.code} ${s.name}` }));
  };

  const save = (values) => {
    const teachers = { lecturerId: values.lecturerId, labTeacherId: values.labTeacherId || null };

    if (editing.id) {
      updateItem("assignments", editing.id, teachers);
    } else {
      // A new assignment also gets an empty grade sheet.
      const current = getData();
      const assignment = {
        id: newId("a"),
        semester,
        groupId: values.groupId,
        subjectId: values.subjectId,
        responsibleId: values.lecturerId,
        ...teachers,
      };
      setValues({
        assignments: [...current.assignments, assignment],
        sheets: [...current.sheets, { id: newId("sh"), assignmentId: assignment.id, status: "draft", rows: {} }],
      });
    }
    setEditing(null);
  };

  const remove = (row) => {
    if (row.sheet && row.sheet.status !== "draft") {
      return alert("Տեղեկագիրն արդեն ուղարկված է, այս կապը չի կարող ջնջվել։");
    }
    if (!confirm(`Ջնջե՞լ ${row.group.code} · ${row.subject.name} կապը։`)) return;
    const current = getData();
    setValues({
      assignments: current.assignments.filter((a) => a.id !== row.id),
      sheets: current.sheets.filter((s) => s.assignmentId !== row.id),
    });
  };

  const columns = [
    { key: "group", label: "Խումբ", render: (r) => r.group.code },
    { key: "subject", label: "Առարկա", render: (r) => `${r.subject.code} ${r.subject.name}` },
    { key: "type", label: "Տեսակ", render: (r) => SUBJECT_TYPES[r.subject.type] },
    { key: "lecturer", label: "Դասախոսություն", render: (r) => fullName(byId(data.users, r.lecturerId)) },
    { key: "lab", label: "Լաբ. / գործնական", render: (r) => (r.labTeacherId ? fullName(byId(data.users, r.labTeacherId)) : "—") },
    { key: "responsible", label: "Պատասխանատու", render: (r) => fullName(byId(data.users, r.responsibleId)) },
    { key: "status", label: "Տեղեկագիր", render: (r) => r.sheet && <SheetStatusBadge status={r.sheet.status} /> },
    {
      key: "actions",
      label: "",
      className: "table__actions",
      render: (r) =>
        canEdit && (
          <div className="row-actions">
            <button type="button" className="icon-btn" title="Խմբագրել" onClick={() => setEditing(r)}>
              <EditIcon />
            </button>
            <button type="button" className="icon-btn icon-btn--danger" title="Ջնջել" onClick={() => remove(r)}>
              <TrashIcon />
            </button>
          </div>
        ),
    },
  ];

  return (
    <>
      <PageHeader
        title="Բեռնվածություն"
        subtitle="Դասախոս ↔ առարկա ↔ խումբ կապեր"
        actions={
          canEdit && (
            <button type="button" className="btn btn--primary" onClick={() => setEditing({})}>
              <PlusIcon /> Նոր կապ
            </button>
          )
        }
      />

      <FilterBar>
        <div className="filter-row">
          <SemesterFilter value={semester} onChange={setSemester} />
          <SelectFilter label="Խումբ" value={groupId} onChange={setGroupId} allLabel="Բոլոր խմբերը" options={groupOptions} />
        </div>
      </FilterBar>

      <section className="card card--flush">
        <DataTable columns={columns} rows={rows} empty="Այս կիսամյակի համար կապեր չկան" />
      </section>

      {editing && (
        <WorkloadForm
          editing={editing}
          groupOptions={groupOptions}
          teacherOptions={teacherOptions}
          subjectOptionsFor={subjectOptionsFor}
          onSubmit={save}
          onClose={() => setEditing(null)}
        />
      )}
    </>
  );
}

// For a new assignment the form has two steps: first the group,
// then the subject list (filtered for that group) and the teachers.
function WorkloadForm({ editing, groupOptions, teacherOptions, subjectOptionsFor, onSubmit, onClose }) {
  const [groupId, setGroupId] = useState(editing.groupId ?? "");
  const isNew = !editing.id;

  if (isNew && !groupId) {
    return (
      <FormModal
        title="Նոր կապ — ընտրեք խումբը"
        submitLabel="Շարունակել"
        fields={[{ name: "groupId", label: "Խումբ", type: "select", required: true, full: true, options: groupOptions }]}
        onSubmit={(v) => setGroupId(v.groupId)}
        onClose={onClose}
      />
    );
  }

  const fields = [
    ...(isNew
      ? [{ name: "subjectId", label: "Առարկա", type: "select", required: true, full: true, options: subjectOptionsFor(groupId) }]
      : []),
    { name: "lecturerId", label: "Դասախոսություն", type: "select", required: true, full: true, options: teacherOptions },
    { name: "labTeacherId", label: "Լաբ. / գործնական (ըստ ցանկության)", type: "select", full: true, options: teacherOptions },
  ];

  return (
    <FormModal
      title={isNew ? "Նոր կապ" : "Խմբագրել կապը"}
      fields={fields}
      initialValues={editing}
      onSubmit={(values) => onSubmit({ ...values, groupId })}
      onClose={onClose}
    />
  );
}
