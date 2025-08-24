// Import Firebase (using modules)
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";

// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
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

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Export if needed
export { auth, db };
