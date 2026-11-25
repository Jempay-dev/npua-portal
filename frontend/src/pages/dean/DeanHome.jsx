import { Link } from "react-router-dom";
import PageHeader from "../../components/ui/PageHeader.jsx";
import DataTable from "../../components/ui/DataTable.jsx";
import { SheetStatusBadge } from "../../components/ui/Badge.jsx";
import { ArrowRightIcon } from "../../components/ui/Icons.jsx";
import { useAuth } from "../../context/AuthContext.jsx";
import { resetData, useData } from "../../data/store.js";
import { sheetDetails } from "../../data/queries.js";
import { fullName } from "../../utils/format.js";

export default function DeanHome() {
  const data = useData();
  const { user, can } = useAuth();

  const waiting = data.sheets.filter((s) => s.status === "dean_review").map((s) => sheetDetails(data, s));
  const stats = [
    { label: "Ուսանողներ", value: data.students.length, to: "/students" },
    { label: "Խմբեր", value: data.groups.length, to: "/groups" },
    { label: "Դասախոսներ", value: data.users.filter((u) => u.type === "department").length, to: "/departments" },
    { label: "Առարկաներ", value: data.subjects.length, to: "/subjects" },
  ];

  return (
    <>
      <PageHeader
        title={`Բարև, ${user.firstName}`}
        subtitle="Դեկանատի ընդհանուր պատկերը"
        actions={
          can("manageAccounts") && (
            <button
              type="button"
              className="btn btn--ghost btn--sm"
              onClick={() => confirm("Ջնջե՞լ բոլոր փոփոխությունները և վերադարձնել դեմո տվյալները։") && resetData()}
            >
              Վերականգնել դեմո տվյալները
            </button>
          )
        }
      />

      <div className="stats">
        {stats.map((s) => (
          <Link key={s.label} to={s.to} className="stat-card">
            <span className="stat-card__value">{s.value}</span>
            <span className="stat-card__label">{s.label}</span>
          </Link>
        ))}
      </div>

      <section className="card">
        <h2 className="card__title">Հաստատման սպասող տեղեկագրեր ({waiting.length})</h2>
        <DataTable
          empty="Հաստատման սպասող տեղեկագրեր չկան"
          rows={waiting.map((d) => ({ id: d.sheet.id, ...d }))}
          columns={[
            { key: "group", label: "Խումբ", render: (r) => r.group.code },
            { key: "subject", label: "Առարկա", render: (r) => r.subject.name },
            { key: "department", label: "Ամբիոն", render: (r) => r.department.name },
            { key: "responsible", label: "Պատասխանատու", render: (r) => fullName(r.responsible) },
            { key: "status", label: "Կարգավիճակ", render: (r) => <SheetStatusBadge status={r.sheet.status} /> },
            {
              key: "open",
              label: "",
              className: "table__actions",
              render: (r) => (
                <Link to={`/sheets/${r.sheet.id}`} className="btn btn--ghost btn--sm">
                  Բացել <ArrowRightIcon size={16} />
                </Link>
              ),
            },
          ]}
        />
      </section>
    </>
  );
}
