# JigsawConnect

JigsawConnect ni Vercel lo live ga chudochu: [jigsaw-connect-seven.vercel.app](https://jigsaw-connect-seven.vercel.app)

JigsawConnect anedi students and administrators madhya communication, learning mariyu collaboration ni pempondinche oka web application. Indulo quizzes, discussions, study groups, and leaderboards lanti utility features unnay.

---

## 🚀 Features

### For Students:
* **Student Dashboard:** Users tana profile, registered groups, mariyu performance tracking ni chuskovachu.
* **Interactive Quizzes:** Subject-wise quizzes play chesi knowledge test cheskovachu.
* **Leaderboard:** Quizzes scores balti top performers ranking display avtundi.
* **Discussions & Study Groups:** Co-students tho interact avvadaniki, study groups create cheskovadaniki separate sections.
* **Resources:** Study materials mariyu important documents ni access cheyochu.

### For Admins:
* **Admin Dashboard:** Platform ni manage cheyadaniki, users updates chudadaniki admin panel.
* **Secure Admin Login:** Credentials verification tho securely login avvachu.

---

## 🛠️ Tech Stack

* **Frontend:** HTML5, CSS3, JavaScript (ES6+)
* **Backend/Database:** Firebase (Auth, Firestore/Realtime Database)
* **Deployment:** Vercel

---

## 📂 Project Structure

```text
├── api/                  # Backend API routes
├── admin-dashboard.html  # Admin Panel UI
├── admin-dashboard.js   # Admin Dashboard logic
├── admin-login.html      # Admin Login UI
├── admin-login.js        # Admin Login logic
├── app.js                # Main application initialization
├── discussions.html      # Discussion forum UI
├── firebase.js           # Firebase configuration and initialization
├── index.html            # Landing / Home Page
├── leaderboard.html      # Ranks and scores display
├── login.html            # General user login
├── main.js               # Global JS configurations
├── quiz.html             # Quiz interface
├── register.html         # New student registration
├── resources.html        # Study materials page
├── student-dashboard.html# Student profile & stats
├── student-login.html    # Student login portal
├── study-groups.html     # Group creations and chats
└── package.json          # Node dependencies
