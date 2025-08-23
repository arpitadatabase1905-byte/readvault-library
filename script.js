import { db } from "./firebase.js";
import { collection, addDoc } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

document.getElementById("addBookBtn").addEventListener("click", async () => {
  const name = document.getElementById("bookName").value;
  const isbn = document.getElementById("isbn").value;

  if (name && isbn) {
    try {
      await addDoc(collection(db, "books"), {
        name: name,
        isbn: isbn,
        createdAt: new Date()
      });
      alert("Book added to library ✅");
    } catch (e) {
      console.error("Error adding book: ", e);
      alert("Failed to add book ❌");
    }
  } else {
    alert("Please fill both fields");
  }
});

