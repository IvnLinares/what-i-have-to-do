<template>
  <div class="settings-panel">
    <h3><font-awesome-icon icon="gear" /> Configuración</h3>

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
            <span v-else-if="isSubscribed" class="badge-success"><font-awesome-icon icon="circle-check" /> Activadas</span>
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
    background: var(--glass-surface);
    backdrop-filter: blur(var(--glass-blur));
    padding: 2rem;
    border-radius: var(--card-radius);
    border: 1px solid var(--glass-border);
    box-shadow: var(--glass-shadow);
    margin-bottom: 2rem;
}

.settings-section {
    margin-bottom: 2rem;
    padding-bottom: 1.5rem;
}

.setting-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0.75rem 0;
}

h3 { 
    margin-top: 0;
    margin-bottom: 1.5rem;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 1.5rem;
}

h4 { 
    margin-bottom: 1rem;
    color: var(--primary-color);
    font-size: 1.1rem;
    font-weight: 600;
}

hr {
    border: none;
    border-top: 1px solid var(--glass-border);
    margin: 2rem 0;
}

.badge-success {
    color: var(--success-color);
    font-weight: 600;
    font-size: 0.9rem;
    display: flex;
    align-items: center;
    gap: 0.3rem;
}

.text-muted { color: var(--text-muted); }

.btn-sm {
    padding: 0.4rem 1rem;
    font-size: 0.9rem;
    border-radius: var(--btn-radius);
}

@media (max-width: 768px) {
    .settings-panel {
        padding: 1.5rem;
    }
    
    h3 {
        font-size: 1.3rem;
    }
}

@media (max-width: 480px) {
    .settings-panel {
        padding: 1rem;
    }
    
    .setting-item {
        flex-direction: column;
        align-items: flex-start;
        gap: 0.75rem;
    }
}
</style>
