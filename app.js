```js
import { db, ref, set, get, remove } from "./firebase.js";
import { child } from "https://www.gstatic.com/firebasejs/12.14.0/firebase-database.js";

/* ===================== CONFIG ===================== */

const TEAM_SIZE = 5;

const QUIZ_ANSWERS = {
  q1: "a",
  q2: "c",
  q3: "b",
  q4: "a",
  q5: "c",
};

/* ===================== INIT ===================== */

document.addEventListener("DOMContentLoaded", () => {
  setupMobileMenu();
  setupLogout();
  highlightActiveNav();

  setupAdminLoginPage();
  setupStudentLoginPage();

  setupAdminDashboard();
  setupStudentDashboard();
  setupResourcesPage();
  setupQuizPage();
  setupLeaderboardPage();
});

/* ===================== FIREBASE HELPERS ===================== */

async function getData(path) {
  const snapshot = await get(child(ref(db), path));
  return snapshot.exists() ? snapshot.val() : [];
}

function setData(path, data) {
  return set(ref(db, path), data);
}

function deleteData(path) {
  return remove(ref(db, path));
}

/* ===================== STUDENTS ===================== */

async function getStudents() {
  return await getData("students");
}

function saveStudents(students) {
  return setData("students", students);
}

/* ===================== TEAMS ===================== */

async function getTeams() {
  return await getData("teams");
}

function saveTeams(teams) {
  return setData("teams", teams);
}

/* ===================== SEMINAR ===================== */

async function getSeminarTopics() {
  return await getData("seminarTopics");
}

function saveSeminarTopics(topics) {
  return setData("seminarTopics", topics);
}

/* ===================== JAM ===================== */

async function getJamTopics() {
  return await getData("jamTopics");
}

function saveJamTopics(topics) {
  return setData("jamTopics", topics);
}

/* ===================== QUIZ ===================== */

async function getQuizScores() {
  return await getData("quizScores");
}

function saveQuizScores(scores) {
  return setData("quizScores", scores);
}

/* ===================== RESOURCES ===================== */

async function getResources() {
  return await getData("resources");
}

function saveResources(resources) {
  return setData("resources", resources);
}

/* ===================== MOBILE MENU ===================== */

function setupMobileMenu() {
  const toggle = document.querySelector(".menu-toggle");
  const navLinks = document.querySelector(".nav-links");

  if (!toggle || !navLinks) return;

  toggle.addEventListener("click", () => {
    navLinks.classList.toggle("active");
  });
}

/* ===================== COMMON ===================== */

function setupLogout() {}

function highlightActiveNav() {}

/* ===================== ADMIN LOGIN ===================== */

function setupAdminLoginPage() {
  const form = document.getElementById("adminLoginForm");

  if (!form) return;

  form.addEventListener("submit", (e) => {
    e.preventDefault();

    const username =
      document.getElementById("adminUsername")?.value.trim() || "";

    const password =
      document.getElementById("adminPassword")?.value.trim() || "";

    const msg = document.getElementById("loginMessage");

    if (!msg) return;

    if (username === "admin" && password === "admin123") {
      msg.style.display = "block";
      msg.style.color = "green";
      msg.textContent = "Admin Login Successful!";

      setTimeout(() => {
        window.location.href = "admin-dashboard.html";
      }, 1000);
    } else {
      msg.style.display = "block";
      msg.style.color = "red";
      msg.textContent = "Invalid Admin Credentials";
    }
  });
}

/* ===================== STUDENT LOGIN ===================== */

function setupStudentLoginPage() {
  const form = document.getElementById("studentLoginForm");

  if (!form) return;

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const username =
      document.getElementById("username")?.value.trim() || "";

    const password =
      document.getElementById("password")?.value.trim() || "";

    const students = await getStudents();

    const student = students.find(
      (s) =>
        (s.studentId === username ||
          s.email === username ||
          s.name === username) &&
        s.password === password
    );

    const msg = document.getElementById("loginMessage");

    if (!msg) return;

    if (student) {
      localStorage.setItem(
        "currentStudent",
        JSON.stringify(student)
      );

      msg.style.display = "block";
      msg.style.color = "green";
      msg.textContent = "Login Successful!";

      setTimeout(() => {
        window.location.href = "student-dashboard.html";
      }, 1000);
    } else {
      msg.style.display = "block";
      msg.style.color = "red";
      msg.textContent = "Invalid Username or Password";
    }
  });
}

/* ===================== OTHER PAGES ===================== */

function setupAdminDashboard() {}

function setupStudentDashboard() {}

function setupResourcesPage() {}

function setupQuizPage() {}

function setupLeaderboardPage() {}
```
