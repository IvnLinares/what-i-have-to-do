<template>
  <div class="settings-panel">
    <h3>⚙️ Configuración</h3>

    <div class="settings-section">
        <h4>Apariencia</h4>
        <div class="setting-item">
            <span>Modo Oscuro</span>
            <!-- Toggle logic exists globally, but we can add redundant control here -->
        </div>
    </div>

    <div class="settings-section">
        <h4>Notificaciones</h4>
        <div class="setting-item">
            <span>Notificaciones Push</span>
            <button
                v-if="isSupported && !isSubscribed"
                @click="subscribeToPush"
                class="btn btn-primary btn-sm"
                :disabled="loading"
            >
                {{ loading ? 'Activando...' : 'Activar' }}
            </button>
            <span v-else-if="isSubscribed" class="badge-success">✅ Activadas</span>
            <span v-else class="text-muted">No soportado</span>
        </div>
    </div>

    <hr>

    <!-- Existing Managers -->
    <CategoryManager />
    <TagManager />
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import CategoryManager from './CategoryManager.vue'
import TagManager from './TagManager.vue'
import { usePush } from '../composables/usePush'

const { isSupported, isSubscribed, loading, checkSubscription, subscribeToPush } = usePush()

onMounted(() => {
    checkSubscription()
})
</script>

<style scoped>
.settings-panel {
    background: var(--surface-color);
    padding: 1.5rem;
    border-radius: 12px;
    border: 1px solid var(--border-color);
    margin-bottom: 2rem;
    backdrop-filter: blur(10px);
}

.settings-section {
    margin-bottom: 1.5rem;
}

.setting-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0.5rem 0;
}

h3 { margin-top: 0; }
h4 { margin-bottom: 0.5rem; color: var(--primary-color); }

.badge-success {
    color: var(--success-color);
    font-weight: bold;
    font-size: 0.9rem;
}

.text-muted { color: var(--text-muted); }

.btn-sm {
    padding: 0.3rem 0.8rem;
    font-size: 0.9rem;
}
</style>
