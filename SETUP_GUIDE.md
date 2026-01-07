# TaskFlow - Phase II Setup Guide

Complete setup and testing guide for the full-stack Todo application with database persistence.

---

## 📋 Prerequisites

Before starting, ensure you have:

- **Node.js** 18+ and npm installed
- **Python** 3.13+ installed
- **Git** installed
- A **Neon PostgreSQL** account (free tier works fine)
  - Sign up at: https://neon.tech

---

## 🗄️ Part 1: Database Setup (Neon PostgreSQL)

### Step 1: Create Neon Database

1. Go to https://console.neon.tech
2. Create a new project (e.g., "TaskFlow")
3. Copy your connection string - it will look like:
   ```
   postgresql://user:password@ep-xxx-xxx.region.aws.neon.tech/neondb?sslmode=require
   ```
4. Keep this connection string - you'll need it in the next step

---

## 🔧 Part 2: Backend Setup (FastAPI)

### Step 1: Navigate to Backend Directory

```bash
cd backend
```

### Step 2: Create Python Virtual Environment

**Windows (PowerShell):**
```powershell
python -m venv venv
.\venv\Scripts\Activate.ps1
```

**Windows (CMD):**
```cmd
python -m venv venv
venv\Scripts\activate.bat
```

**macOS/Linux:**
```bash
python -m venv venv
source venv/bin/activate
```

### Step 3: Install Dependencies

```bash
pip install -r requirements.txt
```

If `requirements.txt` doesn't exist, install manually:
```bash
pip install fastapi uvicorn sqlmodel psycopg2-binary python-dotenv bcrypt pydantic[email]
```

### Step 4: Configure Environment Variables

Create a `.env` file in the `backend` directory:

```bash
# Copy from example
cp .env.example .env
```

Or create manually with this content:

**backend/.env**
```env
# Neon PostgreSQL Configuration (REQUIRED)
NEON_DATABASE_URL=postgresql://user:password@ep-xxx-xxx.region.aws.neon.tech/neondb?sslmode=require

# API Configuration
API_HOST=0.0.0.0
API_PORT=8000
API_RELOAD=true

# CORS Configuration (Frontend URL)
CORS_ORIGINS=http://localhost:3000,http://127.0.0.1:3000

# JWT Configuration (Change in production!)
SECRET_KEY=your-super-secret-key-change-this-in-production-min-32-chars
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
```

**⚠️ IMPORTANT:** Replace `NEON_DATABASE_URL` with your actual Neon connection string from Part 1!

### Step 5: Verify Backend Installation

```bash
# Should show installed packages
pip list
```

---

## 🎨 Part 3: Frontend Setup (Next.js)

### Step 1: Navigate to Frontend Directory

```bash
cd ../frontend
```

### Step 2: Install Dependencies

```bash
npm install
```

### Step 3: Configure Environment Variables

Create a `.env.local` file in the `frontend` directory:

**frontend/.env.local**
```env
# Backend API URL
NEXT_PUBLIC_API_URL=http://localhost:8000
```

### Step 4: Verify Frontend Installation

```bash
# Should show Next.js, React, and dependencies
npm list --depth=0
```

---

## 🚀 Part 4: Running the Application

You'll need **TWO terminal windows** - one for backend, one for frontend.

### Terminal 1: Run Backend Server

```bash
# Navigate to backend directory
cd backend

# Activate virtual environment (if not already active)
# Windows PowerShell:
.\venv\Scripts\Activate.ps1
# macOS/Linux:
source venv/bin/activate

# Run FastAPI server
uvicorn src.main:app --reload --host 0.0.0.0 --port 8000
```

**Expected Output:**
```
INFO:     Uvicorn running on http://0.0.0.0:8000 (Press CTRL+C to quit)
INFO:     Started reloader process [xxxxx] using WatchFiles
INFO:     Started server process [xxxxx]
INFO:     Waiting for application startup.
INFO:     Application startup complete.
```

**Backend is ready when you see:**
- ✅ Server running on http://0.0.0.0:8000
- ✅ No error messages about database connection

**Test Backend API:**
Open browser to http://localhost:8000/docs to see Swagger API documentation.

### Terminal 2: Run Frontend Server

```bash
# Navigate to frontend directory
cd frontend

# Run Next.js development server
npm run dev
```

**Expected Output:**
```
   ▲ Next.js 15.5.9
   - Local:        http://localhost:3000
   - Environments: .env.local

 ✓ Starting...
 ✓ Ready in 2.5s
```

**Frontend is ready when you see:**
- ✅ Ready in X.Xs
- ✅ Local: http://localhost:3000

---

## 🧪 Part 5: Testing the Application

### Test 1: Guest Mode (In-Memory Storage)

1. Open browser to http://localhost:3000
2. Click **"View Dashboard"** button
3. You should see:
   - ✅ "Welcome, Guest"
   - ✅ Message: "Tasks will be cleared on refresh"
   - ✅ Task analytics showing 0/0/0
4. Create a new task:
   - Title: "Test Guest Task"
   - Description: "This should disappear on refresh"
   - Click "Add Task"
5. ✅ Task should appear in the list
6. **Refresh the page (F5)**
7. ✅ Task should be GONE (this confirms in-memory storage works)

---

### Test 2: User Signup & Authentication

1. Go to http://localhost:3000
2. Click **"Start Free"** button
3. You should land on the signup page
4. Fill in the form:
   - Name: `Test User`
   - Email: `test@example.com`
   - Password: `password123`
   - Confirm Password: `password123`
5. Click **"Create Account"**
6. ✅ Should redirect to dashboard
7. Check the welcome message:
   - ✅ Should say "Welcome, Test" or "Welcome, test"
   - ✅ Message: "Your tasks are saved securely in the database"

---

### Test 3: Database-Backed Task Persistence

1. **While logged in**, create a task:
   - Title: "Database Task 1"
   - Description: "This should persist after refresh"
   - Click "Add Task"
2. ✅ Task should appear
3. Create another task:
   - Title: "Complete Me"
   - Description: "I'll be marked as done"
4. ✅ Click the checkbox to mark "Complete Me" as done
5. Check analytics:
   - ✅ Total: 2
   - ✅ Active: 1
   - ✅ Completed: 1
6. **Refresh the page (F5)**
7. ✅ Both tasks should STILL BE THERE (database persistence works!)
8. ✅ "Complete Me" should still be checked

---

### Test 4: Task Operations (CRUD)

**Update Task:**
1. Click the **Edit** button (pencil icon) on "Database Task 1"
2. Change title to "Updated Database Task"
3. Change description to "I was edited"
4. Click "Save"
5. ✅ Changes should be saved

**Delete Task:**
1. Click the **Delete** button (trash icon) on "Complete Me"
2. ✅ Confirmation modal should appear
3. Click "Delete"
4. ✅ Task should be removed
5. Check analytics:
   - ✅ Total: 1
   - ✅ Active: 1
   - ✅ Completed: 0

**Filter Tasks:**
1. Create 2 more tasks (1 completed, 1 active)
2. Click **"Active"** tab
   - ✅ Should show only pending tasks
3. Click **"Completed"** tab
   - ✅ Should show only completed tasks
4. Click **"All"** tab
   - ✅ Should show all tasks

---

### Test 5: Logout & Login

**Logout:**
1. Click **"Logout"** in top navigation
2. ✅ Should redirect to homepage
3. Click **"View Dashboard"**
4. ✅ Should see "Welcome, Guest" (logged out state)
5. ✅ Previously created tasks should NOT be visible (different user context)

**Login:**
1. Go to http://localhost:3000
2. Click **"Start Free"** → then click **"Sign in"** at bottom
3. Login with:
   - Email: `test@example.com`
   - Password: `password123`
4. ✅ Should redirect to dashboard
5. ✅ Should see "Welcome, Test"
6. ✅ Your tasks from Test 3 should be BACK (database persistence across sessions!)

---

## 🔍 Part 6: Verify Database Records

### Option 1: Neon Console

1. Go to https://console.neon.tech
2. Select your project
3. Go to **SQL Editor**
4. Run:
   ```sql
   SELECT * FROM users;
   SELECT * FROM tasks;
   ```
5. ✅ You should see your user and tasks in the database

### Option 2: FastAPI Swagger UI

1. Go to http://localhost:8000/docs
2. Expand **POST /api/auth/login**
3. Click "Try it out"
4. Enter credentials and execute
5. ✅ Should return user data with ID

---

## 📊 Expected Behavior Summary

| Scenario | Expected Behavior |
|----------|-------------------|
| **Guest User** | Tasks stored in-memory only, cleared on refresh |
| **Authenticated User** | Tasks persisted to Neon DB, survive refresh/logout/login |
| **After Signup** | Automatically logged in, redirected to dashboard |
| **After Login** | Previous tasks loaded from database |
| **After Logout** | Redirected to home, can still use dashboard as guest |
| **Task CRUD** | All operations (Create, Read, Update, Delete, Toggle) work for both modes |
| **Analytics** | Real-time counts update as tasks change |

---

## 🐛 Troubleshooting

### Backend Issues

**Error: "DATABASE_URL must be set"**
- ✅ Check `backend/.env` file exists
- ✅ Verify `NEON_DATABASE_URL` is set correctly
- ✅ Ensure no extra spaces in the connection string

**Error: "connection refused" or "could not connect to server"**
- ✅ Check your Neon database is active (not paused)
- ✅ Verify the connection string has `?sslmode=require` at the end
- ✅ Check your internet connection

**Error: "ModuleNotFoundError"**
- ✅ Ensure virtual environment is activated
- ✅ Run `pip install -r requirements.txt` again

**Port 8000 already in use:**
```bash
# Windows
netstat -ano | findstr :8000
taskkill /PID <PID> /F

# macOS/Linux
lsof -ti:8000 | xargs kill -9
```

### Frontend Issues

**Error: "NEXT_PUBLIC_API_URL is not defined"**
- ✅ Check `frontend/.env.local` exists
- ✅ Restart the dev server after creating `.env.local`

**Error: "fetch failed" or "Network error"**
- ✅ Ensure backend is running on http://localhost:8000
- ✅ Check CORS settings in backend `.env`
- ✅ Verify `NEXT_PUBLIC_API_URL=http://localhost:8000` (no trailing slash)

**Login/Signup not working:**
- ✅ Open browser DevTools (F12) → Console tab
- ✅ Check for error messages
- ✅ Verify backend is responding at http://localhost:8000/docs

**Port 3000 already in use:**
```bash
# The dev server will automatically suggest port 3001
# Or kill the process:

# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# macOS/Linux
lsof -ti:3000 | xargs kill -9
```

### Database Issues

**Tables not created:**
```bash
# Backend automatically creates tables on startup
# If tables missing, restart backend server

cd backend
uvicorn src.main:app --reload
```

**Can't see tasks after refresh:**
- ✅ Check you're logged in (should see "Welcome, <name>")
- ✅ Check browser console for API errors
- ✅ Verify backend logs show successful GET /api/tasks requests

---

## 🎯 Quick Start (TL;DR)

```bash
# Terminal 1: Backend
cd backend
python -m venv venv
.\venv\Scripts\Activate.ps1  # Windows PowerShell
source venv/bin/activate      # macOS/Linux
pip install -r requirements.txt
# Create .env with NEON_DATABASE_URL
uvicorn src.main:app --reload --host 0.0.0.0 --port 8000

# Terminal 2: Frontend
cd frontend
npm install
# Create .env.local with NEXT_PUBLIC_API_URL=http://localhost:8000
npm run dev

# Open: http://localhost:3000
```

---

## ✅ Success Checklist

- [ ] Backend running on http://localhost:8000
- [ ] Backend API docs accessible at http://localhost:8000/docs
- [ ] Frontend running on http://localhost:3000
- [ ] Can signup with new account
- [ ] Can login with existing account
- [ ] Guest mode works (tasks cleared on refresh)
- [ ] Authenticated mode works (tasks persist on refresh)
- [ ] Can create tasks
- [ ] Can edit tasks
- [ ] Can delete tasks
- [ ] Can toggle task completion
- [ ] Analytics update correctly
- [ ] Can logout and login again
- [ ] Tasks survive logout/login cycle

---

## 📞 Support

If you encounter issues not covered here:

1. Check browser DevTools Console (F12)
2. Check backend terminal for error logs
3. Verify all environment variables are set correctly
4. Ensure database connection string is valid
5. Try restarting both backend and frontend servers

---

## 🎉 Congratulations!

If all tests pass, you've successfully set up and deployed Phase II of the TaskFlow application with:

- ✅ Full-stack Next.js + FastAPI architecture
- ✅ Neon PostgreSQL database integration
- ✅ Better Auth authentication system
- ✅ Hybrid storage (in-memory for guests, database for users)
- ✅ Professional UI with analytics dashboard
- ✅ Complete CRUD operations

**Ready for Phase III: AI-Powered Chatbot!** 🚀
