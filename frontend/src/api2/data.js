import { useEffect, useState } from "react";
import axios from "axios";
import { auth } from "../firebase";
import { getFirestore, doc, getDoc, setDoc } from "firebase/firestore";

const API_URL = "https://devhub-k9dg.onrender.com/api/";

const DAILY_CACHE_DURATION = 24 * 60 * 60 * 1000;

const useFetchPlatformData = (uid) => {
  const [platformData, setPlatformData] = useState({
    linkedin: null,
    github: null,
    leetcode: null
  });
  const [usernames, setUsernames] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  
  const db = getFirestore();

  const isDailyCacheStale = (timestamp, platform) => {
    if (!timestamp) return true;
    if (platform === 'linkedin') return false; 
    return Date.now() - timestamp > DAILY_CACHE_DURATION;
  };

  const hasBeenFetchedBefore = (firestoreData, platform) => {
    return firestoreData[platform] && firestoreData[platform].data;
  };

  const getUserId = () => {
    return uid || (auth.currentUser ? auth.currentUser.uid : null);
  };

  const fetchFromFirestore = async () => {
    const userId = getUserId();
    if (!userId) {
      console.log("No authenticated user");
      return {};
    }


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

  const saveToFirestore = async (platform, data, username) => {
    const userId = getUserId();
    if (!userId) return;
    
    console.log(`Saving ${platform} data to Firestore`);
    try {
      const userRef = doc(db, "profiles", userId);
      await setDoc(userRef, {
        [platform]: {
          data: data,
          timestamp: Date.now(),
          username: username,
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

  const backgroundUpdate = async (platform, username) => {
    console.log(`Background updating ${platform} data`);
    try {
      const freshData = await fetchFromAPI(platform, username);
      if (freshData) {
        saveToFirestore(platform, freshData, username); 
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
    const timestamp = cachedInfo.timestamp;
    const istDate = new Date(timestamp).toLocaleString("en-IN", { timeZone: "Asia/Kolkata" });

    if (cachedInfo.data) {
      console.log(`Using cached ${platform} data from Firebase`,istDate);
      setPlatformData(prev => ({
        ...prev,
        [platform]: cachedInfo.data
      }));
    }
    
    // Check if we need to fetch from API based on platform-specific rules
    const isStale = isDailyCacheStale(cachedInfo.timestamp, platform);
    const neverFetchedBefore = !hasBeenFetchedBefore(firestoreData, platform);

    if (platform === 'linkedin' && neverFetchedBefore) {
      console.log(`Fetching LinkedIn data for the first time`);
      const freshData = await fetchFromAPI(platform, username);
      if (freshData) {
        setPlatformData(prev => ({
          ...prev,
          [platform]: freshData
        }));
        saveToFirestore(platform, freshData, username); 
      }
    } else if (platform !== 'linkedin' && isStale) {
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
      
      // Extract usernames from Firestore data
      const extractedUsernames = {};
      
      // Check each platform for username
      ['linkedin', 'github', 'leetcode'].forEach(platform => {
        // Try to find username at either root level or inside platform object
        if (firestoreData[platform]?.username) {
          extractedUsernames[platform] = firestoreData[platform].username;
        } else if (typeof firestoreData[platform] === 'string') {
          // Legacy format - username directly as string (from old code)
          extractedUsernames[platform] = firestoreData[platform];
        } else if (firestoreData[platform]?.data?.username) {
          // Check if username is inside the data object
          extractedUsernames[platform] = firestoreData[platform].data.username;
        } else {
          extractedUsernames[platform] = null;
        }
      });
      
      setUsernames(extractedUsernames);
      setIsLoading(false);
    };

    loadInitialData();
  }, [uid]);

  // Fetch platform data according to the rules when usernames are available
  useEffect(() => {
    if (!usernames) return;
    
    const fetchAllPlatformData = async () => {
      // Set loading again when starting new fetches
      setIsLoading(true);
      
      console.log("Starting to fetch platform data according to rules");
      console.log("Current usernames:", usernames);
      
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
      
      // Mark loading as complete after all fetches
      setIsLoading(false);
    };

    fetchAllPlatformData();
  }, [usernames]);

  // Return both platform data and usernames
  return {
    linkedinData: platformData.linkedin,
    githubData: platformData.github,
    leetcodeData: platformData.leetcode,
    usernames, // Add usernames to return object
    isLoading
  };
};

export default useFetchPlatformData;