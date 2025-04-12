import {
  TableCell, TableContainer, TableHead, TableRow, Box, Table, Paper, Typography,
  TableBody, Button, TextField
} from '@mui/material';
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { getUserIdFromLocalStorage } from '../../data/localStorage';

const ManageInvoices = () => {
  const [role, setRole] = useState('');
  const [subscriptions, setSubscriptions] = useState([]);
  const [editRowIndex, setEditRowIndex] = useState(null);
  const [editedRow, setEditedRow] = useState({});
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (user) {
      setRole(user.role || '');
    }

    axios.get("http://192.168.47.26:8000/create_or_update_subscription/")
      .then(response => {
        const data = response.data;
        console.log('Fetched subscription data:', data);

        const enrichedData = data.map((item) => ({
          id: item.sub_id,
          date: item.Active_date || 'N/A',
          username: item.firstname || 'N/A',
          email: item.email || 'N/A',
          phone: item.contact || 'N/A',
          userId: item.user_id,
          projects: 0, // default or fetched from another API
          unit_price: item.price || '0.00',
          discount: item.discount || '0.00',
          total: calculateTotal(item.price, item.discount),
          warn_time: item.warn_days || 'N/A',
          stop_time: item.stop_days || 'N/A',
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

  const handleEditClick = (index) => {
    setEditRowIndex(index);
    setEditedRow(subscriptions[index]);
  };

  const handleSaveClick = async (index) => {
    const updatedRow = {
      ...editedRow,
      total: calculateTotal(editedRow.unit_price, editedRow.discount),
    };
  
    const updated = [...subscriptions];
    updated[index] = updatedRow;
    setSubscriptions(updated);
    setEditRowIndex(null);
  
    const payload = {
      user_id: parseInt(updatedRow.userId),
      price: parseFloat(updatedRow.unit_price),
      discount: parseFloat(updatedRow.discount),
      warn_days: parseFloat(updatedRow.warn_time), // corrected key
      stop_days: parseFloat(updatedRow.stop_time), // corrected key
    };
    
    
  
    console.log('Payload:', payload); // 👈 Check this
  
    try {
      const response = await axios.post(
        "http://192.168.47.26:8000/create_or_update_subscription/",
        payload
      );
      console.log('POST success:', response.data);
    } catch (error) {
      console.error('Error posting invoice update:', error);
    }
  };
  
  
  

  const handleInputChange = (field, value) => {
    setEditedRow((prev) => ({ ...prev, [field]: value }));
  };

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const filteredSubscriptions = subscriptions.filter((subscription) => {
    return (
      subscription.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      subscription.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      subscription.phone.includes(searchQuery) ||
      subscription.status.toLowerCase().includes(searchQuery.toLowerCase())
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
        <Typography variant="h5" sx={{ color: '#fff' }}>Manage Invoices</Typography>
        <TextField
          label="Search"
          variant="outlined"
          size="small"
          value={searchQuery}
          onChange={handleSearchChange}
          sx={{ width: '200px', backgroundColor: '#fff', borderRadius: 1 }}
        />
      </Box>

      {role === 'admin' && (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell><b>Id</b></TableCell>
                <TableCell><b>Date</b></TableCell>
                <TableCell><b>Username</b></TableCell>
                <TableCell><b>Email</b></TableCell>
                <TableCell><b>Phone</b></TableCell>
                <TableCell><b>Projects</b></TableCell>
                <TableCell><b>Unit Price</b></TableCell>
                <TableCell><b>Discount</b></TableCell>
                <TableCell><b>Total</b></TableCell>
                <TableCell><b>Warn Time</b></TableCell>
                <TableCell><b>Stop Time</b></TableCell>
                <TableCell><b>Actions</b></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredSubscriptions.map((row, index) => (
                <TableRow key={index}>
                  {[
                    'id', 'date', 'username', 'email', 'phone',
                    'projects', 'unit_price', 'discount',
                    'total', 'warn_time', 'stop_time'
                  ].map((field, i) => {
                    const editableFields = ['projects', 'unit_price', 'discount', 'total', 'warn_time', 'stop_time'];
                    return (
                      <TableCell key={i}>
                        {editRowIndex === index && editableFields.includes(field) ? (
                          <TextField
                            value={editedRow[field] || ''}
                            onChange={(e) => handleInputChange(field, e.target.value)}
                            variant="outlined"
                            size="small"
                          />
                        ) : (
                          row[field]
                        )}
                      </TableCell>
                    );
                  })}
                  <TableCell>
                    {editRowIndex === index ? (
                      <Button variant="contained" onClick={() => handleSaveClick(index)}>
                        Save
                      </Button>
                    ) : (
                      <Button variant="outlined" onClick={() => handleEditClick(index)}>
                        Edit
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  );
};

export default ManageInvoices;
