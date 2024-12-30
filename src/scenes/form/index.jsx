import React, { useEffect, useState, useContext } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Typography, useTheme } from "@mui/material";
import { tokens } from "../../theme";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import urls from "../urls/urls";
import axios from "axios";
import Select from "react-select";
import { useParams } from "react-router-dom";
import { ColorContext } from "../../components/ColorContext";

const SignupForm = () => {
  const [formData, setFormData] = useState({
    user_id: "",
    firstname: "",
    lastname: "",
    email: "",
    password: "",
    confirmPassword: "",
    contact: "",
    role: "user",
    adress: "",
    zip_code: "",
    image: "",
  });

  const { selectedColor } = useContext(ColorContext);

  // Define the color options
  const colorOptions = {
    blue1000: "linear-gradient(195deg, rgb(73, 163, 241), rgb(26, 115, 232))",
    orange1000: "linear-gradient(195deg, rgb(255, 145, 52), rgb(255, 105, 0))",
    red1000: "linear-gradient(195deg, rgb(242, 85, 96), rgb(212, 41, 56))",
  };

  const location = useLocation(); // Access the passed state data
  const { unassignedGateways } = location.state || {}; // Get the unassignedGateways

  const { userId } = useParams();

  const [showPassword, setShowPassword] = useState(false);
  const [selectedValue, setSelectedValue] = useState("");
  const [unassignedGateway, setUnassignedGateway] = useState([]);
  const [selectedGateways, setSelectedGateways] = useState([]);
  const [assignedGateways, setAssignedGateways] = useState([]);

  const navigate = useNavigate();
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const isEditMode = !!location.state?.userData?.id;

  useEffect(() => {
    const userData = location.state?.userData || {};

    if (isEditMode) {
      let image = "";
      if (userData.image) {
        image = userData.image; 
      }

      setFormData({
        user_id: userData.user_id,
        firstname: userData.firstname,
        lastname: userData.lastname,
        email: userData.email,
        contact: userData.contact,
        password: userData.password,
        role: userData.role,
        zip_code: userData.zip_code,
        adress: userData.adress,
        image: userData.image || "", // Set the image from the passed data
        hardware: userData.hardware || [],
      });
      if (userData.gateways) {
        setAssignedGateways(userData.gateways);
      }
    }
  }, [location.state, isEditMode]);

 

  const assignGateway = urls.assignGateway;

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
      adress,
      zip_code,
      image,
      user_id,
    } = formData;

    if (!isEditMode) {
      if (
        !firstname ||
        !lastname ||
        !email ||
        !password ||
        !confirmPassword ||
        !contact ||
        !adress ||
        !zip_code
      ) {
        alert("All fields are required");
        return;
      }
    }

    if (password && confirmPassword && password !== confirmPassword) {
      alert("Passwords do not match");
      return;
    }

    try {
      const apiUrl = isEditMode ? urls.updateUser(user_id) : urls.createUser;
      const method = "POST";
      const payload = {
        firstname,
        lastname,
        email,
        password,
        contact,
        role,
        adress,
        zip_code,
      };
      if (image) payload.image = image;

      console.log("Submitting to:", apiUrl, "with method:", method);
      console.log("Data:", payload);

      // Step 1: Create or update user
      const response = await fetch(apiUrl, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (response.ok) {


        const createdUserId = result.id || user_id;

        if (!createdUserId) {
          alert("User ID is missing. Cannot assign gateways.");
          return;
        }

        if (selectedGateways && selectedGateways.length > 0) {
          const gatewayPayload = {
            user_id: createdUserId,
            gateway_ids: selectedGateways.map((gateway) => gateway.value),
          };


          const gatewayResponse = await axios.post(
            assignGateway,
            gatewayPayload
          );

          if (gatewayResponse.status === 200) {
            console.log("Gateways assigned successfully");
          } else {
            console.error("Failed to assign gateways", gatewayResponse.data);
            alert("Failed to assign gateways. Please try again.");
          }
        }

        // Navigate to the appropriate page after success
        navigate(isEditMode ? "/team" : "/team");
      } else {
        console.error("API Error:", result);
        alert(result.error || "Something went wrong. Please try again.");
      }
    } catch (error) {
      console.error("Network Error:", error);
      alert("Something went wrong. Please try again.");
    }
  };

  useEffect(() => {
    const fetchUnassignedGateway = async () => {
      try {
        const response = await axios.get(urls.unassignedGateway);
        console.log("API response:", response.data);

        // Access the array inside the 'UnassignedGateways' key
        const gatewayData = Array.isArray(response.data.UnassignedGateways)
          ? response.data.UnassignedGateways
          : [];

        setUnassignedGateway(gatewayData);
        console.log("unassigned gateway:", gatewayData);
      } catch (error) {
        console.error("There was an error fetching Unassigned Gateways", error);
        setUnassignedGateway([]); // Set to an empty array if there's an error
      }
    };
    fetchUnassignedGateway();
  }, []);

  // Handler for dropdown change
  const handleGatewayChange = (selectedOptions) => {
    setSelectedGateways(selectedOptions || []);
  };


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
      const validImageType = ["image/jpeg", "image/jpg", "image/png"];
      if (!validImageType.includes(file.type)) {
        alert("Please select a valid image (PNG, JPEG, JPG)");
        return;
      }
      if (file.size > 2 * 1024 * 1024) {
        alert("Image size should be less than 2MB");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result.split(",")[1];
        setFormData((prevData) => ({
          ...prevData,
          image: base64String,
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div
      className="signup-form-container"
      style={{
        backgroundColor: colors.primary[400],
        alignItems: "flex-start",
        marginTop: "5%",
        height: "100%",
        width: "100%",
        display: "flex",
        flexDirection: "row",
        gap: "15px", 
        flexWrap: "wrap", 
        alignItems: "center",
        justifyContent: "space-evenly",
      }}
    >
      <div
        className="title"
        style={{
          fontSize: "30px",
          fontWeight: "bold",

          marginLeft: "3%",
          color: "white",
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start",
        }}
      >
       <Typography sx={{fontSize:'30px', fontWeight:"bold", color:colors.greenAccent[400]}}>CREATE USER</Typography>
        <div
          style={{
            display: "flex",
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "flex-start",
            gap: "20px",
            marginLeft: "5%",
          }}
        >
          <form onSubmit={handleSubmit} style={{ flex: 2, maxWidth: "800px" }}>
            <div
              className="input-container"
              style={{
                display: "flex",
                gap: "5px",
                flexDirection: "row",
                marginTop: "10%",
                flexWrap: "wrap", 
              }}
            >
              <div
                className="firstname-input"
                style={{ flex: 1, minWidth: "200px" }}
              >
                <input
                  type="text"
                  name="firstname"
                  value={formData.firstname}
                  onChange={handleChange}
                  placeholder="First Name"
                  style={{
                    backgroundColor: colors.primary[500],
                    border: "None",
                    borderBottom: "#fff solid 2px",
                    height: "100%",
                    width: "100%",
                  }}
                />
              </div>
              <div
                className="lastname-input"
                style={{ flex: 1, minWidth: "200px" }}
              >
                <input
                  type="text"
                  name="lastname"
                  value={formData.lastname}
                  onChange={handleChange}
                  placeholder="Last Name"
                  style={{
                    backgroundColor: colors.primary[500],
                    border: "None",
                    borderBottom: "#fff solid 2px",
                    height: "100%",
                    width: "100%",
                  }}
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
                style={{
                  backgroundColor: colors.primary[500],
                  border: "None",
                  borderBottom: "#fff solid 2px",
                  height: "100%",
                  width: "100%",
                }}
              />
            </div>

            <div className="input-container">
              <input
                type="text"
                name="contact"
                value={formData.contact}
                onChange={handleChange}
                placeholder="Phone Number"
                style={{
                  backgroundColor: colors.primary[500],
                  border: "None",
                  borderBottom: "#fff solid 2px",
                  height: "100%",
                  width: "100%",
                }}
              />
            </div>
            <div className="input-container">
              <input
                type="text"
                name="adress"
                value={formData.adress}
                onChange={handleChange}
                placeholder="Address"
                style={{
                  backgroundColor: colors.primary[500],
                  border: "None",
                  borderBottom: "#fff solid 2px",
                  height: "100%",
                  width: "100%",
                }}
              />
            </div>
            <div className="input-container">
              <input
                type="text"
                name="zip_code"
                value={formData.zip_code}
                onChange={handleChange}
                placeholder="Zip Code"
                style={{
                  backgroundColor: colors.primary[500],
                  border: "None",
                  borderBottom: "#fff solid 2px",
                  height: "100%",
                  width: "100%",
                }}
              />
            </div>

            <div className="input-container password-container">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Password"
                style={{
                  backgroundColor: colors.primary[500],
                  border: "None",
                  borderBottom: "#fff solid 2px",
                  height: "100%",
                  width: "100%",
                }}
              />
              <span
                className="password-toggle"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <VisibilityOff /> : <Visibility />}
              </span>
            </div>

            <div className="input-container password-container">
              <input
                type={showPassword ? "text" : "password"}
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="Confirm Password"
                style={{
                  backgroundColor: colors.primary[500],
                  border: "None",
                  borderBottom: "#fff solid 2px",
                  height: "100%",
                  width: "100%",
                }}
              />
            </div>
            <div className="dropdown">
              <select
                value={selectedValue}
                onChange={handleDropDownChange}
                style={{
                  backgroundColor: colors.primary[500],
                  border: "None",
                  borderBottom: "#fff solid 2px",
                  height: "30px",
                  width: "100%",
                  marginTop: "1%",
                }}
              >
                <option value="" disabled>
                  Select Role
                </option>{" "}
                {/* Placeholder option */}
                <option value="user">User</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            <button
              type="submit"
              className="signup-button"
              style={{ background: colorOptions[selectedColor] }}
            >
              {isEditMode ? "Update Changes" : "Create User"}
            </button>
          </form>
        </div>
      </div>

      <div
        className="profile-container"
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column", 
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <div display={"flex"} flexDirection={"row"}>
          <div
            className="profile-image-wrapper"
            style={{
              width: "230px",
              height: "230px",
              borderRadius: "50%",
              overflow: "hidden",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              alignItems: "center",
              backgroundColor: "#f0f0f0 !important",
            }}
          >
            <img
              src={
                formData.image && formData.image.trim() !== ""
                  ? formData.image.startsWith("data:image/") 
                    ? formData.image 
                    : `data:image/png;base64,${formData.image}` 
                  : require("../../scenes/assets/profile.jpg") 
              }
              alt="Profile"
              className="profile-image"
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
              }}
            />
          </div>
        </div>

        {/* Upload Image Button Below the Profile Circle */}
        <button
          onClick={() => document.getElementById("fileInput").click()}
          style={{
            marginTop: "10px",
            padding: "10px 20px",
            background: colorOptions[selectedColor],
            color: "#fff",
            border: "none",
            borderRadius: "5px",
            cursor: "pointer",
            fontSize: "100%",
          }}
        >
          Upload Image
        </button>
        <div
          style={{
            display: "flex",
            flexDirection: "row",
            alignItems: "center", 
            marginTop: "10px",
          }}
        >
          <div
            className="hardware-dropdown"
            style={{
              width: "300px",
            }}
          >
            <Select
              isMulti
              name="hardware"
              onChange={handleGatewayChange}
              options={unassignedGateway.map((gateway) => ({
                value: gateway.G_id,
                label: `${gateway.gateway_name} - ${gateway.mac_address}`,
              }))}
              placeholder="Assign Unassigned Gateways"
              value={selectedGateways}
              styles={{
                control: (provided) => ({
                  ...provided,
                  backgroundColor: colors.primary[500],
                  color: "#fff",
                  border: "None",
                  borderBottom: "2px solid white",
                  height: "auto", 
                }),
                singleValue: (provided) => ({
                  ...provided,
                  color: "#fff",
                }),
                input: (provided) => ({
                  ...provided,
                  color: "#fff",
                }),
                menu: (provided) => ({
                  ...provided,
                  backgroundColor: colors.primary[400],
                }),
                option: (provided, state) => ({
                  ...provided,
                  backgroundColor: state.isSelected
                    ? colors.greenAccent[700]
                    : colors.primary[400],
                  color: state.isFocused ? "#fff" : "#fff",
                  cursor: "pointer",
                }),
                multiValue: (provided) => ({
                  ...provided,
                  backgroundColor: "transparent",
                  color: "#fff",
                }),
                multiValueLabel: (provided) => ({
                  ...provided,
                  color: "#fff",
                  fontSize: "16px",
                }),
                multiValueRemove: (provided) => ({
                  ...provided,
                  color: "#fff",
                  ":hover": {
                    backgroundColor: "transparent",
                    color: colors.greenAccent[400],
                  },
                }),
              }}
            />
          </div>
        </div>
      </div>
      <div
        style={{
          display: "flex",
          flexDirection: "row",
          width: "100%",
          alignItems: "center",
          justifyContent: "space-around",
        }}
      >
        <div
          className="assigned-gateways-container"
          style={{
            backgroundColor: colors.primary[400],
            borderRadius: "5px",
            width: "100%",
            maxWidth: "400px",
            margin: "10px",
          }}
        >
          <h3 style={{ paddingLeft: "10px", color: colors.grey[100] }}>
            Already Assigned Gateways
          </h3>
          {assignedGateways.length > 0 ? (
            <div style={{ padding: "10px" }}>
              {/* Headers */}
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  padding: "5px 10px",
                  fontWeight: "bold",
                  color: "#fff",
                  backgroundColor: colors.primary[600],
                  borderRadius: "5px",
                }}
              >
                <span>Gateway Name</span>
                <span>MAC Address</span>
              </div>
              {/* List */}
              <ul style={{ listStyleType: "none", padding: 0, margin: 0 }}>
                {assignedGateways.map((gateway) => (
                  <li
                    key={gateway.G_id}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      color: "#fff",
                      backgroundColor: colors.primary[500],
                      margin: "5px 0",
                      padding: "5px 10px",
                      borderRadius: "5px",
                    }}
                  >
                    <span>{gateway.gateway_name || "Unnamed Gateway"}</span>
                    <span>{gateway.mac_address || "N/A"}</span>
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <p style={{ paddingLeft: "10px" }}>
              No gateways assigned.
            </p>
          )}
        </div>

        {/* Selected Hardware from dropdown List  */}
        <div
          style={{
            backgroundColor: colors.primary[400],
            borderRadius: "5px",
            width: "100%",
            maxWidth:"400px",
            margin: "10px",
            justifyContent: "space-between",
          }}
        >
          <h3 style={{ color: colors.grey[100], paddingLeft: "10px" }}>
           New Selected Hardware
          </h3>
          {selectedGateways.length > 0 ? (
            <div style={{ padding: "10px" }}>
              {/* Headers */}
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  padding: "5px 10px",
                  fontWeight: "bold",
                  color: "#fff",
                  backgroundColor: colors.primary[600],
                  borderRadius: "5px",
                }}
              >
                <span>Gateway Name</span>
                <span>MAC Address</span>
              </div>
              {/* List */}
              <ul style={{ listStyleType: "none", padding: 0, margin: 0 }}>
                {selectedGateways.map((gateway) => {
                  const [gatewayName, macAddress] = gateway.label.split(" - "); 
                  return (
                    <li
                      key={gateway.value}
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        color: "#fff",
                        backgroundColor: colors.primary[500],
                        margin: "5px 0",
                        padding: "5px 10px",
                        borderRadius: "5px",
                      }}
                    >
                      <span>{gatewayName || "Unnamed Gateway"}</span>
                      <span>{macAddress || "N/A"}</span>
                    </li>
                  );
                })}
              </ul>
            </div>
          ) : (
            <p style={{  paddingLeft: "10px" }}>
              No Gateway selected.
            </p>
          )}
        </div>
      </div>

      <input
        id="fileInput"
        type="file"
        accept="image/jpeg,image/jpg,image/png"
        style={{ display: "none" }}
        onChange={handleImageChange}
      />
    </div>
  );
};

export default SignupForm;
