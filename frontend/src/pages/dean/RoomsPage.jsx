import { useState } from "react";
import PageHeader from "../../components/ui/PageHeader.jsx";
import DataTable from "../../components/ui/DataTable.jsx";
import FormModal from "../../components/ui/FormModal.jsx";
import { EditIcon, PlusIcon, TrashIcon } from "../../components/ui/Icons.jsx";
import { useAuth } from "../../context/AuthContext.jsx";
import { addItem, newId, removeItem, updateItem, useData } from "../../data/store.js";

const FIELDS = [
  { name: "name", label: "Լսարան", required: true },
  { name: "capacity", label: "Տեղերի քանակ", type: "number", required: true },
];

export default function RoomsPage() {
  const data = useData();
  const { can } = useAuth();
  const canEdit = can("makeSchedule") || can("editData");
  const [editing, setEditing] = useState(null);

  const save = (values) => {
    if (editing.id) updateItem("rooms", editing.id, values);
    else addItem("rooms", { id: newId("r"), ...values });
    setEditing(null);
  };

  const remove = (room) => {
    if (confirm(`Ջնջե՞լ ${room.name} լսարանը։`)) removeItem("rooms", room.id);
  };

  const columns = [
    { key: "name", label: "Լսարան" },
    { key: "capacity", label: "Տեղերի քանակ", className: "num" },
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
        title="Դասասենյակներ"
        subtitle="Քննատախտակը լսարաններ է ընտրում այս ցանկից՝ ըստ տեղերի քանակի"
        actions={
          canEdit && (
            <button type="button" className="btn btn--primary" onClick={() => setEditing({})}>
              <PlusIcon /> Ավելացնել լսարան
            </button>
          )
        }
      />

      <section className="card card--flush card--narrow">
        <DataTable columns={columns} rows={data.rooms} />
      </section>

      {editing && (
        <FormModal
          title={editing.id ? "Խմբագրել լսարանը" : "Նոր լսարան"}
          fields={FIELDS}
          initialValues={editing}
          onSubmit={save}
          onClose={() => setEditing(null)}
        />
      )}
    </>
  );
}
