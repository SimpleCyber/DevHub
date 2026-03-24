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

// Career Path storage
export const careerPathStorage = {
  // Create a new career path
  create: async (userId, pathData) => {
    const docRef = await addDoc(collection(db, "careerPaths"), {
      userId,
      ...pathData,
      createdAt: new Date().toISOString(),
    });
    return { id: docRef.id, ...pathData };
  },

  // Get all career paths for a specific user
  getByUserId: async (userId) => {
    const q = query(
      collection(db, "careerPaths"),
      where("userId", "==", userId)
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
  },

  // Update an existing career path
  update: async (pathId, updateData) => {
    const { doc, updateDoc } = await import("firebase/firestore");
    const docRef = doc(db, "careerPaths", pathId);
    await updateDoc(docRef, { ...updateData, updatedAt: new Date().toISOString() });
  },

  // Delete a career path
  delete: async (pathId) => {
    const { doc, deleteDoc } = await import("firebase/firestore");
    const docRef = doc(db, "careerPaths", pathId);
    await deleteDoc(docRef);
  },
};

export { db };
