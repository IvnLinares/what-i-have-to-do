import { ref, onMounted, watch } from 'vue'

export function useTheme() {
  const isDark = ref(localStorage.getItem('theme') === 'dark')

  const toggleTheme = () => {
    isDark.value = !isDark.value
  }

  const applyTheme = () => {
    if (isDark.value) {
      document.body.classList.add('dark-theme')
      localStorage.setItem('theme', 'dark')
    } else {
      document.body.classList.remove('dark-theme')
      localStorage.setItem('theme', 'light')
    }
  }

  onMounted(() => {
    // Check system preference if no stored theme
    if (!localStorage.getItem('theme')) {
        isDark.value = window.matchMedia('(prefers-color-scheme: dark)').matches
    }
    applyTheme()
  })

  watch(isDark, applyTheme)

  return {
    isDark,
    toggleTheme
  }
}
