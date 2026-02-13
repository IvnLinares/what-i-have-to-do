import { defineStore } from 'pinia'
import api from '../services/api'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null,
    token: localStorage.getItem('token') || null,
    loading: false,
    error: null
  }),
  getters: {
    isAuthenticated: (state) => !!state.token
  },
  actions: {
    async login(username, password) {
      this.loading = true
      this.error = null
      try {
        const response = await api.login({ username, password })
        this.token = response.data.token
        this.user = response.data.user
        localStorage.setItem('token', this.token)
        return true
      } catch (err) {
        this.error = err.response?.data?.error || 'Login failed'
        return false
      } finally {
        this.loading = false
      }
    },
    async register(username, password) {
      this.loading = true
      this.error = null
      try {
        const response = await api.register({ username, password })
        this.token = response.data.token
        this.user = response.data.user
        localStorage.setItem('token', this.token)
        return true
      } catch (err) {
        this.error = err.response?.data?.error || 'Registration failed'
        return false
      } finally {
        this.loading = false
      }
    },
    logout() {
      this.token = null
      this.user = null
      localStorage.removeItem('token')
    },
    async checkAuth() {
        if (!this.token) return
        try {
            const response = await api.getMe()
            this.user = response.data.user
        } catch (err) {
            this.logout()
        }
    }
  }
})
