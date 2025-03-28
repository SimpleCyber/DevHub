"use client";

import { useState } from "react";
import { initialFriendData } from "./friendData";
import FriendCard from "./FriendCard";
import SearchCard from "./SearchCard";
import { Sidebar } from "../sidebar/sidebar";

const Friend = () => {
  const [filteredFriends, setFilteredFriends] = useState(initialFriendData);

  // Handle search
  const handleSearch = (searchTerm) => {
    const filtered = initialFriendData.filter(
      (friend) =>
        friend.platform.toLowerCase().includes(searchTerm.toLowerCase()) ||
        friend.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredFriends(filtered);
  };

  return (
    <div className="bg-[#e9effe]">
      <Sidebar />

      <div className="container mx-auto px-4 py-8 ml-64 w-[calc(100%-256px)]">
        <h1 className="text-2xl font-bold mb-3 -mt-1 ml-1">Friend's Dashboard</h1>
        <div className="grid md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2 gap-6">
          {filteredFriends.map((friend, index) => (
            <FriendCard key={index} friend={friend} />
          ))}
          {filteredFriends.length < 4 &&
            Array(4 - filteredFriends.length)
              .fill()
              .map((_, index) => (
                <SearchCard key={`search-${index}`} onSearch={handleSearch} />
              ))}
        </div>
      </div>
    </div>
  );
};

export default Friend;
