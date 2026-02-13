<template>
  <div class="task-manager">

    <div class="top-controls card glass-panel">
        <div class="view-toggle">
            <button @click="viewMode = 'list'" class="btn-toggle" :class="{ active: viewMode === 'list' }">📋 Lista</button>
            <button @click="viewMode = 'grid'" class="btn-toggle" :class="{ active: viewMode === 'grid' }">🍱 Grid</button>
            <button @click="viewMode = 'calendar'" class="btn-toggle" :class="{ active: viewMode === 'calendar' }">📅 Calendario</button>
        </div>

        <div class="settings-toggle">
            <button @click="showSettings = !showSettings" class="btn btn-secondary">
                {{ showSettings ? 'Ocultar Config' : '⚙️ Configuración' }}
            </button>
        </div>
    </div>

    <transition name="fade">
        <div v-if="showSettings" class="settings-panel">
            <CategoryManager />
            <TagManager />
        </div>
    </transition>

    <!-- Task Form -->
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
            rows="2"
            class="input-field"
          ></textarea>
        </div>

        <div class="form-row">
          <div class="form-group half">
            <label>Prioridad</label>
            <select v-model="form.priority" class="select-field">
              <option value="low">🟢 Baja</option>
              <option value="medium">🟠 Media</option>
              <option value="high">🔴 Alta</option>
            </select>
          </div>

          <div class="form-group half">
            <label>Categoría</label>
            <select v-model="form.category_id" class="select-field">
              <option :value="null">Sin Categoría</option>
              <option v-for="cat in categoryStore.categories" :key="cat.id" :value="cat.id">
                {{ cat.name }}
              </option>
            </select>
          </div>
        </div>

        <div class="form-group">
            <label>Vencimiento</label>
            <input
                v-model="form.due_date"
                type="datetime-local"
                class="input-field"
            />
        </div>

        <div class="form-group">
          <label>Etiquetas</label>
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
            {{ editingTask ? '💾 Guardar' : '✨ Crear' }}
          </button>
          <button
            v-if="editingTask"
            type="button"
            @click="cancelEdit"
            class="btn btn-secondary"
          >
            ❌
          </button>
        </div>
      </form>
    </section>

    <!-- Search Component -->
    <TaskSearch />

    <!-- CALENDAR VIEW -->
    <TaskCalendar
        v-if="viewMode === 'calendar'"
        :tasks="store.filteredTasks"
        @edit-task="startEdit"
    />

    <!-- LIST / GRID VIEW -->
    <section v-else class="task-view-container">
      <div class="list-header">
        <h2>📋 Tareas</h2>
        <div class="stats">
            <span class="badge">Pendientes: {{ store.pendingTasksCount }}</span>
            <span class="badge badge-danger" v-if="store.overdueTasksCount > 0">Vencidas: {{ store.overdueTasksCount }}</span>
        </div>
      </div>

      <div v-if="store.loading && !store.tasks.length" class="loading">Cargando...</div>

      <div v-else class="tasks-container" :class="viewMode">
        <draggable
            v-model="localTasks"
            item-key="id"
            class="drag-area"
            :class="viewMode"
            @end="onDragEnd"
            handle=".drag-handle"
        >
            <template #item="{ element: task }">
                <div
                    class="task-item card"
                    :class="{
                        completed: task.completed,
                        [`priority-${task.priority}`]: true,
                        overdue: isOverdue(task)
                    }"
                    :style="task.category ? { borderRight: `5px solid ${task.category.color}` } : {}"
                >
                    <div class="drag-handle" title="Arrastrar para reordenar">⋮⋮</div>

                    <div class="task-content">
                        <div class="task-header">
                            <h3>{{ task.title }}</h3>
                            <div class="badges">
                                <span v-if="isOverdue(task)" class="badge-danger-pill">⚠️</span>
                                <span class="priority-dot" :class="task.priority" :title="'Prioridad ' + task.priority"></span>
                            </div>
                        </div>

                        <span v-if="task.category" class="category-pill" :style="{ backgroundColor: task.category.color + '30', color: task.category.color }">
                            {{ task.category.name }}
                        </span>

                        <p v-if="task.description">{{ task.description }}</p>

                        <div class="meta-info">
                            <small v-if="task.due_date" class="due-date" :class="{ 'text-danger': isOverdue(task) }">
                                📅 {{ formatDateTime(task.due_date) }}
                            </small>
                        </div>

                        <div class="task-tags">
                            <span v-for="tag in task.tags" :key="tag.id" class="tag-dot" :style="{ backgroundColor: tag.color }" :title="tag.name"></span>
                        </div>
                    </div>

                    <div class="task-actions">
                        <button @click.stop="store.updateTask(task.id, { completed: !task.completed })" class="btn-icon">
                            {{ task.completed ? '↩️' : '✅' }}
                        </button>
                        <button @click.stop="startEdit(task)" class="btn-icon">✏️</button>
                        <button @click.stop="confirmDelete(task.id)" class="btn-icon btn-danger">🗑️</button>
                    </div>
                </div>
            </template>
        </draggable>
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, watch } from 'vue'
import draggable from 'vuedraggable'
import { useTaskStore } from '../stores/taskStore'
import { useCategoryStore } from '../stores/categoryStore'
import { useTagStore } from '../stores/tagStore'
import CategoryManager from './CategoryManager.vue'
import TagManager from './TagManager.vue'
import TaskCalendar from './TaskCalendar.vue'
import TaskSearch from './TaskSearch.vue'

const store = useTaskStore()
const categoryStore = useCategoryStore()
const tagStore = useTagStore()

const showSettings = ref(false)
const viewMode = ref('list')
const form = ref({ title: '', description: '', priority: 'medium', category_id: null, tags: [], due_date: '' })
const editingTask = ref(null)

// Local sorted tasks for Draggable (two-way binding requires a writable computed/ref)
// We sync it from store initially, but draggable updates it locally.
// Ideally, we'd update store order, but we don't have DB ordering yet.
// So we just use store.sortedTasks for display, and handle drag visually.
const localTasks = computed({
    get: () => store.sortedTasks,
    set: (val) => {
        // In a real app with manual ordering, we would update the store/DB order here.
        // For now, we just acknowledge the change visually.
        // Because sortedTasks is a getter derived from state, we can't set it directly.
        // We might need a separate 'manual' sort mode for this to really work effectively.
    }
})

const onDragEnd = () => {
    // console.log("Drag ended", localTasks.value)
}

onMounted(() => {
  store.fetchTasks()
  categoryStore.fetchCategories()
  tagStore.fetchTags()
})

const toggleTag = (tagId) => {
  const index = form.value.tags.indexOf(tagId)
  if (index === -1) form.value.tags.push(tagId)
  else form.value.tags.splice(index, 1)
}

const handleSubmit = async () => {
  if (!form.value.title.trim()) return
  const payload = { ...form.value, due_date: form.value.due_date ? new Date(form.value.due_date).toISOString() : null }

  if (editingTask.value) {
    await store.updateTask(editingTask.value.id, payload)
    cancelEdit()
  } else {
    await store.addTask(payload)
    form.value = { title: '', description: '', priority: 'medium', category_id: null, tags: [], due_date: '' }
  }
}

const formatDateForInput = (dateString) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  const pad = (n) => n < 10 ? '0' + n : n
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`
}

const startEdit = (task) => {
  editingTask.value = task
  form.value = {
    title: task.title,
    description: task.description || '',
    priority: task.priority || 'medium',
    category_id: task.category ? task.category.id : null,
    tags: task.tags ? task.tags.map(t => t.id) : [],
    due_date: formatDateForInput(task.due_date)
  }
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

const cancelEdit = () => {
  editingTask.value = null
  form.value = { title: '', description: '', priority: 'medium', category_id: null, tags: [], due_date: '' }
}

const confirmDelete = async (id) => {
  if (confirm('¿Eliminar?')) await store.removeTask(id)
}

const formatDateTime = (dateString) => {
  const date = new Date(dateString)
  return date.toLocaleString('es-ES', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
}

const getPriorityLabel = (priority) => ({ low: 'Baja', medium: 'Media', high: 'Alta' }[priority] || priority)

const isOverdue = (task) => !task.completed && task.due_date && new Date(task.due_date) < new Date()
</script>

<style scoped>
.task-manager { max-width: 900px; margin: 0 auto; }

.glass-panel {
    background: var(--surface-color);
    backdrop-filter: blur(10px);
    border: 1px solid var(--surface-border);
}

.top-controls {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1.5rem;
    padding: 1rem;
}

.view-toggle {
    display: flex;
    gap: 0.5rem;
    background: var(--bg-color);
    padding: 0.3rem;
    border-radius: 12px;
}

.btn-toggle {
    border: none;
    background: transparent;
    padding: 0.5rem 1rem;
    border-radius: 8px;
    cursor: pointer;
    font-weight: 600;
    color: var(--text-muted);
    transition: all 0.3s ease;
}

.btn-toggle.active {
    background: var(--surface-color);
    color: var(--primary-color);
    box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.task-form { margin-bottom: 2rem; }

.form-row { display: flex; gap: 1rem; }
.half { flex: 1; }
.form-group { margin-bottom: 1rem; }
.input-field, .select-field {
    width: 100%; padding: 0.8rem;
    border: 1px solid var(--border-color);
    border-radius: 12px;
    background: var(--bg-color);
    color: var(--text-color);
    font-size: 1rem;
    transition: border-color 0.2s;
}
.input-field:focus { border-color: var(--primary-color); outline: none; }

.tags-input { display: flex; flex-wrap: wrap; gap: 0.5rem; }
.tag-pill {
    padding: 0.3rem 0.8rem; border-radius: 20px; border: 1px solid;
    cursor: pointer; transition: all 0.2s; font-size: 0.85rem;
}
.tag-pill.selected { transform: scale(1.05); }

.form-actions { display: flex; gap: 1rem; margin-top: 1rem; }
.btn { padding: 0.8rem 1.5rem; border-radius: 12px; border: none; font-weight: 600; cursor: pointer; transition: all 0.2s; }
.btn-primary { background: var(--primary-color); color: white; box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3); }
.btn-secondary { background: var(--secondary-color); color: white; }

/* TASKS CONTAINER */
.tasks-container.list { display: flex; flex-direction: column; gap: 1rem; }
.tasks-container.grid .drag-area {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: 1.5rem;
}

.task-item {
    position: relative;
    padding: 1.2rem;
    display: flex;
    flex-direction: column; /* Force column for grid consistency, override in list via media query or specific class */
    gap: 0.8rem;
    height: 100%;
    transition: transform 0.2s, box-shadow 0.2s;
}

.tasks-container.list .task-item {
    flex-direction: row;
    align-items: center;
}

.task-item:hover {
    transform: translateY(-2px);
    box-shadow: 0 12px 40px var(--shadow-color);
}

.drag-handle {
    cursor: grab;
    color: var(--text-muted);
    font-size: 1.2rem;
    margin-right: 0.5rem;
    display: flex;
    align-items: center;
}

.task-content { flex: 1; overflow: hidden; }

.task-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 0.5rem;
}

.task-header h3 {
    margin: 0;
    font-size: 1.1rem;
    font-weight: 700;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

.badges { display: flex; align-items: center; gap: 0.5rem; }
.priority-dot { width: 10px; height: 10px; border-radius: 50%; }
.priority-dot.low { background: var(--success-color); box-shadow: 0 0 8px var(--success-color); }
.priority-dot.medium { background: var(--warning-color); box-shadow: 0 0 8px var(--warning-color); }
.priority-dot.high { background: var(--danger-color); box-shadow: 0 0 8px var(--danger-color); }

.category-pill {
    display: inline-block;
    font-size: 0.7rem;
    padding: 0.1rem 0.5rem;
    border-radius: 8px;
    font-weight: bold;
    margin-bottom: 0.5rem;
    text-transform: uppercase;
    letter-spacing: 0.5px;
}

.task-tags { display: flex; gap: 4px; margin-top: 5px; }
.tag-dot { width: 8px; height: 8px; border-radius: 2px; }

.task-actions {
    display: flex;
    gap: 0.5rem;
    margin-top: auto; /* Push to bottom in grid */
}

/* List specific overrides */
.tasks-container.list .task-item {
    padding: 1rem 1.5rem;
}
.tasks-container.list .task-actions {
    margin-top: 0;
}

.fade-enter-active, .fade-leave-active { transition: opacity 0.3s; }
.fade-enter-from, .fade-leave-to { opacity: 0; }

@media (max-width: 768px) {
    .tasks-container.list .task-item { flex-direction: column; align-items: flex-start; }
    .tasks-container.list .task-actions { width: 100%; justify-content: flex-end; margin-top: 1rem; }
    .form-row { flex-direction: column; gap: 0; }
}
</style>
