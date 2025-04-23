import React, { useEffect, useState } from "react";
import { Typography } from "@mui/material";
import { useParams } from "react-router-dom";
import { DatePicker } from "@mui/x-date-pickers";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";
import Highcharts from "highcharts";
import HighchartsReact from "highcharts-react-official";  // Ensure this import is correct!
import urls from "../../urls/urls";

function ProjectChart() {
  const { gateway_name, value_name } = useParams();
  const [chartData, setChartData] = useState([]);
  const [startDate, setStartDate] = useState(dayjs().subtract(29, 'day'));
  const [endDate, setEndDate] = useState(dayjs());
  const [selectedDay, setSelectedDay] = useState(null);
  const [hourlyData, setHourlyData] = useState([]);

  useEffect(() => {
    const fetchChartData = async () => {
      try {
        const from_date = startDate.format("YYYY-MM-DD");
        const to_date = endDate.format("YYYY-MM-DD");
        const response = await fetch(
          `${urls.fetch_highchart_data}?gateway=${gateway_name}&value_name=${value_name}&from_date=${from_date}&to_date=${to_date}`
        );
        
        const json = await response.json();

  
        // Step 1: Create a date map for range with 0
        const dateMap = {};
        let currentDate = dayjs(startDate);
        while (currentDate.isBefore(endDate.add(1, "day"))) {
          dateMap[currentDate.format("YYYY-MM-DD")] = 0;
          currentDate = currentDate.add(1, "day");
        }
  
        // Step 2: Sum all data points per date
        json.ports.forEach(port => {
          port.data.forEach(analyzer => {
            analyzer.data.forEach(([date, value]) => {
              if (dateMap[date] !== undefined) {
                dateMap[date] += value;
              }
            });
          });
        });
  
        const formattedData = Object.entries(dateMap).map(([date, value]) => ({
          name: date,      // This makes it available as `this.name` on click
          y: value,        // This is the value (y-axis)
        }));
        
  
        setChartData([
          {
            name: "Consumption",
            data: formattedData,

          },
        ]);
      } catch (error) {
        console.error("Error fetching chart data:", error);
      }
    };
  
    fetchChartData();
  }, [gateway_name, value_name, startDate, endDate]);
  

  const generateHourlyData = async (date) => {
    const formattedDate = dayjs(date).format("YYYY-MM-DD");
    try {
      const response = await fetch(
        `${urls.fetch_single_highchart_data}?gateway=${gateway_name}&value_name=${value_name}&from_date=${formattedDate}`
      );
      const json = await response.json();
  
      const hourlyMap = {};
      for (let hour = 0; hour < 24; hour++) {
        hourlyMap[`${hour}:00`] = 0;
      }
  
      json.ports.forEach((port) => {
        port.data.forEach((analyzer) => {
          analyzer.data.forEach(([hour, value]) => {
            hourlyMap[hour] = value;
          });
        });
      });
  
      const hourlyArray = Object.entries(hourlyMap);
  
      setHourlyData([
        {
          name: "Hourly Consumption",
          data: hourlyArray,
        },
      ]);
    } catch (error) {
      console.error("Error fetching hourly data:", error);
    }
  };
  


  const HighChart = ({ title, data = [], yAxisLabel, type = "column", xAxisType = "category" }) => {
    const options = {
      chart: { type },
      title: { text: title },
      xAxis: {
        type: xAxisType,
        title: { text: xAxisType === "datetime" ? "Time" : "Date" },
        labels: {
          rotation: -45,
          style: { fontSize: "12px" },
        },
      },
      yAxis: { title: { text: yAxisLabel } },
      series: data,
      plotOptions: {
        series: {
          point: {
            events: {
              click: function () {
                const clickedDate = dayjs(this.name, "YYYY-MM-DD");
          
                if (!clickedDate.isValid()) {
                  console.error("Invalid clickedDate:", this.name);
                  return;
                }
          
                setSelectedDay(clickedDate);
                generateHourlyData(clickedDate);
                console.log("Clicked date:", clickedDate.format("YYYY-MM-DD"));
              },
            },
          },
          
        },
        column: {
          borderWidth: 0,
          pointPadding: 0.2,
        },
      },
      credits: { enabled: false },
    };
  
    return <HighchartsReact highcharts={Highcharts} options={options} />;
  };
  

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <div>
        <Typography variant="h5" sx={{ fontWeight: "bold", mb: 2 }}>
          Gateway: {gateway_name} <br /> Value: {value_name}
        </Typography>

        <div style={{ display: "flex", gap: "1rem", marginBottom: "1rem" }}>
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
        </div>

        <HighChart title="Daily Consumption" data={chartData} yAxisLabel="Kw" />

        {selectedDay && (
  <HighChart
    title={`Hourly Consumption for ${selectedDay.format("YYYY-MM-DD")}`}  // 🖨️ This shows the selected date
    data={hourlyData}
    yAxisLabel="Kw"
    xAxisLabel="Time"
    type="line"
  />
)}


      </div>
    </LocalizationProvider>
  );
}

export default ProjectChart;
