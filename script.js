// ---- Firebase Setup ----
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { 
  getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged 
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { 
  getFirestore, collection, addDoc, getDocs, setDoc, doc, deleteDoc, serverTimestamp 
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
const allBooksTab = document.getElementById("allBooksTab");
const genreTab = document.getElementById("genreTab");
const genreListDiv = document.getElementById("genreList");
const searchTitle = document.getElementById("searchTitle");
const searchBtn = document.getElementById("searchBtn");
const searchResultsDiv = document.getElementById("searchResults");
const signupEmail = document.getElementById("signupEmail");
const signupPassword = document.getElementById("signupPassword");
const loginEmail = document.getElementById("loginEmail");
const loginPassword = document.getElementById("loginPassword");
const signupBtn = document.getElementById("signupBtn");
const loginBtn = document.getElementById("loginBtn");
const logoutBtn = document.getElementById("logoutBtn");
const tabButtons = document.querySelectorAll(".tabBtn");

// ---- Signup ----
signupBtn.addEventListener("click", async () => {
  const email = signupEmail.value.trim();
  const password = signupPassword.value.trim();
  if (!email || !password) return alert("Enter both email and password");

  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const userRef = doc(db, "users", userCredential.user.uid);
    await setDoc(userRef, { email, createdAt: serverTimestamp() }, { merge: true });
    alert("✅ Signup successful!");
    signupEmail.value = ""; signupPassword.value = "";
  } catch (error) { alert("❌ " + error.message); }
});

// ---- Login ----
loginBtn.addEventListener("click", async () => {
  const email = loginEmail.value.trim();
  const password = loginPassword.value.trim();
  if (!email || !password) return alert("Enter both email and password");

  try {
    await signInWithEmailAndPassword(auth, email, password);
    alert("✅ Logged in!");
    loginEmail.value = ""; loginPassword.value = "";
  } catch (error) { alert("❌ " + error.message); }
});

// ---- Logout ----
logoutBtn.addEventListener("click", async () => {
  try { await signOut(auth); alert("🚪 Logged out!"); }
  catch (error) { alert(error.message); }
});

// ---- Auth State Change ----
onAuthStateChanged(auth, async (user) => {
  if (user) {
    authSection.classList.add("hidden");
    librarySection.classList.remove("hidden");
    await loadBooks(user.uid);
  } else {
    authSection.classList.remove("hidden");
    librarySection.classList.add("hidden");
    allBooksTab.innerHTML = "";
    searchResultsDiv.innerHTML = "";
    genreListDiv.innerHTML = "";
  }
});

// ---- Load Books ----
async function loadBooks(uid) {
  allBooksTab.innerHTML = "";
  const booksRef = collection(db, "users", uid, "books");
  const snapshot = await getDocs(booksRef);

  snapshot.forEach(docItem => {
    const book = docItem.data();
    const li = document.createElement("li");
    li.innerHTML = `
      <strong>${book.name}</strong><br>
      <em>${book.author || "Unknown author"}</em><br>
      ISBN: ${book.isbn}<br>
      Genre: ${book.genre || "Unknown"}<br>
      ${book.cover ? `<img src="${book.cover}" alt="cover">` : ""}<br>
      <button class="editBtn">Edit</button>
      <button class="deleteBtn">Delete</button>
    `;

    li.querySelector(".editBtn").addEventListener("click", async () => {
      const newName = prompt("Edit book name:", book.name);
      const newAuthor = prompt("Edit author:", book.author || "");
      const newGenre = prompt("Edit genre:", book.genre || "");
      if (!newName) return;
      await setDoc(doc(db, "users", uid, "books", docItem.id), {
        name: newName, author: newAuthor, isbn: book.isbn, cover: book.cover, genre: newGenre
      }, { merge: true });
      alert(`✏️ "${newName}" updated!`);
      loadBooks(uid);
    });

    li.querySelector(".deleteBtn").addEventListener("click", async () => {
      if (confirm(`Are you sure you want to delete "${book.name}"?`)) {
        await deleteDoc(doc(db, "users", uid, "books", docItem.id));
        alert(`🗑 "${book.name}" deleted!`);
        loadBooks(uid);
      }
    });

    allBooksTab.appendChild(li);
  });
  loadBooksByGenre();
}

// ---- Google Books Search ----
searchBtn.addEventListener("click", async () => {
  const query = searchTitle.value.trim();
  if (!query) return alert("Enter a book name to search");
  searchResultsDiv.innerHTML = "Searching...";

  try {
    const response = await fetch(`https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(query)}`);
    const data = await response.json();
    searchResultsDiv.innerHTML = "";
    if (!data.items || data.items.length === 0) { searchResultsDiv.innerHTML = "No books found."; return; }

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
        <label>Genre:
          <select class="genreSelect">
            <option value="Fiction">Fiction</option>
            <option value="Non-fiction">Non-fiction</option>
            <option value="Science">Science</option>
            <option value="History">History</option>
            <option value="Fantasy">Fantasy</option>
          </select>
        </label><br>
        <button class="addBtn">Add</button>
      `;

      div.querySelector(".addBtn").addEventListener("click", async () => {
        const user = auth.currentUser;
        if (!user) return alert("Login first!");
        const selectedGenre = div.querySelector(".genreSelect").value || "Unknown";

        await addDoc(collection(db, "users", user.uid, "books"), {
          name: title, author: authors, isbn, cover: thumbnail, genre: selectedGenre
        });
        alert(`✅ "${title}" added to your library!`);
        loadBooks(user.uid);
      });

      searchResultsDiv.appendChild(div);
    });
  } catch (error) { searchResultsDiv.innerHTML = "Error fetching books."; console.error(error); }
});

// ---- Tabs ----
tabButtons.forEach(btn => {
  btn.addEventListener("click", () => {
    tabButtons.forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    if (btn.dataset.tab === "all") { allBooksTab.classList.remove("hidden"); genreTab.classList.add("hidden"); }
    else { allBooksTab.classList.add("hidden"); genreTab.classList.remove("hidden"); loadBooksByGenre(); }
  });
});

// ---- Load Books By Genre ----
async function loadBooksByGenre() {
  const user = auth.currentUser;
  if (!user) return;
  const booksRef = collection(db, "users", user.uid, "books");
  const snapshot = await getDocs(booksRef);

  const books = snapshot.docs.map(docItem => ({ id: docItem.id, ...docItem.data() }));
  const genreMap = {};
  books.forEach(book => {
    const genre = book.genre || "Unknown";
    if (!genreMap[genre]) genreMap[genre] = [];
    genreMap[genre].push(book);
  });

  genreListDiv.innerHTML = "";
  for (const [genre, booksArr] of Object.entries(genreMap)) {
    const genreDiv = document.createElement("div");
    genreDiv.innerHTML = `<h3>${genre}</h3>`;
    booksArr.forEach(book => {
      const bookDiv = document.createElement("div");
      bookDiv.classList.add("genre-item");
      bookDiv.innerHTML = `
        <strong>${book.name}</strong><br>
        <em>${book.author || "Unknown"}</em><br>
        ISBN: ${book.isbn}<br>
        ${book.cover ? `<img src="${book.cover}" alt="cover" style="height:120px;margin:5px;">` : ""}<br>
        <button class="editBtn">Edit</button>
        <button class="deleteBtn">Delete</button>
      `;

      bookDiv.querySelector(".editBtn").addEventListener("click", async () => {
        const newName = prompt("Edit book name:", book.name);
        const newAuthor = prompt("Edit author:", book.author || "");
        const newGenre = prompt("Edit genre:", book.genre || "");
        if (!newName) return;
        await setDoc(doc(db, "users", user.uid, "books", book.id), {
          name: newName, author: newAuthor, isbn: book.isbn, cover: book.cover, genre: newGenre
        }, { merge: true });
        alert(`✏️ "${newName}" updated!`);
        loadBooks(user.uid);
      });

      bookDiv.querySelector(".deleteBtn").addEventListener("click", async () => {
        if (confirm(`Are you sure you want to delete "${book.name}"?`)) {
          await deleteDoc(doc(db, "users", user.uid, "books", book.id));
          alert(`🗑 "${book.name}" deleted!`);
          loadBooks(user.uid);
        }
      });

      genreDiv.appendChild(bookDiv);
    });
    genreListDiv.appendChild(genreDiv);
  }
}
