// import React, { useCallback, useEffect, useState } from "react";
// import { Box, useTheme, TextField, Grid } from "@mui/material";
// import { tokens } from "../../theme";
// import PeopleIcon from "@mui/icons-material/People";
// import BoltIcon from "@mui/icons-material/Bolt";
// import DeviceHubIcon from "@mui/icons-material/DeviceHub";
// import AutofpsSelectIcon from "@mui/icons-material/AutofpsSelect";
// import Header from "../../components/Header";
// import HighChart from "../../components/HighChart";
// import StatBox from "../../components/StatBox";
// import axios from "axios";
// import urls from "../urls/urls";

// const Dashboard = () => {
//   const [totalUsers, setTotalUsers] = useState(null);
//   const [frequency, setFrequency] = useState(null);
//   const [powerFactor, setPowerFactor] = useState(null);
//   const [currentData, setCurrentData] = useState([]);
//   const [voltageData, setVoltageData] = useState([]);
//   const [powerData, setPowerData] = useState([]);
//   const [hardwareCount, setHardwareCount] = useState(null);
//   const [connectedHardware, setConnectedHardware] = useState(null);
//   const [fromDate, setFromDate] = useState("");
//   const [toDate, setToDate] = useState("");

//   const theme = useTheme();
//   const colors = tokens(theme.palette.mode);
//   const userId = JSON.parse(localStorage.getItem("user"))?.user_id;

//   const fetchData = useCallback(async () => {
//     try {
//       const url = urls.latestProjectData(userId); // Fetch data without date parameters
//       console.log(`Fetching data from URL: ${url}`); // Debugging URL

//       const response = await axios.get(url);
//       const { current, voltage, power } = response.data;
//       console.log(response.data); // Log the response data for debugging

//       // Directly set the data to state without filtering by date
//       setCurrentData(current);
//       setVoltageData(voltage);
//       setPowerData(power);
//     } catch (error) {
//       console.error("There was an error fetching data", error);
//     }
//   }, [userId]);

//   useEffect(() => {
//     fetchData();
//     const fetchDataInterval = setInterval(fetchData, 500);
//     return () => clearInterval(fetchDataInterval);
//   }, [fetchData]);

//   useEffect(() => {
//     const fetchUserCount = async () => {
//       try {
//         const response = await axios.get(urls.userCount);
//         setTotalUsers(response.data.total_users);
//       } catch (error) {
//         console.error("There was an error fetching Users", error);
//       }
//     };

//     fetchUserCount();
//     const intervalId = setInterval(fetchUserCount, 5000);
//     return () => clearInterval(intervalId);
//   }, []);

//   useEffect(() => {
//     const fetchProjectData = async () => {
//       try {
//         const response = await axios.get(urls.projectData(userId));
//         const { frequency, power_factor } = response.data;
//         setFrequency(frequency);
//         setPowerFactor(power_factor);
//       } catch (error) {
//         console.error("There was an error fetching project data", error);
//       }
//     };

//     fetchProjectData();
//     const intervalId = setInterval(fetchProjectData, 5000);
//     return () => clearInterval(intervalId);
//   }, [userId]);

//   useEffect(() => {
//     const fetchHardwareCount = async () => {
//       try {
//         const response = await axios.get(urls.HardwareCount(userId));
//         const { hardware_count } = response.data;
//         setHardwareCount(hardware_count);
//       } catch (error) {
//         console.error("There was an error fetching hardware count:", error);
//       }
//     };

//     fetchHardwareCount();
//     const intervalId = setInterval(fetchHardwareCount, 5000);
//     return () => clearInterval(intervalId);
//   }, [userId]);

//   useEffect(() => {
//     const fetchConnectedHardware = async () => {
//       try {
//         const response = await axios.get(urls.connectedHardwareCount(userId));
//         const { count } = response.data;
//         setConnectedHardware(count);
//       } catch (error) {
//         console.error("There was an error fetching connected hardware:", error);
//       }
//     };

//     fetchConnectedHardware();
//     const intervalId = setInterval(fetchConnectedHardware, 5000);
//     return () => clearInterval(intervalId);
//   }, [userId]);
//   const userData = JSON.parse(localStorage.getItem("user"));
//   console.log(userData);
//   const firstname = userData?.firstname;
//   const lastname = userData?.lastname;

//   return (
//     <Box m="20px">
//       {/* HEADER */}
//       <Box display="flex" justifyContent="space-between" alignItems="center">
//         <Header
//           title="DASHBOARD"
//           subtitle={`Welcome ${firstname} ${lastname}`}
//         />
//       </Box>

//       {/* GRID & CHARTS */}
//       <Grid container spacing={2}>
//         <Grid item xs={12} sm={6} md={4} lg={2}>
//           <StatBox
//             title={"000"}
//             subtitle="Total Users"
//             icon={
//               <PeopleIcon
//                 sx={{ color: colors.greenAccent[600], fontSize: "26px" }}
//               />
//             }
//           />
//         </Grid>
//         <Grid item xs={12} sm={6} md={4} lg={2}>
//           <StatBox
//             title={"000"}
//             subtitle="Total Hardware"
//             icon={
//               <BoltIcon
//                 sx={{ color: colors.greenAccent[600], fontSize: "26px" }}
//               />
//             }
//           />
//         </Grid>
//         <Grid item xs={12} sm={6} md={4} lg={2}>
//           <StatBox
//             title={"000"}
//             subtitle="Connected Hardware"
//             icon={
//               <DeviceHubIcon
//                 sx={{ color: colors.greenAccent[600], fontSize: "26px" }}
//               />
//             }
//           />
//         </Grid>
//         <Grid item xs={12} sm={6} md={4} lg={2}>
//           <StatBox
//             title={"000"}
//             subtitle="Total Projects"
//             icon={
//               <AutofpsSelectIcon
//                 sx={{ color: colors.greenAccent[600], fontSize: "26px" }}
//               />
//             }
//           />
//         </Grid>
//         <Grid item xs={12} sm={6} md={4} lg={2}>
//           <StatBox
//             title={"000"}
//             subtitle="Active Project"
//             icon={
//               <DeviceHubIcon
//                 sx={{ color: colors.greenAccent[600], fontSize: "26px" }}
//               />
//             }
//           />
//         </Grid>
//         <Grid item xs={12} sm={6} md={4} lg={2}>
//           <StatBox
//             title={"000"}
//             subtitle="Issues"
//             icon={
//               <DeviceHubIcon
//                 sx={{ color: colors.greenAccent[600], fontSize: "26px" }}
//               />
//             }
//           />
//         </Grid>
//       </Grid>
//       {/* ROW 2 - Current Data with Date Pickers Above */}
//       <Box
//         gridColumn="span 12"
//         backgroundColor={colors.primary[400]}
//         p="20px"
//         mb="30px"
//         mt="20px"
//       >
//         {/* Date Pickers */}
//         <Box display="flex" gap="20px" mb="20px">
//           {/* <TextField
//               label="From"
//               type="date"
//               value={fromDate}
//               onChange={(e) => setFromDate(e.target.value)}
//               InputLabelProps={{
//                 shrink: true,
//                 style: { color: colors.greenAccent[500] }
//               }}
//             />
//             <TextField
//               label="To"
//               type="date"
//               value={toDate}
//               onChange={(e) => setToDate(e.target.value)}
//               InputLabelProps={{
//                 shrink: true,
//                 style: { color: colors.greenAccent[500] }
//               }}
//             /> */}
//         </Box>

//         {/* Current Data Chart */}
//         <HighChart
//           styles={{ color: "#000" }}
//           title="Current Data"
//           data={currentData}
//         />
//       </Box>

//       {/* ROW 3 - Voltage Data */}
//       <Box
//         gridColumn="span 12"
//         backgroundColor={colors.primary[400]}
//         p="20px"
//         mb="30px"
//       >
//         <HighChart title="Voltage Data" data={voltageData} />
//       </Box>

//       {/* ROW 4 - Power Data */}
//       <Box gridColumn="span 12" backgroundColor={colors.primary[400]} p="20px">
//         <HighChart title="Power Data" data={powerData} />
//       </Box>
//     </Box>
//   );
// };

// export default Dashboard;
