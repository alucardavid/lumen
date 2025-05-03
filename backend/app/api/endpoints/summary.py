from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.core.database import get_db
from app.schemas.summary import SessionSummaryResponse
from app.services import summary as summary_service
from app.core.security import get_current_user
from app.models.user import User
from app.models.chat import ChatSession
import json

router = APIRouter()

@router.get("/sessions/{session_id}/summary", response_model=SessionSummaryResponse)
def get_summary(
    session_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Verify session exists and belongs to user
    session = db.query(ChatSession).filter(
        ChatSession.id == session_id,
        ChatSession.user_id == current_user.id
    ).first()
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    
    # Get existing summary
    db_summary = summary_service.get_session_summary(db, session_id)
    
    if not db_summary:
        raise HTTPException(status_code=404, detail="Summary not found")
    
    # Converter key_topics de JSON string para lista
    if db_summary.key_topics:
        db_summary.key_topics = json.loads(db_summary.key_topics)
    
    # Converter suggestions de JSON string para lista
    if db_summary.suggestions:
        db_summary.suggestions = json.loads(db_summary.suggestions)
    
    # Converter progress_observations de JSON string para lista
    if db_summary.progress_observations:
        db_summary.progress_observations = json.loads(db_summary.progress_observations)

    # Garantir que risk_level não seja None
    if db_summary.risk_level is None:
        db_summary.risk_level = "low"  # valor padrão
    
    return db_summary

@router.post("/sessions/{session_id}/summary", response_model=SessionSummaryResponse)
def create_summary(
    session_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Verify session exists and belongs to user
    session = db.query(ChatSession).filter(
        ChatSession.id == session_id,
        ChatSession.user_id == current_user.id
    ).first()
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    
    # Check if summary already exists
    existing_summary = summary_service.get_session_summary(db, session_id)
    if existing_summary:
        raise HTTPException(
            status_code=400,
            detail="Summary already exists for this session"
        )
    
    # Create new summary
    db_summary = summary_service.create_session_summary(db, session_id)
    if not db_summary:
        raise HTTPException(status_code=500, detail="Failed to generate summary")
    
    # Converter key_topics de JSON string para lista
    if db_summary.key_topics:
        db_summary.key_topics = json.loads(db_summary.key_topics)
    
    # Converter suggestions de JSON string para lista
    if db_summary.suggestions:
        db_summary.suggestions = json.loads(db_summary.suggestions)
    
    # Converter progress_observations de JSON string para lista
    if db_summary.progress_observations:
        db_summary.progress_observations = json.loads(db_summary.progress_observations)

    # Garantir que risk_level não seja None
    if db_summary.risk_level is None:
        db_summary.risk_level = "low"  # valor padrão
    
    return db_summary

@router.get("/sessions/{session_id}/metrics")
def get_session_metrics(
    session_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Verify session exists and belongs to user
    session = db.query(ChatSession).filter(
        ChatSession.id == session_id,
        ChatSession.user_id == current_user.id
    ).first()
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    
    metrics = summary_service.calculate_session_metrics(db, session_id)
    if not metrics:
        raise HTTPException(status_code=404, detail="Session not found")
    return metrics 