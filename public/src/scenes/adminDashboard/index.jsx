import React, { useEffect, useState } from "react";
import Header from "../../components/Header";
import {
  Box,
  IconButton,
  Typography,
  useTheme,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  TextField,
  Select,
  MenuItem,
  DialogActions,
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import { tokens } from "../../theme";
import StatBox from "../../components/StatBox";
import PeopleIcon from "@mui/icons-material/People";
import DeviceHubIcon from "@mui/icons-material/DeviceHub";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import AddCircleIcon from "@mui/icons-material/AddCircle";
import UsbIcon from "@mui/icons-material/Usb";
import FeaturedPlayListIcon from "@mui/icons-material/FeaturedPlayList";
import FeedIcon from "@mui/icons-material/Feed";
import BugReportIcon from "@mui/icons-material/BugReport";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const AdminDashboard = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const navigate = useNavigate();

  // User Management Logic from `Team`
  const [user, setUser] = useState([]);

  // Editing user hook
  const [open, setOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState({});
  const [formData, setFormData] = useState({
    firstname: "",
    lastname: "",
    email: "",
    contact: "",
    password: "",
    role: "",
    adress: "",
    zip_code: "",
  });

  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const [selectedUserToDelete, setSelectedUserToDelete] = useState([]);

  const handleSelectionToDelete = (ids) => {
    setSelectedUserToDelete(ids);
  };

  const handleDelete = (id) => {
    setUserToDelete(id);
    setConfirmDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    try {
      await axios.post(`http://192.168.68.226:8000/delete_user/${userToDelete}/`);
      setUser((prevUsers) =>
        prevUsers.filter((user) => user.id !== userToDelete)
      );
      setConfirmDialogOpen(false);
    } catch (error) {
      console.error("Error deleting user:", error);
    }
  };

  const handleEdit = (user) => {
    setSelectedUser(user);
    setFormData({
      firstname: user.firstname,
      lastname: user.lastname,
      email: user.email,
      contact: user.contact,
      password: user.password,
      role: user.role,
      adress: user.adress,
      zip_code: user.zip_code,
    });
    setOpen(true);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSave = async () => {
    try {
      const response = await axios.post(
        `http://192.168.68.226:8000/update_user/${selectedUser.id}/`,
        formData
      );
      if (response.status === 200) {
        // Fetch users again to update the state
        fetchUsers();
        setOpen(false);
      }
    } catch (error) {
      console.error("Error updating user:", error);
    }
  };

  const handleClose = () => {
    setOpen(false);
  };

  const fetchUsers = async () => {
    try {
      const response = await axios.get(
        "http://192.168.68.226:8000/fetch_users/"
      );
      console.log("Response data:", response.data); // Check if the data is coming correctly
      const transformedUsers = response.data.map((user) => ({
        id: user.user_id, // Ensure `id` is properly mapped
        firstname: user.firstname,
        lastname: user.lastname,
        email: user.email,
        contact: user.contact,
        adress: user.adress,
        zip_code: user.zip_code,
      }));
      setUser(transformedUsers);
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };
  
  useEffect(() => {
    console.log("Fetching users...");
    fetchUsers();
  }, []);

  const handleNavigate = () => {
    navigate("/form");
  };

  const columns = [
    { field: "id", headerName: "ID" },
    {
      field: "status",
      headerName: "Status",
      flex: 1,
      renderCell: (params) => (
        <Box display="flex" alignItems="center" height="100%">
          <Box
            sx={{
              width: "10px",      
              height: "10px",        
              borderRadius: "50%",   
              backgroundColor: params.row.isOnline ? "green" : "red", 
              marginRight: "5px",  
            }}
          />
          <Typography variant="body2">
            {params.row.isOnline ? "Online" : "Offline"}
          </Typography>
        </Box>
      ),
    },
    
    {
      field: "firstname",
      headerName: "Name",
      flex: 1,
      cellClassName: "name-column--cell",
    },
    {
      field: "lastname",
      headerName: "Last Name",
      headerAlign: "left",
      flex: 1,
    },
    {
      field: "contact",
      headerName: "Phone Number",
      flex: 1,
    },
    {
      field: "email",
      headerName: "Email",
      flex: 1,
    },
    {
      field: "adress",
      headerName: "Address",
      flex: 1,
    },
    {
      field: "zip_code",
      headerName: "Zip Code",
      flex: 1,
    },
    {
      field: "action",
      headerName: "Actions",
      flex: 1,
      sortable: false,
      renderCell: (params) => (
        <Box>
          <IconButton
            color="secondary"
            onClick={() => handleEdit(params.row)}
            sx={{
              "&:hover": {
                color: "#fff",
              },
            }}
          >
            <EditIcon />
          </IconButton>
          <IconButton
            color="secondary"
            onClick={() => handleDelete(params.row.id)}
            sx={{
              "&:hover": {
                color: "red",
              },
            }}
          >
            <DeleteIcon />
          </IconButton>
        </Box>
      ),
    },
  ];

  return (
    <Box m="20px">
      <Box display="flex" justifyContent="space-between" alignItems="center">
        <Header title="DASHBOARD" subtitle="Welcome to Your Dashboard" />
        <IconButton
          color="#141b2d"
          onClick={handleNavigate}
          sx={{
            color: "#4cceac",
            fontSize: 45, // Increased size
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
        Create User
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
          "& .name-column--cell": {
            color: colors.greenAccent[300],
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
            backgroundColor: colors.blueAccent[700],
          },
          "& .MuiCheckbox-root": {
            color: `${colors.greenAccent[200]} !important`,
          },
        }}
      >
        <Box display="grid" gridTemplateColumns="repeat(12, 1fr)" gap="60px" my={4}>
          <Box gridColumn="span 2" backgroundColor={colors.primary[400]} p="20px">
            <StatBox
              title={"000"}
              subtitle="Total Users"
              icon={
                <PeopleIcon sx={{ color: colors.greenAccent[600], fontSize: "26px" }} />
              }
            />
          </Box>
          <Box
            gridColumn="span 2"
            backgroundColor={colors.primary[400]}
            display="flex"
            justifyContent="center"
            alignItems="center"
            p="20px"
          >
            <StatBox
              title={"000"}
              subtitle="Total Hardware"
              icon={
                <DeviceHubIcon sx={{ color: colors.greenAccent[600], fontSize: "26px" }} />
              }
            />
          </Box>
          <Box
            gridColumn="span 2"
            backgroundColor={colors.primary[400]}
            display="flex"
            justifyContent="center"
            alignItems="center"
            p="20px"
          >
            <StatBox
              title={"000"}
              subtitle="Total Projects"
              icon={
                <UsbIcon sx={{ color: colors.greenAccent[600], fontSize: "26px" }} />
              }
            />
          </Box>
          <Box
            gridColumn="span 2"
            backgroundColor={colors.primary[400]}
            display="flex"
            justifyContent="center"
            alignItems="center"
            p="20px"
          >
            <StatBox
              title={"000"}
              subtitle="Total Alerts"
              icon={
                <BugReportIcon sx={{ color: colors.greenAccent[600], fontSize: "26px" }} />
              }
            />
          </Box>
          <Box
            gridColumn="span 2"
            backgroundColor={colors.primary[400]}
            display="flex"
            justifyContent="center"
            alignItems="center"
            p="20px"
          >
            <StatBox
              title={"000"}
              subtitle="Total Issues"
              icon={
                <FeaturedPlayListIcon sx={{ color: colors.greenAccent[600], fontSize: "26px" }} />
              }
            />
          </Box>
          <Box
            gridColumn="span 2"
            backgroundColor={colors.primary[400]}
            display="flex"
            justifyContent="center"
            alignItems="center"
            p="20px"
          >
            <StatBox
              title={"000"}
              subtitle="Total Issues"
              icon={
                <FeaturedPlayListIcon sx={{ color: colors.greenAccent[600], fontSize: "26px" }} />
              }
            />
          </Box>
        </Box>
        <DataGrid
          rows={user}
          columns={columns}
          checkboxSelection
          onSelectionModelChange={handleSelectionToDelete}
          sx={{
            border: "none",
            backgroundColor: colors.primary[400],
          }}
        />
      </Box>

      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>Edit User</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            name="firstname"
            label="First Name"
            type="text"
            fullWidth
            variant="standard"
            value={formData.firstname}
            onChange={handleInputChange}
          />
          <TextField
            autoFocus
            margin="dense"
            name="lastname"
            label="Last Name"
            type="text"
            fullWidth
            variant="standard"
            value={formData.lastname}
            onChange={handleInputChange}
          />
          <TextField
            autoFocus
            margin="dense"
            name="contact"
            label="Contact"
            type="text"
            fullWidth
            variant="standard"
            value={formData.contact}
            onChange={handleInputChange}
          />
          <TextField
            autoFocus
            margin="dense"
            name="email"
            label="Email"
            type="text"
            fullWidth
            variant="standard"
            value={formData.email}
            onChange={handleInputChange}
          />
          <TextField
            autoFocus
            margin="dense"
            name="adress"
            label="Address"
            type="text"
            fullWidth
            variant="standard"
            value={formData.adress}
            onChange={handleInputChange}
          />
          <TextField
            autoFocus
            margin="dense"
            name="zip_code"
            label="Zip Code"
            type="text"
            fullWidth
            variant="standard"
            value={formData.zip_code}
            onChange={handleInputChange}
          />
          <Select
            name="role"
            label="Role"
            value={formData.role}
            onChange={handleInputChange}
            fullWidth
          >
            <MenuItem value="admin">Admin</MenuItem>
            <MenuItem value="user">User</MenuItem>
          </Select>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button onClick={handleSave}>Save</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={confirmDialogOpen} onClose={() => setConfirmDialogOpen(false)}>
        <DialogTitle>Confirm Deletion</DialogTitle>
        <DialogContent>
          <Typography>Are you sure you want to delete this user?</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleConfirmDelete}>Delete</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AdminDashboard;
