import { useState } from "react";
import PageHeader from "../../components/ui/PageHeader.jsx";
import FormModal from "../../components/ui/FormModal.jsx";
import { EditIcon, PlusIcon } from "../../components/ui/Icons.jsx";
import { useAuth } from "../../context/AuthContext.jsx";
import { addItem, newId, updateItem, useData } from "../../data/store.js";
import { byId, teachersOfDepartment } from "../../data/queries.js";
import { fullName } from "../../utils/format.js";

export default function DepartmentsPage() {
  const data = useData();
  const { can } = useAuth();
  const canEdit = can("manageAccounts");
  const [editing, setEditing] = useState(null);

  const save = (values) => {
    const department = { name: values.name, headId: values.headId || null };
    if (editing.id) updateItem("departments", editing.id, department);
    else addItem("departments", { id: newId("d"), ...department });
    setEditing(null);
  };

  const fields = [
    { name: "name", label: "Անվանում", required: true, full: true },
    {
      name: "headId",
      label: "Ամբիոնի վարիչ",
      type: "select",
      full: true,
      options: editing?.id
        ? teachersOfDepartment(data, editing.id).map((t) => ({ value: t.id, label: fullName(t) }))
        : [],
      hidden: () => !editing?.id, // a new ամբիոն has no teachers yet
    },
  ];

  return (
    <>
      <PageHeader
        title="Ամբիոններ"
        subtitle={`${data.departments.length} ամբիոն`}
        actions={
          canEdit && (
            <button type="button" className="btn btn--primary" onClick={() => setEditing({})}>
              <PlusIcon /> Ավելացնել ամբիոն
            </button>
          )
        }
      />

      <div className="department-list">
        {data.departments.map((d) => {
          const teachers = teachersOfDepartment(data, d.id);
          const head = byId(data.users, d.headId);
          return (
            <article key={d.id} className="card department-card">
              <header className="department-card__head">
                <div>
                  <h2 className="card__title">{d.name}</h2>
                  <p className="muted">
                    Վարիչ՝ {head ? fullName(head) : "նշանակված չէ"} · {teachers.length} դասախոս
                  </p>
                </div>
                {canEdit && (
                  <button type="button" className="icon-btn" title="Խմբագրել" onClick={() => setEditing(d)}>
                    <EditIcon />
                  </button>
                )}
              </header>
              <ul className="people">
                {teachers.map((t) => (
                  <li key={t.id} className="people__item">
                    <span className="avatar avatar--sm">{t.firstName[0] + t.lastName[0]}</span>
                    <div>
                      <p className="people__name">{fullName(t)}</p>
                      <p className="people__meta">
                        {t.position} · {t.email}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            </article>
          );
        })}
      </div>

      {editing && (
        <FormModal
          title={editing.id ? "Խմբագրել ամբիոնը" : "Նոր ամբիոն"}
          fields={fields}
          initialValues={editing}
          onSubmit={save}
          onClose={() => setEditing(null)}
        />
      )}
    </>
  );
}
