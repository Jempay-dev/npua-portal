# ՀԱՊՀ ուսումնական պորտալ

University project: a staff portal for the դեկանատ and the ամբիոններ
(students data, grade sheets, exam schedule, academic progress).

| Folder        | What                                             |
| ------------- | ------------------------------------------------ |
| `frontend/`   | React site (see `frontend/README.md`)            |

## Run it on your computer

1. Install **Node.js LTS** from https://nodejs.org
2. Open a terminal in the `frontend` folder and run:

```
npm install
npm run dev
```

3. Open http://localhost:5173 and sign in with `dean@polytech.am` / `password123`
   (other demo accounts are listed in `frontend/README.md`).

## Demo accounts

Password for all accounts: `password123`

| Email                   | Who                                    | Sees                                        |
| ----------------------- | -------------------------------------- | ------------------------------------------- |
| `dean@polytech.am`      | Դեկանատ, all permissions               | every դեկանատ page                          |
| `secretary@polytech.am` | Դեկանատ, only "edit data"              | data pages, no schedule / accounts          |
| `head@polytech.am`      | Ամբիոնի վարիչ (ծրագրային ապ. և կիբեր.) | own subjects + "Ամբիոն" page                |
| `teacher@polytech.am`   | Teacher in the same ամբիոն             | own subjects and grade sheets               |
| `new@polytech.am`       | Not activated yet                      | use "Activate" with code `123456`           |

**Reset the demo data:** sign in as `dean@polytech.am` → "Վերականգնել դեմո տվյալները" on the home page.
