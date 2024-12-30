import React from "react";
import StatBox from "../../components/StatBox";
import { useCallback ,useState , useEffect } from "react";
import { Box, Typography ,  useTheme} from "@mui/material";
import Header from "../../components/Header";
import { useLocation, useParams } from "react-router-dom";
import { tokens } from "../../theme";
import PeopleIcon from '@mui/icons-material/People';
import BoltIcon from '@mui/icons-material/Bolt';
import DeviceHubIcon from '@mui/icons-material/DeviceHub';
import SettingsInputComponentIcon from '@mui/icons-material/SettingsInputComponent';
import AutofpsSelectIcon from '@mui/icons-material/AutofpsSelect';
import axios from "axios";
import solarimage from '../../scenes/assets/solar.jpg'
import generator from '../../scenes/assets/generator.png'
import wapda from '../../scenes/assets/wapda.jpeg'
import gate from '../../scenes/assets/gate.png'
import analyzer from '../../scenes/assets/analyzer.jpg'
import HighChart from "../../components/HighChart";

const ProjectManager = () =>{
    const { project_id} = useParams();
    const location = useLocation();
    const { username , projectName } = location.state || {}
    const theme = useTheme();
    const colors = tokens(theme.palette.mode);
    const userId = JSON.parse(localStorage.getItem('user'))?.user_id;


    //hooks statbox
    const [totalUser ,setTotalUser] = useState(null)
    const [frequency , setFrequency] = useState(null)
    const [powerFactor, setPowerFactor] = useState(null);
    const [hardwareCount, setHardwareCount] = useState(null);
    const [connectedHardware, setConnectedHardware] = useState(null);

    //hooks chart
    const [currentData, setCurrentData] = useState([]);
    const [voltageData, setVoltageData] = useState([]);
    const [powerData, setPowerData] = useState([]);
    const [fromDate, setFromDate] = useState('');
    const [toDate, setToDate] = useState('');

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




 

    //fetching the count of total users
    useEffect(()=>{
        const fetchUserCount = async ()=>{
            try {
                const response = await axios.get('http://192.168.68.226:8000/user_count/');
                setTotalUser(response.data.total_users)
            }catch (error){
                console.error('Error in fetching users')
            }

        }
        fetchUserCount()
        const intervalId = setInterval(fetchUserCount , 5000);
        return ()=> clearInterval(intervalId)
    },[])

    //fetching the frequency & power factor
    useEffect(()=>{
        const fetchProjectData = async() =>{
            try{
                const response = await axios.get(`http://192.168.68.226:8000/get_latest_project_data?user_id=${userId}`);
                const {frequency , power_factor} = response.data
                setFrequency(frequency);
                setPowerFactor(power_factor);
            }catch (error) {
                console.error('There was error in fetching frequency and power factor')
            }
        };fetchProjectData()
        const intervalId = setInterval(fetchProjectData , 5000);
        return ()=> clearInterval(intervalId)
    },[userId])


    //fetching hardware count
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


      
      //fetching connected hardware count
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
    

    return(
        <Box m='20px'>
            <Box>
            <Header 
                title="Project Details" 
                subtitle={projectName ? projectName : "No Project Name"} 
            />
            </Box>
            <Box 
                display="grid"
                gridTemplateColumns="repeat(12, 1fr)"
                gridAutoRows="auto"
                gap="60px"
            >
                <Box gridColumn="span 2" backgroundColor={colors.primary[400]} display="flex" justifyContent="center" alignItems="center" p="20px">
                <StatBox title={totalUser || '000'} subtitle="Total Users" icon={<PeopleIcon sx={{ color: colors.greenAccent[600], fontSize: "26px" }} />} />
                </Box>
                <Box gridColumn="span 2" backgroundColor={colors.primary[400]} display="flex" justifyContent="center" alignItems="center" p="20px">
                <StatBox title={`${frequency || '0.00'} Hz`} subtitle="Frequency" icon={<AutofpsSelectIcon sx={{ color: colors.greenAccent[600], fontSize: "26px" }} />} />
                </Box>
                <Box gridColumn="span 2" backgroundColor={colors.primary[400]} display="flex" justifyContent="center" alignItems="center" p="20px">
                <StatBox title={`${powerFactor || '0.00'} W`} subtitle="Power Factor" icon={<BoltIcon sx={{ color: colors.greenAccent[600], fontSize: "26px" }} />} />
                </Box>
                <Box gridColumn="span 2" backgroundColor={colors.primary[400]} display="flex" justifyContent="center" alignItems="center" p="20px">
                <StatBox title={hardwareCount || '0.00'} subtitle="Total Hardware" icon={<DeviceHubIcon sx={{ color: colors.greenAccent[600], fontSize: "26px" }} />} />
                </Box>
                <Box gridColumn="span 2" backgroundColor={colors.primary[400]} display="flex" justifyContent="center" alignItems="center" p="20px">
                <StatBox title={connectedHardware || '0.00'} subtitle="Connected Hardware" icon={<SettingsInputComponentIcon sx={{ color: colors.greenAccent[600], fontSize: "26px" }} />} />
                </Box>
            </Box>
            <div class="row" style={{margin:'30px'}}>
              <div className="row1" style={{display: 'flex' , flexDirection: 'row' , justifyContent: 'space-around'}}>
              <div class="column">
              <img src={solarimage} style={{ width: '180px', height: '180px' }} alt="solar" />
              </div>
              <div class="column">
              <img src={generator} style={{ width: '180px', height: '180px' }} alt="generator" />
              </div>
              </div>

              <div className="row2" style={{justifyContent: 'center', alignItems: 'center', display: 'flex'}}>
              <div class="column">
              <img src={analyzer} style={{ width: '180px', height: '180px' }} alt="analyzer" />
              </div>
              </div>

              <div className="row3" style={{display: 'flex' , flexDirection: 'row' , justifyContent: 'space-around'}}>
              <div class="column">
              <img src={wapda} style={{ width: '180px', height: '180px' }} alt="wapda" />
              </div>
              <div class="column" >
              <img src={gate} style={{ width: '180px', height: '180px' }} alt="gate" />
              </div>
              </div>
              
            </div>
            <Box gridColumn="span 12" backgroundColor={colors.primary[400]} p="20px" mb="30px">
          <HighChart title="Current Data" data={currentData} />
        </Box>

        <Box gridColumn="span 12" backgroundColor={colors.primary[400]} p="20px" mb="30px">
          <HighChart title="Voltage Data" data={voltageData} />
        </Box>

        <Box gridColumn="span 12" backgroundColor={colors.primary[400]} p="20px" mb="30px">
          <HighChart title="power Data" data={powerData} />
        </Box>




         </Box>
        

    )

};
 export default ProjectManager