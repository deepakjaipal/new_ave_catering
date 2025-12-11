import axios from "axios";

const api = axios.create({
  baseURL: "https://recent-api.onrender.com/api", 
  // headers: {
  //   "Content-Type": "application/json",
  // },
});

// Add request interceptor to include auth token
api.interceptors.request.use(
  (config) => {
    // Only access localStorage in the browser
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor to handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle network errors
    if (!error.response) {
      console.error('Network error:', error.message);
      return Promise.reject(new Error('Network error. Please check your connection.'));
    }

    // Handle 401 Unauthorized
    if (error.response?.status === 401) {
      // Only handle auth errors in the browser
      if (typeof window !== 'undefined') {
        localStorage.removeItem('token');
        // Don't redirect if we're already on login page
        if (window.location.pathname !== '/auth/login') {
          window.location.href = '/auth/login';
        }
      }
    }

    // Handle 404 Not Found
    if (error.response?.status === 404) {
      console.error('API endpoint not found:', error.config?.url);
      return Promise.reject(new Error('Resource not found. Please try again.'));
    }

    // Handle other errors
    const errorMessage = error.response?.data?.message || error.message || 'An error occurred';
    return Promise.reject(new Error(errorMessage));
  }
);

export default api;
