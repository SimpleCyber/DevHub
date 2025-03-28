// components/SearchCard.js
import { useState } from "react";

const SearchCard = ({ onSearch }) => {
  const [searchTerms, setSearchTerms] = useState("");

  // Handle search input change
  const handleSearchChange = (value) => {
    setSearchTerms(value);
  };

  // Handle search submission
  const handleSearch = () => {
    console.log(`Searching for: ${searchTerms}`);
    if (onSearch) {
      onSearch(searchTerms);
    }
  };

  return (
    <div className="bg-white shadow-lg rounded-xl overflow-hidden border border-gray-200 p-6 flex flex-col justify-center items-center">
      <div className="w-full max-w-md">
        <input
          type="text"
          placeholder="Search friends by platform"
          value={searchTerms}
          onChange={(e) => handleSearchChange(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          onClick={handleSearch}
          className="mt-4 w-full bg-blue-600 text-white py-2 rounded-full hover:bg-blue-700 transition-colors"
        >
          Search
        </button>
      </div>
    </div>
  );
};

export default SearchCard;