backend/
├── api/                    # Core API functionality
│   ├── serializers/
│   │   └── __init__.py
│   ├── utils/
│   │   ├── __init__.py
│   │   └── responses.py
│   ├── __init__.py
│   ├── apps.py
│   ├── urls.py
│   └── views.py
├── authentication/         # User authentication
│   ├── __init__.py
│   ├── apps.py
│   ├── models.py
│   ├── serializers.py
│   ├── urls.py
│   └── views.py
├── exercises/             # Exercise functionality
│   ├── services/
│   │   ├── __init__.py
│   │   └── exercise_analysis.py
│   ├── utils/
│   │   ├── __init__.py
│   │   └── pose_detection.py
│   ├── __init__.py
│   ├── apps.py
│   ├── consumers.py
│   ├── models.py
│   ├── serializers.py
│   ├── urls.py
│   └── views.py
├── config/               # Project settings
│   ├── __init__.py
│   ├── asgi.py
│   ├── settings.py
│   ├── urls.py
│   └── wsgi.py
├── ml_models/           # ML model files
├── media/              # Media storage
│   └── exercise_videos/
├── static/            # Static files
├── .env              # Environment variables
├── .gitignore
├── manage.py
└── requirements.txt



## API Documentation
## Authentication Endpoints

### Register User

POST /api/auth/register/
{
"username": "string",
"email": "user@example.com",
"password": "string",
"height": float,
"weight": float,
"fitness_goal": "weight_loss|muscle_gain|endurance|flexibility"
}
**Response:**
{
"user": {
"id": "integer",
"username": "string",
"email": "string",
"height": "float",
"weight": "float",
"fitness_goal": "string",
"daily_streak": "integer"
},
"refresh": "string",
"access": "string"
}


### Login

POST /api/auth/login/
{
"email": "user@example.com",
"password": "string"
}
**Response:**
{
"user": {
"id": "integer",
"username": "string",
"email": "string"
},
"refresh": "string",
"access": "string"
}

### Refresh Token
```http
POST /api/auth/token/refresh/
```
**Request Body:**
```json
{
    "refresh": "string"
}
```
**Response:**
```json
{
    "access": "string"
}
```

### Get User Stats
```http
GET /api/auth/stats/
```
**Response:**
```json
{
    "total_exercises": "integer",
    "total_minutes": "integer",
    "highest_streak": "integer",
    "calories_burned": "float",
    "created_at": "datetime"
}
```

## Exercise Endpoints

### Upload Exercise Video
```http
POST /api/exercises/{exercise_type}/upload/
```
**Headers:**
- Content-Type: multipart/form-data
- Authorization: Bearer {access_token}

**Request Body:**
- video: file (video/mp4, video/quicktime)

**Response:**
```json
{
    "message": "Video uploaded successfully",
    "file_path": "string"
}
```

### Get Exercise History
```http
GET /api/exercises/history/
```
**Response:**
```json
[
    {
        "id": "integer",
        "exercise_type": "string",
        "date": "datetime",
        "reps": "integer",
        "form_accuracy": "float",
        "duration": "integer"
    }
]
```


### Test ML Models
```http
GET /api/exercises/test-models/
```
**Response:**
```json


## WebSocket Connection

### Real-time Exercise Analysis
```
WebSocket URL: ws://localhost:8000/ws/exercise/{exercise_type}/
```

#### Connection Flow:
1. Connect to WebSocket URL
2. Send start message:
```json
{
    "type": "start_exercise"
}
```

3. Send frames:
```json
{
    "frame": "base64_encoded_image"
}
```

4. Receive frame processing results:
```json
{
    "type": "frame_processed",
    "metrics": {
        "counter": "integer",
        "form_accuracy": "float",
        "stage": "string",
        "form_feedback": "string"
    }
}
```

5. Send stop message:
```json
{
    "type": "stop_exercise"
}
```

#### WebSocket Response Types:
- **exercise_started**: Confirms exercise session started
- **frame_processed**: Contains exercise metrics and feedback
- **exercise_completed**: Final exercise summary
- **error**: Error message if something goes wrong

## Error Responses

All endpoints can return these error responses:

```json
{
    "error": "Error message"
}
```

Common HTTP Status Codes:
- 200: Success
- 201: Created
- 400: Bad Request
- 401: Unauthorized
- 403: Forbidden
- 404: Not Found
- 500: Internal Server Error

## Authentication

All API endpoints except registration and login require JWT authentication.

Include the access token in the Authorization header:
```
Authorization: Bearer {access_token}
```

## Environment Variables

Required environment variables in `.env`:
```
SECRET_KEY=your_secret_key
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1
DB_NAME=your_db_name
DB_USER=your_db_user
DB_PASSWORD=your_db_password
DB_HOST=your_db_host
DB_PORT=your_db_port
```

## Running the Server

1. Install dependencies:
```bash
pip install -r requirements.txt
```

2. Run migrations:
```bash
python manage.py migrate
```

3. Start the server:
```bash
python -m daphne config.asgi:application -b 0.0.0.0 -p 8000
```

## WebSocket Testing

You can test WebSocket connections using the provided test script:
```bash
python test_websocket.py
```

This will simulate a real-time exercise session with test frames.