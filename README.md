# AI-Emotional-Journal

An AI-assisted journaling app with a Dockerized FastAPI backend and an Expo (React Native) frontend.

## Prerequisites

Install the following tools:

1. Docker Desktop (includes Docker Compose)
   - Windows/macOS: install Docker Desktop from the official Docker website.
   - After installation, make sure Docker Desktop is running.

2. Node.js 18+ (npm included)
   - Install the LTS version of Node.js.
   - Verify in a terminal:
     ```bash
     node -v
     npm -v
     ```

3. Expo Go (mobile app)
   - Install Expo Go from App Store / Google Play (used to run the app by scanning a QR code).

Optional (but helpful):
- A Postgres client (e.g., DBeaver) if you want to inspect database data.

## Environment Variables

Copy the example file and fill in secrets as needed:

```bash
cp .env.example .env
```

Notes:

- `SILICONFLOW_API_KEY` is required for AI features. If it is missing or invalid, AI-related requests may fail.
- In the Docker Compose setup, you normally do not need to change `DATABASE_URL`. Do not replace the Postgres host (e.g., `db`) with `localhost`, otherwise the backend container cannot reach the database.

## Run with Docker (recommended)

From the project root:

```bash
docker compose up --build
```

Services:

- Backend API: http://localhost:9000 (Swagger UI: http://localhost:9000/docs)
- Postgres: localhost:5432 (user/password/db: postgres/postgres/journal_db)

To stop:

```bash
docker compose down
```

To stop and remove volumes (this deletes database data):

```bash
docker compose down -v
```

## Run Frontend (Expo)

From the project root:

```bash
cd frontend
npm install
npm run start
```

This starts the Expo dev server and prints a QR code. Open Expo Go on your phone and scan the QR code.

### Important: Phone-to-Backend Connectivity (QR / Expo Go)

When running via QR code, the app runs on your phone while the backend runs on your computer. Your phone must be able to reach your computer.

Requirements:

- Your phone and your computer must be connected to the same Wi-Fi network.
- The frontend must use your computer’s LAN IP for API calls (not `localhost` on the phone).

In this project, the frontend typically auto-detects your computer’s LAN IP from Expo host info and builds the API URL as:

`http://<LAN_IP>:9000`

If you still see network errors (login fails, entries cannot load/save, insights cannot fetch), set an explicit API URL override and restart Expo:

```bash
EXPO_PUBLIC_API_URL=http://<YOUR_COMPUTER_LAN_IP>:9000 npm run start
```

Example:

```bash
EXPO_PUBLIC_API_URL=http://192.168.1.23:9000 npm run start
```

PowerShell example (Windows):

```powershell
$env:EXPO_PUBLIC_API_URL="http://192.168.1.23:9000"
npm run start
```

## Project Structure

- `backend/`: FastAPI app, SQLAlchemy models, routers, Dockerfile
- `frontend/`: Expo (React Native) app
- `docker-compose.yml`: Backend + Postgres
- `.env.example`: Environment template

## Useful Commands

Rebuild everything:

```bash
docker compose up --build
```

Reset Docker state (including database data):

```bash
docker compose down -v
docker compose up --build
```

Frontend reinstall dependencies:

```bash
cd frontend
rm -rf node_modules
npm install
npm run start
```

## Seed Test Entries (optional)

To quickly generate sample journal entries (including AI replies), run the seed script inside the backend container:

```bash
docker compose exec backend python scripts/seed_entries.py
```

Notes:

- The script targets `test@example.com` by default and will auto-register if the user does not exist.
- To change the target user, edit `TARGET_EMAIL` and `TARGET_PASSWORD` in `backend/scripts/seed_entries.py`.
- Default seeded password is `test1234` (from `TARGET_PASSWORD`).
- It inserts about 6 entries (today, last week, last month, last year + a few random recent days).

## Troubleshooting

### Backend works in browser, but phone cannot log in or load data

- Confirm backend is reachable on your computer: http://localhost:9000/docs
- Confirm phone and computer are on the same Wi-Fi
- Set `EXPO_PUBLIC_API_URL` to your computer’s LAN IP and restart Expo as shown above

### Database connection errors from backend container

- Do not change `DATABASE_URL` to use `localhost` in the Docker setup
- Rebuild after changing `.env`: `docker compose up --build`
