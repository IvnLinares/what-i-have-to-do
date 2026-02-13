import { defineStore } from 'pinia'
import api from '../services/api'

export const useTaskStore = defineStore('task', {
  state: () => ({
    tasks: [],
    loading: false,
    error: null,
    filter: 'all', // 'all', 'active', 'completed'
    categoryFilter: null,
    tagFilter: [] // array of tag IDs
  }),
  getters: {
    // Filtered tasks based on state filters
    filteredTasks(state) {
      return state.tasks.filter(t => {
        // Status Filter
        if (state.filter === 'active' && t.completed) return false
        if (state.filter === 'completed' && !t.completed) return false

        // Category Filter
        // Use loose equality as select input might be string while category_id is number
        if (state.categoryFilter && t.category_id != state.categoryFilter) return false

        // Tag Filter (if any selected tag is present)
        if (state.tagFilter.length > 0) {
          if (!t.tags || t.tags.length === 0) return false
          const taskTagIds = t.tags.map(tag => tag.id)
          const hasTag = state.tagFilter.some(id => taskTagIds.includes(id))
          if (!hasTag) return false
        }

        return true
      })
    },
    // Sorted version of filtered tasks
    sortedTasks(state) {
      // Access other getters via 'this' in Options API
      // But getters receive state as first argument.
      // To access other getters, we must use `this` and define function normally (not arrow).
      // However, pinia getters: (state) => ... OR function() { return this.otherGetter }

      const priorityWeight = { high: 3, medium: 2, low: 1 }

      // We use `this.filteredTasks` because filteredTasks is a getter.
      // If we use state directly, we bypass filtering.
      // But getters are computed properties on the store instance.
      const tasks = this.filteredTasks || []

      return [...tasks].sort((a, b) => {
        // 1. Completed tasks go to bottom
        if (a.completed !== b.completed) {
            return a.completed ? 1 : -1
        }

        // 2. Sort by due date (soonest first)
        // Only if both have due dates.
        // If one has due date and other doesn't?
        // Let's prioritize due date if exists and overdue or soon.
        if (a.due_date && b.due_date) {
            return new Date(a.due_date) - new Date(b.due_date)
        }
        if (a.due_date && !b.due_date) return -1 // a comes first
        if (!a.due_date && b.due_date) return 1 // b comes first

        // 3. Sort by priority (descending weight)
        const pA = priorityWeight[a.priority] || 2
        const pB = priorityWeight[b.priority] || 2
        if (pA !== pB) {
            return pB - pA
        }

        // 4. Sort by date (newest first)
        return new Date(b.created_at) - new Date(a.created_at)
      })
    },
    pendingTasksCount: (state) => state.tasks.filter(t => !t.completed).length,
    overdueTasksCount(state) {
        const now = new Date()
        return state.tasks.filter(t => !t.completed && t.due_date && new Date(t.due_date) < now).length
    },

    // Stats: Tasks by Category
    tasksByCategory(state) {
      const stats = {}
      state.tasks.forEach(task => {
        const catName = task.category ? task.category.name : 'Sin Categoría'
        if (!stats[catName]) stats[catName] = 0
        stats[catName]++
      })
      return stats
    }
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
