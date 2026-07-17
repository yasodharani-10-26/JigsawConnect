import os
import json
import requests
import firebase_admin
from firebase_admin import credentials
from firebase_admin import db

# ==========================================================
# 1. FIREBASE INITIALIZATION
# ==========================================================
# మీ firebase-key.json పాత్ ఇవ్వండి
cred = credentials.Certificate("firebase-key.json")

firebase_admin.initialize_app(cred, {
    # మీ leaderboard.html లో ఉన్న Database URL ని ఇక్కడ ఇవ్వండి
    'databaseURL': 'https://jigsawconnect-677da-default-rtdb.asia-southeast1.firebasedatabase.app'
})

# ==========================================================
# 2. OPENROUTER AI FUNCTION
# ==========================================================
def extract_scores_via_openrouter(raw_text_data):
    """
    అన్‌స్ట్రక్చర్డ్ హాకర్‌రాంక్ డేటాను OpenRouter API ద్వారా క్లీన్ JSON ఫార్మాట్ లోకి మారుస్తుంది.
    """
    openrouter_api_key = "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" # మీ API Key ఇక్కడ ఇవ్వండి
    
    prompt = f"""
    Analyze the following raw HackerRank leaderboard or exam results data.
    Extract the following details for each student:
    - hrId (HackerRank ID / Username)
    - name (Full Name - default to "Unknown" if not found)
    - rollNo (Roll Number - clean uppercase, e.g., 23A91A0501)
    - branch (Branch like CSE, ECE, EEE - extract from roll number or text)
    - section (Section like A, B, C - default to "A")
    - score (The obtained score/marks as a floating number)

    Ensure the output is strictly a valid JSON array of objects. Do not include markdown codeblocks, just the raw JSON.
    
    Raw Data:
    {raw_text_data}
    """

    headers = {
        "Authorization": f"Bearer {openrouter_api_key}",
        "Content-Type": "application/json"
    }
    
    payload = {
        "model": "google/gemini-2.5-flash", # బడ్జెట్ & వేగం కోసం ఈ మోడల్ చాలా బాగుంటుంది
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
    
    if not parsed_result or 'students' not in parsed_result:
        # గమనిక: మీ ప్రాంప్ట్ బట్టి వచ్చే కీ పేరు (ఉదా: 'students' లేదా డైరెక్ట్ లిస్ట్) సర్దుబాటు చేసుకోండి
        students_list = parsed_result if isinstance(parsed_result, list) else parsed_result.get('students', [])
    else:
        students_list = parsed_result.get('students', [])

    if not students_list:
        print("❌ No student data could be parsed.")
        return

    print(f"🎯 Successfully parsed {len(students_list)} students. Syncing to Firebase...")

    # Firebase Reference (leaderboard.html లో 'hackerRankLeaderboards/selectedExamId' కి మ్యాచ్ అవుతుంది)
    ref = db.reference(f'hackerRankLeaderboards/{exam_id}')
    
    # గ్లోబల్ స్టూడెంట్స్ డేటాను మ్యాచ్ చేయడానికి స్టూడెంట్స్ లిస్ట్ తెచ్చుకోవడం
    students_ref = db.reference('students')
    global_students = students_ref.get() or {}
    global_students_list = list(global_students.values()) if isinstance(global_students, dict) else []

    score_updates = {}
    for student in students_list:
        hr_id = student.get('hr_id') or student.get('hrId') or ""
        roll_no = student.get('rollNo') or student.get('roll_no') or ""
        
        if not hr_id and not roll_no:
            continue
            
        clean_hr_id = hr_id.strip().lower().replace('@', '')
        clean_roll = roll_no.strip().upper()
        
        # గ్లోబల్ స్టూడెంట్స్ తో మ్యాచ్ చేయడం (మీ JS కోడ్ లాగే)
        match = None
        for s in global_students_list:
            db_hr = str(s.get('hrId', '')).strip().lower()
            db_roll = str(s.get('rollNo', '')).strip().upper()
            if (clean_hr_id and db_hr == clean_hr_id) or (clean_roll and db_roll == clean_roll):
                match = s
                break

        final_key = match.get('hrId') if (match and match.get('hrId')) else (hr_id or roll_no)
        # Firebase కీలలో స్పెషల్ క్యారెక్టర్స్ లేకుండా క్లీన్ చేయడం
        safe_db_key = final_key.replace('.', '_').replace('#', '_').replace('$', '_').replace('[', '_').replace(']', '_').replace('/', '_')

        score_updates[safe_db_key] = {
            "hrId": final_key,
            "name": match.get('name') if match else student.get('name', 'Unknown'),
            "rollNo": match.get('rollNo') if match else (clean_roll if clean_roll else "N/A"),
            "branch": match.get('branch', 'CSE').upper() if match else student.get('branch', 'CSE').upper(),
            "section": match.get('section', 'A').upper() if match else student.get('section', 'A').upper(),
            "score": float(student.get('score', 0)),
            "data2": "", # అవసరమైతే అదనపు సమాచారం
            "data3": ""
        }

    # Firebase కి అప్‌డేట్ పంపడం
    if score_updates:
        ref.update(score_updates)
        print(f"🎉 Firebase Sync Complete! {len(score_updates)} scores updated for Exam ID: {exam_id}")
    else:
        print("⚠️ No valid updates to push.")

# ==========================================================
# RUNNING THE SCRIPT
# ==========================================================
if __name__ == "__main__":
    # 1. మీ Firebase లో ఉన్న 'hackerrankExams' కీ (ఉదా: '-Nxxxxxx' లేదా నిర్దేశిత ఎగ్జామ్ ఐడి)
    ACTIVE_EXAM_ID = "YOUR_ACTIVE_EXAM_ID_FROM_FIREBASE" 
    
    # 2. హాకర్‌రాంక్ నుండి కాపీ చేసిన రా లీడర్‌బోర్డ్ డేటా (లేదా టెక్స్ట్ ఫైల్ నుండి రీడ్ చేయవచ్చు)
    raw_contest_data = """
    Leaderboard of Exam-1:
    User: 23A91A0501 (Sasi) - Score: 150 points - Rank 1
    User: rani_ece_9 (Rani) - Score: 120 points - Rank 2
    """
    
    sync_hackerrank_to_firebase(ACTIVE_EXAM_ID, raw_contest_data)
