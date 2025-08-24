// app.js
import { auth, db } from "./firebase.js";
import { 
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged 
} from "https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js";
import { 
  collection, addDoc, getDocs, query, where 
} from "https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";

// === SIGN UP ===
async function signup(email, password) {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    alert("Signup successful! Welcome " + userCredential.user.email);
  } catch (error) {
    alert("Signup error: " + error.message);
  }
}

// === LOGIN ===
async function login(email, password) {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    alert("Logged in as " + userCredential.user.email);
  } catch (error) {
    alert("Login error: " + error.message);
  }
}

// === LOGOUT ===
async function logout() {
  try {
    await signOut(auth);
    alert("Logged out");
  } catch (error) {
    alert("Logout error: " + error.message);
  }
}

// === LISTEN FOR AUTH CHANGES ===
onAuthStateChanged(auth, (user) => {
  if (user) {
    document.getElementById("user-status").innerText = `Logged in as ${user.email}`;
    loadBooks(user.uid);
  } else {
    document.getElementById("user-status").innerText = "Not logged in";
  }
});

// === ADD BOOK TO FIRESTORE ===
async function addBook(userId, title, author) {
  try {
    await addDoc(collection(db, "books"), {
      userId,
      title,
      author,
      createdAt: new Date()
    });
    alert("Book added!");
  } catch (error) {
    alert("Error adding book: " + error.message);
  }
}

// === LOAD USER’S BOOKS ===
async function loadBooks(userId) {
  const q = query(collection(db, "books"), where("userId", "==", userId));
  const querySnapshot = await getDocs(q);
  const bookList = document.getElementById("book-list");
  bookList.innerHTML = "";

  querySnapshot.forEach((doc) => {
    const book = doc.data();
    const li = document.createElement("li");
    li.innerText = `${book.title} by ${book.author}`;
    bookList.appendChild(li);
  });
}

// === Attach to UI buttons (example) ===
document.getElementById("signup-btn").addEventListener("click", () => {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;
  signup(email, password);
});

document.getElementById("login-btn").addEventListener("click", () => {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;
  login(email, password);
});

document.getElementById("logout-btn").addEventListener("click", logout);

document.getElementById("add-book-btn").addEventListener("click", () => {
  const title = document.getElementById("book-title").value;
  const author = document.getElementById("book-author").value;
  const user = auth.currentUser;
  if (user) {
    addBook(user.uid, title, author);
  } else {
    alert("Please log in first!");
  }
});
