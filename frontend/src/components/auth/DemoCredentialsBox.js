import React, { useState } from "react";
import { Copy, Check } from "lucide-react";

const DemoCredentialsBox = () => {
  const [emailCopied, setEmailCopied] = useState(false);
  const [passwordCopied, setPasswordCopied] = useState(false);
  
  const credentials = {
    email: "satyamyadav@gmail.com",
    password: "satyamyadav@gmail.com"
  };

  const copyToClipboard = (text, type) => {
    navigator.clipboard.writeText(text);
    
    if (type === 'email') {
      setEmailCopied(true);
      setTimeout(() => setEmailCopied(false), 2000);
    } else {
      setPasswordCopied(true);
      setTimeout(() => setPasswordCopied(false), 2000);
    }
  };

  return (
    <div className="fixed top-0 right-0 lg:m-56 md:m-16 m-4 z-50 max-w-xs rounded-lg bg-blue-50 p-4 border border-blue-200 shadow-sm">
      <div className="flex flex-col gap-3">
        <h3 className="text-blue-700 font-medium text-sm mb-1">Demo Credentials</h3>
        
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between bg-white rounded-md p-2 border border-blue-100">
            <div className="flex flex-col">
              <span className="text-xs text-gray-500">Email</span>
              <span className="text-sm font-medium">{credentials.email}</span>
            </div>
            <button 
              onClick={() => copyToClipboard(credentials.email, 'email')}
              className="text-blue-600 hover:text-blue-800 p-1 rounded-md hover:bg-blue-50"
            >
              {emailCopied ? <Check size={16} /> : <Copy size={16} />}
            </button>
          </div>
          
          <div className="flex items-center justify-between bg-white rounded-md p-2 border border-blue-100">
            <div className="flex flex-col">
              <span className="text-xs text-gray-500">Password</span>
              <span className="text-sm font-medium">{credentials.password}</span>
            </div>
            <button 
              onClick={() => copyToClipboard(credentials.password, 'password')}
              className="text-blue-600 hover:text-blue-800 p-1 rounded-md hover:bg-blue-50"
            >
              {passwordCopied ? <Check size={16} /> : <Copy size={16} />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DemoCredentialsBox;