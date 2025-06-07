import { useState } from 'react';
import { MessageCircle } from 'lucide-react';

export default function WhatsAppJoinButton() {
  const [isHovered, setIsHovered] = useState(false);
  const [isClicked, setIsClicked] = useState(false);
  
  const handleClick = () => {
    setIsClicked(true);
    // Open WhatsApp link in a new tab
    window.open('https://chat.whatsapp.com/G73wxmjhfNb4sKPYKPD1Py', '_blank');
    
    // Reset the clicked state after a short delay
    setTimeout(() => {
      setIsClicked(false);
    }, 300);
  };

  return (
    <div className="flex justify-center p-3">
      <button
        className={`flex items-center gap-2 px-3 py-2 rounded-md font-medium text-white transition-all duration-200 shadow-md ${
          isClicked 
            ? 'bg-green-700 scale-95' 
            : isHovered 
              ? 'bg-green-500' 
              : 'bg-green-600'
        }`}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onClick={handleClick}
      >
        <MessageCircle size={20} className="fill-white stroke-white" />
        <span className="hidden sm:inline">Join WhatsApp Community</span>
        <span className="sm:hidden">Community</span>
      </button>
      
      {isClicked && (
        <div className="absolute mt-12 text-xs text-gray-600 animate-pulse">
          Opening WhatsApp...
        </div>
      )}
    </div>
  );
}