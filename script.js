import { auth, db } from "./Firebase.js";
import { collection, doc, setDoc, getDocs } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";

// Dummy user (replace with real auth later)
const userId = "demoUser";

// ====================== TAB SWITCH ======================
window.showTab = function(tab) {
  document.getElementById("libraryTab").style.display = tab === "library" ? "block" : "none";
  document.getElementById("genreTab").style.display = tab === "genreCollection" ? "block" : "none";
};

// ====================== ADD BOOK (Example Data) ======================
// You’ll replace this with Google Books API search later
async function addSampleBooks() {
  const sampleBooks = [
    { title: "Book A", authors: "Author 1", genre: "Fiction", cover: "https://via.placeholder.com/100x150" },
    { title: "Book B", authors: "Author 2", genre: "History", cover: "https://via.placeholder.com/100x150" },
    { title: "Book C", authors: "Author 3", genre: "Science", cover: "https://via.placeholder.com/100x150" },
    { title: "Book D", authors: "Author 4", genre: "Fiction", cover: "https://via.placeholder.com/100x150" },
  ];

  for (let book of sampleBooks) {
    const docRef = doc(collection(db, "users", userId, "books"));
    await setDoc(docRef, book);
  }
}

// ====================== FETCH BOOKS ======================
async function fetchBooks() {
  const querySnap = await getDocs(collection(db, "users", userId, "books"));
  const books = [];
  querySnap.forEach(doc => books.push(doc.data()));

  displayBooks(books);
  displayBooksByGenre(books);
}

// ====================== DISPLAY LIBRARY ======================
function displayBooks(books) {
  const libraryDiv = document.getElementById("library");
  libraryDiv.innerHTML = "";

  books.forEach(book => {
    const card = document.createElement("div");
    card.classList.add("book-card");
    card.innerHTML = `
      <img src="${book.cover}" alt="${book.title}">
      <h3>${book.title}</h3>
      <p>${book.authors}</p>
      <span class="genre-tag">${book.genre || "Unknown"}</span>
    `;
    libraryDiv.appendChild(card);
  });
}

// ====================== DISPLAY GENRE COLLECTION ======================
function displayBooksByGenre(books) {
  const genreDiv = document.getElementById("genreCollection");
  genreDiv.innerHTML = "";

  const grouped = {};
  books.forEach(book => {
    const genre = book.genre || "Unknown";
    if (!grouped[genre]) grouped[genre] = [];
    grouped[genre].push(book);
  });

  for (let genre in grouped) {
    const section = document.createElement("div");
    section.classList.add("genre-section");
    section.innerHTML = `<h2>${genre}</h2>`;

    const row = document.createElement("div");
    row.classList.add("book-grid");

    grouped[genre].forEach(book => {
      const card = document.createElement("div");
      card.classList.add("book-card");
      card.innerHTML = `
        <img src="${book.cover}" alt="${book.title}">
        <h3>${book.title}</h3>
        <p>${book.authors}</p>
      `;
      row.appendChild(card);
    });

    section.appendChild(row);
    genreDiv.appendChild(section);
  }
}

// ====================== INIT ======================
(async function init() {
  // Uncomment this once only to add dummy books:
  // await addSampleBooks();
  await fetchBooks();
})();
