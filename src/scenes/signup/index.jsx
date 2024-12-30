import React, { useState } from "react";
import "./index.css";
import { useNavigate } from "react-router-dom";
import { useTheme } from "@mui/material";
import { tokens } from "../../theme";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import AddAPhotoIcon from "@mui/icons-material/AddAPhoto";
import urls from "../urls/urls";

const SignupForm = () => {
  const [formData, setFormData] = useState({
    firstname: "",
    lastname: "",
    email: "",
    password: "",
    confirmPassword: "",
    contact: "",
    role: "user",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [selectedValue, setSelectedValue] = useState("user");
  const [selectedImage, setSelectedImage] = useState(null); // Image state
  const [userData, setUserData] = useState(null); // State to store user data

  const handleDropDownChange = (event) => {
    setSelectedValue(event.target.value);
    setFormData({ ...formData, role: event.target.value });
  };

  const navigate = useNavigate();
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  // Handle input change
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Handle image selection
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const validImageType = ["image/jpeg", "image/jpg", "image/png"];

      if (!validImageType.includes(file.type)) {
        alert("Please select a valid image (PNG, JPEG, JPG)");
        return;
      }
      if (file.size > 2 * 1024 * 1024) {
        alert("Image size should be less than 2MB");
        return;
      }
      setSelectedImage(file);
    }
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    const {
      firstname,
      lastname,
      email,
      password,
      confirmPassword,
      contact,
      role,
    } = formData;

    // Basic form validation
    if (
      !firstname ||
      !lastname ||
      !email ||
      !password ||
      !confirmPassword ||
      !contact
    ) {
      alert("All fields are required");
      return;
    }

    if (password !== confirmPassword) {
      alert("Passwords do not match");
      return;
    }

    try {
      // Use FormData to handle image and form fields
      const formDataToSend = new FormData();
      formDataToSend.append("firstname", firstname);
      formDataToSend.append("lastname", lastname);
      formDataToSend.append("email", email);
      formDataToSend.append("password", password);
      formDataToSend.append("contact", contact);
      formDataToSend.append("role", role);
      if (selectedImage) {
        formDataToSend.append("image", selectedImage); // Add the image to the form data
      }

      const response = await fetch(urls.createUser, {
        method: "POST",
        body: formDataToSend, // Send the form data with image
      });

      const result = await response.json();

      if (response.ok) {
        // Store the user data
        setUserData(result);
        // Optionally, navigate to a different page
        navigate("/");
      } else {
        alert(result.error);
      }
    } catch (error) {
      alert("Something went wrong. Please try again.");
    }
  };

  return (
    <div
      className="signup-form-container"
      style={{ backgroundColor: colors.primary[500] }}
    >
      {/* Profile Image and Camera Icon */}
      <div className="profile-container">
        <div className="profile-image-wrapper">
          <img
            src={
              selectedImage
                ? URL.createObjectURL(selectedImage)
                : "https://via.placeholder.com/150"
            } // Preview selected image
            alt="Profile"
            className="profile-image"
          />
          <div
            className="camera-icon"
            onClick={() => document.getElementById("fileInput").click()}
          >
            <AddAPhotoIcon
              sx={{
                color: colors.greenAccent[500],
                fontSize: 60,
              }}
            />
          </div>
        </div>
        <input
          type="file"
          id="fileInput"
          style={{ display: "none" }} // Hidden file input
          accept="image/*"
          onChange={handleImageChange}
        />
      </div>

      {/* Sign Up Form */}
      <h1 className="form-title">Register Your Account</h1>
      <form onSubmit={handleSubmit}>
        <div className="input-container">
          <label>First Name</label>
          <input
            type="text"
            name="firstname"
            value={formData.firstname}
            onChange={handleChange}
            placeholder="Enter your First name here"
          />
        </div>

        <div className="input-container">
          <label>Last Name</label>
          <input
            type="text"
            name="lastname"
            value={formData.lastname}
            onChange={handleChange}
            placeholder="Enter your Last Name here"
          />
        </div>

        <div className="input-container">
          <label>Email</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="example@gmail.com"
          />
        </div>

        <div className="input-container">
          <label>Contact</label>
          <input
            type="text"
            name="contact"
            value={formData.contact}
            onChange={handleChange}
            placeholder="Enter your Phone Number here"
          />
        </div>

        <div className="input-container password-container">
          <label>Password</label>
          <input
            type={showPassword ? "text" : "password"}
            name="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="Enter your secret Password here"
          />
          <span
            className="password-toggle"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? <VisibilityOff /> : <Visibility />}
          </span>
        </div>

        <div className="input-container password-container">
          <label>Repeat Password</label>
          <input
            type={showPassword ? "text" : "password"}
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            placeholder="Confirm your Password here"
          />
        </div>

        <div className="dropdown">
          <label>Role</label>
          <select value={selectedValue} onChange={handleDropDownChange}>
            <option value="user">User</option>
            <option value="admin">Admin</option>
          </select>
        </div>

        <button type="submit" className="signup-button">
          Sign Up
        </button>
      </form>

      {/* Display user data */}
      {userData && (
        <div className="user-data">
          <h2>Registered User Data:</h2>
          <p>
            <strong>First Name:</strong> {userData.firstname}
          </p>
          <p>
            <strong>Last Name:</strong> {userData.lastname}
          </p>
          <p>
            <strong>Email:</strong> {userData.email}
          </p>
          <p>
            <strong>Contact:</strong> {userData.contact}
          </p>
          <p>
            <strong>Role:</strong> {userData.role}
          </p>
          {userData.image && (
            <img
              src={`http://192.168.100.26:8000${userData.image}`}
              alt="User Profile"
              className="profile-image"
            />
          )}
        </div>
      )}
    </div>
  );
};

export default SignupForm;
