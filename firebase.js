import { initializeApp } from "https://www.gstatic.com/firebasejs/10.14.0/firebase-app.js";

import {
  getDatabase,
  ref,
  set,
  get,
  update,
  onValue,
  push,
  remove
} from "https://www.gstatic.com/firebasejs/10.14.0/firebase-database.js";

import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  deleteUser,
  sendPasswordResetEmail
} from "https://www.gstatic.com/firebasejs/10.14.0/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyCaCkliRZk8HmNtOsJpoA084YhNY7MeMWM",
  authDomain: "jigsawconnect-677da.firebaseapp.com",
  databaseURL:
    "https://jigsawconnect-677da-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "jigsawconnect-677da",
  storageBucket: "jigsawconnect-677da.firebasestorage.app",
  messagingSenderId: "200774226361",
  appId: "1:200774226361:web:266cb216968403793f6668",
  measurementId: "G-D14L7VZRJM"
};


// ======================================================
// INITIALIZE FIREBASE
// ======================================================

const app = initializeApp(firebaseConfig);

const db = getDatabase(app);

const auth = getAuth(app);


// ======================================================
// DATABASE HELPERS
// ======================================================

const database = {

  // ----------------------------------------------------
  // GET DATA
  // ----------------------------------------------------

  async get(path) {
    try {
      const snapshot = await get(ref(db, path));

      if (snapshot.exists()) {
        return snapshot.val();
      }

      return null;

    } catch (error) {
      console.error(`Firebase GET error at ${path}:`, error);
      throw error;
    }
  },


  // ----------------------------------------------------
  // SET DATA
  // ----------------------------------------------------

  async set(path, data) {
    try {
      await set(ref(db, path), data);
      return true;

    } catch (error) {
      console.error(`Firebase SET error at ${path}:`, error);
      throw error;
    }
  },


  // ----------------------------------------------------
  // UPDATE DATA
  // ----------------------------------------------------

  async update(path, data) {
    try {
      await update(ref(db, path), data);
      return true;

    } catch (error) {
      console.error(`Firebase UPDATE error at ${path}:`, error);
      throw error;
    }
  },


  // ----------------------------------------------------
  // DELETE DATA
  // ----------------------------------------------------

  async remove(path) {
    try {
      await remove(ref(db, path));
      return true;

    } catch (error) {
      console.error(`Firebase DELETE error at ${path}:`, error);
      throw error;
    }
  },


  // ----------------------------------------------------
  // CREATE NEW RECORD
  // ----------------------------------------------------

  async push(path, data) {
    try {

      const newRef = push(ref(db, path));

      await set(newRef, {
        ...data,
        createdAt: Date.now()
      });

      return newRef.key;

    } catch (error) {
      console.error(`Firebase PUSH error at ${path}:`, error);
      throw error;
    }
  },


  // ----------------------------------------------------
  // REAL-TIME LISTENER
  // ----------------------------------------------------

  listen(path, callback) {

    return onValue(
      ref(db, path),
      snapshot => {

        callback(
          snapshot.exists()
            ? snapshot.val()
            : null
        );

      },
      error => {

        console.error(
          `Firebase LISTENER error at ${path}:`,
          error
        );

      }
    );

  }

};


// ======================================================
// COMPETENCY MAPPING
// ======================================================

const competency = {

  // ----------------------------------------------------
  // SAVE TRAINER COMPETENCY
  // ----------------------------------------------------

  async saveTrainerCompetency(trainerId, data) {

    return database.set(
      `competencies/trainers/${trainerId}`,
      {
        ...data,
        updatedAt: Date.now()
      }
    );

  },


  // ----------------------------------------------------
  // GET TRAINER COMPETENCY
  // ----------------------------------------------------

  async getTrainerCompetency(trainerId) {

    return database.get(
      `competencies/trainers/${trainerId}`
    );

  },


  // ----------------------------------------------------
  // SAVE SKILL PASSPORT
  // ----------------------------------------------------

  async saveSkillPassport(userId, passport) {

    return database.set(
      `skillPassports/${userId}`,
      {
        ...passport,
        updatedAt: Date.now()
      }
    );

  },


  // ----------------------------------------------------
  // GET SKILL PASSPORT
  // ----------------------------------------------------

  async getSkillPassport(userId) {

    return database.get(
      `skillPassports/${userId}`
    );

  },


  // ----------------------------------------------------
  // ADD SKILL EVIDENCE
  // ----------------------------------------------------

  async addSkillEvidence(userId, evidence) {

    return database.push(
      `skillPassports/${userId}/evidence`,
      {
        ...evidence,
        verified: evidence.verified ?? false
      }
    );

  },


  // ----------------------------------------------------
  // SAVE ROLE BLUEPRINT
  // ----------------------------------------------------

  async saveRoleBlueprint(blueprint) {

    return database.push(
      "roleBlueprints",
      blueprint
    );

  },


  // ----------------------------------------------------
  // GET ROLE BLUEPRINTS
  // ----------------------------------------------------

  async getRoleBlueprints() {

    return database.get(
      "roleBlueprints"
    );

  },


  // ----------------------------------------------------
  // SAVE MATCH RESULT
  // ----------------------------------------------------

  async saveMatchResult(data) {

    return database.push(
      "competencyMatches",
      {
        ...data,
        matchedAt: Date.now()
      }
    );

  },


  // ----------------------------------------------------
  // GET MATCH RESULTS
  // ----------------------------------------------------

  async getMatchResults(trainerId) {

    const data = await database.get(
      "competencyMatches"
    );

    if (!data) {
      return [];
    }

    return Object.entries(data)

      .map(([id, value]) => ({
        id,
        ...value
      }))

      .filter(
        item => !trainerId ||
        item.trainerId === trainerId
      );

  }

};


// ======================================================
// TRAINING MISSIONS
// ======================================================

const trainingMission = {

  // ----------------------------------------------------
  // CREATE MISSION
  // ----------------------------------------------------

  async create(mission) {

    return database.push(
      "trainingMissions",
      {
        ...mission,

        status:
          mission.status || "assigned",

        progress:
          mission.progress || 0,

        createdAt:
          Date.now(),

        updatedAt:
          Date.now()
      }
    );

  },


  // ----------------------------------------------------
  // UPDATE MISSION
  // ----------------------------------------------------

  async update(missionId, data) {

    return database.update(
      `trainingMissions/${missionId}`,
      {
        ...data,
        updatedAt: Date.now()
      }
    );

  },


  // ----------------------------------------------------
  // GET MISSION
  // ----------------------------------------------------

  async get(missionId) {

    return database.get(
      `trainingMissions/${missionId}`
    );

  },


  // ----------------------------------------------------
  // GET USER MISSIONS
  // ----------------------------------------------------

  async getUserMissions(userId) {

    const data =
      await database.get(
        "trainingMissions"
      );

    if (!data) {
      return [];
    }

    return Object.entries(data)

      .map(([id, value]) => ({
        id,
        ...value
      }))

      .filter(
        item =>
          item.userId === userId ||
          item.trainerId === userId
      );

  }

};


// ======================================================
// ORGANIZATION CHALLENGES
// ======================================================

const challenges = {

  // ----------------------------------------------------
  // CREATE CHALLENGE
  // ----------------------------------------------------

  async create(challenge) {

    return database.push(
      "organizationChallenges",
      {
        ...challenge,

        status:
          challenge.status || "open",

        participants:
          challenge.participants || 0,

        createdAt:
          Date.now()
      }
    );

  },


  // ----------------------------------------------------
  // GET CHALLENGES
  // ----------------------------------------------------

  async getAll() {

    const data =
      await database.get(
        "organizationChallenges"
      );

    if (!data) {
      return [];
    }

    return Object.entries(data)

      .map(([id, value]) => ({
        id,
        ...value
      }));

  },


  // ----------------------------------------------------
  // UPDATE CHALLENGE
  // ----------------------------------------------------

  async update(challengeId, data) {

    return database.update(
      `organizationChallenges/${challengeId}`,
      data
    );

  },


  // ----------------------------------------------------
  // SUBMIT CHALLENGE
  // ----------------------------------------------------

  async submit(challengeId, submission) {

    return database.push(
      `organizationChallenges/${challengeId}/submissions`,
      {
        ...submission,
        submittedAt: Date.now(),
        status: "submitted"
      }
    );

  }

};


// ======================================================
// TRAINER ASSIGNMENTS
// ======================================================

const assignments = {

  // ----------------------------------------------------
  // ASSIGN TRAINER
  // ----------------------------------------------------

  async create(data) {

    return database.push(
      "trainerAssignments",
      {
        ...data,

        status:
          data.status || "pending",

        assignedAt:
          Date.now()
      }
    );

  },


  // ----------------------------------------------------
  // UPDATE ASSIGNMENT
  // ----------------------------------------------------

  async update(assignmentId, data) {

    return database.update(
      `trainerAssignments/${assignmentId}`,
      {
        ...data,
        updatedAt: Date.now()
      }
    );

  },


  // ----------------------------------------------------
  // GET ASSIGNMENTS
  // ----------------------------------------------------

  async getForTrainer(trainerId) {

    const data =
      await database.get(
        "trainerAssignments"
      );

    if (!data) {
      return [];
    }

    return Object.entries(data)

      .map(([id, value]) => ({
        id,
        ...value
      }))

      .filter(
        item =>
          item.trainerId === trainerId
      );

  }

};


// ======================================================
// ROLE READINESS
// ======================================================

const roleReadiness = {

  // ----------------------------------------------------
  // SAVE ROLE READINESS
  // ----------------------------------------------------

  async save(userId, roleData) {

    return database.set(
      `roleReadiness/${userId}`,
      {
        ...roleData,
        calculatedAt: Date.now()
      }
    );

  },


  // ----------------------------------------------------
  // GET ROLE READINESS
  // ----------------------------------------------------

  async get(userId) {

    return database.get(
      `roleReadiness/${userId}`
    );

  }

};


// ======================================================
// LEARNING DNA
// ======================================================

const learningDNA = {

  // ----------------------------------------------------
  // SAVE LEARNING DNA
  // ----------------------------------------------------

  async save(userId, dna) {

    return database.set(
      `learningDNA/${userId}`,
      {
        ...dna,
        updatedAt: Date.now()
      }
    );

  },


  // ----------------------------------------------------
  // GET LEARNING DNA
  // ----------------------------------------------------

  async get(userId) {

    return database.get(
      `learningDNA/${userId}`
    );

  },


  // ----------------------------------------------------
  // ADD DNA EVENT
  // ----------------------------------------------------

  async addEvent(userId, event) {

    return database.push(
      `learningDNA/${userId}/events`,
      {
        ...event,
        timestamp: Date.now()
      }
    );

  }

};


// ======================================================
// TRAINER DATA
// ======================================================

const trainers = {

  // ----------------------------------------------------
  // SAVE TRAINER
  // ----------------------------------------------------

  async save(trainerId, data) {

    return database.set(
      `trainers/${trainerId}`,
      {
        ...data,
        updatedAt: Date.now()
      }
    );

  },


  // ----------------------------------------------------
  // GET TRAINER
  // ----------------------------------------------------

  async get(trainerId) {

    return database.get(
      `trainers/${trainerId}`
    );

  },


  // ----------------------------------------------------
  // GET ALL TRAINERS
  // ----------------------------------------------------

  async getAll() {

    const data =
      await database.get(
        "trainers"
      );

    if (!data) {
      return [];
    }

    return Object.entries(data)

      .map(([id, value]) => ({
        id,
        ...value
      }));

  },


  // ----------------------------------------------------
  // REAL-TIME TRAINER LIST
  // ----------------------------------------------------

  listen(callback) {

    return database.listen(
      "trainers",
      data => {

        if (!data) {
          callback([]);
          return;
        }

        callback(
          Object.entries(data)
            .map(([id, value]) => ({
              id,
              ...value
            }))
        );

      }
    );

  }

};


// ======================================================
// NOTIFICATIONS
// ======================================================

const notifications = {

  // ----------------------------------------------------
  // CREATE NOTIFICATION
  // ----------------------------------------------------

  async create(userId, notification) {

    return database.push(
      `notifications/${userId}`,
      {
        ...notification,
        read: false,
        createdAt: Date.now()
      }
    );

  },


  // ----------------------------------------------------
  // MARK AS READ
  // ----------------------------------------------------

  async markAsRead(userId, notificationId) {

    return database.update(
      `notifications/${userId}/${notificationId}`,
      {
        read: true
      }
    );

  },


  // ----------------------------------------------------
  // GET NOTIFICATIONS
  // ----------------------------------------------------

  async get(userId) {

    return database.get(
      `notifications/${userId}`
    );

  }

};


// ======================================================
// CURRENT USER HELPER
// ======================================================

const currentUser = {

  get() {

    return auth.currentUser;

  },

  getId() {

    return auth.currentUser?.uid || null;

  },

  getEmail() {

    return auth.currentUser?.email || null;

  },

  isLoggedIn() {

    return !!auth.currentUser;

  }

};


// ======================================================
// EXPORT EVERYTHING
// ======================================================

export {

  // Firebase core
  app,
  db,
  auth,

  // Firebase database
  ref,
  set,
  get,
  update,
  onValue,
  push,
  remove,

  // Firebase authentication
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  deleteUser,
  sendPasswordResetEmail,

  // Custom database helper
  database,

  // Competency system
  competency,

  // Training mission system
  trainingMission,

  // Organization challenge system
  challenges,

  // Trainer assignment system
  assignments,

  // Role readiness
  roleReadiness,

  // Learning DNA
  learningDNA,

  // Trainer management
  trainers,

  // Notifications
  notifications,

  // Current user
  currentUser

};
