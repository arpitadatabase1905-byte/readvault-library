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
  getDocs 
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

// Library inputs
const bookNameInput = document.getElementById("bookName");
const isbnInput = document.getElementById("isbn");
const addBookBtn = document.getElementById("addBookBtn");
const bookList = document.getElementById("bookList");

// Search inputs
const searchTitle = document.getElementById("searchTitle");
const searchISBN = document.getElementById("searchISBN");
const searchBtn = document.getElementById("searchBtn");

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
  }
});

// ---- ADD BOOK ----
addBookBtn.addEventListener("click", async () => {
  const user = auth.currentUser;
  if (!user) return alert("Login first!");

  const name = bookNameInput.value.trim();
  const isbn = isbnInput.value.trim();

  if (!name || !isbn) return alert("Enter both book name and ISBN");

  try {
    await addDoc(collection(db, "users", user.uid, "books"), {
      name: name,
      isbn: isbn
    });
    bookNameInput.value = "";
    isbnInput.value = "";
    loadBooks(user.uid);
  } catch (error) {
    alert(error.message);
  }
});

// ---- LOAD BOOKS ----
async function loadBooks(uid) {
  bookList.innerHTML = "";
  const booksRef = collection(db, "users", uid, "books");
  const snapshot = await getDocs(booksRef);

  snapshot.forEach((doc) => {
    const book = doc.data();
    const li = document.createElement("li");
    li.innerHTML = `<strong>${book.name}</strong><br>ISBN: ${book.isbn}`;
    bookList.appendChild(li);
  });
}

// ---- SEARCH BOOKS ----
searchBtn.addEventListener("click", async () => {
  const user = auth.currentUser;
  if (!user) return alert("Login first!");

  const title = searchTitle.value.trim().toLowerCase();
  const isbn = searchISBN.value.trim();

  bookList.innerHTML = "";
  const booksRef = collection(db, "users", user.uid, "books");
  const snapshot = await getDocs(booksRef);

  snapshot.forEach((doc) => {
    const book = doc.data();
    let match = true;
    if (title && !book.name.toLowerCase().includes(title)) match = false;
    if (isbn && book.isbn !== isbn) match = false;

    if (match) {
      const li = document.createElement("li");
      li.innerHTML = `<strong>${book.name}</strong><br>ISBN: ${book.isbn}`;
      bookList.appendChild(li);
    }
  });
});
