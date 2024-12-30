import React, { useState, useEffect,useContext } from "react";
import axios from "axios";
import urls from "../urls/urls";
import { useTheme, Grid, Box, Typography } from "@mui/material";
import { tokens } from "../../theme";
import { ColorContext } from "../../components/ColorContext";

function TestBox() {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const [boxes, setBoxes] = useState([]);

  const { selectedColor } = useContext(ColorContext);


  // Define the color options
  const colorOptions = {
    blue1000: "linear-gradient(195deg, rgb(73, 163, 241), rgb(26, 115, 232))",
    orange1000: "linear-gradient(195deg, rgb(255, 145, 52), rgb(255, 105, 0))",
    red1000: "linear-gradient(195deg, rgb(242, 85, 96), rgb(212, 41, 56))",
  };

  const fetchBox = async () => {
    try {
      const response = await axios.get(urls.fetchBoxList);
      const data = response.data;
      console.log("response", data);

      if (response.status === 200) {
        setBoxes([data.box] || []);
        console.log("data set in state:", data.box);
      } else {
        console.error("Error in fetching boxes");
      }
    } catch (error) {
      console.error("Error in fetching box data", error);
    }
  };
  useEffect(() => {
    fetchBox();
    const intervalId = setInterval(fetchBox, 5000);
    return () => clearInterval(intervalId);
  }, []);

  if (boxes.length === 0) {
    return <Typography variant="h6">No data available</Typography>;
  }

  const latestBox = boxes[boxes.length - 1];

  return (
    <Box p={2}>
      <Typography variant="h4" sx={{ marginBottom: "16px" }}>
        {latestBox.name}
      </Typography>

      <Grid container spacing={2}>
        {latestBox.content.map((item, index) => (
          <Grid item xs={12} sm={6} md={4} lg={3} key={index}>
            <Box
              sx={{
                width: "100%",
                background: selectedColor[colorOptions],
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                borderRadius: "8px",
                textAlign: "center",
                padding: "16px",
                boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
              }}
            >
              <Typography variant="h6">{item.name}</Typography>
              <Box sx={{ fontSize: "14px", marginTop: "8px" }}>
                <Typography
                  variant="body2"
                  sx={{ margin: "4px 0", fontSize: "15px" }}
                >
                  <strong>Description:</strong> {item.description}
                </Typography>
                <Typography
                  variant="body2"
                  sx={{ margin: "4px 0", fontSize: "15px" }}
                >
                  <strong>Details:</strong> {item.details}
                </Typography>
              </Box>
            </Box>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}

export default TestBox;
