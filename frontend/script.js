const form = document.getElementById("book-form");
form.onsubmit = async (e) => {
  e.preventDefault();
  const title = document.getElementById("title").value;
  const author = document.getElementById("author").value;
  const desc = document.getElementById("desc").value;

  await fetch("/api/books", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ title, author, description: desc })
  });

  loadBooks();
};

async function loadBooks() {
  const res = await fetch("/api/books");
  const books = await res.json();
  const list = document.getElementById("book-list");
  list.innerHTML = "";
  books.forEach(book => {
    const li = document.createElement("li");
    li.textContent = `${book.title} by ${book.author}`;
    list.appendChild(li);
  });
}

loadBooks();
