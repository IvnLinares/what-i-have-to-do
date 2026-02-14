import { ref, onMounted, onUnmounted, watch } from 'vue'

export function useTheme() {
  const isDark = ref(localStorage.getItem('theme') === 'dark')
  let mediaQuery = null

  const toggleTheme = () => {
    isDark.value = !isDark.value
    // When manually toggled, save preference
    localStorage.setItem('theme', isDark.value ? 'dark' : 'light')
    localStorage.setItem('theme-manual', 'true')
  }

  const applyTheme = () => {
    if (isDark.value) {
      document.body.classList.add('dark-theme')
    } else {
      document.body.classList.remove('dark-theme')
    }
  }

  const handleSystemThemeChange = (e) => {
    // Only apply system preference if user hasn't manually set a theme
    if (!localStorage.getItem('theme-manual')) {
      isDark.value = e.matches
    }
  }

  onMounted(() => {
    // Check if user has manually set theme
    const manualTheme = localStorage.getItem('theme-manual')
    
    if (!manualTheme) {
      // If no manual setting, use system preference
      mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
      isDark.value = mediaQuery.matches
      
      // Listen for system theme changes
      mediaQuery.addEventListener('change', handleSystemThemeChange)
    }
    
    applyTheme()
  })

  onUnmounted(() => {
    if (mediaQuery) {
      mediaQuery.removeEventListener('change', handleSystemThemeChange)
    }
  })

  watch(isDark, applyTheme)

  return {
    isDark,
    toggleTheme
  }
}
