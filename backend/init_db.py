from sqlalchemy import create_engine
from app.core.database import Base
from app.models.user import User
from app.models.chat import ChatSession, ChatMessage
import os
from dotenv import load_dotenv

load_dotenv()

def init_db():
    # Get database URL from environment variable or use default
    db_url = os.getenv("DATABASE_URL", "postgresql://postgres:postgres@localhost:5432/lumen")
    
    # Create engine
    engine = create_engine(db_url)
    
    # Create tables
    Base.metadata.create_all(bind=engine)
    print("Tables created successfully!")

if __name__ == "__main__":
    init_db() 