import {
  auth,
  db,
  ref,
  get,
  set,
  update,
  signInWithEmailAndPassword
} from "./firebase.js";

// ==========================================================================
// SCOPE BRIDGE MATRIX (Resolves admin-dashboard.html global reference errors)
// ==========================================================================
window.auth = auth;
window.db = db;
window.ref = ref;
window.get = get;
window.set = set;
window.update = update;

console.log("🚀 JigsawConnect Core Application Engine Loaded");

/* ==========================================================================
   INITIALIZATION CORE
   ========================================================================== */
document.addEventListener("DOMContentLoaded", () => {
  // Unified module mounting pipeline
  setupLogin();
  setupLogout();
  setupQuiz();
  setupResources();
  setupLeaderboard();
  setupAdminOperations();
});

/* ==========================================================================
   QUIZ ENGINE & ARTIFICIAL INTELLIGENCE PIPELINE
   ========================================================================== */
function setupAdminOperations() {
  const generateQuizBtn = document.getElementById("generateQuizBtn");
  if (generateQuizBtn) {
    generateQuizBtn.addEventListener("click", handleQuizGeneration);
  }
}
async function handleQuizGeneration() {
  const topicInput = document.getElementById("quizTopic");
  const countInput = document.getElementById("questionCount");
  const quizContainer = document.getElementById("quizContainer");

  if (!topicInput || !countInput || !quizContainer) return;

  const topic = topicInput.value.trim();
  const count = parseInt(countInput.value, 10);

  if (!topic || isNaN(count) || count <= 0) {
    alert("Please enter a valid topic and question volume.");
    return;
  }

  quizContainer.innerHTML = `
    <div style="color: var(--accent); font-weight:600; text-align:center; padding:20px;">
      🔮 Quantum algorithms weaving questions... Please wait...
    </div>
  `;

  try {
    const response = await fetch("/api/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ topic, count })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Server Error (${response.status}): ${errorText}`);
    }

    const data = await response.json();
    
    // బ్యాకెండ్ నుండి 'result' లేదా 'solution' లేదా డైరెక్ట్ డేటా ఏది వచ్చినా సేఫ్‌గా తీసుకుంటుంది
    let rawText = data.result || data.solution || data;
    
    if (!rawText) {
      throw new Error("Missing response data structure from serverless API.");
    }

    let quizArray = [];
    if (typeof rawText === "string") {
      // మార్క్‌డౌన్ బ్యాక్‌టిక్స్ (```json) క్లీన్ చేయడానికి Regex
      const cleaned = rawText.replace(/```json|```/gi, "").trim();
      quizArray = JSON.parse(cleaned);
    } else {
      quizArray = rawText;
    }

    if (!Array.isArray(quizArray)) {
      throw new Error("Generative ecosystem failed to return a strict array configuration.");
    }

    renderQuiz(quizArray, quizContainer);

  } catch (error) {
    console.error("Quiz Matrix Generation Exception:", error);
    quizContainer.innerHTML = `
      <div style="border: 1px solid rgba(239, 68, 68, 0.2); background: rgba(239, 68, 68, 0.05); padding: 16px; border-radius: 8px; color: var(--danger); font-size: 14px;">
        <strong>Operational Error:</strong> ${error.message}<br>
        <span style="font-size:12px; color:var(--muted);">Check Vercel Serverless Logs or Gemini API Key status.</span>
      </div>
    `;
  }
}
function renderQuiz(questions, container) {
  let html = `<div style="display:flex; flex-direction:column; gap:20px; margin-top:20px;">`;
  
  questions.forEach((q, index) => {
    // ఆబ్జెక్ట్ కీస్ లోయర్-కేస్ లేదా అప్పర్-కేస్ ఉన్నా సరే ఎర్రర్ రాకుండా సేఫ్ యాక్సెస్ ఫాల్‌బ్యాక్
    const optionA = q.a || q.A || "";
    const optionB = q.b || q.B || "";
    const optionC = q.c || q.C || "";
    const optionD = q.d || q.D || "";
    const correctAnswer = q.answer || q.correctAnswer || "";

    html += `
      <div style="background: rgba(255,255,255,0.02); border: 1px solid var(--border); padding: 18px; border-radius: var(--radius-md);">
        <p style="font-weight:700; color:#fff; margin-bottom:12px;">Q${index + 1}: ${escapeHTML(q.question)}</p>
        <div style="display:grid; grid-template-columns: 1fr 1fr; gap:10px; font-size:13px;">
          <div><strong style="color:var(--accent)">A:</strong> ${escapeHTML(optionA)}</div>
          <div><strong style="color:var(--accent)">B:</strong> ${escapeHTML(optionB)}</div>
          <div><strong style="color:var(--accent)">C:</strong> ${escapeHTML(optionC)}</div>
          <div><strong style="color:var(--accent)">D:</strong> ${escapeHTML(optionD)}</div>
        </div>
        <p style="margin-top:10px; font-size:12px; color:#10b981; font-weight:700;">Correct Answer: ${escapeHTML(correctAnswer).toUpperCase()}</p>
      </div>
    `;
  });

  html += `</div>`;
  container.innerHTML = html;
}

/* ==========================================================================
   AUTHENTICATION & SESSION TRANSACTION LAYERS
   ========================================================================== */
function setSession(user) {
  sessionStorage.setItem("sc_user_session", JSON.stringify(user));
}

function getSession() {
  return JSON.parse(sessionStorage.getItem("sc_user_session"));
}

function clearSession() {
  sessionStorage.removeItem("sc_user_session");
}

function setupLogin() {
  const form = document.getElementById("loginForm") || document.getElementById("adminLoginForm");
  if (!form) return;

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const email = (document.getElementById("email") || document.getElementById("adminEmail"))?.value.trim();
    const password = (document.getElementById("password") || document.getElementById("adminPassword"))?.value.trim();
    const msg = document.getElementById("loginMessage");

    if (!msg) return;
    msg.className = ""; 
    msg.style.display = "block";

    try {
      const userCred = await signInWithEmailAndPassword(auth, email, password);
      const uid = userCred.user.uid;

      const snap = await get(ref(db, `users/${uid}`));
      if (!snap.exists()) {
        throw new Error("Profile attributes unassigned inside data infrastructure registry.");
      }

      const user = snap.val();

      setSession({
        uid: uid,
        name: user.name || "Anonymous Learner",
        email: user.email,
        role: user.role || "student"
      });

      msg.innerText = "Security Authorization Confirmed ✅ Access Granted.";
      msg.className = "success"; 

      setTimeout(() => {
        window.location.href = user.role === "admin" ? "admin-dashboard.html" : "student-dashboard.html";
      }, 1000);

    } catch (err) {
      console.error("Authentication lifecycle exception:", err);
      msg.innerText = "Authentication failure. Cross-reference account credentials parameters.";
      msg.className = "error";
    }
  });
}

function setupLogout() {
  document.querySelectorAll(".logout-btn").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      clearSession();
      window.location.href = "login.html";
    });
  });
}

/* ==========================================================================
   STUDENT EXAM SUBMISSION SYSTEMS
   ========================================================================== */
function setupQuiz() {
  const form = document.getElementById("quizForm");
  if (!form) return;

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const answers = { q1: "Packets", q2: "All of the above", q3: "Not packet based", q4: "RIP", q5: "Bellman-Ford" };
    let score = 0;

    for (const q in answers) {
      const selected = document.querySelector(`input[name="${q}"]:checked`);
      if (selected?.value === answers[q]) score++;
    }

    const user = getSession();
    if (!user) {
      alert(`Evaluation Saved locally: Score ${score}. Log in to preserve leaderboard positions.`);
      return;
    }

    try {
      const timestamp = Date.now();
      const updates = {};
      
      updates[`quizScores/${timestamp}`] = {
        name: user.name,
        email: user.email,
        score: score,
        time: new Date().toISOString()
      };
      
      updates[`users/${user.uid}/score`] = score;

      await update(ref(db), updates);

      alert(`🎉 Evaluation finalized! Total calculated score achieved: ${score}`);
      window.location.href = "leaderboard.html";

    } catch (error) {
      console.error("Failed to commit assessment score telemetry:", error);
      alert("⚠️ Telemetry Error: Failed to safely save score metrics to the database.");
    }
  });
}

/* ==========================================================================
   RESOURCE STORAGE ENGINE
   ========================================================================== */
function setupResources() {
  const container = document.getElementById("resourceList");
  if (!container) return;

  get(ref(db, "resources"))
    .then((snap) => {
      container.innerHTML = "";

      if (!snap.exists()) {
        container.innerHTML = `<p style="color: var(--muted); text-align: center; padding: 20px;">No curriculum files compiled inside database registries.</p>`;
        return;
      }

      container.innerHTML = Object.entries(snap.val()).map(([id, resource]) => {
        const finalUrl = resource.url || resource.link || "#";
        return `
          <div class="stat-card" style="flex-direction: column; align-items: flex-start; gap: 8px;">
            <h3 style="color:#fff; font-size:16px; font-weight:700;">${escapeHTML(resource.title)}</h3>
            <p style="color: var(--muted); font-size: 13px; line-height: 1.4;">Type: <strong>${escapeHTML(resource.type || "Document")}</strong></p>
            <a href="${encodeURI(finalUrl)}" class="btn btn-accent" style="padding: 6px 14px; font-size: 12px; margin-top: 8px;" target="_blank">Open Resource</a>
          </div>
        `;
      }).join("");
    })
    .catch((err) => {
      console.error("Curriculum catalog read exception block tracker:", err);
      container.innerHTML = `<p style="color: var(--danger);">Failed to query current educational library files components.</p>`;
    });
}

/* ==========================================================================
   LEADERBOARD LEDGER COMPRESSED ENGINE
   ========================================================================== */
function setupLeaderboard() {
  const table = document.getElementById("leaderboardTable");
  if (!table) return;

  get(ref(db, "quizScores")).then((snap) => {
    if (!snap.exists()) {
      table.innerHTML = `<tr><td colspan="4" style="text-align:center; color: var(--muted);">No execution history recorded.</td></tr>`;
      return;
    }

    const data = Object.values(snap.val());
    data.sort((a, b) => (b.score || 0) - (a.score || 0));

    table.innerHTML = data.map((item, i) => `
      <tr>
        <td style="font-weight: 700; color: ${i === 0 ? 'var(--accent)' : 'inherit'};">#${i + 1}</td>
        <td style="color:#fff; font-weight:600;">${escapeHTML(item.name || "Anonymous Student")}</td>
        <td><span class="badge" style="background: rgba(79, 70, 229, 0.1); color: #818cf8;">${item.score || 0} pts</span></td>
        <td style="color: var(--muted); font-size: 13px;">${item.time ? escapeHTML(item.time.split("T")[0]) : "N/A"}</td>
      </tr>
    `).join("");
  }).catch(err => {
    console.error("Leaderboard component execution failure:", err);
  });
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
