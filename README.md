# Link to loom
- https://www.loom.com/share/f3ad179615714a7ea3ebe67e8cfe841d?sid=4b2f241c-7332-4dde-82d6-0dd6293c920b

# How to run the app
- Run the db with docker: `docker compose up -d`
- Install dependencies in a virtual env created with pyenv
  ```bash
  # Create a virtual environment using pyenv
  pyenv virtualenv 3.11.5 notes-app-env

  # Activate the virtual environment
  pyenv activate notes-app-env

  # Make sure you're in the project directory with requirements.txt
  pip install -r requirements.txt
  ```
- Run the backend API with: `uvicorn main:app --reload`
- Install front-end dependencies: `npm install`
- Run the front-end `npm run dev`

# FastAPI backend

# API Documentation: Notes API

## Authentication
This API uses Bearer Token Authentication. Obtain a token by using the `/token` endpoint and pass it as an Authorization header in subsequent requests.

### Example:
```bash
curl -X POST -d "username=user1&password=password1" http://localhost:8000/token
```
Response:
```json
{
  "access_token": "user1",
  "token_type": "bearer"
}
```

## Endpoints

### 1. Create a Note
**Endpoint:** `POST /notes`

**Description:** Create a new note.

**Parameters:**
- `title` (str, form data): Title of the note
- `content` (str, form data): Content of the note
- `pinned` (bool, form data, optional): Whether the note is pinned (default: false)

**Request Example:**
```bash
curl -X POST "http://localhost:8000/notes" \
    -H "Authorization: Bearer user1" \
    -F "title=My First Note" \
    -F "content=This is the content of my note" \
    -F "pinned=true"
```

### 2. Get Notes
**Endpoint:** `GET /notes`

**Description:** Retrieve all notes for the authenticated user.

**Request Example:**
```bash
curl -X GET "http://localhost:8000/notes" \
    -H "Authorization: Bearer user1"
```

### 3. Update a Note
**Endpoint:** `PUT /notes/{note_id}`

**Description:** Update an existing note by ID.

**Parameters:**
- `note_id` (int, path parameter): The ID of the note to update
- `title`, `content`, `pinned` (form data): Fields to update

**Request Example:**
```bash
curl -X PUT "http://localhost:8000/notes/1" \
    -H "Authorization: Bearer user1" \
    -F "title=Updated Note Title" \
    -F "content=Updated content for the note" \
    -F "pinned=false"
```

### 4. Delete a Note
**Endpoint:** `DELETE /notes/{note_id}`

**Description:** Delete a note by ID.

**Request Example:**
```bash
curl -X DELETE "http://localhost:8000/notes/1" \
    -H "Authorization: Bearer user1"
```

## Error Handling
Responses with **4xx** status codes include error details:
```json
{
  "detail": "Error message"
}
```

## Common Issues
- Ensure the Bearer token is correctly passed in the **Authorization** header.
- Double-check required form data fields in **POST** and **PUT** requests.
