import React, { useState, useEffect } from 'react';
import NavBar from '../components/Navbar';
import { APIUtility } from '../services/Api';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  CircularProgress,
  Divider,
  List,
  ListItem,
  ListItemText,
  Paper,
} from '@mui/material';
import {
  FitnessCenterOutlined,
  TimerOutlined,
  LocalFireDepartmentOutlined,
  EmojiEventsOutlined,
} from '@mui/icons-material';

const Profile = () => {
  const [userStats, setUserStats] = useState(null);
  const [userSettings, setUserSettings] = useState(null);
  const [progressStats, setProgressStats] = useState(null);
  const [achievements, setAchievements] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        const [stats, settings, progress, userAchievements] = await Promise.all([
          APIUtility.getUserStats(),
          APIUtility.getUserSettings(),
          APIUtility.getProgressStats(),
          APIUtility.getUserAchievements(),
        ]);

        setUserStats(stats);
        setUserSettings(settings);
        setProgressStats(progress);
        setAchievements(userAchievements);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching profile data:', err);
        setError('Failed to load profile data');
        setLoading(false);
      }
    };

    fetchProfileData();
  }, []);

// useEffect(() => {
//     const fetchProfileData = async () => {
//         try {
//             const response = await APIUtility.getUserStats();
//             setUserStats(response.data);
//             setLoading(false);
//         } catch (error) {
//             console.error('Error fetching profile data:', error);
//             setError('Failed to load profile data');
//             setLoading(false);
//         }
//     };

//     fetchProfileData();
// }, []);

// console.log("userStats",userStats);




  if (loading) {
    return (
      <NavBar>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
          <CircularProgress />
        </Box>
      </NavBar>
    );
  }

  if (error) {
    return (
      <NavBar>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
          <Typography color="error">{error}</Typography>
        </Box>
      </NavBar>
    );
  }

  const user = JSON.parse(localStorage.getItem('user'));

  return (
    <NavBar>
      <Box sx={{ flexGrow: 1, p: 3 }}>
        {/* User Info Section */}
        <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <Typography variant="h4" gutterBottom>
                {user?.username || 'User Profile'}
              </Typography>
              <Typography variant="body1" color="textSecondary">
                {user?.email}
              </Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="body1">
                Height: {userSettings?.height} cm
              </Typography>
              <Typography variant="body1">
                Weight: {userSettings?.weight} kg
              </Typography>
              <Typography variant="body1">
                Fitness Goal: {userSettings?.fitness_goal}
              </Typography>
            </Grid>
          </Grid>
        </Paper>

        {/* Stats Cards */}
        <Grid container spacing={3} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center">
                  <FitnessCenterOutlined sx={{ mr: 1 }} />
                  <Typography variant="h6">
                    Total Exercises: {userStats?.total_exercises}
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center">
                  <TimerOutlined sx={{ mr: 1 }} />
                  <Typography variant="h6">
                    Total Minutes: {userStats?.total_minutes}
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center">
                  <LocalFireDepartmentOutlined sx={{ mr: 1 }} />
                  <Typography variant="h6">
                    Calories Burned: {userStats?.calories_burned}
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center">
                  <EmojiEventsOutlined sx={{ mr: 1 }} />
                  <Typography variant="h6">
                    Highest Streak: {userStats?.highest_streak}
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Achievements Section */}
{/* Achievements Section */}
<Paper elevation={3} sx={{ p: 3, mb: 3 }}>
  <Typography variant="h5" gutterBottom>
    Achievements
  </Typography>
  <Divider sx={{ mb: 2 }} />
  {achievements?.some(a => a.achieved) ? (
    <List>
      {achievements
        .filter(achievement => achievement.achieved)
        .map((achievement, index) => (
          <ListItem key={index}>
            <ListItemText
              primary={
                <Box display="flex" alignItems="center" gap={1}>
                  {achievement.title}
                  <EmojiEventsOutlined 
                    color="primary" 
                    sx={{ ml: 1, fontSize: '1.2rem' }}
                  />
                </Box>
              }
              secondary={achievement.description}
            />
          </ListItem>
        ))}
    </List>
  ) : (
    <Box py={2} textAlign="center">
      <Typography color="text.secondary">
        No achievements unlocked yet. Keep working out to earn achievements!
      </Typography>
    </Box>
  )}
</Paper>

        {/* Progress Stats */}
        <Paper elevation={3} sx={{ p: 3 }}>
          <Typography variant="h5" gutterBottom>
            Progress Overview
          </Typography>
          <Divider sx={{ mb: 2 }} />
          <Grid container spacing={2}>
            {progressStats?.map((stat, index) => (
              <Grid item xs={12} sm={6} md={4} key={index}>
                <Typography variant="body1">
                  {stat.name}: {stat.value}
                </Typography>
              </Grid>
            ))}
          </Grid>
        </Paper>
      </Box>
    </NavBar>
  );
};

export default Profile;
