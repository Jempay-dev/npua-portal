# ՀԱՊՀ ուսումնական պորտալ — Frontend

React + Vite. Front end only: all data is made up and saved in the browser
(localStorage). There is no backend yet.

## Run

```
npm install
npm run dev
```

Then open http://localhost:5173

## Demo accounts

Password for all accounts: `password123`

| Email                   | Who                                  | Sees                                        |
| ----------------------- | ------------------------------------ | ------------------------------------------- |
| `dean@polytech.am`      | Դեկանատ, all permissions             | every դեկանատ page                          |
| `secretary@polytech.am` | Դեկանատ, only "edit data"            | data pages, no schedule / accounts          |
| `head@polytech.am`      | Ամբիոնի վարիչ (ծրագրային ապ. և կիբեր.) | own subjects + "Ամբիոն" page                |
| `teacher@polytech.am`   | Teacher in the same ամբիոն           | own subjects and grade sheets               |
| `new@polytech.am`       | Not activated yet                    | use "Activate" with code `123456`           |

**Reset the demo data:** sign in as `dean@polytech.am` → "Վերականգնել դեմո տվյալները" on the home page.

## How a grade sheet (տեղեկագիր / ведомость) moves

```
draft ──teacher──▶ head_review ──վարիչ──▶ dean_review ──դեկանատ──▶ approved
          ▲              │
          └── returned ──┘
```

Only **approved** sheets count in Առաջադիմություն and in the transcript.

## Project structure

```
src/
  main.jsx, App.jsx          start-up and the list of pages (routes)
  api/auth.js                sign in / activation (mock, swap for real API later)
  context/AuthContext.jsx    who is signed in + their permissions
  data/
    constants.js             fixed lists: specialties, permissions, statuses…
    seed.js                  generates the made-up demo data
    store.js                 the in-browser "database" (read / add / update / delete)
    queries.js               helpers that join the data (sheet details, progress, transcript)
  utils/
    grading.js               score → letter → թվանիշ, ՄՈԳ, progress categories
    scheduler.js             automatic exam schedule + conflict check
    sheetRules.js            who can edit / send / approve a grade sheet
    semester.js, format.js, validation.js, exportExcel.js
  components/
    auth/                    pieces of the login screens
    layout/                  top bar, sidebar, page frame, menu
    ui/                      table, modal, form, filters, badges, icons
  pages/
    auth/                    login, activation, password reset
    dean/                    դեկանատ pages
    department/              ամբիոն pages (teacher, վարիչ)
    shared/SheetPage.jsx     the grade sheet, used by both
  styles/                    tokens → base → auth → layout → components → pages → print
```

## Things to replace later

- `utils/grading.js` → `GRADE_SCALE` is a guess; put the official table there.
- `public/brand-panel.jpg` → the login side image (cut from the mockup, has English text).
- `api/auth.js` and `data/store.js` → real backend calls.
