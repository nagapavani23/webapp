from fastapi import FastAPI
from pydantic import BaseModel
from typing import List
from uuid import uuid4
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

# Allow frontend requests
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # For dev purposes, allow all
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class Book(BaseModel):
    id: str = None
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
