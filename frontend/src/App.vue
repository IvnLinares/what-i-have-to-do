<template>
  <div id="app">
    <!-- Floating Theme Toggle -->
    <button class="theme-toggle" @click="toggleTheme" :title="isDark ? 'Modo Claro' : 'Modo Oscuro'">
        {{ isDark ? '🌞' : '🌙' }}
    </button>

    <header>
      <h1>🚀 Copilot Testing Sandbox</h1>
      <p v-if="!authStore.user">Un espacio para explorar y practicar todas las funcionalidades de GitHub Copilot</p>
      <div v-if="authStore.user" class="user-info card glass-panel">
        <span>Hola, <strong>{{ authStore.user.username }}</strong></span>
        <button @click="handleLogout" class="btn btn-secondary btn-sm">Cerrar Sesión</button>
      </div>
    </header>

    <main>
      <router-view></router-view>
    </main>

    <footer>
      <p>Proyecto desarrollado para el testing de Copilot Agent Mode</p>
    </footer>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from './stores/authStore'
import { useTheme } from './composables/useTheme'

const authStore = useAuthStore()
const router = useRouter()
const { isDark, toggleTheme } = useTheme()

const handleLogout = () => {
  authStore.logout()
  router.push('/login')
}
</script>

<style scoped>
.theme-toggle {
    position: fixed;
    top: 1rem;
    right: 1rem;
    z-index: 1000;
    width: 45px;
    height: 45px;
    border-radius: 50%;
    border: none;
    background: var(--surface-color);
    backdrop-filter: blur(10px);
    box-shadow: 0 4px 12px rgba(0,0,0,0.1);
    font-size: 1.5rem;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: transform 0.2s, background 0.3s;
}

.theme-toggle:hover {
    transform: scale(1.1) rotate(15deg);
}

header {
  text-align: center;
  margin-bottom: 3rem;
  padding: 2rem 0;
  border-bottom: 1px solid var(--border-color);
  display: flex;
  flex-direction: column;
  align-items: center;
}

header h1 {
  background: linear-gradient(135deg, var(--primary-color), var(--success-color));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  font-size: 2.5rem;
  margin-bottom: 0.5rem;
  text-shadow: 0 2px 10px rgba(99, 102, 241, 0.2);
}

.user-info {
  margin-top: 1rem;
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0.8rem 1.5rem;
  border-radius: 50px; /* Pill shape */
}

.glass-panel {
    background: var(--surface-color);
    backdrop-filter: blur(10px);
    border: 1px solid var(--surface-border);
}

.btn-sm {
  padding: 0.4rem 0.8rem;
  font-size: 0.9rem;
  border-radius: 20px;
}

header p {
  color: var(--text-muted);
  font-size: 1.2rem;
}

main {
  margin: 2rem 0;
}

footer {
  text-align: center;
  padding: 2rem 0;
  margin-top: 4rem;
  border-top: 1px solid var(--border-color);
  color: var(--text-muted);
  font-size: 0.9rem;
}
</style>
