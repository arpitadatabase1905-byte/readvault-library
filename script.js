// ---- Firebase Setup ----
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { getFirestore, collection, addDoc, getDocs, doc, setDoc, deleteDoc, getDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

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
const bookList = document.getElementById("bookList");
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

// Profile
const profileToggle = document.getElementById("profileToggle");
const profileSection = document.getElementById("profileSection");
const profileName = document.getElementById("profileName");
const profileBio = document.getElementById("profileBio");
const profileEmail = document.getElementById("profileEmail");
const saveProfileBtn = document.getElementById("saveProfileBtn");

// ---- Signup ----
signupBtn.addEventListener("click", async () => {
  const email = signupEmail.value.trim();
  const password = signupPassword.value.trim();
  if (!email || !password) return alert("Enter both email and password");

  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const userRef = doc(db, "users", userCredential.user.uid);
    await setDoc(userRef, {
      email: email,
      displayName: "",
      bio: "",
      createdAt: serverTimestamp()
    });
    alert("✅ Signup successful!");
    signupEmail.value = "";
    signupPassword.value = "";
  } catch (error) {
    alert("❌ " + error.message);
  }
});

// ---- Login ----
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

// ---- Logout ----
logoutBtn.addEventListener("click", async () => {
  await signOut(auth);
  alert("🚪 Logged out!");
});

// ---- Auth State ----
onAuthStateChanged(auth, async (user) => {
  if (user) {
    authSection.classList.add("hidden");
    librarySection.classList.remove("hidden");
    profileEmail.textContent = user.email;
    await loadBooks(user.uid);
    await loadProfile(user.uid);
  } else {
    authSection.classList.remove("hidden");
    librarySection.classList.add("hidden");
    bookList.innerHTML = "";
    searchResultsDiv.innerHTML = "";
    profileSection.classList.add("hidden");
  }
});

// ---- Profile Toggle ----
profileToggle.addEventListener("click", () => {
  profileSection.classList.toggle("hidden");
});

// ---- Load Profile ----
async function loadProfile(uid) {
  const docSnap = await getDoc(doc(db, "users", uid));
  if (docSnap.exists()) {
    const data = docSnap.data();
    profileName.value = data.displayName || "";
    profileBio.value = data.bio || "";
  }
}

// ---- Save Profile ----
saveProfileBtn.addEventListener("click", async () => {
  const user = auth.currentUser;
  if (!user) return alert("Login first!");
  await setDoc(doc(db, "users", user.uid), {
    displayName: profileName.value.trim(),
    bio: profileBio.value.trim()
  }, { merge: true });
  alert("✅ Profile saved successfully!");
});

// ---- Books ----
async function loadBooks(uid) {
  bookList.innerHTML = "";
  const booksSnap = await getDocs(collection(db, "users", uid, "books"));
  booksSnap.forEach(docItem => {
    const book = docItem.data();
    const li = document.createElement("li");
    li.innerHTML = `
      <strong>${book.name}</strong><br>
      <em>${book.author || "Unknown author"}</em><br>
      ISBN: ${book.isbn}<br>
      ${book.cover ? `<img src="${book.cover}" alt="cover">` : ""}<br>
      <button class="editBtn">Edit</button>
      <button class="deleteBtn">Delete</button>
    `;
    li.querySelector(".editBtn").addEventListener("click", async () => {
      const newName = prompt("Edit book name:", book.name);
      const newAuthor = prompt("Edit author name:", book.author || "");
      if (!newName) return;
      await setDoc(doc(db, "users", uid, "books", docItem.id), {
        name: newName, author: newAuthor, isbn: book.isbn, cover: book.cover
      }, { merge: true });
      alert(`✏️ "${newName}" updated!`);
      loadBooks(uid);
    });
    li.querySelector(".deleteBtn").addEventListener("click", async () => {
      if (confirm(`Delete "${book.name}"?`)) {
        await deleteDoc(doc(db, "users", uid, "books", docItem.id));
        alert(`🗑 "${book.name}" deleted!`);
        loadBooks(uid);
      }
    });
    bookList.appendChild(li);
  });
}

// ---- Search & Add Books ----
searchBtn.addEventListener("click", async () => {
  const query = searchTitle.value.trim();
  if (!query) return alert("Enter a book name");
  searchResultsDiv.innerHTML = "Searching...";
  try {
    const data = await (await fetch(`https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(query)}`)).json();
    searchResultsDiv.innerHTML = "";
    if (!data.items) { searchResultsDiv.innerHTML = "No books found."; return; }
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
        <button class="addBtn">Add</button>
      `;
      div.querySelector(".addBtn").addEventListener("click", async () => {
        const user = auth.currentUser;
        if (!user) return alert("Login first!");
        await addDoc(collection(db, "users", user.uid, "books"), { name: title, author: authors, isbn, cover: thumbnail });
        alert(`✅ "${title}" added to your library!`);
        loadBooks(user.uid);
      });
      searchResultsDiv.appendChild(div);
    });
  } catch (err) {
    searchResultsDiv.innerHTML = "Error fetching books.";
    console.error(err);
  }
});
