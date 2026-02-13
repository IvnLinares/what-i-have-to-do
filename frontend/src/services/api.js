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
  },

  // Categories API
  getCategories() {
    return apiClient.get('/api/categories')
  },

  createCategory(category) {
    return apiClient.post('/api/categories', category)
  },

  updateCategory(id, category) {
    return apiClient.put(`/api/categories/${id}`, category)
  },

  deleteCategory(id) {
    return apiClient.delete(`/api/categories/${id}`)
  },

  // Tags API
  getTags() {
    return apiClient.get('/api/tags')
  },

  createTag(tag) {
    return apiClient.post('/api/tags', tag)
  },

  updateTag(id, tag) {
    return apiClient.put(`/api/tags/${id}`, tag)
  },

  deleteTag(id) {
    return apiClient.delete(`/api/tags/${id}`)
  }
}
