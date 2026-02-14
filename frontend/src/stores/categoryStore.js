import { defineStore } from 'pinia'
import api from '../services/api'

export const useCategoryStore = defineStore('category', {
  state: () => ({
    categories: [],
    loading: false,
    error: null
  }),
  actions: {
    async fetchCategories() {
      this.loading = true
      try {
        const response = await api.getCategories()
        this.categories = response.data.categories
      } catch (err) {
        this.error = 'Error loading categories: ' + (err.response?.data?.error || err.message)
      } finally {
        this.loading = false
      }
    },
    async createCategory(category) {
      try {
        const response = await api.createCategory(category)
        this.categories.push(response.data.category)
      } catch (err) {
        this.error = 'Error creating category: ' + (err.response?.data?.error || err.message)
        throw err
      }
    },
    async updateCategory(id, updates) {
      try {
        await api.updateCategory(id, updates)
        const index = this.categories.findIndex(c => c.id === id)
        if (index !== -1) {
          this.categories[index] = { ...this.categories[index], ...updates }
        }
      } catch (err) {
        this.error = 'Error updating category: ' + (err.response?.data?.error || err.message)
        throw err
      }
    },
    async deleteCategory(id) {
      try {
        await api.deleteCategory(id)
        this.categories = this.categories.filter(c => c.id !== id)
      } catch (err) {
        this.error = 'Error deleting category: ' + (err.response?.data?.error || err.message)
        throw err
      }
    }
  }
})
