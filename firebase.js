import { initializeApp } from "https://www.gstatic.com/firebasejs/12.14.0/firebase-app.js";
import {
  getDatabase,
  ref,
  set,
  push,
  get,
  remove
} from "https://www.gstatic.com/firebasejs/12.14.0/firebase-database.js";

const firebaseConfig = {
  apiKey: "AIzaSyCaCkliRZk8HmNtOsJpoA084YhNY7MeMWM",
  authDomain: "jigsawconnect-677da.firebaseapp.com",
  databaseURL: "https://jigsawconnect-677da-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "jigsawconnect-677da",
  storageBucket: "jigsawconnect-677da.firebasestorage.app",
  messagingSenderId: "200774226361",
  appId: "1:200774226361:web:266cb216968403793f6668"
};

const app = initializeApp(firebaseConfig);

export const db = getDatabase(app);
export { ref, set, push, get, remove };
