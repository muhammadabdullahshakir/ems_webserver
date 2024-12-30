import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '@mui/material';
import { tokens } from "../../theme";
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import AddAPhotoIcon from '@mui/icons-material/AddAPhoto';

const SignupForm = () => {
  const [formData, setFormData] = useState({
    firstname: '',
    lastname: '',
    email: '',
    password: '',
    confirmPassword: '',
    contact: '',
    role: 'user',
    adress:'',
    zip_code:'',
    image: '',
  });

  const [showPassword, setShowPassword] = useState(false);
  const [selectedValue, setSelectedValue] = useState('user');
  const navigate = useNavigate();
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  const handleDropDownChange = (event) => {
    setSelectedValue(event.target.value);
    setFormData({ ...formData, role: event.target.value });
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const validImageType = ['image/jpeg', 'image/jpg', 'image/png'];
      if (!validImageType.includes(file.type)) {
        alert('Please select a valid image (PNG, JPEG, JPG)');
        return;
      }
      if (file.size > 2 * 1024 * 1024) {
        alert('Image size should be less than 2MB');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result.split(',')[1]; // Extract base64 content
        setFormData((prevData) => ({
          ...prevData,
          image: base64String,
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { firstname, lastname, email, password, confirmPassword, contact, role, adress , zip_code, image } = formData;

    if (!firstname || !lastname || !email || !password || !confirmPassword || !contact || !adress || !zip_code)  {
      alert('All fields are required');
      return;
    }

    if (password !== confirmPassword) {
      alert('Passwords do not match');
      return;
    }

    try {
      const response = await fetch('http://192.168.68.226:8000/create_user/', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ firstname, lastname, email, password, contact, role, adress , zip_code, image })
      });

      const result = await response.json();

      if (response.ok) {
        navigate('/');
      } else {
        alert(result.error);
      }
    } catch (error) {
      alert('Something went wrong. Please try again.');
    }
  };

  return (
    <div className="signup-form-container" style={{ 
      backgroundColor: colors.primary[500], 
      alignItems: 'flex-start',
      height: '80vh'
    }}>
      <div className='title' style={{
        fontSize: '30px',
        fontWeight: 'bold',
        paddingLeft: '10px'
      }}>
        CREATE USER
      </div>
      <div className='subtitle' style={{ color: colors.greenAccent[500], paddingLeft: '10px' }}>
        Create New User Profile
      </div>
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '20px' }}>
        <form onSubmit={handleSubmit} style={{ flex: 2 }}>
          <div className="input-container" style={{ display: 'flex', gap: '20px', flexDirection: "row" }}>
            <div className='firstname-input' style={{ flex: 1 }}>
              <input
                type="text"
                name="firstname"
                value={formData.firstname}
                onChange={handleChange}
                placeholder="First Name"
                style={{ backgroundColor: colors.primary[400], border: 'None', borderBottom: '#fff solid 2px', height: '50px' }}
              />
            </div>
            <div className='lastname-input' style={{ flex: 1 }}>
              <input
                type="text"
                name="lastname"
                value={formData.lastname}
                onChange={handleChange}
                placeholder="Last Name"
                style={{ backgroundColor: colors.primary[400], border: 'None', borderBottom: '#fff solid 2px', height: '50px' }}
              />
            </div>
          </div>
          
          <div className="input-container">
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Email"
              style={{ backgroundColor: colors.primary[400], border: 'None', borderBottom: '#fff solid 2px', height: '50px' }}
            />
          </div>

          <div className="input-container">
            <input
              type="text"
              name="contact"
              value={formData.contact}
              onChange={handleChange}
              placeholder="Phone Number"
              style={{ backgroundColor: colors.primary[400], border: 'None', borderBottom: '#fff solid 2px', height: '50px' }}
            />
          </div>
          <div className="input-container">
            <input
              type="text"
              name="adress"
              value={formData.adress}
              onChange={handleChange}
              placeholder="Address"
              style={{ backgroundColor: colors.primary[400], border: 'None', borderBottom: '#fff solid 2px', height: '50px' }}
            />
          </div>
          <div className="input-container">
            <input
              type="text"
              name="zip_code"
              value={formData.zip_code}
              onChange={handleChange}
              placeholder="Zip Code"
              style={{ backgroundColor: colors.primary[400], border: 'None', borderBottom: '#fff solid 2px', height: '50px' }}
            />
          </div>

          <div className="input-container password-container">
            <input
              type={showPassword ? 'text' : 'password'}
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Password"
              style={{ backgroundColor: colors.primary[400], border: 'None', borderBottom: '#fff solid 2px', height: '50px' }}
            />
            <span className="password-toggle" onClick={() => setShowPassword(!showPassword)}>
              {showPassword ? <VisibilityOff /> : <Visibility />}
            </span>
          </div>

          <div className="input-container password-container">
            <input
              type={showPassword ? 'text' : 'password'}
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="Confirm Password"
              style={{ backgroundColor: colors.primary[400], border: 'None', borderBottom: '#fff solid 2px', height: '50px' }}
            />
          </div>

          <div className="dropdown">
            <select value={selectedValue} onChange={handleDropDownChange}
              style={{ backgroundColor: colors.primary[400], border: 'None', borderBottom: '#fff solid 2px', height: '50px' }}>
              <option value="user">User</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          <button type="submit" className="signup-button">Create User</button>
        </form>

        <div className="profile-container" style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', position: 'relative' }}>
  <div className="profile-image-wrapper" style={{ 
      width: '150px', 
      height: '150px', 
      borderRadius: '50%', 
      overflow: 'hidden', 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center' 
  }}>
    <img
      src={formData.image ? `data:image/png;base64,${formData.image}` : "https://via.placeholder.com/150"}
      alt="Profile"
      className="profile-image"
      style={{
        width: '100%',
        height: '100%',
        objectFit: 'cover', // Ensures the image covers the space correctly
      }}
    />
  </div>

  {/* Camera Icon Outside the Profile Container */}
  <div className="camera-icon" onClick={() => document.getElementById('fileInput').click()} style={{
    position: 'absolute', // Position it absolutely
    top: '100%', // Place it below the profile image
    left: '50%', // Center it horizontally
    transform: 'translateX(-50%)', // Adjust horizontal centering
    // backgroundColor: 'rgba(255, 255, 255, 0.8)', // Optional: add a background for better visibility
    borderRadius: '50%', // Circular background
    padding: '5px', // Padding around the icon
    cursor: 'pointer', // Change cursor to pointer for interaction
    zIndex: 10, // Ensure the icon is on top
    marginTop: '-20px', // Adjust this value to control how much it overlaps the profile image
  }}>
    <AddAPhotoIcon
      sx={{
        color: colors.greenAccent[500],
        fontSize: 60,
      }}
    />
  </div>

  <input
    type="file"
    id="fileInput"
    style={{ display: 'none' }}
    accept="image/*"
    onChange={handleImageChange}
  />
</div>



      </div>
    </div>
  );
};

export default SignupForm;
