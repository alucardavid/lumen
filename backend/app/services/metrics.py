from sqlalchemy.orm import Session
from app.models.chat import ChatSession, ChatMessage
from datetime import datetime, timedelta, timezone

def calculate_session_metrics(db: Session, session_id: int) -> dict:
    session = db.query(ChatSession).filter(ChatSession.id == session_id).first()
    if not session:
        return None
    
    messages = db.query(ChatMessage).filter(ChatMessage.session_id == session_id).all()
    
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