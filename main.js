/* ============================================
   StudyConnect – Shared JavaScript
   Beginner-friendly, well-commented code
   ============================================ */

// Run when the page has fully loaded
document.addEventListener("DOMContentLoaded", function () {
  setupMobileMenu();
  setupContactForm();
  setupLoginForm();
  setupRegisterForm();
  setupLogout();
  setupResourcesPage();
  setupAdminDashboard();
  setupDiscussionForum();
  setupQuiz();
  setupStudyGroups();
  highlightActiveNav();
  showAdminBadge();
  injectAdminNavLink();
});

/* ----- Mobile navigation toggle ----- */
function setupMobileMenu() {
  var toggle = document.querySelector(".menu-toggle");
  var navLinks = document.querySelector(".nav-links");

  if (!toggle || !navLinks) return;

  toggle.addEventListener("click", function () {
    navLinks.classList.toggle("open");
  });

  // Close menu when a link is clicked
  navLinks.querySelectorAll("a").forEach(function (link) {
    link.addEventListener("click", function () {
      navLinks.classList.remove("open");
    });
  });
}

/* ----- Mark active link in navigation ----- */
function highlightActiveNav() {
  var currentPage = window.location.pathname.split("/").pop() || "index.html";
  var links = document.querySelectorAll(".nav-links a, .dashboard-nav a");

  links.forEach(function (link) {
    var href = link.getAttribute("href");
    if (href === currentPage || (currentPage === "" && href === "index.html")) {
      link.classList.add("active");
    }
  });
}

/* ----- Home page contact form ----- */
function setupContactForm() {
  var form = document.getElementById("contactForm");
  if (!form) return;

  form.addEventListener("submit", function (event) {
    event.preventDefault();
    alert(
      "Thank you! Your message has been sent. We will get back to you soon.",
    );
    form.reset();
  });
}

/* ----- Login form (demo – no real backend) ----- */
function setupLoginForm() {
  var form = document.getElementById("loginForm");
  if (!form) return;

  form.addEventListener("submit", function (event) {
    event.preventDefault();

    var username = document.getElementById("username").value.trim();
    var password = document.getElementById("password").value;

    if (username === "" || password === "") {
      alert("Please enter both username and password.");
      return;
    }

    // Demo login – store role in sessionStorage
    if (username === "admin" && password === "admin123") {
      sessionStorage.setItem("role", "admin");
      sessionStorage.setItem("username", username);
      alert("Welcome, Admin! Opening your admin dashboard.");
      window.location.href = "admin-dashboard.html";
      return;
    } else {
      sessionStorage.setItem("role", "student");
      sessionStorage.setItem("username", username);
      alert("Welcome back, " + username + "!");
    }
    window.location.href = "dashboard.html";
  });
}

/* ----- Registration form ----- */
function setupRegisterForm() {
  var form = document.getElementById("registerForm");
  if (!form) return;

  form.addEventListener("submit", function (event) {
    event.preventDefault();

    var name = document.getElementById("name").value.trim();
    var email = document.getElementById("email").value.trim();
    var studentId = document.getElementById("studentId").value.trim();
    var password = document.getElementById("regPassword").value;

    if (name === "" || email === "" || studentId === "" || password === "") {
      alert("Please fill in all fields.");
      return;
    }

    if (password.length < 6) {
      alert("Password must be at least 6 characters.");
      return;
    }

    alert("Registration successful! Welcome to StudyConnect, " + name + "!");
    window.location.href = "login.html";
  });
}

/* ----- Logout – clear session ----- */
function setupLogout() {
  document.querySelectorAll(".logout-btn").forEach(function (link) {
    link.addEventListener("click", function () {
      sessionStorage.clear();
    });
  });
}

/* ----- Show admin badge in navbar ----- */
function showAdminBadge() {
  if (sessionStorage.getItem("role") !== "admin") return;

  var navbar = document.querySelector(".navbar");
  if (!navbar || navbar.querySelector(".admin-badge")) return;

  var badge = document.createElement("span");
  badge.className = "admin-badge";
  badge.textContent = "Admin";
  navbar.appendChild(badge);
}

function isAdmin() {
  return sessionStorage.getItem("role") === "admin";
}

function requireAdmin() {
  if (!isAdmin()) {
    alert("Admin access only. Please log in as admin.");
    window.location.href = "login.html";
    return false;
  }
  return true;
}

/* ----- Admin nav link on student pages ----- */
function injectAdminNavLink() {
  if (!isAdmin()) return;

  document.querySelectorAll(".nav-links").forEach(function (nav) {
    if (nav.querySelector('a[href="admin-dashboard.html"]')) return;

    var link = document.createElement("a");
    link.href = "admin-dashboard.html";
    link.textContent = "Admin Panel";
    link.style.fontWeight = "600";
    link.style.color = "var(--primary)";
    nav.insertBefore(link, nav.firstChild);
  });
}

/* ----- Admin dashboard page ----- */
function setupAdminDashboard() {
  if (!document.getElementById("adminWelcome")) return;
  if (!requireAdmin()) return;

  var username = sessionStorage.getItem("username") || "Admin";
  document.getElementById("adminWelcome").textContent =
    "Welcome, " + username + "!";

  renderAdminStats();
  setupAdminDashboardUpload();

  var refreshBtn = document.getElementById("refreshAdminStats");
  if (refreshBtn) {
    refreshBtn.addEventListener("click", renderAdminStats);
  }

  var deleteAllBtn = document.getElementById("adminDeleteAllBtn");
  if (deleteAllBtn) {
    deleteAllBtn.addEventListener("click", deleteAllResources);
  }
}

function getUploadedResources() {
  return getResources().filter(function (r) {
    return r.uploadedBy;
  });
}

function renderAdminStats() {
  var resources = getResources();
  var uploaded = getUploadedResources();

  var statTotal = document.getElementById("statTotal");
  var statUploaded = document.getElementById("statUploaded");
  var statDefault = document.getElementById("statDefault");
  var tbody = document.getElementById("adminUploadsBody");

  if (statTotal) statTotal.textContent = resources.length;
  if (statUploaded) statUploaded.textContent = uploaded.length;
  if (statDefault) statDefault.textContent = resources.length - uploaded.length;

  if (!tbody) return;

  if (uploaded.length === 0) {
    tbody.innerHTML =
      '<tr><td colspan="6" class="empty-cell">No admin uploads yet. Use the form above to add materials.</td></tr>';
    return;
  }

  tbody.innerHTML = "";

  uploaded.forEach(function (resource) {
    var row = document.createElement("tr");
    row.innerHTML =
      "<td>" +
      resource.title +
      "</td><td>" +
      resource.type +
      "</td><td>" +
      resource.subject +
      "</td><td>" +
      resource.fileSize +
      "</td><td>" +
      (resource.date || "—") +
      '</td><td><button type="button" class="btn btn-outline btn-sm admin-delete-btn" data-id="' +
      resource.id +
      '">Delete</button></td>';
    tbody.appendChild(row);
  });

  document.querySelectorAll(".admin-delete-btn").forEach(function (btn) {
    btn.addEventListener("click", function () {
      deleteResource(btn.getAttribute("data-id"));
      renderAdminStats();
    });
  });
}

function setupAdminDashboardUpload() {
  var form = document.getElementById("adminDashboardUploadForm");
  if (!form) return;

  form.addEventListener("submit", function (event) {
    event.preventDefault();

    var title = document.getElementById("adminResourceTitle").value.trim();
    var type = document.getElementById("adminResourceType").value;
    var subject = document.getElementById("adminResourceSubject").value.trim();
    var fileInput = document.getElementById("adminResourceFile");

    if (!title || !subject || !fileInput.files[0]) {
      alert("Please fill in all fields and select a file.");
      return;
    }

    var file = fileInput.files[0];

    if (file.size > MAX_FILE_SIZE) {
      alert("File is too large. Demo limit is 2 MB for localStorage.");
      return;
    }

    var reader = new FileReader();
    reader.onload = function () {
      var resources = getResources();
      var username = sessionStorage.getItem("username") || "admin";

      resources.unshift({
        id: generateResourceId(),
        title: title,
        type: type,
        subject: subject,
        fileName: file.name,
        fileSize: formatFileSize(file.size),
        fileData: reader.result,
        emoji: getResourceIcon(type),
        uploadedBy: username,
        date: new Date().toLocaleDateString(),
      });

      saveResources(resources);
      form.reset();
      renderAdminStats();
      alert('Resource "' + title + '" uploaded successfully!');
    };

    reader.readAsDataURL(file);
  });
}

/* ----- Resources (localStorage demo) ----- */
var RESOURCES_KEY = "studyconnect_resources";
var MAX_FILE_SIZE = 2 * 1024 * 1024; // 2 MB limit for localStorage demo

var DEFAULT_RESOURCES = [];

function getResources() {
  var stored = localStorage.getItem(RESOURCES_KEY);
  if (!stored) {
    localStorage.setItem(RESOURCES_KEY, JSON.stringify(DEFAULT_RESOURCES));
    return DEFAULT_RESOURCES.slice();
  }
  return JSON.parse(stored);
}

function deleteAllResources() {
  if (!isAdmin()) return;
  if (!confirm("Delete ALL resources? This cannot be undone.")) return;

  saveResources([]);
  renderResourceList();
  renderAdminStats();
  alert("All resources have been deleted.");
}

function saveResources(resources) {
  localStorage.setItem(RESOURCES_KEY, JSON.stringify(resources));
}

function getResourceIcon(type) {
  var icons = { PDF: "📕", Notes: "📒", Guide: "📙", Document: "📘", Template: "📋" };
  return icons[type] || "📄";
}

function formatFileSize(bytes) {
  if (bytes < 1024) return bytes + " B";
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
  return (bytes / (1024 * 1024)).toFixed(1) + " MB";
}

function generateResourceId() {
  return "res_" + Date.now();
}

function setupResourcesPage() {
  var resourceList = document.getElementById("resourceList");
  if (!resourceList) return;

  // One-time clear of old sample resources
  if (!localStorage.getItem("studyconnect_resources_cleared")) {
    saveResources([]);
    localStorage.setItem("studyconnect_resources_cleared", "true");
  }

  renderResourceList();
  setupResourceSearch();
  setupAdminResourceUpload();
  setupDeleteAllResources();
}

function setupDeleteAllResources() {
  var deleteAllBtn = document.getElementById("deleteAllResourcesBtn");
  if (!deleteAllBtn) return;

  if (isAdmin()) {
    deleteAllBtn.style.display = "inline-block";
  }

  deleteAllBtn.addEventListener("click", deleteAllResources);
}

function renderResourceList() {
  var resourceList = document.getElementById("resourceList");
  if (!resourceList) return;

  var resources = getResources();
  var admin = isAdmin();

  resourceList.innerHTML = "";

  if (resources.length === 0) {
    resourceList.innerHTML = '<p class="empty-message">No resources yet. Admins can upload materials above.</p>';
    return;
  }

  resources.forEach(function (resource) {
    var card = document.createElement("article");
    card.className = "item-card resource-item";
    card.setAttribute("data-title", resource.title);
    card.setAttribute("data-type", resource.type);
    card.setAttribute("data-subject", resource.subject);

    var meta = resource.type + " · " + resource.fileSize + " · " + resource.subject;
    if (resource.uploadedBy) {
      meta += " · Uploaded by " + resource.uploadedBy;
    }

    var actionsHTML =
      '<button type="button" class="btn btn-primary btn-sm" onclick="downloadResource(\'' +
      resource.id +
      "')\">Download</button>";

    if (admin) {
      actionsHTML +=
        ' <button type="button" class="btn btn-outline btn-sm delete-resource-btn" data-id="' +
        resource.id +
        '">Delete</button>';
    }

    card.innerHTML =
      "<div><h3>" +
      (resource.emoji || getResourceIcon(resource.type)) +
      " " +
      resource.title +
      '</h3><p class="meta">' +
      meta +
      "</p></div><div class=\"resource-actions\">" +
      actionsHTML +
      "</div>";

    resourceList.appendChild(card);
  });

  document.querySelectorAll(".delete-resource-btn").forEach(function (btn) {
    btn.addEventListener("click", function () {
      deleteResource(btn.getAttribute("data-id"));
    });
  });
}

function deleteResource(id) {
  if (!isAdmin()) return;
  if (!confirm("Delete this resource?")) return;

  var resources = getResources().filter(function (r) {
    return r.id !== id;
  });
  saveResources(resources);
  renderResourceList();
  renderAdminStats();
}

function setupAdminResourceUpload() {
  var uploadSection = document.getElementById("adminUploadSection");
  var uploadForm = document.getElementById("adminUploadForm");

  if (!uploadSection || !uploadForm) return;

  if (isAdmin()) {
    uploadSection.style.display = "block";
  }

  uploadForm.addEventListener("submit", function (event) {
    event.preventDefault();

    if (!isAdmin()) {
      alert("Only admins can upload resources.");
      return;
    }

    var title = document.getElementById("resourceTitle").value.trim();
    var type = document.getElementById("resourceType").value;
    var subject = document.getElementById("resourceSubject").value.trim();
    var fileInput = document.getElementById("resourceFile");

    if (!title || !subject || !fileInput.files[0]) {
      alert("Please fill in all fields and select a file.");
      return;
    }

    var file = fileInput.files[0];

    if (file.size > MAX_FILE_SIZE) {
      alert("File is too large. Demo limit is 2 MB for localStorage.");
      return;
    }

    var reader = new FileReader();
    reader.onload = function () {
      var resources = getResources();
      var username = sessionStorage.getItem("username") || "admin";

      resources.unshift({
        id: generateResourceId(),
        title: title,
        type: type,
        subject: subject,
        fileName: file.name,
        fileSize: formatFileSize(file.size),
        fileData: reader.result,
        emoji: getResourceIcon(type),
        uploadedBy: username,
        date: new Date().toLocaleDateString(),
      });

      saveResources(resources);
      renderResourceList();
      renderAdminStats();
      uploadForm.reset();
      alert('Resource "' + title + '" uploaded successfully!');
    };

    reader.readAsDataURL(file);
  });
}

/* ----- Resources search filter ----- */
function setupResourceSearch() {
  var searchInput = document.getElementById("resourceSearch");

  if (!searchInput) return;

  searchInput.addEventListener("input", function () {
    var searchText = searchInput.value.toLowerCase();

    document.querySelectorAll(".resource-item").forEach(function (item) {
      var title = item.getAttribute("data-title").toLowerCase();
      var type = item.getAttribute("data-type").toLowerCase();
      var subject = (item.getAttribute("data-subject") || "").toLowerCase();

      if (
        title.includes(searchText) ||
        type.includes(searchText) ||
        subject.includes(searchText)
      ) {
        item.style.display = "";
      } else {
        item.style.display = "none";
      }
    });
  });
}

/* ----- Discussion forum: post & reply ----- */
function setupDiscussionForum() {
  var postForm = document.getElementById("newPostForm");
  var discussionList = document.getElementById("discussionList");

  if (!postForm || !discussionList) return;

  postForm.addEventListener("submit", function (event) {
    event.preventDefault();

    var question = document.getElementById("newQuestion").value.trim();
    if (question === "") {
      alert("Please enter your question.");
      return;
    }

    var post = createDiscussionPost("You", question, []);
    discussionList.insertBefore(post, discussionList.firstChild);
    postForm.reset();
  });

  // Reply buttons on sample posts
  document.querySelectorAll(".reply-form").forEach(function (form) {
    form.addEventListener("submit", function (event) {
      event.preventDefault();
      var replyText = form.querySelector("input").value.trim();
      if (replyText === "") return;

      var repliesContainer = form
        .closest(".discussion-post")
        .querySelector(".replies");
      var replyEl = document.createElement("div");
      replyEl.className = "reply";
      replyEl.innerHTML = "<strong>You:</strong> " + replyText;
      repliesContainer.appendChild(replyEl);
      form.reset();
    });
  });
}

function createDiscussionPost(author, text, replies) {
  var post = document.createElement("article");
  post.className = "discussion-post";

  var date = new Date().toLocaleDateString();
  var repliesHTML = "";

  replies.forEach(function (r) {
    repliesHTML +=
      '<div class="reply"><strong>' +
      r.author +
      ":</strong> " +
      r.text +
      "</div>";
  });

  post.innerHTML =
    '<p class="author">' +
    author +
    '</p><p class="date">' +
    date +
    '</p><p class="question-text">' +
    text +
    '</p><div class="reply-section"><div class="replies">' +
    repliesHTML +
    '</div><form class="reply-form"><div class="form-group" style="margin-bottom:0.5rem"><input type="text" placeholder="Write a reply..." required></div><button type="submit" class="btn btn-sm btn-primary">Reply</button></form></div>';

  var form = post.querySelector(".reply-form");
  form.addEventListener("submit", function (event) {
    event.preventDefault();
    var replyText = form.querySelector("input").value.trim();
    if (replyText === "") return;
    var repliesContainer = post.querySelector(".replies");
    var replyEl = document.createElement("div");
    replyEl.className = "reply";
    replyEl.innerHTML = "<strong>You:</strong> " + replyText;
    repliesContainer.appendChild(replyEl);
    form.reset();
  });

  return post;
}

/* ----- Quiz scoring ----- */
function setupQuiz() {
  var quizForm = document.getElementById("quizForm");
  var scoreBox = document.getElementById("quizScore");

  if (!quizForm || !scoreBox) return;

  // Correct answers: q1 = b, q2 = c, q3 = a
  var correctAnswers = {
    q1: "Packets",
    q2: "All of the above",
    q3: "Data is not sent by packets",
    q4: "Routing information protocol",
    q5: "Bellman-Ford routing algorithm",
    q6: "Regions",
    q7: "20 bytes",
    q8: "Multiplex",
    q9: "Communication process",
    q10: "TCP & UDP",
    q11: "Physical Layer",
    q12: "Layer 3",
    q13: "Bit-by-bit delivery",
    q14: "Optical fiber",
    q15: "Digital modulation",
    q16: "Physical signalling sub layer",
    q17: "Both",
    q18: "Data link layer",
    q19: "Multiplexing",
    q20: "Network layer",
    q21: "Channel coding",
    q22: "Media access control",
    q23: "All of the above",
    q24: "Burst error",
    q25: "All of the above",
    q26: "Both",
    q27: "MAC address",
    q28: "Hardware address",
    q29: "Ethernet address",
    q30: "MAC address",
    q31: "Packets",
    q32: "Network & host address",
    q33: "Short VC number",
    q34: "All of the above",
    q35: "Data not sent by packets",
    q36: "Spanning tree",
    q37: "Routing information protocol",
    q38: "Internet Protocol",
    q39: "Error and diagnostics",
    q40: "Media Access Control",
    q41: "Network layer",
    q42: "TCP & UDP",
    q43: "Packets treated independently",
    q44: "All of the above",
    q45: "Socket",
    q46: "winsock",
    q47: "DCCP",
    q48: "Port",
    q49: "Process communication",
    q50: "SCTP",
  };

  quizForm.addEventListener("submit", function (event) {
    event.preventDefault();

    var score = 0;
    var total = Object.keys(correctAnswers).length;

    for (var key in correctAnswers) {
      var selected = document.querySelector(
        'input[name="' + key + '"]:checked',
      );
      if (selected && selected.value === correctAnswers[key]) {
        score++;
      }
    }

    var percent = Math.round((score / total) * 100);
    document.getElementById("scoreValue").textContent = score + " / " + total;
    document.getElementById("scorePercent").textContent = percent + "%";
    scoreBox.classList.add("show");
    scoreBox.scrollIntoView({ behavior: "smooth" });
  });
}

/* ----- Study groups: join & create ----- */
function setupStudyGroups() {
  var joinButtons = document.querySelectorAll(".join-group-btn");
  var createBtn = document.getElementById("createGroupBtn");

  joinButtons.forEach(function (btn) {
    btn.addEventListener("click", function () {
      var groupName = btn.getAttribute("data-group");
      btn.textContent = "Joined!";
      btn.disabled = true;
      btn.classList.remove("btn-primary");
      btn.style.background = "#2ecc71";
      btn.style.color = "#fff";
      alert('You have joined "' + groupName + '"!');
    });
  });

  if (createBtn) {
    createBtn.addEventListener("click", function () {
      var name = prompt("Enter a name for your new study group:");
      if (name && name.trim() !== "") {
        alert('Study group "' + name.trim() + '" created successfully!');
      }
    });
  }
}

/* ----- Download resource ----- */
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
    return;
  }

  alert(
    'Downloading: "' +
      resource.title +
      '"\n\n(Demo resource — upload a file as admin to enable real downloads.)',
  );
}
