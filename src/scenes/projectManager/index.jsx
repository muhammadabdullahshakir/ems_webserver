import React from "react";
import { useCallback, useState, useEffect, useRef } from "react";
import {
  Box,
  Typography,
  useTheme,
  Dialog,
  DialogContent,
  DialogTitle,
  DialogActions,
  Tab,
  Tabs,
  Grid,
  Button,
  List,
  ListItem,
  ListItemText,
} from "@mui/material";
import Header from "../../components/Header";
import ReactLoading from "react-loading";
import { useLocation, useNavigate } from "react-router-dom";
import { tokens } from "../../theme";
import axios from "axios";
import urls from "../urls/urls";
import OpacityIcon from "@mui/icons-material/Opacity";
import ThermostatIcon from "@mui/icons-material/Thermostat";
import TornadoIcon from "@mui/icons-material/Tornado";
import NightlightIcon from "@mui/icons-material/Nightlight";
import PieChart from "../../components/PieChart";
import { ReactFlow, useNodesState, useEdgesState } from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import CustomNode from "./CustomNode";
import AnimatedSVGEdge from "./AnimatedSVGEdge";
import BedtimeIcon from "@mui/icons-material/Bedtime";
import AirIcon from "@mui/icons-material/Air";
import WbSunnyIcon from "@mui/icons-material/WbSunny";
import CloudIcon from "@mui/icons-material/Cloud";
import GuageMeter from "../../components/GuageMeter";
import AddCircleIcon from "@mui/icons-material/AddCircle";

//name for pie charts
const chartNames = [
  "power Usage",
  "Solar Power",
  "Enery Consumption Today",
  "Fourth",
];

const nodeTypes = {
  customNode: CustomNode,
};
const initialNodes = [
  {
    id: "solar",
    position: { x: -100, y: -200 },
    data: {
      // label: "0.00",
      subLabel: "0.00",
      iconType: "solar",
      style: {
        width: 80,
        height: 80,
        borderRadius: "50%",
      },
      outgoingHandlePosition: "bottom",
      incomingHandlePosition: "bottom",
    },
    type: "customNode",
    draggable: false,
  },
  {
    id: "genset",
    position: { x: -100, y: 50 },
    data: {
      // label: "0.00",
      subLabel: "0.00",
      iconType: "genset",
      style: {
        width: 80,
        height: 80,
        borderRadius: "50%",
      },
      outgoingHandlePosition: "top",
      incomingHandlePosition: "top",
    },
    type: "customNode",
    draggable: false,
  },
  {
    id: "load",
    position: { x: 110, y: -70 },
    data: {
      label: "0.00",
      // subLabel: "0.00",
      iconType: "load",
      style: {
        width: 80,
        height: 80,
        borderRadius: "50%",
      },
      outgoingHandlePosition: "left",
      incomingHandlePosition: "left",
    },
    type: "customNode",
    draggable: false,
  },
  {
    id: "grid",
    position: { x: -300, y: -70 },
    data: {
      // label: "0.00",
      subLabel: "0.00",
      iconType: "grid",
      style: {
        width: 80,
        height: 80,
        borderRadius: "50%",
      },
      outgoingHandlePosition: "right",
      incomingHandlePosition: "right",
    },
    type: "customNode",
    draggable: false,
  },
];
// Edge types
const edgeTypes = {
  animatedSvg: AnimatedSVGEdge,
};
const initialEdges = [
  { id: "solar->load", type: "bezier", source: "solar", target: "load" },
  { id: "grid->load", type: "bezier", source: "grid", target: "load" },
  { id: "genset->load", type: "bezier", source: "genset", target: "load" },
  { id: "solar->grid", type: "bezier", source: "solar", target: "grid" },
  { id: "grid->genset", type: "bezier", source: "grid", target: "genset" },
  { id: "4->2", type: "bezier", source: "4", target: "2" },
];

const ProjectManager = () => {
  const reactFlowWrapper = useRef(null);
  const location = useLocation();
  const { project_id, username, projectName, user_id, role } =
    location.state || {};

  const [userGateways, setUserGateways] = useState([]);
  const [openGatewayPop, setOpenGatewayPop] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectGateway, setSelectGateway] = useState(null);

  const loggedInUser = JSON.parse(localStorage.getItem("user"));
  const userId = loggedInUser?.user_id;
  const navigate = useNavigate();

  // fetch the gateway name and mac address for dropdown
  const [dropdownGateways, setDropdownGateways] = useState([]);
  const [selectedGatewayForDropDown, setSelectedGatewayForDropdown] =
    useState("");

  // hooks for nodes changing according to data
  const [newNodes, setNewNodes] = useState(initialNodes);
  const [newEdges, setNewEdges] = useState(initialEdges);

  // name & mac address of deployed gateways for dropdown
  useEffect(() => {
    const fetchDeployedGatewaysForDropdown = async () => {
      try {
        const response = await axios.get(
          `${urls.getGatewaysForDropdown}?project_id=${project_id}`
        );
        const data = response.data.deployed_gateways;
        setDropdownGateways(data);
      } catch (error) {
        console.error("Error fetching gateways for dropdown", error);
      }
    };

    fetchDeployedGatewaysForDropdown();
    const intervalId = setInterval(fetchDeployedGatewaysForDropdown, 5000);
    return () => clearInterval(intervalId);
  }, [project_id]);

  // dynamically updated the animation
  const updateEdgesBasedOnOutput = (analyzers) => {
    const activeNodes = analyzers
      .filter((analyzer) => {
        const lastValue = parseFloat(
          analyzer.values[analyzer.values.length - 1]?.value || "0.00"
        );
        return lastValue > 0;
      })
      .map((analyzer) => analyzer.type.toLowerCase());

    const updatedEdges = initialEdges.map((edge) => {
      const isActive = activeNodes.includes(edge.source);
      return {
        ...edge,
        type: isActive && edge.target === "load" ? "animatedSvg" : "bezier",
      };
    });

    return updatedEdges;
  };

  const handleGatewayChange = async (event) => {
    const selectedGatewayForDropdown = event.target.value;
    setSelectedGatewayForDropdown(selectedGatewayForDropdown);
  };

  // gateway change in dropdown

  useEffect(() => {
    const fetchAnalyzerData = async () => {
      if (selectedGatewayForDropDown) {
        try {
          const response = await axios.get(
            urls.getAnalyzerValuesByGateway(selectedGatewayForDropDown)
          );
          const analyzers = response.data.analyzers || [];

          // Update nodes
          const updatedNodes = newNodes.map((node) => {
            const analyzer = analyzers.find(
              (a) => a.type.toLowerCase() === node.id.toLowerCase()
            );

            if (analyzer) {
              const lastValue = parseFloat(
                analyzer.values[analyzer.values.length - 1]?.value || "0.00"
              );

              return {
                ...node,
                data: {
                  ...node.data,
                  label: node.id === "load" ? lastValue : node.data.label,
                  subLabel: node.id !== "load" ? lastValue : node.data.subLabel,
                },
              };
            }
            return node;
          });

          setNewNodes(updatedNodes);

          // Update edges
          const updatedEdges = updateEdgesBasedOnOutput(analyzers);
          setNewEdges(updatedEdges);
        } catch (error) {
          console.error("Error fetching analyzer data:", error);
        }
      }
    };

    fetchAnalyzerData();

    const intervalId = setInterval(fetchAnalyzerData, 6700);

    return () => clearInterval(intervalId);
  }, [selectedGatewayForDropDown]);

  // fetching gateway of user with whole data and empty coms and show in list user gateways list
  const fetchGateways = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${urls.userGateways}?user_id=${userId}`);
      const data = await response.json();

      if (response.ok) {
        const transformedGateways = data.Gateways.map((item) => {
          let deployStatus = "";
          if (item.deploy_status === "user_aloted") {
            deployStatus = "Alloted to User";
          } else if (item.deploy_status === "warehouse") {
            deployStatus = "In Warehouse";
          } else if (item.deploy_status === "deployed") {
            deployStatus = "Deployed to User";
          }

          return {
            ...item,
            deploy_status: deployStatus,
          };
        });

        setUserGateways(transformedGateways);
      } else {
        setError(data.message || "Failed to fetch gateways");
      }
    } catch (err) {
      setError("Error occurred while fetching data");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    if (!userId) return;
    fetchGateways();
  }, [userId]);

  const handleGatewayClick = (gateway) => {
    setSelectGateway(gateway);
  };

  // passing the project id to gateways
  const [currentProjectId, setCurrentProjectId] = useState(null);
  useEffect(() => {
    setCurrentProjectId(project_id);
  }, [project_id]);

  // deploying the gateways only updates the status of gateway and deploy it
  const handleDeploy = async () => {
    if (!selectGateway || !currentProjectId) return;

    const updatedGateways = userGateways.map((gateway) =>
      gateway.G_id === selectGateway.G_id
        ? { ...gateway, deploy_status: "Deployed to User" }
        : gateway
    );
    setUserGateways(updatedGateways);

    const gatewayData = {
      G_id: selectGateway.G_id,
      deploy_status: "deployed",
      project_id: currentProjectId,
    };

    try {
      const response = await fetch(`${urls.updateGateway}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(gatewayData),
      });

      if (response.ok) {
        const data = await response.json();
        console.log("Successfully updated deploy status:", data);
      } else {
        const data = await response.json();
        setError(data.message || "Failed to update deploy status");
      }
    } catch (err) {
      setError("Error occurred while updating deploy status");
      console.error(err);
    }

    setSelectGateway(null);
    handleGatewayPopClose();
  };

  const [gateways, setGateways] = useState([]);
  const [openGatewayDialog, setOPenGatewayDialog] = useState(false);
  // it fetches the gateway where status is deployed
  const fetchDeployedGateways = async () => {
    try {
      const response = await fetch(
        `${urls.fetchDeployedGateways}?project_id=${project_id}`
      );
      const data = await response.json();

      if (response.ok) {
        const fetchedGateways = data.deployed_gateways;

        if (JSON.stringify(fetchedGateways) !== JSON.stringify(gateways)) {
          setGateways(fetchedGateways);
        }
      } else {
        setError(data.message || "Failed to fetch gateways");
      }
    } catch (err) {
      setError("Error occurred while fetching data");
      console.error(err);
    }
  };

  useEffect(() => {
    if (!userId || !project_id || openGatewayDialog) return;

    fetchDeployedGateways();

    const intervalId = setInterval(fetchDeployedGateways, 500);

    return () => clearInterval(intervalId);
  }, [userId, project_id, openGatewayDialog]);

  // function and hook show data and analyzer in deployed gateways
  const [metadataData, setMetadataData] = useState({});

  useEffect(() => {
    let intervalId;
  
    const fetchMetadataForGateways = async () => {
      const metadataResults = {};
  
      for (const gateway of gateways) {
        const gatewayName = gateway.gateway_name;
  
        try {
          const response = await axios.get(urls.fetch_Metadata(gatewayName));
          metadataResults[gatewayName] = response.data;
        } catch (error) {
          console.error(
            `Error fetching metadata for gateway ${gatewayName}:`,
            error
          );
        }
      }
  
      setMetadataData(metadataResults);
    };
  
    if (gateways.length > 0) {
      // Initial fetch
      fetchMetadataForGateways();
  
      // Set interval to fetch metadata every 5 seconds
      intervalId = setInterval(() => {
        fetchMetadataForGateways();
      }, 500);
    }
  
    // Cleanup interval on unmount or when gateways change
    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [gateways]); // Dependencies include gateways
  

  // Open and close dialog functions
  const handleGatewayPopOpen = () => {
    setOpenGatewayPop(true); // Open the dialog
  };

  useEffect(() => {
    if (openGatewayPop) {
      fetchGateways();
    }
  }, [openGatewayPop]);

  const handleGatewayPopClose = () => {
    setOpenGatewayPop(false); // Close the dialog
  };

  useEffect(() => {}, [username, projectName]);

  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  //for  react flow animation
  const [nodes, , onNodesChange] = useNodesState(initialNodes);
  const [edges, , onEdgesChange] = useEdgesState(initialEdges);

  //weaather
  const [weather, setWeather] = useState(null);

  const [nextFiveHours, setNextFiveHours] = useState([]);
  const [sevenDaysData, setSevenDaysData] = useState([]);
  const [todayHourlyData, setTodayHourlyData] = useState([]);
  const [locationName, setLocationName] = useState("Islamabad");
  const [open, setopen] = useState(false);

  // hook for weather dialog tabs
  const [activeTab, setActiveTab] = useState(0);

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  //weather Dialog
  const handleOpen = () => setopen(true);
  const handleClose = () => setopen(false);

  const fetchWeather = useCallback(async () => {
     const weatherApiUrl = `https://weather.visualcrossing.com/VisualCrossingWebServices/rest/services/timeline/islamabad?unitGroup=us&key=9D5C6HYBMLETN2D3HPWHQW2TA&include=current,hours,days`;

    try {
      const response = await axios.get(weatherApiUrl);

      if (
        response.data &&
        response.data.days &&
        response.data.days.length > 0
      ) {
        setLocationName(response.data.resolvedAddress || "Location not found");
        const todayWeather = response.data.days[0];
        setWeather(todayWeather);

        // Handle 5-hour forecast (future 5 hours from current hour)
        const currentHour = new Date().getHours();
        const hourlyData = todayWeather.hours || [];

        const filteredHours = hourlyData
          .filter((hourData) => {
            const hour = new Date(hourData.datetimeEpoch * 1000).getHours();
            return hour >= currentHour && hour < currentHour + 5;
          })
          .slice(0, 5)
          .map((hourData) => ({
            ...hourData,
            temp: (((hourData.temp - 32) * 5) / 9).toFixed(1),
          }));

        setNextFiveHours(filteredHours);

        // Handle 24-hour forecast (current day hourly data)
        const todayHourlyForecast = hourlyData.map((hourData) => ({
          datetime: hourData.datetimeEpoch,
          temp: (((hourData.temp - 32) * 5) / 9).toFixed(1),
        }));
        setTodayHourlyData(todayHourlyForecast);

        // Handle 7-day forecast
        const sevenDaysForecast = response.data.days.slice(0, 7).map((day) => ({
          datetime: day.datetime,
          temp: ((day.temp - 32) * 5) / 9, // Convert temp to Celsius
        }));
        setSevenDaysData(sevenDaysForecast);
      } else {
        console.warn("No data found for today's weather.");
      }
    } catch (error) {
      console.error("Error fetching weather data:", error);
    }
  }, []);

  // Call fetchWeather when component mounts
  useEffect(() => {
    fetchWeather();
  }, [fetchWeather]);

  // Get the current hour in 24-hour format
  const currentHour = new Date().getHours();

  // Check if sunrise and sunset times are available, then parse
  const sunriseHour =
    weather && weather.sunrise
      ? parseInt(weather.sunrise.split(":")[0], 10)
      : null;
  const sunsetHour =
    weather && weather.sunset
      ? parseInt(weather.sunset.split(":")[0], 10)
      : null;

  const isDaytime =
    sunriseHour !== null &&
    sunsetHour !== null &&
    currentHour >= sunriseHour &&
    currentHour < sunsetHour;

  const getWeatherIcon = (condition, isDaytime) => {
    if (condition.includes("clear")) {
      return isDaytime ? (
        <WbSunnyIcon sx={{ color: "#FFA500", fontSize: "40px" }} />
      ) : (
        <BedtimeIcon sx={{ color: "#FFFF00", fontSize: "40px" }} />
      );
    } else if (
      condition.includes("cloudy") &&
      !condition.includes("partially")
    ) {
      return <CloudIcon sx={{ fontSize: "40px", color: "#757575" }} />; // Consistent color for cloudy
    } else if (condition.includes("partially cloudy")) {
      return isDaytime ? (
        <Box display="flex" alignItems="center" sx={{ position: "relative" }}>
          <WbSunnyIcon
            sx={{
              color: "#FFA500",
              fontSize: "30px",
              position: "absolute",
              left: "-10px",
            }}
          />
          <CloudIcon
            sx={{
              fontSize: "40px",
              color: "#90A4AE",
              position: "relative",
              zIndex: 1,
            }}
          />
        </Box>
      ) : (
        <Box display="flex" alignItems="center" sx={{ position: "relative" }}>
          <BedtimeIcon
            sx={{
              color: "#FFFF00",
              fontSize: "30px",
              position: "absolute",
              left: "-10px",
            }}
          />
          <CloudIcon
            sx={{
              fontSize: "40px",
              color: "#90A4AE",
              position: "relative",
              zIndex: 1,
            }}
          />
        </Box>
      );
    } else if (condition.includes("overcast")) {
      return <CloudIcon sx={{ fontSize: "40px", color: "#757575" }} />; // Darker color for overcast
    }
    return null;
  };

  const latestHour =
    weather && weather.days && weather.days[0].hours
      ? weather.days[0].hours[0]
      : null;
  const nextHours =
    weather && weather.days && weather.days[0].hours
      ? weather.days[0].hours.slice(0, 5)
      : [];

  const weatherConditions = weather?.conditions?.toLowerCase() || "";
  const weatherDescription = (() => {
    if (weatherConditions.includes("partially cloudy")) {
      return isDaytime ? "Partially Cloudy" : "Partly Cloudy Night";
    } else if (
      weatherConditions.includes("cloudy") &&
      !weatherConditions.includes("partially")
    ) {
      return isDaytime ? "Cloudy" : "Cloudy Night";
    } else if (weatherConditions.includes("clear")) {
      return isDaytime ? "Sunny" : "Clear Night";
    } else if (weatherConditions.includes("overcast")) {
      return "Overcast";
    }
    return isDaytime ? "Sunny" : "Clear Night"; // Default fallback
  })();

  // navigation to project chart page
  const navigateToChart = (valueName, gatewayName) => {
    navigate(`/projectchart/${gatewayName}/${valueName}`);
  };

  const [selectedAnalyzer, setSelectedAnalyzer] = useState(null);
  const [error, setError] = useState();

  const handleOpenGatewayDialog = (analyzer, gatewayName) => {
    const updatedAnalyzer = { ...analyzer, gateway_name: gatewayName };
    setSelectedAnalyzer(updatedAnalyzer);
    setOPenGatewayDialog(true);
  };

  useEffect(() => {}, [selectedAnalyzer]);

  const handleCloseGatewayDialog = () => {
    setOPenGatewayDialog(false);
  };

  return (
    <Box m="20px">
      <Box display="flex" flexDirection="column" width="100%">
        <Grid container spacing={2}>
          {/* Left Side */}
          <Grid item xs={12} md={5}>
            {/* Project Header */}
            <Box
              borderRadius="10px"
              sx={{
                backgroundColor: colors.primary[400],
                mt: 1,
                mb: 1,
                p: { xs: 2, sm: 3 },
              }}
            >
              <Header
                title={
                  <Typography
                    variant="h4"
                    sx={{
                      ml: 2,
                      fontSize: { xs: "24px", sm: "30px" },
                      mt: { xs: 2, sm: 3 },
                    }}
                  >
                    Welcome to {projectName}
                  </Typography>
                }
              />
            </Box>

            {/* Weather Container */}
            <Box
              backgroundColor={colors.primary[400]}
              p={{ xs: 2, sm: 3 }}
              borderRadius="10px"
              onClick={handleOpen}
              sx={{ cursor: "pointer", width: "100%" }}
            >
              {weather ? (
                <>
                  <Box
                    display="flex"
                    justifyContent="space-between"
                    alignItems="center"
                    sx={{ flexDirection: { xs: "column", sm: "row" } }}
                  >
                    {/* Weather Icon and Description */}
                    <Box display="flex" flexDirection="column">
                      <Box fontSize={{ xs: "50px", sm: "70px" }}>
                        {getWeatherIcon(
                          weather.conditions?.toLowerCase(),
                          isDaytime
                        )}
                      </Box>
                      <Typography
                        variant="subtitle1"
                        fontSize={{ xs: "18px", sm: "22px" }}
                      >
                        {weather.conditions}
                      </Typography>
                    </Box>

                    {/* Temperature and Wind Speed */}
                    <Box
                      display="flex"
                      flexDirection="column"
                      alignItems="center"
                      mt={{ xs: 2, sm: 0 }}
                    >
                      <Typography
                        variant="body1"
                        fontSize={{ xs: "18px", sm: "22px" }}
                      >
                        {(((weather.temp - 32) * 5) / 9).toFixed(1)}°C
                      </Typography>
                      <Box display="flex" alignItems="center">
                        <AirIcon
                          fontSize="large"
                          sx={{
                            color: colors.greenAccent[400],
                            marginTop: "12px",
                          }}
                        />
                        <Typography variant="subtitle1" fontSize="20px">
                          {weather.windspeed} km/h
                        </Typography>
                      </Box>
                      <Box display="flex" alignItems="center">
                        <OpacityIcon
                          fontSize="large"
                          sx={{
                            color: colors.greenAccent[400],
                            marginTop: "12px",
                          }}
                        />
                        <Typography variant="subtitle2" fontSize="20px">
                          {weather.humidity}%
                        </Typography>
                      </Box>
                    </Box>
                  </Box>

                  {/* ********************Forecast for Next Five Hours*************** */}
                  <Box
                    display="flex"
                    justifyContent="space-around"
                    mt={3}
                    flexWrap="wrap"
                  >
                    {nextFiveHours.length > 0 ? (
                      nextFiveHours.map((hourData, index) => (
                        <Box
                          key={index}
                          minWidth={{ xs: "60px", sm: "80px" }}
                          textAlign="center"
                        >
                          {getWeatherIcon(
                            hourData.conditions?.toLowerCase(),
                            isDaytime
                          )}
                          <Typography variant="body2" fontSize="15px">
                            {new Date(
                              hourData.datetimeEpoch * 1000
                            ).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </Typography>
                          <Typography variant="body2" fontSize="12px">
                            {hourData.temp}°C
                          </Typography>
                          <Typography variant="body2" fontSize="12px">
                            {hourData.conditions}
                          </Typography>
                        </Box>
                      ))
                    ) : (
                      <Typography variant="body2" color="textSecondary">
                        No data available for the next five hours.
                      </Typography>
                    )}
                  </Box>
                </>
              ) : (
                <Typography variant="body2" color="textSecondary">
                  Loading weather data...
                </Typography>
              )}
            </Box>
            <>
              <Box>
                {role === "user" && (
                  <Box
                    display="flex"
                    flexDirection="row"
                    justifyContent="space-between"
                    sx={{
                      backgroundColor: colors.primary[400], // Primary background color
                      borderRadius: "10px",
                      mt: "10px",
                      p: "10px",
                    }}
                  >
                    <Typography sx={{ fontSize: "24px" }}>
                      Add Gateway
                    </Typography>
                    <Button
                      sx={{ color: "#22c55e" }} // Green accent color
                      onClick={handleGatewayPopOpen}
                    >
                      <AddCircleIcon
                        sx={{
                          fontSize: "40px",
                          color: colors.greenAccent[400],
                        }}
                      />
                    </Button>
                  </Box>
                )}

                <Dialog
                  open={openGatewayPop}
                  onClose={handleGatewayPopClose}
                  sx={{
                    "& .MuiDialog-container": {
                      width: "100%",
                    },
                    "& .MuiDialog-paper": {
                      width: "100%",
                    },
                  }}
                  PaperProps={{
                    style: {
                      backgroundColor: colors.primary[400],
                      boxShadow: "none",
                    },
                  }}
                >
                  <DialogTitle>Gateways Assigned</DialogTitle>
                  <DialogContent>
                    {loading && <Typography>Loading...</Typography>}
                    {!loading && userGateways.length > 0 && (
                      <List>
                        {userGateways.map((gateway) => (
                          <ListItem
                            key={gateway.G_id}
                            sx={{
                              cursor:
                                gateway.deploy_status === "Deployed to User"
                                  ? "not-allowed"
                                  : "pointer",
                              backgroundColor:
                                selectGateway?.G_id === gateway.G_id
                                  ? colors.greenAccent[400]
                                  : gateway.deploy_status === "Deployed to User"
                                  ? colors.greenAccent[500]
                                  : colors.greenAccent[600],
                              color: "#fff",
                              marginBottom: "5px",
                              borderRadius: "8px",
                              padding: "10px",
                              opacity:
                                gateway.deploy_status === "Deployed to User"
                                  ? 0.5
                                  : 1,
                              pointerEvents:
                                gateway.deploy_status === "Deployed to User"
                                  ? "none"
                                  : "auto",
                              "&:hover": {
                                backgroundColor:
                                  gateway.deploy_status !== "Deployed to User"
                                    ? "#66bb6a"
                                    : undefined,
                              },
                            }}
                            onClick={() => {
                              if (
                                gateway.deploy_status !== "Deployed to User"
                              ) {
                                handleGatewayClick(gateway);
                              }
                            }}
                          >
                            <ListItemText
                              primary={` ${gateway.G_id} - ${gateway.gateway_name}`}
                              secondary={`MAC: ${gateway.mac_address} - Status: ${gateway.deploy_status}`}
                            />
                          </ListItem>
                        ))}
                      </List>
                    )}
                    {!loading && userGateways.length === 0 && (
                      <Typography>No gateways available</Typography>
                    )}
                  </DialogContent>
                  <DialogActions>
                    <Button onClick={handleGatewayPopClose} color="primary">
                      Close
                    </Button>
                    {selectGateway &&
                      selectGateway.deploy_status !== "Deployed to User" && (
                        <Button
                          onClick={handleDeploy}
                          color="secondary"
                          variant="contained"
                        >
                          Deploy
                        </Button>
                      )}
                  </DialogActions>
                </Dialog>
              </Box>

              {/* Display Selected Gateway Data */}
              <Box sx={{ padding: "3px" }}>
                {gateways.length > 0 ? (
                  gateways.map((gateway) => (
                    <Box
                      key={gateway.G_id}
                      sx={{
                        padding: "20px",
                        borderRadius: "8px",
                        backgroundColor: colors.primary[400],
                        marginTop: "20px",
                      }}
                    >
                      {/* Gateway Name */}
                      <Typography
                        sx={{
                          fontSize: "20px",
                          fontWeight: "bold",
                          color: colors.greenAccent[400],
                          marginBottom: "10px",
                        }}
                      >
                        {gateway.gateway_name}
                      </Typography>

                      {/* MAC Address */}
                      <Typography>
                        MAC Address: {gateway.mac_address}
                      </Typography>

                      {/* Status */}
                      <Typography>
                        Status: {gateway.status ? "Active" : "Inactive"}
                      </Typography>

                      {/* Deployment Status */}
                      <Typography>
                        Deployment:{" "}
                        {gateway.deploy_status === "deployed"
                          ? "Deployed"
                          : "Not Deployed"}
                      </Typography>

                      {/* Configured Status */}
                      <Typography>
                        Configured: {gateway.config ? "Yes" : "Not Configured"}
                      </Typography>

                      <Box
                        sx={{
                          display: "flex",
                          flexWrap: "wrap", // Allows wrapping to the next row on smaller screens
                          justifyContent: "space-between",
                          gap: "16px", // Adds spacing between the boxes
                          marginTop: "20px",
                        }}
                      >
                        {["COM_1", "COM_2", "e1", "e2"].map((port) => {
                          const portData =
                            metadataData[gateway.gateway_name]?.ports.find(
                              (p) => p.port_name === port
                            ) || null;

                          const analyzers = portData?.analyzers || [];

                          return (
                            <Box
                              key={port}
                              sx={{
                                padding: "10px",
                                borderRadius: "8px",
                                flex: "1 1 calc(25% - 16px)", // Ensures 4 items per row, adjusts for gaps
                                minWidth: "150px", // Minimum size for smaller screens
                                maxWidth: "220px", // Prevents the box from being too wide
                                textAlign: "center",
                                backgroundColor: colors.primary[500],
                              }}
                            >
                              <Typography
                                sx={{
                                  fontWeight: "bold",
                                  color: colors.greenAccent[400],
                                  marginBottom: "5px",
                                  fontSize: "18px",
                                }}
                              >
                                {port.toUpperCase()}
                              </Typography>

                              {analyzers.length > 0 ? (
                                analyzers.map((analyzer, index) => (
                                  <Box
                                    key={index}
                                    sx={{
                                      padding: "5px",
                                      borderRadius: "8px",
                                      backgroundColor: colors.greenAccent[500],
                                      marginBottom: "5px",
                                      cursor: "pointer",
                                    }}
                                    onClick={() =>
                                      handleOpenGatewayDialog(
                                        analyzer,
                                        gateway.gateway_name
                                      )
                                    }
                                  >
                                    <Typography sx={{ fontWeight: "bold" }}>
                                      {analyzer.name}
                                    </Typography>
                                    <Typography>{analyzer.type}</Typography>
                                    <Typography>
                                      Status:{" "}
                                      {analyzer.status ? "Active" : "Inactive"}
                                    </Typography>
                                  </Box>
                                ))
                              ) : (
                                <Typography
                                  sx={{ color: colors.greenAccent[400] }}
                                >
                                  No analyzers in {port.toUpperCase()}
                                </Typography>
                              )}
                            </Box>
                          );
                        })}
                      </Box>
                    </Box>
                  ))
                ) : (
                  <Typography>No deployed gateways found</Typography>
                )}
              </Box>

              <Dialog
                open={openGatewayDialog}
                onClose={handleCloseGatewayDialog}
                fullWidth
              >
                <DialogTitle
                  sx={{
                    color: colors.greenAccent[400],
                    fontSize: "20px",
                    fontWeight: "bold",
                  }}
                >
                  {selectedAnalyzer
                    ? selectedAnalyzer.name
                    : "No Analyzer Selected"}{" "}
                  Details
                </DialogTitle>
                <DialogContent>
                  {loading ? (
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        height: "100px",
                        // backgroundColor:colors.blueAccent[400]
                      }}
                    >
                      <ReactLoading
                        type="bubbles"
                        color={colors.greenAccent[400]}
                      />
                    </Box>
                  ) : selectedAnalyzer ? (
                    <Box sx={{ maxHeight: "300px", overflowY: "auto" }}>
                      {selectedAnalyzer.values.map((value, index) => (
                        <Box
                          key={index}
                          sx={{
                            padding: "10px",
                            border: "1px solid #ddd",
                            marginBottom: "8px",
                            borderRadius: "5px",
                          }}
                          onClick={() =>
                            navigateToChart(
                              value.name,
                              selectedAnalyzer.gateway_name
                            )
                          }
                        >
                          <Typography sx={{ color: colors.greenAccent[400] }}>
                            <strong>Name:</strong> {value.name}
                          </Typography>
                          <Typography sx={{ color: colors.greenAccent[400] }}>
                            <strong>Address:</strong> {value.address}
                          </Typography>
                          <Typography sx={{ color: colors.greenAccent[400] }}>
                            <strong>Value:</strong> {value.value}
                          </Typography>
                        </Box>
                      ))}
                    </Box>
                  ) : (
                    <Typography>No metadata available</Typography>
                  )}
                </DialogContent>
              </Dialog>
            </>
          </Grid>

          <Grid item xs={12} md={7}>
            <Box
              sx={{
                backgroundColor: colors.primary[400],
                position: "relative",
                padding: "20px",
                borderRadius: "10px",
                marginTop: "12px",
              }}
            >
              <Typography
                sx={{
                  color: colors.greenAccent[400],
                  marginBottom: "10px",
                  fontSize: "20px",
                }}
              >
                Select Gateway
              </Typography>

              {/* Dropdown for selecting a gateway */}
              <Box
                component="select"
                value={selectedGatewayForDropDown}
                onChange={handleGatewayChange}
                sx={{
                  width: "100%",
                  backgroundColor: colors.primary[500],
                  color: "#ffffff",
                  borderRadius: "5px",
                  border: "none",
                  padding: "10px",
                  boxShadow: "0 2px 5px rgba(0, 0, 0, 0.2)",
                  outline: "none",
                  fontSize: "16px",
                }}
              >
                <option value="" disabled>
                  Select Gateway
                </option>{" "}
                {dropdownGateways.length > 0 ? (
                  dropdownGateways.map((gateway) => (
                    <option
                      key={gateway.mac_address}
                      value={gateway.gateway_name}
                      style={{
                        color: "#ffffff",
                        display: "flex",
                        justifyContent: "space-between",
                      }}
                    >
                      {`${gateway.gateway_name} - ${gateway.mac_address}`}
                    </option>
                  ))
                ) : (
                  <option value="">No Gateways Available</option>
                )}
              </Box>
            </Box>

            <Box
              marginTop="9px"
              ref={reactFlowWrapper}
              borderRadius="10px"
              backgroundColor={colors.primary[400]}
              p={{ xs: 1, sm: 2, md: 3 }}
              sx={{
                position: "relative", // Ensure the Box is the reference point for absolute positioning
                height: { xs: "300px", sm: "400px", md: "500px", lg: "600px" },
                width: "100%",
                transition: "all 0.3s ease",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                "@media (max-width: 600px)": {
                  padding: "16px",
                  height: "300px",
                },
                "@media (min-width: 600px) and (max-width: 960px)": {
                  height: "400px",
                },
                "@media (min-width: 960px) and (max-width: 1280px)": {
                  height: "500px",
                },
              }}
            >
              <ReactFlow
                nodes={newNodes}
                edges={newEdges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                nodeTypes={nodeTypes}
                edgeTypes={edgeTypes}
                fitView={true}
                style={{ width: "100%", height: "100%" }}
                zoomOnScroll={false}
                panOnScroll={false}
                panOnDrag={false}
                nodesDraggable={false}
                proOptions={{ hideAttribution: true }}
              />
            </Box>

            {/* Pie Charts */}
            <Box mt={2}>
              <Grid container spacing={2} justifyContent="center">
                {chartNames.map((chartName, idx) => (
                  <Grid item xs={12} sm={6} md={6} lg={6} key={idx}>
                    <Box
                      height="300px"
                      p={1}
                      borderRadius="10px"
                      backgroundColor={colors.primary[400]}
                      position="relative"
                      textAlign="center"
                    >
                      <PieChart />
                      <Typography
                        variant="h6"
                        position="absolute"
                        top="6%"
                        width="100%"
                      >
                        {chartName}
                      </Typography>
                    </Box>
                  </Grid>
                ))}
              </Grid>
            </Box>

            {/* Gauge Meters */}
            <Box mt={2}>
              <Grid container spacing={2} justifyContent="center">
                {/* First Gauge Meter */}
                <Grid item xs={12} sm={6} md={6} lg={6}>
                  <Box
                    height="230px"
                    borderRadius="10px"
                    backgroundColor={colors.primary[400]}
                    display="flex"
                    justifyContent="center"
                    alignItems="center"
                    textAlign="center"
                  >
                    <GuageMeter />
                  </Box>
                </Grid>

                {/* Second Gauge Meter */}
                <Grid item xs={12} sm={6} md={6} lg={6}>
                  <Box
                    height="230px"
                    p={1}
                    borderRadius="10px"
                    backgroundColor={colors.primary[400]}
                    display="flex"
                    justifyContent="center"
                    alignItems="center"
                    textAlign="center"
                  >
                    <GuageMeter />
                  </Box>
                </Grid>

                {/* Third Gauge Meter */}
                <Grid item xs={12} sm={6} md={6} lg={6}>
                  <Box
                    height="230px"
                    p={1}
                    borderRadius="10px"
                    backgroundColor={colors.primary[400]}
                    display="flex"
                    justifyContent="center"
                    alignItems="center"
                    textAlign="center"
                  >
                    <GuageMeter />
                  </Box>
                </Grid>

                {/* Fourth Gauge Meter */}
                <Grid item xs={12} sm={6} md={6} lg={6}>
                  <Box
                    height="230px"
                    p={1}
                    borderRadius="10px"
                    backgroundColor={colors.primary[400]}
                    display="flex"
                    justifyContent="center"
                    alignItems="center"
                    textAlign="center"
                  >
                    <GuageMeter />
                  </Box>
                </Grid>

                {/* Fifth Gauge Meter */}
                <Grid item xs={12} sm={6} md={6} lg={6}>
                  <Box
                    height="230px"
                    p={1}
                    borderRadius="10px"
                    backgroundColor={colors.primary[400]}
                    display="flex"
                    justifyContent="center"
                    alignItems="center"
                    textAlign="center"
                  >
                    <GuageMeter />
                  </Box>
                </Grid>

                {/* Sixth Gauge Meter */}
                <Grid item xs={12} sm={6} md={6} lg={6}>
                  <Box
                    height="230px"
                    p={1}
                    borderRadius="10px"
                    backgroundColor={colors.primary[400]}
                    display="flex"
                    justifyContent="center"
                    alignItems="center"
                    textAlign="center"
                  >
                    <GuageMeter />
                  </Box>
                </Grid>
              </Grid>
            </Box>
          </Grid>
        </Grid>
      </Box>
      {/* ************** weather Dialog content*********** */}

      <Dialog
        open={open}
        onClose={handleClose}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          style: {
            backgroundColor: colors.primary[400],
            boxShadow: "none",
          },
        }}
      >
        <DialogTitle sx={{ fontSize: "30px" }}>Weather Forecast</DialogTitle>
        <DialogContent>
          <Box
            display="flex"
            flexDirection="row"
            alignItems="center"
            justifyContent="space-between"
          >
            <Box display="flex" alignItems="center">
              <ThermostatIcon sx={{ marginTop: "12px" }} />
              <Typography sx={{ marginLeft: "8px" }}>Temperature</Typography>
            </Box>
            <Typography
              sx={{
                display: "flex",
                alignItems: "end",
                alignItems: "flex-end",
              }}
            >
              {weather
                ? (((weather.temp - 32) * 5) / 9).toFixed(1) + "°C"
                : "Loading..."}
            </Typography>
          </Box>
          <Box
            display="flex"
            flexDirection="row"
            alignItems="center"
            justifyContent="space-between"
          >
            <Box display="flex" alignItems="center">
              <OpacityIcon sx={{ marginTop: "12px" }} />
              <Typography sx={{ marginLeft: "8px" }}>Humidity</Typography>
            </Box>
            <Typography
              sx={{
                display: "flex",
                alignItems: "end",
                alignItems: "flex-end",
              }}
            >
              {weather ? weather.humidity + " %" : "Loading..."}
            </Typography>
          </Box>
          <Box
            display="flex"
            flexDirection="row"
            alignItems="center"
            justifyContent="space-between"
          >
            <Box display="flex" alignItems="center">
              <TornadoIcon sx={{ marginTop: "12px" }} />
              <Typography sx={{ marginLeft: "8px" }}>Air Pressure</Typography>
            </Box>
            <Typography
              sx={{
                display: "flex",
                alignItems: "end",
                alignItems: "flex-end",
              }}
            >
              {weather ? weather.pressure + " hPa" : "Loading..."}
            </Typography>
          </Box>
          <Box
            display="flex"
            flexDirection="row"
            alignItems="center"
            justifyContent="space-between"
          >
            <Box display="flex" alignItems="center">
              <AirIcon sx={{ marginTop: "12px" }} />
              <Typography sx={{ marginLeft: "8px" }}>Wind Speed</Typography>
            </Box>
            <Typography
              sx={{
                display: "flex",
                alignItems: "end",
                alignItems: "flex-end",
              }}
            >
              {weather ? weather.windspeed + " km/h" : "Loading..."}
            </Typography>
          </Box>
          <Tabs
            variant="fullWidth"
            value={activeTab}
            onChange={handleTabChange}
            indicatorColor="secondary"
            textColor="inherit"
          >
            <Tab label="Daily" />
            <Tab label="Hourly" />
          </Tabs>

          {activeTab === 0 && (
            <Box mt={2}>
              {sevenDaysData && sevenDaysData.length > 0 ? (
                sevenDaysData.map((day, index) => (
                  <Box
                    key={index}
                    display="flex"
                    justifyContent="space-between"
                    mb={1}
                    alignItems="center"
                  >
                    <Box display="flex" alignItems="centre">
                      <ThermostatIcon
                        sx={{
                          fontSize: "1.5rem",
                          marginRight: "2rem",
                          color: colors.greenAccent[400],
                        }}
                      />
                      <Typography variant="body2" sx={{ fontSize: "1rem" }}>
                        {new Date(day.datetime).toLocaleDateString(undefined, {
                          weekday: "long",
                          month: "long",
                          day: "numeric",
                        })}
                      </Typography>
                    </Box>

                    <Typography variant="body2" sx={{ fontSize: "1rem" }}>
                      {day.temp.toFixed(1)}°C
                    </Typography>
                  </Box>
                ))
              ) : (
                <Typography variant="body2" color="textSecondary">
                  Loading 7-day forecast...
                </Typography>
              )}
            </Box>
          )}

          {activeTab === 1 && (
            <Box mt={2}>
              {todayHourlyData && todayHourlyData.length > 0 ? (
                todayHourlyData.map((hourData, index) => {
                  const hour = new Date(hourData.datetime * 1000).getHours();
                  const isDaytime = hour >= 6 && hour < 18;

                  return (
                    <Box
                      key={index}
                      display="flex"
                      justifyContent="space-between"
                      mb={1}
                      alignItems="center"
                    >
                      <Box display="flex" alignItems="center">
                        {isDaytime ? (
                          <WbSunnyIcon
                            sx={{
                              fontSize: "1.5rem",
                              marginRight: "2rem",
                              verticalAlign: "middle",
                            }}
                          />
                        ) : (
                          <NightlightIcon
                            sx={{
                              fontSize: "1.5rem",
                              marginRight: "2rem",
                              verticalAlign: "middle",
                            }}
                          />
                        )}

                        <Typography
                          variant="body2"
                          sx={{ fontSize: "1rem", marginBottom: "1rem" }}
                        >
                          {new Date(
                            hourData.datetime * 1000
                          ).toLocaleDateString(undefined, {
                            weekday: "long",
                          })}
                          ,{" "}
                          {new Date(
                            hourData.datetime * 1000
                          ).toLocaleTimeString(undefined, {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </Typography>
                      </Box>
                      <Typography variant="body2" sx={{ fontSize: "1rem" }}>
                        {hourData.temp}°C
                      </Typography>
                    </Box>
                  );
                })
              ) : (
                <Typography variant="body2" color="textSecondary">
                  Loading hourly forecast...
                </Typography>
              )}
            </Box>
          )}
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export default ProjectManager;
