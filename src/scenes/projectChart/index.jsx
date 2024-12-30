import React, { useEffect, useState } from "react";
import { Typography, TextField, Box, Grid } from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import HighChart from "../../components/HighChart";
import { useParams } from "react-router-dom";
import axios from "axios";
import urls from "../urls/urls";
import { format, subDays } from "date-fns";

function ProjectChart() {
  const { gateway_name, value_name } = useParams();
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Set endDate as today and startDate as 5 days before
  const [endDate, setEndDate] = useState(new Date());
  const [startDate, setStartDate] = useState(subDays(new Date(), 5));

  // Function to fetch data for the chart
  useEffect(() => {
    const fetchDataForHighchart = async () => {
      setLoading(true);
      try {
        const formattedStartDate = format(startDate, "yyyy-MM-dd");
        const formattedEndDate = format(endDate, "yyyy-MM-dd");

        const response = await axios.get(
          urls.fetchMetadataHighchart(
            gateway_name,
            value_name,
            formattedStartDate,
            formattedEndDate
          )
        );
        console.log("API Response Data:", response.data);

        const processedData = response.data.ports.map((port) => {
          return {
            name: port.name,
            data: port.data.flatMap((analyzer) =>
              analyzer.data.map((item) => [item[0], item[1]])
            ),
          };
        });

        setChartData(processedData);
        setLoading(false);
      } catch (err) {
        setLoading(false);
        setError("Failed to fetch data");
      }
    };

    fetchDataForHighchart();
  }, [gateway_name, value_name, startDate, endDate]);

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Grid container direction="column" spacing={2} p={3}>
        <Box display="flex" gap={2} mb={3}>
          <DatePicker
            label="Start Date"
            value={startDate}
            onChange={(newDate) => setStartDate(newDate)}
            renderInput={(params) => <TextField {...params} />}
          />
          <DatePicker
            label="End Date"
            value={endDate}
            onChange={(newDate) => setEndDate(newDate)}
            renderInput={(params) => <TextField {...params} />}
          />
        </Box>
        <Box p={0.5}>
          {loading ? (
            <Typography>Loading...</Typography>
          ) : error ? (
            <Typography color="error">{error}</Typography>
          ) : (
            <HighChart title={value_name} data={chartData} />
          )}
        </Box>
      </Grid>
    </LocalizationProvider>
  );
}

export default ProjectChart;
