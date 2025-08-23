// script.js
import { db } from "./firebase.js";
import { collection, addDoc, getDocs, deleteDoc, doc } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const bookList = document.getElementById("bookList");

// Add book using Google Books API or manual input
document.getElementById("addBookBtn").addEventListener("click", async () => {
  const isbn = document.getElementById("isbn").value.trim();
  const name = document.getElementById("bookName").value.trim();

  if (!isbn && !name) {
    alert("Please enter ISBN or Book Name");
    return;
  }

  try {
    let title = name;
    let author = "Unknown";
    let cover = "";

    if (isbn || name) {
      // Fetch from Google Books API
      const apiUrl = isbn
        ? `https://www.googleapis.com/books/v1/volumes?q=isbn:${isbn}`
        : `https://www.googleapis.com/books/v1/volumes?q=intitle:${encodeURIComponent(name)}`;

      const res = await fetch(apiUrl);
      const data = await res.json();

      if (data.items && data.items.length > 0) {
        const bookInfo = data.items[0].volumeInfo;
        title = bookInfo.title || name;
        author = bookInfo.authors ? bookInfo.authors.join(", ") : "Unknown";
        cover = bookInfo.imageLinks ? bookInfo.imageLinks.thumbnail : "";
      }
    }

    // Save to Firestore
    await addDoc(collection(db, "books"), {
      title: title,
      author: author,
      isbn: isbn || "N/A",
      cover: cover,
      createdAt: new Date()
    });

    document.getElementById("bookName").value = "";
    document.getElementById("isbn").value = "";
    alert("✅ Book added!");
    loadBooks();

  } catch (e) {
    console.error("Error adding book:", e);
    alert("Failed to add book ❌");
  }
});

// Load books from Firestore
async function loadBooks() {
  bookList.innerHTML = "";
  const querySnapshot = await getDocs(collection(db, "books"));

  querySnapshot.forEach((docSnap) => {
    const book = docSnap.data();

    const li = document.createElement("li");
    li.style.marginBottom = "10px";
    li.innerHTML = `
      ${book.cover ? `<img src="${book.cover}" alt="cover" style="height:60px; vertical-align:middle; margin-right:10px;">` : ""}
      <b>${book.title}</b> by ${book.author} (ISBN: ${book.isbn})
    `;

    const deleteBtn = document.createElement("button");
    deleteBtn.textContent = "❌ Delete";
    deleteBtn.style.marginLeft = "10px";
    deleteBtn.addEventListener("click", async () => {
      await deleteDoc(doc(db, "books", docSnap.id));
      alert("Book deleted ✅");
      loadBooks();
    });

    li.appendChild(deleteBtn);
    bookList.appendChild(li);
  });
}

// Load books on page start
loadBooks();
