// ---- Firebase Setup ----
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged } 
  from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { getFirestore, doc, setDoc, getDocs, collection, query, where, addDoc } 
  from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

// ---- Your Firebase Config (replace with your own keys) ----
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID"
};

// Init Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// ---- DOM Elements ----
const authSection = document.getElementById("authSection");
const librarySection = document.getElementById("librarySection");

const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");
const signupBtn = document.getElementById("signupBtn");
const loginBtn = document.getElementById("loginBtn");
const logoutBtn = document.getElementById("logoutBtn");

const bookNameInput = document.getElementById("bookName");
const isbnInput = document.getElementById("isbn");
const addBookBtn = document.getElementById("addBookBtn");
const bookList = document.getElementById("bookList");

const searchTitle = document.getElementById("searchTitle");
const searchAuthor = document.getElementById("searchAuthor");
const searchISBN = document.getElementById("searchISBN");
const searchBtn = document.getElementById("searchBtn");

// ---- Auth Handlers ----
signupBtn.addEventListener("click", async () => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, emailInput.value, passwordInput.value);
    alert("Signup successful!");
  } catch (error) {
    alert(error.message);
  }
});

loginBtn.addEventListener("click", async () => {
  try {
    await signInWithEmailAndPassword(auth, emailInput.value, passwordInput.value);
    alert("Login successful!");
  } catch (error) {
    alert(error.message);
  }
});

logoutBtn.addEventListener("click", async () => {
  await signOut(auth);
  alert("Logged out!");
});

// ---- Auth State Change (switch screens) ----
onAuthStateChanged(auth, (user) => {
  if (user) {
    authSection.classList.add("hidden");
    librarySection.classList.remove("hidden");
    loadBooks(user.uid);
  } else {
    authSection.classList.remove("hidden");
    librarySection.classList.add("hidden");
    bookList.innerHTML = "";
  }
});

// ---- Firestore: Add Book ----
addBookBtn.addEventListener("click", async () => {
  const user = auth.currentUser;
  if (!user) return alert("Login first!");

  const bookName = bookNameInput.value.trim();
  const isbn = isbnInput.value.trim();

  if (bookName === "" || isbn === "") {
    return alert("Enter both book name and ISBN");
  }

  await addDoc(collection(db, "users", user.uid, "books"), {
    name: bookName,
    isbn: isbn
  });

  bookNameInput.value = "";
  isbnInput.value = "";
  loadBooks(user.uid);
});

// ---- Firestore: Load Books ----
async function loadBooks(uid) {
  bookList.innerHTML = "";
  const q = collection(db, "users", uid, "books");
  const querySnapshot = await getDocs(q);

  querySnapshot.forEach((doc) => {
    const book = doc.data();
    const li = document.createElement("li");
    li.innerHTML = `<strong>${book.name}</strong><br>ISBN: ${book.isbn}`;
    bookList.appendChild(li);
  });
}

// ---- Firestore: Search ----
searchBtn.addEventListener("click", async () => {
  const user = auth.currentUser;
  if (!user) return alert("Login first!");

  const title = searchTitle.value.trim().toLowerCase();
  const author = searchAuthor.value.trim().toLowerCase();
  const isbn = searchISBN.value.trim();

  bookList.innerHTML = "";
  const q = collection(db, "users", user.uid, "books");
  const querySnapshot = await getDocs(q);

  querySnapshot.forEach((doc) => {
    const book = doc.data();
    let match = true;

    if (title && !book.name.toLowerCase().includes(title)) match = false;
    if (isbn && book.isbn !== isbn) match = false;
    // author is optional placeholder for future (if you store authors later)

    if (match) {
      const li = document.createElement("li");
      li.innerHTML = `<strong>${book.name}</strong><br>ISBN: ${book.isbn}`;
      bookList.appendChild(li);
    }
  });
});
