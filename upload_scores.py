import firebase_admin
from firebase_admin import credentials
from firebase_admin import db
import requests
import json
import os

# 1. Firebase Initialize
if not firebase_admin._apps:
    cred = credentials.Certificate("firebase-key.json")
    firebase_admin.initialize_app(cred, {
        'databaseURL': 'https://jigsawconnect-677da-default-rtdb.asia-southeast1.firebasedatabase.app'
    })

# 2. ఒక కొత్త ఎగ్జామ్ టెంప్లేట్ క్రియేట్ చేస్తున్నాం
EXAM_ID = "# దీన్ని మార్చండి
EXAM_ID = "day2-oop-batch-2023"
print("⏳ Creating Exam Template in Firebase...")
db.reference(f'hackerrankExams/{EXAM_ID}').set({
    "title": "AI Automated Python Exam"
})

# 3. హాకర్‌రాంక్ నుండి వచ్చిన రా డేటా
raw_text = """
Rank 1: 23A91A0501 - Sasi - 190 Marks
Rank 2: 23A91A0402 - Rani - 175 Marks
"""

# 4. OpenRouter AI ఎక్స్‌ట్రాక్షన్
api_key = os.getenv("OPENROUTER_API_KEY", "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")

# AI కచ్చితంగా "students" అనే కీ లోపల డేటా ఇచ్చేలా ప్రాంప్ట్ మార్చాం
prompt = f"""
Extract student details from the text below. 
Return strictly a JSON object containing a "students" array.
Each student object must have keys: hrId, name, rollNo, branch, section, score.

Text:
{raw_text}
"""

headers = {"Authorization": f"Bearer {api_key}", "Content-Type": "application/json"}
payload = {
    "model": "google/gemini-2.5-flash",
    "messages": [{"role": "user", "content": prompt}],
    "response_format": { "type": "json_object" }
}

print("⏳ OpenRouter AI is parsing data...")
try:
    res = requests.post("https://openrouter.ai/api/v1/chat/completions", headers=headers, json=payload)
    res.raise_for_status()
    output = json.loads(res.json()['choices'][0]['message']['content'])
    
    # సేఫ్ గా డేటా ఎక్స్‌ట్రాక్ట్ చేయడం
    students = output.get('students', [])
except Exception as e:
    print(f"❌ Error parsing AI data: {e}")
    students = []

# 5. నేరుగా డేటాబేస్ లోని లీడర్‌బోర్డ్‌కి పంపడం
score_updates = {}
for s in students:
    roll_no = s.get('rollNo') or s.get('hrId')
    if not roll_no:
        continue
        
    # Firebase కీస్ లో స్పెషల్ క్యారెక్టర్స్ లేకుండా సేఫ్ కీ క్రియేషన్
    safe_key = str(roll_no).replace('.', '_').replace('#', '_').replace('$', '_').replace('[', '_').replace(']', '_').replace('/', '_')
    
    score_updates[safe_key] = {
        "hrId": s.get('hrId', roll_no),
        "name": s.get('name', 'Unknown'),
        "rollNo": s.get('rollNo', 'N/A'),
        "branch": s.get('branch', 'CSE').upper(),
        "section": s.get('section', 'A').upper(),
        "score": float(s.get('score', 0))
    }

if score_updates:
    db.reference(f'hackerRankLeaderboards/{EXAM_ID}').update(score_updates)
    print("🎉 Success! Now open leaderboard.html, select 'AI Automated Python Exam' and see the magic!")
else:
    print("⚠️ No student records found to update.")
