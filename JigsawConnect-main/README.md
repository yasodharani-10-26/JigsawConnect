# JigsawConnect

Live Preview on Vercel: [jigsaw-connect-seven.vercel.app](https://jigsaw-connect-seven.vercel.app)

JigsawConnect is a comprehensive web application designed to enhance communication, learning, and collaboration between students and administrators. It comes equipped with utility features such as interactive quizzes, discussion boards, study groups, and real-time leaderboards.

---

## 🚀 Features

### For Students
* **Student Dashboard:** Enables users to manage their profiles, view registered groups, and monitor their performance tracking.
* **Interactive Quizzes:** Offers subject-specific quizzes to test and validate knowledge.
* **Leaderboard:** Displays rankings of top performers based on quiz scores.
* **Discussions & Study Groups:** Dedicated sections for interacting with peers and collaborating within study groups.
* **Resources:** High-quality access to study materials and essential educational documents.

### For Admins
* **Admin Dashboard:** A robust control panel to manage the platform and track user updates.
* **Secure Admin Login:** Credentials verification ensuring strict, secure admin portal access.

---

## 🛠️ Tech Stack

* **Frontend:** HTML5, CSS3, JavaScript (ES6+)
* **Backend / Database:** Firebase (Authentication, Firestore / Realtime Database)
* **Deployment:** Vercel

---

## 📂 Project Structure

```text
├── api/                   # Backend API routes
├── admin-dashboard.html   # Admin Panel UI
├── admin-dashboard.js     # Admin Dashboard logic
├── admin-login.html       # Admin Login UI
├── admin-login.js         # Admin Login logic
├── app.js                 # Main application initialization
├── discussions.html       # Discussion forum UI
├── firebase.js            # Firebase configuration and initialization
├── index.html             # Landing / Home Page
├── leaderboard.html       # Ranks and scores display
├── login.html             # General user login
├── main.js                # Global JS configurations
├── quiz.html              # Quiz interface
├── register.html          # New student registration
├── resources.html         # Study materials page
├── student-dashboard.html # Student profile & stats
├── student-login.html     # Student login portal
├── codehub.html           # Group creations and chats
├── package.json           # Node dependencies
└── placements.html        # Internships, interviews, and exam resources
