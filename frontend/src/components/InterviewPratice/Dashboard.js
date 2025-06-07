'use client'
import { useState, useEffect } from 'react'

const Dashboard = () => {
  const [windowWidth, setWindowWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1024)

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth)
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  // Simple scale: normal on desktop, slightly smaller on mobile
  const scale = windowWidth < 768 ? 0.75 : 1

  return (
    <div className="m-0 p-0 overflow-hidden  mt-14 sm:mt-0">
      <div 
        className="w-full"
        style={{
          height: "fit-content",
          overflow: 'hidden'
        }}
      >
        <iframe 
          src="https://devhub-interview-bg.vercel.app/" 
          title="DevHub Interview Integration" 
          className="border-none outline-none origin-top-left"
          allow="microphone; camera; display-capture"
          style={{ 
            margin: 0, 
            padding: 0, 
            overflow: 'auto',
            scrollbarWidth: 'none', 
            msOverflowStyle: 'none',
            height: '200vh',
            width: `${100 / scale}%`,
            transform: `scale(${scale})`,
            transformOrigin: 'top left',
            WebkitScrollbar: { display: 'none' }
          }} 
        />
      </div>
    </div>
  )
}

export default Dashboard