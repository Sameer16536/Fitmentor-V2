import React from 'react';
import { useParams } from 'react-router-dom';
import {
  Box,
  Typography,
  Paper,
  Grid,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
} from '@mui/material';
import {
  FitnessCenter,
  CheckCircle,
  Warning,
  Info,
} from '@mui/icons-material';

const exerciseGuides = {
  bicep_curls: {
    title: 'Bicep Curls Guide',
    description: 'A fundamental exercise for building bicep strength and muscle definition.',
    image: '/src/assets/bicecp.jpg',
    steps: [
      'Stand with feet shoulder-width apart',
      'Hold dumbbells with palms facing forward',
      'Keep elbows close to your body',
      'Curl weights up towards shoulders',
      'Lower weights back down with control'
    ],
    tips: [
      'Keep your back straight throughout the movement',
      'Don\'t swing your body to lift the weights',
      'Breathe steadily during the exercise',
      'Maintain controlled movements'
    ],
    commonMistakes: [
      'Using momentum to swing weights',
      'Moving elbows away from body',
      'Incomplete range of motion',
      'Arching back during lifts'
    ]
  },
  squats: {
    title: 'Squats Guide',
    description: 'A compound exercise that targets multiple muscle groups in your lower body.',
    image: '/src/assets/squats.jpg',
    steps: [
      'Stand with feet shoulder-width apart',
      'Keep chest up and core engaged',
      'Lower your body as if sitting back',
      'Keep knees aligned with toes',
      'Push through heels to stand up'
    ],
    tips: [
      'Keep your back straight',
      'Look straight ahead',
      'Keep weight in your heels',
      'Breathe steadily throughout'
    ],
    commonMistakes: [
      'Knees caving inward',
      'Rounding the back',
      'Rising on toes',
      'Not going deep enough'
    ]
  },
  pushups: {
    title: 'Push-ups Guide',
    description: 'A classic bodyweight exercise for building upper body strength.',
    image: '/src/assets/pushups.jpg',
    steps: [
      'Start in plank position',
      'Place hands shoulder-width apart',
      'Lower body with control',
      'Keep body in straight line',
      'Push back up to start'
    ],
    tips: [
      'Keep core engaged',
      'Maintain straight body alignment',
      'Breathe steadily',
      'Full range of motion'
    ],
    commonMistakes: [
      'Sagging hips',
      'Flared elbows',
      'Incomplete range of motion',
      'Head dropping'
    ]
  },
  planks: {
    title: 'Planks Guide',
    description: 'An isometric core exercise that builds stability and strength.',
    image: '/src/assets/planks.jpg',
    steps: [
      'Start in forearm plank position',
      'Align shoulders over elbows',
      'Keep body in straight line',
      'Engage core muscles',
      'Hold position'
    ],
    tips: [
      'Keep breathing steady',
      'Maintain neutral spine',
      'Engage glutes',
      'Keep neck neutral'
    ],
    commonMistakes: [
      'Sagging hips',
      'Raised hips',
      'Looking up/down',
      'Holding breath'
    ]
  },
  lunges: {
    title: 'Lunges Guide',
    description: 'A unilateral exercise that improves balance and leg strength.',
    image: '/src/assets/lunges.jpg',
    steps: [
      'Stand with feet hip-width apart',
      'Step forward with one leg',
      'Lower back knee toward ground',
      'Keep front knee over ankle',
      'Push back to starting position'
    ],
    tips: [
      'Keep torso upright',
      'Take controlled steps',
      'Maintain balance',
      'Alternate legs'
    ],
    commonMistakes: [
      'Knee extending past toes',
      'Leaning forward too much',
      'Uneven steps',
      'Poor balance'
    ]
  }
};

const Guide = () => {
  const { exerciseType } = useParams();
  const guide = exerciseGuides[exerciseType];

  if (!guide) {
    return (
      <Box className="min-h-screen bg-gray-900 py-12 px-4">
        <Typography variant="h4" color="error" align="center">
          Exercise guide not found
        </Typography>
      </Box>
    );
  }

  return (
    <Box className="min-h-screen bg-gray-900 py-12 px-4">
      <Paper elevation={3} className="max-w-4xl mx-auto p-6 rounded-xl">
        <Grid container spacing={4}>
          {/* Header Section */}
          <Grid item xs={12}>
            <Typography variant="h3" gutterBottom className="text-center font-bold">
              {guide.title}
            </Typography>
            <Typography variant="subtitle1" className="text-center mb-6" color="text.secondary">
              {guide.description}
            </Typography>
            <Divider />
          </Grid>

          {/* Image Section */}
          <Grid item xs={12} md={6}>
            <img
              src={guide.image}
              alt={guide.title}
              className="w-full h-auto rounded-lg shadow-lg"
              style={{ maxHeight: '400px', objectFit: 'cover' }}
            />
          </Grid>

          {/* Instructions Section */}
          <Grid item xs={12} md={6}>
            <Typography variant="h6" gutterBottom className="flex items-center gap-2">
              <FitnessCenter color="primary" />
              Steps
            </Typography>
            <List>
              {guide.steps.map((step, index) => (
                <ListItem key={index}>
                  <ListItemIcon>
                    <CheckCircle color="primary" />
                  </ListItemIcon>
                  <ListItemText primary={step} />
                </ListItem>
              ))}
            </List>
          </Grid>

          {/* Tips Section */}
          <Grid item xs={12} md={6}>
            <Typography variant="h6" gutterBottom className="flex items-center gap-2">
              <Info color="info" />
              Pro Tips
            </Typography>
            <List>
              {guide.tips.map((tip, index) => (
                <ListItem key={index}>
                  <ListItemIcon>
                    <CheckCircle color="info" />
                  </ListItemIcon>
                  <ListItemText primary={tip} />
                </ListItem>
              ))}
            </List>
          </Grid>

          {/* Common Mistakes Section */}
          <Grid item xs={12} md={6}>
            <Typography variant="h6" gutterBottom className="flex items-center gap-2">
              <Warning color="warning" />
              Common Mistakes to Avoid
            </Typography>
            <List>
              {guide.commonMistakes.map((mistake, index) => (
                <ListItem key={index}>
                  <ListItemIcon>
                    <Warning color="warning" />
                  </ListItemIcon>
                  <ListItemText primary={mistake} />
                </ListItem>
              ))}
            </List>
          </Grid>
        </Grid>
      </Paper>
    </Box>
  );
};

export default Guide;
