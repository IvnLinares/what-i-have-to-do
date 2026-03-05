<template>
  <div class="auth-container">
    <div class="auth-card glass-panel">

      <div class="auth-header">
        <div class="brand-icon">
          <font-awesome-icon icon="fa-solid fa-rocket" />
        </div>
        <h2>{{ isLogin ? 'Bienvenido de nuevo' : 'Crea tu cuenta' }}</h2>
        <p class="text-muted">{{ isLogin ? 'Inicia sesión para continuar' : 'Únete a nosotros hoy mismo' }}</p>
      </div>

      <form @submit.prevent="handleSubmit" class="auth-form">
        <div class="form-group">
          <label for="email">Email <span class="required-star">*</span></label>
          <div class="input-wrapper">
            <font-awesome-icon icon="fa-solid fa-user" class="input-icon" />
            <input v-model="form.email" type="email" id="email" placeholder="tu@email.com" required
              class="input-field" />
          </div>
        </div>

        <transition name="fade">
          <div v-if="!isLogin" class="form-group">
            <label for="username">Nombre de usuario <span class="required-star">*</span></label>
            <div class="input-wrapper">
              <font-awesome-icon icon="fa-solid fa-font" class="input-icon" />
              <input v-model="form.username" type="text" id="username" placeholder="Como te verán otros"
                :required="!isLogin" minlength="3" class="input-field" />
            </div>
          </div>
        </transition>

        <div class="form-group">
          <label for="password">Contraseña <span class="required-star">*</span></label>
          <div class="input-wrapper">
            <font-awesome-icon icon="fa-solid fa-lock" class="input-icon" />
            <input v-model="form.password" type="password" id="password" placeholder="Tu contraseña" required
              minlength="6" class="input-field" />
          </div>
        </div>

        <transition name="fade">
          <div v-if="authStore.error" class="error-message">
            <font-awesome-icon icon="fa-solid fa-triangle-exclamation" class="error-icon" />
            {{ authStore.error }}
          </div>
        </transition>

        <button type="submit" class="btn btn-primary w-100 hover-lift submit-btn" :disabled="authStore.loading">
          <span v-if="authStore.loading" class="spinner btn-spinner"></span>
          <span v-else>{{ isLogin ? 'Entrar' : 'Registrarse' }}</span>
        </button>
      </form>

      <div class="auth-footer">
        <p class="switch-mode">
          <span class="text-muted">{{ isLogin ? '¿No tienes cuenta?' : '¿Ya tienes cuenta?' }}</span>
          <a href="#" @click.prevent="toggleMode" class="switch-link">
            {{ isLogin ? 'Regístrate aquí' : 'Inicia sesión aquí' }}
          </a>
        </p>
      </div>

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
const form = ref({ email: '', password: '', username: '' })

const toggleMode = () => {
  isLogin.value = !isLogin.value
  authStore.error = null
  form.value = { email: '', password: '', username: '' }
}

const handleSubmit = async () => {
  const { email, password, username } = form.value

  // Basic JS validation to ensure email is present and looks like an email
  if (!email || !email.includes('@')) {
    authStore.error = 'Se requiere un correo electrónico válido'
    return
  }

  let success
  if (isLogin.value) {
    success = await authStore.login(email, password)
  } else {
    if (!username || username.length < 3) {
      authStore.error = 'El nombre de usuario debe tener al menos 3 caracteres'
      return
    }
    success = await authStore.register(email, password, username)
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
  min-height: 85vh;
  padding: 1rem;
}

.auth-card {
  width: 100%;
  max-width: 420px;
  padding: 2.5rem;
  display: flex;
  flex-direction: column;
  gap: 2rem;
  /* Extra shadow and glow for visual appeal */
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1), 0 0 0 1px var(--glass-border);
}

.auth-header {
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
}

.brand-icon {
  width: 48px;
  height: 48px;
  background: linear-gradient(135deg, var(--primary-color), var(--primary-hover));
  color: white;
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  margin-bottom: 0.5rem;
  box-shadow: 0 8px 16px rgba(0, 122, 255, 0.3);
}

h2 {
  margin: 0;
  font-size: 1.75rem;
  font-weight: 700;
  color: var(--text-color);
  letter-spacing: -0.03em;
}

.auth-form {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

label {
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--text-color);
  margin-left: 0.25rem;
}

.required-star {
  color: var(--danger-color);
  margin-left: 2px;
}

/* Input Wrappers for Icons */
.input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.input-icon {
  position: absolute;
  left: 14px;
  color: var(--text-muted);
  font-size: 1rem;
  transition: color 0.3s ease;
  z-index: 2;
  pointer-events: none;
}

.input-field {
  width: 100%;
  padding: 14px 16px 14px 44px;
  /* Make room for icon */
  border-radius: 14px;
  background: var(--surface-color);
  border: 1px solid var(--border-color);
  font-size: 1rem;
  color: var(--text-color);
  transition: all 0.3s ease;
}

.input-field::placeholder {
  color: var(--text-muted);
  opacity: 0.7;
}

.input-field:focus {
  outline: none;
  background: rgba(255, 255, 255, 0.1);
  border-color: var(--primary-color);
  box-shadow: 0 0 0 4px rgba(0, 122, 255, 0.15);
}

/* Change icon color when input is focused */
.input-wrapper:focus-within .input-icon {
  color: var(--primary-color);
}

/* Submit Button */
.submit-btn {
  background: var(--primary-color);
  color: white;
  border: none;
  padding: 14px;
  font-size: 1.05rem;
  font-weight: 600;
  margin-top: 0.5rem;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  border-radius: var(--btn-radius);
  transition: all 0.2s ease;
}

.submit-btn:hover:not(:disabled) {
  background: var(--primary-hover);
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(0, 122, 255, 0.3);
}

.submit-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

.btn-spinner {
  width: 20px;
  height: 20px;
  border-width: 2px;
  border-top-color: white;
  border-right-color: rgba(255, 255, 255, 0.3);
  border-bottom-color: rgba(255, 255, 255, 0.3);
  border-left-color: rgba(255, 255, 255, 0.3);
}

/* Error Message Customization */
.error-message {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  color: var(--danger-color);
  background: rgba(255, 59, 48, 0.1);
  border: 1px solid rgba(255, 59, 48, 0.2);
  padding: 1rem;
  border-radius: 12px;
  font-size: 0.9rem;
  font-weight: 500;
}

.error-icon {
  font-size: 1.1rem;
}

/* Footer / Switch Mode */
.auth-footer {
  text-align: center;
  border-top: 1px solid var(--border-color);
  padding-top: 1.5rem;
  margin-top: 0.5rem;
}

.switch-mode {
  font-size: 0.95rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.switch-link {
  color: var(--primary-color);
  font-weight: 600;
  text-decoration: none;
  transition: all 0.2s ease;
}

.switch-link:hover {
  text-decoration: underline;
  color: var(--primary-hover);
}

/* Transitions */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease, transform 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}
</style>
