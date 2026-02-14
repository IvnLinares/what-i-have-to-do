<template>
  <div class="tag-manager card">
    <h3><font-awesome-icon icon="tags" /> Gestionar Etiquetas</h3>

    <div class="add-form">
      <input
        v-model="newTag.name"
        placeholder="Nombre de etiqueta"
        class="input-field"
      />
      <div class="color-picker-wrapper">
        <div class="color-preview" :style="{ backgroundColor: newTag.color }" title="Color actual"></div>
        <div class="color-palette">
          <button
            v-for="color in colorPresets"
            :key="color"
            class="color-option"
            :class="{ active: newTag.color === color }"
            :style="{ backgroundColor: color }"
            @click="newTag.color = color"
            :title="color"
          ></button>
        </div>
        <input
          v-model="newTag.color"
          type="color"
          class="color-picker-input"
          title="Personalizado"
        />
      </div>
      <button @click="addTag" class="btn btn-primary" :disabled="!newTag.name">
        <font-awesome-icon icon="plus" /> Agregar
      </button>
    </div>

    <div v-if="store.loading" class="loading">Cargando...</div>
    <div v-if="store.error" class="error">{{ store.error }}</div>

    <div class="tag-cloud">
      <span
        v-for="tag in store.tags"
        :key="tag.id"
        class="tag-pill"
        :style="{ backgroundColor: tag.color + '20', color: tag.color, borderColor: tag.color }"
      >
        <span v-if="editingId !== tag.id" class="tag-name">{{ tag.name }}</span>
        <input
          v-else
          v-model="editForm.name"
          class="input-field-sm"
        />

        <div v-if="editingId === tag.id" class="tag-color-editor">
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
          <button v-if="editingId !== tag.id" @click="startEdit(tag)" class="btn-icon-sm" title="Editar"><font-awesome-icon icon="edit" /></button>
          <button v-if="editingId !== tag.id" @click="deleteTag(tag.id)" class="btn-icon-sm" title="Eliminar"><font-awesome-icon icon="xmark" /></button>
          <button v-if="editingId === tag.id" @click="saveEdit(tag.id)" class="btn-icon-sm" title="Guardar"><font-awesome-icon icon="save" /></button>
          <button v-if="editingId === tag.id" @click="cancelEdit" class="btn-icon-sm" title="Cancelar"><font-awesome-icon icon="circle-xmark" /></button>
        </div>
      </span>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useTagStore } from '../stores/tagStore'

const store = useTagStore()
const newTag = ref({ name: '', color: '#10b981' })
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
  store.fetchTags()
})

const addTag = async () => {
  if (!newTag.value.name.trim()) return
  await store.createTag(newTag.value)
  newTag.value = { name: '', color: '#10b981' }
}

const startEdit = (tag) => {
  editingId.value = tag.id
  editForm.value = { name: tag.name, color: tag.color }
}

const cancelEdit = () => {
  editingId.value = null
  editForm.value = { name: '', color: '' }
}

const saveEdit = async (id) => {
  await store.updateTag(id, editForm.value)
  cancelEdit()
}

const deleteTag = async (id) => {
  if (confirm('¿Eliminar esta etiqueta?')) {
    await store.deleteTag(id)
  }
}
</script>

<style scoped>
.tag-manager {
  margin-bottom: 2.5rem;
  background: rgba(120, 120, 128, 0.05);
  padding: 1.5rem;
  border-radius: 16px;
  border: 1px solid var(--glass-border);
}

.tag-manager h3 {
  margin-top: 0;
  margin-bottom: 1.25rem;
  font-size: 1.2rem;
  font-weight: 600;
  color: var(--text-color);
}

.add-form {
  display: flex;
  gap: 0.75rem;
  margin-bottom: 1.5rem;
  align-items: stretch;
  flex-wrap: wrap;
}

.input-field {
  flex: 1;
  min-width: 200px;
  padding: 0.75rem 1rem;
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
  gap: 0.5rem;
  padding: 0.5rem;
  background: rgba(120, 120, 128, 0.05);
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

.tag-cloud {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  min-height: 50px;
}

.tag-pill {
  display: inline-flex;
  align-items: center;
  padding: 0.5rem 0.75rem;
  border-radius: 999px;
  border: 2px solid;
  font-size: 0.9rem;
  gap: 0.5rem;
  font-weight: 500;
  transition: all 0.2s;
  position: relative;
}

.tag-pill:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(0,0,0,0.1);
}

.btn-icon-sm {
  background: rgba(0, 0, 0, 0.1);
  border: none;
  border-radius: 50%;
  cursor: pointer;
  font-size: 0.75rem;
  padding: 0.2rem;
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: inherit;
  transition: all 0.2s;
}

.btn-icon-sm:hover {
  background: rgba(0, 0, 0, 0.2);
  transform: scale(1.1);
}

.input-field-sm {
  width: 80px;
  padding: 0.2rem 0.4rem;
  border: none;
  background: rgba(255, 255, 255, 0.3);
  border-radius: 4px;
  color: inherit;
  font-weight: 500;
}

.input-field-sm:focus {
  outline: none;
  background: rgba(255, 255, 255, 0.5);
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

.tag-name {
  display: inline;
}

.tag-color-editor {
  position: absolute;
  top: 100%;
  left: 0;
  margin-top: 0.5rem;
  background: var(--glass-surface);
  border: 1px solid var(--glass-border);
  border-radius: 12px;
  padding: 0.5rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  min-width: 200px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
  z-index: 10;
}

.color-palette-inline {
  display: flex;
  gap: 0.3rem;
  flex-wrap: wrap;
  justify-content: center;
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
  box-shadow: 0 0 0 2px var(--glass-surface), 0 0 0 4px var(--text-color);
  transform: scale(1.2);
}

.color-picker-input-sm {
  width: 100%;
  height: 32px;
  border: 2px solid var(--glass-border);
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;
  padding: 2px;
  background: none;
}

.color-picker-input-sm:hover {
  border-color: var(--primary-color);
  box-shadow: 0 0 8px rgba(0, 122, 255, 0.3);
}

/* --- Responsive Design --- */
@media (max-width: 768px) {
  .tag-manager {
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
  .tag-manager {
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
  
  .tag-cloud {
    gap: 0.5rem;
  }
  
  .tag-pill {
    font-size: 0.85rem;
    padding: 0.4rem 0.6rem;
  }
  
  .btn-icon-sm {
    font-size: 0.7rem;
    width: 18px;
    height: 18px;
  }
}
</style>
