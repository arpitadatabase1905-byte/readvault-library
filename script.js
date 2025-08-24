// script.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.3/firebase-app.js";
import {
  getAuth,
  onAuthStateChanged,
  signOut,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword
} from "https://www.gstatic.com/firebasejs/10.12.3/firebase-auth.js";
import {
  getFirestore,
  collection,
  addDoc,
  getDocs,
  doc,
  deleteDoc,
  setDoc
} from "https://www.gstatic.com/firebasejs/10.12.3/firebase-firestore.js";

// 🔹 Firebase Config
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_AUTH_DOMAIN",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_BUCKET",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID"
};

// 🔹 Init Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// 🔹 DOM Elements
const loginSection = document.getElementById("login-section");
const signupSection = document.getElementById("signup-section");
const librarySection = document.getElementById("library-section");
const loginForm = document.getElementById("login-form");
const signupForm = document.getElementById("signup-form");
const addBookForm = document.getElementById("add-book-form");
const bookListDiv = document.getElementById("book-list");
const genreListDiv = document.getElementById("genre-list");
const logoutBtn = document.getElementById("logout-btn");

// Tabs
const libraryTab = document.getElementById("library-tab");
const genreTab = document.getElementById("genre-tab");

// ---------------- AUTH -----------------
onAuthStateChanged(auth, (user) => {
  if (user) {
    loginSection.style.display = "none";
    signupSection.style.display = "none";
    librarySection.style.display = "block";
    loadBooks(user.uid);
    loadBooksByGenre(user.uid);
  } else {
    loginSection.style.display = "block";
    signupSection.style.display = "none";
    librarySection.style.display = "none";
  }
});

// Login
loginForm?.addEventListener("submit", async (e) => {
  e.preventDefault();
  const email = document.getElementById("login-email").value;
  const password = document.getElementById("login-password").value;

  try {
    await signInWithEmailAndPassword(auth, email, password);
  } catch (err) {
    alert(err.message);
  }
});

// Signup
signupForm?.addEventListener("submit", async (e) => {
  e.preventDefault();
  const email = document.getElementById("signup-email").value;
  const password = document.getElementById("signup-password").value;

  try {
    await createUserWithEmailAndPassword(auth, email, password);
  } catch (err) {
    alert(err.message);
  }
});

// Logout
logoutBtn?.addEventListener("click", () => {
  signOut(auth);
});

// ---------------- BOOK FUNCTIONS -----------------

// Add Book
addBookForm?.addEventListener("submit", async (e) => {
  e.preventDefault();
  const user = auth.currentUser;
  if (!user) return;

  const name = document.getElementById("book-name").value;
  const author = document.getElementById("book-author").value;
  const isbn = document.getElementById("book-isbn").value;
  const cover = document.getElementById("book-cover").value;
  const genre = document.getElementById("book-genre").value;

  try {
    await addDoc(collection(db, "users", user.uid, "books"), {
      name,
      author,
      isbn,
      cover,
      genre
    });
    alert(`✅ "${name}" added!`);
    addBookForm.reset();
    loadBooks(user.uid);
    loadBooksByGenre(user.uid);
  } catch (err) {
    alert(err.message);
  }
});

// Load Books (Library Tab → 3 per row)
async function loadBooks(userId) {
  const booksRef = collection(db, "users", userId, "books");
  const snapshot = await getDocs(booksRef);

  bookListDiv.innerHTML = "";

  snapshot.forEach(docItem => {
    const book = docItem.data();
    const bookDiv = document.createElement("div");
    bookDiv.classList.add("book-item");

    bookDiv.innerHTML = `
      ${book.cover ? `<img src="${book.cover}" alt="cover" style="height:150px;">` : ""}
      <h4>${book.name}</h4>
      <p>${book.author || "Unknown"}</p>
      <p>Genre: ${book.genre || "Unknown"}</p>
      <p>ISBN: ${book.isbn}</p>
      <button class="editBtn">Edit</button>
      <button class="deleteBtn">Delete</button>
    `;

    // Edit
    bookDiv.querySelector(".editBtn").addEventListener("click", async () => {
      const newName = prompt("Edit book name:", book.name);
      const newAuthor = prompt("Edit author:", book.author || "");
      const newGenre = prompt("Edit genre:", book.genre || "");
      if (!newName) return;
      await setDoc(doc(db, "users", userId, "books", docItem.id), {
        name: newName, author: newAuthor, isbn: book.isbn, cover: book.cover, genre: newGenre
      }, { merge: true });
      alert(`✏️ "${newName}" updated!`);
      loadBooks(userId);
      loadBooksByGenre(userId);
    });

    // Delete
    bookDiv.querySelector(".deleteBtn").addEventListener("click", async () => {
      if (confirm(`Are you sure you want to delete "${book.name}"?`)) {
        await deleteDoc(doc(db, "users", userId, "books", docItem.id));
        alert(`🗑 "${book.name}" deleted!`);
        loadBooks(userId);
        loadBooksByGenre(userId);
      }
    });

    bookListDiv.appendChild(bookDiv);
  });
}

// Load Books by Genre (Genre Tab)
async function loadBooksByGenre(userId) {
  const booksRef = collection(db, "users", userId, "books");
  const snapshot = await getDocs(booksRef);

  const genres = {};
  snapshot.forEach(docItem => {
    const book = docItem.data();
    const genre = book.genre || "Unknown";
    if (!genres[genre]) genres[genre] = [];
    genres[genre].push(book);
  });

  genreListDiv.innerHTML = "";

  for (const [genre, books] of Object.entries(genres)) {
    const genreDiv = document.createElement("div");
    genreDiv.innerHTML = `<h3>${genre}</h3>`;
    books.forEach(book => {
      genreDiv.innerHTML += `
        <div class="book-item">
          ${book.cover ? `<img src="${book.cover}" alt="cover" style="height:120px;">` : ""}
          <p><strong>${book.name}</strong> by ${book.author || "Unknown"}</p>
        </div>
      `;
    });
    genreListDiv.appendChild(genreDiv);
  }
}

// ---------------- TAB SWITCHING -----------------
libraryTab?.addEventListener("click", () => {
  document.getElementById("library").style.display = "block";
  document.getElementById("genres").style.display = "none";
});

genreTab?.addEventListener("click", () => {
  document.getElementById("library").style.display = "none";
  document.getElementById("genres").style.display = "block";
});
