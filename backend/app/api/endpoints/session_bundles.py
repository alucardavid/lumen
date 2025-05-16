from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.core.database import get_db
from app.core.security import get_current_user
from app.models.session_bundle import SessionBundle
from app.schemas.session_bundle import SessionBundleCreate, SessionBundle as SessionBundleSchema
from app.models.user import User

router = APIRouter()

@router.get("/", response_model=List[SessionBundleSchema])
async def list_bundles(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    bundles = db.query(SessionBundle).filter(SessionBundle.is_active == True).all()
    return bundles

@router.post("/", response_model=SessionBundleSchema)
async def create_bundle(
    bundle: SessionBundleCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # TODO: Add admin check here
    db_bundle = SessionBundle(**bundle.dict())
    db.add(db_bundle)
    db.commit()
    db.refresh(db_bundle)
    return db_bundle