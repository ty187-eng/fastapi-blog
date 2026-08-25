# FastAPI Blog

A Dockerized FastAPI blog application with server-rendered pages, JWT auth, SQLite, and persistent Docker volumes.

## Quick Start

### Prerequisites

- Docker
- Docker Compose

### Run on any machine

```bash
git clone https://github.com/Ty951243-eng/fastapi-blog.git
cd fastapi-blog
docker compose up -d --build
```

Open: <http://localhost:8000>

## Common Commands

```bash
# Check container status
docker compose ps

# Follow logs
docker compose logs -f

# Stop containers (keep data)
docker compose down

# Rebuild after pulling updates
git pull
docker compose up -d --build
```

## Data Persistence

This project stores runtime data in Docker named volumes:

- `blog_data` -> `/app/data` (SQLite database at `/app/data/blog.db`)
- `media_data` -> `/app/media` (uploaded files)

As long as volumes are kept, data survives container restarts/recreates.

## Important Notes

- Do **not** run `docker compose down -v` unless you want to delete all persisted data.
- The app can start without a local `.env` file.
- For real production use, set a strong `secret_key` value in `docker-compose.yml` or environment variables.

## Tech Stack

- Python 3.12+
- FastAPI
- SQLAlchemy (async)
- SQLite + aiosqlite
- Pydantic Settings
- JWT (PyJWT)
- Password hashing via `pwdlib[argon2]`
- Jinja2 templates + static assets
