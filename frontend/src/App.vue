<template>
  <div id="app">
    <header>
      <h1>🚀 Copilot Testing Sandbox</h1>
      <p v-if="!authStore.user">Un espacio para explorar y practicar todas las funcionalidades de GitHub Copilot</p>
      <div v-if="authStore.user" class="user-info">
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

const authStore = useAuthStore()
const router = useRouter()

const handleLogout = () => {
  authStore.logout()
  router.push('/login')
}
</script>

<style scoped>
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
}

.user-info {
  margin-top: 1rem;
  display: flex;
  align-items: center;
  gap: 1rem;
}

.btn-sm {
  padding: 0.4rem 0.8rem;
  font-size: 0.9rem;
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
