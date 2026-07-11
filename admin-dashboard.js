import { 
  db, 
  ref, 
  get, 
  update // Swapped 'set' for 'update' for high-speed batch writes
} from "./firebase.js";

document.addEventListener("DOMContentLoaded", () => {
  const btn = document.getElementById("autoCreateTeamsBtn");
  if (btn) {
    btn.addEventListener("click", autoCreateTeams);
  }
});

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
