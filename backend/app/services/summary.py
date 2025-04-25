from sqlalchemy.orm import Session
from app.models.chat import ChatSession, ChatMessage, SessionSummary
from app.schemas.summary import SessionSummaryCreate
from datetime import datetime
import json
from app.services.ai_summary import generate_session_summary, extract_key_topics
from app.services.metrics import calculate_session_metrics

def create_session_summary(db: Session, session_id: int) -> SessionSummary:
    # Get session and messages
    session = db.query(ChatSession).filter(ChatSession.id == session_id).first()
    if not session:
        return None
    
    messages = db.query(ChatMessage).filter(ChatMessage.session_id == session_id).all()
    
    # Calculate metrics
    metrics = calculate_session_metrics(db, session_id)
    
    # Generate summary using AI
    summary_text = generate_session_summary(messages, metrics)
    
    # Extract key topics using AI
    key_topics = extract_key_topics(summary_text)
    
    # Create summary object
    db_summary = SessionSummary(
        session_id=session_id,
        overall_sentiment=metrics['overall_sentiment'],
        risk_level=metrics['risk_level'] or 'low',
        key_topics=json.dumps(key_topics),
        message_count=metrics['message_count'],
        duration_minutes=metrics['duration_minutes'],
        summary_text=summary_text
    )
    
    db.add(db_summary)
    db.commit()
    db.refresh(db_summary)
    return db_summary

def get_session_summary(db: Session, session_id: int) -> SessionSummary:
    return db.query(SessionSummary).filter(SessionSummary.session_id == session_id).first()

def calculate_session_metrics(db: Session, session_id: int) -> dict:
    session = db.query(ChatSession).filter(ChatSession.id == session_id).first()
    if not session:
        return None
    
    messages = db.query(ChatMessage).filter(ChatMessage.session_id == session_id).all()
    
    # Calculate duration
    start_time = datetime.fromisoformat(session.started_at)
    end_time = datetime.fromisoformat(session.ended_at) if session.ended_at else datetime.utcnow()
    duration_minutes = (end_time - start_time).total_seconds() / 60
    
    # Count messages
    message_count = len(messages)
    
    # Get sentiment distribution
    sentiments = [msg.sentiment for msg in messages if msg.sentiment]
    sentiment_counts = {
        "positive": sentiments.count("positive"),
        "negative": sentiments.count("negative"),
        "neutral": sentiments.count("neutral")
    }
    
    # Determine overall sentiment
    if sentiment_counts["positive"] > sentiment_counts["negative"]:
        overall_sentiment = "positive"
    elif sentiment_counts["negative"] > sentiment_counts["positive"]:
        overall_sentiment = "negative"
    else:
        overall_sentiment = "neutral"
    
    return {
        "message_count": message_count,
        "duration_minutes": duration_minutes,
        "overall_sentiment": overall_sentiment,
        "risk_level": session.risk_level,
        "sentiment_distribution": sentiment_counts
    } 