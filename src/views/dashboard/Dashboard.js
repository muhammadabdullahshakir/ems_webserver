import React, { useState, useEffect } from 'react'
import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  TextField,
  useTheme,
  Button,
  Avatar,
} from '@mui/material'
import PeopleIcon from '@mui/icons-material/People'
import DevicesIcon from '@mui/icons-material/Devices'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import CloudUploadIcon from '@mui/icons-material/CloudUpload'
import AssignmentIcon from '@mui/icons-material/Assignment'
import WidgetsDropdown from '../widgets/WidgetsDropdown'
import urls from '../../urls/urls'
import axios from 'axios'
import BarChartComponent from '../../components/barchart'
import { useNavigate } from 'react-router-dom'
import { ColorModeContext } from '../theme/ThemeContext'
import GraphContainer from '../../components/GraphContainer'
import AddProject from './AddProject'
import { getUserIdFromLocalStorage } from '../../data/localStorage';


const Dashboard = () => {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [totalUser, setTotalUsers] = useState([])
  const [hardwareCount, setHardwareCount] = useState(0)
  const [deployedHardwareCount, setDeployedHardwareCount] = useState(0)
  const [userAlotedGatewaysCount, setUserAlotedGatewaysCount] = useState(0)
  const [totalProjectsCount, setTotalProjectsCount] = useState(0)
  const [searchTerm, setSearchTerm] = useState('')
  const [projects, setProjects] = useState([])
  const id = projects.PM_id
  const [selectedProject, setSelectedProject] = useState(null)
  const [role, setRole] = useState('');
  const [userProjects, setUserProjects] = useState([]);
  const [totalUserGateways, setTotalUserGateways] = useState([]);


  
  useEffect(() => {
    // Retrieve user data from localStorage
    const user = JSON.parse(localStorage.getItem('user'));
    if (user) {
      setRole(user.role || ''); // Set role from localStorage
    }
  }, []);
  const theme = useTheme()

  const xAxisData = ['group A', 'group B', 'group C']
  const seriesData = [{ data: [4, 3, 5] }, { data: [1, 6, 3] }, { data: [2, 5, 6] }]

  const filteredProjects = projects
    .filter(
      (project) =>
        project.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        project.PM_id?.toString().includes(searchTerm) ||
        project.user_firstname?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        project.address?.toLowerCase().includes(searchTerm.toLowerCase()),
    )
    .sort((a, b) => {
      const search = searchTerm.toLowerCase()
      const aStarts = a.name?.toLowerCase().startsWith(search)
      const bStarts = b.name?.toLowerCase().startsWith(search)
      if (aStarts && !bStarts) return -1
      if (!aStarts && bStarts) return 1
      return 0
    })

  // Fetch Total Users
  useEffect(() => {
    const fetchTotalUsers = async () => {
      try {
        const response = await fetch(urls.userCount)
        if (response.ok) {
          const data = await response.json()
          setTotalUsers(data.total_users)
        } else {
          console.error('Failed to fetch user count:', response.status, response.statusText)
        }
      } catch (error) {
        console.error('Error fetching user count:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchTotalUsers()
    const intervalId = setInterval(fetchTotalUsers, 5000)
    return () => clearInterval(intervalId)
  }, [])

  // Fetch Total Hardware
  useEffect(() => {
    const fetchTotalGatewayCount = async () => {
      try {
        const response = await fetch(urls.totalGatewaysCount)
        if (response.ok) {
          const data = await response.json()
          setHardwareCount(data.gateways_count)
        } else {
          console.error('Failed to fetch Gateway:', response.status, response.statusText)
        }
      } catch (error) {
        console.error('Error fetching Gateway count:', error)
      }
    }
    fetchTotalGatewayCount()
    const intervalId = setInterval(fetchTotalGatewayCount, 5000)
    return () => clearInterval(intervalId)
  }, [])

  // Fetch Aloted Hardware
  useEffect(() => {
    const fetchUserAlotedGateways = async () => {
      try {
        const response = await axios.get(urls.userAlotedGatewaysCount)
        setUserAlotedGatewaysCount(response.data.user_aloted_count)
      } catch (error) {
        console.error('Error in fetching user aloted gateways count', error)
      }
    }
    fetchUserAlotedGateways()
    const intervalId = setInterval(fetchUserAlotedGateways, 5000)
    return () => clearInterval(intervalId)
  }, [])

  // Fetch Deployed Hardware
  useEffect(() => {
    const fetchDeployedGatewayCount = async () => {
      try {
        const response = await fetch(urls.deployedGatewaysCount)
        if (response.ok) {
          const data = await response.json()
          setDeployedHardwareCount(data.deployed_gateways_count)
        } else {
          console.error('Failed to fetch Deployed Gateway:', response.status, response.statusText)
        }
      } catch (error) {
        console.error('Error fetching Deployed Gateway count:', error)
      }
    }
    fetchDeployedGatewayCount()
    const intervalId = setInterval(fetchDeployedGatewayCount, 5000)
    return () => clearInterval(intervalId)
  }, [])

  const fetchProjects = async () => {
    try {
      const response = await axios.get(urls.getUserProjects()); // Get URL from the helper
      console.log("USER projects:", response.data);

      setUserProjects(Array.isArray(response.data.project_managers) ? response.data.project_managers : []);
    } catch (error) {
      console.error("Error Fetching Projects", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []); 

  // Total Projects
  useEffect(() => {
    const fetchTotalProjectsCount = async () => {
      try {
        const response = await fetch(urls.totalProject)
        if (response.ok) {
          const data = await response.json()
          setTotalProjectsCount(data.total_project)
        } else {
          console.error('Failed to fetch Total Projects:', response.status, response.statusText)
          Alert.alert('Error', `Failed to fetch Total Projects count: ${response.status}`)
        }
      } catch (error) {
        console.error('Error fetching Total Projects count:', error)
        Alert.alert('Error', 'Unable to fetch Total Projects count. Please try again later.')
      } finally {
        setLoading(false)
      }
    }

    fetchTotalProjectsCount()
    const intervalId = setInterval(fetchTotalProjectsCount, 500)
    return () => clearInterval(intervalId)
  }, [])

  // Wlcm to {firstname of user}
  useEffect(() => {
    const getToalProject = async () => {
      const response = await axios.get(urls.getToalProject)
      const data = response.data.projects
      console.log('Projects:', data)
      setProjects(data)
    }

    getToalProject()
    const intervalId = setInterval(getToalProject, 5000)
    return () => clearInterval(intervalId)
  }, [])

  useEffect(() => {
    const getTotalUsergateways = async () => {
      try {
        const response = await axios.get(`${urls.fetchTotalUserGateways}?user_id=${getUserIdFromLocalStorage()}`);
        const data = response.data.gateways_count;
        console.log('Projects:', data);
        console.log('Fetching from url:', `${urls.userGateways}?user_id=${getUserIdFromLocalStorage()}`);

        setTotalUserGateways(data);
      } catch (error) {
        console.error('Error fetching user gateways:', error);
      }
    };
  
    getTotalUsergateways(); // Call it once initially
    const intervalId = setInterval(getTotalUsergateways, 5000); // Then every 5 seconds
  
    return () => clearInterval(intervalId); // Cleanup on unmount
  }, [getUserIdFromLocalStorage()]);
  

  const handleProjectClick = (project) => {
    setSelectedProject(project.name);
    
    // Store selected project ID in localStorage
    localStorage.setItem('selectedProjectId', project.PM_id);
  
    navigate('/dashboard/project_manager', {
      state: {
        projectName: project.name,
        projectId: project.PM_id,
        longitude: project.longitude,
        latitude: project.latitude,
        address: project.address,
      },
    });
  };

  useEffect(() => {
    const storedProjectId = localStorage.getItem('selectedProjectId');
    if (storedProjectId) {
      setSelectedProject(storedProjectId);
    }
  }, []);
  

  return (
    <Box sx={{ padding: 3 }}>
      {/* Dashboard Cards */}
      <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', justifyContent: 'center' }}>
      { role === 'admin' && <WidgetsDropdown
        title={loading ? 'Loading...' : totalUser}
        subtitle="Total Users"
        icon={<PeopleIcon fontSize="large" />}
        bgColor="linear-gradient(135deg,rgb(103, 182, 247),rgb(50, 120, 185))" // Blue
      />}
      { role === 'admin' &&
        <WidgetsDropdown
          title={loading ? 'Loading...' : hardwareCount}
          subtitle="Total Hardware"
          icon={<DevicesIcon fontSize="large" />}
          bgColor="linear-gradient(135deg,rgb(131, 219, 136), #43a047)" // Green
        />}
        {role === 'user' && (
  <WidgetsDropdown
    title={loading ? 'Loading...' : totalUserGateways}
    subtitle="Total Hardware"
    icon={<DevicesIcon fontSize="large" />}
    bgColor="linear-gradient(135deg, rgb(131, 219, 136), #43a047)" // Green
  />
)}
{role === 'admin' && (
        <WidgetsDropdown
          title={loading ? 'Loading...' : userAlotedGatewaysCount}
          subtitle="Aloted Hardware"
          icon={<CheckCircleIcon fontSize="large" />}
          bgColor="linear-gradient(135deg,rgb(248, 205, 141), #fb8c00)" // Orange
        />)}
 {role === 'user' && (
<WidgetsDropdown
          title={loading ? 'Loading...' : totalUserGateways}
          subtitle="Aloted Hardware"
          icon={<CheckCircleIcon fontSize="large" />}
          bgColor="linear-gradient(135deg,rgb(248, 205, 141), #fb8c00)" // Orange
        />)}
        <WidgetsDropdown
          title={loading ? 'Loading...' : deployedHardwareCount}
          subtitle="Deployed Hardware"
          icon={<CloudUploadIcon fontSize="large" />}
          bgColor="linear-gradient(135deg,rgb(187, 155, 243), #5e35b1)" // Purple
        />
        <WidgetsDropdown
          title={loading ? 'Loading...' : totalProjectsCount}
          subtitle="Total Projects"
          icon={<AssignmentIcon fontSize="large" />}
          bgColor="linear-gradient(135deg,rgb(250, 150, 148), #e53935)" // Red
        />
      </Box>
     
     <GraphContainer/>

      <Box sx={{  mt: 4 }}>
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 2,
            background: 'linear-gradient(135deg,rgb(103, 182, 247),rgb(50, 120, 185))',
            padding: '10px',
            borderRadius: ' 8px',
          }}
        >
          {/* Left: Heading */}
          <Typography variant="h5">User Projects</Typography>

          {/* Right: Search Bar */}
          <TextField
            variant="outlined"
            placeholder="Search User"
            size="small"
            sx={{
              width: '250px',
              background: theme.palette.background.paper,
              border: 'none',
              borderRadius: '4px',
            }}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
                     {role === 'user' && <AddProject />}
          
        </Box>
        {/* Table for displaying data */}
        {role === 'admin' &&
        <TableContainer component={Paper} sx={{ overflow: "visible" }}>
          <Table>
            <TableHead>
              <TableRow >
                <TableCell style={{ fontWeight: 'bold' }}>Project ID</TableCell>
                <TableCell style={{ fontWeight: 'bold' }}>Project Name</TableCell>
                <TableCell style={{ fontWeight: 'bold' }}>Username</TableCell>
                <TableCell style={{ fontWeight: 'bold' }}>Address</TableCell>
                
                <TableCell style={{ fontWeight: 'bold' }}>Status</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredProjects.map((project) => (
                <TableRow
                hover
                
                key={project.PM_id || index}
                onClick={() => handleProjectClick(project)}
                style={{ cursor: 'pointer', 
                  transition: "all 0.3s ease-in-out", // Smooth transition
                  borderRadius: "8px", // Rounded effect
                  overflow: "hidden", // Prevents content overflow
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "scale(1.02)";
                  e.currentTarget.style.boxShadow = "0px 4px 10px rgba(0, 0, 0, 0.2)";
                  e.currentTarget.style.backgroundColor = theme.palette.background.paper;
                }} // Expand with shadow effect
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "scale(1)";
                  e.currentTarget.style.boxShadow = "none";
                  e.currentTarget.style.backgroundColor = "transparent"; }}
                  
              >
                  <TableCell>{project.PM_id}</TableCell>
                  <TableCell>{project.name}</TableCell>
                  <TableCell>
  <Box display="flex" alignItems="center" gap={1}>
    <Avatar
      src={project.image} // use the base64 image here
      sx={{ width: 32, height: 32 }}
    >
      {project.user_firstname?.[0] || 'U'} {/* Fallback letter if image fails */}
    </Avatar>
    <Typography variant="body2">{project.user_firstname}</Typography>
  </Box>
</TableCell>
                  <TableCell>{project.address}</TableCell>
                  
                  <TableCell align="center">
                    {project.is_active ? (
                      <Button
                        variant="contained"
                        size="small"
                        sx={{
                          p: 0,
                          px: 1,
                          bgcolor: '#4EA44D',
                          color: 'white',
                          fontSize: '12px',
                          fontWeight: '600',
                        }}
                      >
                        Active
                      </Button>
                    ) : (
                      <Button
                        variant="contained"
                        size="small"
                        sx={{
                          p: 0,
                          px: 1,
                          bgcolor: 'red',
                          color: 'white',
                          fontSize: '12px',
                          fontWeight: '600',
                        }}
                      >
                        Inactive
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
        }

        {role === 'user' &&
        <TableContainer component={Paper} sx={{ overflow: "visible" }}>
                  <Table>
                    <TableHead>
                      <TableRow  >
                        <TableCell style={{ fontWeight: 'bold' }}>Project ID</TableCell>
                        <TableCell style={{ fontWeight: 'bold' }}>Project Name</TableCell>
                        <TableCell style={{ fontWeight: 'bold' }}>Address</TableCell>
                        <TableCell style={{ fontWeight: 'bold' }}>Connected Gateways</TableCell>
                        <TableCell style={{ fontWeight: 'bold' }}>Status</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {userProjects.map((project) => (
                        <TableRow
                        hover
                        key={project.PM_id || index}
                        onClick={() => handleProjectClick(project)}
                        style={{ cursor: 'pointer', 
                          transition: "all 0.3s ease-in-out", // Smooth transition
                          borderRadius: "8px", // Rounded effect
                          overflow: "hidden", // Prevents content overflow
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.transform = "scale(1.02)";
                          e.currentTarget.style.boxShadow = "0px 4px 10px rgba(0, 0, 0, 0.2)";
                          e.currentTarget.style.backgroundColor = theme.palette.background.paper;
                        }} // Expand with shadow effect
                        onMouseLeave={(e) => {
                          e.currentTarget.style.transform = "scale(1)";
                          e.currentTarget.style.boxShadow = "none";
                          e.currentTarget.style.backgroundColor = "transparent";  }}
                      >
                          <TableCell>{project.PM_id}</TableCell>
                          <TableCell>{project.name}</TableCell>
                          <TableCell>{project.address}</TableCell>
                          <TableCell>{project.connected_gateways.length}</TableCell>
                          <TableCell align="center">
                            {project.is_active ? (
                              <Button
                                variant="contained"
                                size="small"
                                sx={{
                                  p: 0,
                                  px: 1,
                                  bgcolor: '#4EA44D',
                                  color: 'white',
                                  fontSize: '12px',
                                  fontWeight: '600',
                                }}
                              >
                                Active
                              </Button>
                            ) : (
                              <Button
                                variant="contained"
                                size="small"
                                sx={{
                                  p: 0,
                                  px: 1,
                                  bgcolor: 'red',
                                  color: 'white',
                                  fontSize: '12px',
                                  fontWeight: '600',
                                }}
                              >
                                Inactive
                              </Button>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
        </TableContainer>
        }
      </Box>
    </Box>
  )
}

export default Dashboard
