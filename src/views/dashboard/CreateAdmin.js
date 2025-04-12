import React, { useState, useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import {
  Button,
  TextField,
  Box,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  useTheme,
} from '@mui/material'
import axios from 'axios'
import urls from '../../urls/urls'
import { List, ListItem, ListItemText } from '@mui/material'
import { ColorModeContext } from '../theme/ThemeContext'

const CreateAdmin = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const theme = useTheme()

  const [formData, setFormData] = useState({
    firstname: '',
    lastname: '',
    email: '',
    contact: '',
    password: '',
    role: 'user',
    zip_code: '',
    adress: '',
    imageBase64: '',
  })

  // const [isEditing, setIsEditing] = useState(false)
  const [selectedImage, setSelectedImage] = useState(null)
  const [unassignedGateway, setUnassignedGateway] = useState([])
  const [selectedGateway, setSelectedGateway] = useState('')
  const [selectedGatewaysList, setSelectedGatewaysList] = useState([])
  console.log("gatewaylist", selectedGatewaysList)
  const [selectedGateways, setSelectedGateways] = useState('')
  const [selectedAssignedGateway, setSelectedAssignedGateway] = useState('')
  const [assignedGateways, setAssignedGateways] = useState([])
  // const isEditMode = !!formData.user_id

  useEffect(() => {
    if (location.state?.user) {
      setFormData(location.state.user)
    }
  }, [location])

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleRoleChange = (event) => {
    setFormData({ ...formData, role: event.target.value })
  }

  // ✅ Convert Image to Base64
  const handleImageUpload = (e) => {
    const file = e.target.files[0]
    if (file) {
      setSelectedImage(URL.createObjectURL(file))

      const reader = new FileReader()
      reader.readAsDataURL(file)
      reader.onloadend = () => {
        setFormData({ ...formData, imageBase64: reader.result })
      }
    }
  }

  // ✅ Fetch Unassigned Gateways from API

  useEffect(() => {
    const fetchUnassignedGateway = async () => {
      try {
        const response = await axios.get(urls.unassignedGateway)
        console.log('API response:', response.data)

        // ✅ Extract the correct array
        const gatewayData = response.data.UnassignedGateways ?? []

        setUnassignedGateway(gatewayData)
        console.log('Unassigned Gateways:', gatewayData)
      } catch (error) {
        console.error('Error fetching Unassigned Gateways:', error)
        setUnassignedGateway([]) // ✅ Set to an empty array if there's an error
      }
    }
    fetchUnassignedGateway()
    const intervalId = setInterval(fetchUnassignedGateway,5000)
    return  ()=> clearInterval (intervalId)
  }, [])

  // ✅ Handle Selection of Gateway
  const handleSelectGateway = (gatewayId) => {
    const selectedGatewayObj = unassignedGateway.find((gw) => gw.G_id === gatewayId)

    if (selectedGatewayObj && !selectedGatewaysList.some((gw) => gw.G_id === gatewayId)) {
      setSelectedGatewaysList([...selectedGatewaysList, selectedGatewayObj]) // ✅ Add selected gateway
    }
  }

  

  //////////////////////////////////////////////////////////////////////////

  // const receivedUser = location.state?.user
  // console.log('receivedUSerDarta:', receivedUser)
  const userData = location.state?.userData || {}
  const receivedUser = userData && userData.user ? userData : { user: {} }
  const assignGateway = urls.assignGateway
  const isEditMode = receivedUser.user?.id !== undefined 
  
  console.log("Received user:", receivedUser)
  
  const gateways = userData?.userGateways || []
  
  useEffect(() => {
    const user = receivedUser.user || {} 
  
    if (user.id) {
      console.log('✅ Edit Mode: User ID detected:', user.id)
  
      setFormData({
        user_id: user.id, 
        firstname: user.firstname || '',
        lastname: user.lastname || '',
        email: user.email || '',
        contact: user.contact || '',
        password: '',
        role: user.role || '',
        zip_code: user.zip_code || '',
        adress: user.address || '',
        imageBase64: user.image || '',
        hardware: user.hardware || [],
      })
  
      if (user.gateways) {
        setAssignedGateways(user.gateways)
      }
  
    } else {
      console.log('❌ Edit Mode: No User ID detected. Switching to Create Mode.')
    }
  }, [location.state])
  

  
  const handleSubmit = async (e) => {
    e.preventDefault()
    const {
      firstname,
      lastname,
      email,
      password,
      confirmPassword,
      contact,
      role,
      adress,
      zip_code,
      imageBase64,
      user_id, // ✅ Ensure user_id is included
    } = formData
    console.log('image',imageBase64)

    if (!isEditMode) {
      if (!firstname || !lastname || !email || !password || !contact || !adress || !zip_code || !imageBase64) {
        alert('All fields are required')
        return
      }
    }

    if (password && confirmPassword && password !== confirmPassword) {
      alert('Passwords do not match')
      return
    }

    try {
      const apiUrl = isEditMode ? urls.updateUser(user_id) : urls.createUser
      const method = isEditMode ? 'POST' : 'POST'

      const payload = {
        firstname,
        lastname,
        email,
        contact,
        role,
        adress,
        zip_code,
        imageBase64
      }

      if (password) payload.password = password
      if (imageBase64) payload.imageBase64 = imageBase64

      console.log('Submitting to:', apiUrl, 'with method:', method)
      console.log('Data:', payload)

      const response = await fetch(apiUrl, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      })

      const result = await response.json()

      if (response.ok) {
        const createdUserId = result.id || user_id

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

        navigate('/dashboard/manageAdmin')
      } else {
        console.error('❌ API Error:', result)
        alert(result.error || 'Something went wrong. Please try again.')
      }
    } catch (error) {
      console.error('❌ Network Error:', error)
      alert('Something went wrong. Please try again.')
    }
  }



  return (
    <Box sx={{ maxWidth: 800, margin: 'auto', padding: 4 }}>
      <Typography variant="h4" sx={{ textAlign: 'center', marginBottom: 3 }}>
        {isEditMode ? 'Edit User' : 'Create User'}
        {/* Create User */}
      </Typography>

      <Box sx={{ display: 'flex', gap: 3 }}>
        <Box sx={{ flex: 1 }}>
          <Box sx={{ display: 'grid', gap: 2 }}>
            <TextField
              name="firstname"
              value={formData.firstname}
              onChange={handleChange}
              fullWidth
              placeholder="First Name"
            />
            <TextField
              name="lastname"
              value={formData.lastname}
              onChange={handleChange}
              fullWidth
              placeholder="Last Name"
            />
            <TextField
              name="email"
              value={formData.email}
              onChange={handleChange}
              fullWidth
              placeholder="Email"
            />
            <TextField
              name="contact"
              value={formData.contact}
              onChange={handleChange}
              fullWidth
              placeholder="Phone Number"
            />
            <TextField
              name="adress"
              value={formData.adress}
              onChange={handleChange}
              fullWidth
              placeholder="Address"
            />
            <TextField
              name="zip_code"
              value={formData.zip_code}
              onChange={handleChange}
              fullWidth
              placeholder="Zip Code"
            />
                        <FormControl fullWidth>
                          <InputLabel>Role</InputLabel>
                          <Select name="role" value={formData.role} onChange={handleRoleChange}>
                            <MenuItem value="admin">Admin</MenuItem>
                            <MenuItem value="user">User</MenuItem>
                          </Select>
                        </FormControl>
            <TextField
              name="password"
              value={formData.password}
              onChange={handleChange}
              fullWidth
              placeholder="Password"
              type="password"
            />
          </Box>
          <Button variant="contained" color="primary" sx={{ marginTop: 3 }} onClick={handleSubmit}>
            {isEditMode ? 'Update User' : 'Create User'}
          </Button>
        </Box>
        <Box sx={{ flex: 1, textAlign: 'center' }}>
          {selectedImage ? (
            <img
              src={selectedImage}
              alt="Preview"
              style={{ width: '100%', height: 'auto', borderRadius: 8 }}
            />
          ) : (
            <Box
              sx={{
                width: '100%',
                height: 200,
                background: theme.palette.background.paper,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: 8,
                border: '2px dashed #ccc',
              }}
            >
              <Typography variant="body2" color="textSecondary">
                No Image Selected
              </Typography>
            </Box>
          )}
          <Button
            variant="contained"
            component="label"
            sx={{ marginTop: 2, display: 'block', width: '100%' }}
          >
            Upload Image
            <input type="file" accept="image/*" hidden onChange={handleImageUpload} />
          </Button>
        
        </Box>
      </Box>

      
    </Box>
  )
}

export default CreateAdmin



















// import React, { useState } from 'react';
// import { Box, Typography, TextField, Button } from '@mui/material';
// import { useTheme } from '@mui/material/styles';
// import urls from '../../urls/urls';
// import { useNavigate } from 'react-router-dom';


// const CreateAdmin = () => {
//   const theme = useTheme();
//   const [formData, setFormData] = useState({
//     firstname: '',
//     lastname: '',
//     email: '',
//     contact: '',
//     address: '',
//     password: '',
//     zip_code: '',
//     role: 'admin',
//     is_online: false,
//   });
//   const [imageBase64, setImageBase64] = useState(null);
//   const userData = location.state?.userData || {}
//     const receivedUser = userData && userData.user ? userData : { user: {} }
//     const isEditMode = receivedUser.user?.id !== undefined
//   const handleChange = (e) => {
//     setFormData({ ...formData, [e.target.name]: e.target.value });
//   };
//   const handleImageUpload = (e) => {
//     const file = e.target.files[0];
//     if (file) {
//       const reader = new FileReader();
//       reader.onloadend = () => {
//         setImageBase64(reader.result); // base64 image with data:image/png;base64,...
//       };
//       reader.readAsDataURL(file);
//     }
//   };
//   const navigate = useNavigate(); // initialize navigate

//   const handleSubmit = async () => {
//     const payload = {
//       firstname: formData.firstname,
//       lastname: formData.lastname,
//       email: formData.email,
//       contact: formData.contact,
//       password: formData.password,
//       role: formData.role,
//       is_online: formData.is_online,
//       adress: formData.address,
//       zip_code: formData.zip_code,
//       image: imageBase64,
//     };

//     try {
//       const response = await fetch(urls.createAdmin, {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify(payload),
//       });

//       const data = await response.json();

//       if (response.ok) {
//         alert('Admin created successfully!');
//         console.log(data);

//         // ✅ Navigate to ManageAdmin after success
//         navigate('/dashboard/ManageAdmin');
//       } else {
//         alert(data.error || 'Failed to create admin.');
//         console.error(data);
//       }
//     } catch (error) {
//       console.error('Error:', error);
//       alert('Something went wrong.');
//     }
//   };
//   return (
//     <Box sx={{ maxWidth: 800, margin: 'auto', padding: 4 }}>
//       <Typography variant="h4" sx={{ textAlign: 'center', marginBottom: 3 }}>
//       {isEditMode ? 'Edit Admin' : 'Create Admin'}
//       </Typography>
//       <Box sx={{ display: 'flex', gap: 3 }}>
//         <Box sx={{ flex: 1 }}>
//           <Box sx={{ display: 'grid', gap: 2 }}>
//             <TextField name="firstname" value={formData.firstname} onChange={handleChange} fullWidth placeholder="First Name" />
//             <TextField name="lastname" value={formData.lastname} onChange={handleChange} fullWidth placeholder="Last Name" />
//             <TextField name="email" value={formData.email} onChange={handleChange} fullWidth placeholder="Email" />
//             <TextField name="contact" value={formData.contact} onChange={handleChange} fullWidth placeholder="Phone Number" />
//             <TextField name="address" value={formData.address} onChange={handleChange} fullWidth placeholder="Address" />
//             <TextField name="zip_code" value={formData.zip_code} onChange={handleChange} fullWidth placeholder="Zip Code" />
//             <TextField name="password" value={formData.password} onChange={handleChange} fullWidth placeholder="Password" type="password" />
//           </Box>
//           <Button variant="contained" color="primary" sx={{ marginTop: 3 }} onClick={handleSubmit}>
//             Create Admin
//           </Button>
//         </Box>
//         <Box sx={{ flex: 1, textAlign: 'center' }}>
//           {imageBase64 ? (
//             <img src={imageBase64} alt="Preview" style={{ width: '100%', height: 'auto', borderRadius: 8 }} />
//           ) : (
//             <Box
//               sx={{
//                 width: '100%',
//                 height: 200,
//                 background: theme.palette.background.paper,
//                 display: 'flex',
//                 alignItems: 'center',
//                 justifyContent: 'center',
//                 borderRadius: 8,
//                 border: '2px dashed #ccc',
//               }}
//             >
//               <Typography variant="body2" color="textSecondary">
//                 No Image Selected
//               </Typography>
//             </Box>
//           )}
//           <Button variant="contained" component="label" sx={{ marginTop: 2, display: 'block', width: '100%' }}>
//             Upload Image
//             <input type="file" accept="image/*" hidden onChange={handleImageUpload} />
//           </Button>
//         </Box>
//       </Box>
//     </Box>
//   );
// };
// export default CreateAdmin;