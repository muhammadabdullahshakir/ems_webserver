import React from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Typography,
  Box,
  Grid,
  Modal,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  useTheme,
  Divider,
} from '@mui/material'
import { useState, useEffect } from 'react'
import axios from 'axios'
import {
  WiRain,
  WiCloudy,
  WiWindy,
  WiSunset,
  WiDaySunny,
  WiSnow,
  WiDayCloudy,
  WiHumidity,
  WiStrongWind,
} from 'react-icons/wi'
import CustomNode from './customNodes'
import AnimatedSVGEdge from './animatedSVGEdge'
import { ReactFlow, useNodesState, useEdgesState } from '@xyflow/react'
import '@xyflow/react/dist/style.css'
import urls from '../../urls/urls'
import GuageMeter from './GuageMeter'
import PieChart from './PieChart'
import DummyImage from '../../assets/images/genset.png'
import { left } from '@popperjs/core'
import { ColorModeContext } from '../theme/ThemeContext'
import { Tree, TreeNode } from 'react-organizational-chart'
import ContactlessIcon from '@mui/icons-material/Contactless'
import CableIcon from '@mui/icons-material/Cable'
import CalendarTodayIcon from '@mui/icons-material/CalendarToday'
import DeployGateway from './DeployGateway'
import HorizontalBars from './CostBarGraph'
import CostBarGraph from './CostBarGraph'
import SolarUsage from './PMGraphs/SolarUsage'
import GridUsage from './PMGraphs/GridUsage'
import GridIn from './PMGraphs/GridIn'
import GridOut from './PMGraphs/GridOut'



const nodeTypes = {
  customNode: CustomNode,
}
const initialNodes = [
  {
    id: 'solar',
    position: { x: -100, y: -200 },
    data: {
      label: "0.00",
      subLabel: '0.00',
      iconType: 'solar',
      style: {
        width: 80,
        height: 80,
        borderRadius: '50%',
      },
      outgoingHandlePosition: 'bottom',
      incomingHandlePosition: 'bottom',
    },
    type: 'customNode',
    draggable: false,
  },
  {
    id: 'genset',
    position: { x: -100, y: 50 },
    data: {
      label: "0.00",
      subLabel: '0.00',
      iconType: 'genset',
      style: {
        width: 80,
        height: 80,
        borderRadius: '50%',
      },
      outgoingHandlePosition: 'top',
      incomingHandlePosition: 'top',
    },
    type: 'customNode',
    draggable: false,
  },
  {
    id: 'load',
    position: { x: 110, y: -70 },
    data: {
      label: '0.00',
      subLabel: "0.00",
      iconType: 'load',
      style: {
        width: 80,
        height: 80,
        borderRadius: '50%',
      },
      outgoingHandlePosition: 'left',
      incomingHandlePosition: 'left',
    },
    type: 'customNode',
    draggable: false,
  },
  {
    id: 'grid',
    position: { x: -300, y: -70 },
    data: {
      label: "0.00",
      subLabel: '0.00',
      iconType: 'grid',
      style: {
        width: 80,
        height: 80,
        borderRadius: '50%',
      },
      outgoingHandlePosition: 'right',
      incomingHandlePosition: 'right',
    },
    type: 'customNode',
    draggable: false,
  },
]

// Edge types
const edgeTypes = {
  animatedSvg: AnimatedSVGEdge,
}
const initialEdges = [
  { id: 'solar->load', type: 'bezier', source: 'solar', target: 'load' },
  { id: 'grid->load', type: 'bezier', source: 'grid', target: 'load' },
  { id: 'genset->load', type: 'bezier', source: 'genset', target: 'load' },
  { id: 'solar->grid', type: 'bezier', source: 'solar', target: 'grid' },
  { id: 'grid->genset', type: 'bezier', source: 'grid', target: 'genset' },
  { id: '4->2', type: 'bezier', source: '4', target: '2' },
]

const ProjectManager = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const projectName = location.state?.projectName || 'Unknown Project'
  const latitude = location.state.latitude || ''
  const longitude = location.state.longitude || ''
  const address = location.state.address || ''
  const project_id = location.state?.projectId || ''
  const [gateway, setGateway] = useState('')
  const [dropdownGateways, setDropdownGateways] = useState([])
  const [weatherData, setWeatherData] = useState(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [gateways, setGateways] = useState([])
  const [error, setError] = useState('')
  const [metadataData, setMetadataData] = useState({})
  const [selectedAnalyzer, setSelectedAnalyzer] = useState(null)
  const handleOpen = () => setModalOpen(true)
  const handleClose = () => setModalOpen(false)
  const [nodes, onNodesChange] = useNodesState(initialNodes)
  const [edges, onEdgesChange] = useEdgesState(initialEdges)
  const [newNodes, setNewNodes] = useState(initialNodes)
  const [newEdges, setNewEdges] = useState(initialEdges)
   const [role, setRole] = useState('');

  useEffect(() => {
    // Retrieve user data from localStorage
    const user = JSON.parse(localStorage.getItem('user'));
    if (user) {
      setRole(user.role || ''); // Set role from localStorage
    }
  }, []);
  const theme = useTheme()
  // console.log('dropdowm:', selectedGatewayForDropDown)

  // dynamically updated the animation
  const updateEdgesBasedOnOutput = (analyzers) => {
    const activeNodes = analyzers
      .filter((analyzer) => {
        const lastValue = parseFloat(analyzer.values[analyzer.values.length - 1]?.value || '0.00')
        return lastValue > 0
      })
      .map((analyzer) => analyzer.type.toLowerCase())

    const updatedEdges = initialEdges.map((edge) => {
      const isActive = activeNodes.includes(edge.source)
      return {
        ...edge,
        type: isActive && edge.target === 'load' ? 'animatedSvg' : 'bezier',
      }
    })

    return updatedEdges
  }

const handleGatewayChange = (event) => {
  const selectedGateway = event.target.value; // Get selected gateway name or ID
  setSelectedGatewayForDropdown(selectedGateway);

  // Fetch Gateway ID (Assuming you can get the G_id from the selected gateway object)
  const selectedGatewayData = gateways.find(gw => gw.gateway_name === selectedGateway);
  const gatewayId = selectedGatewayData ? selectedGatewayData.G_id : null;

  // Save the Gateway ID (G_id) to localStorage under a separate record
  if (gatewayId) {
    localStorage.setItem("selectedGatewayId", gatewayId);
  }

  // Store selected gateway for the project (you already have this logic)
  let storedGateways = JSON.parse(localStorage.getItem("selectedGateways")) || {};
  storedGateways[project_id] = selectedGateway;
  localStorage.setItem("selectedGateways", JSON.stringify(storedGateways));
};

  
  
  const [selectedGatewayForDropDown, setSelectedGatewayForDropdown] = useState(() => {
    const storedGateways = JSON.parse(localStorage.getItem("selectedGateways")) || {};
    return storedGateways[project_id] || ""; // Get the correct gateway for the project
  });
  
  
  
  /////// fetchDeployedGatewaysForDropdown //////
  useEffect(() => {
    const fetchDeployedGatewaysForDropdown = async () => {
      try {
        const response = await axios.get(`${urls.getGatewaysForDropdown}?project_id=${project_id}`);
        const data = response.data.deployed_gateways;
        setDropdownGateways(data);
  
        // Retrieve stored gateways from localStorage
        let storedGateways = JSON.parse(localStorage.getItem("selectedGateways")) || {};
  
        // Get the selected gateway for the current project
        const storedGateway = storedGateways[project_id];
  
        // Ensure the stored gateway exists in the current project
        if (storedGateway && data.some((gw) => gw.gateway_name === storedGateway)) {
          setSelectedGatewayForDropdown(storedGateway);
        } else {
          setSelectedGatewayForDropdown(""); // Reset if no valid stored gateway
        }
      } catch (error) {
        console.error("Error fetching gateways for dropdown", error);
      }
    };
  
    fetchDeployedGatewaysForDropdown();
    const intervalId = setInterval(fetchDeployedGatewaysForDropdown, 5000);
    return () => clearInterval(intervalId);
  }, [project_id]);
  

 ///// fetchdeployedgateways /////
 useEffect(() => {
  const fetchDeployedGateways = async () => {
    try {
      const response = await fetch(`${urls.fetchDeployedGateways}?project_id=${project_id}`)
      const data = await response.json()
      console.log('Fetched Deployed Gateways:', data)

      if (response.ok) {
        const fetchedGateways = data.deployed_gateways || []
        console.log('fetched deployed gateways:', fetchedGateways)
        setGateways(fetchedGateways)
      } else {
        setError(data.message || 'Failed to fetch gateways')
      }
    } catch (err) {
      setError('Error occurred while fetching data')
      console.error(err)
    }
  }

  fetchDeployedGateways()
}, [project_id])


  ////// fetchweatherdata //////
  useEffect(() => {
    const fetchWeatherData = async () => {
      try {
        const apiUrl =
          'https://weather.visualcrossing.com/VisualCrossingWebServices/rest/services/timeline/Islamabad,Pakistan?key=CGYB7C92LET4UR7F9YY2TWYLS'
        const response = await fetch(apiUrl)
        const data = await response.json()
        console.log('weather', data)

        // ✅ Convert Fahrenheit to Celsius for accurate display
        data.currentConditions.temp = ((data.currentConditions.temp - 32) * 5) / 9
        data.days[0].hours.forEach((hour) => {
          hour.temp = ((hour.temp - 32) * 5) / 9
        })

        setWeatherData(data)
      } catch (error) {
        console.error('Error fetching weather data:', error)
      }
    }

    fetchWeatherData()
  }, [])

  /////// fetchDeployedGatewaysForDropdown //////
  useEffect(() => {
    const fetchDeployedGatewaysForDropdown = async () => {
      try {
        const response = await axios.get(`${urls.getGatewaysForDropdown}?project_id=${project_id}`)
        const data = response.data.deployed_gateways
        setDropdownGateways(data)
      } catch (error) {
        console.error('Error fetching gateways for dropdown', error)
      }
    }

    fetchDeployedGatewaysForDropdown()
    const intervalId = setInterval(fetchDeployedGatewaysForDropdown, 5000)
    return () => clearInterval(intervalId)
  }, [project_id])

  // ✅ Fetch metadata when gateways change
  useEffect(() => {
    const fetchMetadataForGateways = async () => {
      const metadataResults = {}

      for (const gateway of gateways) {
        const gatewayName = gateway.gateway_name

        try {
          const response = await axios.get(urls.fetch_Metadata(gatewayName))
          metadataResults[gatewayName] = response.data
          console.log('Meta Data:', response.data)
        } catch (error) {
          console.error(`Error fetching metadata for gateway ${gatewayName}:`, error)
        }
      }

      setMetadataData(metadataResults) // ✅ Update state
    }

    if (gateways.length > 0) {
      fetchMetadataForGateways() // ✅ Fetch metadata when gateways exist
    }
  }, [gateways])

  ///// FetchAnalyzerData /////
  useEffect(() => {
    const fetchAnalyzerData = async () => {
      if (selectedGatewayForDropDown) {
        try {
          const response = await axios.get(
            urls.getAnalyzerValuesByGateway(selectedGatewayForDropDown),
          )
          const analyzers = response.data.analyzers || []

          // Update nodes
          const updatedNodes = newNodes.map((node) => {
            const analyzer = analyzers.find((a) => a.type.toLowerCase() === node.id.toLowerCase())

            if (analyzer) {
              const lastValue = parseFloat(
                analyzer.values[analyzer.values.length - 1]?.value || '0.00',
              )

              return {
                ...node,
                data: {
                  ...node.data,
                  label: node.id === 'load' ? lastValue : node.data.label,
                  subLabel: node.id !== 'load' ? lastValue : node.data.subLabel,
                },
              }
            }
            return node
          })

          setNewNodes(updatedNodes)

          // Update edges
          const updatedEdges = updateEdgesBasedOnOutput(analyzers)
          setNewEdges(updatedEdges)
        } catch (error) {
          console.error('Error fetching analyzer data:', error)
        }
      }
    }

    fetchAnalyzerData()

    const intervalId = setInterval(fetchAnalyzerData, 6700)

    return () => clearInterval(intervalId)
  }, [selectedGatewayForDropDown])

  const getNextHours = (hours) => {
    if (!hours || !Array.isArray(hours)) return []
    const currentHour = new Date().getHours()
    return hours.filter((hour) => parseInt(hour.datetime.split(':')[0]) >= currentHour).slice(0, 5)
  }

  const getWeatherIcon = (temp, conditions) => {
    if (!temp || !conditions) return null; // ✅ Handle missing values
  
    if (conditions.toLowerCase().includes("rain")) 
      return <WiRain color="#0077b6" size={80} />; // Deep Blue for Rain
    
    if (conditions.toLowerCase().includes("cloud")) 
      return <WiCloudy color="#6c757d" size={80} />; // Neutral Gray for Clouds
    
    if (conditions.toLowerCase().includes("wind")) 
      return <WiWindy color="#00a8cc" size={80} />; // Fresh Sky Blue for Wind
    
    if (conditions.toLowerCase().includes("sunrise") || conditions.toLowerCase().includes("sunset")) 
      return <WiSunset color="#ff914d" size={80} />; // Warm Sunset Orange
    
    if (temp >= 30) 
      return <WiDaySunny color="#f4a261" size={80} />; // Soft Sun Orange
    
    if (temp < 15) 
      return <WiSnow color="#6dd5ed" size={80} />; // Cool Icy Blue for Cold Weather
  
    return <WiDayCloudy color="#f5c518" size={80} />; // Soft Yellow for Mild Conditions
  };

  if (!weatherData || !weatherData.currentConditions) {
    return <Typography variant="h6">Loading Weather Data...</Typography> // ✅ Prevent error
  }

  // navigation to project chart page

  const navigateToChart = (valueName, gatewayName, address, value) => {
    navigate(`/dashboard/projectchart/${gatewayName}/${valueName}`, {
      state: { address, value }, // ✅ Pass additional data to the next screen
    })
  }

  const getIconAndBgColor = (purpose) => {
    if (purpose === "Gateway") {
      return {
        icon: <ContactlessIcon fontSize="large" />,
        bgColor: "linear-gradient(135deg,rgba(169, 181, 172, 0.91),rgba(32, 131, 45, 0.92))", // Deep Blue & Modern Green
        mainBoxBg: theme.palette.background.card
      };
    } else if (["COM1", "COM2", "ETH1", "ETH2"].includes(purpose)) {
      return {
        icon: <CableIcon fontSize="large" />,
        bgColor: "linear-gradient(135deg, #D32F2F, #B71C1C)", // Bold Red for Connections
        mainBoxBg: theme.palette.background.card
      };
    } else if (purpose === "Analyzer") {
      return {
        icon: <CalendarTodayIcon fontSize="large" />,
        bgColor: "linear-gradient(135deg, #00695C, #2E7D32)", // Professional Teal & Deep Green
        mainBoxBg: theme.palette.background.card
      };
    } else {
      return {
        icon: <ContactlessIcon fontSize="large" />,
        bgColor: "linear-gradient(135deg,rgba(168, 198, 97, 0.89),rgba(198, 201, 10, 0.89))", // Elegant Dark Gray
        mainBoxBg: theme.palette.background.card
      };
    }
  };
  const TreeBox = ({ label, purpose, onClick }) => {
    const { icon, bgColor, mainBoxBg } = getIconAndBgColor(purpose);
  
    return (
      <Box
        sx={{
          p: '10px',
          borderRadius: '10px',
          boxShadow: '0px 2px 6px rgba(0, 0, 0, 0.1)',
          background: mainBoxBg,
          display: 'flex',
          alignItems: 'center',
          minWidth: '150px',
          maxWidth: '100%',
          cursor: onClick ? 'pointer' : 'default',
          position: 'relative',
          overflow: "visible"
        }}
        onClick={onClick}
      >
        {/* ✅ Small Box with Background Color and White Icon */}
        <Box
          sx={{
            width: '50px',
            height: '50px',
            background: bgColor,
            borderRadius: '5px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'absolute',
            top: '-12px',
            left: '5px',
          }}
        >
          {React.cloneElement(icon, { style: { color: 'white' } })} {/* ✅ White Icon */}
        </Box>
  
        {/* ✅ Label - Only Analyzer is Right-Aligned */}
        <Typography
          variant="subtitle1"
          fontWeight="bold"
          sx={{
            textAlign: purpose === 'Analyzer' ? 'right' : 'center', // ✅ Only Analyzer Right-Aligned
            flexGrow: 1,
            paddingLeft: '40px', // Prevent overlap with left-side icon
          }}
        >
          {label}
        </Typography>
      </Box>
    );
  };
  

  return (
    
    <Box sx={{ p: 2,  }}>
      {/* Responsive Grid Layout */}
      <Grid container spacing={0}>
        <Grid container spacing={1} alignItems="stretch" mt={1}>
          {/* ✅ Left Box (Placeholder Content) */}
          <Grid item xs={12} md={6}>
          <motion.div
              initial={{ opacity: 0, y: 150 }}
             animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1.2, ease: "easeOut" }}
              >
            <Box
              sx={{
                //background: theme.palette.background.paper,
                p: "25px",
                borderRadius: "10px",
                boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.1)',
                border: '1px solid #ddd',
                color: theme.palette.text.TextColor,
                maxHeight: "690px", // Increased height
                minHeight: "490px", // Increased height
                display: "flex",
                flexDirection: "column",
                
                position: "relative",
                overflow: "hidden",
                background: `linear-gradient(to right, rgba(201, 202, 203, 0.91), rgba(209, 207, 207, 0.3)), 
            url('https://i0.wp.com/calmatters.org/wp-content/uploads/2021/11/clean-energy-power-grid.jpg?fit=1836%2C1059&ssl=1') center/cover no-repeat`,
                
              }}
            >
              {/* Top Left "Welcome Back" */}
              <Typography
                variant="h6"
                color= '#494a4f'//'{{theme.palette.text.TextColor}}'
                sx={{
                  position: "absolute",
                  top: 40,
                  left: 25,
                  fontWeight: "bold",
                  opacity: 0.9,
                  
                }}
              >
              👋 Welcome Back
                </Typography>
                <br/>
                {/* Centered Project Name */}
                <Typography
                  variant="h2"
                  fontWeight="light"
                  color = '#494a4f'//'{{theme.palette.text.TextColor}}'
                  sx={{
                    
                    top:200,
                    textAlign: "center",
                    fontSize: "3.5rem",
                  }}
                >
              {projectName}
            </Typography>

            {/* Bottom Section with Location Info */}
            <Box sx={{ textAlign: "center", opacity: 0.9 , color:'black'}}>
              
              <Typography sx={{ fontSize: "1rem" }}></Typography>
            </Box>
            
            </Box>
            </motion.div>
          </Grid>

          {/* ✅ Weather Information (Right Side) */}
          <Grid item xs={12} md={6} onClick={handleOpen} style={{ cursor: "pointer" }}>
          <motion.div
            whileHover={{ scale: 1.03, boxShadow: "0px 6px 15px rgba(0, 0, 0, 0.2)" }}
            transition={{ duration: 0.3 }}
          >
            <Box
              sx={{
                background: theme.palette.background.paper,
                p: "20px",
                borderRadius: "12px",
                boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.15)",
                border: "1px solid #ddd",
                textAlign: "center",
                maxHeight: "690px", // Increased height
                minHeight: "490px", // Increased height
              }}
            >
              {/* ✅ Current Condition */}
              <Typography variant="h6" fontWeight="bold">
                {weatherData?.currentConditions?.conditions}
              </Typography>

              {weatherData ? (
                <Box>
                  {/* ✅ Temperature with Animation */}
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5 }}
                  >
                    <Box
                      sx={{
                        fontSize: "32px",
                        fontWeight: "bold",
                        display: "inline-block",
                        color: theme.palette.text.primary,
                      }}
                    >
                      {weatherData.currentConditions.temp.toFixed(1)}°C
                    </Box>
                  </motion.div>

                  {/* ✅ Weather Icon with Animation */}
                  <motion.div
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.6 }}
                  >
                    <Box sx={{ fontSize: "0px" }}>
                      {getWeatherIcon(
                        weatherData.currentConditions.temp,
                        weatherData.currentConditions.conditions
                      )}
                    </Box>
                  </motion.div>

                  {/* ✅ Humidity & Wind Speed Row */}
                  <Grid container justifyContent="space-between" alignItems="center" sx={{ mt: 2, px: 3 }}>
                    {/* ✅ Humidity with Animation */}
                    <motion.div whileHover={{ scale: 1.1 }} transition={{ duration: 0.3 }}>
                      <Grid item sx={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <WiHumidity size={50} color="blue" />
                        <Typography sx={{ fontSize: "14px" }}>
                          <strong>Humidity:</strong> {weatherData.currentConditions.humidity}%
                        </Typography>
                      </Grid>
                    </motion.div>

                    {/* ✅ Wind Speed with Animation */}
                    <motion.div whileHover={{ scale: 1.1 }} transition={{ duration: 0.3 }}>
                      <Grid item sx={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <WiStrongWind size={50} color="gray" />
                        <Typography sx={{ fontSize: "14px" }}>
                          <strong>Wind:</strong> {weatherData.currentConditions.windspeed} km/h
                        </Typography>
                      </Grid>
                    </motion.div>
                  </Grid>

                  {/* ✅ Next 5 Hours Forecast */}
                  <Typography variant="h6" sx={{ mt: 3, fontWeight: "bold" }}>
                    Next 5 Hours Forecast
                  </Typography>
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      overflowX: "auto",
                      whiteSpace: "nowrap",
                      gap: "15px",
                      padding: "10px 0",
                    }}
                  >
                    {getNextHours(weatherData?.days?.[0]?.hours).map((hour, index, array) => {
                      return (
                        <motion.div
                          key={index}
                          whileHover={{ scale: 1.1 }}
                          transition={{ duration: 0.3 }}
                          style={{ textAlign: "center", padding: "0 10px", position: "relative" }}
                        >
                          {/* ✅ Weather Icon Animation */}
                          <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5 }}
                          >
                            {getWeatherIcon(hour.temp, hour.conditions)}
                          </motion.div>

                          {/* ✅ Time and Temperature */}
                          <Typography sx={{ fontSize: "14px", fontWeight: "bold" }}>
                            {hour.datetime}
                          </Typography>
                          <Typography sx={{ fontSize: "14px" }}>{hour.temp.toFixed(1)}°C</Typography>

                          {/* Vertical Divider (Except Last Item) */}
                          {index !== array.length - 1 && (
                            <Box
                              sx={{
                                width: "2px",
                                height: "50px",
                                backgroundColor: "#ddd",
                                position: "absolute",
                                right: "-10px",
                                top: "50%",
                                transform: "translateY(-50%)",
                              }}
                            />
                          )}
                        </motion.div>
                      );
                    })}
                  </Box>
                </Box>
              ) : (
                <Typography>Loading weather data...</Typography>
              )}
            </Box>
          </motion.div>
        </Grid>

          {/* Wlcm to user */}
          <Grid item xs={12}>
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                background: theme.palette.background.paper,
                p: '20px',
                borderRadius: '10px',
                boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.1)',
                border: '1px solid #ddd',
                flexWrap: 'wrap',
                gap: '20px',
              }}
            >
              {/* Left Side: Welcome Message */}
              <Box sx={{ textAlign: 'left', flex: 1, minWidth: '250px' }}>
                <Typography variant="h5" fontWeight="bold">
                  Gateway Dashboard 
                </Typography>
              </Box>

              {/* Right Side: Gateway Selection */}
              <Box sx={{ flex: 1, minWidth: '250px' }}>
                <InputLabel id="gateway-label" sx={{ color: 'grey', fontWeight: 'bold' }}>
                  {/* ✅ Grey label */}
                  Select Gateway
                </InputLabel>
                <FormControl fullWidth>
                  <Select
                    label="gateway-label"
                    id="gateway-select"
                    value={selectedGatewayForDropDown}
                    onChange={handleGatewayChange}
                  >
                    {dropdownGateways.length > 0 ? (
                      dropdownGateways.map((gw) => (
                        <MenuItem key={gw.mac_address} value={gw.gateway_name}>
                          {gw.gateway_name}
                        </MenuItem>
                      ))
                    ) : (
                      <MenuItem disabled>No Gateways Available</MenuItem>
                    )}
                  </Select>
                </FormControl>
              </Box>
               <Box>
                            {role === 'user' && <DeployGateway />}
                            </Box>
            </Box>
          </Grid>

          {/* ✅ MODAL for Detailed Weather Info */}
          <Modal open={modalOpen} onClose={handleClose}>
            <Box
              sx={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                width: { xs: '90%', sm: '50%', md: '40%' },
                background: theme.palette.background.paper,
                borderRadius: '10px',
                boxShadow: 24,
                p: 4,
                maxHeight: '90vh',
                overflowY: 'auto',
                textAlign: 'center',
              }}
            >
              <Typography variant="h5" gutterBottom style={{ marginBottom: '20px' }}>
                Weather Details
              </Typography>

              {/* ✅ Current Conditions */}
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Typography variant="body1">
                    🌡 Temperature: {weatherData.currentConditions.temp.toFixed(1)}°C
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body1">
                    🌥 Conditions: {weatherData.currentConditions.conditions}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body1">
                    💧 Humidity: {weatherData.currentConditions.humidity}%
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body1">
                    💨 Wind Speed: {weatherData.currentConditions.windspeed} km/h
                  </Typography>
                </Grid>
              </Grid>

              {/* ✅ Next 7 Days Forecast */}
              <Typography variant="h6" sx={{ mt: 3, mb: 2 }}>
                7-Day Forecast
              </Typography>
              <Grid container spacing={2}>
                {weatherData.days.slice(0, 7).map((day, index) => (
                  <Grid item xs={12} sm={4} key={index}>
                    <Box
                      sx={{
                        p: 2,
                        border: '1px solid #ddd',
                        borderRadius: '8px',
                        textAlign: 'center',
                        background: theme.palette.background.paper,
                      }}
                    >
                      <Typography variant="body1">{day.datetime}</Typography>
                      <Typography variant="body2">
                        🌡 {(((day.temp - 32) * 5) / 9).toFixed(1)}°C
                      </Typography>
                    </Box>
                  </Grid>
                ))}
              </Grid>

              {/* ✅ Close Button */}
              <Box sx={{ textAlign: 'center', mt: 3 }}>
                <Button variant="contained" color="primary" onClick={handleClose}>
                  Close
                </Button>
              </Box>
            </Box>
          </Modal>
        </Grid>

        <Grid container spacing={1} mt={1}>
          {/* ✅ First Box - Display Selected Gateway Data in Organizational Tree View */}
          {selectedGatewayForDropDown && (
            <Grid item xs={12}>
              <Box
                sx={{
                  p: '10px',
                  pt: "20px",
                  borderRadius: '10px',
                  boxShadow: '0px 2px 6px rgba(0, 0, 0, 0.1)',
                  background: theme.palette.background.paper,
                  textAlign: 'center',
                  alignItems: 'center',
                  width: '100%',
                  overflowX: 'auto',
                }}
              >
                {gateways
                  .filter((gw) => gw.gateway_name === selectedGatewayForDropDown)
                  .map((gw, index) => (
                    <Tree
                      lineWidth={'2px'}
                      lineColor={'green'} // ✅ Green tree lines
                      lineBorderRadius={'10px'}
                      label={
                        <TreeBox
                          purpose="Gateway"
                          
                          label={
                            <>
                              {' '}
                              Gateway: {gw.gateway_name} <br /> Mac Address: {gw.mac_address} <br />{' '}
                              Deployed Status: {gw.deploy_status}{' '}
                            </>
                          }
                        />
                      }
                    >
                      <TreeNode key={index}>
                        {/* ✅ Display Metadata in Tree */}
                        {metadataData[gw.gateway_name] ? (
                          <TreeNode>
                            {metadataData[gw.gateway_name].ports.map((port, portIndex) => (
                              <TreeNode
                                key={portIndex}
                                label={
                                  <TreeBox label={`${port.port_name}`} purpose={port.port_name} />
                                }
                              >
                                {port.analyzers.map((analyzer, analyzerIndex) => (
                                  <TreeNode
                                    key={analyzerIndex}
                                    label={
                                      <TreeBox
                                        purpose="Analyzer"
                                        label={
                                          <>
                                            {' '}
                                            {analyzer.name} ({analyzer.type}) <br /> Status:{' '}
                                            {analyzer.status ? 'Active' : 'Inactive'}{' '}
                                          </>
                                        }
                                      />
                                    }
                                  >
                                    <Box
                                      sx={{
                                        p: '10px',
                                        borderRadius: '8px',
                                        boxShadow: '0px 2px 6px rgba(0, 0, 0, 0.1)',
                                        background: theme.palette.background.paper,
                                        textAlign: 'center',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        gap: '10px',
                                      }}
                                    >
                                      {analyzer.values.map((val, valIndex) => (
                                        <Box
                                          key={valIndex}
                                          sx={{
                                            display: 'flex',
                                            flexDirection: 'column',
                                            alignItems: 'flex-start',
                                            padding: '5px',
                                            backgroundColor: theme.palette.background.default,
                                            borderRadius: '5px',
                                            width: '100%',
                                            cursor: 'pointer',
                                          }}
                                          onClick={() => navigateToChart(val.name, gw.gateway_name)}
                                        >
                                          <Grid
                                            display={'flex'}
                                            flexDirection={'row'}
                                            columnGap={1}
                                          >
                                            <Typography
                                              variant="subtitle1"
                                              fontWeight="bold"
                                              display={'flex'}
                                              flexDirection={'Column'}
                                            >
                                              <Box> Name </Box> <Box> {val.name} </Box>
                                            </Typography>
                                            <Divider orientation="vertical" flexItem />
                                            <Typography
                                              variant="subtitle1"
                                              fontWeight="bold"
                                              display={'flex'}
                                              flexDirection={'Column'}
                                            >
                                              <Box> Value </Box> <Box> {val.value} </Box>
                                            </Typography>
                                            <Divider orientation="vertical" flexItem />
                                            <Typography
                                              variant="subtitle1"
                                              fontWeight="bold"
                                              display={'flex'}
                                              flexDirection={'Column'}
                                            >
                                              <Box> Address </Box> <Box> {val.address} </Box>
                                            </Typography>
                                          </Grid>
                                        </Box>
                                      ))}
                                    </Box>
                                  </TreeNode>
                                ))}
                              </TreeNode>
                            ))}
                          </TreeNode>
                        ) : (
                          <TreeNode label={<TreeBox label="No metadata available." />} />
                        )}
                      </TreeNode>
                    </Tree>
                  ))}
              </Box>
            </Grid>
          )}
        </Grid>

        {/* ✅ NEW GRID: GuageChart */}
        <Grid container spacing={2} mt={2}>
          {/* ✅ First Box - Only Solar Cost Bar Charts */}
          <Grid item xs={12} md={6}>
            {selectedGatewayForDropDown && (
              <Box
                sx={{
                  background: theme.palette.background.paper,
                  p: '20px',
                  borderRadius: '10px',
                  boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.1)',
                  border: '1px solid #ddd',
                  textAlign: 'center',
                  height: '100%',
                }}
              >
                {/* Grid For costing bar charts where months in bottom and cost at left */}
                <Grid 
      container
      justifyContent="center"  // Horizontally centers the content
      alignItems="center"       // Vertically centers the content
       // Ensures the Grid takes the full height
    >
      <Grid item>
        <CostBarGraph />
      </Grid>
    </Grid>
              </Box>
            )}
          </Grid>

          {/* ✅ Second Box - ReactFlow (UNCHANGED) */}
          <Grid item xs={12} md={6} height={450}>
            {selectedGatewayForDropDown && (
              <Box
                sx={{
                  background: theme.palette.background.paper,
                  p: '20px',
                  borderRadius: '10px',
                  boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.1)',
                  border: '1px solid #ddd',
                  textAlign: 'center',
                  height: '100%',
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
                  style={{ width: '100%', height: '100%' }}
                  zoomOnScroll={true}
                  panOnScroll={false}
                  panOnDrag={true}
                  nodesDraggable={false}
                  proOptions={{ hideAttribution: true }}
                />
              </Box>
            )}
          </Grid>
        </Grid>
        <Grid container spacing={2} mt={1}>
          {/* First grpagh Solar USage */}
          <Grid item xs={12} md={6}>
  {selectedGatewayForDropDown && (
    <>
      {/* Card only for heading */}
      <Box
        sx={{
          background: theme.palette.background.paper,
          p: '20px',
          borderRadius: '10px',
          boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.1)',
          border: '1px solid #ddd',
          textAlign: 'center',
        }}
      >
        <Typography textAlign="center" fontWeight="bold">
          Solar Usage
        </Typography>
         <Box mt={2}>
        <SolarUsage />
      </Box>
      </Box>

      {/* Graph rendered outside the card */}
     
    </>
  )}
</Grid>
           {/* First grpagh Grid USage */}
           <Grid item xs={12} md={6}>
  {selectedGatewayForDropDown && (
    <>
      {/* Card only for heading */}
      <Box
        sx={{
          background: theme.palette.background.paper,
          p: '20px',
          borderRadius: '10px',
          boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.1)',
          border: '1px solid #ddd',
          textAlign: 'center',
        }}
      >
        <Typography textAlign="center" fontWeight="bold">
          Grid Usage
        </Typography>
         <Box mt={2}>
        <GridUsage />
      </Box>
      </Box>

      {/* Graph rendered outside the card */}
     
    </>
  )}
</Grid>
           {/* First grpagh Grid In */}
           <Grid item xs={12} md={6}>
  {selectedGatewayForDropDown && (
    <>
      {/* Card only for heading */}
      <Box
        sx={{
          background: theme.palette.background.paper,
          p: '20px',
          borderRadius: '10px',
          boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.1)',
          border: '1px solid #ddd',
          textAlign: 'center',
        }}
      >
        <Typography textAlign="center" fontWeight="bold">
          Grid In
        </Typography>
         <Box mt={2}>
        <GridIn />
      </Box>
      </Box>

      {/* Graph rendered outside the card */}
     
    </>
  )}
</Grid>
             {/* First grpagh Grid out */}
         <Grid item xs={12} md={6}>
  {selectedGatewayForDropDown && (
    <>
      {/* Card only for heading */}
      <Box
        sx={{
          background: theme.palette.background.paper,
          p: '20px',
          borderRadius: '10px',
          boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.1)',
          border: '1px solid #ddd',
          textAlign: 'center',
        }}
      >
        <Typography textAlign="center" fontWeight="bold">
          Grid Out
        </Typography>
         <Box mt={2}>
        <GridOut />
      </Box>
      </Box>

      {/* Graph rendered outside the card */}
     
    </>
  )}
</Grid>


          
        </Grid>
      </Grid>
    </Box>
  )
}

export default ProjectManager
