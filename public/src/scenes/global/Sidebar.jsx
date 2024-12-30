import { useState, useEffect } from "react";
import { ProSidebar, Menu, MenuItem } from "react-pro-sidebar";
import { Box, IconButton, Typography, useTheme } from "@mui/material";
import { Link } from "react-router-dom";
import 'react-pro-sidebar/dist/css/styles.css'; 
import { tokens } from "../../theme";
import HomeOutlinedIcon from "@mui/icons-material/HomeOutlined";
import PeopleOutlinedIcon from "@mui/icons-material/PeopleOutlined";
import ContactsOutlinedIcon from "@mui/icons-material/ContactsOutlined";
import ReceiptOutlinedIcon from "@mui/icons-material/ReceiptOutlined";
import PersonOutlinedIcon from "@mui/icons-material/PersonOutlined";
import CalendarTodayOutlinedIcon from "@mui/icons-material/CalendarTodayOutlined";
import HelpOutlineOutlinedIcon from "@mui/icons-material/HelpOutlineOutlined";
import MenuOutlinedIcon from "@mui/icons-material/MenuOutlined";
import DevicesIcon from '@mui/icons-material/Devices';
import defaultProfileImage from '../../scenes/assets/profile.jpg';
import ManageHistoryIcon from '@mui/icons-material/ManageHistory';
import './sidebar.css';

const Item = ({ title, to, icon, selected, setSelected }) => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  return (
    <MenuItem
      active={selected === title}
      style={{ color: colors.grey[100] }}
      onClick={() => setSelected(title)}
      icon={icon}
    >
      <Typography>{title}</Typography>
      <Link to={to} />
    </MenuItem>
  );
};

const Sidebar = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [selected, setSelected] = useState("Dashboard");
  const [user, setUser] = useState({});
  const [imageLoaded, setImageLoaded] = useState(false);

  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem('user'));
    setUser(userData || { firstname: 'Guest', lastname: '', role: 'Visitor', image: null });
  }, []);

  const handleImageLoad = () => {
    setImageLoaded(true);
  };

  const imageSrc = user.image ? `data:image/jpeg;base64,${user.image}` : defaultProfileImage;

  return (
    <Box
      sx={{
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        '& .pro-sidebar-inner': {
          background: `${colors.primary[400]} !important`,
          height: '100% !important',
          overflow: 'hidden',
        },
        '& .pro-icon-wrapper': {
          backgroundColor: 'transparent !important',
        },
        '& .pro-inner-item': {
          padding: '5px 35px 5px 20px !important',
        },
        '& .pro-inner-item:hover': {
          color: '#868dfb !important',
        },
        '& .pro-menu-item.active': {
          color: '#6870fa !important',
        },
      }}
    >
      <ProSidebar collapsed={isCollapsed}>
        <Menu iconShape="square">
          <MenuItem
            onClick={() => setIsCollapsed(!isCollapsed)}
            icon={isCollapsed ? <MenuOutlinedIcon /> : undefined}
            style={{
              margin: '10px 0 20px 0',
              color: colors.grey[100],
            }}
          >
            {!isCollapsed && (
              <Box
                display="flex"
                justifyContent="space-between"
                alignItems="center"
                ml="15px"
              >
                <Typography variant="h3" color={colors.grey[100]}>
                  ADMINIS
                </Typography>
                <IconButton
                  onClick={() => setIsCollapsed(!isCollapsed)}
                  sx={{
                    width: 40,
                    height: 40,
                    borderRadius: "50%",
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    '&:hover': {
                      boxShadow: '10px',
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
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              height: 'calc(100% - 80px)', 
            }}
          >
            {!isCollapsed && (
              <Box mb="25px">
                <Box
                  display="flex"
                  justifyContent="center"
                  alignItems="center"
                  position="relative"
                  sx={{ width: '150px', height: '150px', margin: '0 auto' }}
                >
                  <img
                    alt="profile-user"
                    src={imageSrc}  // Use the updated image source
                    onLoad={handleImageLoad}
                    onError={(e) => {
                      e.target.src = defaultProfileImage; // Fallback to default image
                    }} 
                    style={{
                      cursor: 'pointer',
                      borderRadius: '50%',
                      width: '150px',
                      height: '150px',
                      objectFit: 'cover',
                      visibility: imageLoaded ? 'visible' : 'hidden' // Show/hide image based on load status
                    }}
                  />
                </Box>
                <Box textAlign="center">
                  <Typography
                    variant="h2"
                    color={colors.grey[100]}
                    fontWeight="bold"
                    sx={{ m: '10px 0 0 0' }}
                  >
                    {user.firstname} {user.lastname}
                  </Typography>
                  <Typography variant="h5" color={colors.greenAccent[500]}>
                    {user.role}
                  </Typography>
                </Box>
              </Box>
            )}
             <Item
                title="Dashboard"
                to="/dashboard"
                icon={<HomeOutlinedIcon />}
                selected={selected}
                setSelected={setSelected}
              />
              <Typography
                variant="h6"
                color={colors.grey[300]}
                sx={{ m: '15px 0 5px 20px' }}
              >
                Data
              </Typography>
              <Item
                title="Manage Users"
                to="/team"
                icon={<PeopleOutlinedIcon />}
                selected={selected}
                setSelected={setSelected}
              />
              <Item
                title="Manage Hardware"
                to="/hardware"
                icon={<DevicesIcon />}
                selected={selected}
                setSelected={setSelected}
              />
              <Item
                title="Manage Project"
                to="/project"
                icon={<ManageHistoryIcon />}
                selected={selected}
                setSelected={setSelected}
              />
              <Item
                title="Contacts Information"
                to="/contacts"
                icon={<ContactsOutlinedIcon />}
                selected={selected}
                setSelected={setSelected}
              />
              <Item
                title="Invoices Balances"
                to="/invoices"
                icon={<ReceiptOutlinedIcon />}
                selected={selected}
                setSelected={setSelected}
              />

              <Typography
                variant="h6"
                color={colors.grey[300]}
                sx={{ m: '15px 0 5px 20px' }}
              >
                Pages
              </Typography>
              <Item
                title="Profile Form"
                to="/form"
                icon={<PersonOutlinedIcon />}
                selected={selected}
                setSelected={setSelected}
              />
              <Item
                title="Calendar"
                to="/calendar"
                icon={<CalendarTodayOutlinedIcon />}
                selected={selected}
                setSelected={setSelected}
              />
              <Item
                title="FAQ Page"
                to="/faq"
                icon={<HelpOutlineOutlinedIcon />}
                selected={selected}
                setSelected={setSelected}
              />
          </Box>
        </Menu>
      </ProSidebar>
    </Box>
  );
};

export default Sidebar;
