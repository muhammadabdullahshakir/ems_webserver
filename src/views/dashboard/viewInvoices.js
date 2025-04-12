import {
  TableCell, TableContainer, TableHead, TableRow, Box, Table, Paper, Typography,
  TableBody, IconButton, Menu, MenuItem, TextField
} from '@mui/material';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import React, { useEffect, useState } from 'react';
import axios from 'axios';


const ViewInvoices = () => {
  const [role, setRole] = useState('');
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedRow, setSelectedRow] = useState(null);
    const [subscriptions, setSubscriptions] = useState([]);
    const [editRowIndex, setEditRowIndex] = useState(null);
    const [editedRow, setEditedRow] = useState({});
    const [searchQuery, setSearchQuery] = useState('');
  
    useEffect(() => {
      const user = JSON.parse(localStorage.getItem('user'));
      if (user) {
        setRole(user.role || '');
      }
  
      axios.get("http://192.168.47.26:8000/invoice/")
        .then(response => {
          const data = response.data;
          console.log('Fetched subscription data:', data);
  
          const enrichedData = data.map((item) => ({
            id: item.inv_id,
            date: item.subscription || 'N/A',
            username: item.start_date|| 'N/A',
            email: item.end_date|| 'N/A',
            phone: item.billing_price || 0,
           
            status: item.status || 'Unpaid',
          }));
  
          setSubscriptions(enrichedData);
        })
        .catch(error => {
          console.error('Error fetching subscriptions:', error);
        });
    }, []);
  
    
  
    const calculateTotal = (price, discount) => {
      const priceVal = parseFloat(price || 0);
      const discountVal = parseFloat(discount || 0);
      return (priceVal - (priceVal * discountVal / 100)).toFixed(2);
    };

  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (user) {
      setRole(user.role || '');
    }
  }, []);

  const handleOpenMenu = (event, index) => {
    setAnchorEl(event.currentTarget);
    setSelectedRow(index);
  };

  const handleCloseMenu = () => {
    setAnchorEl(null);
    setSelectedRow(null);
  };

  const handleStatusChange = async (newStatus) => {
    if (selectedRow === null) return;
  
    const updated = [...subscriptions];
    const invoice = updated[selectedRow];
    const originalStatus = invoice.status; // Save original status for rollback
  
    // Optimistically update UI
    invoice.status = newStatus;
    setSubscriptions(updated);
    handleCloseMenu();
  
    try {
      // Send POST request to backend
      const response = await axios.post(
        "http://192.168.47.26:8000/invoice/",
        {
          inv_id: invoice.id, // Include inv_id in the body
          status: newStatus,
        }
      );
  
      console.log('Status updated successfully:', response.data);
    } catch (error) {
      console.error('Error updating invoice status:', error);
      
      // Revert UI on error
      const reverted = [...subscriptions];
      reverted[selectedRow].status = originalStatus;
      setSubscriptions(reverted);
    }
  };
  
  

  // Filter subscriptions based on the searchTerm
  const filteredSubscriptions = subscriptions.filter((subscription) => {
    return (
      subscription.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      subscription.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      subscription.phone.includes(searchTerm) ||
      subscription.id.toString().includes(searchTerm)
    );
  });

  return (
    <Box sx={{ padding: 3 }}>
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 2,
          background: 'linear-gradient(135deg,rgb(103, 182, 247),rgb(50, 120, 185))',
          padding: '10px',
          borderRadius: '8px',
        }}
      >
        <Typography variant="h5">View Invoices</Typography>
        <TextField
          label="Search"
          variant="outlined"
          size="small"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          sx={{ width: '250px' }}
        />
      </Box>

      {role === 'admin' && (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell><b>Id</b></TableCell>
                <TableCell><b>Subscription</b></TableCell>
                <TableCell><b>Start Date</b></TableCell>
                <TableCell><b>End Date</b></TableCell>
                <TableCell><b>Billing Price</b></TableCell>
                
                <TableCell><b>Status Paid</b></TableCell>
                <TableCell><b>Action</b></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredSubscriptions.map((row, index) => (
                <TableRow key={index}>
                  {[
                    'id', 'date', 'username', 'email', 'phone',
                    
                  ].map((field, i) => (
                    <TableCell key={i}>{row[field]}</TableCell>
                  ))}

                  <TableCell>
                    <Typography 
                      sx={{ 
                        display: 'inline-block',
                        padding: '5px 10px',
                        borderRadius: '12px',
                        backgroundColor: row.status === 'Paid' ? 'success.light' : 'warning.light',
                        color: 'white',
                      }}
                    >
                      {row.status}
                    </Typography>
                  </TableCell>

                  <TableCell>
                    <IconButton onClick={(e) => handleOpenMenu(e, index)}>
                      <MoreVertIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleCloseMenu}
      >
        <MenuItem onClick={() => handleStatusChange('Paid')}>Paid</MenuItem>
        <MenuItem onClick={() => handleStatusChange('Unpaid')}>Unpaid</MenuItem>
      </Menu>
    </Box>
  );
};

export default ViewInvoices;
