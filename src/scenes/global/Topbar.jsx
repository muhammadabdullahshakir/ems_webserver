import {
  Box,
  IconButton,
  useTheme,
  Dialog,
  DialogContent,
  DialogActions,
  DialogTitle,
  Typography,
} from "@mui/material";
import { createContext, useContext, useState, useEffect } from "react";
import { ColorModeContext, tokens } from "../../theme";
import InputBase from "@mui/material/InputBase";
import LightModeOutlinedIcon from "@mui/icons-material/LightModeOutlined";
import DarkModeOutlinedIcon from "@mui/icons-material/DarkModeOutlined";
import NotificationsOutlinedIcon from "@mui/icons-material/NotificationsOutlined";
import SettingsOutlinedIcon from "@mui/icons-material/SettingsOutlined";
import PersonOutlinedIcon from "@mui/icons-material/PersonOutlined";
import { ColorContext } from "../../components/ColorContext";
import Button from "@mui/material/Button";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import urls from "../urls/urls";


export const colorContext = createContext();
const Topbar = ({ onColorChange }) => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const colorMode = useContext(ColorModeContext);
  const { changeColor } = useContext(ColorContext);
  const { selectedColor } = useContext(ColorContext);

  const [open, setOpen] = useState(false);
  const userData = JSON.parse(localStorage.getItem("user"));
  console.log(userData);
  const firstname = userData?.firstname;
  const lastname = userData?.lastname;

  // setting dialog open close hook
  const [settingDialogOpen, setSettingDialogOpen] = useState(false);
  //  const [selectedColor, setSelectedColor] = useState("blue1000"); // Default color is red 1000

  const handleSettingDialogOpen = () => {
    setSettingDialogOpen(true);
  };

  const handleSetitngDialogClose = () => {
    setSettingDialogOpen(false);
  };

  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      const email = userData?.email;
      console.log("Logging out user with email:", email);
      await axios.post(urls.logout, { email });
      localStorage.removeItem("user");
      navigate("/");
    } catch (error) {
      console.error("error in logging Out");
    }
  };

  const handleLogoutDialogClose = () => {
    setOpen(false);
  };

  const colorOptions = {
    blue1000: "linear-gradient(195deg, rgb(73, 163, 241), rgb(26, 115, 232))",
    orange1000: "linear-gradient(195deg, rgb(255, 145, 52), rgb(255, 105, 0))",
    red1000: "linear-gradient(195deg, rgb(242, 85, 96), rgb(212, 41, 56))",
  };

  return (
    <Box
      display="flex"
      justifyContent="space-between"
      p={2}
      sx={{
        background: colorOptions[selectedColor],
      }}
    >
      {/* SEARCH BAR */}
      <Box
        display="flex"
        sx={{ backgroundColor: colors.primary[400] }}
        borderRadius="3px"
      >
        {/* <InputBase sx={{ ml: 2, flex: 1 }} placeholder="Search" /> */}
        {/* <IconButton type="button" sx={{ p: 1 }}>
          <SearchIcon />
        </IconButton> */}
      </Box>

      {/* ICONS */}
      <Box display="flex">
        <IconButton
          onClick={colorMode.toggleColorMode}
          sx={{
            width: 40,
            height: 40,
            borderRadius: "50%",
            display: "flex",
            alignItems: "center",
            justifyContent: "centre",
            "&:hover": {
              boxShadow: "10px ",
            },
          }}
        >
          {theme.palette.mode === "dark" ? (
            <DarkModeOutlinedIcon />
          ) : (
            <LightModeOutlinedIcon />
          )}
        </IconButton>

        <IconButton
          sx={{
            width: 40,
            height: 40,
            borderRadius: "50%",
            display: "flex",
            alignItems: "center",
            justifyContent: "centre",
            "&:hover": {
              boxShadow: "10px ",
            },
          }}
        >
          <NotificationsOutlinedIcon />
        </IconButton>

        <IconButton
          sx={{
            width: 40,
            height: 40,
            borderRadius: "50%",
            display: "flex",
            alignItems: "center",
            justifyContent: "centre",
            "&:hover": {
              boxShadow: "10px ",
            },
          }}
          onClick={handleSettingDialogOpen}
        >
          <SettingsOutlinedIcon />
        </IconButton>
        <Dialog
          open={settingDialogOpen}
          onClose={handleSetitngDialogClose}
          PaperProps={{
            style: {
              backgroundColor: colors.primary[400],
              position: "absolute",
              top: "50px",
              right: "10px",
              margin: 0,
              transformOrigin: "top right",
              borderRadius:'8px'
            },
          }}
        >
          <DialogTitle sx={{ color: colors.grey[100]  }}>
            Change Theme Color
          </DialogTitle>
          <DialogContent
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
            }}
          >
            <Button
              onClick={() => changeColor("blue1000")}
              sx={{
                background: colorOptions.blue1000,
                color: "#fff",
                margin: "10px 0", // Adds vertical spacing between buttons
                "&:hover": {
                  opacity: 0.8,
                },
              }}
            >
              Blue
            </Button>
            <Button
              onClick={() => changeColor("orange1000")}
              sx={{
                background: colorOptions.orange1000,
                color: "#fff",
                margin: "10px 0", // Adds vertical spacing between buttons
                "&:hover": {
                  opacity: 0.8,
                },
              }}
            >
              Orange
            </Button>
            <Button
              onClick={() => changeColor("red1000")}
              sx={{
                background: colorOptions.red1000,
                color: "#fff",
                margin: "10px 0", // Adds vertical spacing between buttons
                "&:hover": {
                  opacity: 0.8,
                },
              }}
            >
              Red
            </Button>
          </DialogContent>
        </Dialog>
        <IconButton
          sx={{
            width: 40,
            height: 40,

            display: "flex",
            alignItems: "center",
            justifyContent: "centre",
            "&:hover": {
              boxShadow: "10px ",
            },
          }}
          onClick={() => setOpen(true)}
        >
          <PersonOutlinedIcon />
        </IconButton>

        <Dialog
          open={open}
          onClose={() => setOpen(false)}
          PaperProps={{
            style: {
              backgroundColor: colors.primary[400],
            },
          }}
        >
          <DialogTitle
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "flex-start",
              gap: "8px",
            }}
          >
            <Typography
              variant="h6"
              component="div"
              color={colors.grey[100]}

              sx={{ fontSize: "20px", fontWeight: "bold" }}
            >
              {`${firstname} ${lastname}`}
            </Typography>
            <Typography
              sx={{ color: colors.greenAccent[400], fontSize: "12px" }}
            >
              Are you sure you want to logout?
            </Typography>
          </DialogTitle>

          <DialogContent>
            <Box
              display="flex"
              justifyContent="space-between"
              alignItems="center"
              gap="16px"
            >
              <Button
                onClick={handleLogout}
                sx={{
                  backgroundColor: colors.greenAccent[400],
                  color: "#fff",
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  width: "100%",
                  height: "100%",
                  "&:hover": { backgroundColor: colors.greenAccent[500] },
                }}
              >
                Logout
              </Button>
              <Button
                onClick={handleLogoutDialogClose}
                variant="outlined"
                sx={{
                  borderColor: colors.grey[400],
                  color: colors.grey[800],
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  width: "100%",
                  height: "100%",
                  "&:hover": {
                    borderColor: colors.grey[500],
                    color: colors.grey[900],
                  },
                }}
              >
                Cancel
              </Button>
            </Box>
          </DialogContent>
        </Dialog>
      </Box>
    </Box>
  );
};

export default Topbar;
