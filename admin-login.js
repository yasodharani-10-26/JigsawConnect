import {
  auth,
  db,
  ref,
  get,
  signInWithEmailAndPassword
} from "./firebase.js";

document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("adminLoginForm");
  if (!form) return;

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    // Elements Selectors
    const emailInput = document.getElementById("adminEmail");
    const passwordInput = document.getElementById("adminPassword");
    const msgContainer = document.getElementById("loginMessage");
    const submitBtn = form.querySelector(".login-btn");

    // Clean user inputs
    const email = emailInput.value.trim();
    const password = passwordInput.value.trim();

    // Clear previous message states
    msgContainer.className = "";
    msgContainer.textContent = "";

    // Micro-interaction: Set UI processing loading state
    const originalBtnText = submitBtn.innerHTML;
    submitBtn.disabled = true;
    submitBtn.innerHTML = `<span>⏳</span> Verifying Credentials...`;

    try {
      // 1. Authenticate user credentials via Firebase Auth Core
      const userCred = await signInWithEmailAndPassword(auth, email, password);
      const uid = userCred.user.uid;

      // 2. Query Realtime Database node looking for security profile attributes
      const snap = await get(ref(db, `users/${uid}`));

      if (!snap.exists()) {
        displayMessage(msgContainer, "error", "⚠️ Verification Failed: Authorization profile missing.");
        resetButtonState(submitBtn, originalBtnText);
        return;
      }

      const userData = snap.val();

      // 3. Explicit security gate check for administrative validation
      if (userData.role !== "admin") {
        displayMessage(msgContainer, "error", "🛑 Security Alert: Access restricted to Admin accounts only.");
        resetButtonState(submitBtn, originalBtnText);
        return;
      }

      // Success State Handlers
      displayMessage(msgContainer, "success", "🎯 Authentication successful! Redirecting...");
      submitBtn.innerHTML = `<span>🔓</span> Pipeline Unlocked`;

      // Smooth programmatic navigation transition
      setTimeout(() => {
        window.location.href = "admin-dashboard.html";
      }, 1200);

    } catch (err) {
      console.error("Authentication handshake exception:", err);
      
      // Parse Firebase errors into human-friendly communication strings
      const dynamicErrorMessage = mapFirebaseError(err.code || err.message);
      displayMessage(msgContainer, "error", dynamicErrorMessage);
      
      resetButtonState(submitBtn, originalBtnText);
    }
  });
});

/**
 * Helper to update status message presentation states cleanly
 */
function displayMessage(container, type, messageText) {
  container.className = type; // Appends '.error' or '.success' classes
  container.textContent = messageText;
}

/**
 * Restores the submit button to an operational state
 */
function resetButtonState(button, standardText) {
  button.disabled = false;
  button.innerHTML = standardText;
}

/**
 * Sanitizes technical cloud storage errors for front-facing portals
 */
function mapFirebaseError(errorString) {
  if (errorString.includes("auth/invalid-credential") || errorString.includes("wrong-password")) {
    return "❌ Invalid credentials. Please cross-reference your login key combinations.";
  }
  if (errorString.includes("auth/user-not-found")) {
    return "❌ No registered administrative account maps to this address.";
  }
  if (errorString.includes("auth/invalid-email")) {
    return "❌ Bad structural request: Email address formatting is invalid.";
  }
  if (errorString.includes("auth/too-many-requests")) {
    return "⚠️ Server lock: Too many consecutive attempts. Try again shortly.";
  }
  return `❌ Connection Refused: ${errorString}`;
}
