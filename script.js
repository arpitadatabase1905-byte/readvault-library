import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { getFirestore, collection, addDoc, getDocs, doc, setDoc, deleteDoc } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

// Firebase Config
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
const auth = getAuth(app);
const db = getFirestore(app);

// DOM Elements
const authSection = document.getElementById("authSection");
const librarySection = document.getElementById("librarySection");

const signupEmail = document.getElementById("signupEmail");
const signupPassword = document.getElementById("signupPassword");
const loginEmail = document.getElementById("loginEmail");
const loginPassword = document.getElementById("loginPassword");
const signupBtn = document.getElementById("signupBtn");
const loginBtn = document.getElementById("loginBtn");
const logoutBtn = document.getElementById("logoutBtn");

const profileEmail = document.getElementById("profileEmail");
const profileName = document.getElementById("profileName");
const profileBio = document.getElementById("profileBio");
const saveProfileBtn = document.getElementById("saveProfileBtn");

const bookList = document.getElementById("bookList");
const searchTitle = document.getElementById("searchTitle");
const searchBtn = document.getElementById("searchBtn");
const searchResultsDiv = document.getElementById("searchResults");

// SIGN UP
signupBtn.addEventListener("click", async () => {
  const email = signupEmail.value.trim();
  const password = signupPassword.value.trim();
  if (!email || !password) return alert("Enter both email and password");
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    alert("✅ Signup successful: " + userCredential.user.email);
    signupEmail.value = "";
    signupPassword.value = "";
  } catch (error) { alert("❌ " + error.message); }
});

// LOGIN
loginBtn.addEventListener("click", async () => {
  const email = loginEmail.value.trim();
  const password = loginPassword.value.trim();
  if (!email || !password) return alert("Enter both email and password");
  try { await signInWithEmailAndPassword(auth, email, password); alert("✅ Logged in!"); loginEmail.value = ""; loginPassword.value = ""; }
  catch (error) { alert("❌ " + error.message); }
});

// LOGOUT
logoutBtn.addEventListener("click", async () => { try { await signOut(auth); alert("🚪 Logged out!"); } catch (error) { alert(error.message); } });

// AUTH STATE CHANGE
onAuthStateChanged(auth, async (user) => {
  if (user) {
    authSection.classList.add("hidden");
    librarySection.classList.remove("hidden");
    loadBooks(user.uid);

    // Load Profile
    profileEmail.textContent = user.email;
    const userRef = doc(db, "users", user.uid);
    const userSnap = await getDocs(collection(db, "users"));
    const profileData = (await getDocs(collection(db, "users"))).docs.find(d => d.id === user.uid)?.data();
    profileName.value = profileData?.displayName || "";
    profileBio.value = profileData?.bio || "";

  } else {
    authSection.classList.remove("hidden");
    librarySection.classList.add("hidden");
    bookList.innerHTML = "";
    searchResultsDiv.innerHTML = "";
  }
});

// SAVE PROFILE
saveProfileBtn.addEventListener("click", async () => {
  const user = auth.currentUser;
  if (!user) return alert("Login first!");
  await setDoc(doc(db, "users", user.uid), {
    email: user.email,
    displayName: profileName.value.trim(),
    bio: profileBio.value.trim()
  }, { merge: true });
  alert("✅ Profile saved!");
});

// LOAD BOOKS
async function loadBooks(uid) {
  bookList.innerHTML = "";
  const booksRef = collection(db, "users", uid, "books");
  const snapshot = await getDocs(booksRef);

  snapshot.forEach((docItem) => {
    const book = docItem.data();
    const li = document.createElement("li");
    li.innerHTML = `
      <strong>${book.name}</strong><br>
      <em>${book.author || "Unknown author"}</em><br>
      ISBN: ${book.isbn}<br>
      ${book.cover ? `<img src="${book.cover}" alt="cover">` : ""}<br>
      <button class="deleteBtn">Delete</button>
    `;
    const deleteBtn = li.querySelector(".deleteBtn");
    deleteBtn.addEventListener("click", async () => {
      if (confirm(`Are you sure you want to delete "${book.name}"?`)) {
        await deleteDoc(doc(db, "users", uid, "books", docItem.id));
        loadBooks(uid);
      }
    });
    bookList.appendChild(li);
  });
}

// ... Firebase imports and initialization (same as before) ...

const profileToggle = document.getElementById("profileToggle");
const profileSection = document.getElementById("profileSection");

// Toggle Profile Panel
profileToggle.addEventListener("click", () => {
  if(profileSection.style.display === "none" || !profileSection.style.display){
    profileSection.style.display = "block";
  } else {
    profileSection.style.display = "none";
  }
});

// The rest of your JS (signup, login, logout, auth state, search, add books, load books, save profile) remains same


// GOOGLE BOOKS SEARCH
searchBtn.addEventListener("click", async () => {
  const query = searchTitle.value.trim();
  if (!query) return alert("Enter a book name to search");
  searchResultsDiv.innerHTML = "Searching...";
  try {
    const response = await fetch(`https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(query)}`);
    const data = await response.json();
    searchResultsDiv.innerHTML = "";
    if (!data.items || data.items.length === 0) return searchResultsDiv.innerHTML = "No books found.";
    const user = auth.currentUser;
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
        if (!user) return alert("Login first!");
        await addDoc(collection(db, "users", user.uid, "books"), { name: title, author: authors, isbn, cover: thumbnail });
        alert(`✅ "${title}" added to your library!`);
        loadBooks(user.uid);
      });
      searchResultsDiv.appendChild(div);
    });
  } catch (error) {
    searchResultsDiv.innerHTML = "Error fetching books.";
    console.error(error);
  }
});
