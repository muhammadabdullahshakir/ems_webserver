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
  ListItemText,
} from '@mui/material';
import axios from 'axios';
import { toast } from 'react-toastify';
import { getUserIdFromLocalStorage } from '../../data/localStorage';
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
  const gateways = userData?.userGateways || []
  const assignGateway = urls.assignGateway
   const [role, setRole] = useState('');

  
  
    
    useEffect(() => {
      // Retrieve user data from localStorage
      const user = JSON.parse(localStorage.getItem('user'));
      if (user) {
        setRole(user.role || ''); // Set role from localStorage
      }
    }, []);


  const [formData, setFormData] = useState({
    firstname: '',
    lastname: '',
    email: '',
    contact: '',
    password: '',
    role: 'user',
    zip_code: '',
    adress: '',
    image: '',
    is_online: false,
    user_id:'',
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
        role: receivedUser.role || 'user',
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
      const userId = localStorage.getItem('user_id'); // Or use getUserIdFromLocalStorage()
      const response = await axios.get(urls.unassignedGateway);

      // Filter gateways by created_by_id
      const filteredGateways = (response.data.UnassignedGateways ?? []).filter(
        (gateway) => String(gateway.created_by_id) === String(getUserIdFromLocalStorage())
      );

      setUnassignedGateway(filteredGateways);
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
  
      if (selectedFile) {
        const timestamp = new Date().getTime();
        const randomNumber = Math.floor(Math.random() * 10000);
        const uniqueFilename = `image_${timestamp}_${randomNumber}.png`;
  
        const uploadForm = new FormData();
        uploadForm.append('image', selectedFile, uniqueFilename);
  
        const uploadResponse = await axios.post('https://mexemai.com/bucket/update/ems', uploadForm);
        imageUrl = uploadResponse.data.image_url;
      }
  
      // Create the user object (excluding image and gateways)
      const createdById = getUserIdFromLocalStorage();

      const userPayload = {
        ...formData,
        ...(imageUrl ? { image: imageUrl } : {}),
        password: isEditMode ? undefined : formData.password,
        created_by_id: createdById,
      };
      
  
      // Clean up undefined values
      const cleanedUserPayload = Object.fromEntries(
        Object.entries(userPayload).filter(([_, v]) => v !== undefined)
      );
  
      // Create the gateway object separately
      const gatewayPayload = {
        user_id: userId,
        gateway_ids: selectedGatewaysList.map(gw => gw.G_id),
      };
  
      const apiUrl = isEditMode ? urls.updateUser(userId) : urls.createUser;
      const method = 'POST';
  
      // Combine both objects into one payload if backend expects that
      const fullPayload = {
        ...cleanedUserPayload,
        ...gatewayPayload, // ✅ this will now send user_id and gateway_ids separately
      };
  
      const response = await fetch(apiUrl, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(fullPayload),
      });
  
      const responseData = await response.json();


  
      if (response.ok) {
        const createdUserId = responseData.id || userId;


        if (!createdUserId) {
          alert('User ID is missing. Cannot assign gateways.')
          return
        }

        if (selectedGatewaysList.length > 0) {
          const gatewayPayload = {
            user_id: createdUserId,
            gateway_ids: selectedGatewaysList.map((gateway) => gateway.G_id), // ✅ Fix incorrect key
          }

          const gatewayResponse = await axios.post(assignGateway, gatewayPayload)

          if (gatewayResponse.status === 200) {
            console.log('✅ Gateways assigned successfully')
            // fetchAssignedGateways(createdUserId);
          } else {
            console.error('❌ Failed to assign gateways', gatewayResponse.data)
            alert('Failed to assign gateways. Please try again.')
          }
        }
        toast.success(isEditMode ? 'User updated successfully' : 'User created successfully');
        navigate('/dashboard/manage_users');
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
        {isEditMode ? 'Edit User' : 'Create User'}
      </Typography>

      <Box sx={{ display: 'flex', gap: 3 }}>
        <Box sx={{ flex: 1 }}>
          <TextField name="firstname" value={formData.firstname} onChange={handleChange} fullWidth placeholder="First Name" sx={{ mb: 2 }} />
          <TextField name="lastname" value={formData.lastname} onChange={handleChange} fullWidth placeholder="Last Name" sx={{ mb: 2 }} />
          <TextField name="email" value={formData.email} onChange={handleChange} fullWidth placeholder="Email" sx={{ mb: 2 }} />
          <TextField name="contact" value={formData.contact} onChange={handleChange} fullWidth placeholder="Phone Number" sx={{ mb: 2 }} />
          <TextField name="adress" value={formData.adress} onChange={handleChange} fullWidth placeholder="Address" sx={{ mb: 2 }} />
          <TextField name="zip_code" value={formData.zip_code} onChange={handleChange} fullWidth placeholder="Zip Code" sx={{ mb: 2 }} />
          {!isEditMode && (
            <TextField name="password" value={formData.password} onChange={handleChange} fullWidth placeholder="Password" type="password" sx={{ mb: 2 }} />
          )}

          <Button variant="contained" onClick={handleSubmit} fullWidth disabled={loading}>
            {loading ? 'Saving...' : isEditMode ? 'Update User' : 'Create User'}
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

          {role === 'admin' &&  <Select
            value={selectedGateway}
            onChange={(e) => {
              setSelectedGateway(e.target.value);
              handleSelectGateway(e.target.value);
            }}
            fullWidth
            displayEmpty
            sx={{ mt: 2 }}
          >
            <MenuItem value="" disabled>Select an Unassigned Gateway</MenuItem>
            {unassignedGateway.map((gw) => (
              <MenuItem key={gw.G_id} value={gw.G_id}>
                {gw.gateway_name}
              </MenuItem>
            ))}
          </Select>}
        </Box>
      </Box>

    {role === 'admin' &&  <Box sx={{ display: 'flex', gap: 3, mt: 4 }}>
      <Box sx={{ flex: 1 }}>
          <Typography variant="subtitle1" gutterBottom>
            Assigned Gateways
          </Typography>
          <List
            sx={{ border: '1px solid #ddd', borderRadius: 2, maxHeight: 200, overflowY: 'auto' }}
          >
            {gateways.length > 0 ? (
              gateways.map((gateway) => (
                <ListItem
                  key={gateway.G_id}
                  button
                  // onClick={() => setSelectedAssignedGateway(gateway.G_id)}
                >
                  <ListItemText primary={gateway.gateway_name} secondary={gateway.mac_address} />
                </ListItem>
              ))
            ) : (
              <ListItem>
                <ListItemText primary="No Assigned Gateways" />
              </ListItem>
            )}
          </List>
        </Box>

        <Box sx={{ flex: 1 }}>
          <Typography variant="subtitle1">Selected New Gateways</Typography>
          <List sx={{ border: '1px solid #ddd', borderRadius: 2, maxHeight: 200, overflowY: 'auto' }}>
            {selectedGatewaysList.length > 0 ? (
              selectedGatewaysList.map((gw) => (
                <ListItem key={gw.G_id}>
                  <ListItemText primary={gw.gateway_name} secondary={gw.mac_address} />
                </ListItem>
              ))
            ) : (
              <ListItem><ListItemText primary="No New Gateways Selected" /></ListItem>
            )}
          </List>
        </Box>
      </Box>}
    </Box> 
  );
};

export default CreateUser;
