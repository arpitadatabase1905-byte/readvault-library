import { db } from "./firebase.js";
import {
  collection,
  getDocs,
  doc,
  updateDoc,
  deleteDoc
} from "https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";

const libraryDiv = document.getElementById("library");
const searchInput = document.getElementById("searchInput");
const searchResults = document.getElementById("searchResults");

async function loadLibrary() {
  libraryDiv.innerHTML = "";
  const querySnapshot = await getDocs(collection(db, "books"));
  querySnapshot.forEach((docSnap) => {
    const book = docSnap.data();
    const card = createBookCard(book, docSnap.id);
    libraryDiv.appendChild(card);
  });
}

function createBookCard(book, id) {
  const card = document.createElement("div");
  card.className = "book-card";
  card.innerHTML = `
    <img src="${book.cover || 'https://via.placeholder.com/100x150'}" alt="cover">
    <h3>${book.title}</h3>
    <p>${book.author}</p>
    <p>ISBN: ${book.isbn}</p>
    <button class="edit-btn" onclick="editBook('${id}')">Edit</button>
    <button class="delete-btn" onclick="deleteBook('${id}')">Delete</button>
  `;
  return card;
}

// ✅ Edit Book
window.editBook = async function (id) {
  const newTitle = prompt("Enter new title:");
  if (!newTitle) return;
  const bookRef = doc(db, "books", id);
  await updateDoc(bookRef, { title: newTitle });
  loadLibrary();
};

// ✅ Delete Book
window.deleteBook = async function (id) {
  if (confirm("Are you sure you want to delete this book?")) {
    await deleteDoc(doc(db, "books", id));
    loadLibrary();
  }
};

// ✅ Search Books
window.searchBooks = async function () {
  const term = searchInput.value.toLowerCase();
  searchResults.innerHTML = "";
  const querySnapshot = await getDocs(collection(db, "books"));
  querySnapshot.forEach((docSnap) => {
    const book = docSnap.data();
    if (
      book.title.toLowerCase().includes(term) ||
      book.author.toLowerCase().includes(term) ||
      (book.isbn && book.isbn.toLowerCase().includes(term))
    ) {
      const card = createBookCard(book, docSnap.id);
      searchResults.appendChild(card);
    }
  });
};

// ✅ Tab Switcher
window.showTab = function (tab) {
  document.getElementById("libraryTab").style.display =
    tab === "library" ? "block" : "none";
  document.getElementById("searchTab").style.display =
    tab === "search" ? "block" : "none";
};

// Load on start
loadLibrary();
