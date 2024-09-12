import React, { useState, useEffect } from "react";
import { Box, IconButton, useTheme, Dialog, DialogActions, DialogContent, DialogTitle, TextField, Button } from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import { tokens } from "../../theme";
import Header from "../../components/Header";
import axios from "axios";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";

const UserTable = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  
  const [users, setUsers] = useState([]);
  const [open, setOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState({});
  const [formValues, setFormValues] = useState({ username: "", email: "", contact: "", password: "" });

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await axios.get('https://ems-server-530056698.us-central1.run.app/fetch_users/');
        const transformedUsers = response.data.map(user => ({
          id: user.user_id,
          ...user
        }));
        setUsers(transformedUsers);
      } catch (error) {
        console.error('Error fetching Users:', error);
      }
    };
    fetchUsers();

    const intervalId = setInterval(fetchUsers, 500);
    return () => clearInterval(intervalId);
  }, []);

  // Handle edit button click
  const handleEdit = (user) => {
    setSelectedUser(user);
    setFormValues({ username: user.username, email: user.email, contact: user.contact, password: "" });
    setOpen(true);
  };

  // Handle form input change
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormValues({ ...formValues, [name]: value });
  };

  // Handle saving the updated user
  const handleSave = async () => {
    try {
      await axios.post(`https://ems-server-530056698.us-central1.run.app/update_user/${selectedUser.id}/`, formValues);
      setOpen(false);
    } catch (error) {
      console.error('Error updating user:', error);
    }
  };

  // Close the dialog
  const handleClose = () => {
    setOpen(false);
  };

  const handleDelete = async (id) => {
    try {
      await axios.post(`https://ems-server-530056698.us-central1.run.app/delete_user/${id}/`);
      setUsers((prevUsers) => prevUsers.filter((user) => user.id !== id));
    } catch (error) {
      console.error('Error deleting user:', error);
    }
  };

  const columns = [
    { field: "id", headerName: "ID" },
    {
      field: "username",
      headerName: "Username",
      flex: 1,
      cellClassName: "name-column--cell",
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
      field: "actions",
      headerName: "Actions",
      flex: 1,
      sortable: false,
      renderCell: (params) => (
        <Box>
          <IconButton color="secondary" onClick={() => handleEdit(params.row)}>
            <EditIcon />
          </IconButton>
          <IconButton color="secondary" onClick={() => handleDelete(params.row.id)}>
            <DeleteIcon />
          </IconButton>
        </Box>
      ),
    },
  ];

  return (
    <Box m="20px">
      <Header title="USERS" subtitle="Managing the Users" />
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
        <DataGrid checkboxSelection rows={users} columns={columns} />
      </Box>

      {/* Edit User Dialog */}
      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>Edit User</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Username"
            name="username"
            value={formValues.username}
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
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} sx={{color : "grey"}}>Cancel</Button>
          <Button onClick={handleSave} sx ={{color : 'grey'}}>Save</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default UserTable;
