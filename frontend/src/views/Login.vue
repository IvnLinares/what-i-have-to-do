<template>
  <div class="auth-container">
    <div class="auth-card card">
      <h2>{{ isLogin ? 'Iniciar Sesión' : 'Registrarse' }}</h2>
      <form @submit.prevent="handleSubmit">
        <div class="form-group">
          <label for="username">Usuario</label>
          <input
            v-model="form.username"
            type="text"
            id="username"
            required
            minlength="3"
            class="input-field"
          />
        </div>
        <div class="form-group">
          <label for="password">Contraseña</label>
          <input
            v-model="form.password"
            type="password"
            id="password"
            required
            minlength="6"
            class="input-field"
          />
        </div>

        <div v-if="authStore.error" class="error-message">
          {{ authStore.error }}
        </div>

        <button type="submit" class="btn btn-primary w-100" :disabled="authStore.loading">
          {{ isLogin ? 'Entrar' : 'Registrarse' }}
        </button>
      </form>

      <p class="switch-mode">
        {{ isLogin ? '¿No tienes cuenta?' : '¿Ya tienes cuenta?' }}
        <a href="#" @click.prevent="toggleMode">
          {{ isLogin ? 'Regístrate aquí' : 'Inicia sesión aquí' }}
        </a>
      </p>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useAuthStore } from '../stores/authStore'
import { useRouter } from 'vue-router'

const authStore = useAuthStore()
const router = useRouter()

const isLogin = ref(true)
const form = ref({ username: '', password: '' })

const toggleMode = () => {
  isLogin.value = !isLogin.value
  authStore.error = null
  form.value = { username: '', password: '' }
}

const handleSubmit = async () => {
  const { username, password } = form.value
  let success

  if (isLogin.value) {
    success = await authStore.login(username, password)
  } else {
    success = await authStore.register(username, password)
  }

  if (success) {
    router.push('/')
  }
}
</script>

<style scoped>
.auth-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 80vh;
}

.auth-card {
  width: 100%;
  max-width: 400px;
}

h2 {
  text-align: center;
  margin-bottom: 2rem;
  color: var(--primary-color);
}

.w-100 {
  width: 100%;
  margin-top: 1rem;
}

.switch-mode {
  text-align: center;
  margin-top: 1.5rem;
  font-size: 0.9rem;
}

.error-message {
  color: var(--danger-color);
  background: rgba(239, 68, 68, 0.1);
  padding: 0.8rem;
  border-radius: 8px;
  margin-bottom: 1rem;
  text-align: center;
}
</style>
