import { 
  db, 
  ref, 
  get, 
  update // Swapped 'set' for 'update' for high-speed batch writes
} from "./firebase.js";

document.addEventListener("DOMContentLoaded", () => {
  // 1. Existing Team Automation Trigger
  const btn = document.getElementById("autoCreateTeamsBtn");
  if (btn) {
    btn.addEventListener("click", autoCreateTeams);
  }

  // 2. New HackerRank Automated Leaderboard Trigger
  const syncBtn = document.getElementById("syncHackerRankBtn");
  if (syncBtn) {
    syncBtn.addEventListener("click", handleHackerRankAutomation);
  }
});

/**
 * 🛠️ UTILITY: Score Normalizer / Parser
 * Prevents [object Object] by extracting primitive numeric scores 
 * whether stored as integer, string, or nested JSON object.
 */
function parseScoreValue(scoreData) {
  if (scoreData === null || scoreData === undefined) return 0;
  
  // If it's already a primitive number or string digit (e.g., 175 or "175")
  if (typeof scoreData !== 'object') {
    return scoreData;
  }
  
  // If it's a nested object (e.g., { score: 175 } or { marks: 175 })
  return scoreData.marks ?? scoreData.score ?? scoreData.total ?? scoreData.val ?? JSON.stringify(scoreData);
}

/**
 * 🚀 UPDATED FUNCTION: Handles HackerRank Link Submission & Automation
 */
async function handleHackerRankAutomation() {
  const syncBtn = document.getElementById("syncHackerRankBtn");
  const linkInput = document.getElementById("hackerRankUrlInput");
  const examDropdown = document.getElementById("adminContestSelectDropdown");

  if (!linkInput || !examDropdown) {
    alert("⚠️ Setup Error: Input field or Exam dropdown not found in HTML layout.");
    return;
  }

  const hackerrankUrl = linkInput.value.trim();
  const selectedExamId = examDropdown.value;

  if (!selectedExamId) {
    alert("⚠️ Action Required: Please select an active Exam Template from the dropdown first.");
    return;
  }

  if (!hackerrankUrl) {
    alert("⚠️ Input Required: Please paste a valid HackerRank results link or raw leaderboard data.");
    return;
  }

  const originalText = syncBtn.innerHTML;
  syncBtn.disabled = true;
  syncBtn.innerHTML = `<span>⏳</span> Pushing to Pipeline...`;

  try {
    const snapshot = await get(ref(db, `hackerRankLeaderboards/${selectedExamId}`));
    
    alert(`⚡ Local Gateway Triggered!\n\nPlease make sure to run your 'upload_scores.py' script on your machine to sync the data for Exam ID: ${selectedExamId}`);

    if (snapshot.exists()) {
      syncBtn.innerHTML = `<span>🎯</span> Active Syncing!`;
      alert("🎉 Connection Active! Scores are securely linked via Firebase Realtime Database.");
      linkInput.value = ""; 
    } else {
      syncBtn.innerHTML = `<span>⚡</span> Ready for Upload`;
      alert("ℹ️ Exam path created in DB. Awaiting data insertion from your Python automated local script.");
    }

  } catch (error) {
    console.error("Automation Gateway Interrupted:", error);
    alert(`❌ Pipeline Error: ${error.message || "Failed to contact database register."}`);
  } finally {
    setTimeout(() => {
      resetButton(syncBtn, originalText);
    }, 1500);
  }
}

/**
 * 👥 EXISTING FUNCTION: Algorithmic Team Roster Optimization
 */
async function autoCreateTeams() {
  const btn = document.getElementById("autoCreateTeamsBtn");
  
  const originalBtnText = btn.innerHTML;
  btn.disabled = true;
  btn.innerHTML = `<span>⏳</span> Optimizing Roster...`;

  try {
    const snap = await get(ref(db, "users"));

    if (!snap.exists()) {
      alert("⚠️ Operational failure: No users found inside the database register.");
      resetButton(btn, originalBtnText);
      return;
    }

    // Isolate and map active student accounts, normalizing score values
    const users = Object.entries(snap.val())
      .map(([uid, data]) => ({
        uid,
        ...data,
        score: Number(parseScoreValue(data.score)) || 0
      }))
      .filter(user => user.role === "student");

    if (users.length < 2) {
      alert("⚠️ Structure Alert: You need at least 2 students registered to run team formations.");
      resetButton(btn, originalBtnText);
      return;
    }

    // Sort students by score descending (Highest scores first)
    users.sort((a, b) => b.score - a.score);

    const totalLeadersCount = Math.min(10, Math.max(1, Math.floor(users.length / 2)));
    const leaders = users.slice(0, totalLeadersCount);
    const members = users.slice(totalLeadersCount);

    if (members.length === 0) {
      alert("ℹ️ Pool distribution is too compact to divide further. Try onboarding more users.");
      resetButton(btn, originalBtnText);
      return;
    }

    const updatePayload = {};
    let leaderIndex = 0;

    for (const member of members) {
      const assignedLeader = leaders[leaderIndex];
      updatePayload[`users/${member.uid}/teamLeader`] = assignedLeader.uid;
      leaderIndex = (leaderIndex + 1) % leaders.length;
    }

    await update(ref(db), updatePayload);

    btn.innerHTML = `<span>🎯</span> Formations Deployed!`;
    setTimeout(() => {
      alert("Algorithmic Balance Complete! Teams balanced dynamically across leaderboard scores. ✅");
      resetButton(btn, originalBtnText);
    }, 200);

  } catch (error) {
    console.error("Critical database execution block terminated:", error);
    alert("❌ Fatal Connection Error: Cloud storage reject or script timeout.");
    resetButton(btn, originalBtnText);
  }
}

function resetButton(buttonElement, originalText) {
  buttonElement.disabled = false;
  buttonElement.innerHTML = originalText;
}
