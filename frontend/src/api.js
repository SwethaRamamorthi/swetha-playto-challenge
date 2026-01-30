import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000/api';

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Add auth token to requests if available
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
        config.headers.Authorization = `Token ${token}`;
    }
    return config;
});

export const authAPI = {
    login: (username, password) => api.post('/auth/login/', { username, password }),
    logout: () => api.post('/auth/logout/'),
};

export const postsAPI = {
    getAll: () => api.get('/posts/'),
    getById: (id) => api.get(`/posts/${id}/`),
    create: (content) => api.post('/posts/', { content }),
    like: (id) => api.post(`/posts/${id}/like/`),
};

export const commentsAPI = {
    create: (postId, content, parentId = null) =>
        api.post('/comments/', { post: postId, content, parent: parentId }),
    like: (id) => api.post(`/comments/${id}/like/`),
};

export const leaderboardAPI = {
    get: () => api.get('/leaderboard/'),
};

export default api;
