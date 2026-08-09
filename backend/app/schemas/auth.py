from pydantic import BaseModel

from app.models.user import Role


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    role: Role
    full_name: str


class CurrentUser(BaseModel):
    id: int
    email: str
    full_name: str
    role: Role

    class Config:
        from_attributes = True
