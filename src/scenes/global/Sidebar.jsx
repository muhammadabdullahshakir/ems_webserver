import { useState, useEffect, useContext } from "react";
import { ProSidebar, Menu, MenuItem } from "react-pro-sidebar";
import { Box, IconButton, Typography, useTheme } from "@mui/material";
import { Link } from "react-router-dom";
import "react-pro-sidebar/dist/css/styles.css";
import { tokens } from "../../theme";
import HomeOutlinedIcon from "@mui/icons-material/HomeOutlined";
import PeopleOutlinedIcon from "@mui/icons-material/PeopleOutlined";
import ContactsOutlinedIcon from "@mui/icons-material/ContactsOutlined";
import ReceiptOutlinedIcon from "@mui/icons-material/ReceiptOutlined";
import PersonOutlinedIcon from "@mui/icons-material/PersonOutlined";
import CalendarTodayOutlinedIcon from "@mui/icons-material/CalendarTodayOutlined";
import HelpOutlineOutlinedIcon from "@mui/icons-material/HelpOutlineOutlined";
import MenuOutlinedIcon from "@mui/icons-material/MenuOutlined";
import DevicesIcon from "@mui/icons-material/Devices";
import defaultProfileImage from "../../scenes/assets/profile.jpg";
import ManageHistoryIcon from "@mui/icons-material/ManageHistory";
import "./sidebar.css";
import { ColorContext } from "../../components/ColorContext";
import { useNavigate } from "react-router-dom";

const Item = ({ title, to, icon, selected, setSelected }) => {

  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const { selectedColor } = useContext(ColorContext);


  // Define the color options
  const colorOptions = {
    blue1000: "linear-gradient(195deg, rgb(73, 163, 241), rgb(26, 115, 232))",
    orange1000: "linear-gradient(195deg, rgb(255, 145, 52), rgb(255, 105, 0))",
    red1000: "linear-gradient(195deg, rgb(242, 85, 96), rgb(212, 41, 56))",
  };



  return (
    <MenuItem
      active={selected === title}
      style={{
        color: "#ffffff",
        background: selected === title ? colorOptions[selectedColor] : 'transparent', // Correct gradient applica
    
        borderRadius: "8px", 
        margin: "0 15px", 

        transition: "background-color 0.3s ease", // Smooth transition for background color
      }}
      onClick={() => setSelected(title)}
      icon={icon}
    >
      <Typography>{title}</Typography>
      <Link to={to} />
    </MenuItem>
  );
};

const Sidebar = ({ unassignedGateways }) => {
  const navigate = useNavigate();
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [selected, setSelected] = useState("Dashboard");
  const [user, setUser] = useState({});
  const [imageLoaded, setImageLoaded] = useState(false);

  const { selectedColor } = useContext(ColorContext);


  // Define the color options
  const colorOptions = {
    blue1000: "linear-gradient(195deg, rgb(73, 163, 241), rgb(26, 115, 232))",
    orange1000: "linear-gradient(195deg, rgb(255, 145, 52), rgb(255, 105, 0))",
    red1000: "linear-gradient(195deg, rgb(242, 85, 96), rgb(212, 41, 56))",
  };



  const handleNavigateToProfile = () => {
    navigate("/profile-form", {
      state: { unassignedGateways }, // Pass unassignedGateways to Profile Form
    });
  };

 
  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem("user"));
    setUser(
      userData || {
        firstname: "Guest",
        lastname: "",
        role: "Visitor",
        image: null,
      }
    );
  }, []);

  const handleImageLoad = () => {
    setImageLoaded(true);
  };

  const imageSrc = user.image
    ? `data:image/jpeg;base64,${user.image}`
    : defaultProfileImage;

  return (
    <Box
      sx={{
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        "& .pro-sidebar-inner": {
          background:
            "linear-gradient(150deg, rgb(4, 4, 10), rgb(10, 10, 18)) !important", // New dark gradient
          color: "#ffffff", // Ensures text remains white

          // background: `${colors.primary[400]} !important`,
          height: "100% !important",
          overflow: "hidden",
        },
        "& .pro-icon-wrapper": {
          backgroundColor: "transparent !important",
        },
        "& .pro-inner-item": {
          padding: "5px 35px 5px 20px !important",
        },
        // '& .pro-inner-item:hover': {
        //   color: '#868dfb !important',
        // },
        "& .pro-menu-item.active": {
          color: "#ffffff !important",
        },
      }}
    >
      <ProSidebar collapsed={isCollapsed}>
        <Menu iconShape="square">
          <MenuItem
            onClick={() => setIsCollapsed(!isCollapsed)}
            icon={isCollapsed ? <MenuOutlinedIcon /> : undefined}
            style={{
              margin: "10px 0 20px 0",
              color:"#ffffff" ,
            }}
          >
            {!isCollapsed && (
              <Box
                display="flex"
                justifyContent="space-between"
                alignItems="center"
                ml="15px"
              >
                <Typography
                  variant="h3"
                  color={colors.greenAccent[400]}
                  sx={{
                    background: colorOptions[selectedColor], // Use the gradient
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent", // Makes text appear in gradient
                    fontSize:'30px',
                    fontWeight:'bold'
                  }}
                                >
                  EMS
                </Typography>
                <IconButton
                  onClick={() => setIsCollapsed(!isCollapsed)}
                  sx={{
                    width: 40,
                    height: 40,
                    borderRadius: "50%",
                    color:"#ffffff",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    "&:hover": {
                      boxShadow: "10px",
                    },
                  }}
                >
                  <MenuOutlinedIcon />
                </IconButton>
              </Box>
            )}
          </MenuItem>

          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              height: "calc(100% - 80px)",
            }}
          >
            {!isCollapsed && (
              <Box mb="25px">
                <Box
                  display="flex"
                  justifyContent="center"
                  alignItems="center"
                  position="relative"
                  sx={{ width: "150px", height: "150px", margin: "0 auto" }}
                >
                  <img
                    alt="profile-user"
                    src={imageSrc} // Use the updated image source
                    onLoad={handleImageLoad}
                    onError={(e) => {
                      e.target.src = defaultProfileImage; 
                    }}
                    style={{
                      cursor: "pointer",
                      borderRadius: "50%",
                      width: "150px",
                      height: "150px",
                      objectFit: "cover",
                      visibility: imageLoaded ? "visible" : "hidden", 
                    }}
                  />
                </Box>
                <Box textAlign="center">
                  <Typography
                    variant="h2"
                    color="#ffffff"
                    fontWeight="bold"
                    sx={{ m: "10px 0 0 0" }}
                  >
                    {user.firstname} {user.lastname}
                  </Typography>
                  {/* <Typography variant="h5" color={colors.greenAccent[500]}>
                    {user.role}
                  </Typography> */}
                </Box>
              </Box>
            )}

            <Item
              title="Dashboard"
              to="/dashboard"
              icon={<HomeOutlinedIcon sx={{ marginTop: "15px" }} />}
              selected={selected}
              setSelected={setSelected}
            />
            <Typography
              variant="h6"
              color="#ffffff"
              sx={{ m: "15px 0 5px 20px" }}
            >
              Data
            </Typography>
            {user.role === "admin" && (
              <>
                <Item
                  title="Manage Users"
                  to="/team"
                  icon={<PeopleOutlinedIcon sx={{ marginTop: "15px" }} />}
                  selected={selected}
                  setSelected={setSelected}
                />
                <Item
                  title="Manage Hardware"
                  to="/hardware"
                  icon={<DevicesIcon sx={{ marginTop: "15px" }} />}
                  selected={selected}
                  setSelected={setSelected}
                />
                <Item
                  title="Manage Project"
                  to="/project"
                  icon={<ManageHistoryIcon sx={{ marginTop: "15px" }} />}
                  selected={selected}
                  setSelected={setSelected}
                />
                <Typography
                  variant="h6"
                  color="#ffffff"
                  sx={{ m: "15px 0 5px 20px" }}
                >
                  Pages
                </Typography>
                <Item
                  title="Profile Form"
                  to="/form"
                  icon={<PersonOutlinedIcon sx={{ marginTop: "15px" }} />}
                  selected={selected}
                  setSelected={setSelected}
                  onClick={handleNavigateToProfile}
                />
                <Item
                  title="Calendar"
                  to="/calendar"
                  icon={
                    <CalendarTodayOutlinedIcon sx={{ marginTop: "15px" }} />
                  }
                  selected={selected}
                  setSelected={setSelected}
                />
                {/* <Item
                  title="FAQ Page"
                  to="/faq"
                  icon={<HelpOutlineOutlinedIcon sx={{ marginTop: "15px" }} />}
                  selected={selected}
                  setSelected={setSelected}
                />
                <Item
                  title="Test Box"
                  to="/testbox"
                  icon={<DevicesIcon sx={{ marginTop: "15px" }} />}
                  selected={selected}
                  setSelected={setSelected}
                /> */}
              </>
            )}
            {user.role == "user" && (
              <>
                {/* <Item
                title="Manage Users"
                to="/team"
                icon={<PeopleOutlinedIcon />}
                selected={selected}
                setSelected={setSelected}
              /> */}
                {/* <Item
                title="Manage Hardware"
                to="/hardware"
                icon={<DevicesIcon />}
                selected={selected}
                setSelected={setSelected}
              /> */}
                {/* <Item
                  title="Manage Project"
                  to="/project"
                  icon={<ManageHistoryIcon sx={{ marginTop: "15px" }} />}
                  selected={selected}
                  setSelected={setSelected}
                /> */}
                <Item
                  title="Contacts Information"
                  to="/contacts"
                  icon={<ContactsOutlinedIcon sx={{ marginTop: "15px" }} />}
                  selected={selected}
                  setSelected={setSelected}
                />
                <Item
                  title="Invoices Balances"
                  to="/invoices"
                  icon={<ReceiptOutlinedIcon sx={{ marginTop: "15px" }} />}
                  selected={selected}
                  setSelected={setSelected}
                />

                <Typography
                  variant="h6"
                  color="#ffffff"
                  sx={{ m: "15px 0 5px 20px" }}
                >
                  Pages
                </Typography>
                {/* <Item
                title="Profile Form"
                to="/form"
                icon={<PersonOutlinedIcon />}
                selected={selected}
                setSelected={setSelected}
              /> */}
                <Item
                  title="Calendar"
                  to="/calendar"
                  icon={
                    <CalendarTodayOutlinedIcon sx={{ marginTop: "15px" }} />
                  }
                  selected={selected}
                  setSelected={setSelected}
                />
                {/* <Item
                  title="FAQ Page"
                  to="/faq"
                  icon={<HelpOutlineOutlinedIcon sx={{ marginTop: "15px" }} />}
                  selected={selected}
                  setSelected={setSelected}
                /> */}
              </>
            )}
          </Box>
        </Menu>
      </ProSidebar>
    </Box>
  );
};

export default Sidebar;
