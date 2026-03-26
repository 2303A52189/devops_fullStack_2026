# 🎓 AI-Powered Smart Study Planner

A full-stack **Node.js + Express + MongoDB** web app with AI-driven study scheduling.

## ✅ Quick Start (3 Steps)

### Step 1 — Install dependencies
```bash
cd study-planner
npm install
```

### Step 2 — .env is pre-configured for local MongoDB!
The `.env` file already points to `localhost:27017` — just make sure MongoDB is running.

### Step 3 — Run the app
```bash
npm run dev
```
Open 👉 **http://localhost:3000**

---

## 🚀 First Time

1. Go to `/auth/register`
2. Select **Administrator** role (first user gets it automatically)
3. Register → Login → Dashboard!

---

## 📁 Structure

```
study-planner/
├── .env                 ✅ Pre-configured for localhost
├── app.js               Express entry point
├── ai/scheduler.js      AI engine
├── config/              DB + session config
├── controllers/         Auth, Dashboard, Planner, Profile, Users
├── middleware/          Auth guard, Multer upload
├── models/              User.js, Task.js
├── public/css/          Design system (dark theme)
├── public/js/           Frontend JS
├── routes/              auth, planner, profile, users
└── views/               EJS templates (auth, dashboard, planner, profile, users)
```

---

## 🔧 .env (already set)

```
PORT=3000
MONGODB_URI=mongodb://localhost:27017/study_planner
SESSION_SECRET=StudyPlannerSecretKey2024ChangeThisToSomethingLong
```

---

## 🆘 Troubleshooting

| Problem | Fix |
|---|---|
| MongoDB error | Ensure MongoDB service is running |
| Port in use | Change PORT in .env |
| Login not working | Already fixed via session.save() |

