import React, { useState } from 'react';
import SettingsIcon from '@mui/icons-material/Settings';

const LeftButton = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const toggleDialog = () => {
    setIsDialogOpen(!isDialogOpen);
  };

  // Ensure button is fixed on the right side and visible
  const buttonStyle = {
    position: 'fixed',
    right: '10px',  // Changed from left to right
    top: '10%',
    transform: 'translateY(-50%)',
    padding: '10px 20px',
    backgroundColor: '#007bff',
    color: 'white',
    border: 'none',
    borderRadius: '50%',
    fontSize: '24px',
    cursor: 'pointer',
    zIndex: 1000,
  };

  const dialogStyle = {
    position: 'fixed',
    right: '10px', // Adjusted for right side
    top: '60%',
    backgroundColor: 'white',
    padding: '20px',
    border: '1px solid #ccc',
    borderRadius: '5px',
    zIndex: 999,
  };

  return (
    <div>
      <button style={buttonStyle} onClick={toggleDialog}>
        <SettingsIcon fontSize="large" style={{ color: 'white' }} />
      </button>

      {isDialogOpen && (
        <div style={dialogStyle}>
          <h3>Settings</h3>
          <p>Adjust your preferences here.</p>
        </div>
      )}
    </div>
  );
};

export default LeftButton;
