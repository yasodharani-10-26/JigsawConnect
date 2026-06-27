const { onCall, HttpsError } = require("firebase-functions/v2/https");
const logger = require("firebase-functions/logger");
const admin = require("firebase-admin");
const fetch = require("node-fetch"); // npm install node-fetch@2 ద్వారా ఇన్‌స్టాల్ చేసుకోండి

// Firebase Admin SDK ని ఇనిషియలైజ్ చేయడం
if (admin.apps.length === 0) {
  admin.initializeApp();
}

// ⚠️ గమనిక: మీ ఒరిజినల్ HackerRank API టోకెన్ మరియు కాంటెస్ట్ ఐడీలను ఇక్కడ రీప్లేస్ చేయండి
const HACKERRANK_API_TOKEN = "YOUR_SECRET_HACKERRANK_API_TOKEN"; 
const CONTEST_ID = "YOUR_CONTEST_ID";

/**
 * ఆటోమేటిక్‌గా ఫామ్ అయిన టీమ్స్‌ను HackerRank ప్లాట్‌ఫారమ్‌లో రిజిస్టర్ చేసే క్లౌడ్ ఫంక్షన్
 * FIXED: CORS ఎర్రర్ రాకుండా 'cors: true' మరియు కరెక్ట్ రీజన్ 'asia-southeast1' సెట్ చేయబడింది.
 */
exports.createHackerRankTeam = onCall({ cors: true, region: "asia-southeast1" }, async (request) => {
  
  // 1. సెక్యూరిటీ చెక్: అడ్మిన్/యూజర్ లాగిన్ అయి ఉన్నారో లేదో చూడటం
  if (!request.auth) {
    throw new HttpsError(
      "unauthenticated", 
      "ఈ ఆపరేషన్ చేయడానికి మీకు అనుమతి లేదు. దయచేసి లాగిన్ అవ్వండి."
    );
  }

  // 2. ఫ్రంటెండ్ నుండి వచ్చిన డేటాను తీసుకోవడం (v2 లో డేటా request.data లో ఉంటుంది)
  const { teamName, leaderEmail, memberEmails } = request.data;

  if (!teamName || !leaderEmail || !memberEmails || !Array.isArray(memberEmails)) {
    throw new HttpsError(
      "invalid-argument",
      "కావలసిన పారామీటర్స్ (teamName, leaderEmail, memberEmails) సరిగ్గా లేవు."
    );
  }

  // HackerRank API ఎండ్-పాయింట్ URL
  const HACKERRANK_API_URL = `https://www.hackerrank.com/x/api/v3/tests/${CONTEST_ID}/teams`;

  // HackerRank ఆశించే పేలోడ్ ఫార్మాట్
  const payload = {
    team_name: teamName,
    leader_email: leaderEmail,
    member_emails: memberEmails
  };

  try {
    logger.log(`Initiating HackerRank API call for team: ${teamName}`);

    // 3. HackerRank API కి HTTP POST రిక్వెస్ట్ పంపడం
    const response = await fetch(HACKERRANK_API_URL, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${HACKERRANK_API_TOKEN}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    });

    const resData = await response.json();

    // 4. రెస్పాన్స్ ఆధారంగా ఫ్రంటెండ్ కి రిజల్ట్ పంపడం
    if (response.ok) {
      logger.log(`✅ Success: ${teamName} registered on HackerRank successfully.`);
      return { 
        success: true, 
        message: `HackerRank లో ${teamName} విజయవంతంగా క్రియేట్ అయ్యింది!` 
      };
    } else {
      logger.error(`❌ HackerRank API Error (${teamName}):`, resData);
      throw new HttpsError(
        "internal", 
        "HackerRank API రిక్వెస్ట్ విఫలమైంది.", 
        resData
      );
    }

  } catch (error) {
    // ఒకవేళ ఆల్రెడీ HttpsError అయితే దాన్ని అలాగే పంపాలి, లేకపోతే కొత్త ఎర్రర్ క్రియేట్ చేయాలి
    if (error instanceof HttpsError) {
      throw error;
    }
    
    logger.error("⚠️ నెట్‌వర్క్ ఎర్రర్ సంభవించింది:", error);
    throw new HttpsError(
      "unknown", 
      `సర్వర్ నెట్‌వర్క్ ఎర్రర్: ${error.message}`
    );
  }
});
