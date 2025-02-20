from passlib.context import CryptContext
from fastapi.security import OAuth2PasswordBearer
from fastapi import Depends, HTTPException, status
from sqlalchemy.orm import Session
from models import SessionLocal, User

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)


def get_user(db: Session, username: str):
    return db.query(User).filter(User.username == username).first()


def authenticate_user(db: Session, username: str, password: str):
    user = get_user(db, username)
    if not user or not verify_password(password, user.hashed_password):
        return False
    return user


# Hardcoded users for this exercise


def create_hardcoded_users(db: Session):
    users = [
        {"username": "user1", "password": "password1"},
        {"username": "user2", "password": "password2"},
    ]
    for user_data in users:
        # Check if the user already exists
        existing_user = get_user(db, user_data["username"])
        if existing_user:
            print(f"User '{user_data['username']}' already exists. Skipping creation.")
            continue

        # Create new user if not already present
        hashed_password = pwd_context.hash(user_data["password"])
        db_user = User(username=user_data["username"], hashed_password=hashed_password)
        db.add(db_user)

    db.commit()
