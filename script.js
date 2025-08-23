import { db } from "./firebase.js";
import { collection, addDoc, getDocs, deleteDoc, doc } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const bookList = document.getElementById("bookList");

// Add book
document.getElementById("addBookBtn").addEventListener("click", async () => {
  const isbn = document.getElementById("isbn").value.trim();
  const name = document.getElementById("bookName").value.trim();

  if (!isbn && !name) return alert("Please enter ISBN or Book Name");

  let title = name || "Unknown Title";
  let author = "Unknown Author";
  let cover = "https://via.placeholder.com/150x180?text=No+Cover";

  try {
    const apiUrl = isbn
      ? `https://www.googleapis.com/books/v1/volumes?q=isbn:${isbn}`
      : `https://www.googleapis.com/books/v1/volumes?q=intitle:${encodeURIComponent(name)}`;

    const res = await fetch(apiUrl);
    const data = await res.json();

    if (data.items && data.items.length > 0) {
      const bookInfo = data.items[0].volumeInfo;
      title = bookInfo.title || title;
      author = bookInfo.authors ? bookInfo.authors.join(", ") : author;
      cover = bookInfo.imageLinks ? bookInfo.imageLinks.thumbnail : cover;
    }

    await addDoc(collection(db, "books"), { title, author, isbn: isbn || "N/A", cover, createdAt: new Date() });

    document.getElementById("bookName").value = "";
    document.getElementById("isbn").value = "";
    loadBooks();

  } catch (e) {
    console.error("Error adding book:", e);
    alert("Failed to add book ❌");
  }
});

// Partial search
document.getElementById("searchBtn").addEventListener("click", async () => {
  const titleSearch = document.getElementById("searchTitle").value.trim().toLowerCase();
  const authorSearch = document.getElementById("searchAuthor").value.trim().toLowerCase();
  const isbnSearch = document.getElementById("searchISBN").value.trim().toLowerCase();

  const querySnapshot = await getDocs(collection(db, "books"));

  const filteredBooks = querySnapshot.docs.filter(docSnap => {
    const book = docSnap.data();
    return (!titleSearch || book.title.toLowerCase().includes(titleSearch)) &&
           (!authorSearch || book.author.toLowerCase().includes(authorSearch)) &&
           (!isbnSearch || book.isbn.toLowerCase().includes(isbnSearch));
  });

  displayBooks({ forEach: fn => filteredBooks.forEach(fn), empty: filteredBooks.length === 0 });
});

// Load all books
async function loadBooks() {
  const querySnapshot = await getDocs(collection(db, "books"));
  displayBooks(querySnapshot);
}

// Display books in grid
function displayBooks(querySnapshot) {
  bookList.innerHTML = "";

  if (querySnapshot.empty) {
    bookList.innerHTML = "<li>No books found</li>";
    return;
  }

  querySnapshot.forEach((docSnap) => {
    const book = docSnap.data();
    const bookId = docSnap.id;

    const li = document.createElement("li");
    li.innerHTML = `
      <img src="${book.cover || 'https://via.placeholder.com/150x180?text=No+Cover'}" alt="cover">
      <b>${book.title}</b><br>
      ${book.author}<br>
      ISBN: ${book.isbn}<br>
      <button class="deleteBtn">❌ Delete</button>
    `;

    li.querySelector(".deleteBtn").addEventListener("click", async () => {
      await deleteDoc(doc(db, "books", bookId));
      loadBooks();
    });

    bookList.appendChild(li);
  });
}

// Load books on page load
loadBooks();
