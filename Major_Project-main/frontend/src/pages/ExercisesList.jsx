import React from 'react';
import { useNavigate } from 'react-router-dom';

import bicepCurls from '../assets/bicecp.jpg';
import squats from '../assets/squats.jpg';
import pushups from '../assets/pushups.jpg';
import planks from '../assets/planks.jpg';
import lunges from '../assets/lunges.jpg';
import Carousel from '../components/Carousel';

const ExercisesList = () => {
  const navigate = useNavigate();

  const exercises = [
    {
      id: 'bicep_curls',
      name: 'Bicep Curls',
      description: 'Build stronger biceps with proper form',
      image: bicepCurls,
      buttons: [
        {
          text: 'Start',
          onClick: () => navigate(`/exercise/bicep_curls/realtime`),
        },
        {
          text: 'Upload Video',
          onClick: () => navigate(`/exercise/bicep_curls/upload`),
        },
      ],
    },
    {
      id: 'squats',
      name: 'Squats',
      description: 'Perfect your squat technique',
      image: squats,
      buttons: [
        {
          text: 'Start',
          onClick: () => navigate(`/exercise/squats/realtime`),
        },
        {
          text: 'Upload Video',
          onClick: () => navigate(`/exercise/squats/upload`),
        },
      ],
    },
    {
      id: 'pushups',
      name: 'Push-ups',
      description: 'Master the push-up form',
      image: pushups,
      buttons: [
        {
          text: 'Start',
          onClick: () => navigate(`/exercise/pushups/realtime`),
        },
        {
          text: 'Upload Video',
          onClick: () => navigate(`/exercise/pushups/upload`),
        },
      ],
    },
    {
      id: 'planks',
      name: 'Planks',
      description: 'Hold perfect plank position',
      image: planks,
      buttons: [
        {
          text: 'Start',
          onClick: () => navigate(`/exercise/planks/realtime`),
        },
        {
          text: 'Upload Video',
          onClick: () => navigate(`/exercise/planks/upload`),
        },
      ],
    },
    {
      id: 'lunges',
      name: 'Lunges',
      description: 'Perfect your lunge technique',
      image: lunges,
      buttons: [
        {
          text: 'Start',
          onClick: () => navigate(`/exercise/lunges/realtime`),
        },
        {
          text: 'Upload Video',
          onClick: () => navigate(`/exercise/lunges/upload`),
        },
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-gray-900 py-12 px-4 sm:px-6 lg:px-8 overflow-hidden">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold text-white mb-8 text-center">
          {/* Choose Your Exercise */}
        </h1>
        <Carousel slides={exercises} />
      </div>
    </div>
  );
};

export default ExercisesList;