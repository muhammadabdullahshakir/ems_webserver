import React from 'react'
import {
  
  Typography,
  Box,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  ListItem,
  ListItemText,
  List,
  DialogActions,
  useTheme,
} from '@mui/material'
import { useState, useEffect } from 'react'
import axios from 'axios'
import urls from '../../urls/urls'
import { left } from '@popperjs/core'
import { AddRounded } from '@mui/icons-material'
import { useLocation } from 'react-router-dom'


const DeployGateway = () => {
  const location = useLocation()
  
   const project_id = location.state?.projectId || ''


   const [userGateways, setUserGateways] = useState([]);
   const [openGatewayPop, setOpenGatewayPop] = useState(false);
   const loggedInUser = JSON.parse(localStorage.getItem("user"));
   const userId = loggedInUser?.user_id;
   const [loading, setLoading] = useState(false);
   const [selectGateway, setSelectGateway] = useState(null);
   const [currentProjectId, setCurrentProjectId] = useState(null);
     const theme = useTheme()
   
  useEffect(() => {
    setCurrentProjectId(project_id); // Now contains the correct ID
  }, [project_id]);

  useEffect(() => {
    console.log("Selected Gateway:", selectGateway);
  }, [selectGateway]);

 // fetching gateway of user with whole data and empty coms and show in list user gateways list
   const [userListGateways, setUserListGateways] = useState([])
   console.log("Listttt:", userListGateways)
   const fetchGateways = async () => {
     setLoading(true);
     try {
       const response = await fetch(`${urls.userlistGateways}?user_id=${userId}`);
       const data = await response.json();
       setUserListGateways(data.Gateways || []);  // ✅ Extract the array
       console.log("Gateways Data:", data.Gateways);
 
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
     console.log("fetcgateway", fetchGateways)
   }, [userId]);
 

     const handleDeploy = async () => {
        if (!selectGateway || !currentProjectId) return;
    
        try {
          const gatewayData = {
            G_id: selectGateway.G_id,
            deploy_status: "deployed",
            project_id: currentProjectId,
          };
    
          const response = await fetch(`${urls.updateGateway}`, {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(gatewayData),
          });
    
          if (response.ok) {
            await fetchGateways(); // Refresh the list after successful deployment
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

        const handleGatewayPopOpen = () => {
          fetchGateways(); // Refresh data when opening dialog
          setOpenGatewayPop(true);
        };
      
      
        const handleGatewayPopClose = () => {
          setOpenGatewayPop(false); // Close the dialog
        };
      
        useEffect(() => {
          if (openGatewayPop) {
            const interval = setInterval(fetchGateways, 5000);
            return () => clearInterval(interval);
          }
        }, [openGatewayPop]);
      
      
  

  return (
    <Box sx={{}}>
                    <Button
                      onClick={handleGatewayPopOpen}
                      sx={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        gap: "8px",
                        padding: "10px",
                        backgroundColor: "rgba(79, 77, 77, 0.2)", // semi-transparent background
                        backdropFilter: "blur(15px)", // creates the blur effect
                        borderRadius: "4px", // rounded corners for a smoother look
                        boxShadow: "0px 4px 6px rgba(0, 0, 0, 0)", // optional shadow for depth
                      }}
                    >
                      <AddRounded sx={{ color: "white" }} aria-label="add_project" />
                      <Typography sx={{ color: "white", fontSize: "14px", fontWeight: 600 }}>
                        Deploy Gateway
                      </Typography>
                    </Button>
    
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
                          // backgroundColor: colors.primary[400],
                          boxShadow: "none",
                        },
                      }}
                    >
                      <DialogTitle>Gateways Assigned</DialogTitle>
                      
                      <DialogContent>
                  {loading && <Typography>Loading...</Typography>}
                  {!loading && userListGateways.length > 0 && (
                    <List>
                      {userListGateways.map((gateway) => (
                       <ListItem
                       key={gateway.G_id}
                       sx={{
                         cursor: gateway.deploy_status === "Deployed to User" ? "not-allowed" : "pointer",
                         backgroundColor: selectGateway?.G_id === gateway.G_id
                           ? "rgb(102, 125, 187)" // Highlight selected item
                           : theme.palette.background.paper, // Default background
                         color: "#fff",
                         marginBottom: "5px",
                         borderRadius: "8px",
                         padding: "10px",
                         opacity: gateway.deploy_status === "Deployed to User" ? 0.5 : 1, // Reduce opacity for deployed items
                         pointerEvents: gateway.deploy_status === "Deployed to User" ? "none" : "auto",
                         "&:hover": gateway.deploy_status !== "Deployed to User" ? { backgroundColor: "rgb(102, 125, 187)" } : {}, // Remove hover effect if deployed
                       }}
                       onClick={() => {
                         if (gateway.deploy_status !== "Deployed to User") {
                           handleGatewayClick(gateway);
                         }
                       }}
                     >
                       <ListItemText
                         sx={{ color: theme.palette.text.primary }}
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
                              variant="contained"
                              sx={{
                               
                                color: "white",
                              }}
                            >
                              Deploy
                            </Button>
                          )}
                      </DialogActions>
                    </Dialog>
                  </Box>
  )
}

export default DeployGateway
