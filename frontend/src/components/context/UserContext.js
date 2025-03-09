"use client"

import { createContext, useContext, useState, useEffect } from "react"

const UserContext = createContext()

export function UserProvider({ children }) {
  const [user, setUser] = useState(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Check if user is stored in localStorage
    const storedUser = localStorage.getItem("user")
    if (storedUser) {
      setUser(JSON.parse(storedUser))
    }
    setIsLoading(false)
  }, [])

  const signIn = (email, name) => {
    const newUser = {
      primaryEmailAddress: { emailAddress: email },
      fullName: name,
    }
    localStorage.setItem("user", JSON.stringify(newUser))
    setUser(newUser)
    return true
  }

  const signOut = () => {
    localStorage.removeItem("user")
    setUser(null)
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

