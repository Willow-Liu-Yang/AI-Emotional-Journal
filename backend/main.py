from fastapi import FastAPI
import os
import psycopg2

app = FastAPI()

def get_connection():
    return psycopg2.connect(
        host=os.getenv("DB_HOST", "db"),
        port=5432,
        database=os.getenv("DB_NAME", "journal_db"),
        user=os.getenv("DB_USER", "postgres"),
        password=os.getenv("DB_PASSWORD", "postgres")
    )

@app.get("/")
def root():
    return {"message": "Hello from Docker FastAPI!"}

@app.get("/test-db")
def test_db():
    conn = get_connection()
    cur = conn.cursor()
    cur.execute("SELECT 1;")
    result = cur.fetchone()
    cur.close()
    conn.close()
    return {"db_result": result}
