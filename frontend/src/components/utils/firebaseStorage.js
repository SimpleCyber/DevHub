// src/utils/firebaseStorage.js
import {
  getFirestore,
  collection,
  addDoc,
  getDocs,
  doc,
  getDoc,
  query,
  where,
} from "firebase/firestore";
const db = getFirestore();

// Mock Interview storage
export const mockInterviewStorage = {
  // Create a new mock interview
  create: async (interview) => {
    const docRef = await addDoc(collection(db, "mockInterviews"), interview);
    return { id: docRef.id, ...interview };
  },

  // Get all mock interviews
  getAll: async () => {
    const querySnapshot = await getDocs(collection(db, "mockInterviews"));
    return querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  },

  // Get a mock interview by ID
  getById: async (mockId) => {
    const docRef = doc(db, "mockInterviews", mockId);
    const docSnap = await getDoc(docRef);
    return docSnap.exists() ? { id: docSnap.id, ...docSnap.data() } : null;
  },
};

// User Answer storage
export const userAnswerStorage = {
  // Create a new user answer
  create: async (answer) => {
    const docRef = await addDoc(collection(db, "userAnswers"), answer);
    return { id: docRef.id, ...answer };
  },

  // Get all user answers for a specific mock interview
  getByMockId: async (mockId) => {
    const q = query(
      collection(db, "userAnswers"),
      where("mockIdRef", "==", mockId),
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  },
};

export { db };
