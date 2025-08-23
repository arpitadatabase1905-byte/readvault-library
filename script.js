import { db } from "./firebase.js";
import { collection, addDoc, getDocs, deleteDoc, query, where } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const bookList = document.getElementById("bookList");

// Add book button
document.getElementById("addBookBtn").addEventListener("click", async () => {
  const isbn = document.getElementById("isbn").value.trim();
  const name = document.getElementById("bookName").value.trim();

  if (!isbn && !name) return alert("Enter ISBN or Name");

  let title = name || "Unknown Title";
  let author = "Unknown Author";
  let cover = "https://via.placeholder.com/60x90?text=No+Cover";

  try {
    const apiUrl = isbn
      ? `https://www.googleapis.com/books/v1/volumes?q=isbn:${isbn}`
      : `https://www.googleapis.com/books/v1/volumes?q=intitle:${encodeURIComponent(name)}`;

    const res = await fetch(apiUrl);
    const data = await res.json();

    if (data.items && data.items.length > 0) {
      const bookInfo = data.items[0].volumeInfo;
      title = bookInfo.title || title;
      author = bookInfo.authors ? bookInfo.authors.join(", ") : author;
      cover = bookInfo.imageLinks ? bookInfo.imageLinks.thumbnail : cover;
    }

    await addDoc(collection(db, "books"), { title, author, isbn: isbn || "N/A", cover, createdAt: new Date() });

    document.getElementById("bookName").value = "";
    document.getElementById("isbn").value = "";
    loadBooks();
  } catch (e) {
    console.error("Add book error:", e);
    alert("Failed to add book");
  }
});

// Search button
document.getElementById("searchBtn").addEventListener("click", async () => {
  const searchText = document.getElementById("searchInput").value.trim();
  const searchType = document.getElementById("searchType").value;
  if (!searchText) return alert("Enter search text");

  let q = collection(db, "books");
  if (searchType === "title") q = query(q, where("title", "==", searchText));
  if (searchType === "author") q = query(q, where("author", "==", searchText));
  if (searchType === "isbn") q = query(q, where("isbn", "==", searchText));

  const querySnapshot = await getDocs(q);
  displayBooks(querySnapshot);
});

// Load all books
async function loadBooks() {
  const querySnapshot = await getDocs(collection(db, "books"));
  displayBooks(querySnapshot);
}

// Display function
function displayBooks(querySnapshot) {
  bookList.innerHTML = "";
  if (querySnapshot.empty) return bookList.innerHTML = "<li>No books found</li>";

  querySnapshot.forEach((docSnap) => {
    const book = docSnap.data();
    const li = document.createElement("li");
    li.style.marginBottom = "10px";
    li.innerHTML = `
      <img src="${book.cover}" alt="cover" style="height:60px; vertical-align:middle; margin-right:10px;">
      <b>${book.title}</b> by ${book.author} (ISBN: ${book.isbn})
    `;
    const deleteBtn = document.createElement("button");
    deleteBtn.textContent = "❌ Delete";
    deleteBtn.style.marginLeft = "10px";
    deleteBtn.addEventListener("click", async () => {
      await deleteDoc(doc(db, "books", docSnap.id));
      loadBooks();
    });
    li.appendChild(deleteBtn);
    bookList.appendChild(li);
  });
}

loadBooks();
