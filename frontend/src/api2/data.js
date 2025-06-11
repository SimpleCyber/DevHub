import { useEffect, useState } from "react";
import axios from "axios";
import { auth } from "../firebase";
import { getFirestore, doc, getDoc, setDoc } from "firebase/firestore";

const API_URL = "https://devhub-k9dg.onrender.com/api/";

const CACHE_DURATIONS = {
  linkedin: 30 * 24 * 60 * 60 * 1000, // 30 days
  github: 24 * 60 * 60 * 1000,        // 1 day
  leetcode: 24 * 60 * 60 * 1000       // 1 day
};

const useFetchPlatformData = (uid) => {
  const [platformData, setPlatformData] = useState({
    linkedin: null,
    github: null,
    leetcode: null
  });
  const [usernames, setUsernames] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  
  const db = getFirestore();

  const formatDate = (timestamp) => {
    if (!timestamp) return "Never";
    return new Date(timestamp).toLocaleString("en-IN", {
      timeZone: "Asia/Kolkata",
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  const formatTimeRemaining = (ms) => {
    if (ms <= 0) return "0d 0h";
    const days = Math.floor(ms / (1000 * 60 * 60 * 24));
    const hours = Math.floor((ms % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    return `${days}d ${hours}h`;
  };

  const isCacheStale = (timestamp, platform) => {
    if (!timestamp) return true;
    const cacheDuration = CACHE_DURATIONS[platform];
    return Date.now() - timestamp > cacheDuration;
  };

  const logCacheStatus = (platform, username, timestamp) => {
    if (!username) return;
    
    const cacheDuration = CACHE_DURATIONS[platform];
    const timeSinceUpdate = timestamp ? Date.now() - timestamp : Infinity;
    const isStale = timeSinceUpdate > cacheDuration;
    
    console.log(
      `${platform.padEnd(8)} Username: ${username}\n` +
      `          Last Updated: ${formatDate(timestamp)}\n` +
      `          Time Since Update: ${formatTimeRemaining(timeSinceUpdate)}\n` +
      `          Cache Duration: ${formatTimeRemaining(cacheDuration)}\n` +
      `          Status: ${isStale ? 'STALE (needs update)' : 'FRESH (using cache)'}`
    );
    console.log('───────────────────────────────────────────────────');
  };

  const getUserId = () => {
    return uid || (auth.currentUser ? auth.currentUser.uid : null);
  };

  const fetchFromFirestore = async () => {
    const userId = getUserId();
    if (!userId) return {};
    
    try {
      const userRef = doc(db, "profiles", userId);
      const docSnap = await getDoc(userRef);
      return docSnap.exists() ? docSnap.data() : {};
    } catch (error) {
      return {};
    }
  };

  const saveToFirestore = async (platform, data, username) => {
    const userId = getUserId();
    if (!userId) return;
    
    try {
      const userRef = doc(db, "profiles", userId);
      await setDoc(userRef, {
        [platform]: {
          data: data,
          timestamp: Date.now(),
          username: username,
        }
      }, { merge: true });
    } catch (error) {
      console.error(`Error saving ${platform} data:`, error);
    }
  };

  const fetchFromAPI = async (platform, username) => {
    try {
      const response = await axios.get(`${API_URL}${platform}/${username}/`);
      return response.data;
    } catch (error) {
      return null;
    }
  };

  const fetchPlatformData = async (platform, username) => {
    if (!username) return;
    
    const firestoreData = await fetchFromFirestore();
    const cachedData = firestoreData[platform];
    
    logCacheStatus(platform, username, cachedData?.timestamp);
    
    if (cachedData?.data && !isCacheStale(cachedData.timestamp, platform)) {
      setPlatformData(prev => ({ ...prev, [platform]: cachedData.data }));
      return;
    }
    
    setIsLoading(true);
    const freshData = await fetchFromAPI(platform, username);
    
    if (freshData) {
      setPlatformData(prev => ({ ...prev, [platform]: freshData }));
      await saveToFirestore(platform, freshData, username);
      logCacheStatus(platform, username, Date.now());
    } else if (cachedData?.data) {
      setPlatformData(prev => ({ ...prev, [platform]: cachedData.data }));
    }
    
    setIsLoading(false);
  };

  // Initialize data
  useEffect(() => {
    const initializeData = async () => {
      setIsLoading(true);
      const firestoreData = await fetchFromFirestore();
      
      const initialUsernames = {};
      const initialData = { linkedin: null, github: null, leetcode: null };
      
      ['linkedin', 'github', 'leetcode'].forEach(platform => {
        if (firestoreData[platform]) {
          initialUsernames[platform] = firestoreData[platform].username;
          initialData[platform] = firestoreData[platform].data;
        }
      });
      
      setUsernames(initialUsernames);
      setPlatformData(initialData);
      setIsLoading(false);
    };

    initializeData();
  }, [uid]);

  // Fetch data when usernames change
  useEffect(() => {
    if (!Object.keys(usernames).length) return;
    
    const fetchData = async () => {
      console.log('[PLATFORM STATUS] Current Cache Information:');
      console.log('───────────────────────────────────────────────────');
      await Promise.all(
        Object.entries(usernames)
          .filter(([_, username]) => username)
          .map(([platform, username]) => fetchPlatformData(platform, username))
      );
    };
    
    fetchData();
  }, [usernames]);

  return {
    linkedinData: platformData.linkedin,
    githubData: platformData.github,
    leetcodeData: platformData.leetcode,
    usernames,
    isLoading
  };
};

export default useFetchPlatformData;