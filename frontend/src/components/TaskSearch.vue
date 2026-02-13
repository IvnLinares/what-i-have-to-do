<template>
  <div class="task-search card">
    <div class="search-bar-container">
        <div class="search-input-wrapper">
            <input
                v-model="searchQuery"
                type="text"
                placeholder="🔍 Buscar tareas..."
                class="search-input"
                @input="handleInput"
                @focus="showSuggestions = true"
                @blur="handleBlur"
            />
            <!-- Autocomplete Suggestions -->
            <ul v-if="showSuggestions && suggestions.length > 0" class="suggestions-list">
                <li
                    v-for="suggestion in suggestions"
                    :key="suggestion"
                    @mousedown="selectSuggestion(suggestion)"
                >
                    {{ suggestion }}
                </li>
            </ul>
        </div>

        <select v-model="sortOption" class="sort-select">
            <option value="smart">✨ Inteligente</option>
            <option value="date-desc">📅 Más recientes</option>
            <option value="date-asc">📅 Más antiguas</option>
            <option value="priority-desc">🔥 Prioridad Alta</option>
            <option value="priority-asc">❄️ Prioridad Baja</option>
            <option value="alpha-asc">🔤 Alfabético</option>
        </select>
    </div>

    <div class="filters-row">
        <div class="filter-group">
            <label>Estado:</label>
            <select v-model="statusFilter" class="filter-select">
                <option value="all">Todos</option>
                <option value="active">Pendientes</option>
                <option value="completed">Completadas</option>
            </select>
        </div>

        <div class="filter-group">
            <label>Categoría:</label>
            <select v-model="categoryFilter" class="filter-select">
                <option :value="null">Todas</option>
                <option v-for="cat in categories" :key="cat.id" :value="cat.id">
                    {{ cat.name }}
                </option>
            </select>
        </div>

        <div class="filter-group">
            <label>Prioridad:</label>
            <div class="priority-toggles">
                <button
                    class="priority-btn low"
                    :class="{ active: priorityFilter.includes('low') }"
                    @click="togglePriority('low')"
                >🟢</button>
                <button
                    class="priority-btn medium"
                    :class="{ active: priorityFilter.includes('medium') }"
                    @click="togglePriority('medium')"
                >🟠</button>
                <button
                    class="priority-btn high"
                    :class="{ active: priorityFilter.includes('high') }"
                    @click="togglePriority('high')"
                >🔴</button>
            </div>
        </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useTaskStore } from '../stores/taskStore'
import { useCategoryStore } from '../stores/categoryStore'

const taskStore = useTaskStore()
const categoryStore = useCategoryStore()

const searchQuery = ref('')
const showSuggestions = ref(false)

// Sync local refs with store state
const sortOption = computed({
    get: () => taskStore.sortOption,
    set: (val) => taskStore.setSortOption(val)
})

const statusFilter = computed({
    get: () => taskStore.filter,
    set: (val) => taskStore.filter = val
})

const categoryFilter = computed({
    get: () => taskStore.categoryFilter,
    set: (val) => taskStore.categoryFilter = val
})

const priorityFilter = computed(() => taskStore.priorityFilter)
const categories = computed(() => categoryStore.categories)
const suggestions = computed(() => taskStore.searchSuggestions)

const handleInput = () => {
    taskStore.setSearchQuery(searchQuery.value)
}

const selectSuggestion = (text) => {
    searchQuery.value = text
    taskStore.setSearchQuery(text)
    showSuggestions.value = false
}

const handleBlur = () => {
    // Delay hiding to allow click event on suggestion
    setTimeout(() => {
        showSuggestions.value = false
    }, 200)
}

const togglePriority = (p) => {
    const current = [...taskStore.priorityFilter]
    const index = current.indexOf(p)
    if (index === -1) {
        current.push(p)
    } else {
        current.splice(index, 1)
    }
    taskStore.priorityFilter = current
}

// Watch for store changes to update local query (if cleared externally)
watch(() => taskStore.searchQuery, (newVal) => {
    if (newVal !== searchQuery.value) {
        searchQuery.value = newVal
    }
})
</script>

<style scoped>
.task-search {
    padding: 1rem;
    margin-bottom: 1.5rem;
    border-left: 4px solid var(--primary-color);
}

.search-bar-container {
    display: flex;
    gap: 1rem;
    margin-bottom: 1rem;
}

.search-input-wrapper {
    flex: 1;
    position: relative;
}

.search-input {
    width: 100%;
    padding: 0.7rem;
    border: 1px solid var(--border-color);
    border-radius: 8px;
    background: var(--bg-color);
    color: var(--text-color);
    font-size: 1rem;
}

.suggestions-list {
    position: absolute;
    top: 100%;
    left: 0;
    right: 0;
    background: var(--surface-color);
    border: 1px solid var(--border-color);
    border-radius: 0 0 8px 8px;
    list-style: none;
    padding: 0;
    margin: 0;
    z-index: 10;
    box-shadow: 0 4px 6px rgba(0,0,0,0.1);
}

.suggestions-list li {
    padding: 0.5rem 1rem;
    cursor: pointer;
    border-bottom: 1px solid var(--border-color);
}

.suggestions-list li:hover {
    background: var(--bg-color);
}

.sort-select {
    padding: 0.5rem;
    border-radius: 8px;
    border: 1px solid var(--border-color);
    background: var(--bg-color);
    color: var(--text-color);
}

.filters-row {
    display: flex;
    flex-wrap: wrap;
    gap: 1.5rem;
    align-items: center;
}

.filter-group {
    display: flex;
    align-items: center;
    gap: 0.5rem;
}

.filter-group label {
    font-weight: bold;
    font-size: 0.9rem;
    color: var(--text-muted);
}

.filter-select {
    padding: 0.4rem;
    border-radius: 6px;
    border: 1px solid var(--border-color);
    background: var(--bg-color);
    color: var(--text-color);
}

.priority-toggles {
    display: flex;
    gap: 0.3rem;
}

.priority-btn {
    width: 30px;
    height: 30px;
    border-radius: 50%;
    border: 2px solid transparent;
    background: var(--bg-color);
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 0.8rem;
    opacity: 0.5;
    transition: all 0.2s;
}

.priority-btn.active {
    opacity: 1;
    transform: scale(1.1);
    border-color: var(--text-color);
}

.priority-btn:hover {
    opacity: 0.8;
}
</style>
