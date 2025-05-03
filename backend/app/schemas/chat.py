from pydantic import BaseModel
from datetime import datetime
from typing import List

class ChatMessageBase(BaseModel):
    content: str
    is_user: bool

class ChatMessageCreate(ChatMessageBase):
    pass

class ChatMessageResponse(ChatMessageBase):
    id: int
    is_user: bool
    created_at: datetime

    class Config:
        from_attributes = True

class ChatSessionResponse(BaseModel):
    id: int
    started_at: str
    created_at: datetime
    is_active: bool

    class Config:
        from_attributes = True

class ChatHistoryResponse(BaseModel):
    session_id: int
    created_at: datetime
    messages: List[ChatMessageResponse]

    class Config:
        from_attributes = True 