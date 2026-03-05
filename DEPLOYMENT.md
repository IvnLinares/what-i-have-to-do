# 🚀 Deployment Guide - Railway

Guía para desplegar el backend Express.js a **Railway** (el servicio más fácil)

---

## ✅ Requisitos Previos

1. ✅ Backend configurado para Supabase PostgreSQL
2. ✅ Código pushed a GitHub (main branch)
3. ✅ Crear cuenta en Railway (gratis)

---

## 🚀 Pasos de Deployment

### Step 1: Crear Cuenta en Railway

1. Ve a: https://railway.app/
2. Click en "Start Project" → "Deploy from GitHub"
3. Conecta tu cuenta de GitHub
4. Autoriza Railway para acceder a tus repositorios

### Step 2: Crear Nuevo Proyecto

1. En Railway dashboard, click "New Project"
2. Selecciona "Deploy from GitHub repo"
3. Busca y selecciona: `IvnLinares/Copilot-Testing`
4. Click "Deploy Now"

### Step 3: Configurar Servicio Backend

Railway detectará automáticamente el `backend/package.json`:

1. En el servicio que se creó, click en "Variables"
2. Agregar estas variables de entorno:

```env
PORT=3000
NODE_ENV=production

DB_HOST=db.pemudfoinavlslhkgjlk.supabase.co
DB_PORT=5432
DB_NAME=postgres
DB_USER=postgres
DB_PASSWORD=[TU_CONTRASEÑA_SUPABASE]
DB_SSL=true

SESSION_SECRET=generate_strong_random_string
ENCRYPTION_KEY=generate_strong_random_string
```

⚠️ **IMPORTANTE:** Usa valores seguros, NO los de desarrollo

### Step 4: Configurar Root Directory

Por defecto Railway intenta construir desde root. Necesitamos que construya desde `backend/`:

1. En el servicio, click "Settings"
2. Busca "Root Directory"
3. Cambia a: `backend`
4. Click "Deploy"

### Step 5: Obtener URL de Deployment

Una vez desplegado:

1. En Railway dashboard, busca tu servicio
2. Click en "Domain"
3. Se creará automáticamente una URL como:
   ```
   https://your-service-xxxxx.railway.app
   ```
4. Copia esta URL

---

## 🔗 Conectar Frontend a Backend

### Opción A: Crear .env en frontend

```bash
cd frontend
echo "VITE_API_URL=https://your-service-xxxxx.railway.app" > .env
```

### Opción B: Actualizar vite.config.js

```javascript
server: {
  proxy: {
    '/api': {
      target: 'https://your-service-xxxxx.railway.app',
      changeOrigin: true
    }
  }
}
```

### Opción C: GitHub Actions (Auto-rebuild)

Crear archivo: `.github/workflows/update-api-url.yml`

```yaml
name: Update API URL
on:
  push:
    branches: [main]

jobs:
  update:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Update API URL
        run: |
          echo "VITE_API_URL=${{ secrets.PRODUCTION_API_URL }}" > frontend/.env
      - name: Build
        run: cd frontend && npm run build
      - name: Deploy
        uses: actions/deploy-pages@v4
```

---

## 🧪 Verificar Deployment

### Test 1: Backend está vivo

```bash
curl https://your-service-xxxxx.railway.app/api

# Deberías ver:
# {
#   "message": "Welcome to Copilot Testing API",
#   "version": "2.0.0"
# }
```

### Test 2: Login funciona

```bash
curl -X POST https://your-service-xxxxx.railway.app/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "linaresivn@gmail.com",
    "password": "admin123"
  }'

# Deberías recibir un JWT token
```

### Test 3: Frontend conecta

1. Abre: https://ivnlinares.github.io/Copilot-Testing/
2. Intenta login con: `linaresivn@gmail.com` / `admin123`
3. Deberías ver las tareas (o lista vacía)

---

## 🐛 Troubleshooting

### Error: "Cannot find module 'pg'"

**Causa:** Package no está instalado  
**Solución:**
```bash
cd backend
npm install pg
git add package-lock.json
git commit -m "fix: Install pg package"
git push
```

### Error: Database connection failed

**Causa:** Variables de entorno incorrectas  
**Solución:**
1. Verifica en Railway → Variables las credenciales Supabase
2. Ve al dashboard de Supabase y copia nuevamente la contraseña
3. Save → Railway redeploy automáticamente

### Error: CORS errors en frontend

**Causa:** Frontend no tiene la URL del backend  
**Solución:** Configura `VITE_API_URL` en frontend → build → GitHub Actions deploy

---

## 📊 Monitorear Deployment

### Railway Logs

```bash
# Si tienes Railway CLI instalado
railway login
railway logs

# O en el dashboard: Click service → "Logs"
```

### Supabase Logs

```bash
# En Supabase dashboard → SQL Editor
SELECT * FROM data_retention_logs ORDER BY created_at DESC;
```

### Frontend Errors

Abre: https://ivnlinares.github.io/Copilot-Testing/  
Presiona F12 → Console → Verifica errores de conexión

---

## 🔄 CI/CD Automático

Railway detecta automáticamente cambios en GitHub:

```
1. Pusheas a main
   ↓
2. GitHub Actions compila frontend (optional)
   ↓
3. Railway detecta cambios en backend/
   ↓
4. Redeploya automáticamente
   ↓
5. Nuevas tareas USA el nuevo codigo
```

---

## 💰 Costos

**Railway Free Tier:**
- ✅ $5/mes crédito gratuito
- ✅ Suficiente para Node.js backend
- ✅ Supabase es aparte (gratis con 500MB)

**Total:** Totalmente GRATIS para demo 🎉

---

## 🎯 Checklist Final

- [ ] Cuenta Railway creada
- [ ] Proyecto conectado a GitHub
- [ ] Variables de entorno configuradas
- [ ] Backend URL obtenida
- [ ] Frontend apunta a backend URL
- [ ] Login funciona en https://ivnlinares.github.io/Copilot-Testing/
- [ ] Tareas se crean y leen correctamente
- [ ] Datos se persisten en Supabase

---

## 📚 Links útiles

- **Railway Dashboard:** https://railway.app/dashboard
- **Supabase Dashboard:** https://supabase.com/dashboard/project/pemudfoinavlslhkgjlk
- **GitHub Actions:** https://github.com/IvnLinares/Copilot-Testing/actions
- **Frontend Demo:** https://ivnlinares.github.io/Copilot-Testing/

---

## ❓ Preguntas?

Revisa SUPABASE_SETUP.md para más detalles sobre PostgreSQL setup
