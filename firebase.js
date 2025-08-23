import { db } from "./firebase.js";
import { collection, addDoc, getDocs, deleteDoc, doc } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const bookList = document.getElementById("bookList");
const addBookBtn = document.getElementById("addBookBtn");

// ✅ Add book using Google Books API
addBookBtn.addEventListener("click", async () => {
  const isbn = document.getElementById("isbn").value.trim();
  const name = document.getElementById("bookName").value.trim();

  if (!isbn && !name) {
    alert("Please enter ISBN or Book Name");
    return;
  }

  try {
    let apiUrl = isbn
      ? `https://www.googleapis.com/books/v1/volumes?q=isbn:${isbn}`
      : `https://www.googleapis.com/books/v1/volumes?q=intitle:${encodeURIComponent(name)}`;

    console.log("📡 Fetching from:", apiUrl);
    const res = await fetch(apiUrl);
    const data = await res.json();
    console.log("📖 API Response:", data);

    if (data.items && data.items.length > 0) {
      const bookInfo = data.items[0].volumeInfo;

      const bookData = {
        title: bookInfo.title || name,
        author: bookInfo.authors ? bookInfo.authors.join(", ") : "Unknown",
        isbn: isbn || "N/A",
        cover: bookInfo.imageLinks ? bookInfo.imageLinks.thumbnail : "",
        createdAt: new Date()
      };

      console.log("💾 Saving to Firestore:", bookData);

      await addDoc(collection(db, "books"), bookData);

      document.getElementById("bookName").value = "";
      document.getElementById("isbn").value = "";
      alert("✅ Book added!");
      loadBooks();
    } else {
      alert("❌ No book found for given input");
    }
  } catch (e) {
    console.error("🔥 Error adding book:", e);
    alert("Failed to add book ❌ (check console for details)");
  }
});

// ✅ Load books from Firestore
async function loadBooks() {
  bookList.innerHTML = "";
  const querySnapshot = await getDocs(collection(db, "books"));
  console.log("📚 Loaded books:", querySnapshot.size);

  querySnapshot.forEach((docSnap) => {
    const book = docSnap.data();

    const li = document.createElement("li");
    li.innerHTML = `
      <img src="${book.cover}" alt="cover" style="height:60px; vertical-align:middle; margin-right:10px;">
      <b>${book.title}</b> by ${book.author} (ISBN: ${book.isbn})
    `;

    // 🔴 Delete button
    const deleteBtn = document.createElement("button");
    deleteBtn.textContent = "❌ Delete";
    deleteBtn.style.marginLeft = "10px";
    deleteBtn.addEventListener("click", async () => {
      await deleteDoc(doc(db, "books", docSnap.id));
      alert("🗑️ Book deleted");
      loadBooks();
    });

    li.appendChild(deleteBtn);
    bookList.appendChild(li);
  });
}

// Load when page starts
loadBooks();
