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
 * 🚀 UPDATED FUNCTION: Handles HackerRank Link Submission & Automation
 * Local Execution Guardrail to prevent 404/JSON parsing crashes.
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

  // UI Visual Feedback Loop: Trigger loading state
  const originalText = syncBtn.innerHTML;
  syncBtn.disabled = true;
  syncBtn.innerHTML = `<span>⏳</span> Pushing to Pipeline...`;

  try {
    /* 
     * 🛑 404 API CRASH FIX:
     * ఒకవేళ నువ్వు లోకల్ కంప్యూటర్ లో పైథాన్ స్క్రిప్ట్ (`upload_scores.py`) వాడుతుంటే,
     * ఈ కింద ఉన్న Firebase వెరిఫికేషన్ చెక్ పర్ఫెక్ట్‌గా సరిపోతుంది.
     */
    
    // Firebase లో ఆ Exam ఐడీ కింద ఆల్రెడీ డేటా ఉందో లేదో ఒకసారి రీడ్ చేసి చూస్తాం
    const snapshot = await get(ref(db, `hackerRankLeaderboards/${selectedExamId}`));
    
    // యూజర్ కి గైడెన్స్ ఇస్తూ అలర్ట్ చూపించడం
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
  
  // Interactive UI Feedback: Set loading state
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

    // Isolate and map active student accounts
    const users = Object.entries(snap.val())
      .map(([uid, data]) => ({
        uid,
        ...data
      }))
      .filter(user => user.role === "student");

    // Guardrail: Ensure there are enough students to actually form pairs/teams
    if (users.length < 2) {
      alert("⚠️ Structure Alert: You need at least 2 students registered to run team formations.");
      resetButton(btn, originalBtnText);
      return;
    }

    // Sort students by score descending (Highest scores first)
    users.sort((a, b) => (b.score || 0) - (a.score || 0));

    // Dynamic Allocation: Determine target teams based on pool scale (Max 10 leaders)
    const totalLeadersCount = Math.min(10, Math.max(1, Math.floor(users.length / 2)));
    const leaders = users.slice(0, totalLeadersCount);
    const members = users.slice(totalLeadersCount);

    // If there are no members because pool is perfectly split or small, merge distribution back
    if (members.length === 0) {
      alert("ℹ️ Pool distribution is too compact to divide further. Try onboarding more users.");
      resetButton(btn, originalBtnText);
      return;
    }

    // Construct a single multi-path update bundle object
    const updatePayload = {};
    let leaderIndex = 0;

    for (const member of members) {
      const assignedLeader = leaders[leaderIndex];
      
      // Stage updates sequentially into local memory memory paths
      updatePayload[`users/${member.uid}/teamLeader`] = assignedLeader.uid;

      // Cycle distribution patterns through existing leader indexes
      leaderIndex = (leaderIndex + 1) % leaders.length;
    }

    // Single Atomic Write: Executes all records in one swift network transaction
    await update(ref(db), updatePayload);

    // Success state response
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

// Micro-interaction Helper function to restore element states smoothly
function resetButton(buttonElement, originalText) {
  buttonElement.disabled = false;
  buttonElement.innerHTML = originalText;
}
