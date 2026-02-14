<template>
  <div class="integration-manager">
    <div class="header">
      <h3><font-awesome-icon icon="plug" /> Integraciones</h3>
      <button @click="store.syncAll" class="btn-sync" :disabled="store.loading" title="Sincronizar todo ahora">
        <font-awesome-icon icon="rotate" :spin="store.loading" />
      </button>
    </div>

    <div v-if="store.error" class="error-msg">
      <font-awesome-icon icon="triangle-exclamation" /> {{ store.error }}
    </div>

    <div class="integrations-list">
      <!-- Google Calendar -->
      <div class="integration-card" :class="{ connected: isConnected('google-calendar') }">
        <div class="card-header">
          <font-awesome-icon :icon="['fab', 'google']" class="service-icon google" />
          <div class="info">
            <h4>Google Calendar</h4>
            <span class="status">
              {{ isConnected('google-calendar') ? 'Conectado' : 'Desconectado' }}
            </span>
          </div>
          <label class="switch">
            <input
              type="checkbox"
              :checked="isConnected('google-calendar')"
              @change="toggleGoogle"
              :disabled="store.loading"
            >
            <span class="slider round"></span>
          </label>
        </div>
        <div v-if="isConnected('google-calendar')" class="card-footer">
           <span class="last-sync" v-if="getLastSync('google-calendar')">
             <font-awesome-icon icon="clock" /> {{ formatTime(getLastSync('google-calendar')) }}
           </span>
        </div>
      </div>

      <!-- iCloud Calendar -->
      <div class="integration-card" :class="{ connected: isConnected('icloud-calendar') }">
        <div class="card-header">
          <font-awesome-icon :icon="['fab', 'apple']" class="service-icon apple" />
          <div class="info">
            <h4>iCloud Calendar</h4>
            <span class="status">
              {{ isConnected('icloud-calendar') ? 'Conectado' : 'Desconectado' }}
            </span>
          </div>
          <button @click="openIcloudModal" class="btn-config" :class="{ active: isConnected('icloud-calendar') }">
            <font-awesome-icon :icon="isConnected('icloud-calendar') ? 'gear' : 'plus'" />
          </button>
        </div>
        <div v-if="isConnected('icloud-calendar')" class="card-footer">
            <span class="last-sync" v-if="getLastSync('icloud-calendar')">
                <font-awesome-icon icon="clock" /> {{ formatTime(getLastSync('icloud-calendar')) }}
            </span>
            <button @click="disconnect('icloud-calendar')" class="btn-link danger">Desconectar</button>
        </div>
      </div>

      <!-- Notion -->
      <div class="integration-card" :class="{ connected: isConnected('notion') }">
        <div class="card-header">
            <!-- FontAwesome might not have notion icon in free set, using simple file-lines or N -->
          <font-awesome-icon icon="file-lines" class="service-icon notion" />
          <div class="info">
            <h4>Notion</h4>
            <span class="status">
              {{ isConnected('notion') ? 'Conectado' : 'Desconectado' }}
            </span>
          </div>
          <label class="switch">
            <input
              type="checkbox"
              :checked="isConnected('notion')"
              @change="toggleNotion"
              :disabled="store.loading"
            >
            <span class="slider round"></span>
          </label>
        </div>
        <div v-if="isConnected('notion')" class="card-footer">
            <span class="last-sync" v-if="getLastSync('notion')">
                <font-awesome-icon icon="clock" /> {{ formatTime(getLastSync('notion')) }}
            </span>
        </div>
      </div>
    </div>

    <!-- iCloud Modal -->
    <div v-if="showIcloudModal" class="modal-overlay" @click.self="closeIcloudModal">
      <div class="modal-content glass-panel">
        <h3>Configurar iCloud</h3>
        <p class="helper-text">Usa una contraseña de aplicación específica, no tu contraseña de Apple ID principal.</p>

        <form @submit.prevent="saveIcloud">
          <div class="form-group">
            <label>Apple ID Email</label>
            <input v-model="icloudForm.email" type="email" required placeholder="user@icloud.com" class="input-modern">
          </div>
          <div class="form-group">
            <label>Contraseña de Aplicación</label>
            <input v-model="icloudForm.password" type="password" required placeholder="xxxx-xxxx-xxxx-xxxx" class="input-modern">
            <a href="https://support.apple.com/en-us/HT204397" target="_blank" class="help-link">¿Cómo generar una?</a>
          </div>

          <div class="modal-actions">
            <button type="button" @click="closeIcloudModal" class="btn-text">Cancelar</button>
            <button type="submit" class="btn-primary" :disabled="store.loading">
              {{ store.loading ? 'Guardando...' : 'Conectar' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useIntegrationStore } from '../stores/integrationStore'

const store = useIntegrationStore()
const showIcloudModal = ref(false)
const icloudForm = ref({ email: '', password: '' })

onMounted(() => {
  store.fetchIntegrations()
})

const isConnected = (service) => {
  const integration = store.integrations.find(i => i.service === service)
  return integration && integration.connected
}

const getLastSync = (service) => {
  const integration = store.integrations.find(i => i.service === service)
  return integration ? integration.last_sync : null
}

const formatTime = (isoString) => {
  if (!isoString) return 'Nunca'
  return new Date(isoString).toLocaleString('es-ES', {
    month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
  })
}

// Actions
const toggleGoogle = async (e) => {
  if (e.target.checked) {
    // Start OAuth flow
    window.location.href = 'http://localhost:3000/api/integrations/auth/google'
  } else {
    if (confirm('¿Desconectar Google Calendar?')) {
      await store.disconnect('google-calendar')
    } else {
        e.target.checked = true // Revert
    }
  }
}

const toggleNotion = async (e) => {
  if (e.target.checked) {
    // Start OAuth flow
    window.location.href = 'http://localhost:3000/api/integrations/auth/notion'
  } else {
    if (confirm('¿Desconectar Notion?')) {
      await store.disconnect('notion')
    } else {
        e.target.checked = true
    }
  }
}

const openIcloudModal = () => {
  showIcloudModal.value = true
}
const closeIcloudModal = () => {
  showIcloudModal.value = false
  icloudForm.value = { email: '', password: '' }
}

const saveIcloud = async () => {
  const success = await store.connectIcloud(icloudForm.value)
  if (success) closeIcloudModal()
}

const disconnect = async (service) => {
    if (confirm(`¿Desconectar ${service}?`)) {
        await store.disconnect(service)
    }
}
</script>

<style scoped>
.integration-manager {
    margin-top: 2rem;
    padding-top: 1rem;
    border-top: 1px solid var(--glass-border);
}

.header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1.5rem;
}

.header h3 {
    margin: 0;
    font-size: 1.2rem;
    display: flex;
    align-items: center;
    gap: 0.5rem;
}

.btn-sync {
    background: transparent;
    border: none;
    color: var(--primary-color);
    font-size: 1.2rem;
    cursor: pointer;
    transition: transform 0.3s;
}
.btn-sync:hover { transform: rotate(180deg); }
.btn-sync:disabled { opacity: 0.5; cursor: not-allowed; }

.integrations-list {
    display: flex;
    flex-direction: column;
    gap: 1rem;
}

.integration-card {
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid var(--glass-border);
    border-radius: 16px;
    padding: 1rem;
    transition: all 0.2s;
}

.integration-card.connected {
    background: rgba(52, 199, 89, 0.05);
    border-color: rgba(52, 199, 89, 0.2);
}

.card-header {
    display: flex;
    align-items: center;
    gap: 1rem;
}

.service-icon {
    font-size: 1.8rem;
    width: 40px;
    height: 40px;
    display: flex;
    align-items: center;
    justify-content: center;
}
.service-icon.google { color: #4285F4; }
.service-icon.apple { color: #A2AAAD; }
.service-icon.notion { color: var(--text-color); }

.info { flex: 1; }
.info h4 { margin: 0; font-size: 1rem; }
.status { font-size: 0.8rem; color: var(--text-muted); }

.card-footer {
    margin-top: 0.8rem;
    padding-top: 0.8rem;
    border-top: 1px solid rgba(255,255,255,0.05);
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 0.8rem;
    color: var(--text-muted);
}

.btn-link {
    background: none;
    border: none;
    padding: 0;
    font-size: 0.8rem;
    cursor: pointer;
    text-decoration: underline;
}
.btn-link.danger { color: var(--danger-color); }

/* Switch Toggle */
.switch {
  position: relative;
  display: inline-block;
  width: 44px;
  height: 24px;
}
.switch input { opacity: 0; width: 0; height: 0; }
.slider {
  position: absolute;
  cursor: pointer;
  top: 0; left: 0; right: 0; bottom: 0;
  background-color: #ccc;
  transition: .4s;
}
.slider:before {
  position: absolute;
  content: "";
  height: 18px; width: 18px;
  left: 3px; bottom: 3px;
  background-color: white;
  transition: .4s;
}
input:checked + .slider { background-color: var(--success-color); }
input:checked + .slider:before { transform: translateX(20px); }
.slider.round { border-radius: 34px; }
.slider.round:before { border-radius: 50%; }

.btn-config {
    background: transparent;
    border: 1px solid var(--text-muted);
    color: var(--text-muted);
    width: 32px; height: 32px;
    border-radius: 50%;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s;
}
.btn-config:hover, .btn-config.active {
    background: var(--primary-color);
    border-color: var(--primary-color);
    color: white;
}

/* Modal */
.modal-overlay {
    position: fixed;
    top: 0; left: 0; width: 100%; height: 100%;
    background: rgba(0,0,0,0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
    backdrop-filter: blur(4px);
}
.modal-content {
    background: var(--surface-color);
    padding: 2rem;
    border-radius: 20px;
    width: 90%;
    max-width: 400px;
}
.helper-text { font-size: 0.85rem; color: var(--text-muted); margin-bottom: 1.5rem; }
.help-link { font-size: 0.8rem; color: var(--primary-color); display: block; margin-top: 0.3rem; }
.modal-actions {
    display: flex;
    justify-content: flex-end;
    gap: 1rem;
    margin-top: 2rem;
}
</style>
