from fastapi import APIRouter

router = APIRouter()

@router.get("/")
def get_entries():
    return [{"id": 1, "content": "Feeling good today!"}]
