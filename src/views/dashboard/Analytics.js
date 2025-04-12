import React, { useState } from 'react'
import WidgetsDropdown from '../widgets/WidgetsDropdown'
import PeopleIcon from '@mui/icons-material/People'
import DevicesIcon from '@mui/icons-material/Devices'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import CloudUploadIcon from '@mui/icons-material/CloudUpload'
import AssignmentIcon from '@mui/icons-material/Assignment'
import GraphContainer from '../../components/GraphContainer'
import { Box } from '@mui/material'


const analytics = () => {
    const [loading, setLoading] = useState(true)
  



  return (
    <Box sx={{ padding: 3 }}>
          {/* Dashboard Cards */}
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', justifyContent: 'center' }}>
          
            <WidgetsDropdown
              title={loading ? 'Loading...' : hardwareCount}
              subtitle="Total Hardware"
              icon={<DevicesIcon fontSize="large" />}
              bgColor="linear-gradient(135deg,rgb(131, 219, 136), #43a047)" // Green
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
              title={loading ? 'Loading...' : totalProjectsCount}
              subtitle="Total Projects"
              icon={<AssignmentIcon fontSize="large" />}
              bgColor="linear-gradient(135deg,rgb(250, 150, 148), #e53935)" // Red
            />
          </Box>
         
         <GraphContainer/>

         </Box>
         


  )
}

export default analytics
