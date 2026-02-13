<template>
  <div class="tag-manager card">
    <h3>Gestionar Etiquetas</h3>

    <div class="add-form">
      <input
        v-model="newTag.name"
        placeholder="Nombre de etiqueta"
        class="input-field"
      />
      <input
        v-model="newTag.color"
        type="color"
        class="color-picker"
        title="Color de etiqueta"
      />
      <button @click="addTag" class="btn btn-primary" :disabled="!newTag.name">
        ➕ Agregar
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
        <span v-if="editingId !== tag.id">{{ tag.name }}</span>
        <input
          v-else
          v-model="editForm.name"
          class="input-field-sm"
        />

        <div class="actions">
          <button v-if="editingId !== tag.id" @click="startEdit(tag)" class="btn-icon-sm">✏️</button>
          <button v-if="editingId !== tag.id" @click="deleteTag(tag.id)" class="btn-icon-sm">✖️</button>
          <button v-if="editingId === tag.id" @click="saveEdit(tag.id)" class="btn-icon-sm">💾</button>
          <button v-if="editingId === tag.id" @click="cancelEdit" class="btn-icon-sm">🚫</button>
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

.tag-cloud {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.tag-pill {
  display: inline-flex;
  align-items: center;
  padding: 0.3rem 0.6rem;
  border-radius: 999px;
  border: 1px solid;
  font-size: 0.85rem;
  gap: 0.5rem;
}

.btn-icon-sm {
  background: none;
  border: none;
  cursor: pointer;
  font-size: 0.8rem;
  padding: 0 0.2rem;
  color: inherit;
}

.input-field-sm {
  width: 80px;
  padding: 0.1rem;
  border: none;
  background: transparent;
  border-bottom: 1px solid currentColor;
  color: inherit;
}
</style>
