import firebase_admin
from firebase_admin import credentials
from firebase_admin import db
import requests
import json

# 1. Firebase Initialize (నీ ఫైల్ పాత్ మరియు URL ఇవ్వండి)
cred = credentials.Certificate("firebase-key.json")
firebase_admin.initialize_app(cred, {
    'databaseURL': 'https://jigsawconnect-677da-default-rtdb.asia-southeast1.firebasedatabase.app'
})

# 2. ఒక కొత్త ఎగ్జామ్ టెంప్లేట్ క్రియేట్ చేస్తున్నాం (వెబ్‌సైట్ డ్రాప్‌డౌన్ కోసం)
EXAM_ID = "view-batch-2023-exam-practice-cse-acse-it"  # ఇది మన ఎగ్జామ్ ఐడీ
print("⏳ Creating Exam Template in Firebase...")
db.reference(f'hackerrankExams/{EXAM_ID}').set({
    "title": "AI Automated Python Exam"  # వెబ్‌సైట్ డ్రాప్‌డౌన్‌లో ఈ పేరు కనిపిస్తుంది
})

# 3. హాకర్‌రాంక్ నుండి వచ్చిన రా డేటా (రఫ్ టెక్స్ట్)
raw_text = """
Rank 1: 23A91A0501 - Sasi - 190 Marks
Rank 2: 23A91A0402 - Rani - 175 Marks
"""

# 4. OpenRouter AI ఎక్స్‌ట్రాక్షన్ (నీ API Key ఇక్కడ పెట్టు)
api_key = "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"

prompt = f"Extract student details as clean JSON array with keys: hrId, name, rollNo, branch, section, score from this text:\n{raw_text}"
headers = {"Authorization": f"Bearer {api_key}", "Content-Type": "application/json"}
payload = {
    "model": "google/gemini-2.5-flash",
    "messages": [{"role": "user", "content": prompt}],
    "response_format": { "type": "json_object" }
}

print("⏳ OpenRouter AI is parsing data...")
res = requests.post("https://openrouter.ai/api/v1/chat/completions", headers=headers, json=payload)
output = json.loads(res.json()['choices'][0]['message']['content'])

# AI ఇచ్చిన లిస్ట్‌ను ఫిల్టర్ చేయడం
students = output if isinstance(output, list) else output.get('students', list(output.values())[0])

# 5. నేరుగా డేటాబేస్ లోని లీడర్‌బోర్డ్‌కి పంపడం
score_updates = {}
for s in students:
    key = s['rollNo']
    score_updates[key] = {
        "hrId": s.get('hrId', key),
        "name": s.get('name', 'Unknown'),
        "rollNo": s.get('rollNo'),
        "branch": "CSE",
        "section": "A",
        "score": float(s.get('score', 0))
    }

db.reference(f'hackerRankLeaderboards/{EXAM_ID}').update(score_updates)
print("🎉 Success! Now open leaderboard.html, select 'AI Automated Python Exam' and see the magic!")
