// firebase.js

import { initializeApp } from "https://www.gstatic.com/firebasejs/12.14.0/firebase-app.js";

// 🔥 Realtime Database
import {
  getDatabase,
  ref,
  set,
  push,
  get,
  remove,
  update,
  child
} from "https://www.gstatic.com/firebasejs/12.14.0/firebase-database.js";

// 🔐 Authentication (VERY IMPORTANT for login/register)
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.14.0/firebase-auth.js";

// ================= FIREBASE CONFIG =================
const firebaseConfig = {
  apiKey: "AIzaSyCaCkliZr8HkNtOsJpoA084YhNY7MeMWM",
  authDomain: "jigsawconnect-677da.firebaseapp.com",
  databaseURL: "https://jigsawconnect-677da-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "jigsawconnect-677da",
  storageBucket: "jigsawconnect-677da.firebasestorage.app",
  messagingSenderId: "200774226361",
  appId: "1:200774226361:web:266cb216968403793f6668"
};

// ================= INITIALIZE APP =================
const app = initializeApp(firebaseConfig);

// ================= SERVICES =================
export const db = getDatabase(app);
export const auth = getAuth(app);

// ================= DATABASE HELPERS =================
export {
  ref,
  set,
  push,
  get,
  remove,
  update,
  child
};

// ================= AUTH HELPERS =================
export {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged
};
