import React, { useState, useEffect, useContext } from "react";
import {
  Box,
  IconButton,
  useTheme,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  Button,
  Typography,
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import { tokens } from "../../theme";
import Header from "../../components/Header";
import axios from "axios";
import AddCircleIcon from "@mui/icons-material/AddCircle";
import urls from "../urls/urls";
import { ColorContext } from "../../components/ColorContext";

const HardwareTable = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  const { selectedColor } = useContext(ColorContext);


  // Define the color options
  const colorOptions = {
    blue1000: "linear-gradient(195deg, rgb(73, 163, 241), rgb(26, 115, 232))",
    orange1000: "linear-gradient(195deg, rgb(255, 145, 52), rgb(255, 105, 0))",
    red1000: "linear-gradient(195deg, rgb(242, 85, 96), rgb(212, 41, 56))",
  };

  const [gateways, setGateways] = useState([]);
  const [open, setOpen] = useState(false);
  const [formValues, setFormValues] = useState({
    gateway_name: "",
    mac_address: "",
    status: false,
    deploy_status: "Warehouse",
    config: false,
  });

  const fetchAllHardware = async () => {
    try {
      const response = await axios.get(urls.totalGateways);
      const transformedHardware = response.data.Gateways.map((item) => {
        let deployStatus = "Warehouse"; 
        
        if (item.deploy_status === "user_aloted") {
          deployStatus = "Assigned to User";
        } else if (item.deploy_status === "Warehouse") {
          deployStatus = "Warehouse";
        } else if (item.deploy_status === "deployed") {
          deployStatus = "Deployed to User";
        }

      
        const status = item.status;  

        return {
          id: item.G_id, 
          gateway_name: item.gateway_name,
          mac_address: item.mac_address,
          status: status, 
          deploy_status: deployStatus, 
          config: item.config,
        };
        
      });

      setGateways(transformedHardware);  
    } catch (error) {
      console.error("Error fetching gateway:", error);
    }
  };




  useEffect(() => {
    fetchAllHardware();
    const intervalId = setInterval(fetchAllHardware, 500);
    return () => clearInterval(intervalId);
  }, []);
  
  
  
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormValues((prevValues) => ({
      ...prevValues,
      [name]: value,
    }));
  };

  
  const handleCreate = () => {
    setFormValues({
      gateway_name: "",
      mac_address: "",
      status: false,
      deploy_status: "Warehouse",
      config: false,
    });
    setOpen(true);
  };

  
  const handleSave = async () => {
    if (!formValues.gateway_name || !formValues.mac_address) {
      alert("Please fill in all required fields.");
      return;
    }

    try {
      const dataToSend = {
        gateway_name: formValues.gateway_name,
        mac_address: formValues.mac_address,
        status: formValues.status,
        deploy_status: formValues.deploy_status,
        config: formValues.config,
      };

      const response = await axios.post(urls.createGateway, dataToSend, {
        headers: {
          "Content-Type": "application/json",
        },
      });
      setOpen(false)

  
      await fetchAllHardware(); 

      // setOpen(false); 
    } catch (error) {
      console.error("Error creating gateway:", error);
    }
  };

  
  const handleClose = () => {
    setOpen(false);
  };

  const columns = [
    { field: "id", headerName: "ID", flex: 1 },
    { field: "gateway_name", headerName: "Name", flex: 1 },
    { field: "mac_address", headerName: "MAC Address", flex: 1 },
    {
      field: "status",
      headerName: "Status",
      flex: 1,
      renderCell: (params) => {
        let color = "red"; 
        if (params.row.deploy_status === "Deployed to User") {
          color = "green";
        } else if (params.row.deploy_status === "Assigned to User") {
          color = "blue";
        }
    
        return (
          <Box
            sx={{
              height: 12,
              width: 12,
              borderRadius: "50%",
              backgroundColor: color, 
              marginLeft: 1,
              marginTop: 2.5,
            }}
          />
        );
      },
    },
    
    { field: "deploy_status", headerName: "Deploy Status", flex: 1 },
    { field: "config", headerName: "Config", flex: 1 },
  ];

  return (
    <Box m="20px">
      <Box display="flex" justifyContent="space-between" alignItems="center">
        <Header title="HARDWARE" subtitle="Managing the Hardware" />
        <IconButton
          color="inherit"
          onClick={handleCreate}
          sx={{
            color: colorOptions[selectedColor],
            paddingRight: 3,
            fontSize: 50,
            "&:hover": {
              color: "#fff",
            },
          }}
        >
          <AddCircleIcon fontSize="inherit" />
        </IconButton>
      </Box>
      <Typography
        variant="h1"
        sx={{ marginTop: "2px", fontSize: "15px", textAlign: "right" }}
      >
        Create Hardware
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
          "& .MuiDataGrid-columnHeaders": {
            backgroundColor: colors.blueAccent[700],
            borderBottom: "none",
          },
          "& .MuiDataGrid-virtualScroller": {
            backgroundColor: colors.primary[400],
          },
          "& .MuiDataGrid-footerContainer": {
            borderTop: "none",
            backgroundColor: colors.greenAccent[700],
          },
          "& .MuiCheckbox-root": {
            color: `${colors.greenAccent[200]} !important`,
          },
        }}
      >
        <DataGrid rows={gateways} columns={columns} />
      </Box>

      {/* Create Dialog */}
      <Dialog open={open}
       onClose={handleClose}
       PaperProps={{
        style:{
          backgroundColor:colors.primary[400]

        }
       }}
       >
        <DialogTitle>Create Gateway</DialogTitle>
        <DialogContent>
          <TextField
            margin="dense"
            name="gateway_name"
            label="Gateway Name"
            type="text"
            fullWidth
            variant="outlined"
            value={formValues.gateway_name}
            onChange={handleInputChange}
          />
          <TextField
            margin="dense"
            name="mac_address"
            label="MAC Address"
            type="text"
            fullWidth
            variant="outlined"
            value={formValues.mac_address}
            onChange={handleInputChange}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} color="primary"  sx={{color:colors.greenAccent[400]}}>
            Cancel
          </Button>
          <Button onClick={handleSave} color="primary" sx={{color:colors.greenAccent[400]}}>
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default HardwareTable;
