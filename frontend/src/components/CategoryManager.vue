<template>
  <div class="category-manager card">
    <h3>Gestionar Categorías</h3>

    <div class="add-form">
      <input
        v-model="newCategory.name"
        placeholder="Nombre de categoría"
        class="input-field"
      />
      <input
        v-model="newCategory.color"
        type="color"
        class="color-picker"
        title="Color de categoría"
      />
      <button @click="addCategory" class="btn btn-primary" :disabled="!newCategory.name">
        ➕ Agregar
      </button>
    </div>

    <div v-if="store.loading" class="loading">Cargando...</div>
    <div v-if="store.error" class="error">{{ store.error }}</div>

    <ul class="category-list">
      <li v-for="category in store.categories" :key="category.id" class="category-item">
        <div class="category-info">
          <span class="color-dot" :style="{ backgroundColor: category.color }"></span>
          <span v-if="!editingId || editingId !== category.id">{{ category.name }}</span>
          <input
            v-else
            v-model="editForm.name"
            class="input-field-sm"
          />
          <input
             v-if="editingId === category.id"
             v-model="editForm.color"
             type="color"
             class="color-picker-sm"
          />
        </div>

        <div class="actions">
          <div v-if="editingId === category.id">
            <button @click="saveEdit(category.id)" class="btn-icon">💾</button>
            <button @click="cancelEdit" class="btn-icon">❌</button>
          </div>
          <div v-else>
            <button @click="startEdit(category)" class="btn-icon">✏️</button>
            <button @click="deleteCategory(category.id)" class="btn-icon btn-danger">🗑️</button>
          </div>
        </div>
      </li>
    </ul>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useCategoryStore } from '../stores/categoryStore'

const store = useCategoryStore()
const newCategory = ref({ name: '', color: '#6366f1' })
const editingId = ref(null)
const editForm = ref({ name: '', color: '' })

onMounted(() => {
  store.fetchCategories()
})

const addCategory = async () => {
  if (!newCategory.value.name.trim()) return
  await store.createCategory(newCategory.value)
  newCategory.value = { name: '', color: '#6366f1' }
}

const startEdit = (category) => {
  editingId.value = category.id
  editForm.value = { name: category.name, color: category.color }
}

const cancelEdit = () => {
  editingId.value = null
  editForm.value = { name: '', color: '' }
}

const saveEdit = async (id) => {
  await store.updateCategory(id, editForm.value)
  cancelEdit()
}

const deleteCategory = async (id) => {
  if (confirm('¿Eliminar esta categoría?')) {
    await store.deleteCategory(id)
  }
}
</script>

<style scoped>
.category-manager {
  margin-bottom: 2rem;
}

.add-form {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.color-picker {
  height: 42px;
  width: 50px;
  border: none;
  background: none;
  cursor: pointer;
}

.category-list {
  list-style: none;
  padding: 0;
}

.category-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem;
  border-bottom: 1px solid var(--border-color);
}

.category-info {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.color-dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  display: inline-block;
}

.input-field-sm {
  padding: 0.2rem;
  border: 1px solid var(--border-color);
  border-radius: 4px;
}

.color-picker-sm {
  width: 30px;
  height: 30px;
  border: none;
  background: none;
}

.actions {
  display: flex;
  gap: 0.5rem;
}
</style>
