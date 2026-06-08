/* ============================================
   StudyConnect College Project
   HTML + CSS + JavaScript + localStorage
   ============================================ */

var TEAM_SIZE = 5;

var STORAGE_KEYS = {
  students: "scp_students",
  teams: "scp_teams",
  seminarTopics: "scp_seminar_topics",
  jamTopics: "scp_jam_topics",
  quizScores: "scp_quiz_scores",
  resources: "scp_resources",
};

var MAX_FILE_SIZE = 2 * 1024 * 1024;

var QUIZ_ANSWERS = {
  q1: "a",
  q2: "c",
  q3: "b",
  q4: "a",
  q5: "c",
};

document.addEventListener("DOMContentLoaded", function () {
  initStorage();
  migrateStudentRecords();
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

/* ========== localStorage helpers ========== */

function getData(key) {
  try {
    var raw = localStorage.getItem(key);
    if (!raw) return [];
    var data = JSON.parse(raw);
    return Array.isArray(data) ? data : [];
  } catch (err) {
    return [];
  }
}

function saveData(key, data) {
  try {
    localStorage.setItem(key, JSON.stringify(data));
    return true;
  } catch (err) {
    return false;
  }
}

function initStorage() {
  var students = getStudents();
  var demoIndex = -1;

  for (var i = 0; i < students.length; i++) {
    if (normalizeText(students[i].studentId) === "stu001") {
      demoIndex = i;
      break;
    }
  }

  if (demoIndex === -1) {
    students.push({
      id: "stu_demo_1",
      name: "Demo Student",
      studentId: "STU001",
      email: "demo@college.edu",
      password: "pass123",
    });
    saveStudents(students);
    return;
  }

  if (!normalizePassword(students[demoIndex].password)) {
    students[demoIndex].password = "pass123";
    saveStudents(students);
  }
}

function getStudents() {
  return getData(STORAGE_KEYS.students);
}

function saveStudents(students) {
  saveData(STORAGE_KEYS.students, students);
}

function getTeams() {
  return getData(STORAGE_KEYS.teams);
}

function saveTeams(teams) {
  saveData(STORAGE_KEYS.teams, teams);
}

function getSeminarTopics() {
  return getData(STORAGE_KEYS.seminarTopics);
}

function saveSeminarTopics(topics) {
  saveData(STORAGE_KEYS.seminarTopics, topics);
}

function getJamTopics() {
  return getData(STORAGE_KEYS.jamTopics);
}

function saveJamTopics(topics) {
  saveData(STORAGE_KEYS.jamTopics, topics);
}

function getQuizScores() {
  return getData(STORAGE_KEYS.quizScores);
}

function saveQuizScores(scores) {
  saveData(STORAGE_KEYS.quizScores, scores);
}

function getResources() {
  return getData(STORAGE_KEYS.resources);
}

function saveResourcesList(resources) {
  saveData(STORAGE_KEYS.resources, resources);
}

function formatFileSize(bytes) {
  if (bytes < 1024) return bytes + " B";
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
  return (bytes / (1024 * 1024)).toFixed(1) + " MB";
}

function getResourceIcon(type) {
  var icons = { PDF: "📕", Notes: "📒", Guide: "📙", Document: "📘" };
  return icons[type] || "📄";
}

function generateId(prefix) {
  return prefix + "_" + Date.now() + "_" + Math.floor(Math.random() * 1000);
}

/* ========== Session / Auth ========== */

function getSession() {
  return {
    role: sessionStorage.getItem("role"),
    username: sessionStorage.getItem("username"),
    studentId: sessionStorage.getItem("studentId"),
    name: sessionStorage.getItem("name"),
  };
}

function isAdmin() {
  return sessionStorage.getItem("role") === "admin";
}

function isStudent() {
  return sessionStorage.getItem("role") === "student";
}

function requireAdmin() {
  if (!isAdmin()) {
    alert("Admin access only. Please log in as admin.");
    window.location.href = "admin-login.html";
    return false;
  }
  return true;
}

function requireStudent() {
  if (!isStudent()) {
    alert("Please log in as a student.");
    window.location.href = "student-login.html";
    return false;
  }
  return true;
}

function requireLogin() {
  if (!isAdmin() && !isStudent()) {
    window.location.href = "student-login.html";
    return false;
  }
  return true;
}

/* ========== Shared UI ========== */

function setupMobileMenu() {
  var toggle = document.querySelector(".menu-toggle");
  var navLinks = document.querySelector(".nav-links");
  if (!toggle || !navLinks) return;

  toggle.addEventListener("click", function () {
    navLinks.classList.toggle("open");
  });

  navLinks.querySelectorAll("a").forEach(function (link) {
    link.addEventListener("click", function () {
      navLinks.classList.remove("open");
    });
  });
}

function setupLogout() {
  document.querySelectorAll(".logout-btn").forEach(function (link) {
    link.addEventListener("click", function () {
      sessionStorage.clear();
    });
  });
}

function highlightActiveNav() {
  var currentPage = window.location.pathname.split("/").pop() || "index.html";
  document.querySelectorAll(".nav-links a, .dashboard-nav a").forEach(function (link) {
    if (link.getAttribute("href") === currentPage) {
      link.classList.add("active");
    }
  });
}

function getStudentTeam(studentId) {
  var teams = getTeams();
  for (var i = 0; i < teams.length; i++) {
    if (teams[i].memberIds.indexOf(studentId) !== -1) {
      return teams[i];
    }
  }
  return null;
}

function getStudentById(studentId) {
  var students = getStudents();
  for (var i = 0; i < students.length; i++) {
    if (students[i].id === studentId) return students[i];
  }
  return null;
}

function getAvailableStudents() {
  var students = getStudents();
  var teams = getTeams();
  var assigned = {};

  teams.forEach(function (team) {
    team.memberIds.forEach(function (id) {
      assigned[id] = true;
    });
  });

  return students.filter(function (s) {
    return !assigned[s.id];
  });
}

/* ========== Student account helpers ========== */

function normalizeText(value) {
  return (value || "").trim().toLowerCase();
}

function normalizePassword(value) {
  return (value || "").trim();
}

function passwordsMatch(stored, entered) {
  return normalizePassword(stored) === normalizePassword(entered);
}

function migrateStudentRecords() {
  var students = getData(STORAGE_KEYS.students);
  if (!students.length) return;

  var cleaned = students.map(function (s) {
    return {
      id: s.id || generateId("stu"),
      name: (s.name || "").trim(),
      studentId: (s.studentId || "").trim(),
      email: (s.email || "").trim(),
      password: normalizePassword(s.password),
    };
  });

  saveStudents(cleaned);
}

function findStudentByLogin(username) {
  var login = normalizeText(username);
  var students = getStudents();

  for (var i = 0; i < students.length; i++) {
    if (
      normalizeText(students[i].studentId) === login ||
      normalizeText(students[i].email) === login ||
      normalizeText(students[i].name) === login
    ) {
      return students[i];
    }
  }
  return null;
}

function studentIdExists(studentId) {
  var id = normalizeText(studentId);
  return getStudents().some(function (s) {
    return normalizeText(s.studentId) === id;
  });
}

function studentEmailExists(email) {
  var mail = normalizeText(email);
  return getStudents().some(function (s) {
    return normalizeText(s.email) === mail;
  });
}

function addStudentRecord(name, studentId, email, password) {
  if (studentIdExists(studentId)) {
    return { ok: false, message: "Student ID already exists." };
  }
  if (studentEmailExists(email)) {
    return { ok: false, message: "Email already exists." };
  }
  var cleanPassword = normalizePassword(password);

  if (cleanPassword.length < 4) {
    return { ok: false, message: "Password must be at least 4 characters." };
  }

  var students = getStudents();
  students.push({
    id: generateId("stu"),
    name: name.trim(),
    studentId: studentId.trim(),
    email: email.trim(),
    password: cleanPassword,
  });
  saveStudents(students);
  return { ok: true };
}

function loginStudent(student) {
  sessionStorage.setItem("role", "student");
  sessionStorage.setItem("username", student.studentId);
  sessionStorage.setItem("studentId", student.id);
  sessionStorage.setItem("name", student.name);
  window.location.href = "dashboard.html";
}

function showLoginMessage(text, type) {
  var box = document.getElementById("loginMessage");
  if (!box) return;
  box.textContent = text;
  box.className = "login-message " + (type || "error");
  box.style.display = "block";
}

function clearLoginMessage() {
  var box = document.getElementById("loginMessage");
  if (!box) return;
  box.textContent = "";
  box.style.display = "none";
}

/* ========== Login Page ========== */

function bindLoginForm(formId, loginType) {
  var form = document.getElementById(formId);
  if (!form || form.dataset.ready === "true") return;
  form.dataset.ready = "true";

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    clearLoginMessage();

    var usernameInput = document.getElementById("username");
    var passwordInput = document.getElementById("password");
    var submitBtn = form.querySelector('button[type="submit"]');

    if (!usernameInput || !passwordInput) return;

    var username = usernameInput.value.trim();
    var password = normalizePassword(passwordInput.value);

    if (!username || !password) {
      showLoginMessage("Please enter username and password.", "error");
      return;
    }

    var result;

    if (loginType === "admin") {
      if (normalizeText(username) === "admin" && password === "admin123") {
        sessionStorage.setItem("role", "admin");
        sessionStorage.setItem("username", "admin");
        sessionStorage.setItem("name", "Administrator");
        sessionStorage.removeItem("studentId");
        result = { ok: true, role: "admin" };
      } else {
        result = { ok: false, message: "Invalid admin username or password." };
      }
    } else {
      var student = findStudentByLogin(username);
      if (!student) {
        result = {
          ok: false,
          message: "Account not found. Ask admin to add you. Demo: STU001 / pass123",
        };
      } else if (!passwordsMatch(student.password, password)) {
        result = { ok: false, message: "Incorrect password. Use password set by admin." };
      } else {
        sessionStorage.setItem("role", "student");
        sessionStorage.setItem("username", student.studentId);
        sessionStorage.setItem("studentId", student.id);
        sessionStorage.setItem("name", student.name);
        result = { ok: true, role: "student" };
      }
    }

    if (!result.ok) {
      showLoginMessage(result.message, "error");
      passwordInput.value = "";
      passwordInput.focus();
      return;
    }

    showLoginMessage("Login successful. Redirecting...", "success");
    window.location.href =
      result.role === "admin" ? "admin-dashboard.html" : "dashboard.html";
  });
}

function setupAdminLoginPage() {
  bindLoginForm("adminLoginForm", "admin");
}

function setupStudentLoginPage() {
  bindLoginForm("studentLoginForm", "student");
}

/* ========== Admin Dashboard ========== */

function setupAdminDashboard() {
  if (!document.getElementById("adminPage")) return;
  if (!requireAdmin()) return;

  document.getElementById("adminWelcome").textContent =
    "Welcome, " + (getSession().name || "Admin") + "!";

  renderAdminStats();
  setupAddStudentForm();
  setupCreateTeamForm();
  setupAdminResourceUpload();
  renderStudentsTable();
  renderTeamsList();
  renderAdminResourcesList();
  renderAdminScores();
}

function renderAdminStats() {
  var el = function (id) {
    return document.getElementById(id);
  };
  if (el("statStudents")) el("statStudents").textContent = getStudents().length;
  if (el("statTeams")) el("statTeams").textContent = getTeams().length;
  if (el("statResources")) el("statResources").textContent = getResources().length;
  if (el("statScores")) el("statScores").textContent = getQuizScores().length;
}

function setupAddStudentForm() {
  var form = document.getElementById("addStudentForm");
  if (!form) return;

  form.addEventListener("submit", function (e) {
    e.preventDefault();

    var name = document.getElementById("studentName").value.trim();
    var studentId = document.getElementById("studentRoll").value.trim();
    var email = document.getElementById("studentEmail").value.trim();
    var password = normalizePassword(
      document.getElementById("studentPassword").value,
    );

    if (!name || !studentId || !email || !password) {
      alert("Please fill all student fields.");
      return;
    }

    var result = addStudentRecord(name, studentId, email, password);
    if (!result.ok) {
      alert(result.message);
      return;
    }

    var students = getStudents();
    form.reset();
    renderStudentsTable();
    renderAdminStats();
    populateTeamMemberSelect();
    alert("Student added successfully!");
  });
}

function renderStudentsTable() {
  var tbody = document.getElementById("studentsTableBody");
  if (!tbody) return;

  var students = getStudents();
  tbody.innerHTML = "";

  if (students.length === 0) {
    tbody.innerHTML =
      '<tr><td colspan="5" class="empty-cell">No students yet. Add students above.</td></tr>';
    return;
  }

  students.forEach(function (s) {
    var team = getStudentTeam(s.id);
    var row = document.createElement("tr");
    row.innerHTML =
      "<td>" +
      s.name +
      "</td><td>" +
      s.studentId +
      "</td><td>" +
      s.email +
      "</td><td>" +
      (team ? team.name : "Not assigned") +
      '</td><td><button type="button" class="btn btn-outline btn-sm" data-id="' +
      s.id +
      '">Delete</button></td>';
    tbody.appendChild(row);
  });

  tbody.querySelectorAll("button").forEach(function (btn) {
    btn.addEventListener("click", function () {
      deleteStudent(btn.getAttribute("data-id"));
    });
  });
}

function deleteStudent(id) {
  if (!confirm("Delete this student?")) return;

  var students = getStudents().filter(function (s) {
    return s.id !== id;
  });
  saveStudents(students);

  var teams = getTeams().map(function (team) {
    return {
      id: team.id,
      name: team.name,
      memberIds: team.memberIds.filter(function (mid) {
        return mid !== id;
      }),
    };
  });
  saveTeams(teams);

  renderStudentsTable();
  renderTeamsList();
  renderAdminStats();
  populateTeamMemberSelect();
}

function populateTeamMemberSelect() {
  var select = document.getElementById("teamMembers");
  if (!select) return;

  var available = getAvailableStudents();
  select.innerHTML = "";

  if (available.length === 0) {
    select.innerHTML = '<option value="">No available students</option>';
    return;
  }

  available.forEach(function (s) {
    var opt = document.createElement("option");
    opt.value = s.id;
    opt.textContent = s.name + " (" + s.studentId + ")";
    select.appendChild(opt);
  });
}

function setupCreateTeamForm() {
  populateTeamMemberSelect();

  var form = document.getElementById("createTeamForm");
  if (!form) return;

  form.addEventListener("submit", function (e) {
    e.preventDefault();

    var teamName = document.getElementById("teamName").value.trim();
    var select = document.getElementById("teamMembers");
    var selected = [];

    for (var i = 0; i < select.options.length; i++) {
      if (select.options[i].selected && select.options[i].value) {
        selected.push(select.options[i].value);
      }
    }

    if (!teamName) {
      alert("Enter a team name.");
      return;
    }

    if (selected.length === 0) {
      alert("Select at least one student.");
      return;
    }

    if (selected.length > TEAM_SIZE) {
      alert("Maximum " + TEAM_SIZE + " members per team.");
      return;
    }

    var teams = getTeams();
    teams.push({
      id: generateId("team"),
      name: teamName,
      memberIds: selected,
    });

    saveTeams(teams);
    form.reset();
    populateTeamMemberSelect();
    renderTeamsList();
    renderStudentsTable();
    renderAdminStats();
    populateTeamSelects();
    alert('Team "' + teamName + '" created with ' + selected.length + " members!");
  });
}

function renderTeamsList() {
  var container = document.getElementById("teamsList");
  if (!container) return;

  var teams = getTeams();
  container.innerHTML = "";

  if (teams.length === 0) {
    container.innerHTML = '<p class="empty-message">No teams created yet.</p>';
    return;
  }

  teams.forEach(function (team) {
    var members = team.memberIds
      .map(function (id) {
        var s = getStudentById(id);
        return s ? s.name : "Unknown";
      })
      .join(", ");

    var card = document.createElement("article");
    card.className = "item-card";
    card.innerHTML =
      "<div><h3>👥 " +
      team.name +
      "</h3><p class=\"meta\">" +
      team.memberIds.length +
      " / " +
      TEAM_SIZE +
      " members</p><p class=\"meta\">" +
      members +
      '</p></div><button type="button" class="btn btn-outline btn-sm" data-id="' +
      team.id +
      '">Delete Team</button>';
    container.appendChild(card);
  });

  container.querySelectorAll("button").forEach(function (btn) {
    btn.addEventListener("click", function () {
      deleteTeam(btn.getAttribute("data-id"));
    });
  });
}

function deleteTeam(id) {
  if (!confirm("Delete this team?")) return;

  var teams = getTeams().filter(function (t) {
    return t.id !== id;
  });
  saveTeams(teams);

  var seminars = getSeminarTopics().map(function (t) {
    if (t.teamId === id) t.teamId = "";
    return t;
  });
  saveSeminarTopics(seminars);

  var jams = getJamTopics().map(function (t) {
    if (t.teamId === id) t.teamId = "";
    return t;
  });
  saveJamTopics(jams);

  renderTeamsList();
  renderStudentsTable();
  renderAdminStats();
  populateTeamMemberSelect();
  populateTeamSelects();
  renderSeminarAssignments();
  renderJamAssignments();
}

function populateTeamSelects() {
  ["seminarTeam", "jamTeam"].forEach(function (id) {
    var select = document.getElementById(id);
    if (!select) return;

    var teams = getTeams();
    select.innerHTML = '<option value="">Select team</option>';
    teams.forEach(function (team) {
      var opt = document.createElement("option");
      opt.value = team.id;
      opt.textContent = team.name + " (" + team.memberIds.length + "/" + TEAM_SIZE + ")";
      select.appendChild(opt);
    });
  });
}

function setupAssignSeminarForm() {
  populateTeamSelects();

  var form = document.getElementById("assignSeminarForm");
  if (!form) return;

  form.addEventListener("submit", function (e) {
    e.preventDefault();

    var title = document.getElementById("seminarTitle").value.trim();
    var description = document.getElementById("seminarDesc").value.trim();
    var teamId = document.getElementById("seminarTeam").value;

    if (!title || !teamId) {
      alert("Enter seminar title and select a team.");
      return;
    }

    var topics = getSeminarTopics();
    topics.push({
      id: generateId("sem"),
      title: title,
      description: description,
      teamId: teamId,
      date: new Date().toLocaleDateString(),
    });

    saveSeminarTopics(topics);
    form.reset();
    renderSeminarAssignments();
    renderAdminStats();
    alert("Seminar topic assigned!");
  });
}

function renderSeminarAssignments() {
  var container = document.getElementById("seminarList");
  if (!container) return;

  var topics = getSeminarTopics();
  var teams = getTeams();
  container.innerHTML = "";

  if (topics.length === 0) {
    container.innerHTML = '<p class="empty-message">No seminar topics assigned.</p>';
    return;
  }

  topics.forEach(function (topic) {
    var teamName = "Unassigned";
    teams.forEach(function (t) {
      if (t.id === topic.teamId) teamName = t.name;
    });

    var card = document.createElement("article");
    card.className = "item-card";
    card.innerHTML =
      "<div><h3>📢 " +
      topic.title +
      "</h3><p class=\"meta\">Team: " +
      teamName +
      "</p><p>" +
      (topic.description || "") +
      '</p></div><button type="button" class="btn btn-outline btn-sm" data-id="' +
      topic.id +
      '">Delete</button>';
    container.appendChild(card);
  });

  container.querySelectorAll("button").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var id = btn.getAttribute("data-id");
      var filtered = getSeminarTopics().filter(function (t) {
        return t.id !== id;
      });
      saveSeminarTopics(filtered);
      renderSeminarAssignments();
      renderAdminStats();
    });
  });
}

function setupAssignJamForm() {
  var form = document.getElementById("assignJamForm");
  if (!form) return;

  form.addEventListener("submit", function (e) {
    e.preventDefault();

    var title = document.getElementById("jamTitle").value.trim();
    var description = document.getElementById("jamDesc").value.trim();
    var teamId = document.getElementById("jamTeam").value;

    if (!title || !teamId) {
      alert("Enter JAM topic and select a team.");
      return;
    }

    var topics = getJamTopics();
    topics.push({
      id: generateId("jam"),
      title: title,
      description: description,
      teamId: teamId,
      date: new Date().toLocaleDateString(),
    });

    saveJamTopics(topics);
    form.reset();
    renderJamAssignments();
    renderAdminStats();
    alert("JAM topic assigned!");
  });
}

function renderJamAssignments() {
  var container = document.getElementById("jamList");
  if (!container) return;

  var topics = getJamTopics();
  var teams = getTeams();
  container.innerHTML = "";

  if (topics.length === 0) {
    container.innerHTML = '<p class="empty-message">No JAM topics assigned.</p>';
    return;
  }

  topics.forEach(function (topic) {
    var teamName = "Unassigned";
    teams.forEach(function (t) {
      if (t.id === topic.teamId) teamName = t.name;
    });

    var card = document.createElement("article");
    card.className = "item-card";
    card.innerHTML =
      "<div><h3>🎤 " +
      topic.title +
      "</h3><p class=\"meta\">Team: " +
      teamName +
      "</p><p>" +
      (topic.description || "") +
      '</p></div><button type="button" class="btn btn-outline btn-sm" data-id="' +
      topic.id +
      '">Delete</button>';
    container.appendChild(card);
  });

  container.querySelectorAll("button").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var id = btn.getAttribute("data-id");
      var filtered = getJamTopics().filter(function (t) {
        return t.id !== id;
      });
      saveJamTopics(filtered);
      renderJamAssignments();
      renderAdminStats();
    });
  });
}

/* ========== Student Dashboard ========== */

function setupStudentDashboard() {
  if (!document.getElementById("studentPage")) return;
  if (!requireStudent()) return;

  var session = getSession();
  document.getElementById("studentWelcome").textContent =
    "Welcome, " + session.name + "!";

  var team = getStudentTeam(session.studentId);
  var teamBox = document.getElementById("myTeamInfo");
  var membersBox = document.getElementById("myTeamMembers");

  if (!team) {
    teamBox.innerHTML = "<p>You are not assigned to a team yet.</p>";
    membersBox.innerHTML = "";
  } else {
    teamBox.innerHTML =
      "<h3>👥 " +
      team.name +
      "</h3><p class=\"meta\">" +
      team.memberIds.length +
      " / " +
      TEAM_SIZE +
      " members</p>";

    membersBox.innerHTML = "";
    team.memberIds.forEach(function (id) {
      var s = getStudentById(id);
      var li = document.createElement("li");
      li.className = "member-chip";
      li.textContent = s ? s.name + " (" + s.studentId + ")" : "Unknown";
      if (id === session.studentId) li.classList.add("is-me");
      membersBox.appendChild(li);
    });
  }

}

function setupAdminResourceUpload() {
  var form = document.getElementById("adminResourceForm");
  if (!form || form.dataset.ready === "true") return;
  form.dataset.ready = "true";

  form.addEventListener("submit", function (e) {
    e.preventDefault();

    var title = document.getElementById("resourceTitle").value.trim();
    var type = document.getElementById("resourceType").value;
    var subject = document.getElementById("resourceSubject").value.trim();
    var fileInput = document.getElementById("resourceFile");

    if (!title || !subject || !fileInput.files[0]) {
      alert("Fill all fields and select a file.");
      return;
    }

    var file = fileInput.files[0];
    if (file.size > MAX_FILE_SIZE) {
      alert("File too large. Max 2 MB for localStorage demo.");
      return;
    }

    var reader = new FileReader();
    reader.onload = function () {
      var resources = getResources();
      resources.unshift({
        id: generateId("res"),
        title: title,
        type: type,
        subject: subject,
        fileName: file.name,
        fileSize: formatFileSize(file.size),
        fileData: reader.result,
        emoji: getResourceIcon(type),
        date: new Date().toLocaleDateString(),
      });
      saveResourcesList(resources);
      form.reset();
      renderAdminResourcesList();
      renderAdminStats();
      alert('Resource "' + title + '" uploaded!');
    };
    reader.readAsDataURL(file);
  });
}

function renderAdminResourcesList() {
  var container = document.getElementById("adminResourcesList");
  if (!container) return;

  var resources = getResources();
  container.innerHTML = "";

  if (resources.length === 0) {
    container.innerHTML = '<p class="empty-message">No resources uploaded yet.</p>';
    return;
  }

  resources.forEach(function (r) {
    var card = document.createElement("article");
    card.className = "item-card";
    card.innerHTML =
      "<div><h3>" +
      (r.emoji || "📄") +
      " " +
      r.title +
      '</h3><p class="meta">' +
      r.type +
      " · " +
      r.fileSize +
      " · " +
      r.subject +
      '</p></div><button type="button" class="btn btn-outline btn-sm" data-id="' +
      r.id +
      '">Delete</button>';
    container.appendChild(card);
  });

  container.querySelectorAll("button").forEach(function (btn) {
    btn.addEventListener("click", function () {
      if (!confirm("Delete this resource?")) return;
      var id = btn.getAttribute("data-id");
      saveResourcesList(getResources().filter(function (r) {
        return r.id !== id;
      }));
      renderAdminResourcesList();
      renderAdminStats();
    });
  });
}

function renderAdminScores() {
  var tbody = document.getElementById("adminScoresBody");
  if (!tbody) return;

  var scores = getQuizScores();
  scores.sort(function (a, b) {
    if (b.percent !== a.percent) return b.percent - a.percent;
    return b.score - a.score;
  });

  tbody.innerHTML = "";

  if (scores.length === 0) {
    tbody.innerHTML =
      '<tr><td colspan="4" class="empty-cell">No quiz scores yet.</td></tr>';
    return;
  }

  scores.forEach(function (s) {
    var row = document.createElement("tr");
    row.innerHTML =
      "<td>" +
      s.studentName +
      "</td><td>" +
      s.score +
      " / " +
      s.total +
      "</td><td>" +
      s.percent +
      "%</td><td>" +
      s.date +
      "</td>";
    tbody.appendChild(row);
  });
}

function setupResourcesPage() {
  var list = document.getElementById("resourceList");
  if (!list) return;

  renderStudentResources();
  var search = document.getElementById("resourceSearch");
  if (search) {
    search.addEventListener("input", function () {
      var text = search.value.toLowerCase();
      document.querySelectorAll(".resource-item").forEach(function (item) {
        var title = (item.getAttribute("data-title") || "").toLowerCase();
        var type = (item.getAttribute("data-type") || "").toLowerCase();
        var subject = (item.getAttribute("data-subject") || "").toLowerCase();
        item.style.display =
          title.includes(text) || type.includes(text) || subject.includes(text)
            ? ""
            : "none";
      });
    });
  }
}

function renderStudentResources() {
  var list = document.getElementById("resourceList");
  if (!list) return;

  var resources = getResources();
  list.innerHTML = "";

  if (resources.length === 0) {
    list.innerHTML =
      '<p class="empty-message">No resources yet. Admin will upload materials.</p>';
    return;
  }

  resources.forEach(function (r) {
    var card = document.createElement("article");
    card.className = "item-card resource-item";
    card.setAttribute("data-title", r.title);
    card.setAttribute("data-type", r.type);
    card.setAttribute("data-subject", r.subject);
    card.innerHTML =
      "<div><h3>" +
      (r.emoji || "📄") +
      " " +
      r.title +
      '</h3><p class="meta">' +
      r.type +
      " · " +
      r.fileSize +
      " · " +
      r.subject +
      '</p></div><button type="button" class="btn btn-primary btn-sm" data-id="' +
      r.id +
      '">Download</button>';
    list.appendChild(card);
  });

  list.querySelectorAll("button").forEach(function (btn) {
    btn.addEventListener("click", function () {
      downloadResource(btn.getAttribute("data-id"));
    });
  });
}

function downloadResource(id) {
  var resources = getResources();
  var resource = null;
  for (var i = 0; i < resources.length; i++) {
    if (resources[i].id === id) {
      resource = resources[i];
      break;
    }
  }
  if (!resource) {
    alert("Resource not found.");
    return;
  }
  if (resource.fileData) {
    var link = document.createElement("a");
    link.href = resource.fileData;
    link.download = resource.fileName;
    link.click();
  } else {
    alert('Downloading: "' + resource.title + '"');
  }
}

function renderStudentTopics(team) {
  var seminarBox = document.getElementById("mySeminarTopics");
  var jamBox = document.getElementById("myJamTopics");

  if (!seminarBox || !jamBox) return;

  seminarBox.innerHTML = "";
  jamBox.innerHTML = "";

  if (!team) {
    seminarBox.innerHTML = "<p class=\"empty-message\">Join a team to see seminar topics.</p>";
    jamBox.innerHTML = "<p class=\"empty-message\">Join a team to see JAM topics.</p>";
    return;
  }

  var seminars = getSeminarTopics().filter(function (t) {
    return t.teamId === team.id;
  });
  var jams = getJamTopics().filter(function (t) {
    return t.teamId === team.id;
  });

  if (seminars.length === 0) {
    seminarBox.innerHTML = "<p class=\"empty-message\">No seminar topic assigned yet.</p>";
  } else {
    seminars.forEach(function (t) {
      var div = document.createElement("div");
      div.className = "topic-card";
      div.innerHTML = "<h4>" + t.title + "</h4><p>" + (t.description || "") + "</p>";
      seminarBox.appendChild(div);
    });
  }

  if (jams.length === 0) {
    jamBox.innerHTML = "<p class=\"empty-message\">No JAM topic assigned yet.</p>";
  } else {
    jams.forEach(function (t) {
      var div = document.createElement("div");
      div.className = "topic-card";
      div.innerHTML = "<h4>" + t.title + "</h4><p>" + (t.description || "") + "</p>";
      jamBox.appendChild(div);
    });
  }
}

/* ========== Quiz Page ========== */

function setupQuizPage() {
  var form = document.getElementById("quizForm");
  if (!form) return;

  form.addEventListener("submit", function (e) {
    e.preventDefault();

    if (!requireLogin()) return;

    var score = 0;
    var total = Object.keys(QUIZ_ANSWERS).length;
    var key;

    for (key in QUIZ_ANSWERS) {
      var selected = document.querySelector('input[name="' + key + '"]:checked');
      if (selected && selected.value === QUIZ_ANSWERS[key]) score++;
    }

    var percent = Math.round((score / total) * 100);
    var session = getSession();

    var scores = getQuizScores();
    scores.push({
      id: generateId("score"),
      studentId: session.studentId || "guest",
      studentName: session.name || session.username || "Guest",
      score: score,
      total: total,
      percent: percent,
      date: new Date().toLocaleString(),
    });
    saveQuizScores(scores);

    document.getElementById("scoreValue").textContent = score + " / " + total;
    document.getElementById("scorePercent").textContent = percent + "%";
    document.getElementById("quizScore").classList.add("show");
    document.getElementById("quizScore").scrollIntoView({ behavior: "smooth" });
  });
}

/* ========== Leaderboard ========== */

function setupLeaderboardPage() {
  var tbody = document.getElementById("leaderboardBody");
  if (!tbody) return;

  var scores = getQuizScores();
  scores.sort(function (a, b) {
    if (b.percent !== a.percent) return b.percent - a.percent;
    return b.score - a.score;
  });

  tbody.innerHTML = "";

  if (scores.length === 0) {
    tbody.innerHTML =
      '<tr><td colspan="5" class="empty-cell">No quiz scores yet. Take the quiz first!</td></tr>';
    return;
  }

  scores.forEach(function (s, index) {
    var row = document.createElement("tr");
    var medal = index === 0 ? "🥇" : index === 1 ? "🥈" : index === 2 ? "🥉" : index + 1;
    row.innerHTML =
      "<td>" +
      medal +
      "</td><td>" +
      s.studentName +
      "</td><td>" +
      s.score +
      " / " +
      s.total +
      "</td><td>" +
      s.percent +
      "%</td><td>" +
      s.date +
      "</td>";
    tbody.appendChild(row);
  });
}
