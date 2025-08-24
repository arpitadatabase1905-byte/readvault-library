// script.js
import { db } from "./firebase.js";
import { collection, getDocs } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";

// References to UI elements
const libraryDiv = document.getElementById("library");
const genreCollectionDiv = document.getElementById("genreCollection");

// Fetch all books from Firestore
async function fetchBooks() {
  try {
    const querySnapshot = await getDocs(collection(db, "books"));

    let books = [];
    querySnapshot.forEach((doc) => {
      books.push({ id: doc.id, ...doc.data() });
    });

    displayLibrary(books);
    displayByGenre(books);

  } catch (error) {
    console.error("❌ Error fetching books:", error);
  }
}

// Display books in "My Library"
function displayLibrary(books) {
  libraryDiv.innerHTML = "";
  if (books.length === 0) {
    libraryDiv.innerHTML = "<p>No books in your library yet.</p>";
    return;
  }

  books.forEach(book => {
    const bookCard = document.createElement("div");
    bookCard.classList.add("book-card");
    bookCard.innerHTML = `
      <h3>${book.title || "Untitled"}</h3>
      <p><strong>Author:</strong> ${book.author || "Unknown"}</p>
      <p><strong>Genre:</strong> ${book.genre || "Not specified"}</p>
    `;
    libraryDiv.appendChild(bookCard);
  });
}

// Display books grouped by genre
function displayByGenre(books) {
  genreCollectionDiv.innerHTML = "";
  if (books.length === 0) {
    genreCollectionDiv.innerHTML = "<p>No books available by genre.</p>";
    return;
  }

  // Group by genre
  const genreMap = {};
  books.forEach(book => {
    const genre = book.genre || "Other";
    if (!genreMap[genre]) genreMap[genre] = [];
    genreMap[genre].push(book);
  });

  // Render genres
  for (const [genre, genreBooks] of Object.entries(genreMap)) {
    const genreSection = document.createElement("div");
    genreSection.classList.add("genre-section");
    genreSection.innerHTML = `<h3>${genre}</h3>`;

    const bookList = document.createElement("div");
    bookList.classList.add("book-grid");

    genreBooks.forEach(book => {
      const bookCard = document.createElement("div");
      bookCard.classList.add("book-card");
      bookCard.innerHTML = `
        <h4>${book.title || "Untitled"}</h4>
        <p><strong>Author:</strong> ${book.author || "Unknown"}</p>
      `;
      bookList.appendChild(bookCard);
    });

    genreSection.appendChild(bookList);
    genreCollectionDiv.appendChild(genreSection);
  }
}

// Load books when page loads
fetchBooks();
