import React, { useState, useEffect } from "react";
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
  Select,
  MenuItem,
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import { tokens } from "../../theme";
import Header from "../../components/Header";
import axios from "axios";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import Dropdown from "../../components/dropdown";

const UserTable = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  const [users, setUsers] = useState([]);
  const [hardwareData, setHardwareData] = useState({});


  const [open, setOpen] = useState(false);
  
  const [selectedUser, setSelectedUser] = useState({});
  const [formValues, setFormValues] = useState({
    firstname: "",
    lastname: "",
    email: "",
    contact: "",
    password: "",
    role: "",
  });
  const [dropdownValues, setDropdownValues] = useState({});
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);

  const [openCreate, setOpenCreate] = useState(false);
  const [formValuesCreate, setFormValuesCreate] = useState({
    firstname: "",
    lastname: "",
    email: "",
    contact: "",
    password: "",
    role: "user",
  });

  // Fetch users data
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await axios.get("http://192.168.100.26:8000/fetch_users/");
        const transformedUsers = response.data.map((user) => ({
          id: user.user_id,
          ...user,
        }));
        setUsers(transformedUsers);

        const hardwarePromises = transformedUsers.map(async (user) => {
          const hardwareResponse = await axios.get(
            `http://192.168.100.26:8000/fetch_hardware/${user.id}/`
          );
          return { id: user.id, data: hardwareResponse.data };
        });

        const hardwareResults = await Promise.all(hardwarePromises);
        const hardwareDataMap = hardwareResults.reduce((acc, { id, data }) => {
          acc[id] = data;
          return acc;
        }, {});
        setHardwareData(hardwareDataMap);
      } catch (error) {
        console.error("Error fetching Users:", error);
      }
    };
    fetchUsers();

    const intervalId = setInterval(fetchUsers, 500);
    return () => clearInterval(intervalId);
  }, []);

  const handleCreateUser = async () => {
    const formData = new FormData();
    Object.keys(formValuesCreate).forEach(key => {
      formData.append(key, formValuesCreate[key]);
    });

    try {
      const response = await axios.post('http://192.168.100.26:8000/create_user/', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.status === 201) {
        const newUser = response.data;
        if (newUser.id) {
          setUsers(prevUsers => [...prevUsers, newUser]);
          setOpenCreate(false);
        } else {
          console.error('New user data does not contain an ID.');
        }
      }
    } catch (error) {
      console.error("Error creating user:", error.response?.data || error.message);
    }
  };

  const handleCreateInputChange = (e) => {
    const { name, value } = e.target;
    setFormValuesCreate({ ...formValuesCreate, [name]: value });
  };

  const handleEdit = (user) => {
    setSelectedUser(user);
    setFormValues({
      firstname: user.firstname,
      lastname: user.lastname,
      email: user.email,
      contact: user.contact,
      password: "",
      role: user.role,
    });
    setOpen(true);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormValues({ ...formValues, [name]: value });
  };

  const handleSave = async () => {
    try {
      const response = await axios.post(
        `http://192.168.100.26:8000/update_user/${selectedUser.id}/`,
        formValues
      );
      if (response.status === 200) {
        setUsers((prevUsers) =>
          prevUsers.map((user) =>
            user.id === selectedUser.id ? { ...user, ...formValues } : user
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

  const handleDelete = (id) => {
    setUserToDelete(id);
    setConfirmDialogOpen(true);

    if (navigator.vibrate) {
      navigator.vibrate(200);
    }
  };

  const handleConfirmDelete = async () => {
    try {
      await axios.post(`http://192.168.100.26:8000/delete_user/${userToDelete}/`);
      setUsers((prevUsers) => prevUsers.filter((user) => user.id !== userToDelete));
      setConfirmDialogOpen(false);
    } catch (error) {
      console.error("Error deleting user:", error);
    }
  };

  const handleCancelDelete = () => {
    setConfirmDialogOpen(false);
  };

  const handleDropdownChange = (userId, value) => {
    setDropdownValues((prev) => ({
      ...prev,
      [userId]: value,
    }));
    console.log('Updated dropdown for user:', userId, 'Selected Hardware:', value);
  };

  const columns = [
    { field: "id", headerName: "ID" },
    {
      field: "firstname",
      headerName: "First name",
      flex: 1,
      renderCell: (params) => (
        <Box display="flex" flexDirection="column">
          <Box display="flex" alignItems="center">
            {params.value}
            <Dropdown
              value={dropdownValues[params.row.id] || ""}
              onChange={(e) => handleDropdownChange(params.row.id, e.target.value)}
              items={hardwareData[params.row.id] || []}
              sx={{ ml: 2, minWidth: 120 }}
            />
          </Box>
        </Box>
      ),
    },
    {
      field: "lastname",
      headerName: "Last Name",
      flex: 1,
    },
    {
      field: "email",
      headerName: "Email",
      flex: 1,
    },
    {
      field: "contact",
      headerName: "Contact",
      flex: 1,
    },
    {
      field: "role",
      headerName: "Access Level",
      flex: 1,
    },
    {
      field: "actions",
      headerName: "Actions",
      flex: 1,
      sortable: false,
      renderCell: (params) => (
        <Box>
          <IconButton color="secondary" onClick={() => handleEdit(params.row)}>
            <EditIcon />
          </IconButton>
          <IconButton color="secondary" onClick={() => handleDelete(params.row.id)}
            sx={{
              '&:hover': {
                color: 'red',
              }
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
        <Header title="USERS" subtitle="Managing the Users" />
        <Button
          variant="contained"
          color="primary"
          onClick={() => setOpenCreate(true)}
          sx={{
            backgroundColor: colors.greenAccent[500],
            height: 30,
          }}
        >
          Create User
        </Button>
      </Box>
      <Box
        m="40px 0"
        height="75vh"
        sx={{
          "& .MuiDataGrid-root": {
            border: "none",
          },
          "& .MuiDataGrid-cell": {
            borderBottom: "none",
          },
          "& .MuiDataGrid-columnHeaders": {
            backgroundColor: colors.primary[400],
            borderBottom: "none",
          },
          "& .MuiDataGrid-virtualScroller": {
            backgroundColor: colors.primary[500],
          },
          "& .MuiDataGrid-footerContainer": {
            backgroundColor: colors.primary[400],
            borderTop: "none",
          },
        }}
      >
        <DataGrid
          checkboxSelection
          rows={users}
          columns={columns}
          getRowId={(row) => row.id} 
        />
      </Box>

      {/* Create User Dialog */}
      <Dialog open={openCreate} onClose={() => setOpenCreate(false)}>
        <DialogTitle>Create User</DialogTitle>
        <DialogContent>
          <TextField
            margin="dense"
            label="First Name"
            name="firstname"
            value={formValuesCreate.firstname}
            onChange={handleCreateInputChange}
            fullWidth
          />
          <TextField
            margin="dense"
            label="Last Name"
            name="lastname"
            value={formValuesCreate.lastname}
            onChange={handleCreateInputChange}
            fullWidth
          />
          <TextField
            margin="dense"
            label="Email"
            name="email"
            value={formValuesCreate.email}
            onChange={handleCreateInputChange}
            fullWidth
          />
          <TextField
            margin="dense"
            label="Contact"
            name="contact"
            value={formValuesCreate.contact}
            onChange={handleCreateInputChange}
            fullWidth
          />
          <TextField
            margin="dense"
            label="Password"
            name="password"
            type="password"
            value={formValuesCreate.password}
            onChange={handleCreateInputChange}
            fullWidth
          />
          <Select
            label="Role"
            name="role"
            value={formValuesCreate.role}
            onChange={handleCreateInputChange}
            fullWidth
          >
            <MenuItem value="admin">Admin</MenuItem>
            <MenuItem value="user">User</MenuItem>
          </Select>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenCreate(false)}>Cancel</Button>
          <Button onClick={handleCreateUser}>Create</Button>
        </DialogActions>
      </Dialog>

      {/* Edit User Dialog */}
      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>Edit User</DialogTitle>
        <DialogContent>
          <TextField
            margin="dense"
            label="First Name"
            name="firstname"
            value={formValues.firstname}
            onChange={handleInputChange}
            fullWidth
          />
          <TextField
            margin="dense"
            label="Last Name"
            name="lastname"
            value={formValues.lastname}
            onChange={handleInputChange}
            fullWidth
          />
          <TextField
            margin="dense"
            label="Email"
            name="email"
            value={formValues.email}
            onChange={handleInputChange}
            fullWidth
          />
          <TextField
            margin="dense"
            label="Contact"
            name="contact"
            value={formValues.contact}
            onChange={handleInputChange}
            fullWidth
          />
          <TextField
            margin="dense"
            label="Password"
            name="password"
            type="password"
            value={formValues.password}
            onChange={handleInputChange}
            fullWidth
          />
          <Select
            label="Role"
            name="role"
            value={formValues.role}
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

export default UserTable;
