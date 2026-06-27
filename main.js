/* ==========================================================================
   StudyConnect – Unified Shared Application Engine
   Optimized Production Build | Reactive State Architecture
   ========================================================================== */

document.addEventListener("DOMContentLoaded", () => {
  AppInitializer.init();
});

/**
 * Global App Core Configuration and Storage Matrix
 */
const CONFIG = {
  RESOURCES_KEY: "studyconnect_resources",
  CLEARED_FLAG_KEY: "studyconnect_resources_cleared",
  MAX_FILE_SIZE: 2 * 1024 * 1024, // 2 MB LocalStorage Threshold Limit
  DEFAULT_ICONS: { PDF: "📕", Notes: "📒", Guide: "📙", Document: "📘", Template: "📋" }
};

/**
 * Storage Layer Driver (Encapsulated Abstraction Pipeline)
 */
const ResourceStorage = {
  get() {
    const stored = localStorage.getItem(CONFIG.RESOURCES_KEY);
    if (!stored) {
      localStorage.setItem(CONFIG.RESOURCES_KEY, JSON.stringify([]));
      return [];
    }
    return JSON.parse(stored);
  },
  save(resources) {
    localStorage.setItem(CONFIG.RESOURCES_KEY, JSON.stringify(resources));
  },
  clearAll() {
    this.save([]);
  }
};

/**
 * Modular Interface Dispatcher
 */
const AppInitializer = {
  init() {
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
    setupDoubtSolver(); // Activated Multimodal AI Doubt Solver Module
    highlightActiveNav();
    showAdminBadge();
    injectAdminNavLink();
  }
};

/* ----- Core Security and Session Access Layers ----- */
const Auth = {
  getRole: () => sessionStorage.getItem("role"),
  getUsername: () => sessionStorage.getItem("username") || "User",
  isAdmin: () => sessionStorage.getItem("role") === "admin",
  requireAdmin() {
    if (!this.isAdmin()) {
      alert("Access Denied: Administrative privileges required.");
      window.location.href = "login.html";
      return false;
    }
    return true;
  }
};

/* ----- Mobile Navigation Layout Toggle ----- */
function setupMobileMenu() {
  const toggle = document.querySelector(".menu-toggle");
  const navLinks = document.querySelector(".nav-links");

  if (!toggle || !navLinks) return;

  toggle.addEventListener("click", () => navLinks.classList.toggle("open"));

  navLinks.querySelectorAll("a").forEach(link => {
    link.addEventListener("click", () => navLinks.classList.remove("open"));
  });
}

/* ----- Viewport Path Navigation Tracker ----- */
function highlightActiveNav() {
  const currentPage = window.location.pathname.split("/").pop() || "index.html";
  const links = document.querySelectorAll(".nav-links a, .dashboard-nav a");

  links.forEach(link => {
    const href = link.getAttribute("href");
    if (href === currentPage || (currentPage === "" && href === "index.html")) {
      link.classList.add("active");
    }
  });
}

/* ----- Lead Processing Feedback Interceptor ----- */
function setupContactForm() {
  const form = document.getElementById("contactForm");
  if (!form) return;

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    alert("Thank you! Your inquiry has been logged. Our team will contact you shortly.");
    form.reset();
  });
}

/* ----- Identity Verification Gateway Router (Demo Hub) ----- */
function setupLoginForm() {
  const form = document.getElementById("loginForm");
  if (!form) return;

  form.addEventListener("submit", (e) => {
    e.preventDefault();

    const username = document.getElementById("username")?.value.trim();
    const password = document.getElementById("password")?.value;

    if (!username || !password) {
      alert("Missing Credentials: Verification entries cannot be blank.");
      return;
    }

    if (username === "admin" && password === "admin123") {
      sessionStorage.setItem("role", "admin");
      sessionStorage.setItem("username", "Administrator");
      alert("Welcome back, Commander! Launching Secure Operations Deck.");
      window.location.href = "admin-dashboard.html";
      return;
    }

    sessionStorage.setItem("role", "student");
    sessionStorage.setItem("username", username);
    alert(`Authentication Confirmed. Welcome back, ${username}!`);
    window.location.href = "student-dashboard.html";
  });
}

/* ----- Student Account Provisioning Interface ----- */
function setupRegisterForm() {
  const form = document.getElementById("registerForm");
  if (!form) return;

  form.addEventListener("submit", (e) => {
    e.preventDefault();

    const name = document.getElementById("name")?.value.trim();
    const email = document.getElementById("email")?.value.trim();
    const studentId = document.getElementById("studentId")?.value.trim();
    const password = document.getElementById("regPassword")?.value;

    if (!name || !email || !studentId || !password) {
      alert("Invalid Form Submission: All verification inputs are mandatory.");
      return;
    }

    if (password.length < 6) {
      alert("Security Constraint: Password must contain at least 6 characters.");
      return;
    }

    alert(`Registration Successful! Welcome to StudyConnect, ${name}!`);
    window.location.href = "login.html";
  });
}

/* ----- Lifecycle Session Destruction Handlers ----- */
function setupLogout() {
  document.querySelectorAll(".logout-btn").forEach(button => {
    button.addEventListener("click", () => sessionStorage.clear());
  });
}

/* ----- Dynamic UI Context Badges ----- */
function showAdminBadge() {
  if (!Auth.isAdmin()) return;

  const navbar = document.querySelector(".navbar");
  if (!navbar || navbar.querySelector(".admin-badge")) return;

  const badge = document.createElement("span");
  badge.className = "admin-badge";
  badge.textContent = "Admin Control";
  navbar.appendChild(badge);
}

function injectAdminNavLink() {
  if (!Auth.isAdmin()) return;

  document.querySelectorAll(".nav-links").forEach(nav => {
    if (nav.querySelector('a[href="admin-dashboard.html"]')) return;

    const link = document.createElement("a");
    link.href = "admin-dashboard.html";
    link.textContent = "Admin Control";
    link.className = "admin-panel-link";
    nav.insertBefore(link, nav.firstChild);
  });
}

/* ==========================================================================
   ADMIN METRIC MONITORING & MANAGEMENT UNIT
   ========================================================================== */
function setupAdminDashboard() {
  if (!document.getElementById("adminWelcome")) return;
  if (!Auth.requireAdmin()) return;

  document.getElementById("adminWelcome").textContent = `System Engine Node: ${Auth.getUsername()}`;

  renderAdminStats();
  setupResourceUploadForm("adminDashboardUploadForm", "adminResourceTitle", "adminResourceType", "adminResourceSubject", "adminResourceFile");

  const refreshBtn = document.getElementById("refreshAdminStats");
  if (refreshBtn) refreshBtn.addEventListener("click", renderAdminStats);

  const deleteAllBtn = document.getElementById("adminDeleteAllBtn");
  if (deleteAllBtn) deleteAllBtn.addEventListener("click", executeSystemPurge);
}

function renderAdminStats() {
  const resources = ResourceStorage.get();
  const uploaded = resources.filter(r => r.uploadedBy);

  const statTotal = document.getElementById("statTotal");
  const statUploaded = document.getElementById("statUploaded");
  const statDefault = document.getElementById("statDefault");
  const tbody = document.getElementById("adminUploadsBody");

  if (statTotal) statTotal.textContent = resources.length;
  if (statUploaded) statUploaded.textContent = uploaded.length;
  if (statDefault) statDefault.textContent = resources.length - uploaded.length;

  if (!tbody) return;

  if (uploaded.length === 0) {
    tbody.innerHTML = `<tr><td colspan="6" class="empty-cell">No admin updates logged yet. Use the deployment payload unit above.</td></tr>`;
    return;
  }

  tbody.innerHTML = uploaded.map(resource => `
    <tr>
      <td><strong>${escapeHTML(resource.title)}</strong></td>
      <td><span class="chip-type">${escapeHTML(resource.type)}</span></td>
      <td>${escapeHTML(resource.subject)}</td>
      <td>${escapeHTML(resource.fileSize)}</td>
      <td>${escapeHTML(resource.date || "—")}</td>
      <td>
        <button type="button" class="btn btn-outline btn-sm admin-delete-btn" data-id="${resource.id}">Remove</button>
      </td>
    </tr>
  `).join("");

  tbody.querySelectorAll(".admin-delete-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      processResourceRemoval(btn.getAttribute("data-id"));
    });
  });
}

/* ==========================================================================
   DOCUMENT ENGINE PIPELINE (SHARED STORAGE)
   ========================================================================== */
function setupResourcesPage() {
  if (!document.getElementById("resourceList")) return;

  if (!localStorage.getItem(CONFIG.CLEARED_FLAG_KEY)) {
    ResourceStorage.save([]);
    localStorage.setItem(CONFIG.CLEARED_FLAG_KEY, "true");
  }

  renderResourceList();
  setupResourceSearch();
  setupResourceUploadForm("adminUploadForm", "resourceTitle", "resourceType", "resourceSubject", "resourceFile");
  
  const globalPurgeBtn = document.getElementById("deleteAllResourcesBtn");
  if (globalPurgeBtn) {
    if (Auth.isAdmin()) globalPurgeBtn.style.style.display = "inline-block";
    globalPurgeBtn.addEventListener("click", executeSystemPurge);
  }
}

function renderResourceList() {
  const container = document.getElementById("resourceList");
  if (!container) return;

  const resources = ResourceStorage.get();
  const adminState = Auth.isAdmin();

  if (resources.length === 0) {
    container.innerHTML = `<p class="empty-message">No learning nodes initialized yet. Secure documents can be attached by Admins.</p>`;
    return;
  }

  container.innerHTML = "";
  
  resources.forEach(res => {
    const card = document.createElement("article");
    card.className = "item-card resource-item";
    card.dataset.title = res.title;
    card.dataset.type = res.type;
    card.dataset.subject = res.subject;

    let metadataText = `${res.type} · ${res.fileSize} · ${res.subject}`;
    if (res.uploadedBy) metadataText += ` · Node: ${res.uploadedBy}`;

    card.innerHTML = `
      <div class="resource-details">
        <h3>${res.emoji || getResourceIcon(res.type)} ${escapeHTML(res.title)}</h3>
        <p class="meta">${escapeHTML(metadataText)}</p>
      </div>
      <div class="resource-actions">
        <button type="button" class="btn btn-primary btn-sm download-trigger" data-id="${res.id}">Download</button>
        ${adminState ? `<button type="button" class="btn btn-outline btn-sm delete-trigger" data-id="${res.id}">Purge</button>` : ""}
      </div>
    `;

    card.querySelector(".download-trigger").addEventListener("click", () => downloadResource(res.id));
    if (adminState) {
      card.querySelector(".delete-trigger").addEventListener("click", () => processResourceRemoval(res.id));
    }

    container.appendChild(card);
  });
}

/**
 * Universal Form Interface Asset Capture Wrapper
 */
function setupResourceUploadForm(formId, titleId, typeId, subjectId, fileInputId) {
  const form = document.getElementById(formId);
  if (!form) return;

  const containerSection = form.closest(".admin-upload-section");
  if (containerSection) {
    containerSection.style.display = Auth.isAdmin() ? "block" : "none";
  }

  form.addEventListener("submit", (e) => {
    e.preventDefault();

    if (!Auth.isAdmin()) {
      alert("Security Halt: Unauthorized asset insertion blocked.");
      return;
    }

    const title = document.getElementById(titleId)?.value.trim();
    const type = document.getElementById(typeId)?.value;
    const subject = document.getElementById(subjectId)?.value.trim();
    const fileInput = document.getElementById(fileInputId);

    if (!title || !subject || !fileInput?.files?.[0]) {
      alert("Incomplete Parameter Matrix: Please check all required variables.");
      return;
    }

    const file = fileInput.files[0];
    if (file.size > CONFIG.MAX_FILE_SIZE) {
      alert("Storage Overflow: Attached document footprint exceeds the 2 MB local sandbox limit.");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const db = ResourceStorage.get();
      db.unshift({
        id: `res_${Date.now()}`,
        title,
        type,
        subject,
        fileName: file.name,
        fileSize: formatFileSize(file.size),
        fileData: reader.result,
        emoji: getResourceIcon(type),
        uploadedBy: Auth.getUsername(),
        date: new Date().toLocaleDateString()
      });

      ResourceStorage.save(db);
      form.reset();
      
      renderResourceList();
      renderAdminStats();
      alert(`Asset "${title}" cataloged securely into deployment registers.`);
    };

    reader.readAsDataURL(file);
  });
}

function processResourceRemoval(id) {
  if (!Auth.isAdmin()) return;
  if (!confirm("Are you sure you want to delete this resource asset?")) return;

  const modified = ResourceStorage.get().filter(item => item.id !== id);
  ResourceStorage.save(modified);
  
  renderResourceList();
  renderAdminStats();
}

function executeSystemPurge() {
  if (!Auth.isAdmin()) return;
  if (!confirm("CRITICAL WARNING: You are initializing a full systemic erase. Wipe all document vaults?")) return;

  ResourceStorage.clearAll();
  renderResourceList();
  renderAdminStats();
  alert("System data registers sanitized.");
}

/* ----- Resource Document Stream Execution Core ----- */
export function downloadResource(id) {
  const fileNode = ResourceStorage.get().find(item => item.id === id);

  if (!fileNode) {
    alert("Lookup Error: Requested asset entry was dropped or removed from registry.");
    return;
  }

  if (fileNode.fileData) {
    const downloaderNode = document.createElement("a");
    downloaderNode.href = fileNode.fileData;
    downloaderNode.download = fileNode.fileName;
    downloaderNode.click();
    return;
  }

  alert(`Initializing Resource Interface: "${fileNode.title}"\n\n(Sandbox Node: Upload real files to process actual downloads)`);
}
window.downloadResource = downloadResource;

/* ----- Dynamic Search Refinement Engine ----- */
function setupResourceSearch() {
  const engine = document.getElementById("resourceSearch");
  if (!engine) return;

  engine.addEventListener("input", () => {
    const token = engine.value.toLowerCase();

    document.querySelectorAll(".resource-item").forEach(card => {
      const name = card.dataset.title.toLowerCase();
      const cat = card.dataset.type.toLowerCase();
      const area = (card.dataset.subject || "").toLowerCase();

      const validationCheck = name.includes(token) || cat.includes(token) || area.includes(token);
      card.style.display = validationCheck ? "" : "none";
    });
  });
}

/* ==========================================================================
   PEER-TO-PEER INTERACTION FORUMS
   ========================================================================== */
function setupDiscussionForum() {
  const postSubmitForm = document.getElementById("newPostForm");
  const canvasBoard = document.getElementById("discussionList");

  if (!postSubmitForm || !canvasBoard) return;

  postSubmitForm.addEventListener("submit", (e) => {
    e.preventDefault();

    const entryText = document.getElementById("newQuestion")?.value.trim();
    if (!entryText) {
      alert("Submission Rejected: Message structure cannot be empty.");
      return;
    }

    const liveCommentNode = assemblePostNode(Auth.getUsername(), entryText, []);
    canvasBoard.insertBefore(liveCommentNode, canvasBoard.firstChild);
    postSubmitForm.reset();
  });

  document.querySelectorAll(".reply-form").forEach(form => {
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      processFormReply(form);
    });
  });
}

function assemblePostNode(user, message, chronologicalReplies) {
  const shell = document.createElement("article");
  shell.className = "discussion-post";

  const stamp = new Date().toLocaleDateString();
  const repliesStackHTML = chronologicalReplies.map(r => `
    <div class="reply"><strong>${escapeHTML(r.author)}:</strong> ${escapeHTML(r.text)}</div>
  `).join("");

  shell.innerHTML = `
    <p class="author">${escapeHTML(user)}</p>
    <p class="date">${escapeHTML(stamp)}</p>
    <p class="question-text">${escapeHTML(message)}</p>
    <div class="reply-section">
      <div class="replies">${repliesStackHTML}</div>
      <form class="reply-form">
        <div class="form-group" style="margin-bottom: 0.5rem">
          <input type="text" placeholder="Write a response..." required>
        </div>
        <button type="submit" class="btn btn-sm btn-primary">Reply</button>
      </form>
    </div>
  `;

  shell.querySelector(".reply-form").addEventListener("submit", (e) => {
    e.preventDefault();
    processFormReply(shell.querySelector(".reply-form"));
  });

  return shell;
}

function processFormReply(formElement) {
  const feedbackInput = formElement.querySelector("input");
  const valuePayload = feedbackInput?.value.trim();
  if (!valuePayload) return;

  const logsWrapper = formElement.closest(".discussion-post").querySelector(".replies");
  if (!logsWrapper) return;
  
  const genericResponseItem = document.createElement("div");
  genericResponseItem.className = "reply";
  genericResponseItem.innerHTML = `<strong>${escapeHTML(Auth.getUsername())}:</strong> ${escapeHTML(valuePayload)}`;
  
  logsWrapper.appendChild(genericResponseItem);
  formElement.reset();
}

/* ==========================================================================
   AUTOMATED EVALUATION MATRIX (QUIZ SUB-SYSTEM)
   ========================================================================== */
function setupQuiz() {
  const examSheet = document.getElementById("quizForm");
  const metricsBox = document.getElementById("quizScore");

  if (!examSheet || !metricsBox) return;

  const ANSWER_KEY = {
    q1: "Packets", q2: "All of the above", q3: "Data is not sent by packets", q4: "Routing information protocol",
    q5: "Bellman-Ford routing algorithm", q6: "Regions", q7: "20 bytes", q8: "Multiplex", q9: "Communication process",
    q10: "TCP & UDP", q11: "Physical Layer", q12: "Layer 3", q13: "Bit-by-bit delivery", q14: "Optical fiber",
    q15: "Digital modulation", q16: "Physical signalling sub layer", q17: "Both", q18: "Data link layer",
    q19: "Multiplexing", q20: "Network layer", q21: "Channel coding", q22: "Media access control",
    q23: "All of the above", q24: "Burst error", q25: "All of the above", q26: "Both", q27: "MAC address",
    q28: "Hardware address", q29: "Ethernet address", q30: "MAC address", q31: "Packets", q32: "Network & host address",
    q33: "Short VC number", q34: "All of the above", q35: "Data not sent by packets", q36: "Spanning tree",
    q37: "Routing information protocol", q38: "Internet Protocol", q39: "Error and diagnostics",
    q40: "Media Access Control", q41: "Network layer", q42: "TCP & UDP", q43: "Packets treated independently",
    q44: "All of the above", q45: "Socket", q46: "winsock", q47: "DCCP", q48: "Port", q49: "Process communication",
    q50: "SCTP"
  };

  examSheet.addEventListener("submit", (e) => {
    e.preventDefault();

    let runtimeScore = 0;
    const totalQuestionsCount = Object.keys(ANSWER_KEY).length;

    for (const lookupId in ANSWER_KEY) {
      const activeSelection = examSheet.querySelector(`input[name="${lookupId}"]:checked`);
      if (activeSelection && activeSelection.value === ANSWER_KEY[lookupId]) {
        runtimeScore++;
      }
    }

    const calculatedPercentage = Math.round((runtimeScore / totalQuestionsCount) * 100);
    
    const scoreValueEl = document.getElementById("scoreValue");
    const scorePercentEl = document.getElementById("scorePercent");
    
    if (scoreValueEl) scoreValueEl.textContent = `${runtimeScore} / ${totalQuestionsCount}`;
    if (scorePercentEl) scorePercentEl.textContent = `${calculatedPercentage}%`;
    
    metricsBox.classList.add("show");
    metricsBox.scrollIntoView({ behavior: "smooth", block: "center" });
  });
}

/* ----- Team Workspace Provisioning Clusters ----- */
function setupStudyGroups() {
  document.querySelectorAll(".join-group-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      const channelLabel = btn.getAttribute("data-group");
      btn.textContent = "Joined Team Slot!";
      btn.disabled = true;
      btn.classList.remove("btn-primary");
      btn.style.background = "#10b981";
      btn.style.color = "#fff";
      alert(`Access Key Granted. You are now synced to channel workspace: "${channelLabel}"!`);
    });
  });

  const launchGroupNode = document.getElementById("createGroupBtn");
  if (launchGroupNode) {
    launchGroupNode.addEventListener("click", () => {
      const promptTitle = prompt("Provide a unique identifier or title for the new study group node:");
      if (promptTitle && promptTitle.trim()) {
        alert(`Workspace Registry Active: Channel cluster "${promptTitle.trim()}" successfully bound to tracking router.`);
      }
    });
  }
}
/* ==========================================================================
   AI HELP & MULTIMODAL DOUBT SOLVER FEATURE (UPDATED)
   ========================================================================== */
window.latestRecordedAudioBlob = null;

function setupDoubtSolver() {
  const solverForm = document.getElementById("doubtSolverForm");
  const solutionDisplay = document.getElementById("solutionDisplay");

  if (!solverForm || !solutionDisplay) return;

  solverForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const textInput = document.getElementById("doubtText")?.value.trim();
    const imageInput = document.getElementById("doubtImage")?.files?.[0];
    const voiceInput = window.latestRecordedAudioBlob;

    if (!textInput && !imageInput && !voiceInput) {
      alert("Please provide at least one input (Text, Image, or Voice) to solve your doubt.");
      return;
    }

    solutionDisplay.innerHTML = `
      <div style="color: var(--accent-cyan); font-weight:600; text-align:center; padding:20px;">
        🧠 AI Engine analyzing your query and preparing solution... Please wait...
      </div>
    `;

    try {
      const formData = new FormData();
      if (textInput) formData.append("text", textInput);
      if (imageInput) formData.append("image", imageInput);
      if (voiceInput) formData.append("voice", voiceInput, "voice_doubt.mp3");

      const response = await fetch("/api/solve-doubt", {
        method: "POST",
        body: formData // Note: Content-Type header పెట్టకూడదు, FormData నే స్వయంగా సెట్ చేసుకుంటుంది
      });

      // సర్వర్ నుండి రెస్పాన్స్ సక్సెస్ కాకపోతే ఇక్కడే పట్టుకోవాలి
      if (!response.ok) {
        const errorText = await response.text(); // json() కి బదులు text() గా చదవాలి
        throw new Error(errorText || `Server responded with status ${response.status}`);
      }

      // సక్సెస్ అయితేనే JSON కింద మార్చాలి
      const data = await response.json();

      solutionDisplay.innerHTML = `
        <div style="background: rgba(16, 185, 129, 0.05); border: 1px solid #10b981; padding: 20px; border-radius: 14px; margin-top: 20px;">
          <h3 style="color: #10b981; margin-bottom: 10px; font-size: 16px;">💡 AI Generated Solution:</h3>
          <div style="color: #fff; line-height: 1.6; font-size: 14px; white-space: pre-line;">
            ${escapeHTML(data.solution)}
          </div>
        </div>
      `;

    } catch (error) {
      console.error("Doubt Solver Exception:", error);
      
      // అసలు సర్వర్ లో ఏం ఎర్రర్ ఉందో ఇక్కడ డిస్‌ప్లే అవుతుంది
      solutionDisplay.innerHTML = `
        <div style="border: 1px solid rgba(239, 68, 68, 0.3); background: rgba(239, 68, 68, 0.05); padding: 16px; border-radius: 8px; color: #ef4444; font-size: 14px;">
          <strong>🚨 Server Error Detected:</strong><br>
          <pre style="background: #000; padding: 10px; border-radius: 6px; margin-top: 8px; white-space: pre-wrap; font-family: monospace; font-size: 12px; color: #fca5a5;">${escapeHTML(error.message)}</pre>
          <span style="font-size:12px; color:var(--text-muted); display:block; margin-top:8px;">💡 Hint: Check if your backend handles 'FormData' using Multer and Gemini API is integrated properly.</span>
        </div>
      `;
    }
  });

  setupAudioRecorder();
}
/**
 * Handle Voice Recording functionality natively in browser
 */
function setupAudioRecorder() {
  const recordBtn = document.getElementById("recordVoiceBtn");
  const voiceStatus = document.getElementById("voiceStatus");
  if (!recordBtn || !voiceStatus) return;

  let mediaRecorder;
  let audioChunks = [];

  recordBtn.addEventListener("click", async () => {
    if (mediaRecorder && mediaRecorder.state === "recording") {
      mediaRecorder.stop();
      recordBtn.textContent = "🎙️ Record Voice";
      recordBtn.style.background = "";
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorder = new MediaRecorder(stream);
      audioChunks = [];

      mediaRecorder.ondataavailable = (event) => {
        audioChunks.push(event.data);
      };

      mediaRecorder.onstop = () => {
        window.latestRecordedAudioBlob = new Blob(audioChunks, { type: "audio/mp3" });
        voiceStatus.textContent = "✅ Voice recorded successfully!";
        voiceStatus.style.color = "#10b981";
      };

      mediaRecorder.start();
      recordBtn.textContent = "🛑 Stop Recording";
      recordBtn.style.background = "#ef4444";
      voiceStatus.textContent = "Recording your doubt...";
      voiceStatus.style.color = "var(--accent)";

    } catch (err) {
      console.error("Audio Access Denied:", err);
      alert("Microphone permission denied or unsupported by browser.");
    }
  });
}

/* ----- Data Transformation Helper Utilities ----- */
function getResourceIcon(type) {
  return CONFIG.DEFAULT_ICONS[type] || "📄";
}

function formatFileSize(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

/**
 * Universal text escape method targeting script injection surface parameters safely
 */
function escapeHTML(str) {
  if (!str) return "";
  return str.replace(/[&<>'"]/g, 
    tag => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[tag] || tag)
  );
}
