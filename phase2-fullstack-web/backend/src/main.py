"""
FastAPI application entry point.
T022: Setup FastAPI app with CORS
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .api import auth, tasks, chat
from .db.connection import create_db_and_tables
from .mcp import register_tools
import os
from dotenv import load_dotenv

load_dotenv()

app = FastAPI(
    title="Todo API",
    description="Phase II Full-Stack Web Todo Application - Backend API",
    version="0.1.0",
)

# Configure CORS
origins = [
    "http://localhost:3000",
    "http://localhost:3001",
    "http://127.0.0.1:3000",
    "http://127.0.0.1:3001",
    "http://todo.local",
]

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
app.include_router(chat.router)


@app.on_event("startup")
async def on_startup():
    """Create database tables and register MCP tools on startup."""
    create_db_and_tables()
    # Register MCP tools for Phase III AI Chatbot
    register_tools()
    print("MCP tools registered successfully")


@app.get("/")
async def root():
    """Root endpoint."""
    return {
        "message": "Todo API - Phase II",
        "version": "0.1.0",
        "status": "running",
    }


@app.get("/health")
async def health():
    """Health check for deployment monitoring."""
    return {"status": "healthy"}


@app.get("/api/health")
async def api_health():
    """Health check under /api prefix for Kubernetes ingress."""
    return {"status": "healthy"}
