import { db } from "./firebase.js";
import {
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc,
  updateDoc
} from "https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";

const libraryDiv = document.getElementById("library");
const bookForm = document.getElementById("bookForm");
const searchInput = document.getElementById("searchInput");
const booksCollection = collection(db, "books");

// ✅ Fetch and display all books
async function loadBooks() {
  libraryDiv.innerHTML = "";
  const querySnapshot = await getDocs(booksCollection);

  querySnapshot.forEach((docSnap) => {
    const book = docSnap.data();
    displayBook(docSnap.id, book);
  });
}

// ✅ Display a single book card
function displayBook(id, book) {
  const card = document.createElement("div");
  card.className = "book-card";
  card.innerHTML = `
    <h3>${book.title}</h3>
    <p><b>Author:</b> ${book.author}</p>
    <p><b>Genre:</b> ${book.genre}</p>
    <button class="edit">Edit</button>
    <button class="delete">Delete</button>
  `;

  // Delete book
  card.querySelector(".delete").addEventListener("click", async () => {
    await deleteDoc(doc(db, "books", id));
    loadBooks();
  });

  // Edit book
  card.querySelector(".edit").addEventListener("click", async () => {
    const newTitle = prompt("New Title:", book.title);
    const newAuthor = prompt("New Author:", book.author);
    const newGenre = prompt("New Genre:", book.genre);

    if (newTitle && newAuthor && newGenre) {
      await updateDoc(doc(db, "books", id), {
        title: newTitle,
        author: newAuthor,
        genre: newGenre
      });
      loadBooks();
    }
  });

  libraryDiv.appendChild(card);
}

// ✅ Add a new book
bookForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const title = document.getElementById("title").value.trim();
  const author = document.getElementById("author").value.trim();
  const genre = document.getElementById("genre").value.trim();

  if (title && author && genre) {
    await addDoc(booksCollection, { title, author, genre });
    bookForm.reset();
    loadBooks();
  }
});

// ✅ Search functionality
searchInput.addEventListener("input", async () => {
  const searchTerm = searchInput.value.toLowerCase();
  libraryDiv.innerHTML = "";

  const querySnapshot = await getDocs(booksCollection);
  querySnapshot.forEach((docSnap) => {
    const book = docSnap.data();
    if (
      book.title.toLowerCase().includes(searchTerm) ||
      book.author.toLowerCase().includes(searchTerm)
    ) {
      displayBook(docSnap.id, book);
    }
  });
});

// Initial load
loadBooks();
