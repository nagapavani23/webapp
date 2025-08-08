//const API_URL = "http://localhost:8000/books";
const API_URL = "http://52.228.170.94:8000/books";


const bookForm = document.getElementById("book-form");
const bookList = document.getElementById("book-list");

// Fetch books and display
async function fetchBooks() {
    const res = await fetch(API_URL);
    const books = await res.json();
    bookList.innerHTML = "";
    books.forEach(book => {
        const li = document.createElement("li");
        li.innerHTML = `<b>${book.title}</b> by ${book.author} - ${book.description}
                        <button onclick="deleteBook('${book.id}')">Delete</button>`;
        bookList.appendChild(li);
    });
}

// Add book
bookForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const title = document.getElementById("title").value;
    const author = document.getElementById("author").value;
    const desc = document.getElementById("desc").value;

    const res = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, author, description: desc })
    });

    if (!res.ok) {
        alert("Failed to add book");
        return;
    }

    bookForm.reset();
    fetchBooks();
});

// Delete book
async function deleteBook(id) {
    const res = await fetch(`${API_URL}/${id}`, { method: "DELETE" });
    if (!res.ok) {
        alert("Failed to delete book");
        return;
    }
    fetchBooks();
}

// Initial load
fetchBooks();
