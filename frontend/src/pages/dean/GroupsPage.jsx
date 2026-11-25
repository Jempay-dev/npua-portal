import { useState } from "react";
import { useNavigate } from "react-router-dom";
import PageHeader from "../../components/ui/PageHeader.jsx";
import FormModal from "../../components/ui/FormModal.jsx";
import { FilterBar, SearchBox, Segmented, SelectFilter } from "../../components/ui/Filters.jsx";
import { CalendarIcon, EditIcon, GroupIcon, PlusIcon } from "../../components/ui/Icons.jsx";
import { useAuth } from "../../context/AuthContext.jsx";
import { addItem, newId, updateItem, useData } from "../../data/store.js";
import { byId, specialtyOf, studentsOfGroup } from "../../data/queries.js";
import { CURRENT_TERM, CURRENT_YEAR, LEVELS, SPECIALTIES } from "../../data/constants.js";
import { courseLabel, groupCourse, semesterKey } from "../../utils/semester.js";
import { matches } from "../../utils/format.js";

const CURRENT = semesterKey(CURRENT_YEAR, CURRENT_TERM);

// Card header color per specialty (falls back to blue).
const SPECIALTY_COLORS = { sp1: "blue", sp2: "green", sp3: "purple" };

export default function GroupsPage() {
  const navigate = useNavigate();
  const data = useData();
  const { can } = useAuth();
  const canEdit = can("editData");

  const [search, setSearch] = useState("");
  const [specialtyId, setSpecialtyId] = useState("");
  const [level, setLevel] = useState("");
  const [course, setCourse] = useState("");
  const [editing, setEditing] = useState(null);

  const groups = data.groups.filter(
    (g) =>
      matches(g.code, search) &&
      (!specialtyId || g.specialtyId === specialtyId) &&
      (!level || g.level === level) &&
      (!course || groupCourse(g, CURRENT_YEAR) === Number(course))
  );

  const fields = [
    { name: "code", label: "Խմբի կոդ", required: true },
    {
      name: "specialtyId",
      label: "Մասնագիտություն",
      type: "select",
      required: true,
      full: true,
      options: SPECIALTIES.map((s) => ({ value: s.id, label: s.name })),
    },
    { name: "admissionYear", label: "Ընդունման տարի", type: "number", required: true },
  ];

  const save = (values) => {
    const group = { ...values, level: SPECIALTIES.find((s) => s.id === values.specialtyId).level, departmentId: "d1" };
    if (editing.id) updateItem("groups", editing.id, group);
    else addItem("groups", { id: newId("g"), ...group });
    setEditing(null);
  };

  const openStudents = (group) => navigate(`/students?group=${group.id}`);

  const clearFilters = () => {
    setSearch("");
    setSpecialtyId("");
    setLevel("");
    setCourse("");
  };

  return (
    <>
      <PageHeader
        title="Խմբեր"
        subtitle={`${groups.length} խումբ`}
        actions={
          canEdit && (
            <button type="button" className="btn btn--primary" onClick={() => setEditing({ admissionYear: Number(CURRENT_YEAR.slice(0, 4)) })}>
              <PlusIcon /> Ավելացնել խումբ
            </button>
          )
        }
      />

      <FilterBar>
        <SearchBox value={search} onChange={setSearch} placeholder="Որոնել ըստ խմբի կոդի (օր.՝ SS-211)" />
        <div className="filter-row">
          <SelectFilter
            label="Մասնագիտություն"
            value={specialtyId}
            onChange={setSpecialtyId}
            allLabel="Բոլոր մասնագիտությունները"
            options={SPECIALTIES.map((s) => ({ value: s.id, label: s.name }))}
          />
        </div>
        <div className="filter-row filter-row--end">
          <Segmented
            label="Աստիճան"
            value={level}
            onChange={setLevel}
            options={[{ value: "", label: "Բոլորը" }, ...Object.entries(LEVELS).map(([value, l]) => ({ value, label: l.label }))]}
          />
          <Segmented
            label="Կուրս"
            value={course}
            onChange={setCourse}
            options={[{ value: "", label: "Բոլորը" }, ...[1, 2, 3, 4].map((c) => ({ value: String(c), label: courseLabel(c).replace(" կուրս", "") }))]}
          />
          <button type="button" className="link-btn" onClick={clearFilters}>
            Մաքրել զտիչները
          </button>
        </div>
      </FilterBar>

      <div className="group-grid">
        {groups.map((g) => {
          const specialty = specialtyOf(g);
          const subjectCount = data.assignments.filter((a) => a.groupId === g.id && a.semester === CURRENT).length;
          return (
            // The whole card opens the group's students.
            <article
              key={g.id}
              className="group-card"
              role="link"
              tabIndex={0}
              onClick={() => openStudents(g)}
              onKeyDown={(e) => e.key === "Enter" && openStudents(g)}
            >
              <header className={`group-card__head group-card__head--${SPECIALTY_COLORS[g.specialtyId] ?? "blue"}`}>
                <h2 className="group-card__code">{g.code}</h2>
                <p className="group-card__specialty">{specialty?.name}</p>
              </header>
              <div className="group-card__body">
                <p className="group-card__department">{byId(data.departments, g.departmentId)?.name}</p>
                <div className="chips">
                  <span className="chip">{courseLabel(groupCourse(g, CURRENT_YEAR))}</span>
                  <span className="chip">{LEVELS[g.level].label}</span>
                  <span className="chip">Ընդ. {g.admissionYear}</span>
                </div>
              </div>
              <footer className="group-card__foot">
                <span>
                  <GroupIcon size={16} /> {studentsOfGroup(data, g.id).length} ուսանող
                </span>
                <span>
                  <CalendarIcon size={16} /> {subjectCount} առարկա
                </span>
                {canEdit && (
                  <button
                    type="button"
                    className="icon-btn"
                    title="Խմբագրել"
                    onClick={(e) => {
                      e.stopPropagation(); // don't also open the students list
                      setEditing(g);
                    }}
                    onKeyDown={(e) => e.stopPropagation()}
                  >
                    <EditIcon size={16} />
                  </button>
                )}
              </footer>
            </article>
          );
        })}
      </div>

      {groups.length === 0 && <p className="empty">Խմբեր չեն գտնվել</p>}

      {editing && (
        <FormModal
          title={editing.id ? "Խմբագրել խումբը" : "Նոր խումբ"}
          fields={fields}
          initialValues={editing}
          onSubmit={save}
          onClose={() => setEditing(null)}
        />
      )}
    </>
  );
}
