import os
import json
import requests
import firebase_admin
from firebase_admin import credentials
from firebase_admin import db

# ==========================================================
# 1. FIREBASE INITIALIZATION
# ==========================================================
# మీ credentials ని లోడ్ చేయండి
if not firebase_admin._apps:
    cred = credentials.Certificate("firebase-key.json")
    firebase_admin.initialize_app(cred, {
        'databaseURL': 'https://jigsawconnect-677da-default-rtdb.asia-southeast1.firebasedatabase.app'
    })

# ==========================================================
# 2. OPENROUTER AI FUNCTION
# ==========================================================
def extract_scores_via_openrouter(raw_text_data):
    """
    అన్‌స్ట్రక్చర్డ్ హాకర్‌రాంక్ డేటాను OpenRouter API ద్వారా క్లీన్ JSON ఫార్మాట్ లోకి మారుస్తుంది.
    """
    # 🔐 భద్రత కోసం ఎన్విరాన్‌మెంట్ వేరియబుల్స్ వాడటం మంచిది, లేదంటే కింద నీ కీ ని రీప్లేస్ చెయ్
    openrouter_api_key = os.getenv("OPENROUTER_API_KEY", "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")
    
    prompt = f"""
    Analyze the following raw HackerRank leaderboard or exam results data.
    Extract the following details for each student and format the response strictly as a JSON object containing a "students" array.
    
    Each student object inside the "students" array must have:
    - hrId (HackerRank ID / Username)
    - name (Full Name - default to "Unknown" if not found)
    - rollNo (Roll Number - clean uppercase, e.g., 23A91A0501)
    - branch (Branch like CSE, ECE, EEE - extract from roll number or text)
    - section (Section like A, B, C - default to "A")
    - score (The obtained score/marks as a floating number)

    Ensure the output is strictly valid JSON without any markdown markers like ```json ... ```.
    
    Raw Data:
    {raw_text_data}
    """

    headers = {
        "Authorization": f"Bearer {openrouter_api_key}",
        "Content-Type": "application/json"
    }
    
    payload = {
        "model": "google/gemini-2.5-flash",
        "messages": [
            {"role": "user", "content": prompt}
        ],
        "response_format": { "type": "json_object" }
    }

    try:
        response = requests.post(
            "https://openrouter.ai/api/v1/chat/completions",
            headers=headers,
            json=payload
        )
        response.raise_for_status()
        res_data = response.json()
        raw_output = res_data['choices'][0]['message']['content']
        return json.loads(raw_output)
    except Exception as e:
        print(f"❌ OpenRouter API Error: {e}")
        return None

# ==========================================================
# 3. MAIN AUTOMATION FLOW
# ==========================================================
def sync_hackerrank_to_firebase(exam_id, raw_data_string):
    print("⏳ Extracting scores using OpenRouter AI...")
    parsed_result = extract_scores_via_openrouter(raw_data_string)
    
    if not parsed_result:
        print("❌ Failed to parse data from OpenRouter.")
        return

    # హ్యాండ్లింగ్: డైరెక్ట్ లిస్ట్ వచ్చినా లేదా ఆబ్జెక్ట్ లోపల 'students' కీ వచ్చినా సరే వర్క్ అవుతుంది
    if isinstance(parsed_result, list):
        students_list = parsed_result
    else:
        students_list = parsed_result.get('students', [])

    if not students_list:
        print("❌ No student data could be parsed from the response structural array.")
        return

    print(f"🎯 Successfully parsed {len(students_list)} students. Syncing to Firebase...")

    # Firebase References
    ref = db.reference(f'hackerRankLeaderboards/{exam_id}')
    students_ref = db.reference('students')
    global_students = students_ref.get() or {}
    
    # డిక్షనరీ లేదా లిస్ట్ ఏది వచ్చినా ఆబ్జెక్ట్స్ కన్వర్ట్ చేయడానికి సేఫ్ హ్యాండ్లింగ్
    if isinstance(global_students, dict):
        global_students_list = list(global_students.values())
    else:
        global_students_list = [s for s in global_students if s is not None]

    score_updates = {}
    for student in students_list:
        hr_id = student.get('hrId') or student.get('hr_id') or ""
        roll_no = student.get('rollNo') or student.get('roll_no') or ""
        
        if not hr_id and not roll_no:
            continue
            
        clean_hr_id = str(hr_id).strip().lower().replace('@', '')
        clean_roll = str(roll_no).strip().upper()
        
        # గ్లోబల్ స్టూడెంట్స్ తో రికార్డ్ మ్యాచ్ వెరిఫికేషన్
        match = None
        for s in global_students_list:
            if not s: continue
            db_hr = str(s.get('hrId', '')).strip().lower()
            db_roll = str(s.get('rollNo', '')).strip().upper()
            if (clean_hr_id and db_hr == clean_hr_id) or (clean_roll and db_roll == clean_roll):
                match = s
                break

        final_key = match.get('hrId') if (match and match.get('hrId')) else (hr_id or roll_no)
        # Firebase పాత కీ క్లీనప్ (Special characters రిమూవ్ చేయడం)
        safe_db_key = str(final_key).replace('.', '_').replace('#', '_').replace('$', '_').replace('[', '_').replace(']', '_').replace('/', '_')

        try:
            raw_score = float(student.get('score', 0))
            clean_score = max(0.0, raw_score) # నెగటివ్ స్కోర్స్ రాకుండా సేఫ్ గార్డ్
        except (ValueError, TypeError):
            clean_score = 0.0

        score_updates[safe_db_key] = {
            "hrId": final_key,
            "name": match.get('name') if match else student.get('name', 'Unknown'),
            "rollNo": match.get('rollNo') if match else (clean_roll if clean_roll else "N/A"),
            "branch": match.get('branch', 'CSE').upper() if match else student.get('branch', 'CSE').upper(),
            "section": match.get('section', 'A').upper() if match else student.get('section', 'A').upper(),
            "score": clean_score,
            "data2": "", 
            "data3": ""
        }

    # సింగిల్ అటామిక్ రైట్ బ్యాచ్ అప్‌డేట్
    if score_updates:
        ref.update(score_updates)
        print(f"🎉 Firebase Sync Complete! {len(score_updates)} scores updated for Exam ID: {exam_id}")
    else:
        print("⚠️ No valid updates to push to database node storage.")

# ==========================================================
# RUNNING THE SCRIPT
# ==========================================================
if __name__ == "__main__":
    # టెస్టింగ్ కోసం యాక్టివ్ ఎగ్జామ్ ఐడిని మార్చండి
    ACTIVE_EXAM_ID = "YOUR_ACTIVE_EXAM_ID_FROM_FIREBASE" 
    
    raw_contest_data = """
    Leaderboard of Exam-1:
    User: 23A91A0501 (Sasi) - Score: 150 points - Rank 1
    User: rani_ece_9 (Rani) - Score: 120 points - Rank 2
    """
    
    sync_hackerrank_to_firebase(ACTIVE_EXAM_ID, raw_contest_data)
