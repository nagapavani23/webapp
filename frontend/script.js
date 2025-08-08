// Use injected global variable or fallback to localhost for local dev
const API_URL = (typeof API_URL_PLACEHOLDER !== 'undefined' && API_URL_PLACEHOLDER !== '__API_URL__')
                ? API_URL_PLACEHOLDER
                : 'http://localhost:8000';

const BOOKS_ENDPOINT = API_URL.endsWith('/books') ? API_URL : API_URL + '/books';

const bookForm = document.getElementById("book-form");
const bookList = document.getElementById("book-list");

// Fetch books and display
async function fetchBooks() {
    const res = await fetch(BOOKS_ENDPOINT);
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

    await fetch(BOOKS_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, author, description: desc })
    });

    bookForm.reset();
    fetchBooks();
});

// Delete book
async function deleteBook(id) {
    await fetch(`${BOOKS_ENDPOINT}/${id}`, { method: "DELETE" });
    fetchBooks();
}

// Initial load
fetchBooks();
