const form = document.getElementById("book-form");

form.onsubmit = async (e) => {
  e.preventDefault();

  const title = document.getElementById("title").value;
  const author = document.getElementById("author").value;
  const desc = document.getElementById("desc").value;

  await fetch("http://localhost:8000/books", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ title, author, description: desc })
  });

  form.reset();  // Clear form
  loadBooks();   // Reload book list
};

async function loadBooks() {
  const res = await fetch("http://localhost:8000/books");
  const books = await res.json();

  const list = document.getElementById("book-list");
  list.innerHTML = "";

  books.forEach(book => {
    const li = document.createElement("li");
    li.textContent = `${book.title} by ${book.author}`;
    list.appendChild(li);
  });
}

async function searchBook() {
  const title = document.getElementById("search").value;
  const res = await fetch(`http://localhost:8000/books/search/${title}`);
  const books = await res.json();

  const list = document.getElementById("book-list");
  list.innerHTML = "";

  books.forEach(book => {
    const li = document.createElement("li");
    li.textContent = `${book.title} by ${book.author}`;
    list.appendChild(li);
  });
}

loadBooks();  // initial load
