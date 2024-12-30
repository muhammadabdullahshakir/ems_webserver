import { Grid, Box, Typography, useTheme } from "@mui/material";
import { useState, useEffect, useContext } from "react";
import { ColorContext } from "./ColorContext";

import { tokens } from "../theme";
import React  from "react";

const StatBox = ({ title, subtitle, icon }) => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const { selectedColor } = useContext(ColorContext);


  // Define the color options
  const colorOptions = {
    blue1000: "linear-gradient(195deg, rgb(73, 163, 241), rgb(26, 115, 232))",
    orange1000: "linear-gradient(195deg, rgb(255, 145, 52), rgb(255, 105, 0))",
    red1000: "linear-gradient(195deg, rgb(242, 85, 96), rgb(212, 41, 56))",
  };

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "flex-start",
        boxShadow: "10px 10px 10px rgba(1, 1, 1, 0.1)",

        background: colorOptions[selectedColor], // Apply the selected color
        textAlign: "left",
        width: "100%",
        // boxShadow: 'none',
        borderRadius: 1,
      }}
    >
      <Box
        sx={{
          backgroundImage:
            "linear-gradient(195deg, rgb(35, 35, 45), rgb(10, 10, 15))",
          boxShadow: "10px 10px 10px rgba(1, 1, 1, 0.1)",
          width: "40px",
          height: "40px",
          borderRadius: "5px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          marginLeft: "10px",
          position: "relative",
          top: "-10px",
        }}
      >
        {React.cloneElement(icon, {
          sx: {
            fontSize: "20px",
            color: "white",
            alignItems: "center",
            justifyContent: "center",
            marginTop: "10px",
          },
        })}
      </Box>

      <Box sx={{ flexDirection: "column", display: "flex" }} padding="10px">
        <Typography
          variant="h5"
          sx={{ color: "#ffffff", fontSize: "13px" }}
        >
          {subtitle}
        </Typography>
        <Typography
          variant="h1"
          fontWeight="bold"
          sx={{ color: colors.grey[100], fontSize: "50px", marginTop: "10px" }}
        >
          {title}
        </Typography>
      </Box>
    </Box>
  );
};

export default StatBox;
