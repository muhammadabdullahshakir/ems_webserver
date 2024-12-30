import { Typography, Box, useTheme } from "@mui/material";
import { tokens } from "../theme";
import { ColorContext } from "./ColorContext";
import { useContext } from "react";
const Header = ({ title, subtitle }) => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  const { selectedColor } = useContext(ColorContext);

  // Define the color options
  const colorOptions = {
    blue1000: "linear-gradient(195deg, rgb(73, 163, 241), rgb(26, 115, 232))",
    orange1000: "linear-gradient(195deg, rgb(255, 145, 52), rgb(255, 105, 0))",
    red1000: "linear-gradient(195deg, rgb(242, 85, 96), rgb(212, 41, 56))",
  };

  const subtitleColor = colorOptions[selectedColor] || colors.greenAccent[400];

  return (
    <Box mb="30px">
      <Typography
        variant="h2"
        color={colors.grey[100]}
        fontWeight="bold"
        sx={{ m: "0 0 5px 0" }}
      >
        {title}
      </Typography>
      <Typography
        variant="h5"
        sx={{
          background: subtitleColor,
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent", // Makes text appear in gradient
        }}
      >
        {subtitle}
      </Typography>
    </Box>
  );
};

export default Header;
