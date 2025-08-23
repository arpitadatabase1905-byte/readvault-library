// Import Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-app.js";
import { getFirestore, collection, addDoc, getDocs } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";

// Your Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDRIOLQBYUVU0LopAW077qCkvkp6TAboj8",
  authDomain: "readvault-58040.firebaseapp.com",
  projectId: "readvault-58040",
  storageBucket: "readvault-58040.firebasestorage.app",
  messagingSenderId: "735101113966",
  appId: "1:735101113966:web:73583ee54e9ac092f3b87f"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// References to DOM elements
const addBookBtn = document.getElementById("addBookBtn");
const bookList = document.getElementById("bookList");

// Add a new book
addBookBtn.addEventListener("click", async () => {
  const bookName = document.getElementById("bookName").value;
  const isbn = document.getElementById("isbn").value;

  if (!bookName || !isbn) {
    alert("Please enter both book name and ISBN");
    return;
  }

  try {
    await addDoc(collection(db, "myLibrary"), {
      name: bookName,
      isbn: isbn
    });
    alert("Book added successfully!");
    document.getElementById("bookName").value = "";
    document.getElementById("isbn").value = "";
    loadBooks();
  } catch (e) {
    console.error("Error adding book: ", e);
  }
});

// Load books from Firestore
async function loadBooks() {
  bookList.innerHTML = "";
  const querySnapshot = await getDocs(collection(db, "myLibrary"));
  querySnapshot.forEach((doc) => {
    const li = document.createElement("li");
    li.textContent = `${doc.data().name} (ISBN: ${doc.data().isbn})`;
    bookList.appendChild(li);
  });
}

// Load books on page load
loadBooks();
