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
  Checkbox,
  FormControlLabel,
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import { tokens } from "../../theme";
import Header from "../../components/Header";
import axios from "axios";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";

const HardwareTable = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  const [hardware, setHardware] = useState([]);
  const [open, setOpen] = useState(false);
  const [selectedHardware, setSelectedHardware] = useState({});
  const [formValues, setFormValues] = useState({
    project_id: "",
    name: "",
    serial_number: "",
    is_connected: false,
  });

  // State for confirmation dialog
  const [openConfirmDialog, setOpenConfirmDialog] = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);

  // State for multiple delete
  const [multipleHardwareToDelete, setMultipleHardwareToDelete] = useState([]);

  const handleSelectionToDelete = (ids) => {
    setMultipleHardwareToDelete(ids);
  };

  useEffect(() => {
    const fetchHardware = async () => {
      try {
        const storedUser = localStorage.getItem('user');
        const user = JSON.parse(storedUser); // Parse the stored user data
        const user_id = user?.user_id; // Get the logged-in user's ID
        if (!user_id) {
          throw new Error("User ID not found");
        }
        const response = await axios.get(`http://192.168.68.226:8000/fetch_hardware/${user_id}/`);
        const transformedHardware = response.data.map((item) => ({
          id: item.hardware_id,
          ...item,
        }));
        setHardware(transformedHardware);
      } catch (error) {
        console.error("Error fetching hardware:", error);
      }
    };
  
    fetchHardware();
    const intervalId = setInterval(fetchHardware, 500);
    return () => clearInterval(intervalId);
  }, []);
  

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormValues((prevValues) => ({
      ...prevValues,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleCreate = () => {
    setSelectedHardware({});
    setFormValues({
      project_id: "",
      name: "",
      serial_number: "",
      is_connected: false,
    });
    setOpen(true);
  };

  const handleSave = async () => {
    try {
      if (selectedHardware.id) {
        // Update existing hardware
        await axios.post(
          `http://192.168.68.226:8000/update_hardware/${selectedHardware.id}/`,
          formValues,
          {
            headers: {
              "Content-Type": "application/json",
            },
          }
        );

        setHardware((prevHardware) =>
          prevHardware.map((item) =>
            item.id === selectedHardware.id ? { id: selectedHardware.id, ...formValues } : item
          )
        );
      } else {
        // Create new hardware
        const response = await axios.post(
          "http://192.168.68.226:8000/add_hardware/",
          formValues,
          {
            headers: {
              "Content-Type": "application/json",
            },
          }
        );

        // Add the newly created hardware to the list
        setHardware((prevHardware) => [
          ...prevHardware,
          {
            id: response.data.hardware_id,
            ...formValues,
          },
        ]);
      }

      setOpen(false); // Close the dialog after saving
    } catch (error) {
      console.error("Error saving hardware:", error);
    }
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleEdit = (hardware) => {
    setSelectedHardware(hardware);
    setFormValues({
      project_id: hardware.project_id,
      name: hardware.name,
      serial_number: hardware.serial_number,
      is_connected: hardware.is_connected,
    });
    setOpen(true);
  };

  // Delete selected hardware
  const handleSelectedDelete = async () => {
    try {
      await Promise.all(multipleHardwareToDelete.map(async (id) => {
        await axios.post(`http://192.168.68.226:8000/delete_hardware/${id}/`, {}, {
          headers: {
            "Content-Type": "application/json",
          },
        });
      }));

      // Update hardware state to remove deleted items
      setHardware((prevHardware) =>
        prevHardware.filter((item) => !multipleHardwareToDelete.includes(item.id))
      );
      setMultipleHardwareToDelete([]); // Clear selected IDs
    } catch (error) {
      console.error("Error deleting selected hardware:", error);
    }
  };

  // Open confirmation dialog for deletion
  const handleDelete = (id) => {
    setConfirmDeleteId(id); // Store the ID of the hardware to delete
    setOpenConfirmDialog(true); // Open the confirmation dialog
  };

  // Confirm deletion
  const handleDeleteConfirm = async () => {
    try {
      if (confirmDeleteId) {
        await axios.post(`http://192.168.68.226:8000/delete_hardware/${confirmDeleteId}/`, {}, {
          headers: {
            "Content-Type": "application/json",
          },
        });
        setHardware((prevHardware) => prevHardware.filter((item) => item.id !== confirmDeleteId));
      }
      setOpenConfirmDialog(false); // Close the confirmation dialog
      setConfirmDeleteId(null); // Reset the ID
    } catch (error) {
      console.error("Error deleting hardware:", error);
    }
  };

  const columns = [
    { field: "hardware_id", headerName: "Hardware ID", flex: 1 },
    { field: "name", headerName: "Hardware Name", flex: 1 },
    { field: "serial_number", headerName: "Serial Number", flex: 1 },
    {
      field: "is_connected",
      headerName: "Connected",
      flex: 1,
      renderCell: (params) => (
        <Box
          sx={{
            height: 12,
            width: 12,
            borderRadius: '50%',
            backgroundColor: params.value ? 'green' : 'red',
            marginLeft: 1,
            marginTop: 2.5
          }}
        />
      ),
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
          <IconButton
            color="secondary"
            onClick={() => handleDelete(params.row.id)}
            sx={{
              '&:hover': {
                color: 'red'
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
        <Header title="HARDWARE" subtitle="Managing the Hardware" />
        <Button
          variant="contained"
          color="primary"
          onClick={handleCreate}
          sx={{ textTransform: "none", backgroundColor: colors.greenAccent[500] }}
        >
          Create Hardware
        </Button>
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
            backgroundColor: colors.greenAccent[700],
          },
          "& .MuiCheckbox-root": {
            color: `${colors.greenAccent[200]} !important`,
          },
        }}
      >
        <DataGrid
          checkboxSelection
          rows={hardware}
          columns={columns}
          onRowSelectionModelChange={handleSelectionToDelete}
        />
      </Box>

      {multipleHardwareToDelete.length > 0 && (
        <Box
          display='flex'
          justifyContent='center'
          alignItems='flex-end'
          position="fixed"
          bottom="20px"
          left="50%"
          transform="translateX(-50%)"
        >
          <Button
            variant="contained"
            color="error"
            onClick={handleSelectedDelete}
          >
            Delete Selected
          </Button>
        </Box>
      )}

      {/* Confirmation Dialog */}
      <Dialog open={openConfirmDialog} onClose={() => setOpenConfirmDialog(false)}>
        <DialogTitle>Confirm Deletion</DialogTitle>
        <DialogContent>
          <p>Are you sure you want to delete this hardware?</p>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenConfirmDialog(false)} color="primary">
            Cancel
          </Button>
          <Button onClick={handleDeleteConfirm} color="error">
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Create/Edit Dialog */}
      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>{selectedHardware.id ? "Edit Hardware" : "Add Hardware"}</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            name="project_id"
            label="Project ID"
            type="text"
            fullWidth
            variant="outlined"
            value={formValues.project_id}
            onChange={handleInputChange}
          />
          <TextField
            margin="dense"
            name="name"
            label="Name"
            type="text"
            fullWidth
            variant="outlined"
            value={formValues.name}
            onChange={handleInputChange}
          />
          <TextField
            margin="dense"
            name="serial_number"
            label="Serial Number"
            type="text"
            fullWidth
            variant="outlined"
            value={formValues.serial_number}
            onChange={handleInputChange}
          />
          <FormControlLabel
            control={
              <Checkbox
                checked={formValues.is_connected}
                onChange={handleInputChange}
                name="is_connected"
                color="primary"
              />
            }
            label="Is Connected"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} color="primary">
            Cancel
          </Button>
          <Button onClick={handleSave} color="primary">
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default HardwareTable;
