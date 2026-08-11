from pydantic import BaseModel, EmailStr

from app.models.user import Role


class AffectationIn(BaseModel):
    filiere: str
    niveau: str


class AffectationOut(BaseModel):
    filiere: str
    niveau: str

    class Config:
        from_attributes = True


class UserOut(BaseModel):
    id: int
    email: str
    full_name: str
    role: Role
    is_active: bool
    filieres: list[str] = []
    affectations: list[AffectationOut] = []

    class Config:
        from_attributes = True


class UserCreate(BaseModel):
    email: EmailStr
    full_name: str
    role: Role
    password: str
    filieres: list[str] = []
    affectations: list[AffectationIn] = []


class UserUpdate(BaseModel):
    email: EmailStr
    full_name: str
    role: Role
    filieres: list[str] = []
    affectations: list[AffectationIn] = []
