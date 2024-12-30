import { Box, IconButton, useTheme } from "@mui/material";
import { useContext } from "react";
import { ColorModeContext, tokens } from "../../theme";
import InputBase from "@mui/material/InputBase";
import LightModeOutlinedIcon from "@mui/icons-material/LightModeOutlined";
import DarkModeOutlinedIcon from "@mui/icons-material/DarkModeOutlined";
import NotificationsOutlinedIcon from "@mui/icons-material/NotificationsOutlined";
import SettingsOutlinedIcon from "@mui/icons-material/SettingsOutlined";
import PersonOutlinedIcon from "@mui/icons-material/PersonOutlined";
// import SearchIcon from "@mui/icons-material/Search";

const Topbar = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const colorMode = useContext(ColorModeContext);

  return (
    <Box display="flex" justifyContent="space-between" p={2}>
      {/* SEARCH BAR */}
      <Box
        display="flex"
        backgroundColor={colors.primary[400]}
        borderRadius="3px"
      >
        <InputBase sx={{ ml: 2, flex: 1 }} placeholder="Search" />
        {/* <IconButton type="button" sx={{ p: 1 }}>
          <SearchIcon />
        </IconButton> */}
      </Box>

      {/* ICONS */}
      <Box display="flex">
        <IconButton onClick={colorMode.toggleColorMode} 
                        sx={{
                          width: 40,
                          height : 40,
                          borderRadius : "50%",
                          display: 'flex',
                          alignItems : 'center',
                          justifyContent : 'centre',
                          '&:hover':{
                            boxShadow: '10px ',
                          },
                        }}
        >
          {theme.palette.mode === "dark" ? (
            <DarkModeOutlinedIcon />
          ) : (
            <LightModeOutlinedIcon />
          )}
        </IconButton>

        <IconButton                 sx={{
                  width: 40,
                  height : 40,
                  borderRadius : "50%",
                  display: 'flex',
                  alignItems : 'center',
                  justifyContent : 'centre',
                  '&:hover':{
                    boxShadow: '10px ',
                  },
                }}>
          <NotificationsOutlinedIcon />
        </IconButton>

        <IconButton                 sx={{
                  width: 40,
                  height : 40,
                  borderRadius : "50%",
                  display: 'flex',
                  alignItems : 'center',
                  justifyContent : 'centre',
                  '&:hover':{
                    boxShadow: '10px ',
                  },
                }}>
          <SettingsOutlinedIcon />
        </IconButton>
        <IconButton                 sx={{
                  width: 40,
                  height : 40,
                  borderRadius : "50%",
                  display: 'flex',
                  alignItems : 'center',
                  justifyContent : 'centre',
                  '&:hover':{
                    boxShadow: '10px ',
                  },
                }}>
          <PersonOutlinedIcon />
        </IconButton>
      </Box>
    </Box>
  );
};

export default Topbar;
