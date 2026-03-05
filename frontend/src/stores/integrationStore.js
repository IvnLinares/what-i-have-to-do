import { defineStore } from 'pinia'
import api from '../services/api'

export const useIntegrationStore = defineStore('integration', {
  state: () => ({
    integrations: [],
    loading: false,
    error: null
  }),

  actions: {
    async fetchIntegrations() {
      this.loading = true
      this.error = null
      try {
        const response = await api.get('/integrations')
        this.integrations = response.data
      } catch (err) {
        this.error = err.response?.data?.error || 'Error fetching integrations'
        console.error(err)
      } finally {
        this.loading = false
      }
    },

    async connectIcloud(credentials) {
      this.loading = true
      this.error = null
      try {
        await api.post('/integrations/connect/icloud', credentials)
        await this.fetchIntegrations()
        return true
      } catch (err) {
        this.error = err.response?.data?.error || 'Error connecting iCloud'
        return false
      } finally {
        this.loading = false
      }
    },

    async disconnect(service) {
      this.loading = true
      this.error = null
      try {
        await api.delete(`/integrations/${service}`)
        await this.fetchIntegrations()
      } catch (err) {
        this.error = err.response?.data?.error || 'Error disconnecting service'
      } finally {
        this.loading = false
      }
    },

    async syncAll() {
      this.loading = true
      this.error = null
      try {
        await api.post('/integrations/sync')
        await this.fetchIntegrations() // Refresh last_sync timestamps
      } catch (err) {
        this.error = err.response?.data?.error || 'Error syncing'
      } finally {
        this.loading = false
      }
    }
  }
})
