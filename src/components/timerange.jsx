import React from 'react';
import { useTheme } from '@mui/material/styles';

const TimeRangeDropdown = ({ onChange, selectedValue }) => {
  const theme = useTheme();
  // const colors = theme.palette;

  return (
    <div style={{ position: 'relative', display: 'inline-block' }}>
      <select
        value={selectedValue}
        onChange={(e) => onChange(e.target.value)}
        style={{
          width: '100px',
          padding: '8px',
          fontSize: '16px',
          backgroundColor: "#4cceac", // Adjust this according to your theme
          color: "#808080", // White text color
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer'
        }}
      >
        <option value="daily">Daily</option>
        <option value="weekly">Weekly</option>
        <option value="15_days">15 Days</option>
        <option value="monthly">Last Month</option>
        <option value="yearly">Last Year</option>
      </select>
    </div>
  );
};

export default TimeRangeDropdown;
