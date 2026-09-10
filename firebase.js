import { initializeApp } from "https://www.gstatic.com/firebasejs/10.14.0/firebase-app.js";

import {
  getDatabase,
  ref,
  set,
  get,
  update,
  onValue,
  push
} from "https://www.gstatic.com/firebasejs/10.14.0/firebase-database.js";

import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.14.0/firebase-auth.js";


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


// Initialize Firebase
const app = initializeApp(firebaseConfig);


// Initialize Realtime Database
const db = getDatabase(app);


// Initialize Firebase Authentication
const auth = getAuth(app);


// Export Firebase services
export {
  app,
  db,
  auth,

  ref,
  set,
  get,
  update,
  onValue,
  push,

  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged
};
