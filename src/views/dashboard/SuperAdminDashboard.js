import React, { useEffect, useState } from 'react'
import {
  Box,
  TableContainer,
  Paper,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Avatar,
  TextField,
  Typography,
  useTheme,
} from '@mui/material'
import PeopleIcon from '@mui/icons-material/People'
import DevicesIcon from '@mui/icons-material/Devices'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import CloudUploadIcon from '@mui/icons-material/CloudUpload'
import AssignmentIcon from '@mui/icons-material/Assignment'
import WidgetsDropdown from './../widgets/WidgetsDropdown'
import axios from 'axios'
import urls from '../../urls/urls'

const DashBoard = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const theme = useTheme()
  const [loading, setLoading] = useState(true)
  const [userAlotedGatewaysCount, setUserAlotedGatewaysCount] = useState(0)
  const [deployedHardwareCount, setDeployedHardwareCount] = useState(0)
  const [hardwareCount, setHardwareCount] = useState(0)
  const [totalUser, setTotalUsers] = useState([])
  const [totalAdmins, setTotalAdmins] = useState([])
  const [adminDetails, setAdminDetails] = useState([]);


  const dummyData = [
    { id: 1, username: 'JohnDoe', email: 'johndoe@example.com', totalUsers: 50, totalProjects: 10 },
    {
      id: 2,
      username: 'JaneSmith',
      email: 'janesmith@example.com',
      totalUsers: 75,
      totalProjects: 15,
    },
    {
      id: 3,
      username: 'MikeBrown',
      email: 'mikebrown@example.com',
      totalUsers: 30,
      totalProjects: 5,
    },
    {
      id: 4,
      username: 'EmilyClark',
      email: 'emilyclark@example.com',
      totalUsers: 60,
      totalProjects: 12,
    },
    {
      id: 5,
      username: 'DavidWilson',
      email: 'davidwilson@example.com',
      totalUsers: 90,
      totalProjects: 20,
    },
  ]

  const filteredData = dummyData.filter(
    (data) =>
      data.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      data.email.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  useEffect(() => {
    const fetchAdminDetails = async () => {
      try {
        const response = await axios.get(urls.adminDetails);
        if (response.data) {
          setAdminDetails(response.data); // Response is already an array
        }
      } catch (error) {
        console.error('Error fetching admin details:', error);
      }
    };
  
    fetchAdminDetails();
  }, []);
  


  // Fetch Total Admins
  useEffect(() => {
    const fetchTotalAdmins = async () => {
      try {
        const response = await fetch(urls.adminCount)
        if (response.ok) {
          const data = await response.json()
          setTotalAdmins(data.admin_users)
        } else {
          console.error('Failed to fetch user count:', response.status, response.statusText)
        }
      } catch (error) {
        console.error('Error fetching user count:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchTotalAdmins()
    const intervalId = setInterval(fetchTotalAdmins, 5000)
    return () => clearInterval(intervalId)
  }, [])


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

  // Fetch Aloted Hardware
  useEffect(() => {
    const fetchUserAlotedGateways = async () => {
      try {
        const response = await axios.get(urls.userAlotedGatewaysCount)
        setUserAlotedGatewaysCount(response.data.user_aloted_count)
      } catch (error) {
        console.error('Error in fetching user aloted gateways count', error)
      } finally {
        setLoading(false)
      }
    }
    fetchUserAlotedGateways()
    const intervalId = setInterval(fetchUserAlotedGateways, 5000)
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

  return (
    <Box sx={{ padding: 3 }}>
      <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', justifyContent: 'center' }}>
        <WidgetsDropdown
          title={loading ? 'Loading...' : totalAdmins}
          subtitle="Total Admin"
          icon={<PeopleIcon fontSize="large" />}
          bgColor="linear-gradient(135deg, #000000, #1a1a1a, #333333);
"
        />
        <WidgetsDropdown
          title={loading ? 'Loading...' : totalUser}
          subtitle="Total Users"
          icon={<PeopleIcon fontSize="large" />}
          bgColor="linear-gradient(135deg,rgb(103, 182, 247),rgb(50, 120, 185))" // Blue
        />
        <WidgetsDropdown
          title={loading ? 'Loading...' : userAlotedGatewaysCount}
          subtitle="Aloted Hardware"
          icon={<CheckCircleIcon fontSize="large" />}
          bgColor="linear-gradient(135deg,rgb(248, 205, 141), #fb8c00)" // Orange
        />
        <WidgetsDropdown
          title={loading ? 'Loading...' : deployedHardwareCount}
          subtitle="Deployed Hardware"
          icon={<CloudUploadIcon fontSize="large" />}
          bgColor="linear-gradient(135deg,rgb(187, 155, 243), #5e35b1)" // Purple
        />
        <WidgetsDropdown
          title={loading ? 'Loading...' : hardwareCount}
          subtitle="Total Hardware"
          icon={<DevicesIcon fontSize="large" />}
          bgColor="linear-gradient(135deg,rgb(131, 219, 136), #43a047)" // Green
        />
        <WidgetsDropdown
          title="20"
          subtitle="Total Projects"
          icon={<AssignmentIcon fontSize="large" />}
          bgColor="linear-gradient(135deg,rgb(250, 150, 148), #e53935)"
        />
      </Box>

      <Box sx={{ mt: 4 }}>
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
          <Typography variant="h5">Admin Details</Typography>

          {/* Right: Search Bar */}
          <TextField
            variant="outlined"
            placeholder="Search "
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
        </Box>
        <TableContainer component={Paper}>
  <Table>
    <TableHead>
      <TableRow>
        <TableCell style={{ fontWeight: 'bold' }}>Username</TableCell>
        <TableCell style={{ fontWeight: 'bold' }}>Email</TableCell>
        <TableCell style={{ fontWeight: 'bold' }}>Total Users</TableCell>
        <TableCell style={{ fontWeight: 'bold' }}>Total Projects</TableCell>
      </TableRow>
    </TableHead>
    <TableBody>
      {adminDetails.map((admin) => (
        <TableRow key={admin.id}>
         <TableCell>{admin.username}</TableCell>
      <TableCell>{admin.email}</TableCell>
      <TableCell>{admin.totalUsers}</TableCell> {/* Corrected */}
      <TableCell>{admin.totalProjects}</TableCell>
        </TableRow>
      ))}
    </TableBody>
  </Table>
</TableContainer>

      </Box>
    </Box>
  )
}

export default DashBoard
