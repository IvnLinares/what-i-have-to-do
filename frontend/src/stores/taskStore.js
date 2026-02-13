import { defineStore } from 'pinia'
import api from '../services/api'

export const useTaskStore = defineStore('task', {
  state: () => ({
    tasks: [],
    loading: false,
    error: null,
    // Filters state
    searchQuery: '',
    filter: 'all', // 'all', 'active', 'completed'
    categoryFilter: null,
    priorityFilter: [], // ['low', 'medium', 'high']
    tagFilter: [], // array of tag IDs
    sortOption: 'smart' // 'smart', 'date-desc', 'date-asc', 'priority-desc', 'priority-asc', 'alpha-asc'
  }),
  getters: {
    // Filtered tasks based on state filters
    filteredTasks(state) {
      return state.tasks.filter(t => {
        // Search Query (Title or Description)
        if (state.searchQuery) {
            const query = state.searchQuery.toLowerCase()
            const matchTitle = t.title.toLowerCase().includes(query)
            const matchDesc = t.description && t.description.toLowerCase().includes(query)
            if (!matchTitle && !matchDesc) return false
        }

        // Status Filter
        if (state.filter === 'active' && t.completed) return false
        if (state.filter === 'completed' && !t.completed) return false

        // Category Filter
        if (state.categoryFilter && t.category_id != state.categoryFilter) return false

        // Priority Filter
        if (state.priorityFilter.length > 0 && !state.priorityFilter.includes(t.priority)) return false

        // Tag Filter
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
      const priorityWeight = { high: 3, medium: 2, low: 1 }
      const tasks = this.filteredTasks || []

      return [...tasks].sort((a, b) => {
        // Always sort completed to bottom regardless of sort option, unless specifically sorting by status (not implemented)
        // But users might want to see completed tasks sorted by date too.
        // Let's keep the "completed at bottom" logic for 'smart' sort, maybe relax for others?
        // For now, let's keep it consistent: Completed always last.
        if (a.completed !== b.completed) {
            return a.completed ? 1 : -1
        }

        switch (state.sortOption) {
            case 'date-desc':
                return new Date(b.created_at) - new Date(a.created_at)
            case 'date-asc':
                return new Date(a.created_at) - new Date(b.created_at)
            case 'priority-desc': // High to Low
                return (priorityWeight[b.priority] || 0) - (priorityWeight[a.priority] || 0)
            case 'priority-asc': // Low to High
                return (priorityWeight[a.priority] || 0) - (priorityWeight[b.priority] || 0)
            case 'alpha-asc':
                return a.title.localeCompare(b.title)
            case 'smart':
            default:
                // 1. Due Date (soonest first)
                if (a.due_date && b.due_date) {
                    return new Date(a.due_date) - new Date(b.due_date)
                }
                if (a.due_date && !b.due_date) return -1
                if (!a.due_date && b.due_date) return 1

                // 2. Priority
                const pA = priorityWeight[a.priority] || 2
                const pB = priorityWeight[b.priority] || 2
                if (pA !== pB) return pB - pA

                // 3. Created Date (newest first)
                return new Date(b.created_at) - new Date(a.created_at)
        }
      })
    },
    pendingTasksCount: (state) => state.tasks.filter(t => !t.completed).length,
    overdueTasksCount(state) {
        const now = new Date()
        return state.tasks.filter(t => !t.completed && t.due_date && new Date(t.due_date) < now).length
    },
    tasksByCategory(state) {
      const stats = {}
      state.tasks.forEach(task => {
        const catName = task.category ? task.category.name : 'Sin Categoría'
        if (!stats[catName]) stats[catName] = 0
        stats[catName]++
      })
      return stats
    },
    // Autocomplete suggestions
    searchSuggestions(state) {
        if (!state.searchQuery || state.searchQuery.length < 2) return []
        const query = state.searchQuery.toLowerCase()
        return state.tasks
            .filter(t => t.title.toLowerCase().includes(query))
            .map(t => t.title)
            .slice(0, 5) // Limit to 5 suggestions
    }
  },
  actions: {
    setSearchQuery(query) {
        this.searchQuery = query
    },
    setSortOption(option) {
        this.sortOption = option
    },
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
