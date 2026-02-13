import { defineStore } from 'pinia'
import api from '../services/api'

export const useTaskStore = defineStore('task', {
  state: () => ({
    tasks: [],
    loading: false,
    error: null,
    filter: 'all'
  }),
  getters: {
    sortedTasks: (state) => {
      // Sort by completion (pending first) then by priority (high > medium > low) then by date
      const priorityWeight = { high: 3, medium: 2, low: 1 }

      return [...state.tasks].sort((a, b) => {
        // 1. Completed tasks go to bottom
        if (a.completed !== b.completed) {
            return a.completed ? 1 : -1
        }

        // 2. Sort by priority (descending weight)
        const pA = priorityWeight[a.priority] || 2
        const pB = priorityWeight[b.priority] || 2
        if (pA !== pB) {
            return pB - pA
        }

        // 3. Sort by date (newest first)
        return new Date(b.created_at) - new Date(a.created_at)
      })
    },
    pendingTasksCount: (state) => state.tasks.filter(t => !t.completed).length
  },
  actions: {
    async fetchTasks() {
      this.loading = true
      this.error = null
      try {
        const response = await api.getTasks()
        this.tasks = response.data.tasks
      } catch (err) {
        this.error = 'Error loading tasks: ' + (err.response?.data?.error || err.message)
        console.error(err)
      } finally {
        this.loading = false
      }
    },
    async addTask(task) {
      this.error = null
      try {
        await api.createTask(task)
        await this.fetchTasks()
      } catch (err) {
        this.error = 'Error adding task: ' + (err.response?.data?.error || err.message)
        throw err
      }
    },
    async updateTask(id, updates) {
      this.error = null
      try {
        await api.updateTask(id, updates)
        await this.fetchTasks()
      } catch (err) {
        this.error = 'Error updating task: ' + (err.response?.data?.error || err.message)
        throw err
      }
    },
    async removeTask(id) {
      this.error = null
      try {
        await api.deleteTask(id)
        this.tasks = this.tasks.filter(t => t.id !== id)
      } catch (err) {
        this.error = 'Error deleting task: ' + (err.response?.data?.error || err.message)
        throw err
      }
    }
  }
})
