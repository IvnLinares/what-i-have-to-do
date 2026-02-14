<template>
  <div v-if="needRefresh" class="pwa-toast" role="alert">
    <div class="message">
      <span>New content available, click on reload button to update.</span>
    </div>
    <button @click="updateServiceWorker()">Reload</button>
    <button @click="close">Close</button>
  </div>
</template>

<script setup>
import { useRegisterSW } from 'virtual:pwa-register/vue'

const {
  needRefresh,
  updateServiceWorker
} = useRegisterSW()

const close = () => {
  needRefresh.value = false
}
</script>

<style scoped>
.pwa-toast {
  position: fixed;
  right: 0;
  bottom: 0;
  margin: 16px;
  padding: 12px;
  border: 1px solid #8885;
  border-radius: 4px;
  z-index: 1000;
  text-align: left;
  box-shadow: 3px 4px 5px 0 #8885;
  background-color: white;
  color: black;
}
.pwa-toast .message {
  margin-bottom: 8px;
}
.pwa-toast button {
  border: 1px solid #8885;
  outline: none;
  margin-right: 5px;
  border-radius: 2px;
  padding: 3px 10px;
}
</style>
