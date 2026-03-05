# 🚀 Supabase Edge Functions - Setup Guide

Guía para desplegar el backend como Edge Functions en Supabase

---

## ✅ Arquitectura Actual

```
Frontend (Vue 3)
    ↓ HTTPS
GitHub Pages
    ↓ (API Calls)
Supabase Edge Functions (Deno)
    ↓
Supabase PostgreSQL
```

**TODO ES SUPABASE = 100% Gratis en Free Tier**

---

## 🔧 Requisitos Previos

- ✅ Proyecto Supabase creado: `pemudfoinavlslhkgjlk`
- ✅ PostgreSQL BD configurada
- ✅ Edge Functions creadas localmente
- ✅ GitHub conectado a Supabase

---

## 🚀 Deploy en 3 Pasos

### PASO 1: Conectar GitHub a Supabase

1. Ve a: https://supabase.com/dashboard/project/pemudfoinavlslhkgjlk/settings/integrations
2. Click "GitHub"
3. Autoriza Supabase para acceder a `IvnLinares/what-i-have-to-do`
4. Selecciona que carpeta monitorear: `supabase/functions`

### PASO 2: Deploy Automático

1. En Supabase Dashboard, ve a "Edge Functions"
2. Click "New Function"
3. Selecciona "Deploy from GitHub"
4. Elige la rama `main`
5. Supabase detectará automáticamente las funciones

**O manualmente con CLI:**

```bash
# Instalar Supabase CLI
brew install supabase/tap/supabase
# O en Windows: choco install supabase

# Login
supabase login

# Deploy
cd supabase
supabase functions deploy
```

### PASO 3: Obtener URLs de las Functions

Una vez deployed, obtendrás URLs como:

```
https://pemudfoinavlslhkgjlk.supabase.co/functions/v1/auth
https://pemudfoinavlslhkgjlk.supabase.co/functions/v1/tasks
https://pemudfoinavlslhkgjlk.supabase.co/functions/v1/categories
https://pemudfoinavlslhkgjlk.supabase.co/functions/v1/tags
```

---

## 🔗 Actualizar Frontend

Una vez deployed, configurar el frontend:

### Opción A: Variables de Entorno

Crear `frontend/.env`:

```env
VITE_API_URL=https://pemudfoinavlslhkgjlk.supabase.co/functions/v1
```

### Opción B: Actualizar directamente

En `frontend/src/services/api.js`:

```javascript
const API_BASE_URL = import.meta.env.VITE_API_URL || 
  'https://pemudfoinavlslhkgjlk.supabase.co/functions/v1'
```

---

## 📝 Cambios Necesarios en Frontend

El API cambió de Express a Deno, así que algunos endpoints cambiaron:

### Antes (Express):
```javascript
POST /api/auth/login
POST /api/auth/register
GET  /api/tasks
POST /api/tasks
```

### Ahora (Edge Functions):
```javascript
POST /functions/v1/auth        // action: login o register
GET  /functions/v1/tasks
POST /functions/v1/tasks       // Create
PUT  /functions/v1/tasks/:id   // Update
DELETE /functions/v1/tasks/:id // Delete
```

### Actualizar `frontend/src/services/api.js`:

```javascript
export default {
  // Auth API
  login(credentials) {
    return apiClient.post('/auth', {
      action: 'login',
      ...credentials
    })
  },
  register(credentials) {
    return apiClient.post('/auth', {
      action: 'register',
      ...credentials
    })
  },
  
  // Tasks API
  getTasks() {
    return apiClient.get('/tasks')
  },
  createTask(task) {
    return apiClient.post('/tasks', task)
  },
  updateTask(id, task) {
    return apiClient.put(`/tasks/${id}`, task)
  },
  deleteTask(id) {
    return apiClient.delete(`/tasks/${id}`)
  },
  
  // ... similar para categories y tags
}
```

---

## 🧪 Probar las Functions

### Test 1: Check Health

```bash
curl https://pemudfoinavlslhkgjlk.supabase.co/functions/v1/auth
# Debería devolver un error de autenticación (es normal)
```

### Test 2: Login

```bash
curl -X POST https://pemudfoinavlslhkgjlk.supabase.co/functions/v1/auth \
  -H "Content-Type: application/json" \
  -d '{
    "action": "login",
    "username": "linaresivn@gmail.com",
    "password": "admin123"
  }'
```

### Test 3: Desde el Frontend

1. Abre: https://ivnlinares.github.io/what-i-have-to-do/
2. Intenta login con linaresivn@gmail.com / admin123
3. Verifica en browser DevTools (F12) los requests

---

## 🔐 Variables de Entorno

Las Edge Functions automáticamente tienen acceso a:

```
SUPABASE_URL = https://pemudfoinavlslhkgjlk.supabase.co
SUPABASE_SERVICE_ROLE_KEY = [auto-inyectado]
```

No necesitas configurar nada más.

---

## 📊 Monitorear Logs

En Supabase Dashboard:

1. Ve a "Edge Functions"
2. Click en la función
3. Tab "Logs"
4. Verás todos los requests y errores

---

## 🐛 Troubleshooting

### Error: "env.SUPABASE_URL is required"
**Causa:** Variables no inyectadas  
**Solución:** Asegúrate que la función está deployed en Supabase

### Error: "Unauthorized"
**Causa:** Token inválido o faltante  
**Solución:** Incluye header `Authorization: Bearer {token}`

### Error: "User not found"
**Causa:** Usuario no existe en BD  
**Solución:** Verifica que `linaresivn@gmail.com` existe en tabla `users`

### CORS Errors
**Causa:** Frontend y backend en dominios diferentes  
**Solución:** ✅ Ya manejado con `corsHeaders` en la función

---

## 📈 Performance

- Edge Functions: **Latencia ultra baja** (distribuido globalmente)
- PostgreSQL: **Queries optimizadas** con índices
- Total Cold Start: **< 100ms**
- Throughput: **Ilimitado en Free Tier**

---

## 💰 Costos

**Supabase Free Tier incluye:**
- ✅ Edge Functions: $0
- ✅ PostgreSQL: $0 (hasta 500MB)
- ✅ Requests: ∞ ilimitados
- ✅ Bandwidth: 50GB/mes

**Total: $0/mes** 🎉

---

## ✅ Checklist Final

- [ ] Edge Functions creadas localmente
- [ ] Conectado GitHub a Supabase
- [ ] Funciones deployed en Supabase
- [ ] Frontend actualizado con nueva API_URL
- [ ] Login funciona en https://ivnlinares.github.io/what-i-have-to-do/
- [ ] Tareas se crean/leen correctamente
- [ ] Datos persistidos en PostgreSQL

---

## 📚 Links Útiles

- **Supabase Dashboard:** https://supabase.com/dashboard/project/pemudfoinavlslhkgjlk
- **Edge Functions Docs:** https://supabase.com/docs/guides/functions
- **Deno Docs:** https://deno.land/manual

---

## 🎯 Próximos Pasos

1. Commit y push de Edge Functions a GitHub
2. Conectar GitHub a Supabase
3. Deploy automático
4. Actualizar Frontend
5. Rebuild y deploy a GitHub Pages
6. ¡Listo! Todo en una URL: https://supabase.com

---

**Status:** Ready to deploy! 🚀
