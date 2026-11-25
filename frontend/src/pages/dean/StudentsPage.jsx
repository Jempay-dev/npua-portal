import { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import PageHeader from "../../components/ui/PageHeader.jsx";
import DataTable from "../../components/ui/DataTable.jsx";
import FormModal from "../../components/ui/FormModal.jsx";
import { FilterBar, SearchBox, SelectFilter } from "../../components/ui/Filters.jsx";
import { ChartIcon, EditIcon, PlusIcon, TrashIcon } from "../../components/ui/Icons.jsx";
import { useAuth } from "../../context/AuthContext.jsx";
import { addItem, newId, removeItem, updateItem, useData } from "../../data/store.js";
import { byId, specialtyOf } from "../../data/queries.js";
import { FUNDING, GENDERS } from "../../data/constants.js";
import { formatDate, fullName, matches, toOptions } from "../../utils/format.js";

export default function StudentsPage() {
  const data = useData();
  const { can } = useAuth();
  const canEdit = can("editData");
  const [params] = useSearchParams();

  const [search, setSearch] = useState("");
  const [groupId, setGroupId] = useState(params.get("group") ?? "");
  const [funding, setFunding] = useState("");
  const [editing, setEditing] = useState(null); // null = closed, {} = new, student = edit

  const students = data.students.filter(
    (s) =>
      (!groupId || s.groupId === groupId) &&
      (!funding || s.funding === funding) &&
      (matches(fullName(s), search) || matches(s.studentNo, search))
  );

  const fields = [
    { name: "groupId", label: "Խումբ", type: "select", required: true, options: data.groups.map((g) => ({ value: g.id, label: g.code })) },
    { name: "studentNo", label: "Ուսանողական №", required: true },
    { name: "lastName", label: "Ազգանուն", required: true },
    { name: "firstName", label: "Անուն", required: true },
    { name: "middleName", label: "Հայրանուն" },
    { name: "gender", label: "Սեռ", type: "select", required: true, options: toOptions(GENDERS) },
    { name: "birthDate", label: "Ծննդյան ամսաթիվ", type: "date" },
    { name: "admissionDate", label: "Ընդունման ամսաթիվ", type: "date" },
    { name: "orderNo", label: "Ընդունման հրաման" },
    { name: "funding", label: "Ուսուցման վճար", type: "select", required: true, options: toOptions(FUNDING) },
    { name: "passport", label: "Անձնագիր" },
    { name: "phone", label: "Հեռախոս" },
    { name: "admissionScore", label: "Ընդունելության միավոր", type: "number" },
    { name: "address", label: "Հասցե", full: true },
  ];

  const save = (values) => {
    if (editing.id) updateItem("students", editing.id, values);
    else addItem("students", { id: newId("st"), ...values });
    setEditing(null);
  };

  const remove = (student) => {
    if (confirm(`Ջնջե՞լ ${fullName(student)} ուսանողին։`)) removeItem("students", student.id);
  };

  const columns = [
    { key: "group", label: "Խումբ", render: (s) => byId(data.groups, s.groupId)?.code },
    { key: "studentNo", label: "Ուսանողական №" },
    { key: "name", label: "Ազգանուն Անուն Հայրանուն", className: "nowrap", render: (s) => fullName(s) },
    { key: "gender", label: "Սեռ", render: (s) => GENDERS[s.gender] },
    { key: "birthDate", label: "Ծննդյան ամսաթիվ", render: (s) => formatDate(s.birthDate) },
    {
      key: "admission",
      label: "Ընդունման ամսաթիվ (հրաման)",
      render: (s) => `${formatDate(s.admissionDate)} (${s.orderNo || "—"})`,
    },
    { key: "funding", label: "Վճար", render: (s) => FUNDING[s.funding]?.label },
    {
      key: "specialty",
      label: "Մասնագիտություն",
      render: (s) => specialtyOf(byId(data.groups, s.groupId))?.name ?? "—",
    },
    { key: "qualification", label: "Որակավորում", render: (s) => specialtyOf(byId(data.groups, s.groupId))?.qualification },
    { key: "passport", label: "Անձնագիր" },
    { key: "phone", label: "Հեռախոս", className: "nowrap" },
    { key: "address", label: "Հասցե" },
    { key: "admissionScore", label: "Ընդ. միավոր" },
    {
      key: "actions",
      label: "",
      className: "table__actions",
      render: (s) => (
        <div className="row-actions">
          <Link to={`/students/${s.id}/transcript`} className="icon-btn" title="Ակադեմիական տեղեկանք">
            <ChartIcon />
          </Link>
          {canEdit && (
            <>
              <button type="button" className="icon-btn" title="Խմբագրել" onClick={() => setEditing(s)}>
                <EditIcon />
              </button>
              <button type="button" className="icon-btn icon-btn--danger" title="Ջնջել" onClick={() => remove(s)}>
                <TrashIcon />
              </button>
            </>
          )}
        </div>
      ),
    },
  ];

  return (
    <>
      <PageHeader
        title="Ուսանողներ"
        subtitle={`${students.length} ուսանող`}
        actions={
          canEdit && (
            <button type="button" className="btn btn--primary" onClick={() => setEditing({})}>
              <PlusIcon /> Ավելացնել ուսանող
            </button>
          )
        }
      />

      <FilterBar>
        <SearchBox value={search} onChange={setSearch} placeholder="Որոնել ըստ անվան կամ ուսանողական համարի" />
        <div className="filter-row">
          <SelectFilter
            label="Խումբ"
            value={groupId}
            onChange={setGroupId}
            allLabel="Բոլոր խմբերը"
            options={data.groups.map((g) => ({ value: g.id, label: g.code }))}
          />
          <SelectFilter label="Ուսուցման վճար" value={funding} onChange={setFunding} allLabel="Բոլորը" options={toOptions(FUNDING)} />
        </div>
      </FilterBar>

      <section className="card card--flush">
        <DataTable columns={columns} rows={students} empty="Ուսանողներ չեն գտնվել" />
      </section>

      {editing && (
        <FormModal
          title={editing.id ? "Խմբագրել ուսանողին" : "Նոր ուսանող"}
          fields={fields}
          initialValues={editing}
          onSubmit={save}
          onClose={() => setEditing(null)}
        />
      )}
    </>
  );
}
