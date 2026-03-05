<template>
  <div class="task-manager">

    <!-- Top Bar (Glass) -->
    <div class="top-controls glass-panel">
        <div class="view-toggle">
            <button @click="viewMode = 'list'" class="btn-toggle" :class="{ active: viewMode === 'list' }" title="Lista">
                <font-awesome-icon icon="list" />
            </button>
            <button @click="viewMode = 'grid'" class="btn-toggle" :class="{ active: viewMode === 'grid' }" title="Cuadrícula">
                <font-awesome-icon icon="grip" />
            </button>
            <button @click="viewMode = 'calendar'" class="btn-toggle" :class="{ active: viewMode === 'calendar' }" title="Calendario">
                <font-awesome-icon icon="calendar-days" />
            </button>
        </div>

        <button @click="showSettings = !showSettings" class="btn-settings hover-lift">
            <font-awesome-icon icon="gear" /> {{ showSettings ? 'Cerrar' : 'Configuración' }}
        </button>
    </div>

    <!-- Settings Drawer -->
    <transition name="slide-down">
        <div v-if="showSettings" class="settings-drawer">
            <CategoryManager />
            <TagManager />
            <!-- IntegrationManager coming in next version -->
            <!-- <IntegrationManager /> -->
        </div>
    </transition>

    <!-- Task Form (Glass Card) -->
    <section class="task-form card hover-lift">
      <div class="form-header">
          <h2>{{ editingTask ? 'Editar Tarea' : 'Nueva Tarea' }}</h2>
      </div>

      <form @submit.prevent="handleSubmit">
        <div class="form-group">
          <input
            v-model="form.title"
            type="text"
            placeholder="¿Qué necesitas hacer hoy?"
            required
            class="input-modern"
          />
        </div>

        <div class="form-group">
          <textarea
            v-model="form.description"
            placeholder="Añade detalles..."
            rows="2"
            class="input-modern"
          ></textarea>
        </div>

        <div class="form-row">
          <div class="form-group half">
            <div class="select-wrapper">
                <select v-model="form.priority" class="input-modern">
                <option value="low">Baja</option>
                <option value="medium">Media</option>
                <option value="high">Alta</option>
                </select>
            </div>
          </div>

          <div class="form-group half">
            <div class="select-wrapper">
                <select v-model="form.category_id" class="input-modern">
                <option :value="null">Sin Categoría</option>
                <option v-for="cat in categoryStore.categories" :key="cat.id" :value="cat.id">
                    {{ cat.name }}
                </option>
                </select>
            </div>
          </div>
        </div>

        <div class="form-row">
            <div class="form-group half">
                <label class="label-sub">Subtarea de:</label>
                <div class="select-wrapper">
                    <select v-model="form.parent_id" class="input-modern">
                        <option :value="null">-- Ninguna (Raíz) --</option>
                        <option
                            v-for="task in potentialParents"
                            :key="task.id"
                            :value="task.id"
                        >
                            {{ task.title }}
                        </option>
                    </select>
                </div>
            </div>

            <div class="form-group half">
                <label class="label-sub">Bloqueada por:</label>
                <select multiple v-model="form.dependencies" class="input-modern multiselect">
                    <option
                        v-for="task in potentialParents"
                        :key="task.id"
                        :value="task.id"
                    >
                        {{ task.title }}
                    </option>
                </select>
            </div>
        </div>

        <div class="form-group">
            <input
                v-model="form.due_date"
                type="datetime-local"
                class="input-modern"
            />
        </div>

        <div class="form-group">
          <label class="label-sub">Etiquetas</label>
          <div class="tags-input">
            <span
              v-for="tag in tagStore.tags"
              :key="tag.id"
              class="tag-chip"
              :class="{ selected: form.tags.includes(tag.id) }"
              :style="{ '--tag-color': tag.color }"
              @click="toggleTag(tag.id)"
            >
              {{ tag.name }}
            </span>
          </div>
        </div>

        <div class="form-actions">
          <button type="submit" class="btn btn-primary" :disabled="store.loading">
            <font-awesome-icon :icon="editingTask ? 'save' : 'plus'" />
            {{ editingTask ? 'Guardar' : 'Crear' }}
          </button>
          <button
            v-if="editingTask"
            type="button"
            @click="cancelEdit"
            class="btn btn-text"
          >
            <font-awesome-icon icon="xmark" /> Cancelar
          </button>
        </div>
      </form>
    </section>

    <!-- Search Component -->
    <TaskSearch />

    <!-- VIEW CONTENT -->
    <transition name="fade" mode="out-in">
        <TaskCalendar
            v-if="viewMode === 'calendar'"
            :tasks="store.filteredTasks"
            @edit-task="startEdit"
        />

        <section v-else class="task-view-container">
        <div class="list-header">
            <h3>Mis Tareas</h3>
            <div class="stats-pills">
                <span class="stat-pill">Pendientes: {{ store.pendingTasksCount }}</span>
                <span v-if="store.overdueTasksCount > 0" class="stat-pill danger">
                    <font-awesome-icon icon="triangle-exclamation" /> {{ store.overdueTasksCount }}
                </span>
            </div>
        </div>

        <div v-if="store.loading && !store.tasks.length" class="loading-state">
            <div class="spinner"></div> Cargando...
        </div>

        <div v-else class="tasks-wrapper" :class="viewMode">
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
                        class="task-card hover-lift"
                        :class="{
                            completed: task.completed,
                            [`priority-${task.priority}`]: true,
                            overdue: isOverdue(task),
                            blocked: isBlocked(task)
                        }"
                        :style="task.category ? { '--cat-color': task.category.color } : {}"
                    >
                        <div class="card-accent"></div>

                        <!-- Progress Bar for Parents -->
                        <div v-if="hasSubtasks(task)" class="progress-container">
                            <div class="progress-bar" :style="{ width: getProgress(task) + '%' }"></div>
                        </div>

                        <div class="task-body">
                            <div class="task-top">
                                <div class="drag-handle"><font-awesome-icon icon="grip" /></div>
                                <h4 class="task-title">
                                    <font-awesome-icon v-if="isBlocked(task)" icon="lock" class="blocked-icon" title="Bloqueada por dependencias" />
                                    {{ task.title }}
                                </h4>
                                <span class="priority-dot" :class="task.priority"></span>
                            </div>

                            <p class="task-desc" v-if="task.description">{{ task.description }}</p>

                            <div class="task-meta">
                                <span v-if="task.category" class="meta-badge category">
                                    <font-awesome-icon icon="folder" /> {{ task.category.name }}
                                </span>
                                <span v-if="task.due_date" class="meta-badge date" :class="{ danger: isOverdue(task) }">
                                    <font-awesome-icon icon="calendar-days" /> {{ formatDateTime(task.due_date) }}
                                </span>
                                <span v-if="task.parent_id" class="meta-badge subtask">
                                    ↳ Subtarea
                                </span>
                            </div>

                            <!-- Dependencies List -->
                            <div v-if="task.dependencies && task.dependencies.length > 0" class="deps-list">
                                <span class="dep-label">Depende de:</span>
                                <span v-for="depId in task.dependencies" :key="depId" class="dep-tag" :class="{ done: isTaskDone(depId) }">
                                    {{ getTaskTitle(depId) }}
                                </span>
                            </div>

                            <div class="tags-list" v-if="task.tags && task.tags.length">
                                <span v-for="tag in task.tags" :key="tag.id" class="mini-tag" :style="{ color: tag.color }">#{{ tag.name }}</span>
                            </div>
                        </div>

                        <div class="task-actions-overlay">
                            <button
                                @click.stop="store.updateTask(task.id, { completed: !task.completed })"
                                class="action-btn check"
                                :disabled="isBlocked(task) && !task.completed"
                                :title="isBlocked(task) ? 'Bloqueada' : (task.completed ? 'Deshacer' : 'Completar')"
                            >
                                <font-awesome-icon :icon="task.completed ? 'undo' : 'check'" />
                            </button>
                            <button @click.stop="startEdit(task)" class="action-btn edit" title="Editar">
                                <font-awesome-icon icon="edit" />
                            </button>
                            <button @click.stop="confirmDelete(task.id)" class="action-btn delete" title="Eliminar">
                                <font-awesome-icon icon="trash" />
                            </button>
                        </div>
                    </div>
                </template>
            </draggable>
        </div>
        </section>
    </transition>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import draggable from 'vuedraggable'
import { useTaskStore } from '../stores/taskStore'
import { useCategoryStore } from '../stores/categoryStore'
import { useTagStore } from '../stores/tagStore'
import CategoryManager from './CategoryManager.vue'
import TagManager from './TagManager.vue'
// import IntegrationManager from './IntegrationManager.vue' // Coming in next version
import TaskCalendar from './TaskCalendar.vue'
import TaskSearch from './TaskSearch.vue'

const store = useTaskStore()
const categoryStore = useCategoryStore()
const tagStore = useTagStore()

const showSettings = ref(false)
const viewMode = ref('list')
const form = ref({
    title: '', description: '', priority: 'medium', category_id: null,
    tags: [], due_date: '', parent_id: null, dependencies: []
})
const editingTask = ref(null)

const localTasks = computed({
    get: () => store.sortedTasks,
    set: (val) => {}
})

// Potential parents: tasks that are NOT the current editing task (to avoid loops)
const potentialParents = computed(() => {
    return store.tasks.filter(t => !editingTask.value || t.id !== editingTask.value.id)
})

const onDragEnd = () => {}

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
  const payload = {
      ...form.value,
      due_date: form.value.due_date ? new Date(form.value.due_date).toISOString() : null,
      parent_id: form.value.parent_id || null,
      // dependencies already array
  }

  if (editingTask.value) {
    await store.updateTask(editingTask.value.id, payload)
    cancelEdit()
  } else {
    await store.addTask(payload)
    resetForm()
  }
}

const resetForm = () => {
    form.value = { title: '', description: '', priority: 'medium', category_id: null, tags: [], due_date: '', parent_id: null, dependencies: [] }
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
    due_date: formatDateForInput(task.due_date),
    parent_id: task.parent_id || null,
    dependencies: task.dependencies || [] // Assumes backend sends array of IDs
  }
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

const cancelEdit = () => {
  editingTask.value = null
  resetForm()
}

const confirmDelete = async (id) => {
  if (confirm('¿Eliminar?')) await store.removeTask(id)
}

const formatDateTime = (dateString) => {
  const date = new Date(dateString)
  return date.toLocaleString('es-ES', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
}

const isOverdue = (task) => !task.completed && task.due_date && new Date(task.due_date) < new Date()

// Subtask Logic
const hasSubtasks = (task) => {
    return store.tasks.some(t => t.parent_id === task.id)
}

const getProgress = (task) => {
    const subtasks = store.tasks.filter(t => t.parent_id === task.id)
    if (subtasks.length === 0) return 0
    const completed = subtasks.filter(t => t.completed).length
    return Math.round((completed / subtasks.length) * 100)
}

// Dependency Logic
const isBlocked = (task) => {
    if (!task.dependencies || task.dependencies.length === 0) return false
    // Check if any dependency is NOT completed
    // Dependencies are IDs
    return task.dependencies.some(depId => {
        const depTask = store.tasks.find(t => t.id === depId)
        return depTask && !depTask.completed
    })
}

const isTaskDone = (id) => {
    const t = store.tasks.find(t => t.id === id)
    return t && t.completed
}

const getTaskTitle = (id) => {
    const t = store.tasks.find(t => t.id === id)
    return t ? t.title : 'Desconocida'
}
</script>

<style scoped>
.task-manager { max-width: 900px; margin: 0 auto; }

/* ... Previous Styles ... */
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
    padding: 0.8rem 1.2rem;
    border-radius: 20px; /* Capsule shape */
}

.view-toggle {
    display: flex;
    gap: 0.5rem;
    background: rgba(120, 120, 128, 0.1);
    padding: 4px;
    border-radius: 12px;
}

.btn-toggle {
    border: none;
    background: transparent;
    padding: 6px 12px;
    border-radius: 8px;
    cursor: pointer;
    font-size: 1.1rem;
    transition: all 0.2s;
    opacity: 0.6;
    color: var(--text-color);
}

.btn-toggle.active {
    background: var(--surface-color);
    box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    opacity: 1;
    transform: scale(1.05);
    color: var(--primary-color);
}

.btn-settings {
    background: transparent;
    border: none;
    color: var(--primary-color);
    font-weight: 600;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 0.5rem;
}

/* --- Task Form --- */
.task-form {
    padding: 1.5rem;
    margin-bottom: 2rem;
}

.form-header h2 {
    margin: 0 0 1.5rem 0;
    font-size: 1.5rem;
    background: linear-gradient(to right, var(--text-color), var(--text-muted));
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
}

.input-modern {
    width: 100%;
    /* border-radius via global css */
}

.form-row { display: flex; gap: 1rem; }
.half { flex: 1; }
.form-group { margin-bottom: 1rem; }

.label-sub {
    display: block;
    font-size: 0.85rem;
    color: var(--text-muted);
    margin-bottom: 0.5rem;
    font-weight: 600;
}

/* Tag Chips */
.tags-input { display: flex; flex-wrap: wrap; gap: 0.5rem; }
.tag-chip {
    padding: 6px 12px;
    border-radius: 20px;
    font-size: 0.85rem;
    cursor: pointer;
    background: rgba(120, 120, 128, 0.1);
    border: 1px solid transparent;
    color: var(--text-muted);
    transition: all 0.2s;
    font-weight: 500;
}
.tag-chip.selected {
    background: var(--tag-color);
    color: white;
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    transform: translateY(-1px);
}

.form-actions { display: flex; gap: 1rem; margin-top: 1.5rem; }
.btn-text {
    background: transparent;
    color: var(--text-muted);
    border: none;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 0.5rem;
}
.btn-text:hover { color: var(--text-color); }

.btn-primary {
    display: flex;
    align-items: center;
    gap: 0.5rem;
}

/* --- Task List & Grid --- */
.list-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1rem;
    padding: 0 0.5rem;
}

.list-header h3 { margin: 0; font-size: 1.3rem; }

.stat-pill {
    font-size: 0.8rem;
    background: rgba(120, 120, 128, 0.1);
    padding: 4px 10px;
    border-radius: 12px;
    color: var(--text-muted);
    margin-left: 0.5rem;
}
.stat-pill.danger { background: rgba(255, 59, 48, 0.1); color: var(--danger-color); }

.tasks-wrapper.list .drag-area { display: flex; flex-direction: column; gap: 1rem; }
.tasks-wrapper.grid .drag-area {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
    gap: 1.5rem;
}

/* --- Modern Task Card --- */
.task-card {
    position: relative;
    background: var(--glass-surface);
    backdrop-filter: blur(var(--glass-blur));
    border: 1px solid var(--glass-border);
    border-radius: 20px;
    padding: 1.2rem;
    box-shadow: var(--glass-shadow);
    transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
    overflow: hidden;
    display: flex;
    flex-direction: column;
}

.task-card.blocked {
    opacity: 0.7;
    background: rgba(120, 120, 128, 0.05);
}

/* Progress Bar */
.progress-container {
    height: 4px;
    background: rgba(120, 120, 128, 0.1);
    border-radius: 2px;
    margin-bottom: 0.8rem;
    overflow: hidden;
}
.progress-bar {
    height: 100%;
    background: var(--primary-color);
    transition: width 0.5s ease;
}

.blocked-icon {
    font-size: 0.9rem;
    margin-right: 0.3rem;
    color: var(--warning-color);
}

/* Dependencies */
.deps-list {
    font-size: 0.75rem;
    color: var(--text-muted);
    margin-bottom: 0.8rem;
}
.dep-tag {
    background: rgba(120, 120, 128, 0.1);
    padding: 2px 6px;
    border-radius: 4px;
    margin-left: 4px;
    text-decoration: line-through; /* Default assumes blocked/incomplete logic style? No wait. */
    text-decoration: none;
}
.dep-tag.done {
    text-decoration: line-through;
    opacity: 0.5;
    background: rgba(52, 199, 89, 0.1);
    color: var(--success-color);
}

/* Side accent for category color */
.card-accent {
    position: absolute;
    left: 0; top: 0; bottom: 0;
    width: 6px;
    background: var(--cat-color, transparent);
    opacity: 0.8;
}

.task-top {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    margin-bottom: 0.5rem;
}

.drag-handle {
    cursor: grab;
    color: var(--text-muted);
    opacity: 0.5;
    font-size: 0.9rem;
}

.task-title {
    margin: 0;
    flex: 1;
    font-size: 1.1rem;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

.priority-dot {
    width: 10px; height: 10px; border-radius: 50%;
}
.priority-dot.low { background: var(--success-color); }
.priority-dot.medium { background: var(--warning-color); }
.priority-dot.high { background: var(--danger-color); box-shadow: 0 0 8px var(--danger-color); }

.task-desc {
    color: var(--text-muted);
    font-size: 0.95rem;
    margin: 0 0 1rem 0;
    line-height: 1.4;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
}

.task-meta {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
    margin-bottom: 0.8rem;
}

.meta-badge {
    font-size: 0.75rem;
    padding: 3px 8px;
    border-radius: 6px;
    background: rgba(120, 120, 128, 0.08);
    color: var(--text-muted);
    font-weight: 500;
    display: flex;
    align-items: center;
    gap: 4px;
}
.meta-badge.category {
    background: rgba(0, 122, 255, 0.1);
    color: var(--primary-color);
}
.meta-badge.date.danger {
    color: var(--danger-color);
    background: rgba(255, 59, 48, 0.1);
}
.meta-badge.subtask {
    background: rgba(174, 174, 178, 0.2);
}

.tags-list {
    display: flex;
    gap: 6px;
}
.mini-tag {
    font-size: 0.8rem;
    opacity: 0.8;
}

/* Actions Overlay (appears on hover or always on touch) */
.task-actions-overlay {
    margin-top: auto;
    display: flex;
    justify-content: flex-end;
    gap: 0.5rem;
    opacity: 0;
    transform: translateY(10px);
    transition: all 0.2s;
}

.task-card:hover .task-actions-overlay {
    opacity: 1;
    transform: translateY(0);
}

.action-btn {
    width: 32px; height: 32px;
    border-radius: 50%;
    border: none;
    background: var(--bg-color);
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 0.9rem;
    box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    transition: transform 0.2s;
}
.action-btn:hover { transform: scale(1.1); }
.action-btn.check { color: var(--success-color); }
.action-btn.check:disabled { color: var(--text-muted); cursor: not-allowed; }
.action-btn.edit { color: var(--primary-color); }
.action-btn.delete { color: var(--danger-color); }

/* Completed State */
.task-card.completed {
    opacity: 0.7;
    background: rgba(200, 200, 200, 0.1);
}
.task-card.completed .task-title {
    text-decoration: line-through;
    color: var(--text-muted);
}

/* Animations */
.slide-down-enter-active, .slide-down-leave-active { transition: all 0.3s ease; }
.slide-down-enter-from, .slide-down-leave-to { transform: translateY(-20px); opacity: 0; }

.fade-enter-active, .fade-leave-active { transition: opacity 0.2s; }
.fade-enter-from, .fade-leave-to { opacity: 0; }

/* --- Responsive Design --- */
@media (max-width: 968px) {
    .tasks-wrapper.grid .drag-area {
        grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
        gap: 1rem;
    }
}

@media (max-width: 768px) {
    .task-form, .task-search {
        padding: 1rem;
    }
    
    .task-actions-overlay { 
        opacity: 1; 
        transform: translateY(0); 
        margin-top: 1rem; 
    }
    
    .form-row { 
        flex-direction: column; 
        gap: 0; 
    }
    
    .tasks-wrapper.grid .drag-area {
        grid-template-columns: 1fr;
    }
    
    .list-header {
        flex-direction: column;
        align-items: flex-start;
        gap: 0.5rem;
    }
    
    .stats-pills {
        display: flex;
        gap: 0.5rem;
    }
    
    .task-title {
        font-size: 1rem;
        white-space: normal;
    }
    
    .task-card {
        padding: 1rem;
        border-radius: 16px;
    }
}

@media (max-width: 480px) {
    .task-form h2, .list-header h3 {
        font-size: 1.1rem;
    }
    
    .form-actions {
        flex-direction: column;
        gap: 0.5rem;
    }
    
    .form-actions button {
        width: 100%;
        justify-content: center;
    }
    
    .tag-chip {
        font-size: 0.8rem;
        padding: 4px 10px;
    }
    
    .task-meta {
        flex-direction: column;
        gap: 0.3rem;
    }
    
    .action-btn {
        width: 36px;
        height: 36px;
        font-size: 1rem;
    }
}
</style>
