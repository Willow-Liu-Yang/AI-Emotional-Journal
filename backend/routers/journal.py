from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import SessionLocal
from models import JournalEntry
from schemas import Journal, JournalCreate

router = APIRouter(
    prefix="/entries",  # 所有路由都会以 /entries 开头
    tags=["Journal Entries"]
)

# 获取数据库会话
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# 创建一条日记
@router.post("/", response_model=Journal)
def create_entry(entry: JournalCreate, db: Session = Depends(get_db)):
    new_entry = JournalEntry(content=entry.content)
    db.add(new_entry)
    db.commit()
    db.refresh(new_entry)
    return new_entry

# 获取所有日记
@router.get("/", response_model=list[Journal])
def read_entries(db: Session = Depends(get_db)):
    entries = db.query(JournalEntry).all()
    return entries

# 根据 ID 获取单条日记
@router.get("/{entry_id}", response_model=Journal)
def read_entry(entry_id: int, db: Session = Depends(get_db)):
    entry = db.query(JournalEntry).filter(JournalEntry.id == entry_id).first()
    if not entry:
        raise HTTPException(status_code=404, detail="Entry not found")
    return entry

# 删除日记
@router.delete("/{entry_id}")
def delete_entry(entry_id: int, db: Session = Depends(get_db)):
    entry = db.query(JournalEntry).filter(JournalEntry.id == entry_id).first()
    if not entry:
        raise HTTPException(status_code=404, detail="Entry not found")
    db.delete(entry)
    db.commit()
    return {"message": f"Entry {entry_id} deleted"}
