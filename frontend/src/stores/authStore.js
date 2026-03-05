import { defineStore } from 'pinia'
import { supabase } from '../services/supabase'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null,
    session: null,
    loading: false,
    error: null,
    registrationMessage: null
  }),
  getters: {
    isAuthenticated: (state) => !!state.session,
    userId: (state) => state.session?.user?.id
  },
  actions: {
    async login(email, password) {
      this.loading = true
      this.error = null
      try {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        })
        if (error) throw error
        this.session = data.session
        this.user = data.user
        return true
      } catch (err) {
        this.error = err.message || 'Login failed'
        return false
      } finally {
        this.loading = false
      }
    },
    async register(email, password, username) {
      this.loading = true
      this.error = null
      this.registrationMessage = null
      try {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              username: username
            }
          }
        })
        if (error) throw error
        
        this.user = data.user
        this.session = data.session

        if (!data.session && data.user) {
          this.registrationMessage = '¡Registro casi completo! Por favor, revisa tu correo para confirmar tu cuenta.'
        }
        
        return true
      } catch (err) {
        this.error = err.message || 'Registration failed'
        return false
      } finally {
        this.loading = false
      }
    },
    async logout() {
      await supabase.auth.signOut()
      this.session = null
      this.user = null
    },
    async checkAuth() {
        const { data: { session } } = await supabase.auth.getSession()
        this.session = session
        this.user = session?.user || null
        
        // Listen for auth changes only if not already listening
        if (!this.authListener) {
          const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            this.session = session
            this.user = session?.user || null
          })
          this.authListener = subscription
        }
    }
  }
})
