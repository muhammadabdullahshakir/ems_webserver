import React, { useState, useEffect } from "react";
import {
  Box,
  Dialog,
  IconButton,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  Typography,
  Button,
  useTheme,
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import { tokens } from "../../theme";
import Header from "../../components/Header";
import axios from "axios";
import AddCircleIcon from '@mui/icons-material/AddCircle';
import { useNavigate } from "react-router-dom"; // Import React Router's useNavigate

const ProjectTable = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const navigate = useNavigate(); // Initialize useNavigate for navigation

  const [projects, setProjects] = useState([]);
  const [openCreate, setOpenCreate] = useState(false);
  const [formValuesCreate, setFormValuesCreate] = useState({
    name: "",
  });

  const loggedInUser = JSON.parse(localStorage.getItem('user'));

  useEffect(() => {
    const fetchUserProjects = async () => {
      try {
        const response = await axios.post(
          "http://192.168.68.226:8000/Fetch_Projects/",
          { user_id: loggedInUser.user_id },
          {
            headers: {
              "Content-Type": "application/json",
            },
          }
        );

        setProjects(response.data);
        console.log("Fetched Projects:", response.data);
      } catch (error) {
        console.error("Error fetching projects:", error.response?.data || error.message);
      }
    };

    if (loggedInUser?.user_id) {
      fetchUserProjects();
    }
  }, [loggedInUser]);

  const handleCreateProject = async () => {
    const projectData = {
      name: formValuesCreate.name,
      user_id: loggedInUser?.user_id,
    };

    try {
      const response = await axios.post(
        "http://192.168.68.226:8000/create_project_manager/",
        projectData,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (response.status === 200) {
        const newProject = {
          project_id: response.data.ID,
          name: formValuesCreate.name,
          user: loggedInUser
        };

        setProjects((prevProjects) => [...prevProjects, newProject]);
        setOpenCreate(false);
        setFormValuesCreate({ name: "" });
      }
    } catch (error) {
      console.error("Error creating project:", error.response?.data || error.message);
    }
  };

  const handleCreateInputChange = (e) => {
    const { name, value } = e.target;
    setFormValuesCreate({ ...formValuesCreate, [name]: value });
  };

  // Define the columns
  const columns = [
    { field: "project_id", headerName: "Project ID", flex: 1 },
    { field: "name", headerName: "Project Name", flex: 1 },
    {
      field: "user",
      headerName: "Username",
      flex: 1,
      height:'100%',
      renderCell: (params) => (
        <Typography>
          {`${params.row.user.firstname} ${params.row.user.lastname}`}
        </Typography>
      ),
    },
  ];

  // Handle row click event
  const handleRowClick = (params) => {
    navigate(`/projectmanager/${params.row.project_id}`,{
      state:{
        username : `${params.row.user.firstname} ${params.row.user.lastname}`,
        projectName : `${params.row.name}`
      }
    }
    
    );
  };
  return (
    <Box m="20px" height="100vh">
      <Box display="flex" justifyContent="space-between" alignItems="center">
        <Box>
          <Header title="Projects" subtitle="Managing the Projects" />
        </Box>
        <Box display="flex" flexDirection="column" alignItems="center">
          <IconButton
            color="#141b2d"
            onClick={() => setOpenCreate(true)}
            sx={{
              color: "#4cceac",
              fontSize: 45,
              '&:hover': {
                color: '#fff',
              },
            }}
          >
            <AddCircleIcon fontSize="inherit" />
          </IconButton>
          <Typography variant="h1" sx={{ marginTop: '2px', fontSize: '15px' }}>Create Project</Typography>
        </Box>
      </Box>

      {/* DataGrid to display all projects */}
      <Box mt="20px" sx={{ height: 'calc(100% - 80px)', overflow: 'auto' }}>
        {projects.length > 0 ? (
          <DataGrid
            rows={projects}
            columns={columns}
            pageSize={5}
            getRowId={(row) => row.project_id}
            autoHeight
            sx={{
              '& .MuiDataGrid-root': {
                minHeight: '400px', // Minimum height for the DataGrid
                overflowY: 'auto', // Enable vertical scrolling
              },
            }}
            onRowClick={handleRowClick} // Add row click handler
          />
        ) : (
          <Typography variant="h6">No Projects Found</Typography>
        )}
      </Box>

      {/* Create Project Dialog */}
      <Dialog open={openCreate} onClose={() => setOpenCreate(false)}>
        <DialogTitle>Create Project</DialogTitle>
        <DialogContent>
          <TextField
            margin="dense"
            label="Project Name"
            name="name"
            value={formValuesCreate.name}
            onChange={handleCreateInputChange}
            fullWidth
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenCreate(false)}>Cancel</Button>
          <Button onClick={handleCreateProject}>Create</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ProjectTable;
