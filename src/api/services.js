import api from './axios';

// Auth
export const register      = (data) => api.post('/auth/register', data);
export const login         = (data) => api.post('/auth/login', data);
export const getMe         = ()     => api.get('/auth/me');
export const updatePassword= (data) => api.put('/auth/update-password', data);

// User
export const getProfile    = ()     => api.get('/users/profile');
export const updateProfile = (data) => api.put('/users/profile', data);
export const getUserStats  = ()     => api.get('/users/stats');

// Activities
export const logActivity      = (data)   => api.post('/activities', data);
export const getActivities    = (params) => api.get('/activities', { params });
export const getProgress      = (days)   => api.get(`/activities/progress?days=${days}`);
export const deleteActivity   = (id)     => api.delete(`/activities/${id}`);

// Workouts
export const getWorkouts   = (params) => api.get('/workouts', { params });
export const getWorkout    = (id)     => api.get(`/workouts/${id}`);
export const getRecommend  = (data)   => api.post('/workouts/recommend', data);
export const getMyPlan     = ()       => api.get('/workouts/my-plan');

// Bookings
export const createBooking = (data) => api.post('/bookings', data);
export const getMyBookings = ()     => api.get('/bookings');
export const cancelBooking = (id, reason) => api.patch(`/bookings/${id}/cancel`, { reason });

// Notifications
export const getNotifications = () => api.get('/notifications');
export const markAllRead      = () => api.patch('/notifications/read-all');
