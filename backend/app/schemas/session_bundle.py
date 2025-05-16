from pydantic import BaseModel

class SessionBundleBase(BaseModel):
    quantity: int
    price: float
    description: str | None = None
    is_active: bool = True

class SessionBundleCreate(SessionBundleBase):
    pass

class SessionBundle(SessionBundleBase):
    id: int

    class Config:
        orm_mode = True