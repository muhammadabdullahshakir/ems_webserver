import React from "react";
import { Select, MenuItem, Box } from "@mui/material";

const Dropdown = ({ value, onChange, items, sx }) => {
  return (
    <Select
      value={value}
      onChange={onChange}
      size="small"
      sx={sx}
    >
      {items && items.length > 0 ? (
        items.map((item) => (
          <MenuItem key={item.hardware_id} value={item.hardware_id}>
            <Box display="flex" justifyContent="space-between" alignItems="center" width="100%">
              <Box>
                {item.name} {" - "} {item.serial_number}
              </Box>
              <Box
                width={8}
                height={8}
                borderRadius="50%"
                bgcolor={item.is_connected ? "green" : "red"}
              />
            </Box>
          </MenuItem>
        ))
      ) : (
        <MenuItem value="">Loading...</MenuItem>
      )}
    </Select>
  );
};

export default Dropdown;
