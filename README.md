# 🧠 AI Emotional Journal - Backend

A FastAPI-based backend for the **AI Emotional Journal** project,  
featuring PostgreSQL database, Docker integration, and automatic emotion analysis.

---

## 🚀 Project Overview

This backend stores users’ daily journal entries, performs AI-based emotion analysis,  
and provides API endpoints for retrieving emotions, trends, and AI-generated responses.

### ✨ Tech Stack
- **FastAPI** – RESTful backend framework  
- **PostgreSQL** – Database  
- **SQLModel** – ORM layer  
- **Docker & Docker Compose** – Environment setup  
- **pgAdmin** – Database GUI (optional)

---

## ⚙️ Local Development Setup

### 1️⃣ Clone the repository
```bash
git clone https://github.com/your-username/AI-Emotional-Journal.git
cd AI-Emotional-Journal
2️⃣ Create a virtual environment (optional)
bash

python -m venv venv
.\venv\Scripts\activate
3️⃣ Install dependencies
bash

pip install -r requirements.txt
4️⃣ Create .env file
Create a file named .env in the project root:

bash

DATABASE_URL=postgresql://postgres:mysecretpassword@localhost:5432/postgres
🐳 Using Docker (Recommended)
1️⃣ Start the full environment
bash

docker compose up -d
2️⃣ Access the services
Service	URL
FastAPI Backend	http://localhost:5050
API Docs	http://localhost:5050/docs
pgAdmin	http://localhost:5051

3️⃣ Stop all services
bash

docker compose down
📂 Project Structure
css

AI-Emotional-Journal/
├── backend/
│   ├── main.py
│   ├── database.py
│   ├── models.py
│   ├── routers/
│   └── ...
├── .env.example
├── .gitignore
├── docker-compose.yml
├── requirements.txt
└── README.md
💡 Environment Variables
Variable	Description
DATABASE_URL	PostgreSQL connection string
POSTGRES_PASSWORD	Password for the PostgreSQL user

🧰 Common Commands
Run the backend locally (without Docker)
bash

uvicorn main:app --reload --port 5050
Run database migrations (if using Alembic)
bash

alembic upgrade head
Rebuild Docker containers
bash

docker compose build --no-cache
👥 Team Collaboration
Each team member can:

Run the backend locally with Docker Compose

Edit and test code with hot reload

Commit changes via Git

Later, deploy the shared version on the school server

🏁 Deployment (Shared Environment)
To deploy on a shared server:

Upload the entire project folder

Run docker compose up -d

Everyone can access the same backend and shared database