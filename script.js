// ---- Firebase Setup ----
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { 
  getAuth, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged 
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { 
  getFirestore, 
  collection, 
  addDoc, 
  getDocs,
  doc,
  updateDoc,
  deleteDoc
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

// ---- Firebase Config ----
const firebaseConfig = {
  apiKey: "AIzaSyDRIOLQBYUVU0LopAW077qCkvkp6TAboj8",
  authDomain: "readvault-58040.firebaseapp.com",
  projectId: "readvault-58040",
  storageBucket: "readvault-58040.appspot.com",
  messagingSenderId: "735101113966",
  appId: "1:735101113966:web:73583ee54e9ac092f3b87f"
};

// ---- Initialize Firebase ----
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// ---- DOM Elements ----
const authSection = document.getElementById("authSection");
const librarySection = document.getElementById("librarySection");

// Auth inputs
const signupEmail = document.getElementById("signupEmail");
const signupPassword = document.getElementById("signupPassword");
const loginEmail = document.getElementById("loginEmail");
const loginPassword = document.getElementById("loginPassword");
const signupBtn = document.getElementById("signupBtn");
const loginBtn = document.getElementById("loginBtn");
const logoutBtn = document.getElementById("logoutBtn");

// Library elements
const bookList = document.getElementById("bookList");

// Search inputs
const searchTitle = document.getElementById("searchTitle");
const searchBtn = document.getElementById("searchBtn");
const searchResultsDiv = document.getElementById("searchResults");

// ---- SIGN UP ----
signupBtn.addEventListener("click", async () => {
  const email = signupEmail.value.trim();
  const password = signupPassword.value.trim();

  if (!email || !password) return alert("Enter both email and password");

  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    alert("✅ Signup successful: " + userCredential.user.email);
    signupEmail.value = "";
    signupPassword.value = "";
  } catch (error) {
    alert("❌ " + error.message);
  }
});

// ---- LOGIN ----
loginBtn.addEventListener("click", async () => {
  const email = loginEmail.value.trim();
  const password = loginPassword.value.trim();

  if (!email || !password) return alert("Enter both email and password");

  try {
    await signInWithEmailAndPassword(auth, email, password);
    alert("✅ Logged in!");
    loginEmail.value = "";
    loginPassword.value = "";
  } catch (error) {
    alert("❌ " + error.message);
  }
});

// ---- LOGOUT ----
logoutBtn.addEventListener("click", async () => {
  try {
    await signOut(auth);
    alert("🚪 Logged out!");
  } catch (error) {
    alert(error.message);
  }
});

// ---- AUTH STATE CHANGE ----
onAuthStateChanged(auth, (user) => {
  if (user) {
    authSection.classList.add("hidden");
    librarySection.classList.remove("hidden");
    loadBooks(user.uid);
  } else {
    authSection.classList.remove("hidden");
    librarySection.classList.add("hidden");
    bookList.innerHTML = "";
    searchResultsDiv.innerHTML = "";
  }
});

// ---- LOAD BOOKS ----
async function loadBooks(uid) {
  bookList.innerHTML = "";
  const booksRef = collection(db, "users", uid, "books");
  const snapshot = await getDocs(booksRef);

  snapshot.forEach((docItem) => {
    const book = docItem.data();
    const li = document.createElement("li");
    li.innerHTML = `
      <strong>${book.name}</strong><br>
      <em>${book.author || "Unknown author"}</em><br>
      ISBN: ${book.isbn}<br>
      ${book.cover ? `<img src="${book.cover}" alt="cover">` : ""}
      <br>
      <button class="editBtn">Edit</button>
      <button class="deleteBtn">Delete</button>
    `;

    // ---- Edit Book ----
    const editBtn = li.querySelector(".editBtn");
    editBtn.addEventListener("click", async () => {
      const newName = prompt("Enter new book title:", book.name) || book.name;
      const newAuthor = prompt("Enter new author:", book.author || "") || book.author;
      const newISBN = prompt("Enter new ISBN:", book.isbn) || book.isbn;

      await updateDoc(doc(db, "users", uid, "books", docItem.id), {
        name: newName,
        author: newAuthor,
        isbn: newISBN
      });

      alert(`✅ "${newName}" updated!`);
      loadBooks(uid);
    });

    // ---- Delete Book ----
    const deleteBtn = li.querySelector(".deleteBtn");
    deleteBtn.addEventListener("click", async () => {
      if (confirm(`Are you sure you want to delete "${book.name}"?`)) {
        await deleteDoc(doc(db, "users", uid, "books", docItem.id));
        alert(`🗑 "${book.name}" deleted!`);
        loadBooks(uid);
      }
    });

    bookList.appendChild(li);
  });
}

// ---- GOOGLE BOOKS SEARCH ----
searchBtn.addEventListener("click", async () => {
  const query = searchTitle.value.trim();
  if (!query) return alert("Enter a book name to search");

  searchResultsDiv.innerHTML = "Searching...";

  try {
    const response = await fetch(`https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(query)}`);
    const data = await response.json();
    searchResultsDiv.innerHTML = "";

    if (!data.items || data.items.length === 0) {
      searchResultsDiv.innerHTML = "No books found.";
      return;
    }

    data.items.forEach(item => {
      const book = item.volumeInfo;
      const title = book.title || "Unknown title";
      const authors = book.authors ? book.authors.join(", ") : "Unknown author";
      const isbn = book.industryIdentifiers ? book.industryIdentifiers[0].identifier : "N/A";
      const thumbnail = book.imageLinks ? book.imageLinks.thumbnail : "";

      const div = document.createElement("div");
      div.classList.add("search-item");
      div.innerHTML = `
        <strong>${title}</strong><br>
        <em>${authors}</em><br>
        ISBN: ${isbn}<br>
        ${thumbnail ? `<img src="${thumbnail}" alt="cover">` : ""}<br>
        <button class="addBtn">Add</button>
      `;

      const addBtn = div.querySelector(".addBtn");
      addBtn.addEventListener("click", async () => {
        const user = auth.currentUser;
        if (!user) return alert("Login first!");

        await addDoc(collection(db, "users", user.uid, "books"), {
          name: title,
          author: authors,
          isbn: isbn,
          cover: thumbnail
        });
        alert(`✅ "${title}" added to your library!`);
        loadBooks(user.uid);
      });

      searchResultsDiv.appendChild(div);
    });
  } catch (error) {
    searchResultsDiv.innerHTML = "Error fetching books.";
    console.error(error);
  }
});
