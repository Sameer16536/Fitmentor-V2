import axios from "axios";

// Backend Base URL
const IP_ADDRESS_BACKEND = "http://localhost:8000";

// Define the interface for API call parameters

const apiCall = async ({
  method,
  url,
  data,
  headers,
}) => {
  try {
    const response = await axios({
      method,
      url: `${IP_ADDRESS_BACKEND}${url}`,
      data,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("authToken")}`,
        ...headers,
      },
    });
    return response.data;
  } catch (error) {
    console.error("API call error:", error);
    if (error.response?.status === 401) {
      localStorage.removeItem("authToken");
      localStorage.removeItem("user");
      window.location.href = "/login";
    }
    throw error;
  }
};

export const APIUtility = {
  loginUser: (body) =>
    axios.post(`${IP_ADDRESS_BACKEND}/api/auth/login/`, body, {
      headers: {
        "Content-Type": "application/json",
      },
    }).then(response => response.data),

  registerUser: (body) =>
    axios.post(`${IP_ADDRESS_BACKEND}/api/auth/register/`, body, {
      headers: {
        "Content-Type": "application/json",
      },
    }).then(response => response.data),

  logoutUser: () =>
    apiCall({
      method: "GET",
      url: "/api/auth/logout/",
      data: {
        refresh: localStorage.getItem("refreshToken"),
      },
    }),

  getUserStats: () =>
    apiCall({
      method: "GET",
      url: "/api/auth/stats/",
    }),

  uploadVideo: (exerciseType, formData) =>
    apiCall({
      method: "POST",
      url: `/api/exercises/${exerciseType}/upload/`,
      data: formData,
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }),

  getExerciseHistory: () =>
    apiCall({
      method: "GET",
      url: "/api/exercises/history/",
    }),

  getExerciseTypes: () =>
    apiCall({
      method: "GET",
      url: "/api/exercises/types/",
    }),

  getExerciseDetails: (exerciseId) =>
    apiCall({
      method: "GET",
      url: `/api/exercises/${exerciseId}/`,
    }),

  saveExerciseSession: (exerciseType, sessionData) =>
    apiCall({
      method: "POST",
      url: `/api/exercises/${exerciseType}/save/`,
      data: sessionData,
    }),

  // Goals and Progress APIs
  updateUserGoals: (body) =>
    apiCall({
      method: "PATCH",
      url: "/api/auth/goals/",
      data: body,
    }),

  getProgressStats: () =>
    apiCall({
      method: "GET",
      url: "/api/auth/progress/",
    }),

  // Workout Plan APIs
  getWorkoutPlans: () =>
    apiCall({
      method: "GET",
      url: "/api/workouts/plans/",
    }),

  getWorkoutPlanDetails: (planId) =>
    apiCall({
      method: "GET",
      url: `/api/workouts/plans/${planId}/`,
    }),

  createCustomWorkout: (body) =>
    apiCall({
      method: "POST",
      url: "/api/workouts/custom/",
      data: body,
    }),

  // Achievement APIs
  getUserAchievements: () =>
    apiCall({
      method: "GET",
      url: "/api/auth/achievements/",
    }),

  // Feedback APIs
  submitExerciseFeedback: (exerciseId, body) =>
    apiCall({
      method: "POST",
      url: `/api/exercises/${exerciseId}/feedback/`,
      data: body,
    }),

  // Settings APIs
  updateUserSettings: (body) =>
    apiCall({
      method: "PATCH",
      url: "/api/auth/settings/update/",
      data: body,
    }),

  getUserSettings: () =>
    apiCall({
      method: "GET",
      url: "/api/auth/settings/",
    }),

  // Notification APIs
  getNotifications: () =>
    apiCall({
      method: "GET",
      url: "/api/user/notifications/",
    }),

  markNotificationRead: (notificationId) =>
    apiCall({
      method: "POST",
      url: `/api/user/notifications/${notificationId}/read/`,
    }),

  updateNotificationSettings: (body) =>
    apiCall({
      method: "PATCH",
      url: "/api/user/notification-settings/",
      data: body,
    }),

  // Analytics APIs
  getExerciseAnalytics: (exerciseType, timeRange) =>
    apiCall({
      method: "GET",
      url: `/api/analytics/exercise/${exerciseType}/`,
      params: { timeRange },
    }),

  getOverallProgress: (timeRange) =>
    apiCall({
      method: "GET",
      url: "/api/analytics/progress/",
      params: { timeRange },
    }),

  getVideoAnalysis: (exerciseId, exerciseType) =>
    apiCall({
      method: "GET",
      url: `/api/exercises/${exerciseId}/analysis/`,
      params: {
        exercise_type: exerciseType
      }
    }),

  getUserExercises: () =>
    apiCall({
      method: "GET",
      url: "/api/exercises/user/",
    }),

  startAnalysis: (exerciseId, formData, exerciseType) =>
    apiCall({
      method: "POST",
      url: `/api/exercises/${exerciseId}/analyze/`,
      data: {
        exercise_type: exerciseType,
        ...formData
      },
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }),

  updateExerciseStats: (statsData) =>
    apiCall({
      method: "POST",
      url: "/api/exercises/update-stats/",
      data: statsData
    }),

  updateUserStats: (statsData) =>
    apiCall({
      method: "POST",
      url: "/api/auth/update-stats/",
      data: statsData
    }),

  sendResetOTP: (body) =>
    axios.post(`${IP_ADDRESS_BACKEND}/api/auth/send-reset-otp/`, body, {
      headers: {
        "Content-Type": "application/json",
      },
    }).then(response => response.data),

  verifyResetOTP: (body) =>
    axios.post(`${IP_ADDRESS_BACKEND}/api/auth/verify-reset-otp/`, body, {
      headers: {
        "Content-Type": "application/json",
      },
    }).then(response => response.data),

  resetPassword: (body) =>
    axios.put(`${IP_ADDRESS_BACKEND}/api/auth/reset-password/`, body, {
      headers: {
        "Content-Type": "application/json",
      },
    }).then(response => response.data),
};