import { useEffect, useState } from "react";
import axios from "axios";
import { auth } from "../firebase";
import { getFirestore, doc, getDoc, setDoc } from "firebase/firestore";

// API endpoint configuration
// const API_URL = "http://127.0.0.1:8000/api/";
const API_URL = "https://devhub-k9dg.onrender.com/api/";

// Cache duration in milliseconds (24 hours - for GitHub and LeetCode)
const DAILY_CACHE_DURATION = 24 * 60 * 60 * 1000;

/**
 * Custom hook to fetch platform data with improved caching
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

  // Check if daily cache is stale (for GitHub and LeetCode)
  const isDailyCacheStale = (timestamp, platform) => {
    if (!timestamp) return true;
    if (platform === 'linkedin') return false; // LinkedIn data never stale, fetch only once
    return Date.now() - timestamp > DAILY_CACHE_DURATION;
  };

  // Check if a platform has ever been fetched for this user
  const hasBeenFetchedBefore = (firestoreData, platform) => {
    return firestoreData[platform] && firestoreData[platform].data;
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

  // Background update function - updates data without affecting state immediately
  const backgroundUpdate = async (platform, username) => {
    console.log(`Background updating ${platform} data`);
    try {
      const freshData = await fetchFromAPI(platform, username);
      if (freshData) {
        saveToFirestore(platform, freshData);
        console.log(`${platform} data updated in background`);
      }
    } catch (error) {
      console.error(`Error in background update for ${platform}:`, error);
    }
  };

  // Fetch and process data for a single platform
  const fetchPlatformData = async (platform, username, firestoreData) => {
    // First, always get and display Firebase data if available
    const cachedInfo = firestoreData[platform] || {};
    
    if (cachedInfo.data) {
      console.log(`Using cached ${platform} data from Firebase`);
      setPlatformData(prev => ({
        ...prev,
        [platform]: cachedInfo.data
      }));
    }
    
    // Check if we need to fetch from API based on platform-specific rules
    const isStale = isDailyCacheStale(cachedInfo.timestamp, platform);
    const neverFetchedBefore = !hasBeenFetchedBefore(firestoreData, platform);
    
    // For LinkedIn: Fetch only if never fetched before
    // For GitHub/LeetCode: Fetch in background if stale
    if (platform === 'linkedin' && neverFetchedBefore) {
      console.log(`Fetching LinkedIn data for the first time`);
      const freshData = await fetchFromAPI(platform, username);
      if (freshData) {
        setPlatformData(prev => ({
          ...prev,
          [platform]: freshData
        }));
        saveToFirestore(platform, freshData);
      }
    } else if (platform !== 'linkedin' && isStale) {
      // For GitHub and LeetCode, update in background if stale
      backgroundUpdate(platform, username);
    }
  };

  // Load usernames and Firebase data first
  useEffect(() => {
    const loadInitialData = async () => {
      const firestoreData = await fetchFromFirestore();
      
      // First set any available data from Firebase immediately
      Object.keys(firestoreData).forEach(platform => {
        if (firestoreData[platform]?.data) {
          setPlatformData(prev => ({
            ...prev,
            [platform]: firestoreData[platform].data
          }));
        }
      });
      
      // Extract usernames
      const extractedUsernames = {
        linkedin: firestoreData.linkedin?.username || null,
        github: firestoreData.github?.username || null,
        leetcode: firestoreData.leetcode?.username || null
      };
      
      setUsernames(extractedUsernames);
      setIsLoading(false);
    };

    loadInitialData();
  }, [uid]);

  // Fetch platform data according to the rules when usernames are available
  useEffect(() => {
    if (!usernames) return;
    
    const fetchAllPlatformData = async () => {
      console.log("Starting to fetch platform data according to rules");
      
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