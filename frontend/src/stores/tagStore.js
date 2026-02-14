import { defineStore } from 'pinia'
import api from '../services/api'

export const useTagStore = defineStore('tag', {
  state: () => ({
    tags: [],
    loading: false,
    error: null
  }),
  actions: {
    async fetchTags() {
      this.loading = true
      try {
        const response = await api.getTags()
        this.tags = response.data.tags
      } catch (err) {
        this.error = 'Error loading tags: ' + (err.response?.data?.error || err.message)
      } finally {
        this.loading = false
      }
    },
    async createTag(tag) {
      try {
        const response = await api.createTag(tag)
        this.tags.push(response.data.tag)
      } catch (err) {
        this.error = 'Error creating tag: ' + (err.response?.data?.error || err.message)
        throw err
      }
    },
    async updateTag(id, updates) {
      try {
        await api.updateTag(id, updates)
        const index = this.tags.findIndex(t => t.id === id)
        if (index !== -1) {
          this.tags[index] = { ...this.tags[index], ...updates }
        }
      } catch (err) {
        this.error = 'Error updating tag: ' + (err.response?.data?.error || err.message)
        throw err
      }
    },
    async deleteTag(id) {
      try {
        await api.deleteTag(id)
        this.tags = this.tags.filter(t => t.id !== id)
      } catch (err) {
        this.error = 'Error deleting tag: ' + (err.response?.data?.error || err.message)
        throw err
      }
    }
  }
})
