from fastapi import APIRouter
from app.api.endpoints import auth, users, chat, summary

api_router = APIRouter()
api_router.include_router(auth.router, prefix="/auth", tags=["auth"])
api_router.include_router(users.router, prefix="/users", tags=["users"])
api_router.include_router(chat.router, prefix="/chat", tags=["chat"])
api_router.include_router(summary.router, prefix="/summary", tags=["summary"]) 