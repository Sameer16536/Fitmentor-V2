import React, { useState, useEffect } from 'react';
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
  Avatar,
  LinearProgress,
  useTheme,
} from '@mui/material';
import {
  FitnessCenterOutlined,
  TimerOutlined,
  LocalFireDepartmentOutlined,
  EmojiEventsOutlined,
  TrendingUpOutlined,
  PersonOutlined,
} from '@mui/icons-material';

const ProgressMetric = ({ icon, label, value, subtitle }) => (
  <Paper
    elevation={3}
    sx={{
      p: 3,
      borderRadius: 2,
      bgcolor: 'background.paper',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: 1,
      transition: 'transform 0.2s',
      '&:hover': {
        transform: 'translateY(-4px)'
      }
    }}
  >
    {icon}
    <Typography variant="h4" sx={{ color: 'primary.main', fontWeight: 'bold' }}>
      {value}
    </Typography>
    <Typography variant="body1" sx={{ color: 'white', textAlign: 'center' }}>
      {label}
    </Typography>
    {subtitle && (
      <Typography variant="body2" sx={{ color: 'text.secondary', textAlign: 'center' }}>
        {subtitle}
      </Typography>
    )}
  </Paper>
);

const Profile = () => {
  const theme = useTheme();
  const [userStats, setUserStats] = useState(null);
  const [userSettings, setUserSettings] = useState(null);
  const [achievements, setAchievements] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        const [stats, settings, userAchievements] = await Promise.all([
          APIUtility.getUserStats(),
          APIUtility.getUserSettings(),
          APIUtility.getUserAchievements(),
        ]);

        setUserStats(stats);
        setUserSettings(settings);
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

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <CircularProgress sx={{ color: 'primary.main' }} />
      </Box>
    );
  }

  if (error) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <Typography color="error">{error}</Typography>
      </Box>
    );
  }

  const user = JSON.parse(localStorage.getItem('user'));

  return (
    <Box sx={{ 
      flexGrow: 1, 
      p: 3, 
      bgcolor: 'background.default',
      minHeight: '100vh'
    }}>
      {/* User Info Section */}
      <Paper 
        elevation={3} 
        sx={{ 
          p: 4, 
          mb: 3, 
          borderRadius: 2,
          background: 'linear-gradient(145deg, #1e1e1e 0%, #2d2d2d 100%)',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)'
        }}
      >
        <Grid container spacing={3} alignItems="center">
          <Grid item xs={12} md={2}>
            <Avatar
              sx={{
                width: 100,
                height: 100,
                bgcolor: 'primary.main',
                fontSize: '2.5rem'
              }}
            >
              <PersonOutlined fontSize="inherit" />
            </Avatar>
          </Grid>
          <Grid item xs={12} md={5}>
            <Typography variant="h4" gutterBottom sx={{ color: 'white', fontWeight: 600 }}>
              {user?.username || 'User Profile'}
            </Typography>
            <Typography variant="body1" sx={{ color: 'text.secondary' }}>
              {user?.email}
            </Typography>
          </Grid>
          <Grid item xs={12} md={5}>
            <Box sx={{ 
              p: 2, 
              bgcolor: 'rgba(255, 255, 255, 0.05)',
              borderRadius: 1
            }}>
              <Typography variant="body1" sx={{ color: 'text.secondary', mb: 1 }}>
                Height: {userSettings?.height} cm
              </Typography>
              <Typography variant="body1" sx={{ color: 'text.secondary', mb: 1 }}>
                Weight: {userSettings?.weight} kg
              </Typography>
              <Typography variant="body1" sx={{ color: 'text.secondary' }}>
                Goal: {userSettings?.fitness_goal}
              </Typography>
            </Box>
          </Grid>
        </Grid>
      </Paper>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        {[
          { 
            icon: <FitnessCenterOutlined />, 
            label: 'Total Exercises', 
            value: userStats?.total_exercises || 0 
          },
          { 
            icon: <TimerOutlined />, 
            label: 'Total Minutes', 
            value: userStats?.total_minutes || 0 
          },
          { 
            icon: <LocalFireDepartmentOutlined />, 
            label: 'Calories Burned', 
            value: userStats?.calories_burned?.toFixed(1) || 0 
          },
          { 
            icon: <EmojiEventsOutlined />, 
            label: 'Highest Streak', 
            value: userStats?.highest_streak || 0 
          }
        ].map((stat, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <Card sx={{ 
              bgcolor: 'background.paper',
              borderRadius: 2,
              transition: 'transform 0.2s',
              '&:hover': {
                transform: 'translateY(-4px)'
              }
            }}>
              <CardContent>
                <Box display="flex" alignItems="center" gap={2}>
                  <Box sx={{ 
                    p: 1.5, 
                    borderRadius: 2, 
                    bgcolor: 'primary.dark',
                    display: 'flex'
                  }}>
                    {stat.icon}
                  </Box>
                  <Box>
                    <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                      {stat.label}
                    </Typography>
                    <Typography variant="h5" sx={{ color: 'white', fontWeight: 600 }}>
                      {stat.value}
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Achievements Section */}
      <Paper elevation={3} sx={{ 
        p: 3, 
        mb: 3, 
        borderRadius: 2,
        bgcolor: 'background.paper'
      }}>
        <Box display="flex" alignItems="center" gap={1} mb={2}>
          <EmojiEventsOutlined sx={{ color: 'primary.main' }} />
          <Typography variant="h5" sx={{ color: 'white' }}>
            Achievements
          </Typography>
        </Box>
        <Divider sx={{ mb: 2, bgcolor: 'rgba(255, 255, 255, 0.1)' }} />
        {achievements?.some(a => a.achieved) ? (
          <List>
            {achievements
              .filter(achievement => achievement.achieved)
              .map((achievement, index) => (
                <ListItem 
                  key={index}
                  sx={{
                    bgcolor: 'rgba(255, 255, 255, 0.03)',
                    borderRadius: 1,
                    mb: 1
                  }}
                >
                  <ListItemText
                    primary={
                      <Box display="flex" alignItems="center" gap={1}>
                        <Typography color="white">
                          {achievement.title}
                        </Typography>
                        <EmojiEventsOutlined 
                          sx={{ color: 'primary.main', fontSize: '1.2rem' }}
                        />
                      </Box>
                    }
                    secondary={
                      <Typography color="text.secondary" variant="body2">
                        {achievement.description}
                      </Typography>
                    }
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

      {/* Progress Overview */}
      <Paper elevation={3} sx={{ 
        p: 3, 
        borderRadius: 2,
        bgcolor: 'background.paper'
      }}>
        <Box display="flex" alignItems="center" gap={1} mb={3}>
          <TrendingUpOutlined sx={{ color: 'primary.main' }} />
          <Typography variant="h5" sx={{ color: 'white' }}>
            Progress Overview
          </Typography>
        </Box>
        <Divider sx={{ mb: 3, bgcolor: 'rgba(255, 255, 255, 0.1)' }} />
        
        <Grid container spacing={3}>
          <Grid item xs={12} md={4}>
            <ProgressMetric
              icon={<LocalFireDepartmentOutlined sx={{ color: 'primary.main', fontSize: 40 }} />}
              label="Current Streak"
              value={userStats?.current_streak || 0}
              subtitle="consecutive days"
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <ProgressMetric
              icon={<FitnessCenterOutlined sx={{ color: 'primary.main', fontSize: 40 }} />}
              label="Weekly Workouts"
              value={userStats?.weekly_workouts || 0}
              subtitle="this week"
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <ProgressMetric
              icon={<TrendingUpOutlined sx={{ color: 'primary.main', fontSize: 40 }} />}
              label="Monthly Workouts"
              value={userStats?.monthly_workouts || 0}
              subtitle="this month"
            />
          </Grid>
        </Grid>
      </Paper>
    </Box>
  );
};

export default Profile;
