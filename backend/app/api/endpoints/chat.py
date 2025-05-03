from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime
import pytz
from sqlalchemy.sql import func

from app.core.database import get_db
from app.core.security import get_current_user
from app.models.user import User
from app.models.chat import ChatSession, ChatMessage
from app.schemas.chat import (
    ChatMessageCreate,
    ChatMessageResponse,
    ChatSessionResponse,
    ChatHistoryResponse
)
from app.services.chat_service import ChatService
from app.services import summary as summary_service
from fastapi.security import HTTPBearer

router = APIRouter()
chat_service = ChatService()
security = HTTPBearer()

# Set timezone to America/Sao_Paulo
tz = pytz.timezone('America/Sao_Paulo')

@router.post("/message", response_model=ChatMessageResponse, dependencies=[Depends(security)])
async def send_message(
    message: ChatMessageCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Get or create active chat session
    chat_session = db.query(ChatSession).filter(
        ChatSession.user_id == current_user.id,
        ChatSession.is_active == True
    ).first()
    
    if not chat_session:
        now = datetime.now(tz)
        chat_session = ChatSession(
            user_id=current_user.id,
            started_at=now.isoformat(),
            created_at=now
        )
        db.add(chat_session)
        db.commit()
        db.refresh(chat_session)
    else:
        # Update session timestamps
        chat_session.updated_at = datetime.now(tz)
    
    # Create user message
    user_message = ChatMessage(
        session_id=chat_session.id,
        content=message.content,
        is_user=message.is_user
    )
    db.add(user_message)
    db.commit()
    db.refresh(user_message)

    if message.is_user:
        # Get context from previous messages
        context = db.query(ChatMessage).filter(
            ChatMessage.session_id == chat_session.id
        ).order_by(ChatMessage.created_at.desc()).limit(5).all()
        
        # Get AI response
        ai_response = await chat_service.get_ai_response(message, context)
        
        # Create AI message
        ai_message = ChatMessage(
            session_id= chat_session.id,
            content= ai_response,
            is_user=False
        )
        db.add(ai_message)
        db.commit()
        db.refresh(ai_message)
        return ai_message

    return user_message

@router.get("/history", dependencies=[Depends(security)])
async def get_chat_history(
    sort_order: str = Query("desc", regex="^(asc|desc)$"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    query = db.query(ChatSession).filter(
        ChatSession.user_id == current_user.id
    )
    
    if sort_order == "desc":
        query = query.order_by(ChatSession.created_at.desc())
    else:
        query = query.order_by(ChatSession.created_at.asc())
        
    sessions = query.all()

    history = []
    for session in sessions:
        messages = db.query(ChatMessage).filter(
            ChatMessage.session_id == session.id
        ).order_by(ChatMessage.created_at).all()
        
        # Convert UTC dates to local timezone
        started_at = session.started_at
        ended_at = session.ended_at
        
        if started_at:
            started_at = datetime.fromisoformat(started_at)
        if ended_at:
            ended_at = datetime.fromisoformat(ended_at)
        
        history.append({
            "id": session.id,
            "started_at": started_at,
            "ended_at": ended_at,
            "sentiment_score": session.sentiment_score,
            "risk_level": session.risk_level,
            "messages": [
                {
                    "id": msg.id,
                    "content": msg.content,
                    "is_user": msg.is_user,
                    "timestamp": msg.created_at.replace(tzinfo=pytz.UTC).astimezone(tz).isoformat(),
                    "sentiment": msg.sentiment
                } for msg in messages
            ]
        })
    
    return {"sessions": history}

@router.get("/sessions", response_model=List[ChatSessionResponse], dependencies=[Depends(security)])
async def get_chat_sessions(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    sessions = db.query(ChatSession).filter(
        ChatSession.user_id == current_user.id
    ).all()
    return sessions

@router.post("/session/new", response_model=ChatSessionResponse)
async def create_session(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Verificar se o usuário tem sessões disponíveis
    if current_user.used_sessions >= current_user.available_sessions:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Você não tem mais sessões disponíveis. Por favor, adquira mais sessões para continuar."
        )
    
    # Verificar se já existe uma sessão ativa
    active_session = db.query(ChatSession).filter(
        ChatSession.user_id == current_user.id,
        ChatSession.is_active == True
    ).first()
    
    if active_session:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Você já tem uma sessão ativa. Por favor, finalize a sessão atual antes de iniciar uma nova."
        )
    
    # Criar nova sessão
    new_session = ChatSession(user_id=current_user.id)
    db.add(new_session)
    
    # Incrementar o contador de sessões usadas
    current_user.used_sessions += 1
    db.add(current_user)
    
    db.commit()
    db.refresh(new_session)
    
    return new_session

@router.post("/session/{session_id}/end", response_model=ChatSessionResponse)
async def end_session(
    session_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    session = db.query(ChatSession).filter(
        ChatSession.id == session_id,
        ChatSession.user_id == current_user.id
    ).first()
    
    if not session:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Sessão não encontrada"
        )
    
    if not session.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Esta sessão já está finalizada"
        )
    
    # End the session
    session.is_active = False
    session.ended_at = func.now()
    db.commit()
    db.refresh(session)
    return session

@router.get("/session/active", response_model=ChatSessionResponse)
async def get_active_session(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    session = db.query(ChatSession).filter(
        ChatSession.user_id == current_user.id,
        ChatSession.is_active == True
    ).first()
    
    if not session:
        raise HTTPException(
            status_code=404,
            detail="Nenhuma sessão ativa encontrada"
        )
    
    return session

@router.get("/session/{session_id}/messages", response_model=List[ChatMessageResponse])
async def get_session_messages(
    session_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Verificar se a sessão existe e pertence ao usuário
    session = db.query(ChatSession).filter(
        ChatSession.id == session_id,
        ChatSession.user_id == current_user.id
    ).first()
    
    if not session:
        raise HTTPException(
            status_code=404,
            detail="Sessão não encontrada"
        )
    
    # Buscar mensagens da sessão
    messages = db.query(ChatMessage).filter(
        ChatMessage.session_id == session_id
    ).order_by(ChatMessage.created_at).all()
    
    # Converter timestamps para o fuso horário local
    for message in messages:
        if message.created_at:
            message.created_at = message.created_at.replace(tzinfo=pytz.UTC).astimezone(tz)
    
    return messages

@router.post("/session/start", response_model=ChatSessionResponse, dependencies=[Depends(security)])
async def start_session(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Verificar se o usuário tem sessões disponíveis
    if current_user.used_sessions >= current_user.available_sessions:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Você não tem mais sessões disponíveis. Por favor, adquira mais sessões para continuar."
        )
    
    # Verificar se já existe uma sessão ativa
    active_session = db.query(ChatSession).filter(
        ChatSession.user_id == current_user.id,
        ChatSession.is_active == True
    ).first()
    
    if active_session:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Você já tem uma sessão ativa. Por favor, finalize a sessão atual antes de iniciar uma nova."
        )
    
    # Criar nova sessão
    now = datetime.now(tz)
    new_session = ChatSession(
        user_id=current_user.id,
        started_at=now.isoformat(),
        created_at=now,
        is_active=True
    )
    db.add(new_session)
    
    # Incrementar o contador de sessões usadas
    current_user.used_sessions += 1
    db.add(current_user)
    
    db.commit()
    db.refresh(new_session)
    
    return new_session 