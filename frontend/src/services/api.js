import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
})

// Add interceptor to include token
apiClient.interceptors.request.use(config => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

export default {
  // Auth API
  login(credentials) {
    return apiClient.post('/api/auth/login', credentials)
  },
  register(credentials) {
    return apiClient.post('/api/auth/register', credentials)
  },
  getMe() {
    return apiClient.get('/api/auth/me')
  },

  // Tasks API
  getTasks() {
    return apiClient.get('/api/tasks')
  },
  
  getTask(id) {
    return apiClient.get(`/api/tasks/${id}`)
  },
  
  createTask(task) {
    return apiClient.post('/api/tasks', task)
  },
  
  updateTask(id, task) {
    return apiClient.put(`/api/tasks/${id}`, task)
  },
  
  deleteTask(id) {
    return apiClient.delete(`/api/tasks/${id}`)
  }
}
