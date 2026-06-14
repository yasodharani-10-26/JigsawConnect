import { child } from "https://www.gstatic.com/firebasejs/12.14.0/firebase-database.js";

import { db, ref, set, get, remove } from "./firebase.js";
console.log("APP JS LOADED");
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

/* ===================== STUDENT LOGIN ===================== */


/* ===================== OTHER PAGES ===================== */

function setupAdminLoginPage() {
  const form = document.getElementById("adminLoginForm");

  if (!form) return;

  form.addEventListener("submit", (e) => {
    e.preventDefault();

    const email = document.getElementById("adminEmail").value.trim();
    const password = document.getElementById("adminPassword").value.trim();
    const msg = document.getElementById("loginMessage");

    if (email === "admin@gmail.com" && password === "admin123") {

      sessionStorage.setItem("role", "admin");
      sessionStorage.setItem("adminEmail", email);

      msg.style.display = "block";
      msg.style.color = "lightgreen";
      msg.textContent = "Login Successful";

      setTimeout(() => {
        window.location.href = "admin-dashboard.html";
      }, 1000);

    } else {

      msg.style.display = "block";
      msg.style.color = "red";
      msg.textContent = "Invalid Credentials";

    }
  });
}
async function setupStudentLoginPage() {
  const form = document.getElementById("studentLoginForm");

  if (!form) return;

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const username = document.getElementById("username")?.value.trim();
    const password = document.getElementById("password")?.value.trim();
    const msg = document.getElementById("loginMessage");

    const students = await getStudents();

    const student = students.find(
      (s) =>
        (s.studentId === username || s.email === username || s.name === username) &&
        s.password === password
    );

    if (student) {

      sessionStorage.setItem("role", "student");
      sessionStorage.setItem("student", JSON.stringify(student));

      msg.style.display = "block";
      msg.style.color = "green";
      msg.textContent = "Login Successful";

      setTimeout(() => {
        window.location.href = "student-dashboard.html";
      }, 1000);

    } else {
      msg.style.display = "block";
      msg.style.color = "red";
      msg.textContent = "Invalid Credentials";
    }
  });
}



async function askAI() {

  const input = document.getElementById("aiInput");
  const question = input.value.trim();

  if (!question) return;

  const chat = document.getElementById("chatMessages");

  chat.innerHTML += `<p><b>You:</b> ${question}</p>`;

  try {

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${API_KEY}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: question
            }]
          }]
        })
      }
    );

    const data = await response.json();

    const answer =
      data.candidates?.[0]?.content?.parts?.[0]?.text ||
      "No response.";

    chat.innerHTML += `<p><b>AI:</b> ${answer}</p>`;

    chat.scrollTop = chat.scrollHeight;

  } catch (e) {

    chat.innerHTML += `<p><b>AI:</b> Error connecting to Gemini.</p>`;
  }

  input.value = "";
}
document.querySelectorAll(".group-card button").forEach(btn => {
  btn.addEventListener("click", () => {
    alert("Group Joined Successfully 🚀");
  });
});

function setupQuizPage() {
  const form = document.getElementById("quizForm");
  if (!form) return;

  form.addEventListener("submit", (e) => {
    e.preventDefault();

    let score = 0;

    const answers = {
      q1: "Packets",
      q2: "All of the above",
      q3: "Not packet based",
      q4: "RIP",
      q5: "Bellman-Ford",
      q6: "Clusters",
      q7: "20 bytes",
      q8: "Multiplex",
      q9: "Process",
      q10: "TCP & UDP"
    };

    for (let q in answers) {
      const selected = document.querySelector(`input[name="${q}"]:checked`);
      if (selected && selected.value === answers[q]) {
        score++;
      }
    }

    // Save locally
    localStorage.setItem("quizScore", score);

    // Save to Firebase (optional leaderboard use)
    const student = JSON.parse(sessionStorage.getItem("student"));

    if (student) {
      const id = Date.now();

      set(ref(db, "quizScores/" + id), {
        name: student.name,
        email: student.email,
        score: score,
        time: new Date().toISOString()
      });
    }

    alert("Quiz Submitted! Score: " + score);

    window.location.href = "leaderboard.html";
  });
}
function setupResourcesPage() {
 const container = document.getElementById("resourceList");
  if (!container) return;

  // Example: load from Firebase
  getResources().then((resources) => {
    container.innerHTML = "";

    resources.forEach((r) => {
      const div = document.createElement("div");
      div.className = "resource-card";

      div.innerHTML = `
        <h3>${r.title}</h3>
        <p>${r.description || ""}</p>
        <a href="${r.link}" target="_blank">Open</a>
      `;

      container.appendChild(div);
    });
  });
}
function setupLeaderboardPage() {
  const table = document.getElementById("leaderboardTable");
  if (!table) return;

  getQuizScores().then((data) => {
    if (!data) return;

    let arr = Object.values(data);

    // sort by score descending
    arr.sort((a, b) => b.score - a.score);

    table.innerHTML = "";

    arr.forEach((item, index) => {
      const row = document.createElement("tr");

      row.innerHTML = `
        <td>${index + 1}</td>
        <td>${item.name}</td>
        <td>${item.score}</td>
        <td>${item.time.split("T")[0]}</td>
      `;

      table.appendChild(row);
    });
  });
}
