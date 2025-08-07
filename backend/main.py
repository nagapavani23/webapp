from fastapi import FastAPI
from pydantic import BaseModel
from typing import List
from uuid import uuid4
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

# Enable CORS for frontend access
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # you can restrict this to specific origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Separate model for incoming data (no id)
class BookCreate(BaseModel):
    title: str
    author: str
    description: str

# Model with ID
class Book(BookCreate):
    id: str

books: List[Book] = []

@app.get("/books", response_model=List[Book])
def get_books():
    return books

@app.post("/books", response_model=Book)
def create_book(book_data: BookCreate):
    book = Book(id=str(uuid4()), **book_data.dict())
    books.append(book)
    return book

@app.delete("/books/{book_id}")
def delete_book(book_id: str):
    global books
    books = [b for b in books if b.id != book_id]
    return {"message": "Book deleted"}

@app.get("/books/search/{title}", response_model=List[Book])
def search_book(title: str):
    return [book for book in books if title.lower() in book.title.lower()]
