// ---- Firebase Setup ----
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { 
  getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged 
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { 
  getFirestore, collection, addDoc, getDocs, doc, setDoc, updateDoc, deleteDoc, getDoc, serverTimestamp 
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import { getStorage, ref, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-storage.js";

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
const storage = getStorage(app);

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

// Profile elements
const profileToggle = document.getElementById("profileToggle");
const profileSection = document.getElementById("profileSection");
const profileName = document.getElementById("profileName");
const profileBio = document.getElementById("profileBio");
const profilePhoto = document.getElementById("profilePhoto");
const profilePhotoInput = document.getElementById("profilePhotoInput");
const profileEmailSpan = document.getElementById("profileEmail");
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
      photoURL: "",
      createdAt: serverTimestamp()
    }, { merge: true });

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
  try {
    await signOut(auth);
    alert("🚪 Logged out!");
  } catch (error) {
    alert(error.message);
  }
});

// ---- Auth State Change ----
onAuthStateChanged(auth, async (user) => {
  if (user) {
    authSection.classList.add("hidden");
    librarySection.classList.remove("hidden");
    profileEmailSpan.textContent = user.email;
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

// ---- LOAD BOOKS ----
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
      <button class="editBtn">Edit</button>
      <button class="deleteBtn">Delete</button>
    `;

    // Edit book
    li.querySelector(".editBtn").addEventListener("click", () => {
      const newName = prompt("Edit book name:", book.name);
      const newAuthor = prompt("Edit author name:", book.author || "");
      if (!newName) return;
      setDoc(doc(db, "users", uid, "books", docItem.id), {
        name: newName,
        author: newAuthor,
        isbn: book.isbn,
        cover: book.cover
      }, { merge: true }).then(() => {
        alert(`✏️ "${newName}" updated!`);
        loadBooks(uid);
      });
    });

    // Delete book
    li.querySelector(".deleteBtn").addEventListener("click", async () => {
      if (confirm(`Are you sure you want to delete "${book.name}"?`)) {
        await deleteDoc(doc(db, "users", uid, "books", docItem.id));
        alert(`🗑 "${book.name}" deleted!`);
        loadBooks(uid);
      }
    });

    bookList.appendChild(li);
  });
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

    if (!data.items || data.items.length === 0) {
      searchResultsDiv.innerHTML = "No books found.";
      return;
    }

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

      const addBtn = div.querySelector(".addBtn");
      addBtn.addEventListener("click", async () => {
        const user = auth.currentUser;
        if (!user) return alert("Login first!");
        await addDoc(collection(db, "users", user.uid, "books"), {
          name: title,
          author: authors,
          isbn: isbn,
          cover: thumbnail
        });
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

// ---- Profile Toggle ----
profileToggle.addEventListener("click", () => {
  profileSection.classList.toggle("hidden");
});

// ---- Load Profile ----
async function loadProfile(uid) {
  const userRef = doc(db, "users", uid);
  const docSnap = await getDoc(userRef);
  if (docSnap.exists()) {
    const data = docSnap.data();
    profileName.value = data.displayName || "";
    profileBio.value = data.bio || "";
    profilePhoto.src = data.photoURL || "";
  }
}

// ---- Upload Profile Photo ----
async function uploadProfilePhoto(userId, file) {
  const storageRef = ref(storage, `profilePhotos/${userId}`);
  await uploadBytes(storageRef, file);
  const photoURL = await getDownloadURL(storageRef);
  return photoURL;
}

// ---- Save Profile ----
saveProfileBtn.addEventListener("click", async () => {
  const user = auth.currentUser;
  if (!user) return alert("Login first!");

  let photoURL = profilePhoto.src;

  if (profilePhotoInput.files.length > 0) {
    const file = profilePhotoInput.files[0];
    photoURL = await uploadProfilePhoto(user.uid, file);
  }

  const userRef = doc(db, "users", user.uid);
  await setDoc(userRef, {
    displayName: profileName.value.trim(),
    bio: profileBio.value.trim(),
    photoURL: photoURL
  }, { merge: true });

  profilePhoto.src = photoURL;
  alert("✅ Profile saved successfully!");
});
