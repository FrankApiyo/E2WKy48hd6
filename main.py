from fastapi import FastAPI, Form, Depends, HTTPException
from sqlalchemy.orm import Session
from models import User, Note
from auth import get_db, authenticate_user, oauth2_scheme, create_hardcoded_users
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins
    allow_credentials=True,
    allow_methods=["*"],  # Allow all HTTP methods
    allow_headers=["*"],  # Allow all headers
)


# Login endpoint
@app.post("/token")
def login(
    username: str = Form(...), password: str = Form(...), db: Session = Depends(get_db)
):
    user = authenticate_user(db, username, password)
    if not user:
        raise HTTPException(status_code=400, detail="Incorrect username or password")
    return {"access_token": user.username, "token_type": "bearer"}


def get_current_user(
    token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)
) -> User:
    # Assuming the token is just the username for now
    username = token

    # Fetch the user from the database
    user = db.query(User).filter(User.username == username).first()

    if not user:
        raise HTTPException(
            status_code=401,
            detail="Invalid authentication credentials",
        )

    return user


# CRUD endpoints for notes
@app.get("/notes")
def get_notes(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    # Fetch the user from the database
    user = get_current_user(token, db)

    # Query notes using the user's ID
    notes = db.query(Note).filter(Note.user_id == user.id).all()
    return notes


@app.post("/notes")
def create_note(
    title: str = Form(...),
    content: str = Form(...),
    pinned: bool = Form(False),
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db),
):
    user = get_current_user(token, db)
    note = Note(title=title, content=content, pinned=pinned, user_id=user.id)
    db.add(note)
    db.commit()
    return note


@app.put("/notes/{note_id}")
def update_note(
    note_id: int,
    title: str = Form(...),
    content: str = Form(...),
    pinned: bool = Form(...),
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db),
):
    user = get_current_user(token, db)
    note = db.query(Note).filter(Note.id == note_id, Note.user_id == user.id).first()
    if not note:
        raise HTTPException(status_code=404, detail="Note not found")

    note.title = title
    note.content = content
    note.pinned = pinned
    db.commit()

    return note


@app.delete("/notes/{note_id}")
def delete_note(
    note_id: int, token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)
):
    user = get_current_user(token, db)
    note = db.query(Note).filter(Note.id == note_id, Note.user_id == user.id).first()

    if not note:
        raise HTTPException(status_code=404, detail="Note not found")

    db.delete(note)
    db.commit()

    return {"message": "Note deleted"}


# Create hardcoded users on app startup
@app.on_event("startup")
def startup_event():
    db = next(get_db())
    create_hardcoded_users(db)
