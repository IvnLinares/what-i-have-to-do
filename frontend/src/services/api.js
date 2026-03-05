import axios from 'axios'

// Supabase Edge Functions base URL
const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://pemudfoinavlslhkgjlk.supabase.co/functions/v1'

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
})

// Add interceptor to include token from Supabase session
apiClient.interceptors.request.use(async config => {
  // We'll import supabase dynamically to avoid circular dependencies if any
  const { supabase } = await import('./supabase')
  const { data: { session } } = await supabase.auth.getSession()
  
  if (session?.access_token) {
    config.headers.Authorization = `Bearer ${session.access_token}`
  }
  return config
})

export default {
  // Auth API
  // Handled by supabase-js directly now
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
