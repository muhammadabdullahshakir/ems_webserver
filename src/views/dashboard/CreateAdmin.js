import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Button,
  TextField,
  Box,
  Typography,
  Select,
  MenuItem,
  useTheme,
  List,
  ListItem,
  ListItemText, FormControl, InputLabel,
} from '@mui/material';
import axios from 'axios';
import { toast } from 'react-toastify';

import urls from '../../urls/urls';

const CreateUser = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const theme = useTheme();

  const userData = location.state?.userData || {};
  const receivedUser = userData?.user || {};
  const loggedInUserId = userData?.user_id; // ID of the admin creating a user
  const isEditMode = receivedUser?.id !== undefined;
  const userId = receivedUser?.id;
  const handleRoleChange = (event) => {
    setFormData({ ...formData, role: event.target.value })
  }

  const [formData, setFormData] = useState({
    firstname: '',
    lastname: '',
    email: '',
    contact: '',
    password: '',
    role: 'admin',
    zip_code: '',
    adress: '',
    image: '',
    is_online: false,
  });

  const [selectedImage, setSelectedImage] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null); // for new uploads
  const [unassignedGateway, setUnassignedGateway] = useState([]);
  const [selectedGateway, setSelectedGateway] = useState('');
  const [selectedGatewaysList, setSelectedGatewaysList] = useState([]);
  const [assignedGateways, setAssignedGateways] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isEditMode) {
      setFormData({
        firstname: receivedUser.firstname || '',
        lastname: receivedUser.lastname || '',
        email: receivedUser.email || '',
        contact: receivedUser.contact || '',
        password: '',
        role: receivedUser.role || 'admin',
        zip_code: receivedUser.zip_code || '',
        adress: receivedUser.address || '',
        image: receivedUser.image || '',
        is_online: receivedUser.is_online || false,
      });
      setSelectedImage(receivedUser.image);
      if (receivedUser.gateways) {
        setAssignedGateways(receivedUser.gateways);
      }
    }
  }, [location.state]);

  useEffect(() => {
    const fetchUnassignedGateway = async () => {
      try {
        const response = await axios.get(urls.unassignedGateway);
        setUnassignedGateway(response.data.UnassignedGateways ?? []);
      } catch (error) {
        console.error('Error fetching Unassigned Gateways:', error);
        setUnassignedGateway([]);
      }
    };
    fetchUnassignedGateway();
    const intervalId = setInterval(fetchUnassignedGateway, 5000);
    return () => clearInterval(intervalId);
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleImageUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setSelectedFile(file);
    const preview = URL.createObjectURL(file);
    setSelectedImage(preview);
  };

  const handleSelectGateway = (gatewayId) => {
    const selected = unassignedGateway.find((g) => g.G_id === gatewayId);
    if (selected && !selectedGatewaysList.find((g) => g.G_id === gatewayId)) {
      setSelectedGatewaysList((prev) => [...prev, selected]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
  
    try {
      let imageUrl = formData.image;
  
      // If new image selected, upload to the correct endpoint
      if (selectedFile) {
        const uploadForm = new FormData();
        uploadForm.append('image', selectedFile);
  
        // Use the correct local endpoint for image upload
        const uploadResponse = await axios.post('https://mexemai.com/bucket/update/ems', uploadForm);
        imageUrl = uploadResponse.data.image_url; // Ensure this matches the backend response
      }
  
      const payload = {
        ...formData,
        ...(imageUrl ? { image: imageUrl } : {}),
        password: isEditMode ? undefined : formData.password,
      };
  
      // Remove undefined values
      const cleanedPayload = Object.fromEntries(
        Object.entries(payload).filter(([_, v]) => v !== undefined)
      );
  
      const apiUrl = isEditMode 
        ? urls.updateUser(userId)  // For editing user (PUT)
        : urls.createUser;  // For creating user (POST)
  
      const method = isEditMode ? 'POST' : 'POST';
  
      const response = await fetch(apiUrl, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(cleanedPayload),
      });
  
      const responseData = await response.json();
  
      if (response.ok) {
        toast.success(isEditMode ? 'User updated successfully' : 'User created successfully');
        navigate('/dashboard/manageAdmin') // Or wherever you want to navigate
      } else {
        toast.error(responseData?.message || 'An error occurred');
      }
    } catch (error) {
      console.error('Error creating/updating user:', error);
      toast.error('An error occurred while creating/updating the user');
    } finally {
      setLoading(false);
    }
};




  return (
    <Box sx={{ maxWidth: 800, mx: 'auto', p: 4 }}>
      <Typography variant="h4" align="center" gutterBottom>
        {isEditMode ? 'Edit Admin' : 'Create Admin'}
      </Typography>

      <Box sx={{ display: 'flex', gap: 3 }}>
        <Box sx={{ flex: 1 }}>
          <TextField name="firstname" value={formData.firstname} onChange={handleChange} fullWidth placeholder="First Name" sx={{ mb: 2 }} />
          <TextField name="lastname" value={formData.lastname} onChange={handleChange} fullWidth placeholder="Last Name" sx={{ mb: 2 }} />
          <TextField name="email" value={formData.email} onChange={handleChange} fullWidth placeholder="Email" sx={{ mb: 2 }} />
          <TextField name="contact" value={formData.contact} onChange={handleChange} fullWidth placeholder="Phone Number" sx={{ mb: 2 }} />
          <TextField name="adress" value={formData.adress} onChange={handleChange} fullWidth placeholder="Address" sx={{ mb: 2 }} />
          <TextField name="zip_code" value={formData.zip_code} onChange={handleChange} fullWidth placeholder="Zip Code" sx={{ mb: 2 }} />
          <TextField name="password" value={formData.password} onChange={handleChange} fullWidth placeholder="Password" type="password" sx={{ mb: 2 }} />
              
          

          <Button variant="contained" onClick={handleSubmit}  fullWidth disabled={loading}>
            {loading ? 'Saving...' : isEditMode ? 'Update Admin' : 'Create Admin'}
          </Button>
        </Box>

        <Box sx={{ flex: 1 }}>
          {selectedImage || formData.image ? (
            <img src={selectedImage || formData.image} alt="Uploaded" style={{ width: '100%', borderRadius: 8 }} />
          ) : (
            <Box
              sx={{
                width: '100%',
                height: 200,
                backgroundColor: '#f0f0f0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: 2,
                border: '2px dashed #ccc',
              }}
            >
              <Typography>No Image Selected</Typography>
            </Box>
          )}
          <Button variant="contained" component="label" fullWidth sx={{ mt: 2 }}>
            Upload Image
            <input type="file" accept="image/*" hidden onChange={handleImageUpload} />
          </Button>

         
        </Box>
      </Box>

    
    </Box>
  );
};

export default CreateUser;
