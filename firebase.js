import { db } from "./firebase.js";
import { collection, addDoc, getDocs, deleteDoc, doc } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
// firebase.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

// Your Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyDRIOLQBYUVU0LopAW077qCkvkp6TAboj8",
  authDomain: "readvault-58040.firebaseapp.com",
  projectId: "readvault-58040",
  storageBucket: "readvault-58040.appspot.com",
  messagingSenderId: "735101113966",
  appId: "1:735101113966:web:73583ee54e9ac092f3b87f"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);  // ✅ Firestore connection

async function testAddBook() {
  try {
    await addDoc(collection(db, "books"), {
      title: "Test Book",
      author: "Test Author",
      isbn: "12345",
      cover: "",
      createdAt: new Date()
    });
    alert("✅ Test book added to Firestore!");
  } catch (e) {
    console.error("🔥 Error adding test book:", e);
    alert("Failed to add test book. Check console.");
  }
}

// Call test function once to try adding
testAddBook();


export { db };
