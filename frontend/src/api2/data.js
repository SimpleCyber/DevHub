import { useEffect, useState } from "react";
import axios from "axios";
import { auth } from "../firebase";
import { getFirestore, doc, getDoc, setDoc } from "firebase/firestore";

// API endpoint configuration
// const API_URL = "http://127.0.0.1:8000/api/";
const API_URL = "https://devhub-k9dg.onrender.com/api/";

// Cache duration in milliseconds (24 hours)
const CACHE_DURATION = 24 * 60 * 60 * 1000;

/**
 * Custom hook to fetch platform data with caching
 * @param {string} uid - User ID (optional, defaults to current user)
 * @returns {Object} Platform data and loading state
 */
const useFetchPlatformData = (uid) => {
  const [platformData, setPlatformData] = useState({
    linkedin: null,
    github: null,
    leetcode: null
  });
  const [usernames, setUsernames] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  
  const db = getFirestore();

  // Check if cached data is stale
  const isCacheStale = (timestamp) => {
    if (!timestamp) return true;
    return Date.now() - timestamp > CACHE_DURATION;
  };

  // Get the current user ID
  const getUserId = () => {
    return uid || (auth.currentUser ? auth.currentUser.uid : null);
  };

  // Fetch data from Firestore
  const fetchFromFirestore = async () => {
    const userId = getUserId();
    if (!userId) {
      console.log("No authenticated user");
      return {};
    }

    console.log("Fetching profile data from Firestore for user:", userId);
    try {
      const userRef = doc(db, "profiles", userId);
      const docSnap = await getDoc(userRef);
      
      if (docSnap.exists()) {
        return docSnap.data();
      } else {
        console.log("No profile document found");
        return {};
      }
    } catch (error) {
      console.error("Error fetching data from Firestore:", error);
      return {};
    }
  };

  // Save data to Firestore
  const saveToFirestore = async (platform, data) => {
    const userId = getUserId();
    if (!userId) return;
    
    console.log(`Saving ${platform} data to Firestore`);
    try {
      const userRef = doc(db, "profiles", userId);
      await setDoc(userRef, {
        [platform]: {
          data: data,
          timestamp: Date.now(),
        },
      }, { merge: true });
      console.log(`${platform} data saved successfully`);
    } catch (error) {
      console.error(`Error saving ${platform} data:`, error);
    }
  };

  // Fetch data from API
  const fetchFromAPI = async (platform, username) => {
    console.log(`Fetching ${platform} data from API for username:`, username);
    try {
      const response = await axios.get(`${API_URL}${platform}/${username}/`);
      console.log(`${platform} API response received`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching ${platform} data from API:`, error);
      return null;
    }
  };

  // Fetch and process data for a single platform
  const fetchPlatformData = async (platform, username, firestoreData) => {
    // Check if we have cached data
    const cachedInfo = firestoreData[platform] || {};
    const isStale = isCacheStale(cachedInfo.timestamp);
    
    // Use cached data if available and not stale
    if (cachedInfo.data && !isStale) {
      console.log(`Using cached ${platform} data`);
      setPlatformData(prev => ({
        ...prev,
        [platform]: cachedInfo.data
      }));
      return;
    }
    
    // If stale or no cached data, fetch fresh data
    console.log(`Fetching fresh ${platform} data`);
    const freshData = await fetchFromAPI(platform, username);
    
    if (freshData) {
      setPlatformData(prev => ({
        ...prev,
        [platform]: freshData
      }));
      saveToFirestore(platform, freshData);
    } else if (cachedInfo.data) {
      // If API fetch fails but we have stale data, use it as fallback
      console.log(`Using stale ${platform} data as fallback`);
      setPlatformData(prev => ({
        ...prev,
        [platform]: cachedInfo.data
      }));
    }
  };

  // Load usernames from Firestore
  useEffect(() => {
    const loadUsernames = async () => {
      const firestoreData = await fetchFromFirestore();
      
      // Extract usernames
      setUsernames({
        linkedin: firestoreData.linkedin || null,
        github: firestoreData.github || null,
        leetcode: firestoreData.leetcode || null
      });
      
      setIsLoading(false);
    };

    loadUsernames();
  }, [uid]);

  // Fetch platform data when usernames are available
  useEffect(() => {
    if (!usernames) return;
    
    const fetchAllPlatformData = async () => {
      setIsLoading(true);
      console.log("Starting to fetch platform data");
      
      const firestoreData = await fetchFromFirestore();
      
      // Fetch data for each configured platform
      const platforms = ['github', 'linkedin', 'leetcode'];
      const fetchPromises = platforms.map(platform => {
        if (usernames[platform]) {
          return fetchPlatformData(platform, usernames[platform], firestoreData);
        }
        return Promise.resolve();
      });
      
      await Promise.all(fetchPromises);
      setIsLoading(false);
    };

    fetchAllPlatformData();
  }, [usernames]);

  return {
    linkedinData: platformData.linkedin,
    githubData: platformData.github,
    leetcodeData: platformData.leetcode,
    isLoading
  };
};

export default useFetchPlatformData;