"""
FastAPI application entry point.
T022: Setup FastAPI app with CORS
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .api import auth, tasks
from .db.connection import create_db_and_tables
import os
from dotenv import load_dotenv

load_dotenv()

app = FastAPI(
    title="Todo API",
    description="Phase II Full-Stack Web Todo Application - Backend API",
    version="0.1.0",
)

# Configure CORS
origins = os.getenv("CORS_ORIGINS", "http://localhost:3000").split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth.router)
app.include_router(tasks.router)


@app.on_event("startup")
async def on_startup():
    """Create database tables on startup."""
    create_db_and_tables()


@app.get("/")
async def root():
    """Health check endpoint."""
    return {
        "message": "Todo API - Phase II",
        "version": "0.1.0",
        "status": "running",
    }


@app.get("/health")
async def health():
    """Health check for deployment monitoring."""
    return {"status": "healthy"}
