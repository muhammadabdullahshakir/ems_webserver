import { 
  Box, 
  IconButton, 
  Typography, 
  useTheme, 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  TextField, 
  Select, 
  MenuItem, 
  DialogActions, 
  Button 
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import { tokens } from "../../theme";
import AdminPanelSettingsOutlinedIcon from "@mui/icons-material/AdminPanelSettingsOutlined";
import LockOpenOutlinedIcon from "@mui/icons-material/LockOpenOutlined";
import SecurityOutlinedIcon from "@mui/icons-material/SecurityOutlined";
import Header from "../../components/Header";
import { useEffect, useState } from "react";
import axios from "axios";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import AddCircleIcon from '@mui/icons-material/AddCircle';
import { useNavigate } from "react-router-dom";
// import { color } from "highcharts";

const Team = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const navigate = useNavigate();

  // Hook for fetching users
  const [user, setUser] = useState([]);

  // Hook for editing user
  const [open, setOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState({});
  const [formData, setFormData] = useState({
    firstname: '',
    lastname: '',
    email: '',
    contact: '',
    password: '',
    role: '',
  });

  //hook for delete multiple users
  const [selectedUserToDelete , setSelectedUserToDelete] = useState([])

  const handleSelectionToDelete = (ids) =>{
    setSelectedUserToDelete(ids);
  };

  // Hook for deleting user
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);

  const handleDelete = (id) => {
    setUserToDelete(id);
    setConfirmDialogOpen(true);

    if (navigator.vibrate) {
      navigator.vibrate(200);
    }
  };

  const handleConfirmDelete = async () => {
    try {
      await axios.post(`http://192.168.68.226:8000/delete_user/${userToDelete}/`);
      setUser((prevUsers) => prevUsers.filter((user) => user.id !== userToDelete));
      setConfirmDialogOpen(false);
    } catch (error) {
      console.error("Error deleting user:", error);
    }
  };

  const handleCancelDelete = () => {
    setConfirmDialogOpen(false);
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
        setUser((prevUsers) =>
          prevUsers.map((user) =>
            user.id === selectedUser.id ? { ...user, ...formData } : user
          )
        );
        setOpen(false); // Close the dialog upon success
      }
    } catch (error) {
      console.error("Error updating user:", error);
      console.error("Error details:", error.response?.data);
    }
  };

  const handleClose = () => {
    setOpen(false);
  };

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await axios.get("http://192.168.68.226:8000/fetch_users/");
        const transformedUsers = response.data.map((user) => ({
          id: user.user_id,
          ...user,
        }));
        setUser(transformedUsers);
      } catch (error) {
        console.error('Error fetching user', error);
      }
    };
    fetchUsers();
  }, []);

  const handleNavigate = () =>{
    navigate('/form')
  }

  const handleSeletedDelete = async () =>{
    try{
      await axios.post('http://192.168.68.226:8000/delete_selected_user/',{user_ids : selectedUserToDelete});
      setUser((prevUsers)=>prevUsers.filter((user)=>!selectedUser.includes(user.id)));
      setSelectedUserToDelete([])
    }catch (error) {
      console.error('Error in deleting user')
    }
  }

  const columns = [
    { field: "id", headerName: "ID" },
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
      field: "role",
      headerName: "Access Level",
      flex: 1,
      headerAlign: 'center',
      align: 'center',
      renderCell: ({ row: { role } }) => {
        return (
          <Box
            width="60%"
            m="0 auto"
            p="5px"
            display="flex"
            justifyContent="center"
            backgroundColor={
              role === "admin"
                ? colors.greenAccent[600]
                : role === "manager"
                ? colors.greenAccent[700]
                : colors.greenAccent[700]
            }
            borderRadius="4px"
          >
            {role === "admin" && <AdminPanelSettingsOutlinedIcon />}
            {role === "manager" && <SecurityOutlinedIcon />}
            {role === "user" && <LockOpenOutlinedIcon />}
            <Typography color={colors.grey[100]} sx={{ ml: "5px" }}>
              {role}
            </Typography>
          </Box>
        );
      },
    },
    {
      field: 'action',
      headerName: 'Actions',
      flex: 1,
      sortable: false,
      renderCell: (params) => (
        <Box>
          <IconButton
            color="secondary"
            onClick={() => handleEdit(params.row)}
            sx={{
              '&:hover': {
                color: '#fff',
              },
            }}
          >
            <EditIcon />
          </IconButton>
          <IconButton
            color="secondary"
            onClick={() => handleDelete(params.row.id)}
            sx={{
              '&:hover': {
                color: 'red',
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
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Box>
          <Header title="Users" subtitle="Managing the Users" />
        </Box>
        <Box display="flex" flexDirection="column" alignItems="center">
          <IconButton
            color="#141b2d"
            onClick={handleNavigate}
            sx={{
              color: "#4cceac",
              fontSize: 45, // Increased size
              '&:hover': {
                color: '#fff',
              },
            }}
          >
            <AddCircleIcon fontSize="inherit" />
          </IconButton>
          <Typography variant="h1" sx={{ marginTop: '2px', fontSize: '15px' }}>Create User</Typography>
        </Box>
      </Box>
      
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
        <DataGrid checkboxSelection rows={user} columns={columns} onRowSelectionModelChange={handleSelectionToDelete} />
      </Box>
      {selectedUserToDelete.length > 0 && (
        <Box
          display="flex"
          justifyContent="center"
          alignItems="flex-end"
          position="fixed"
          bottom="20px"
          left="50%"
          transform="translateX(-50%)"
        >
          <Button
            variant="contained"
            color="secondary"
            // startIcon={<DeleteIcon />}
            onClick={handleSeletedDelete}
            sx={{
              '&:hover':{
                backgroundColor: '#FF0000'
              }
            }}
          >
            Delete Selected
          </Button>
        </Box>
      )}
      
      

      {/* Edit User Dialog */}
      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>Edit User</DialogTitle>
        <DialogContent>
          <TextField
            margin="dense"
            label="First Name"
            name="firstname"
            value={formData.firstname}
            onChange={handleInputChange}
            fullWidth
          />
          <TextField
            margin="dense"
            label="Last Name"
            name="lastname"
            value={formData.lastname}
            onChange={handleInputChange}
            fullWidth
          />
          <TextField
            margin="dense"
            label="Email"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            fullWidth
          />
          <TextField
            margin="dense"
            label="Contact"
            name="contact"
            value={formData.contact}
            onChange={handleInputChange}
            fullWidth
          />
          <TextField
            margin="dense"
            label="Password"
            name="password"
            type="password"
            value={formData.password}
            onChange={handleInputChange}
            fullWidth
          />
          <Select
            label="Role"
            name="role"
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

      {/* Confirm Delete Dialog */}
      <Dialog open={confirmDialogOpen} onClose={handleCancelDelete}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          Are you sure you want to delete this user?
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancelDelete}>Cancel</Button>
          <Button onClick={handleConfirmDelete}>Confirm</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Team;
