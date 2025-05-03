from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Text, Boolean, Float
from sqlalchemy.orm import relationship
from app.core.database import Base
from datetime import datetime

class ChatSession(Base):
    __tablename__ = "chat_sessions"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    started_at = Column(String)  # ISO format datetime
    ended_at = Column(String)  # ISO format datetime
    sentiment_score = Column(String)  # Will store JSON with sentiment analysis
    risk_level = Column(String)  # low, medium, high
    messages = relationship("ChatMessage", back_populates="session") # relationship to ChatMessage
    summary = relationship("SessionSummary", back_populates="session", uselist=False)
    is_active = Column(Boolean, default=True) # if the session is active
    created_at = Column(DateTime, default=datetime.utcnow) # datetime of creation
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow) # datetime of last update

class ChatMessage(Base):
    __tablename__ = "chat_messages"

    id = Column(Integer, primary_key=True, index=True)
    session_id = Column(Integer, ForeignKey("chat_sessions.id"))
    content = Column(Text)
    is_user = Column(Boolean)  # True if message is from user, False if from AI
    timestamp = Column(String)  # ISO format datetime
    sentiment = Column(String)  # positive, negative, neutral
    session = relationship("ChatSession", back_populates="messages") 
    created_at = Column(DateTime, default=datetime.utcnow) # datetime of creation
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow) # datetime of last update

class SessionSummary(Base):
    __tablename__ = "session_summaries"
    
    id = Column(Integer, primary_key=True, index=True)
    session_id = Column(Integer, ForeignKey("chat_sessions.id"))
    overall_sentiment = Column(String)
    risk_level = Column(String)
    key_topics = Column(String)  # Store as JSON
    suggestions = Column(String)  # Store as JSON
    progress_observations = Column(String)  # Store as JSON
    message_count = Column(Integer)
    duration_minutes = Column(Float)
    summary_text = Column(Text)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    session = relationship("ChatSession", back_populates="summary")
