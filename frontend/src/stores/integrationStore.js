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
      // Integrations not available in this version
      this.loading = false
      this.integrations = []
      return
    },

    async connectIcloud(credentials) {
      // Integrations not available in this version
      return false
    },

    async disconnect(service) {
      // Integrations not available in this version
      return
n    }
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
