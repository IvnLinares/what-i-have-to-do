import axios from 'axios'

// Supabase Edge Functions base URL
const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://pemudfoinavlslhkgjlk.supabase.co/functions/v1'

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
    return apiClient.post('/auth', { action: 'login', ...credentials })
  },
  register(credentials) {
    return apiClient.post('/auth', { action: 'register', ...credentials })
  },
  getMe() {
    return apiClient.get('/auth')
  },

  // Tasks API
  getTasks() {
    return apiClient.get('/tasks')
  },
  
  getTask(id) {
    return apiClient.get(`/tasks/${id}`)
  },
  
  createTask(task) {
    return apiClient.post('/tasks', task)
  },
  
  updateTask(id, task) {
    return apiClient.put(`/tasks/${id}`, task)
  },
  
  deleteTask(id) {
    return apiClient.delete(`/tasks/${id}`)
  },

  // Categories API
  getCategories() {
    return apiClient.get('/categories')
  },

  createCategory(category) {
    return apiClient.post('/categories', category)
  },

  updateCategory(id, category) {
    return apiClient.put(`/categories/${id}`, category)
  },

  deleteCategory(id) {
    return apiClient.delete(`/categories/${id}`)
  },

  // Tags API
  getTags() {
    return apiClient.get('/tags')
  },

  createTag(tag) {
    return apiClient.post('/tags', tag)
  },

  updateTag(id, tag) {
    return apiClient.put(`/tags/${id}`, tag)
  },

  deleteTag(id) {
    return apiClient.delete(`/tags/${id}`)
  }
}
