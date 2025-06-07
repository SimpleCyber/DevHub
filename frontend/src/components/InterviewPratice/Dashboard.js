'use client'
const Dashboard = () => {
  return (
<div className="m-0 p-0 overflow-hidden bg-blue-50 mt-10 sm:mt-0">
      
      <iframe 
        src="https://devhub-interview-bg.vercel.app/" 
        title="DevHub Interview Integration" 
        className="w-full h-screen border-none outline-none"
        allow="microphone; camera; display-capture" 
        style={{ 
          margin: 0, 
          padding: 0, 
          overflow: 'auto', 
          scrollbarWidth: 'none', 
          msOverflowStyle: 'none',
          WebkitScrollbar: { display: 'none' }
        }} 
      />
    </div>
  )
}

export default Dashboard