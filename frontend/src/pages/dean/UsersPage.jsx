import { useState } from "react";
import PageHeader from "../../components/ui/PageHeader.jsx";
import DataTable from "../../components/ui/DataTable.jsx";
import FormModal from "../../components/ui/FormModal.jsx";
import Modal from "../../components/ui/Modal.jsx";
import Badge from "../../components/ui/Badge.jsx";
import { FilterBar, SearchBox, SelectFilter } from "../../components/ui/Filters.jsx";
import { EditIcon, PlusIcon, TrashIcon } from "../../components/ui/Icons.jsx";
import { useAuth } from "../../context/AuthContext.jsx";
import { addItem, newId, removeItem, updateItem, useData } from "../../data/store.js";
import { byId } from "../../data/queries.js";
import { PERMISSIONS, POSITIONS, USER_TYPES } from "../../data/constants.js";
import { fullName, matches, toOptions } from "../../utils/format.js";

const randomCode = () => String(Math.floor(100000 + Math.random() * 900000));

export default function UsersPage() {
  const data = useData();
  const { user: me } = useAuth();

  const [search, setSearch] = useState("");
  const [type, setType] = useState("");
  const [departmentId, setDepartmentId] = useState("");
  const [editing, setEditing] = useState(null);
  const [codeFor, setCodeFor] = useState(null); // user whose activation code is shown

  const users = data.users.filter(
    (u) =>
      (matches(fullName(u), search) || matches(u.email, search)) &&
      (!type || u.type === type) &&
      (!departmentId || u.departmentId === departmentId)
  );

  const departmentOptions = data.departments.map((d) => ({ value: d.id, label: d.name }));

  const fields = [
    { name: "lastName", label: "Ազգանուն", required: true },
    { name: "firstName", label: "Անուն", required: true },
    { name: "middleName", label: "Հայրանուն" },
    { name: "email", label: "Էլ. հասցե", type: "email", required: true },
    { name: "type", label: "Տեսակ", type: "select", required: true, options: toOptions(USER_TYPES) },
    { name: "position", label: "Պաշտոն", type: "select", options: [...POSITIONS, "Դեկան"].map((p) => ({ value: p, label: p })) },
    {
      name: "departmentId",
      label: "Ամբիոն",
      type: "select",
      required: true,
      full: true,
      options: departmentOptions,
      hidden: (v) => v.type !== "department",
    },
    { name: "permissions", label: "Թույլտվություններ", type: "checkboxes", full: true, options: toOptions(PERMISSIONS) },
  ];

  const save = (values) => {
    const email = values.email.trim().toLowerCase();
    if (data.users.some((u) => u.email === email && u.id !== editing.id)) {
      return alert("Այս էլ. հասցեով օգտատեր արդեն կա։");
    }
    const changes = { ...values, email, departmentId: values.type === "department" ? values.departmentId : null };

    if (editing.id) {
      updateItem("users", editing.id, changes);
    } else {
      // New accounts start inactive; the person activates with the one-time code.
      const user = { id: newId("u"), ...changes, password: null, active: false, activationCode: randomCode() };
      addItem("users", user);
      setCodeFor(user);
    }
    setEditing(null);
  };

  const newCode = (user) => {
    const activationCode = randomCode();
    updateItem("users", user.id, { activationCode, active: false, password: null });
    setCodeFor({ ...user, activationCode });
  };

  const remove = (user) => {
    if (data.departments.some((d) => d.headId === user.id)) return alert("Սա ամբիոնի վարիչ է։ Նախ նշանակեք այլ վարիչ։");
    if (confirm(`Ջնջե՞լ ${fullName(user)} օգտատիրոջը։`)) removeItem("users", user.id);
  };

  const columns = [
    { key: "name", label: "Անուն Ազգանուն", className: "nowrap", render: (u) => fullName(u) },
    { key: "email", label: "Էլ. հասցե" },
    { key: "type", label: "Տեսակ", render: (u) => USER_TYPES[u.type] },
    { key: "department", label: "Ամբիոն", render: (u) => byId(data.departments, u.departmentId)?.name ?? "—" },
    { key: "position", label: "Պաշտոն" },
    {
      key: "permissions",
      label: "Թույլտվություններ",
      render: (u) => (
        <div className="chips">
          {u.permissions.map((p) => (
            <span key={p} className="chip chip--sm">
              {PERMISSIONS[p]}
            </span>
          ))}
        </div>
      ),
    },
    {
      key: "status",
      label: "Կարգավիճակ",
      render: (u) => (u.active ? <Badge tone="success">Ակտիվ</Badge> : <Badge tone="warning">Սպասում է ակտիվացման</Badge>),
    },
    {
      key: "actions",
      label: "",
      className: "table__actions",
      render: (u) => (
        <div className="row-actions">
          <button type="button" className="btn btn--ghost btn--sm" onClick={() => newCode(u)}>
            Նոր կոդ
          </button>
          <button type="button" className="icon-btn" title="Խմբագրել" onClick={() => setEditing(u)}>
            <EditIcon />
          </button>
          {u.id !== me.id && (
            <button type="button" className="icon-btn icon-btn--danger" title="Ջնջել" onClick={() => remove(u)}>
              <TrashIcon />
            </button>
          )}
        </div>
      ),
    },
  ];

  return (
    <>
      <PageHeader
        title="Օգտատերեր"
        subtitle={`${users.length} հաշիվ`}
        actions={
          <button type="button" className="btn btn--primary" onClick={() => setEditing({ type: "department", permissions: ["enterGrades", "submitSheet"] })}>
            <PlusIcon /> Նոր հաշիվ
          </button>
        }
      />

      <FilterBar>
        <SearchBox value={search} onChange={setSearch} placeholder="Որոնել ըստ անվան կամ էլ. հասցեի" />
        <div className="filter-row">
          <SelectFilter label="Տեսակ" value={type} onChange={setType} allLabel="Բոլորը" options={toOptions(USER_TYPES)} />
          <SelectFilter label="Ամբիոն" value={departmentId} onChange={setDepartmentId} allLabel="Բոլոր ամբիոնները" options={departmentOptions} />
        </div>
      </FilterBar>

      <section className="card card--flush">
        <DataTable columns={columns} rows={users} empty="Օգտատերեր չեն գտնվել" />
      </section>

      {editing && (
        <FormModal
          title={editing.id ? "Խմբագրել հաշիվը" : "Նոր հաշիվ"}
          submitLabel={editing.id ? "Պահպանել" : "Ստեղծել"}
          fields={fields}
          initialValues={editing}
          onSubmit={save}
          onClose={() => setEditing(null)}
        />
      )}

      {codeFor && (
        <Modal
          title="Ակտիվացման կոդ"
          onClose={() => setCodeFor(null)}
          footer={
            <button type="button" className="btn btn--primary" onClick={() => setCodeFor(null)}>
              Լավ
            </button>
          }
        >
          <p>
            Փոխանցեք այս կոդը <strong>{fullName(codeFor)}</strong>-ին ({codeFor.email})։ Նա այն կմուտքագրի «Ակտիվացրեք ձեր
            հաշիվը» էջում և կստեղծի իր գաղտնաբառը։
          </p>
          <p className="activation-code">{codeFor.activationCode}</p>
        </Modal>
      )}
    </>
  );
}
