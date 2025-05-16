from sqlalchemy.orm import Session
from app.models.chat import ChatSession, ChatMessage, SessionSummary
from app.schemas.summary import SessionSummaryCreate
from datetime import datetime, timezone, timedelta
import json
from app.services.ai_summary import generate_session_summary
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
    summary_data = generate_session_summary(messages, metrics)
    
    # summary_data = {
    #     "key_topics": ["Tópico 1", "Tópico 2", "Tópico 3"],
    #     "suggestions": ["Sugestão 1", "Sugestão 2", "Sugestão 3"],
    #     "progress_observations": ["Observação 1", "Observação 2", "Observação 3"],
    #     "summary_text": "Resumo detalhado da sessão, incluindo os principais pontos discutidos e conclusões"
    # }

    # Create summary object with direct assignment of fields
    db_summary = SessionSummary(
        session_id=session_id,
        overall_sentiment=metrics['overall_sentiment'],
        risk_level=metrics['risk_level'] or 'low',
        key_topics=json.dumps(summary_data.get('key_topics', [])),
        message_count=metrics['message_count'],
        duration_minutes=metrics['duration_minutes'],
        summary_text=summary_data.get('summary_text', ''),
        suggestions=json.dumps(summary_data.get('suggestions', [])),
        progress_observations=json.dumps(summary_data.get('progress_observations', []))
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
    
    try:
        # Create UTC-3 timezone
        utc_minus_3 = timezone(timedelta(hours=-3))
        
        # Parse start_time and ensure it's in UTC-3
        start_time = datetime.fromisoformat(session.started_at)
        if start_time.tzinfo is None:
            start_time = start_time.replace(tzinfo=utc_minus_3)
        else:
            start_time = start_time.astimezone(utc_minus_3)
        
        # Parse end_time and ensure it's in UTC-3
        end_time = datetime.fromisoformat(session.ended_at) if session.ended_at else datetime.now()
        if end_time.tzinfo is None:
            end_time = end_time.replace(tzinfo=utc_minus_3)
        else:
            end_time = end_time.astimezone(utc_minus_3)
        
        # Calculate duration in minutes
        duration_minutes = (end_time - start_time).total_seconds() / 60
        
    except Exception as e:
        print(f"Error calculating duration: {str(e)}")
        raise
    
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