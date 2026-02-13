<template>
  <div class="task-manager">
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

        <div class="form-group">
          <label for="priority">Prioridad:</label>
          <select v-model="form.priority" id="priority" class="select-field">
            <option value="low">Baja 🟢</option>
            <option value="medium">Media 🟠</option>
            <option value="high">Alta 🔴</option>
          </select>
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
        <div class="stats" v-if="store.tasks.length">
            <span class="badge">Pendientes: {{ store.pendingTasksCount }}</span>
        </div>
      </div>

      <div v-if="store.loading && !store.tasks.length" class="loading">Cargando tareas...</div>
      <div v-else-if="store.error" class="error">{{ store.error }}</div>
      <div v-else-if="store.tasks.length === 0" class="empty">
        No hay tareas. ¡Crea tu primera tarea arriba!
      </div>

      <div v-else class="tasks-container">
        <TransitionGroup name="list" tag="div" class="tasks">
          <div
            v-for="task in store.sortedTasks"
            :key="task.id"
            class="task-item card"
            :class="{ completed: task.completed, [`priority-${task.priority}`]: true }"
          >
            <div class="task-content">
              <div class="task-header">
                <h3>{{ task.title }}</h3>
                <span class="priority-badge" :class="task.priority">
                  {{ getPriorityLabel(task.priority) }}
                </span>
              </div>
              <p v-if="task.description">{{ task.description }}</p>
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

const store = useTaskStore()

const form = ref({
  title: '',
  description: '',
  priority: 'medium'
})

const editingTask = ref(null)

onMounted(() => {
  store.fetchTasks()
})

const handleSubmit = async () => {
  if (!form.value.title.trim()) return

  if (editingTask.value) {
    await store.updateTask(editingTask.value.id, { ...form.value })
    cancelEdit()
  } else {
    await store.addTask({ ...form.value })
    // Reset form but keep priority default? Or reset all?
    form.value = { title: '', description: '', priority: 'medium' }
  }
}

const startEdit = (task) => {
  editingTask.value = task
  form.value = {
    title: task.title,
    description: task.description || '',
    priority: task.priority || 'medium'
  }
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

const cancelEdit = () => {
  editingTask.value = null
  form.value = { title: '', description: '', priority: 'medium' }
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
/* Scoped styles specific to this component layout */
.task-manager {
  max-width: 800px;
  margin: 0 auto;
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

.form-group {
    margin-bottom: 1rem;
}

.form-group label {
    display: block;
    margin-bottom: 0.5rem;
    font-weight: bold;
}

.form-actions {
  display: flex;
  gap: 1rem;
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
}

.tasks-container {
    position: relative;
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
