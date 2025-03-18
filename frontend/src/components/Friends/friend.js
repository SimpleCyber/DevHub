import React from 'react';
import { Sidebar } from '../sidebar/sidebar';
import './friend.css';

const Friend = () => {
  return (
    <div className="friend-container">
      <Sidebar />
      <div className="friend-content">
        {/* Friend component content */}
        <h1>Hello</h1>
      </div>
    </div>
  );
};

export default Friend;