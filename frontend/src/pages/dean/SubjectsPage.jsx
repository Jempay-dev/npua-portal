import { useState } from "react";
import PageHeader from "../../components/ui/PageHeader.jsx";
import DataTable from "../../components/ui/DataTable.jsx";
import FormModal from "../../components/ui/FormModal.jsx";
import Badge from "../../components/ui/Badge.jsx";
import { FilterBar, SearchBox, Segmented, SelectFilter } from "../../components/ui/Filters.jsx";
import { EditIcon, PlusIcon, TrashIcon } from "../../components/ui/Icons.jsx";
import { useAuth } from "../../context/AuthContext.jsx";
import { addItem, newId, removeItem, updateItem, useData } from "../../data/store.js";
import { byId } from "../../data/queries.js";
import { LEVELS, SUBJECT_TYPES } from "../../data/constants.js";
import { matches, toOptions } from "../../utils/format.js";

const SEMESTER_NUMBERS = [1, 2, 3, 4, 5, 6, 7, 8].map((n) => ({ value: String(n), label: `${n}-րդ կիսամյակ` }));

export default function SubjectsPage() {
  const data = useData();
  const { can } = useAuth();
  const canEdit = can("editData");

  const [search, setSearch] = useState("");
  const [level, setLevel] = useState("");
  const [semesterNo, setSemesterNo] = useState("");
  const [departmentId, setDepartmentId] = useState("");
  const [editing, setEditing] = useState(null);

  const subjects = data.subjects.filter(
    (s) =>
      (matches(s.name, search) || matches(s.code, search)) &&
      (!level || s.level === level) &&
      (!semesterNo || s.semesterNo === Number(semesterNo)) &&
      (!departmentId || s.departmentId === departmentId)
  );

  const departmentOptions = data.departments.map((d) => ({ value: d.id, label: d.name }));

  const fields = [
    { name: "code", label: "Ծածկագիր", required: true },
    { name: "credits", label: "Կրեդիտ", type: "number", required: true },
    { name: "name", label: "Անվանում", required: true, full: true },
    { name: "type", label: "Տեսակ", type: "select", required: true, options: toOptions(SUBJECT_TYPES) },
    { name: "level", label: "Աստիճան", type: "select", required: true, options: toOptions(LEVELS) },
    { name: "semesterNo", label: "Կիսամյակ", type: "select", required: true, options: SEMESTER_NUMBERS },
    { name: "departmentId", label: "Ամբիոն", type: "select", required: true, options: departmentOptions },
  ];

  const save = (values) => {
    const subject = { ...values, semesterNo: Number(values.semesterNo) };
    if (editing.id) updateItem("subjects", editing.id, subject);
    else addItem("subjects", { id: newId("s"), ...subject });
    setEditing(null);
  };

  const remove = (subject) => {
    if (data.assignments.some((a) => a.subjectId === subject.id)) {
      return alert("Այս առարկան օգտագործվում է բեռնվածության մեջ և չի կարող ջնջվել։");
    }
    if (confirm(`Ջնջե՞լ «${subject.name}» առարկան։`)) removeItem("subjects", subject.id);
  };

  const columns = [
    { key: "code", label: "Ծածկագիր", className: "nowrap" },
    { key: "name", label: "Անվանում" },
    { key: "credits", label: "Կրեդիտ", className: "num" },
    {
      key: "type",
      label: "Տեսակ",
      render: (s) => <Badge tone={s.type === "exam" ? "info" : "neutral"}>{SUBJECT_TYPES[s.type]}</Badge>,
    },
    { key: "level", label: "Աստիճան", render: (s) => LEVELS[s.level].label },
    { key: "semesterNo", label: "Կիսամյակ", className: "num" },
    { key: "department", label: "Ամբիոն", render: (s) => byId(data.departments, s.departmentId)?.name },
    {
      key: "actions",
      label: "",
      className: "table__actions",
      render: (s) =>
        canEdit && (
          <div className="row-actions">
            <button type="button" className="icon-btn" title="Խմբագրել" onClick={() => setEditing({ ...s, semesterNo: String(s.semesterNo) })}>
              <EditIcon />
            </button>
            <button type="button" className="icon-btn icon-btn--danger" title="Ջնջել" onClick={() => remove(s)}>
              <TrashIcon />
            </button>
          </div>
        ),
    },
  ];

  return (
    <>
      <PageHeader
        title="Առարկաներ"
        subtitle={`${subjects.length} առարկա`}
        actions={
          canEdit && (
            <button type="button" className="btn btn--primary" onClick={() => setEditing({})}>
              <PlusIcon /> Ավելացնել առարկա
            </button>
          )
        }
      />

      <FilterBar>
        <SearchBox value={search} onChange={setSearch} placeholder="Որոնել ըստ անվանման կամ ծածկագրի" />
        <div className="filter-row">
          <SelectFilter label="Ամբիոն" value={departmentId} onChange={setDepartmentId} allLabel="Բոլոր ամբիոնները" options={departmentOptions} />
          <SelectFilter label="Կիսամյակ" value={semesterNo} onChange={setSemesterNo} allLabel="Բոլոր կիսամյակները" options={SEMESTER_NUMBERS} />
        </div>
        <Segmented
          label="Աստիճան"
          value={level}
          onChange={setLevel}
          options={[{ value: "", label: "Բոլորը" }, ...toOptions(LEVELS)]}
        />
      </FilterBar>

      <section className="card card--flush">
        <DataTable columns={columns} rows={subjects} empty="Առարկաներ չեն գտնվել" />
      </section>

      {editing && (
        <FormModal
          title={editing.id ? "Խմբագրել առարկան" : "Նոր առարկա"}
          fields={fields}
          initialValues={editing}
          onSubmit={save}
          onClose={() => setEditing(null)}
        />
      )}
    </>
  );
}
