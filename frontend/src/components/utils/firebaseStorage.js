// src/utils/firebaseStorage.js
import {
  getFirestore,
  collection,
  addDoc,
  getDocs,
  doc,
  getDoc,
  updateDoc,
  setDoc,
  deleteDoc,
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
    return querySnapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
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
    return querySnapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
  },
};

// Career Path storage
export const careerPathStorage = {
  // Create a new career path
  create: async (userId, pathData) => {
    try {
      const docRef = await addDoc(collection(db, "careerPaths"), {
        userId,
        ...pathData,
        createdAt: new Date().toISOString(),
      });
      return { id: docRef.id, ...pathData };
    } catch (error) {
      console.error("Error creating career path:", error);
      throw error;
    }
  },

  // Get all career paths for a specific user
  getByUserId: async (userId) => {
    try {
      const q = query(
        collection(db, "careerPaths"),
        where("userId", "==", userId),
      );
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map((d) => ({
        id: d.id,
        ...d.data(),
      }));
    } catch (error) {
      console.error("Error getting career paths:", error);
      throw error;
    }
  },

  // Update an existing career path
  update: async (pathId, updateData) => {
    try {
      const docRef = doc(db, "careerPaths", pathId);
      await updateDoc(docRef, {
        ...updateData,
        updatedAt: new Date().toISOString(),
      });
    } catch (error) {
      console.error("Error updating career path:", error);
      throw error;
    }
  },

  delete: async (pathId) => {
    try {
      const docRef = doc(db, "careerPaths", pathId);
      await deleteDoc(docRef);
    } catch (error) {
      console.error("Error deleting career path:", error);
      throw error;
    }
  },
};

// Career Stats storage (for rate limits)
export const careerStatsStorage = {
  getStats: async (userId) => {
    try {
      const docRef = doc(db, "careerStats", userId);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        return docSnap.data();
      }
      return { generationsCount: 0 };
    } catch (error) {
      console.error("Error getting user career stats:", error);
      return { generationsCount: 0 };
    }
  },
  
  incrementCount: async (userId) => {
    try {
      const docRef = doc(db, "careerStats", userId);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        await updateDoc(docRef, { generationsCount: (docSnap.data().generationsCount || 0) + 1 });
      } else {
        await setDoc(docRef, { generationsCount: 1 });
      }
    } catch (err) {
      console.error(err);
    }
  },

  updateStats: async (userId, updateData) => {
    try {
      const docRef = doc(db, "careerStats", userId);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        await updateDoc(docRef, updateData);
      } else {
        await setDoc(docRef, { generationsCount: 0, ...updateData });
      }
    } catch (err) {
      console.error("Error updating stats:", err);
    }
  }
};

export { db };
