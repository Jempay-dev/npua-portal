import { useState } from "react";
import PageHeader from "../../components/ui/PageHeader.jsx";
import { FilterBar, SelectFilter } from "../../components/ui/Filters.jsx";
import { DownloadIcon, WandIcon } from "../../components/ui/Icons.jsx";
import { getData, newId, setValues, useData } from "../../data/store.js";
import { byId, studentsOfGroup } from "../../data/queries.js";
import { CURRENT_TERM, CURRENT_YEAR } from "../../data/constants.js";
import { findConflicts, generateSchedule } from "../../utils/scheduler.js";
import { semesterKey, semesterLabel } from "../../utils/semester.js";
import { formatDate, fullName } from "../../utils/format.js";
import { downloadExcel } from "../../utils/exportExcel.js";

const CURRENT = semesterKey(CURRENT_YEAR, CURRENT_TERM);

export default function SchedulePage() {
  const data = useData();
  const { settings, items, unplaced = [] } = data.schedule;
  const [form, setForm] = useState({ ...settings, times: settings.times.join(", ") });
  const [groupId, setGroupId] = useState("");
  const [error, setError] = useState("");

  const groupSize = (id) => studentsOfGroup(data, id).length;
  const conflicts = findConflicts(items, data.rooms, settings, groupSize);
  const visible = items.filter((i) => !groupId || i.groupId === groupId);

  const saveSchedule = (changes) => setValues({ schedule: { ...getData().schedule, ...changes } });

  const generate = () => {
    const newSettings = {
      start: form.start,
      end: form.end,
      gapDays: Number(form.gapDays),
      times: form.times.split(",").map((t) => t.trim()).filter(Boolean),
    };
    if (!newSettings.start || !newSettings.end || newSettings.start > newSettings.end) {
      return setError("Նշեք ճիշտ ժամանակահատված։");
    }
    if (newSettings.times.length === 0) return setError("Նշեք առնվազն մեկ ժամ (օր.՝ 10:00, 15:00)։");
    if (items.length && !confirm("Ընթացիկ քննատախտակը կփոխարինվի նորով։ Շարունակե՞լ։")) return;
    setError("");

    // Every final exam of the current semester (ստուգարքները չեն մտնում).
    const exams = data.assignments
      .filter((a) => a.semester === CURRENT && byId(data.subjects, a.subjectId).type === "exam")
      .map((a) => ({ groupId: a.groupId, subjectId: a.subjectId, examinerId: a.responsibleId, size: groupSize(a.groupId) }));

    const result = generateSchedule(exams, data.rooms, newSettings);
    saveSchedule({
      settings: newSettings,
      items: result.items.map((i) => ({ id: newId("ex"), ...i })),
      unplaced: result.unplaced,
    });
  };

  const updateExam = (id, changes) =>
    saveSchedule({ items: getData().schedule.items.map((i) => (i.id === id ? { ...i, ...changes } : i)) });

  const exportToExcel = () => {
    downloadExcel(
      `Քննատախտակ_${CURRENT_YEAR}_${CURRENT_TERM}.xlsx`,
      "Քննատախտակ",
      items.map((i) => ({
        Խումբ: byId(data.groups, i.groupId)?.code,
        Առարկա: byId(data.subjects, i.subjectId)?.name,
        Օր: formatDate(i.date),
        Ժամ: i.time,
        Լսարան: byId(data.rooms, i.roomId)?.name,
        Քննող: fullName(byId(data.users, i.examinerId)),
      }))
    );
  };

  return (
    <>
      <PageHeader
        title="Քննատախտակ"
        subtitle={`${semesterLabel(CURRENT)} · եզրափակիչ քննություններ`}
        actions={
          <button type="button" className="btn btn--ghost" onClick={exportToExcel} disabled={!items.length}>
            <DownloadIcon /> Արտահանել Excel
          </button>
        }
      />

      <section className="card">
        <h2 className="card__title">Կարգավորումներ</h2>
        <div className="schedule-settings">
          <label className="form-field">
            <span className="form-label">Սկիզբ</span>
            <input className="input" type="date" value={form.start} onChange={(e) => setForm({ ...form, start: e.target.value })} />
          </label>
          <label className="form-field">
            <span className="form-label">Ավարտ</span>
            <input className="input" type="date" value={form.end} onChange={(e) => setForm({ ...form, end: e.target.value })} />
          </label>
          <label className="form-field">
            <span className="form-label">Նվազագույն ընդմիջում (օր)</span>
            <input
              className="input"
              type="number"
              min="0"
              value={form.gapDays}
              onChange={(e) => setForm({ ...form, gapDays: e.target.value })}
            />
          </label>
          <label className="form-field">
            <span className="form-label">Քննության ժամեր</span>
            <input className="input" value={form.times} onChange={(e) => setForm({ ...form, times: e.target.value })} placeholder="10:00, 15:00" />
          </label>
          <button type="button" className="btn btn--primary" onClick={generate}>
            <WandIcon /> Կազմել քննատախտակը
          </button>
        </div>
        <p className="hint-text">Շաբաթ և կիրակի օրերը բաց են թողնվում։ Խումբն օրական ունի առավելագույնը մեկ քննություն։</p>
        {error && <p className="notice notice--danger">{error}</p>}
      </section>

      {unplaced.length > 0 && (
        <div className="notice notice--warning">
          {unplaced.length} քննություն չտեղավորվեց ժամանակահատվածում․{" "}
          {unplaced.map((e) => `${byId(data.groups, e.groupId)?.code} · ${byId(data.subjects, e.subjectId)?.name}`).join("; ")}։
          Երկարացրեք ժամանակահատվածը կամ փոքրացրեք ընդմիջումը։
        </div>
      )}

      {items.length > 0 && (
        <>
          <FilterBar>
            <div className="filter-row">
              <SelectFilter
                label="Խումբ"
                value={groupId}
                onChange={setGroupId}
                allLabel="Բոլոր խմբերը"
                options={data.groups.map((g) => ({ value: g.id, label: g.code }))}
              />
            </div>
          </FilterBar>

          <section className="card card--flush">
            <div className="table-wrap">
              <table className="table schedule-table">
                <thead>
                  <tr>
                    <th>Խումբ</th>
                    <th>Առարկա</th>
                    <th>Օր</th>
                    <th>Ժամ</th>
                    <th>Լսարան</th>
                    <th>Քննող</th>
                  </tr>
                </thead>
                <tbody>
                  {visible.map((item) => (
                    <tr key={item.id} className={conflicts[item.id] ? "is-conflict" : undefined}>
                      <td className="nowrap">{byId(data.groups, item.groupId)?.code}</td>
                      <td>
                        {byId(data.subjects, item.subjectId)?.name}
                        {conflicts[item.id] && <span className="conflict-text">{conflicts[item.id]}</span>}
                      </td>
                      <td>
                        <input
                          type="date"
                          className="input input--sm"
                          value={item.date}
                          onChange={(e) => updateExam(item.id, { date: e.target.value })}
                          aria-label="Օր"
                        />
                      </td>
                      <td>
                        <select className="input input--sm" value={item.time} onChange={(e) => updateExam(item.id, { time: e.target.value })} aria-label="Ժամ">
                          {[...new Set([...settings.times, item.time])].map((t) => (
                            <option key={t}>{t}</option>
                          ))}
                        </select>
                      </td>
                      <td>
                        <select className="input input--sm" value={item.roomId} onChange={(e) => updateExam(item.id, { roomId: e.target.value })} aria-label="Լսարան">
                          {data.rooms.map((r) => (
                            <option key={r.id} value={r.id}>
                              {r.name} ({r.capacity} տեղ)
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="nowrap">{fullName(byId(data.users, item.examinerId))}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </>
      )}

      {items.length === 0 && <p className="empty">Քննատախտակը դեռ կազմված չէ։ Լրացրեք կարգավորումները և սեղմեք «Կազմել»։</p>}
    </>
  );
}
