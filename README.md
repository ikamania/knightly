# Knightly

Real-time multiplayer chess built with React, Vite, and Django, with games played live over WebSockets. Dockerized for simple setup and deployment.

---

## Features

* Real-time multiplayer chess over WebSockets
* Create a custom game or find a waiting one
* Chess clocks with per-side time control
* JWT authentication with token refresh
* Public player profiles
* Responsive UI for mobile and desktop
* Easily deployable with Docker

---

## Prerequisites

* Docker >= 20.x
* Docker Compose >= 2.x
* Git

---

## 1. Clone the repository

```bash
git clone https://github.com/ikamania/Knightly.git
cd Knightly
```

## 2. Create the environment file

```bash
cp backend/.env.example backend/.env
```

* Set your own `SECRET_KEY` in `backend/.env`.

## 3. Build and run the Docker containers

```bash
docker compose up --build
```

* The website will be available at `http://localhost:5173/`.
* The API runs on `http://localhost:8000/`.

## 4. Apply migrations

```bash
docker compose exec backend uv run python manage.py migrate
```

* Sets up the database tables.

---

## Stop the containers

```bash
docker compose down
```

---

## Tips

* To reset the database:

```bash
docker compose exec backend rm db.sqlite3
docker compose exec backend uv run python manage.py migrate
```

* To create a superuser for `/admin/`:

```bash
docker compose exec backend uv run python manage.py createsuperuser
```

* To run Django shell:

```bash
docker compose exec backend uv run python manage.py shell
```
