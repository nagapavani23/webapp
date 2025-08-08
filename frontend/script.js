const API_URL = "http://localhost:8000/books"; // Change to backend service URL in Kubernetes

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

    await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, author, description: desc })
    });

    bookForm.reset();
    fetchBooks();
});

// Delete book
async function deleteBook(id) {
    await fetch(`${API_URL}/${id}`, { method: "DELETE" });
    fetchBooks();
}

// Initial load
fetchBooks();
