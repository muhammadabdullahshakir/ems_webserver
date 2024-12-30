import React, { useCallback, useEffect, useState } from "react";
import { Box, useTheme, TextField } from "@mui/material";
import { tokens } from "../../theme";
import PeopleIcon from '@mui/icons-material/People';
import BoltIcon from '@mui/icons-material/Bolt';
import DeviceHubIcon from '@mui/icons-material/DeviceHub';
import SettingsInputComponentIcon from '@mui/icons-material/SettingsInputComponent';
import AutofpsSelectIcon from '@mui/icons-material/AutofpsSelect';
import Header from "../../components/Header";
import HighChart from "../../components/HighChart";
import StatBox from "../../components/StatBox";
import axios from "axios";

const Dashboard = () => {
  const [totalUsers, setTotalUsers] = useState(null);
  const [frequency, setFrequency] = useState(null);
  const [powerFactor, setPowerFactor] = useState(null);
  const [currentData, setCurrentData] = useState([]);
  const [voltageData, setVoltageData] = useState([]);
  const [powerData, setPowerData] = useState([]);
  const [hardwareCount, setHardwareCount] = useState(null);
  const [connectedHardware, setConnectedHardware] = useState(null);
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');

  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const userId = JSON.parse(localStorage.getItem('user'))?.user_id;

  const fetchData = useCallback(async () => {
    try {
      let url = `http://192.168.68.226:8000/latest_project_data/?user_id=${userId}`;
  
      if (fromDate) {
        url += `&from_date=${fromDate}`;
      }
      if (toDate) {
        url += `&to_date=${toDate}`;
      }

      console.log(`Fetching data from URL: ${url}`); // Debugging URL

      const response = await axios.get(url);
      const { current, voltage, power } = response.data;
      console.log(response.data); // Log the response data for debugging

      // Function to filter data for a specific date range
      const filterDataByDateRange = (data, from, to) => {
        const fromTimestamp = new Date(from).getTime();
        const toTimestamp = new Date(to).getTime();

        return data.map(series => ({
          ...series,
          data: series.data.filter(point => point[0] >= fromTimestamp && point[0] <= toTimestamp),
        }));
      };

      // If date range is provided, filter the data based on that
      const filteredCurrent = fromDate && toDate ? filterDataByDateRange(current, fromDate, toDate) : current;
      const filteredVoltage = fromDate && toDate ? filterDataByDateRange(voltage, fromDate, toDate) : voltage;
      const filteredPower = fromDate && toDate ? filterDataByDateRange(power, fromDate, toDate) : power;

      // Set the filtered data to state
      setCurrentData(filteredCurrent);
      setVoltageData(filteredVoltage);
      setPowerData(filteredPower);

    } catch (error) {
      console.error('There was an error fetching data', error);
    }
  }, [userId, fromDate, toDate]);

  useEffect(() => {
    fetchData(); 
    const fetchDataInterval = setInterval(fetchData, 5000); 
    return () => clearInterval(fetchDataInterval); 
  }, [fetchData]);

  useEffect(() => {
    const fetchUserCount = async () => {
      try {
        const response = await axios.get('http://192.168.68.226:8000/user_count/');
        setTotalUsers(response.data.total_users);
      } catch (error) {
        console.error("There was an error fetching Users", error);
      }
    };

    fetchUserCount();
    const intervalId = setInterval(fetchUserCount, 5000);
    return () => clearInterval(intervalId);
  }, []);

  useEffect(() => {
    const fetchProjectData = async () => {
      try {
        const response = await axios.get(`http://192.168.68.226:8000/get_latest_project_data?user_id=${userId}`);
        const { frequency, power_factor } = response.data;
        setFrequency(frequency);
        setPowerFactor(power_factor);
      } catch (error) {
        console.error('There was an error fetching project data', error);
      }
    };

    fetchProjectData();
    const intervalId = setInterval(fetchProjectData, 5000);
    return () => clearInterval(intervalId);
  }, [userId]);

  useEffect(() => {
    const fetchHardwareCount = async () => {
      try {
        const response = await axios.get(`http://192.168.68.226:8000/hardware_count/${userId}`);
        const { hardware_count } = response.data;
        setHardwareCount(hardware_count);
      } catch (error) {
        console.error('There was an error fetching hardware count:', error);
      }
    };

    fetchHardwareCount();
    const intervalId = setInterval(fetchHardwareCount, 5000);
    return () => clearInterval(intervalId);
  }, [userId]);

  useEffect(() => {
    const fetchConnectedHardware = async () => {
      try {
        const response = await axios.get(`http://192.168.68.226:8000/connected_hardware_count/${userId}`);
        const { count } = response.data;
        setConnectedHardware(count);
      } catch (error) {
        console.error('There was an error fetching connected hardware:', error);
      }
    };

    fetchConnectedHardware();
    const intervalId = setInterval(fetchConnectedHardware, 5000);
    return () => clearInterval(intervalId);
  }, [userId]);

  return (
    <Box m="20px">
      {/* HEADER */}
      <Box display="flex" justifyContent="space-between" alignItems="center">
        <Header title="DASHBOARD" subtitle="Welcome to your dashboard" />
      </Box>

      {/* GRID & CHARTS */}
      <Box
        display="grid"
        gridTemplateColumns="repeat(12, 1fr)"
        gridAutoRows="auto"
        gap="60px"
      >
        {/* ROW 1 - StatBox Components */}
        <Box gridColumn="span 2" backgroundColor={colors.primary[400]} display="flex" justifyContent="center" alignItems="center" p="20px">
          <StatBox title={totalUsers || 'Loading...'} subtitle="Total Users" icon={<PeopleIcon sx={{ color: colors.greenAccent[600], fontSize: "26px" }} />} />
        </Box>
        <Box gridColumn="span 2" backgroundColor={colors.primary[400]} display="flex" justifyContent="center" alignItems="center" p="20px">
          <StatBox title={frequency || 'Loading...'} subtitle="Frequency" icon={<AutofpsSelectIcon sx={{ color: colors.greenAccent[600], fontSize: "26px" }} />} />
        </Box>
        <Box gridColumn="span 2" backgroundColor={colors.primary[400]} display="flex" justifyContent="center" alignItems="center" p="20px">
          <StatBox title={powerFactor || 'Loading...'} subtitle="Power Factor" icon={<BoltIcon sx={{ color: colors.greenAccent[600], fontSize: "26px" }} />} />
        </Box>
        <Box gridColumn="span 2" backgroundColor={colors.primary[400]} display="flex" justifyContent="center" alignItems="center" p="20px">
          <StatBox title={hardwareCount || 'Loading...'} subtitle="Total Hardware" icon={<DeviceHubIcon sx={{ color: colors.greenAccent[600], fontSize: "26px" }} />} />
        </Box>
        <Box gridColumn="span 2" backgroundColor={colors.primary[400]} display="flex" justifyContent="center" alignItems="center" p="20px">
          <StatBox title={connectedHardware || 'Loading...'} subtitle="Connected Hardware" icon={<SettingsInputComponentIcon sx={{ color: colors.greenAccent[600], fontSize: "26px" }} />} />
        </Box>

        {/* ROW 2 - Current Data with Date Pickers Above */}
        <Box gridColumn="span 12" backgroundColor={colors.primary[400]} p="20px" mb="30px">
          {/* Date Pickers */}
          <Box display="flex" gap="20px" mb="20px">
            <TextField
              label="From"
              type="date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              InputLabelProps={{
                shrink: true,
                style: { color: colors.greenAccent[500] }
              }}
            />
            <TextField
              label="To"
              type="date"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              InputLabelProps={{
                shrink: true,
                style: { color: colors.greenAccent[500] }
              }}
            />
          </Box>

          {/* Current Data Chart */}
          <HighChart styles={{color:'#000'}} title="Current Data" data={currentData} />
        </Box>

        {/* ROW 3 - Voltage Data */}
        <Box gridColumn="span 12" backgroundColor={colors.primary[400]} p="20px" mb="30px">
          <HighChart title="Voltage Data" data={voltageData} />
        </Box>

        {/* ROW 4 - Power Data */}
        <Box gridColumn="span 12" backgroundColor={colors.primary[400]} p="20px">
          <HighChart title="Power Data" data={powerData} />
        </Box>
      </Box>
    </Box>
  );
};

export default Dashboard;
