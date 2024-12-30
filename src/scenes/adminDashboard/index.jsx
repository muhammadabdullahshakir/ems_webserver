import React, { useEffect, useState,useContext } from "react";
import Header from "../../components/Header";
import {
  Box,
  IconButton,
  Typography,
  useTheme,
  Grid,
  Select,
  MenuItem,
  CircularProgress,
  FormControl,
  InputLabel,
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import { tokens } from "../../theme";
import StatBox from "../../components/StatBox";
import PeopleIcon from "@mui/icons-material/People";
import DeviceHubIcon from "@mui/icons-material/DeviceHub";
import AddCircleIcon from "@mui/icons-material/AddCircle";
import AutoAwesomeMotionIcon from "@mui/icons-material/AutoAwesomeMotion";
import HubIcon from "@mui/icons-material/Hub";
import BugReportIcon from "@mui/icons-material/BugReport";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import urls from "../urls/urls";
import { ColorContext } from "../../components/ColorContext";


const AdminDashboard = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const navigate = useNavigate();

  const { selectedColor } = useContext(ColorContext);


  // Define the color options
  const colorOptions = {
    blue1000: "linear-gradient(195deg, rgb(73, 163, 241), rgb(26, 115, 232))",
    orange1000: "linear-gradient(195deg, rgb(255, 145, 52), rgb(255, 105, 0))",
    red1000: "linear-gradient(195deg, rgb(242, 85, 96), rgb(212, 41, 56))",
  };


  // User Management Logic from `Team`
  const [user, setUser] = useState([]);

  const [totalUsers, setTotalUsers] = useState(null);
  const [gatewayCount, setGatewayCount] = useState(0);
  const [userAlotedGatewaysCount , setUserAlotedGatewaysCOunt] = useState(0);
  const [deployedGateways, setDeployedGateways] = useState(0);
  const [projectCount, setProjectCount] = useState(null);
  const [gatewayData, setGatewayData] = useState({});
  const [loadingGateways, setLoadingGateways] = useState({});
  const [error, setError] = useState(null); 
  const [selectedGateway, setSelectedGateway] = React.useState("");

  

  useEffect(() => {
    const fetchUserCount = async () => {
      try {
        const response = await axios.get(urls.userCount);
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
    const fetchGatewaysCount = async () => {
      try {
        const response = await axios.get(urls.totalGatewaysCount);
        setGatewayCount(response.data.gateways_count);
      } catch (error) {
        console.error("There was Problem in fetching Total gateways Count");
      }
    };
    fetchGatewaysCount();
    const intervalId = setInterval(fetchGatewaysCount, 5000);
    return () => clearInterval(intervalId);
  });

  useEffect(()=>{
    const fetchUserALotedGateways = async ()=>{
      try{
        const response = await axios.get(urls.userAlotedGatewaysCount)
        setUserAlotedGatewaysCOunt(response.data.user_aloted_count)
      } catch (error){
        console.error('Error in fetching user aloted gateways count',error)
      }
    }
    fetchUserALotedGateways();
    const intervalId = setInterval(fetchUserALotedGateways,5000);
    return ()=> clearInterval(intervalId)
  })

  const userData = JSON.parse(localStorage.getItem("user"));
  const firstname = userData?.firstname;
  const lastname = userData?.lastname;
  const role = userData?.role;

  useEffect(() => {
    const fetchProject = async () => {
      try {
        const response = await axios.get(urls.totalProject);
        setProjectCount(response.data.total_project);
      } catch (error) {
        console.error("There was Error in Fetching Project", error);
      }
    };
    fetchProject();
    const intervalId = setInterval(fetchProject, 5000);
    return () => clearInterval(intervalId);
  }, []);


  useEffect(() => {
    const deployedGatewaysCount = async () => {
      try {
        const response = await axios.get(urls.deployedGatewaysCount);
        setDeployedGateways(response.data.deployed_gateways_count);
      } catch (error) {
        console.error(
          "There is problem in getting Deployed gateways Coutnt",
          error
        );
      }
    };
    deployedGatewaysCount();
    const intervalId = setInterval(deployedGatewaysCount, 5000);
    return () => clearInterval(intervalId);
  });

  const fetchUsers = async () => {
    try {
      const response = await axios.get(urls.fetchUser);
      console.log("Response data from server:", response.data); // Log the raw data

      // Transform the response data
      let transformedUsers = response.data.map((user) => ({
        id: user.user_id,
        firstname: user.firstname,
        lastname: user.lastname,
        email: user.email,
        contact: user.contact,
        adress: user.adress,
        zip_code: user.zip_code,
        is_online: user.is_online,
        role: user.role,
      }));

      console.log("Transformed user data:", transformedUsers); // Log transformed data

      // Apply filtering based on the logged-in user's role
      if (role !== "admin") {
        console.log(`User's role is ${role}, filtering non-admin users`);
        transformedUsers = transformedUsers.filter(
          (user) => user.role !== "admin"
        );
      }
      const filteredUsers = transformedUsers.filter(
        (user) => user.role === "user"
      );

      // Update the state with filtered user data
      setUser(filteredUsers);
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

  useEffect(() => {
    console.log("Fetching users...");
    fetchUsers();
  }, []);

  const handleNavigate = () => {
    navigate("/form");
  };

  const fetchGatewaysForUser = async (userId) => {
    setLoadingGateways((prev) => ({ ...prev, [userId]: true })); // Start loading state
    try {
      const requestUrl = `${urls.userlistGateways}?user_id=${userId}`; // Updated URL
      console.log("Making request to:", requestUrl);

      const response = await axios.get(requestUrl); // Call API
      console.log("Gateways list data:", response.data);

      // Update state with the fetched gateway data
      setGatewayData((prev) => ({
        ...prev,
        [userId]: response.data.Gateways || [], // Use the "Gateways" array from the API response
      }));
    } catch (error) {
      setError("Error loading gateways");
      console.error("Error fetching gateways:", error);
    } finally {
      setLoadingGateways((prev) => ({ ...prev, [userId]: false })); // Stop loading state
    }
  };

  const columns = [
    { field: "id", headerName: "ID" },
    {
      field: "status",
      headerName: "Status",
      flex: 1,
      renderCell: (params) => (
        <Box display="flex" alignItems="center" height="100%">
          <Box
            sx={{
              width: "10px",
              height: "10px",
              borderRadius: "50%",
              backgroundColor: params.row.is_online ? "green" : "red",
              marginRight: "5px",
            }}
          />
          <Typography variant="body2">
            {params.row.is_online ? "Online" : "Offline"}
          </Typography>
        </Box>
      ),
    },

    {
      field: "firstname",
      headerName: "Name",
      flex: 1,
      cellClassName: "name-column--cell",
    },
    {
      field: "lastname",
      headerName: "Last Name",
      headerAlign: "left",
      flex: 1,
    },
    {
      field: "contact",
      headerName: "Phone Number",
      flex: 1,
    },
    {
      field: "email",
      headerName: "Email",
      flex: 1,
    },
    {
      field: "adress",
      headerName: "Address",
      flex: 1,
    },
    {
      field: "zip_code",
      headerName: "Zip Code",
      flex: 1,
    },
    {
      field: "gateways",
      headerName: "User Gateways",
      flex: 1,
      renderCell: (params) => {
        const userId = params.row.id; // Get the user ID for this row
        const gateways = gatewayData[userId] || []; // Get gateways for this user
        const isLoading = loadingGateways[userId]; // Check if gateways are still loading

        // Handle dropdown selection change
        const handleSelectChange = (event) => {
          setSelectedGateway(event.target.value); // Update selected gateway
        };

        return (
          <div>
            {isLoading ? (
              <CircularProgress size={24} /> // Show loader if loading
            ) : error ? (
              "Error loading gateways" // Show error message if API call fails
            ) : gateways.length === 0 ? (
              "No Gateways Available" // Message for empty gateway list
            ) : (
              <FormControl fullWidth sx={{ marginTop: "1px" }}>
                <InputLabel>User Gateways</InputLabel>
                <Select
                  value={selectedGateway} // Controlled dropdown
                  onChange={handleSelectChange}
                  displayEmpty
                  label="User Gateways"
                >
                  {gateways.map((gateway) => (
                    <MenuItem key={gateway.G_id} value={gateway.G_id}>
                      {gateway.gateway_name} {/* Show only gateway name */}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            )}
          </div>
        );
      },
    },
  ];

  useEffect(() => {
    // Fetch gateways for all users once users are loaded
    user.forEach((u) => {
      fetchGatewaysForUser(u.id);
    });
  }, [user]);

  return (
    <Box m="20px">
      <Box display="flex" justifyContent="space-between" alignItems="center">
        <Header
          title="DASHBOARD"
          subtitle={`Welcome ${firstname} ${lastname}`}
        />
        <IconButton
          color="inherit" 
          onClick={handleNavigate}
          sx={{
            color: colorOptions[selectedColor], 
            fontSize: 45,

          }}
        >
          <AddCircleIcon fontSize="inherit" />
        </IconButton>
      </Box>
      <Typography
        variant="h1"
        sx={{ marginTop: "2px", fontSize: "15px", textAlign: "right" }}
      >
        Create User
      </Typography>

      <Box
        m="40px 0 0 0"
        height="75vh"
        sx={{
          "& .MuiDataGrid-root": {
            border: "none",
          },
          "& .MuiDataGrid-cell": {
            borderBottom: "none",
          },
          "& .name-column--cell": {
            color: colors.greenAccent[300],
          },
          "& .MuiDataGrid-columnHeaders": {
            backgroundColor: colors.blueAccent[700],
            borderBottom: "none",
          },
          "& .MuiDataGrid-virtualScroller": {
            backgroundColor: colors.primary[400],
          },
          "& .MuiDataGrid-footerContainer": {
            borderTop: "none",
            backgroundColor: colors.blueAccent[700],
          },
          "& .MuiCheckbox-root": {
            color: `${colors.greenAccent[200]} !important`,
          },
        }}
      >
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6} md={4} lg={2}>
            <StatBox
              title={totalUsers || "000"}
              subtitle="Total Users"
              icon={
                <PeopleIcon
                  sx={{ color: colors.greenAccent[600], fontSize: "26px" }}
                />
              }
            />
          </Grid>
          <Grid item xs={12} sm={6} md={4} lg={2}>
            <StatBox
              title={gatewayCount !== null ? gatewayCount : "000"}
              subtitle="Total Hardware"
              icon={
                <DeviceHubIcon
                  sx={{ color: colors.greenAccent[600], fontSize: "26px" }}
                />
              }
            />
          </Grid>
          <Grid item xs={12} sm={6} md={4} lg={2}>
            <StatBox
              title={userAlotedGatewaysCount !== null ? userAlotedGatewaysCount : "000"}
              subtitle="aloted Hardware"
              icon={
                <DeviceHubIcon
                  sx={{ color: colors.greenAccent[600], fontSize: "26px" }}
                />
              }
            />
          </Grid>
          <Grid item xs={12} sm={6} md={4} lg={2}>
            <StatBox
              title={deployedGateways || "000"}
              subtitle="Deployed Hardware"
              icon={
                <HubIcon
                  sx={{ color: colors.greenAccent[600], fontSize: "26px" }}
                />
              }
            />
          </Grid>
          <Grid item xs={12} sm={6} md={4} lg={2}>
            <StatBox
              title={projectCount || "000"}
              subtitle="Total Projects"
              icon={
                <AutoAwesomeMotionIcon
                  sx={{ color: colors.greenAccent[600], fontSize: "26px" }}
                />
              }
            />
          </Grid>

          <Grid item xs={12} sm={6} md={4} lg={2}>
            <StatBox
              title={"000"}
              subtitle="Issues"
              icon={
                <BugReportIcon
                  sx={{ color: colors.greenAccent[600], fontSize: "26px" }}
                />
              }
            />
          </Grid>
        </Grid>
        <DataGrid
          rows={user}
          columns={columns}
          sx={{
            border: "none",
            backgroundColor: colors.primary[400],
          }}
        />
      </Box>
    </Box>
  );
};

export default AdminDashboard;
