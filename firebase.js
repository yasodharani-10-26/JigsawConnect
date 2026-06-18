import { initializeApp } from "https://www.gstatic.com/firebasejs/12.14.0/firebase-app.js";

const firebaseConfig = {
  apiKey: "AIzaSyCaCkliRZk8HmNtOsJpoA084YhNY7MeMWM",
  authDomain: "jigsawconnect-677da.firebaseapp.com",
  databaseURL: "https://jigsawconnect-677da-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "jigsawconnect-677da",
  storageBucket: "jigsawconnect-677da.firebasestorage.app",
  messagingSenderId: "200774226361",
  appId: "1:200774226361:web:266cb216968403793f6668",
  measurementId: "G-D14L7VZRJM"
};

// Initialize Core App Engine Instance
const app = initializeApp(firebaseConfig);

// Database Layer Operations
import {
  getDatabase,
  ref,
  set,
  get,
  update
} from "https://www.gstatic.com/firebasejs/12.14.0/firebase-database.js";

// Identity & Access Pipeline
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut
} from "https://www.gstatic.com/firebasejs/12.14.0/firebase-auth.js";

const db = getDatabase(app);
const auth = getAuth(app);

// Unified Module Export Grid
export {
  db,
  auth,
  ref,
  set,
  get,
  update,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut
};
