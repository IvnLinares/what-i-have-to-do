import { ref } from 'vue'
import api from '../services/api'
import axios from 'axios' // Need direct axios for push subscription logic sometimes or use api wrapper

// Helper to convert VAPID key
function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding)
    .replace(/-/g, '+')
    .replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export function usePush() {
  const isSupported = 'serviceWorker' in navigator && 'PushManager' in window
  const isSubscribed = ref(false)
  const loading = ref(false)
  const error = ref(null)

  const checkSubscription = async () => {
    if (!isSupported) return
    const registration = await navigator.serviceWorker.ready
    const subscription = await registration.pushManager.getSubscription()
    isSubscribed.value = !!subscription
  }

  const subscribeToPush = async () => {
    if (!isSupported) return
    loading.value = true
    error.value = null

    try {
      // 1. Get Public Key from Backend
      // We assume an endpoint /api/push/key exists
      const response = await axios.get('/api/push/key')
      const publicKey = response.data.publicKey

      // 2. Request Permission
      const permission = await Notification.requestPermission()
      if (permission !== 'granted') {
        throw new Error('Permission denied')
      }

      // 3. Subscribe via Service Worker
      const registration = await navigator.serviceWorker.ready
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(publicKey)
      })

      // 4. Send Subscription to Backend
      // We assume api.js has a generic way to call endpoints or we use axios directly
      // Since we need Auth header, better use our api instance if possible,
      // but api.js doesn't have push endpoints exposed yet.
      // Let's add it to api.js first or use raw axios with header.
      // For now, raw axios with token.
      const token = localStorage.getItem('token')
      await axios.post('/api/push/subscribe', subscription, {
          headers: { Authorization: `Bearer ${token}` }
      })

      isSubscribed.value = true
      alert('¡Notificaciones activadas!')
    } catch (err) {
      console.error(err)
      error.value = err.message
      alert('Error al activar notificaciones: ' + err.message)
    } finally {
      loading.value = false
    }
  }

  return {
    isSupported,
    isSubscribed,
    loading,
    error,
    checkSubscription,
    subscribeToPush
  }
}
