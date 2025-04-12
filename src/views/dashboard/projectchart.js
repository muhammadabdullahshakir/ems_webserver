import React, { useEffect, useState } from "react";
import { Typography } from "@mui/material";
import HighCharts from "./highchart";
import { useParams } from "react-router-dom";
import axios from "axios";
import { format } from "date-fns";
import urls from "../../urls/urls";
import { DatePicker } from "@mui/x-date-pickers";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";

function ProjectChart() {
  const { gateway_name, value_name } = useParams();
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [endDate, setEndDate] = React.useState(dayjs());
  const [startDate, setStartDate] = React.useState(dayjs());

  useEffect(() => {
    const fetchDataForHighchart = async () => {
      setLoading(true);
      try {
        const formattedStartDate = format(startDate.toDate(), "yyyy-MM-dd");
        const formattedEndDate = format(endDate.toDate(), "yyyy-MM-dd");
  
        const response = await axios.get(
          urls.fetchMetadataHighchart(
            gateway_name,
            value_name,
            formattedStartDate,
            formattedEndDate
          )
        );
  
        console.log("API Response Data:", JSON.stringify(response.data, null, 2));
  
        if (!response.data.ports) {
          console.error("Unexpected API Response:", response.data);
          throw new Error("Invalid API response structure");
        }
  
        // ✅ Correctly extracting data
        const processedData = response.data.ports.map((port) => ({
          name: port.name,
          data: port.data.flatMap((analyzer) =>
            analyzer.data.map(([timestamp, value]) => [timestamp, value])
          ),
        }));
  
        console.log("✅ Processed Data for Chart:", processedData);
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
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <div>
        {/* <Typography variant="h5">{value_name} Data</Typography> */}

        <DatePicker
          label="Start Date"
          value={startDate}
          onChange={(newDate) => setStartDate(newDate)}
        />
        <DatePicker
          label="End Date"
          value={endDate}
          onChange={(newDate) => setEndDate(newDate)}
        />

        {loading ? (
          <Typography>Loading...</Typography>
        ) : error ? (
          <Typography color="error">{error}</Typography>
        ) : (
          <HighCharts title={value_name} data={chartData} yAxisLabel="Value" />
        )}
      </div>
    </LocalizationProvider>
  );
}

export default ProjectChart;
