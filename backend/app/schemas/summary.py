from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

class SessionSummaryBase(BaseModel):
    session_id: int
    overall_sentiment: str
    risk_level: str
    key_topics: List[str]
    message_count: int
    duration_minutes: float
    summary_text: str
    suggestions: List[str]
    progress_observations: List[str]
    
class SessionSummaryCreate(SessionSummaryBase):
    pass

class SessionSummaryResponse(SessionSummaryBase):
    id: int
    created_at: datetime
    
    class Config:
        from_attributes = True 