<template>
  <div class="task-manager">

    <div class="settings-toggle">
      <button @click="showSettings = !showSettings" class="btn btn-secondary">
        {{ showSettings ? 'Ocultar Configuración' : '⚙️ Gestionar Categorías y Etiquetas' }}
      </button>
    </div>

    <div v-if="showSettings" class="settings-panel">
      <CategoryManager />
      <TagManager />
    </div>

    <section class="task-form card">
      <h2>{{ editingTask ? 'Editar Tarea' : 'Nueva Tarea' }}</h2>
      <form @submit.prevent="handleSubmit">
        <div class="form-group">
          <input
            v-model="form.title"
            type="text"
            placeholder="Título de la tarea"
            required
            class="input-field"
          />
        </div>

        <div class="form-group">
          <textarea
            v-model="form.description"
            placeholder="Descripción (opcional)"
            rows="3"
            class="input-field"
          ></textarea>
        </div>

        <div class="form-row">
          <div class="form-group half">
            <label for="priority">Prioridad:</label>
            <select v-model="form.priority" id="priority" class="select-field">
              <option value="low">Baja 🟢</option>
              <option value="medium">Media 🟠</option>
              <option value="high">Alta 🔴</option>
            </select>
          </div>

          <div class="form-group half">
            <label for="category">Categoría:</label>
            <select v-model="form.category_id" id="category" class="select-field">
              <option :value="null">Sin Categoría</option>
              <option v-for="cat in categoryStore.categories" :key="cat.id" :value="cat.id">
                {{ cat.name }}
              </option>
            </select>
          </div>
        </div>

        <div class="form-group">
          <label>Etiquetas:</label>
          <div class="tags-input">
            <span
              v-for="tag in tagStore.tags"
              :key="tag.id"
              class="tag-pill select-tag"
              :class="{ selected: form.tags.includes(tag.id) }"
              :style="{
                borderColor: tag.color,
                backgroundColor: form.tags.includes(tag.id) ? tag.color : 'transparent',
                color: form.tags.includes(tag.id) ? '#fff' : tag.color
              }"
              @click="toggleTag(tag.id)"
            >
              {{ tag.name }}
            </span>
          </div>
        </div>

        <div class="form-actions">
          <button type="submit" class="btn btn-primary" :disabled="store.loading">
            {{ editingTask ? '💾 Actualizar' : '✨ Crear Tarea' }}
          </button>
          <button
            v-if="editingTask"
            type="button"
            @click="cancelEdit"
            class="btn btn-secondary"
          >
            ❌ Cancelar
          </button>
        </div>
      </form>
    </section>

    <section class="task-list">
      <div class="list-header">
        <h2>📋 Lista de Tareas</h2>

        <div class="filters">
            <select v-model="store.categoryFilter" class="filter-select">
                <option :value="null">Todas las Categorías</option>
                <option v-for="cat in categoryStore.categories" :key="cat.id" :value="cat.id">
                    {{ cat.name }}
                </option>
            </select>
        </div>

        <div class="stats" v-if="store.tasks.length">
            <span class="badge">Pendientes: {{ store.pendingTasksCount }}</span>
        </div>
      </div>

      <!-- Statistics Section -->
      <div v-if="Object.keys(store.tasksByCategory).length > 0" class="stats-bar">
         <div v-for="(count, catName) in store.tasksByCategory" :key="catName" class="stat-item">
            <strong>{{ catName }}:</strong> {{ count }}
         </div>
      </div>

      <div v-if="store.loading && !store.tasks.length" class="loading">Cargando tareas...</div>
      <div v-else-if="store.error" class="error">{{ store.error }}</div>
      <div v-else-if="store.filteredTasks.length === 0" class="empty">
        No hay tareas que coincidan con los filtros.
      </div>

      <div v-else class="tasks-container">
        <TransitionGroup name="list" tag="div" class="tasks">
          <div
            v-for="task in store.sortedTasks"
            :key="task.id"
            class="task-item card"
            :class="{ completed: task.completed, [`priority-${task.priority}`]: true }"
            :style="task.category ? { borderRight: `5px solid ${task.category.color}` } : {}"
          >
            <div class="task-content">
              <div class="task-header">
                <h3>{{ task.title }}</h3>
                <div class="badges">
                    <span class="priority-badge" :class="task.priority">
                    {{ getPriorityLabel(task.priority) }}
                    </span>
                    <span v-if="task.category" class="category-badge" :style="{ backgroundColor: task.category.color }">
                        {{ task.category.name }}
                    </span>
                </div>
              </div>
              <p v-if="task.description">{{ task.description }}</p>

              <div class="task-tags" v-if="task.tags && task.tags.length">
                  <span
                    v-for="tag in task.tags"
                    :key="tag.id"
                    class="tag-mini"
                    :style="{ color: tag.color, borderColor: tag.color, backgroundColor: tag.color + '15' }"
                  >
                    #{{ tag.name }}
                  </span>
              </div>

              <small>Creada: {{ formatDate(task.created_at) }}</small>
            </div>
            <div class="task-actions">
              <button
                @click="store.updateTask(task.id, { completed: !task.completed })"
                class="btn-icon"
                :title="task.completed ? 'Marcar como pendiente' : 'Marcar como completada'"
              >
                {{ task.completed ? '↩️' : '✅' }}
              </button>
              <button
                @click="startEdit(task)"
                class="btn-icon"
                title="Editar tarea"
              >
                ✏️
              </button>
              <button
                @click="confirmDelete(task.id)"
                class="btn-icon btn-danger"
                title="Eliminar tarea"
              >
                🗑️
              </button>
            </div>
          </div>
        </TransitionGroup>
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useTaskStore } from '../stores/taskStore'
import { useCategoryStore } from '../stores/categoryStore'
import { useTagStore } from '../stores/tagStore'
import CategoryManager from './CategoryManager.vue'
import TagManager from './TagManager.vue'

const store = useTaskStore()
const categoryStore = useCategoryStore()
const tagStore = useTagStore()

const showSettings = ref(false)

const form = ref({
  title: '',
  description: '',
  priority: 'medium',
  category_id: null,
  tags: []
})

const editingTask = ref(null)

onMounted(() => {
  store.fetchTasks()
  categoryStore.fetchCategories()
  tagStore.fetchTags()
})

const toggleTag = (tagId) => {
  const index = form.value.tags.indexOf(tagId)
  if (index === -1) {
    form.value.tags.push(tagId)
  } else {
    form.value.tags.splice(index, 1)
  }
}

const handleSubmit = async () => {
  if (!form.value.title.trim()) return

  if (editingTask.value) {
    await store.updateTask(editingTask.value.id, { ...form.value })
    cancelEdit()
  } else {
    await store.addTask({ ...form.value })
    // Reset form
    form.value = { title: '', description: '', priority: 'medium', category_id: null, tags: [] }
  }
}

const startEdit = (task) => {
  editingTask.value = task
  form.value = {
    title: task.title,
    description: task.description || '',
    priority: task.priority || 'medium',
    category_id: task.category ? task.category.id : null,
    tags: task.tags ? task.tags.map(t => t.id) : []
  }
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

const cancelEdit = () => {
  editingTask.value = null
  form.value = { title: '', description: '', priority: 'medium', category_id: null, tags: [] }
}

const confirmDelete = async (id) => {
  if (confirm('¿Estás seguro de que quieres eliminar esta tarea?')) {
    await store.removeTask(id)
  }
}

const formatDate = (dateString) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const getPriorityLabel = (priority) => {
  const labels = {
    low: 'Baja',
    medium: 'Media',
    high: 'Alta'
  }
  return labels[priority] || priority
}
</script>

<style scoped>
.task-manager {
  max-width: 800px;
  margin: 0 auto;
}

.settings-toggle {
    text-align: right;
    margin-bottom: 1rem;
}

.settings-panel {
    margin-bottom: 2rem;
}

.card {
  background: var(--surface-color);
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s, box-shadow 0.2s;
}

.task-form {
  margin-bottom: 2rem;
  background: var(--surface-color);
  border: 1px solid var(--border-color);
}

.input-field, .select-field {
  width: 100%;
  padding: 0.8rem;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  background: var(--bg-color);
  color: var(--text-color);
  font-size: 1rem;
  margin-bottom: 1rem;
}

.form-row {
    display: flex;
    gap: 1rem;
}
.half {
    flex: 1;
}

.form-group {
    margin-bottom: 1rem;
}

.form-group label {
    display: block;
    margin-bottom: 0.5rem;
    font-weight: bold;
}

.tags-input {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
}

.select-tag {
    cursor: pointer;
    user-select: none;
    transition: all 0.2s;
}

.form-actions {
  display: flex;
  gap: 1rem;
  margin-top: 1rem;
}

.btn {
  padding: 0.8rem 1.5rem;
  border-radius: 8px;
  border: none;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-primary {
  background-color: var(--primary-color);
  color: white;
}
.btn-primary:hover {
  background-color: var(--primary-hover);
}
.btn-secondary {
  background-color: var(--secondary-color);
  color: white;
}

.list-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1rem;
    flex-wrap: wrap;
    gap: 1rem;
}

.filters {
    flex: 1;
}
.filter-select {
    padding: 0.5rem;
    border-radius: 6px;
    border: 1px solid var(--border-color);
    background: var(--bg-color);
    color: var(--text-color);
}

.stats-bar {
    display: flex;
    gap: 1rem;
    padding: 0.5rem 1rem;
    background: var(--bg-color);
    border-radius: 8px;
    margin-bottom: 1rem;
    font-size: 0.9rem;
    flex-wrap: wrap;
}

.task-item {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 1rem;
  margin-bottom: 1rem;
  border-left: 5px solid transparent;
}

.task-item.priority-high { border-left-color: var(--danger-color); }
.task-item.priority-medium { border-left-color: var(--warning-color); }
.task-item.priority-low { border-left-color: var(--success-color); }

.task-item.completed {
  opacity: 0.6;
  background: var(--bg-color);
}
.task-item.completed h3 {
  text-decoration: line-through;
}

.task-header {
    display: flex;
    align-items: center;
    gap: 0.8rem;
    margin-bottom: 0.5rem;
    flex-wrap: wrap;
}

.badges {
    display: flex;
    gap: 0.5rem;
    align-items: center;
}

.priority-badge {
    font-size: 0.75rem;
    padding: 0.2rem 0.5rem;
    border-radius: 12px;
    font-weight: bold;
    text-transform: uppercase;
}
.priority-badge.high { background: rgba(255, 107, 107, 0.2); color: var(--danger-color); }
.priority-badge.medium { background: rgba(255, 159, 67, 0.2); color: var(--warning-color); }
.priority-badge.low { background: rgba(29, 209, 161, 0.2); color: var(--success-color); }

.category-badge {
    font-size: 0.75rem;
    padding: 0.2rem 0.6rem;
    border-radius: 12px;
    color: white;
    font-weight: bold;
}

.task-tags {
    margin-top: 0.5rem;
    display: flex;
    gap: 0.3rem;
    flex-wrap: wrap;
}

.tag-mini {
    font-size: 0.75rem;
    padding: 0.1rem 0.4rem;
    border-radius: 4px;
    border: 1px solid;
}

.tag-pill {
  display: inline-flex;
  align-items: center;
  padding: 0.3rem 0.6rem;
  border-radius: 999px;
  border: 1px solid;
  font-size: 0.85rem;
}

/* Animation classes */
.list-enter-active,
.list-leave-active {
  transition: all 0.4s ease;
}
.list-enter-from,
.list-leave-to {
  opacity: 0;
  transform: translateY(20px);
}
.list-move {
  transition: transform 0.4s ease;
}
</style>
