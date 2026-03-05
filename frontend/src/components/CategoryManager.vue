<template>
  <div class="category-manager card">
    <h3><font-awesome-icon icon="folder" /> Gestionar Categorías</h3>

    <div class="add-form">
      <input
        v-model="newCategory.name"
        placeholder="Nombre de categoría"
        class="input-field"
      />
      <div class="color-picker-wrapper">
        <div class="color-preview" :style="{ backgroundColor: newCategory.color }" title="Color actual"></div>
        <div class="color-palette">
          <button
            v-for="color in colorPresets"
            :key="color"
            class="color-option"
            :class="{ active: newCategory.color === color }"
            :style="{ backgroundColor: color }"
            @click="newCategory.color = color"
            :title="color"
          ></button>
        </div>
        <input
          v-model="newCategory.color"
          type="color"
          class="color-picker-input"
          title="Personalizado"
        />
      </div>
      <button @click="addCategory" class="btn btn-primary" :disabled="!newCategory.name">
        <font-awesome-icon icon="plus" /> Agregar
      </button>
    </div>

    <div v-if="store.loading" class="loading">Cargando...</div>
    <div v-if="store.error" class="error">{{ store.error }}</div>

    <ul class="category-list">
      <li v-for="category in store.categories" :key="category.id" class="category-item">
        <div class="category-info">
          <span class="color-dot" :style="{ backgroundColor: category.color }"></span>
          <span v-if="!editingId || editingId !== category.id" class="category-name">{{ category.name }}</span>
          <input
            v-else
            v-model="editForm.name"
            class="input-field-sm"
          />
        </div>

        <div v-if="editingId === category.id" class="color-editor">
          <div class="color-palette-inline">
            <button
              v-for="color in colorPresets"
              :key="color"
              class="color-option-sm"
              :class="{ active: editForm.color === color }"
              :style="{ backgroundColor: color }"
              @click="editForm.color = color"
              :title="color"
            ></button>
          </div>
          <input
            v-model="editForm.color"
            type="color"
            class="color-picker-input-sm"
          />
        </div>

        <div class="actions">
          <div v-if="editingId === category.id">
            <button @click="saveEdit(category.id)" class="btn-icon" title="Guardar"><font-awesome-icon icon="save" /></button>
            <button @click="cancelEdit" class="btn-icon" title="Cancelar"><font-awesome-icon icon="xmark" /></button>
          </div>
          <div v-else>
            <button @click="startEdit(category)" class="btn-icon" title="Editar"><font-awesome-icon icon="edit" /></button>
            <button @click="deleteCategory(category.id)" class="btn-icon btn-danger" title="Eliminar"><font-awesome-icon icon="trash" /></button>
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

const colorPresets = [
  '#6366f1', // Indigo
  '#0ea5e9', // Cyan
  '#10b981', // Emerald
  '#f59e0b', // Amber
  '#ef4444', // Red
  '#8b5cf6', // Violet
  '#ec4899', // Pink
  '#14b8a6', // Teal
  '#f97316', // Orange
  '#06b6d4', // Cyan
]

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
  margin-bottom: 2.5rem;
  background: rgba(120, 120, 128, 0.05);
  padding: 2rem;
  border-radius: 16px;
  border: 1px solid var(--glass-border);
}

.category-manager h3 {
  margin-top: 0;
  margin-bottom: 1.75rem;
  font-size: 1.3rem;
  font-weight: 600;
  color: var(--text-color);
}

.add-form {
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;
  align-items: center;
  flex-wrap: wrap;
  padding-bottom: 1.5rem;
  border-bottom: 1px solid rgba(255,255,255,0.05);
}

.input-field {
  flex: 1;
  min-width: 220px;
  padding: 0.85rem 1.1rem;
  border-radius: var(--input-radius);
  border: 1px solid var(--glass-border);
  background: var(--glass-surface);
  font-size: 0.95rem;
  color: var(--text-color);
  transition: all 0.2s;
}

.input-field:focus {
  outline: none;
  border-color: var(--primary-color);
  box-shadow: 0 0 0 3px rgba(0, 122, 255, 0.1);
}

/* --- Color Picker Wrapper --- */
.color-picker-wrapper {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem;
  background: rgba(120, 120, 128, 0.03);
  border-radius: 12px;
  border: 1px solid var(--glass-border);
  flex-wrap: wrap;
  justify-content: center;
}

.color-preview {
  width: 40px;
  height: 40px;
  border-radius: 8px;
  border: 2px solid var(--glass-border);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  cursor: default;
  transition: all 0.2s;
}

.color-preview:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
  transform: scale(1.05);
}

/* --- Color Palette --- */
.color-palette {
  display: flex;
  gap: 0.4rem;
  flex-wrap: wrap;
  justify-content: center;
}

.color-option {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  border: 2px solid transparent;
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.color-option:hover {
  transform: scale(1.1);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
}

.color-option.active {
  border-color: var(--text-color);
  box-shadow: 0 0 0 3px var(--glass-surface), 0 0 0 5px var(--text-color);
  transform: scale(1.15);
}

/* --- Color Picker Input --- */
.color-picker-input {
  width: 40px;
  height: 40px;
  border: 2px solid var(--glass-border);
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
  padding: 2px;
  background: none;
}

.color-picker-input:hover {
  border-color: var(--primary-color);
  box-shadow: 0 0 8px rgba(0, 122, 255, 0.3);
}

/* --- Color Editor (Inline) --- */
.color-editor {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-wrap: wrap;
  justify-content: flex-start;
  margin-top: 0.75rem;
  padding-top: 0.75rem;
  border-top: 1px solid rgba(255,255,255,0.05);
}

.color-palette-inline {
  display: flex;
  gap: 0.3rem;
  flex-wrap: wrap;
}

.color-option-sm {
  width: 24px;
  height: 24px;
  border-radius: 6px;
  border: 2px solid transparent;
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.color-option-sm:hover {
  transform: scale(1.15);
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.15);
}

.color-option-sm.active {
  border-color: var(--text-color);
  box-shadow: 0 0 0 2px var(--glass-surface), 0 0 0 3px var(--text-color);
  transform: scale(1.2);
}

.color-picker-input-sm {
  width: 32px;
  height: 32px;
  border: 2px solid var(--glass-border);
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;
  padding: 1px;
  background: none;
}

.color-picker-input-sm:hover {
  border-color: var(--primary-color);
  box-shadow: 0 0 4px rgba(0, 122, 255, 0.3);
}

.btn {
  padding: 0.75rem 1.25rem;
  border-radius: var(--btn-radius);
  border: none;
  background: var(--primary-color);
  color: white;
  font-weight: 500;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.2s;
  white-space: nowrap;
}

.btn:hover:not(:disabled) {
  background: var(--primary-hover);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 122, 255, 0.3);
}

.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.category-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.category-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.2rem;
  border-bottom: 1px solid var(--glass-border);
  transition: background 0.2s;
  gap: 1rem;
}

.category-item:hover {
  background: rgba(120, 120, 128, 0.05);
}

.category-item:last-child {
  border-bottom: none;
}

.category-info {
  display: flex;
  align-items: center;
  gap: 1rem;
  flex: 1;
  min-width: 0;
}

.color-dot {
  width: 16px;
  height: 16px;
  border-radius: 50%;
  display: inline-block;
  border: 2px solid var(--glass-border);
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.input-field-sm {
  padding: 0.4rem 0.6rem;
  border: 1px solid var(--glass-border);
  border-radius: 6px;
  background: var(--glass-surface);
  color: var(--text-color);
  font-size: 0.9rem;
}

.color-picker-sm {
  width: 32px;
  height: 32px;
  border: 2px solid var(--glass-border);
  border-radius: 6px;
  background: none;
  cursor: pointer;
}

.actions {
  display: flex;
  gap: 0.75rem;
  flex-shrink: 0;
}

.btn-icon {
  width: 36px;
  height: 36px;
  border-radius: 8px;
  border: none;
  background: rgba(120, 120, 128, 0.1);
  color: var(--text-color);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.btn-icon:hover {
  background: rgba(120, 120, 128, 0.2);
  transform: translateY(-1px);
}

.btn-icon.btn-danger {
  color: var(--danger-color);
}

.btn-icon.btn-danger:hover {
  background: rgba(255, 59, 48, 0.1);
}

.loading, .error {
  padding: 1rem;
  text-align: center;
  color: var(--text-muted);
  font-size: 0.9rem;
}

.error {
  color: var(--danger-color);
  background: rgba(255, 59, 48, 0.1);
  border-radius: 8px;
}

/* --- Responsive Design --- */
@media (max-width: 768px) {
  .category-manager {
    padding: 1.25rem;
  }
  
  .add-form {
    flex-wrap: wrap;
  }
  
  .input-field {
    flex: 1;
    min-width: 200px;
  }
  
  .btn {
    width: 100%;
    justify-content: center;
  }
}

@media (max-width: 480px) {
  .category-manager {
    padding: 1rem;
  }
  
  .add-form {
    flex-direction: column;
  }
  
  .input-field {
    width: 100%;
  }
  
  .color-picker {
    width: 100%;
    height: 50px;
  }
  
  .category-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.75rem;
    padding: 0.85rem;
  }
  
  .category-info {
    width: 100%;
  }
  
  .actions {
    width: 100%;
    justify-content: flex-end;
  }
}
</style>
