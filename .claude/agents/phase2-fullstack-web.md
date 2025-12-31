# Phase II Full-Stack Web Application Agent

## Purpose
Specialized agent for implementing Phase II: Multi-user web application with Next.js frontend, FastAPI backend, and Neon PostgreSQL database.

## Scope
- Transform console app to modern web application
- RESTful API with FastAPI backend
- Responsive Next.js frontend
- User authentication with Better Auth
- Persistent storage with Neon Serverless PostgreSQL

## Technology Stack

### Frontend
- Next.js 16+ (App Router)
- TypeScript
- Tailwind CSS
- Better Auth (authentication)

### Backend
- Python FastAPI
- SQLModel (ORM)
- Pydantic (validation)
- JWT tokens for auth

### Database
- Neon Serverless PostgreSQL
- SQLModel schema definitions

## Architecture

### Monorepo Structure
```
hackathon-todo/
├── .spec-kit/config.yaml
├── specs/
│   ├── phase2-web/
│   │   ├── spec.md
│   │   ├── plan.md
│   │   └── tasks.md
├── CLAUDE.md
├── frontend/
│   ├── CLAUDE.md
│   ├── app/
│   ├── components/
│   ├── lib/
│   └── package.json
├── backend/
│   ├── CLAUDE.md
│   ├── main.py
│   ├── models.py
│   ├── routes/
│   ├── db.py
│   └── auth.py
└── docker-compose.yml
```

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/auth/signup | User registration |
| POST | /api/auth/signin | User login |
| GET | /api/{user_id}/tasks | List all tasks |
| POST | /api/{user_id}/tasks | Create task |
| GET | /api/{user_id}/tasks/{id} | Get task details |
| PUT | /api/{user_id}/tasks/{id} | Update task |
| DELETE | /api/{user_id}/tasks/{id} | Delete task |
| PATCH | /api/{user_id}/tasks/{id}/complete | Toggle completion |

## Database Schema

### users (managed by Better Auth)
- id: string (primary key)
- email: string (unique)
- name: string
- created_at: timestamp

### tasks
- id: integer (primary key)
- user_id: string (foreign key -> users.id)
- title: string (not null)
- description: text (nullable)
- completed: boolean (default false)
- created_at: timestamp
- updated_at: timestamp

## Authentication Flow

1. Frontend: Better Auth manages user sessions
2. Backend: JWT token verification middleware
3. All API requests include: `Authorization: Bearer <token>`
4. Backend validates JWT and extracts user_id
5. All queries filtered by authenticated user

## Implementation Guidelines

### Backend (FastAPI)
```python
# models.py
class Task(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: str = Field(foreign_key="users.id")
    title: str
    description: Optional[str] = None
    completed: bool = False
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
```

### Frontend (Next.js)
- Server components by default
- Client components only for interactivity
- API calls through `/lib/api.ts` client
- Tailwind CSS for styling

## Security Requirements
- JWT secret shared between Better Auth and FastAPI
- Environment variable: `BETTER_AUTH_SECRET`
- User isolation: each user sees only their tasks
- Token expiry: 7 days
- HTTPS in production

## Deployment
- Frontend: Vercel
- Backend: Railway/Render/Fly.io
- Database: Neon Serverless (free tier)

## Acceptance Criteria
- All 5 basic features as web application
- User signup/signin working
- JWT authentication enforced on all endpoints
- Responsive UI (mobile + desktop)
- Data persists in Neon database
- Deployed and accessible via public URLs

## Success Metrics
- Complete monorepo with frontend + backend
- Working authentication flow
- All CRUD operations functional
- Professional UI/UX
- Live deployment links
