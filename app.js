
import { db, ref, set, get, remove } from "./firebase.js";
import { child } from "https://www.gstatic.com/firebasejs/12.14.0/firebase-database.js";

/* ===================== CONFIG ===================== */

var TEAM_SIZE = 5;

var QUIZ_ANSWERS = {
  q1: "a",
  q2: "c",
  q3: "b",
  q4: "a",
  q5: "c",
};

/* ===================== INIT ===================== */

document.addEventListener("DOMContentLoaded", function () {
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
document.addEventListener("DOMContentLoaded", async () => {

  await saveStudents([
    {
      name: "Yashoda",
      rollNo: "101"
    }
  ]);

  console.log("Student Saved");

});
/* ===================== FIREBASE HELPERS ===================== */

// GET
async function getData(path) {
  const snapshot = await get(child(ref(db), path));
  return snapshot.exists() ? snapshot.val() : [];
}

// SET
function setData(path, data) {
  return set(ref(db, path), data);
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

/* ===================== DELETE ===================== */

function deleteData(path) {
  return remove(ref(db, path));
}

/* ===================== MOBILE MENU ===================== */

function setupMobileMenu() {
  const toggle = document.querySelector(".menu-toggle");
  const navLinks = document.querySelector(".nav-links");

  if (!toggle || !navLinks) return;

  toggle.addEventListener("click", function () {
    navLinks.classList.toggle("active");
  });
}

/* ===================== PLACEHOLDER FUNCTIONS ===================== */

function setupLogout() {}
function highlightActiveNav() {}
function setupAdminLoginPage() {}
function setupStudentLoginPage() {}
function setupAdminDashboard() {}
function setupStudentDashboard() {}
function setupResourcesPage() {}
function setupQuizPage() {}
function setupLeaderboardPage() {}
