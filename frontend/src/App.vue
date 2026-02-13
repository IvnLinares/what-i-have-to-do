<template>
  <div>
    <header>
      <h1>🚀 Copilot Testing Sandbox</h1>
      <p>Un espacio para explorar y practicar todas las funcionalidades de GitHub Copilot</p>
    </header>

    <main>
      <TaskManager />
    </main>

    <footer>
      <p>Proyecto desarrollado para el testing de Copilot Agent Mode</p>
    </footer>
  </div>
</template>

<script setup>
import TaskManager from './components/TaskManager.vue'
</script>

<style scoped>
header {
  text-align: center;
  margin-bottom: 3rem;
  padding: 2rem 0;
  border-bottom: 1px solid var(--border-color);
}

header h1 {
  background: linear-gradient(135deg, var(--primary-color), var(--success-color));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  font-size: 2.5rem;
  margin-bottom: 0.5rem;
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
