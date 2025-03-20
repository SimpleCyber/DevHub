"use client"

import { createContext, useContext, useState, useEffect } from "react"
import { auth } from "../../firebase" // Import Firebase auth
import { onAuthStateChanged } from "firebase/auth"

const UserContext = createContext()

export function UserProvider({ children }) {
  const [user, setUser] = useState(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Listen for Firebase auth state changes
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        // Create a user object that matches your expected format
        const userData = {
          primaryEmailAddress: { emailAddress: firebaseUser.email },
          fullName: firebaseUser.displayName || "User",
          userId: firebaseUser.uid,
          // Add other properties you need from firebaseUser
        }
        setUser(userData)
        // Also save to localStorage if needed
        localStorage.setItem("user", JSON.stringify(userData))
      } else {
        setUser(null)
        localStorage.removeItem("user")
      }
      setIsLoading(false)
    })

    // Cleanup subscription on unmount
    return () => unsubscribe()
  }, [])

  // Keep these methods for compatibility with your existing code
  // but modify them to work with Firebase
  const signIn = (email, name) => {
    // This function is just for compatibility
    // Actual sign in should happen through Firebase Auth
    console.log("Use Firebase Auth instead of this method")
    return false
  }

  const signOut = () => {
    auth.signOut() // Use Firebase signOut
    // The listener above will handle clearing the user state
  }

  return <UserContext.Provider value={{ user, isLoading, signIn, signOut }}>{children}</UserContext.Provider>
}

export const useUser = () => {
  const context = useContext(UserContext)
  if (context === undefined) {
    throw new Error("useUser must be used within a UserProvider")
  }
  return context
}