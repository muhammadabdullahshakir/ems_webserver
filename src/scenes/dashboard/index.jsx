import React, { useCallback, useEffect, useState } from "react";
import { Box, useTheme } from "@mui/material";
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
  // const [error, setError] = useState(null);
  const [connectedHardware, setConnectedHardware] = useState(null);

  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  const fetchData = useCallback(async () => {
    try {
      const response = await axios.get(`https://ems-server-530056698.us-central1.run.app/latest_project_data/?user_id=6`);
      const { current, voltage, power } = response.data;

      const sortDataByTimestamp = (data) => data.map(series => ({
        name: series.name,
        data: series.data.sort((a, b) => a[0] - b[0])
      }));

      const slicedCurrent = sortDataByTimestamp(current);
      const slicedVoltage = sortDataByTimestamp(voltage);
      const slicedPower = sortDataByTimestamp(power);

      setCurrentData(slicedCurrent);
      setVoltageData(slicedVoltage);
      setPowerData(slicedPower);
    } catch (error) {
      console.error('There was an error fetching data', error);
    }
  }, []);

  useEffect(() => {
    fetchData(); 
    const fetchDataInterval = setInterval(fetchData, 500);  
    return () => clearInterval(fetchDataInterval); 
  }, [fetchData]);

  useEffect(() => {
    const fetchUserCount = async () => {
      try {
        const response = await axios.get('https://ems-server-530056698.us-central1.run.app/user_count/');
        setTotalUsers(response.data.total_users);
      } catch (error) {
        console.error("There was an error fetching Users", error);
      }
    };

    fetchUserCount();
    const intervalId = setInterval(fetchUserCount, 500);  
    return () => clearInterval(intervalId);
  }, []);

  useEffect(() => {
    const fetchProjectData = async () => {
      try {
        const response = await axios.get('https://ems-server-530056698.us-central1.run.app/get_latest_project_data?user_id=6');
        const { frequency, power_factor } = response.data;
        setFrequency(frequency);
        setPowerFactor(power_factor);
      } catch (error) {
        console.error('There was an error fetching data', error);
      }
    };

    fetchProjectData();
    const intervalId = setInterval(fetchProjectData, 500);  
    return () => clearInterval(intervalId);
  }, []);




  useEffect(() => {
    const fetchHardwareCount = async () => {
      try {
        const response = await axios.get('https://ems-server-530056698.us-central1.run.app/hardware_count/6/');
        console.log('Response Data:', response.data);  // Log response data to verify structure
        const { hardware_count } = response.data;
        setHardwareCount(hardware_count);
      } catch (error) {
        console.error('There was an error fetching data:', error);
      }
    };

    fetchHardwareCount();
    const intervalId = setInterval(fetchHardwareCount, 500);
    return () => clearInterval(intervalId);
  }, []);



  

  useEffect(() => {
    const fetchConnectedHardware = async () => {
      try {
        const response = await axios.get('https://ems-server-530056698.us-central1.run.app/connected_hardware_count/6/');
        const { count } = response.data;
        console.log('response', response.data)
        setConnectedHardware(count);
      } catch (error) {
        console.error('There was an error fetching data', error);
      }
    };

    fetchConnectedHardware();
    const intervalId = setInterval(fetchConnectedHardware, 500);  
    return () => clearInterval(intervalId);
  }, []);

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
        <Box
          gridColumn="span 2"
          backgroundColor={colors.primary[400]}
          display="flex"
          justifyContent="center"
          alignItems="center"
          p="20px"
        >
          <StatBox
            title={totalUsers || 'Loading...'}
            subtitle="Total Users"
            icon={<PeopleIcon sx={{ color: colors.greenAccent[600], fontSize: "26px" }} />}
          />
        </Box>
        <Box
          gridColumn="span 2"
          backgroundColor={colors.primary[400]}
          display="flex"
          justifyContent="center"
          alignItems="center"
          p="20px"
        >
          <StatBox
            title={frequency || 'Loading...'}
            subtitle="Frequency"
            icon={<AutofpsSelectIcon sx={{ color: colors.greenAccent[600], fontSize: "26px" }} />}
          />
        </Box>
        <Box
          gridColumn="span 2"
          backgroundColor={colors.primary[400]}
          display="flex"
          justifyContent="center"
          alignItems="center"
          p="20px"
        >
          <StatBox
            title={powerFactor || 'Loading...'}
            subtitle="Power Factor"
            icon={<BoltIcon sx={{ color: colors.greenAccent[600], fontSize: "26px" }} />}
          />
        </Box>
        <Box
          gridColumn="span 2"
          backgroundColor={colors.primary[400]}
          display="flex"
          justifyContent="center"
          alignItems="center"
          p="20px"
        >

         <StatBox
              title={hardwareCount || 'Loading...'}
              subtitle="Total Hardware"
              icon={<DeviceHubIcon sx={{ color: colors.greenAccent[600], fontSize: "26px" }} />}
          />
          
        </Box>
        <Box
          gridColumn="span 2"
          backgroundColor={colors.primary[400]}
          display="flex"
          justifyContent="center"
          alignItems="center"
          p="20px"
        >

            <StatBox
              title={connectedHardware || 'Loading...'}
              subtitle="Connected Hardware"
              icon={<SettingsInputComponentIcon sx={{ color: colors.greenAccent[600], fontSize: "26px" }} />}
            />
          
        </Box>

        {/* ROW 2 - Current Data */}
        <Box
          gridColumn="span 12"
          backgroundColor={colors.primary[400]}
          p="20px"
          mb="30px"  
        >
          <HighChart title="Current Data" data={currentData} />
        </Box>

        {/* ROW 3 - Voltage Data */}
        <Box
          gridColumn="span 12"
          backgroundColor={colors.primary[400]}
          p="20px"
          mb="30px" 
        >
          <HighChart title="Voltage Data" data={voltageData} />
        </Box>

        {/* ROW 4 - Power Data */}
        <Box
          gridColumn="span 12"
          backgroundColor={colors.primary[400]}
          p="20px"
        >
          <HighChart title="Power Data" data={powerData} />
        </Box>
      </Box>
    </Box>
  );
};

export default Dashboard
