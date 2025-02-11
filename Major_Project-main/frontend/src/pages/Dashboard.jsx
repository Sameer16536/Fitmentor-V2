import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { APIUtility } from '../services/Api';
import NavBar from '../components/Navbar';
import bicepCurls from '../assets/bicecp.jpg';
import squats from '../assets/squats.jpg';
import pushups from '../assets/pushups.jpg';
import planks from '../assets/planks.jpg';
import lunges from '../assets/lunges.jpg';

const exercises = [
  {
    id: 'bicep_curls',
    name: 'Bicep Curls',
    description: 'Build stronger biceps with proper form',
    image: bicepCurls
  },
  {
    id: 'squats',
    name: 'Squats',
    description: 'Perfect your squat technique',
    image: squats
  },
  {
    id: 'pushups',
    name: 'Push-ups',
    description: 'Master the push-up form',
    image: pushups
  },
  {
    id: 'planks',
    name: 'Planks',
    description: 'Hold perfect plank position',
    image: planks
  },
  {
    id: 'lunges',
    name: 'Lunges',
    description: 'Perfect your lunge form',
    image: lunges
  }
];

const Dashboard = () => {
  const navigate = useNavigate();
  const [recentExercises, setRecentExercises] = useState([]);

  useEffect(() => {
    // Fetch user's recent exercises
    const fetchRecentExercises = async () => {
      try {
        const response = await APIUtility.getUserExercises();
        setRecentExercises(response);
      } catch (error) {
        console.error('Error fetching recent exercises:', error);
      }
    };
    fetchRecentExercises();
  }, []);

  return (
    <div className="min-h-screen bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        
        
        {/* Exercise Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {exercises.map((exercise) => (
            <div
              key={exercise.id}
              className="bg-gray-800 rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300 flex flex-col h-full border border-gray-700"
            >
              {/* Image Container */}
              <div className="relative pt-[56.25%] w-full">
                <img
                  src={exercise.image}
                  alt={exercise.name}
                  className="absolute top-0 left-0 w-full h-full object-cover rounded-t-lg opacity-90 hover:opacity-100 transition-opacity"
                />
              </div>

              {/* Content Container */}
              <div className="p-6 flex flex-col flex-grow">
                <h3 className="text-xl font-semibold text-white mb-2">
                  {exercise.name}
                </h3>
                <p className="text-gray-400 mb-4 flex-grow">
                  {exercise.description}
                </p>
                
                {/* Buttons Container */}
                <div className="flex flex-col sm:flex-row gap-2 mt-auto">
                  <button
                    onClick={() => navigate(`/exercise/${exercise.id}/realtime`)}
                    className="w-full sm:w-1/2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                  >
                    Start 
                  </button>
                  <button
                    onClick={() => navigate(`/exercise/${exercise.id}/upload`)}
                    className="w-full sm:w-1/2 px-4 py-2 border border-blue-600 text-blue-400 rounded-md hover:bg-blue-900/30 transition-colors"
                  >
                    Upload Video
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Recent Exercises Section */}
        {recentExercises.length > 0 && (
          <div className="mt-12">
            <h2 className="text-2xl font-bold text-white mb-6">Recent Exercises</h2>
            <div className="grid grid-cols-1 gap-4">
              {recentExercises.map((exercise) => (
                <div
                  key={exercise.id}
                  className="bg-gray-800 p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow border border-gray-700"
                >
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                      <h3 className="text-lg font-semibold text-white">
                        {exercise.exercise_name}
                      </h3>
                      <p className="text-sm text-gray-400">
                        Accuracy: {exercise.form_accuracy}%
                      </p>
                    </div>
                    <button
                      onClick={() => navigate(`/exercise/${exercise.id}/analysis`)}
                      className="w-full sm:w-auto px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                    >
                      View Analysis
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;