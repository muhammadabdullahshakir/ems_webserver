import React, { useState, useEffect, useContext } from "react";
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
import AddCircleIcon from "@mui/icons-material/AddCircle";
import { useParams, useNavigate } from "react-router-dom";
import urls from "../urls/urls";
import { ColorContext } from "../../components/ColorContext";

const fetchProjects = (role, user_id) => {
  if (role === "user") {
    return axios
      .get(urls.geUserProjects(user_id), {
        headers: { "Content-Type": "application/json" },
      })
      .then((response) => {
        console.log("User Projects Response:", response.data);
        if (response.data && response.data.project_managers) {
          return response.data.project_managers;
        } else {
          console.error("No projects found for user.");
          return [];
        }
      })
      .catch((error) => {
        console.error("Error fetching user projects:", error);
        throw error;
      });
  } else if (role === "admin") {
    return axios
      .get(urls.getToalProject, {
        headers: { "Content-Type": "application/json" },
      })
      .then((response) => {
        console.log("Admin Projects Response:", response.data);
        if (response.data && response.data.projects) {
          return response.data.projects;
        } else {
          console.error("No projects found for admin.");
          return [];
        }
      })
      .catch((error) => {
        console.error("Error fetching total projects for admin:", error);
        throw error;
      });
  } else {
    console.error("Invalid role provided.");
    return [];
  }
};

const ProjectTable = () => {
  const theme = useTheme();
  const { userId } = useParams();

  const { selectedColor } = useContext(ColorContext);

  // Define the color options
  const colorOptions = {
    blue1000: "linear-gradient(195deg, rgb(73, 163, 241), rgb(26, 115, 232))",
    orange1000: "linear-gradient(195deg, rgb(255, 145, 52), rgb(255, 105, 0))",
    red1000: "linear-gradient(195deg, rgb(242, 85, 96), rgb(212, 41, 56))",
  };

  const colors = tokens(theme.palette.mode);
  const navigate = useNavigate();

  const [projects, setProjects] = useState([]);
  const [openCreate, setOpenCreate] = useState(false);
  const [formValuesCreate, setFormValuesCreate] = useState({
    name: "",
    longitude: "",
    latitude: "",
    address: "",
  });

  const loggedInUser = JSON.parse(localStorage.getItem("user"));
  const user_id = loggedInUser?.user_id;
  const role = loggedInUser?.role;

  const handleCreateInputChange = (e) => {
    const { name, value } = e.target;
    setFormValuesCreate({
      ...formValuesCreate,
      [name]: value,
    });
  };

  const handleCreateProjectWithGateways = async () => {
    const { name, longitude, latitude, address } = formValuesCreate;

    // Basic validation (you can extend this)
    if (!name || !longitude || !latitude || !address) {
      alert(
        "Please fill in all required fields and select at least one gateway."
      );
      return;
    }

    const projectData = {
      name,
      longitude,
      latitude,
      address,
      user_id: user_id,
    };

    try {
      const response = await axios.post(`${urls.createProject}`, projectData);

      if (response.status === 200 || response.status === 201) {
        setOpenCreate(false);

        setFormValuesCreate({
          name: "",
          longitude: "",
          latitude: "",
          address: "",
        });

        fetchProjects();
      } else {
        console.error(
          "Failed to create project. Status code:",
          response.status
        );
      }
    } catch (error) {
      console.error(
        "Error creating project:",
        error.response?.data || error.message
      );
    }
  };

  useEffect(() => {
    const fetchAllProject = async () => {
      try {
        const response = await fetchProjects(role, user_id);

        if (role === "user") {
          setProjects(response || []);
        } else if (role === "admin") {
          setProjects(response || []);
        }
      } catch (error) {
        console.error(
          "Error fetching projects:",
          error.response?.data || error.message
        );
      }
    };

    if (user_id) {
      fetchAllProject();
    }

    const intervalId = setInterval(fetchAllProject, 500);

    return () => clearInterval(intervalId);
  }, [role, user_id]);

  const columns = [
    { field: "PM_id", headerName: "Project ID", flex: 1 },
    { field: "name", headerName: "Project Name", flex: 1 },
    ...(role === "admin"
      ? [
          {
            field: "user",
            headerName: "Username",
            flex: 1,
            renderCell: (params) => {
              const firstname = params.row.user_firstname;
              const lastname = params.row.user_lastname;
              return (
                <Box display="flex" alignItems="center" height="100%">
                  <Typography>
                    {firstname && lastname
                      ? `${firstname} ${lastname}`
                      : "No User Assigned"}
                  </Typography>
                </Box>
              );
            },
          },
        ]
      : []),

    { field: "longitude", headerName: "Longitude", flex: 1 },
    { field: "latitude", headerName: "Latitude", flex: 1 },
    { field: "address", headerName: "Address", flex: 1 },
  ];

  const handleRowClick = async (params) => {
    const project_id = params.row.PM_id;
    const owner_user_id = params.row.user_id;

    const navigateTo = `/projectmanager/${project_id}`;

    navigate(navigateTo, {
      state: {
        project_id,
        username: params.row.user
          ? `${params.row.user.firstname} ${params.row.user.lastname}`
          : "No User Assigned",
        projectName: params.row.name,
        user_id: owner_user_id,
        role,
      },
    });
  };

  return (
    <Box m="20px" height="100vh">
      <Box display="flex" justifyContent="space-between" alignItems="center">
        <Header title="Projects" subtitle="Managing the Projects" />
        {role === "user" && (
          <Box display="flex" flexDirection="column" alignItems="center">
            <IconButton
              color="inherit"
              onClick={() => setOpenCreate(true)}
              sx={{
                color: colorOptions[selectedColor],
                fontSize: 45,
              }}
            >
              <AddCircleIcon fontSize="inherit" />
            </IconButton>
            <Typography sx={{ marginTop: "2px", fontSize: "15px" }}>
              Create Project
            </Typography>
          </Box>
        )}
      </Box>

      <Box
        m="40px 0 0 0"
        sx={{
          height: "calc(100vh - 40px)",
          "& .MuiDataGrid-root": { border: "none" },
          "& .MuiDataGrid-columnHeaders": {
            backgroundColor: colors.blueAccent[700],
          },
          "& .MuiDataGrid-virtualScroller": {
            backgroundColor: colors.primary[400],
          },
        }}
      >
        {projects.length > 0 ? (
          <DataGrid
            rows={projects}
            columns={columns}
            pageSize={5}
            getRowId={(row) => row.PM_id}
            autoHeight
            checkboxSelection
            onRowClick={handleRowClick}
          />
        ) : (
          <Typography variant="h3">
            No Projects Found! Create Project
          </Typography>
        )}
      </Box>

      <Dialog open={openCreate} onClose={() => setOpenCreate(false)}>
        <DialogTitle>Create Project</DialogTitle>
        <DialogContent>
          {/* Input fields */}
          {["name", "longitude", "latitude", "address"].map((field) => (
            <TextField
              key={field}
              margin="dense"
              label={field.charAt(0).toUpperCase() + field.slice(1)}
              name={field}
              value={formValuesCreate[field]}
              onChange={handleCreateInputChange}
              fullWidth
            />
          ))}
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setOpenCreate(false)}
            sx={{ color: colors.greenAccent[400] }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleCreateProjectWithGateways}
            sx={{ color: colors.greenAccent[400] }}
          >
            Create
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ProjectTable;
