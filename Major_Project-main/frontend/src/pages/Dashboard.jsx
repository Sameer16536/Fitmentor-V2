import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { APIUtility } from '../services/Api';
import NavBar from '../components/Navbar';
import bicepCurls from '../assets/bicecp.jpg';
import squats from '../assets/squats.jpg';
import pushups from '../assets/pushups.jpg';

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
    <NavBar>
      <div className="min-h-screen bg-gray-100 py-6 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Choose an Exercise</h1>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {exercises.map((exercise) => (
              <div
                key={exercise.id}
                className="bg-white overflow-hidden shadow-sm rounded-lg cursor-pointer hover:shadow-lg transition-shadow duration-300"
                onClick={() => navigate(`/exercise/${exercise.id}`)}
              >
                <div className="p-6">
                  <div className="aspect-w-16 aspect-h-9 mb-4">
                    <img
                      src={exercise.image}
                      alt={exercise.name}
                      className="object-cover rounded-lg"
                    />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    {exercise.name}
                  </h3>
                  <p className="text-gray-600">{exercise.description}</p>
                  <div className="mt-4 flex gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/exercise/${exercise.id}/realtime`);
                      }}
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
                    >
                      Start Realtime
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/exercise/${exercise.id}/upload`);
                      }}
                      className="inline-flex items-center px-4 py-2 border border-indigo-600 text-sm font-medium rounded-md text-indigo-600 bg-white hover:bg-indigo-50"
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
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Recent Exercises</h2>
              <div className="grid grid-cols-1 gap-4">
                {recentExercises.map((exercise) => (
                  <div
                    key={exercise.id}
                    className="bg-white p-4 rounded-lg shadow hover:shadow-md transition-shadow"
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <h3 className="text-lg font-semibold">{exercise.exercise_name}</h3>
                        <p className="text-sm text-gray-600">
                          Accuracy: {exercise.form_accuracy}%
                        </p>
                      </div>
                      <button
                        onClick={() => navigate(`/exercise/${exercise.id}/analysis`)}
                        className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
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
    </NavBar>
  );
};

export default Dashboard;