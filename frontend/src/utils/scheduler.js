// Automatic exam schedule (քննատախտակ) generator.
//
// Rules:
//  1. Exams only on working days (Mon–Fri) inside the chosen period.
//  2. A group has at most one exam per day, and after an exam it rests
//     at least `gapDays` days (gap 3: exam on the 10th → next one the 14th at the earliest).
//  3. An examiner can't be in two exams at the same date + time.
//  4. A room holds one exam at a time and must have enough seats.
//
// Method (greedy): groups with the most exams go first; each exam takes the
// earliest day/time/room that breaks no rule. Exams that don't fit are returned
// in `unplaced` so the դեկանատ can widen the period or shorten the gap.

const DAY = 24 * 60 * 60 * 1000;
const toTime = (iso) => Date.parse(`${iso}T00:00:00Z`);
const toIso = (time) => new Date(time).toISOString().slice(0, 10);
export const daysBetween = (a, b) => Math.round(Math.abs(toTime(a) - toTime(b)) / DAY);
export const isWeekend = (iso) => [0, 6].includes(new Date(toTime(iso)).getUTCDay());

export function workingDays(start, end) {
  const days = [];
  for (let t = toTime(start); t <= toTime(end); t += DAY) {
    const iso = toIso(t);
    if (!isWeekend(iso)) days.push(iso);
  }
  return days;
}

/**
 * exams: [{ groupId, subjectId, examinerId, size }]
 * rooms: [{ id, capacity }]
 * settings: { start, end, gapDays, times: ["10:00", ...] }
 * → { items: [{ ...exam, date, time, roomId }], unplaced: [exam] }
 */
export function generateSchedule(exams, rooms, settings) {
  const days = workingDays(settings.start, settings.end);
  const examsPerGroup = {};
  for (const e of exams) examsPerGroup[e.groupId] = (examsPerGroup[e.groupId] ?? 0) + 1;

  const queue = [...exams].sort((a, b) => examsPerGroup[b.groupId] - examsPerGroup[a.groupId]);
  const items = [];
  const unplaced = [];

  for (const exam of queue) {
    const slot = findSlot(exam, items, days, rooms, settings);
    if (slot) items.push({ ...exam, ...slot });
    else unplaced.push(exam);
  }

  items.sort((a, b) => a.date.localeCompare(b.date) || a.time.localeCompare(b.time));
  return { items, unplaced };
}

function findSlot(exam, items, days, rooms, settings) {
  const groupDates = items.filter((i) => i.groupId === exam.groupId).map((i) => i.date);
  const fitsRooms = rooms.filter((r) => r.capacity >= exam.size).sort((a, b) => a.capacity - b.capacity);

  for (const date of days) {
    if (groupDates.some((d) => daysBetween(d, date) <= settings.gapDays)) continue;

    for (const time of settings.times) {
      const sameSlot = items.filter((i) => i.date === date && i.time === time);
      if (sameSlot.some((i) => i.examinerId === exam.examinerId)) continue;

      const room = fitsRooms.find((r) => !sameSlot.some((i) => i.roomId === r.id));
      if (room) return { date, time, roomId: room.id };
    }
  }
  return null;
}

/**
 * Checks a (possibly hand-edited) schedule.
 * Returns { [itemId]: "reason" } for every item that breaks a rule.
 */
export function findConflicts(items, rooms, settings, groupSize) {
  const problems = {};
  const flag = (item, reason) => (problems[item.id] ??= reason);

  for (const item of items) {
    if (!item.date || !item.time || !item.roomId) {
      flag(item, "Օրը, ժամը կամ լսարանը նշված չէ");
      continue;
    }
    if (isWeekend(item.date)) flag(item, "Շաբաթ / կիրակի օր");

    const room = rooms.find((r) => r.id === item.roomId);
    if (room && room.capacity < groupSize(item.groupId)) flag(item, "Լսարանում տեղերը չեն բավականացնում");

    for (const other of items) {
      if (other.id === item.id || !other.date) continue;
      const sameSlot = other.date === item.date && other.time === item.time;

      if (other.groupId === item.groupId && daysBetween(other.date, item.date) <= settings.gapDays) {
        flag(item, `Խմբի քննությունների միջև ${settings.gapDays} օրից քիչ է`);
      }
      if (sameSlot && other.roomId === item.roomId) flag(item, "Լսարանն այդ ժամին զբաղված է");
      if (sameSlot && other.examinerId === item.examinerId) flag(item, "Քննողն այդ ժամին զբաղված է");
    }
  }
  return problems;
}
