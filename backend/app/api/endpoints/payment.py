from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
import mercadopago
from app.core.database import get_db
from app.core.security import get_current_user
from app.models.user import User
import os

from app.models.session_bundle import SessionBundle

router = APIRouter()
sdk = mercadopago.SDK(os.getenv("MERCADOPAGO_ACCESS_TOKEN"))

@router.post("/create")
async def create_payment(
    bundle_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Get session price from your predefined prices
    bundle = db.query(SessionBundle).filter(
        SessionBundle.id == bundle_id,
        SessionBundle.is_active == True
    ).first()
    
    if not bundle:
        raise HTTPException(status_code=400, detail="Invalid bundle ID or bundle not active")

    preference_data = {
        "items": [
            {
                "id": str(bundle.id),
                "title": f"Pacote com {bundle.quantity} {bundle.quantity == 1 and 'sessão' or 'sessões'}",
                "quantity": 1,
                "currency_id": "BRL",
                "unit_price": float(bundle.price),
                "description": "Sessões de terapia online", # Add item description,
                "category_id": "therapy_sessions"  # Add category
            }
        ],
        "payer": {
            "name": current_user.name,
            "email": current_user.email,
        },
        "auto_return": "all",
        "back_urls": {
            "success": f"{os.getenv('FRONTEND_URL')}/",
            "failure": f"{os.getenv('FRONTEND_URL')}/buy-sessions",
            "pending": f"{os.getenv('FRONTEND_URL')}/payment/pending"
        },
        "notification_url": f"https://lumen-api-production.up.railway.app/api/payment/webhook",
        "metadata": {
            "user_id": current_user.id,
            "session_quantity": bundle.quantity
        },
    }

    preference_response = sdk.preference().create(preference_data)
    preference = preference_response["response"]

    if "init_point" not in preference:
        raise HTTPException(status_code=500, detail="Failed to create payment preference")
    
    return {
        "id": preference["id"],
        "init_point": preference["init_point"]
    }

@router.post("/webhook")
async def handle_webhook(
    data: dict,
    db: Session = Depends(get_db)
):
    if "topic" in data:
        if data["topic"] == "merchant_order":
            # Handle payment events
            return {"status": "success"}
        else:
            raise HTTPException(status_code=400, detail="Invalid topic")

    if data["type"] == "payment" and data["action"] == "payment.created":
        payment = sdk.payment().get(data["data"]["id"])
        payment_info = payment["response"]

        if payment_info["status"] == "approved":
            user_id = payment_info["metadata"]["user_id"]
            session_quantity = payment_info["metadata"]["session_quantity"]
            
            user = db.query(User).filter(User.id == user_id).first()
            if user:
                user.available_sessions += session_quantity
                db.commit()
    
    return {"status": "success"}