<template>
  <div id="app">
    <ReloadPrompt />

    <!-- Floating Theme Toggle (Glass Circle) -->
    <button class="theme-toggle hover-lift" @click="toggleTheme" :title="isDark ? 'Modo Claro' : 'Modo Oscuro'">
        <font-awesome-icon :icon="isDark ? 'sun' : 'moon'" />
    </button>

    <header>
      <h1>🚀 Copilot Testing Sandbox</h1>

      <!-- User Info Pill -->
      <transition name="fade">
        <div v-if="authStore.user" class="user-info hover-lift">
            <span class="user-avatar">
                <font-awesome-icon icon="user" />
            </span>
            <span class="user-welcome">Hola, <strong>{{ authStore.user.username }}</strong></span>
            <button @click="handleLogout" class="btn-logout" title="Cerrar Sesión">
                <font-awesome-icon icon="right-from-bracket" />
            </button>
        </div>
        <p v-else class="subtitle">Explora y gestiona tus tareas con estilo.</p>
      </transition>
    </header>

    <main>
      <router-view v-slot="{ Component }">
        <transition name="scale-fade" mode="out-in">
          <component :is="Component" />
        </transition>
      </router-view>
    </main>

    <footer>
      <p>Diseñado con ❤️ y Copilot</p>
    </footer>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from './stores/authStore'
import { useTheme } from './composables/useTheme'
import ReloadPrompt from './components/ReloadPrompt.vue'

const authStore = useAuthStore()
const router = useRouter()
const { isDark, toggleTheme } = useTheme()

const handleLogout = () => {
  authStore.logout()
  router.push('/login')
}
</script>

<style scoped>
/* --- Layout & Header --- */
header {
  text-align: center;
  margin-bottom: 3rem;
  padding: 1rem 0;
  display: flex;
  flex-direction: column;
  align-items: center;
}

header h1 {
  background: linear-gradient(135deg, var(--primary-color), #A855F7);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  font-size: 2.8rem;
  margin-bottom: 0.5rem;
  letter-spacing: -0.03em;
  font-weight: 800;
}

.subtitle {
  color: var(--text-muted);
  font-size: 1.1rem;
}

/* --- Theme Toggle --- */
.theme-toggle {
    position: fixed;
    top: 20px;
    right: 20px;
    z-index: 1000;
    width: 50px;
    height: 50px;
    border-radius: 50%;
    border: 1px solid var(--glass-border);
    background: var(--glass-surface);
    backdrop-filter: blur(var(--glass-blur));
    box-shadow: var(--glass-shadow);
    font-size: 1.2rem;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
    color: var(--text-color);
}

/* --- User Info Pill (Glass) --- */
.user-info {
  margin-top: 1.5rem;
  display: inline-flex;
  align-items: center;
  gap: 1rem;
  padding: 0.6rem 0.8rem 0.6rem 0.6rem;
  border-radius: 50px; /* Full pill */

  background: var(--glass-surface);
  backdrop-filter: blur(var(--glass-blur));
  border: 1px solid var(--glass-border);
  box-shadow: 0 4px 20px rgba(0,0,0,0.08);
}

.user-avatar {
  width: 36px;
  height: 36px;
  background: var(--primary-color);
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1rem;
}

.user-welcome {
  font-size: 0.95rem;
  color: var(--text-color);
}

.btn-logout {
  background: transparent;
  color: var(--text-muted);
  border: 1px solid transparent;
  padding: 0.4rem 0.8rem;
  border-radius: 20px;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
}

.btn-logout:hover {
  background: rgba(255, 59, 48, 0.1); /* Red tint */
  color: var(--danger-color);
}

/* --- Page Transitions --- */
.scale-fade-enter-active,
.scale-fade-leave-active {
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
}

.scale-fade-enter-from,
.scale-fade-leave-to {
  opacity: 0;
  transform: scale(0.98);
}

main {
  margin: 1rem 0;
}

footer {
  text-align: center;
  padding: 3rem 0;
  margin-top: 4rem;
  color: var(--text-muted);
  font-size: 0.9rem;
  opacity: 0.8;
}
</style>
