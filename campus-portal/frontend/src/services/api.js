import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json'
    }
});

// Add token to requests
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Handle response errors
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

// Auth APIs
export const login = (credentials) => api.post('/auth/login', credentials);
export const register = (userData) => api.post('/auth/register', userData);
export const getProfile = () => api.get('/auth/profile');
export const logout = () => api.post('/auth/logout');

// Password Reset APIs
export const forgotPassword = (email) => api.post('/password-reset/forgot-password', { email });
export const verifyResetToken = (token) => api.get(`/password-reset/verify-reset-token/${token}`);
export const resetPassword = (data) => api.post('/password-reset/reset-password', data);

// Student APIs
export const getStudents = () => api.get('/students');
export const getStudentById = (id) => api.get(`/students/${id}`);

// Attendance APIs
export const getMyAttendance = () => api.get('/attendance/my-attendance');
export const getAttendanceByCourse = (courseId) => api.get(`/attendance/course/${courseId}`);
export const markAttendance = (data) => api.post('/attendance/mark', data);

// Grade APIs
export const getMyGrades = () => api.get('/grades/my-grades');
export const getGradesByCourse = (courseId) => api.get(`/grades/course/${courseId}`);
export const addGrade = (data) => api.post('/grades/add', data);

export default api;
