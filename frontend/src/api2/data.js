import  { useEffect, useState } from "react";
import axios from "axios";
import { auth } from "../firebase";
import { getFirestore, doc, getDoc, setDoc } from "firebase/firestore";

// const API_URL = "http://127.0.0.1:8000/api/";
const API_URL = "https://devhub-k9dg.onrender.com/api/";

// Custom Hook
const useFetchPlatformData = (uid) => {
  const [linkedinData, setLinkedinData] = useState(null);
  const [githubData, setGithubData] = useState(null);
  const [leetcodeData, setLeetcodeData] = useState(null);
  const [usernames, setUsernames] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

  const db = getFirestore();

  // Utility: Check if data should be fetched (based on cache)
  const shouldFetchData = (timestamp) => {
    console.log("Checking timestamp:", timestamp, "Current time:", Date.now());
    console.log("Diff:", Date.now() - timestamp, "Cache duration:", CACHE_DURATION);
    return Date.now() - timestamp > CACHE_DURATION;
  };

  // Fetch data from Firestore
  const fetchFromFirestore = async (platform) => {
    const userId = uid || (auth.currentUser ? auth.currentUser.uid : null);

    if (!userId) {
      console.log("No authenticated user");
      return null;
    }

    console.log(`Fetching ${platform} data from Firestore for user:`, userId);
    const userRef = doc(db, "profiles", userId);
    
    try {
      const docSnap = await getDoc(userRef);
      
      if (docSnap.exists()) {
        const data = docSnap.data();
        console.log(`Firestore ${platform} data:`, data[platform]);
        
        if (data[platform]) {
          // If data exists but is stale, return it but mark for refresh
          const isStale = shouldFetchData(data[platform].timestamp);
          console.log(`${platform} data stale?`, isStale);
          
          return {
            data: data[platform].data,
            isStale: isStale
          };
        }
      } else {
        console.log("No document found for user");
      }
    } catch (error) {
      console.error(`Error fetching ${platform} data from Firestore:`, error);
    }
    
    return null; // No data or error
  };

  // Save data to Firestore
  const saveToFirestore = async (platform, data) => {
    if (!auth.currentUser || (uid && uid !== auth.currentUser.uid)) return;
    
    console.log(`Saving ${platform} data to Firestore`);
    const userRef = doc(db, "profiles", auth.currentUser.uid);
    const timestamp = Date.now();

    try {
      await setDoc(userRef, {
        [platform]: {
          data: data,
          timestamp: timestamp,
        },
      }, { merge: true });
      console.log(`${platform} data saved successfully`);
    } catch (error) {
      console.error(`Error saving ${platform} data:`, error);
    }
  };

  // Fetch fresh data from API
  const fetchFromAPI = async (platform, username) => {
    console.log(`Fetching ${platform} data from API for username:`, username);
    try {
      const response = await axios.get(`${API_URL}${platform}/${username}/`);
      console.log(`${platform} API response:`, response.data);
      return response.data;
    } catch (error) {
      console.error(`Error fetching ${platform} data from API:`, error);
      return null;
    }
  };

  // Load usernames from Firestore
  useEffect(() => {
    const fetchUsernames = async () => {
      const userId = uid || (auth.currentUser ? auth.currentUser.uid : null);

      if (!userId) {
        console.log("No authenticated user for username fetch");
        setIsLoading(false);
        return;
      }

      console.log("Fetching usernames for user:", userId);
      
      try {
        const docRef = doc(db, "profiles", userId);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
          const data = docSnap.data();
          console.log("Profile data:", data);
          
          setUsernames({
            linkedin: data.linkedin,
            github: data.github,
            leetcode: data.leetcode,
          });
        } else {
          console.log("No profile document found");
        }
      } catch (err) {
        console.error("Failed to fetch profile data", err);
      }
      
      setIsLoading(false);
    };

    fetchUsernames();
  }, []);

  // Fetch platform data once usernames are available
  useEffect(() => {
    if (!usernames) {
      console.log("No usernames available yet");
      return;
    }

    console.log("Usernames loaded:", usernames);
    setIsLoading(true);

    const fetchData = async () => {
      // GitHub data
      if (usernames.github) {
        const githubResult = await fetchFromFirestore("github");
        
        if (githubResult) {
          console.log("Setting GitHub data from Firestore");
          setGithubData(githubResult.data);
          
          // If data is stale, update in background
          if (githubResult.isStale) {
            console.log("GitHub data is stale, fetching fresh data in background");
            const freshData = await fetchFromAPI("github", usernames.github);
            if (freshData) {
              console.log("Updating GitHub data");
              setGithubData(freshData);
              saveToFirestore("github", freshData);
            }
          }
        } else {
          console.log("No GitHub data in Firestore, fetching from API");
          const freshData = await fetchFromAPI("github", usernames.github);
          if (freshData) {
            setGithubData(freshData);
            saveToFirestore("github", freshData);
          }
        }
      }

      // LinkedIn data
      if (usernames.linkedin) {
        const linkedinResult = await fetchFromFirestore("linkedin");
        
        if (linkedinResult) {
          setLinkedinData(linkedinResult.data);
          
          if (linkedinResult.isStale) {
            const freshData = await fetchFromAPI("linkedin", usernames.linkedin);
            if (freshData) {
              setLinkedinData(freshData);
              saveToFirestore("linkedin", freshData);
            }
          }
        } else {
          const freshData = await fetchFromAPI("linkedin", usernames.linkedin);
          if (freshData) {
            setLinkedinData(freshData);
            saveToFirestore("linkedin", freshData);
          }
        }
      }

      // LeetCode data
      if (usernames.leetcode) {
        const leetcodeResult = await fetchFromFirestore("leetcode");
        
        if (leetcodeResult) {
          setLeetcodeData(leetcodeResult.data);
          
          if (leetcodeResult.isStale) {
            const freshData = await fetchFromAPI("leetcode", usernames.leetcode);
            if (freshData) {
              setLeetcodeData(freshData);
              saveToFirestore("leetcode", freshData);
            }
          }
        } else {
          const freshData = await fetchFromAPI("leetcode", usernames.leetcode);
          if (freshData) {
            setLeetcodeData(freshData);
            saveToFirestore("leetcode", freshData);
          }
        }
      }
      
      setIsLoading(false);
    };

    fetchData();
  }, [usernames]);

  return { linkedinData, githubData, leetcodeData, isLoading };
};

export default useFetchPlatformData;