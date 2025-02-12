import * as React from 'react';
import { styled } from '@mui/material/styles';
import DashboardIcon from '@mui/icons-material/Dashboard';
import FitnessCenterIcon from '@mui/icons-material/FitnessCenter';
import BarChartIcon from '@mui/icons-material/BarChart';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import LogoutIcon from '@mui/icons-material/Logout';
import MenuIcon from '@mui/icons-material/Menu';
import { useNavigate } from 'react-router-dom';
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Box,
} from '@mui/material';
import { APIUtility } from '../services/Api';

const drawerWidth = 240;

const Main = styled('main')(({ theme }) => ({
  flexGrow: 1,
  padding: 0,
  marginLeft: 0,
  backgroundColor: theme.palette.background.default,
  minHeight: '100vh',
  display: 'flex',
  flexDirection: 'column'
}));

const NavBar = ({ children }) => {
  const navigate = useNavigate();
  const [open, setOpen] = React.useState(false);

  const handleDrawerToggle = () => {
    setOpen(!open);
  };

  const handleLogout = async () => {
    try {
      await APIUtility.logoutUser();
    } catch (error) {
      console.error('Logout failed:', error);
    } finally {
      // Always clear local storage and redirect
      localStorage.removeItem('authToken');
      localStorage.removeItem('refreshToken');  // If you store refresh token
      localStorage.removeItem('user');
      navigate('/login');
    }
  };

  const menuItems = [
    { text: 'Dashboard', icon: <DashboardIcon />, path: '/dashboard' },
    { text: 'Exercises', icon: <FitnessCenterIcon />, path: '/exercises' },
    { text: 'Guided Workouts', icon: <BarChartIcon />, path: '/guide' },
    { text: 'Profile', icon: <AccountCircleIcon />, path: '/profile' },
  ];

  return (
    <Box sx={{ 
      display: 'flex', 
      flexDirection: 'column',
      bgcolor: 'background.default', 
      minHeight: '100vh',
      width: '100%'
    }}>
      <AppBar
        position="fixed"
        sx={{
          zIndex: (theme) => theme.zIndex.drawer + 1,
          bgcolor: 'background.paper',
          borderBottom: '1px solid rgba(255, 255, 255, 0.12)',
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2 }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
            Fit Mentor
          </Typography>
          <IconButton color="inherit" onClick={handleLogout}>
            <LogoutIcon />
          </IconButton>
        </Toolbar>
      </AppBar>
      <Drawer
        variant="temporary"
        anchor="left"
        open={open}
        onClose={handleDrawerToggle}
        ModalProps={{
          keepMounted: true,
        }}
        sx={{
          '& .MuiDrawer-paper': {
            width: drawerWidth,
            boxSizing: 'border-box',
            bgcolor: 'background.paper',
            borderRight: '1px solid rgba(255, 255, 255, 0.12)',
            '& .MuiListItem-root': {
              '&:hover': {
                bgcolor: 'rgba(255, 255, 255, 0.08)',
              },
            },
            '& .MuiListItemIcon-root': {
              color: 'primary.main',
            },
          },
        }}
      >
        <Toolbar />
        <List>
          {menuItems.map((item) => (
            <ListItem
              button
              key={item.text}
              onClick={() => {
                navigate(item.path);
                setOpen(false);
              }}
            >
              <ListItemIcon>{item.icon}</ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItem>
          ))}
        </List>
      </Drawer>
      <Main>
        <Toolbar />
        <Box sx={{ 
          flexGrow: 1,
          bgcolor: 'background.default',
          minHeight: 'calc(100vh - 64px)',
          width: '100%'
        }}>
          {children}
        </Box>
      </Main>
    </Box>
  );
};

export default NavBar;
