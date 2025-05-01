'use client'

import React, { useEffect, useState } from 'react'
import { auth } from '../../firebase'

const Dashboard = () => {
  const [iframeUrl, setIframeUrl] = useState('')

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(user => {
      if (user) {
        const uid = user.uid
        setIframeUrl(`https://devhub-interview-bg.vercel.app/?uid=${uid}`)
      } else {
        // Fallback or redirect to login
        setIframeUrl(`https://devhub-interview-bg.vercel.app/?uid=cw43tr96pmfS9seWHKCMbzlmZEi1`)
      }
    })

    return () => unsubscribe()
  }, [])

  return (
    <div className="m-0 p-0 overflow-hidden bg-blue-50">
      {iframeUrl && (
        <iframe 
          src={iframeUrl}
          title="DevHub Interview Integration"
          className="w-full h-screen border-none outline-none"
          style={{ 
            margin: 0, 
            padding: 0, 
            overflow: 'auto', 
            scrollbarWidth: 'none', 
            msOverflowStyle: 'none',
          }} 
        />
      )}
    </div>
  )
}

export default Dashboard
