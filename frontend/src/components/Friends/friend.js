import React from 'react'
import { Sidebar } from "../sidebar/sidebar";

const Friend = () => {
  return (
      <div className="bg-[#e9effe]">  
      <Sidebar />
        <div className="container mx-auto px-4 py-8 w-[calc(100%-256px)] ">
          <h1 className="text-2xl font-bold mb-3 -mt-1 ml-1">Friend's Dashboard</h1>
        </div>
      
    </div>
  )
}

export default Friend
