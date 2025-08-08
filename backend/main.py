from fastapi import FastAPI
from pydantic import BaseModel
from typing import List, Optional
from uuid import uuid4
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

# CORS settings (allow all for dev)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class Book(BaseModel):
    id: Optional[str] = None
    title: str
    author: str
    description: str

books: List[Book] = []

@app.get("/books", response_model=List[Book])
def get_books():
    return books

@app.post("/books", response_model=Book)
def create_book(book: Book):
    book.id = str(uuid4())
    books.append(book)
    return book

@app.delete("/books/{book_id}")
def delete_book(book_id: str):
    global books
    books = [b for b in books if b.id != book_id]
    return {"message": "Book deleted"}

@app.put("/books/{book_id}", response_model=Book)
def update_book(book_id: str, updated_book: Book):
    for idx, b in enumerate(books):
        if b.id == book_id:
            updated_book.id = book_id
            books[idx] = updated_book
            return updated_book
    return {"error": "Book not found"}
