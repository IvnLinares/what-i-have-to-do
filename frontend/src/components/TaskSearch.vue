<template>
    <div class="task-search card hover-lift">
        <div class="search-bar-container">
            <div class="search-input-wrapper">
                <font-awesome-icon icon="magnifying-glass" class="search-icon" />
                <input v-model="searchQuery" type="text" placeholder="Buscar tareas..." class="search-input"
                    @input="handleInput" @focus="showSuggestions = true" @blur="handleBlur" />
                <!-- Autocomplete Suggestions -->
                <transition name="fade">
                    <ul v-if="showSuggestions && suggestions.length > 0" class="suggestions-list glass-panel">
                        <li v-for="suggestion in suggestions" :key="suggestion"
                            @mousedown="selectSuggestion(suggestion)">
                            {{ suggestion }}
                        </li>
                    </ul>
                </transition>
            </div>

            <div class="sort-wrapper">
                <select v-model="sortOption" class="sort-select">
                    <option value="smart"><font-awesome-icon icon="star" /> Inteligente</option>
                    <option value="date-desc"><font-awesome-icon icon="calendar" /> Recientes</option>
                    <option value="date-asc"><font-awesome-icon icon="calendar" /> Antiguas</option>
                    <option value="priority-desc"><font-awesome-icon icon="fire" /> Alta Prio</option>
                    <option value="priority-asc"><font-awesome-icon icon="snowflake" /> Baja Prio</option>
                    <option value="alpha-asc"><font-awesome-icon icon="font" /> A-Z</option>
                </select>
            </div>
        </div>

        <div class="filters-row">
            <!-- Status Filter as Chips -->
            <div class="filter-chips">
                <button v-for="opt in statusOptions" :key="opt.value" class="chip"
                    :class="{ active: statusFilter === opt.value }" @click="statusFilter = opt.value">
                    {{ opt.label }}
                </button>
            </div>

            <div class="separator"></div>

            <!-- Priority Filter as Dots -->
            <div class="priority-toggles">
                <button class="prio-btn low" :class="{ active: priorityFilter.includes('low') }"
                    @click="togglePriority('low')" title="Baja"></button>
                <button class="prio-btn medium" :class="{ active: priorityFilter.includes('medium') }"
                    @click="togglePriority('medium')" title="Media"></button>
                <button class="prio-btn high" :class="{ active: priorityFilter.includes('high') }"
                    @click="togglePriority('high')" title="Alta"></button>
            </div>

            <div class="separator"></div>

            <!-- Category Dropdown (styled) -->
            <div class="category-select-wrapper">
                <select v-model="categoryFilter" class="chip-select">
                    <option :value="null"><font-awesome-icon icon="folder" /> Todas</option>
                    <option v-for="cat in categories" :key="cat.id" :value="cat.id">
                        {{ cat.name }}
                    </option>
                </select>
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

const statusOptions = [
    { label: 'Todos', value: 'all' },
    { label: 'Pendientes', value: 'active' },
    { label: 'Hechos', value: 'completed' }
]

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

const handleInput = () => taskStore.setSearchQuery(searchQuery.value)

const selectSuggestion = (text) => {
    searchQuery.value = text
    taskStore.setSearchQuery(text)
    showSuggestions.value = false
}

const handleBlur = () => setTimeout(() => { showSuggestions.value = false }, 200)

const togglePriority = (p) => {
    const current = [...taskStore.priorityFilter]
    const index = current.indexOf(p)
    if (index === -1) current.push(p)
    else current.splice(index, 1)
    taskStore.priorityFilter = current
}

watch(() => taskStore.searchQuery, (newVal) => {
    if (newVal !== searchQuery.value) searchQuery.value = newVal
})
</script>

<style scoped>
.task-search {
    padding: 1rem;
    margin-bottom: 2rem;
    /* Glass style inherited from global .card */
    border: 1px solid var(--glass-border);
}

.search-bar-container {
    display: flex;
    gap: 1rem;
    margin-bottom: 1rem;
}

.search-input-wrapper {
    flex: 1;
    position: relative;
    display: flex;
    align-items: center;
}

.search-icon {
    position: absolute;
    left: 12px;
    font-size: 1rem;
    opacity: 0.5;
    pointer-events: none;
}

.search-input {
    width: 100%;
    padding: 10px 10px 10px 40px;
    /* Space for icon */
    border-radius: 12px;
    background: rgba(120, 120, 128, 0.1);
    border: none;
    font-size: 1rem;
    color: var(--text-color);
    transition: all 0.2s;
}

.search-input:focus {
    background: rgba(120, 120, 128, 0.15);
    box-shadow: 0 0 0 2px var(--primary-color);
}

.suggestions-list {
    position: absolute;
    top: 110%;
    left: 0;
    right: 0;
    list-style: none;
    padding: 0;
    margin: 0;
    z-index: 100;
    border-radius: 12px;
    max-height: 200px;
    overflow-y: auto;
}

.suggestions-list li {
    padding: 10px 16px;
    cursor: pointer;
    font-size: 0.9rem;
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.suggestions-list li:hover {
    background: rgba(120, 120, 128, 0.1);
}

.sort-select {
    padding: 10px 36px 10px 16px;
    /* Ensuring space for custom arrow */
    border-radius: 12px;
    background: rgba(120, 120, 128, 0.1);
    border: none;
    font-weight: 500;
    color: var(--text-color);
}

/* Filters Row */
.filters-row {
    display: flex;
    align-items: center;
    gap: 1rem;
    flex-wrap: wrap;
}

.separator {
    width: 1px;
    height: 24px;
    background: var(--text-muted);
    opacity: 0.3;
}

/* Chips */
.filter-chips {
    display: flex;
    gap: 0.5rem;
    background: rgba(120, 120, 128, 0.1);
    padding: 4px;
    border-radius: 12px;
}

.chip {
    border: none;
    background: transparent;
    padding: 6px 12px;
    border-radius: 8px;
    font-size: 0.85rem;
    font-weight: 500;
    color: var(--text-muted);
    cursor: pointer;
    transition: all 0.2s;
}

.chip.active {
    background: var(--surface-color);
    color: var(--text-color);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

/* Priority Dots */
.priority-toggles {
    display: flex;
    gap: 8px;
}

.prio-btn {
    width: 24px;
    height: 24px;
    border-radius: 50%;
    border: 2px solid transparent;
    cursor: pointer;
    transition: all 0.2s;
}

.prio-btn.low {
    background: var(--success-color);
    opacity: 0.3;
}

.prio-btn.medium {
    background: var(--warning-color);
    opacity: 0.3;
}

.prio-btn.high {
    background: var(--danger-color);
    opacity: 0.3;
}

.prio-btn.active {
    opacity: 1;
    transform: scale(1.2);
    border-color: var(--surface-color);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
}

/* Category Select */
.chip-select {
    padding: 6px 36px 6px 12px;
    border-radius: 8px;
    border: 1px solid transparent;
    background: rgba(120, 120, 128, 0.1);
    font-size: 0.85rem;
    color: var(--text-color);
}

/* --- Responsive Design --- */
@media (max-width: 768px) {
    .task-search {
        padding: 1rem;
    }

    .filters-row {
        gap: 0.8rem;
        justify-content: center;
    }

    .search-bar-container {
        flex-direction: column;
        gap: 0.8rem;
    }

    .sort-wrapper {
        width: 100%;
    }

    .sort-select {
        width: 100%;
    }

    .separator {
        display: none;
    }

    .filter-chips {
        width: 100%;
        justify-content: center;
    }

    .priority-toggles {
        justify-content: center;
    }
}

@media (max-width: 480px) {
    .task-search {
        padding: 0.85rem;
    }

    .search-input {
        font-size: 16px;
        /* Prevents zoom on iOS */
        padding: 8px 8px 8px 36px;
    }

    .search-icon {
        left: 10px;
        font-size: 0.9rem;
    }

    .chip {
        font-size: 0.8rem;
        padding: 5px 10px;
    }

    .prio-btn {
        width: 20px;
        height: 20px;
    }

    .sort-select,
    .chip-select {
        font-size: 0.8rem;
        padding: 8px 12px;
    }
}
</style>
