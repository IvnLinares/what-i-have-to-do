# 🚀 Demo en GitHub Pages

Esta aplicación está desplegada en **GitHub Pages** y lista para ser explorada.

## 📍 Acceder al Demo

🌐 **URL:** [https://ivnlinares.github.io/Copilot-Testing/](https://ivnlinares.github.io/Copilot-Testing/)

## ⚙️ Configuración del Backend para Demo

El demo requiere un backend API. Tienes dos opciones:

### Opción 1: Backend Local (Desarrollo)

Si estás desarrollando localmente, sigue estos pasos:

1. **Clona el repositorio:**
   ```bash
   git clone https://github.com/IvnLinares/Copilot-Testing.git
   cd Copilot-Testing
   ```

2. **Instala dependencias del backend:**
   ```bash
   cd backend
   npm install
   ```

3. **Inicia el servidor backend:**
   ```bash
   npm start
   ```
   El servidor estará en: `http://localhost:3000`

4. **En otra terminal, inicia el frontend:**
   ```bash
   cd frontend
   npm install
   npm run dev
   ```
   El frontend estará en: `http://localhost:5173`

5. **Configura la variable de entorno:**
   ```bash
   # En el navegador, abre DevTools y ejecuta:
   localStorage.setItem('apiUrl', 'http://localhost:3000')
   ```

### Opción 2: Backend en Línea (Producción)

Para usar el demo en GitHub Pages con un backend real:

1. **Despliega el backend en un servedor (ej: Render, Heroku, Vercel):**
   ```bash
   # Siguiendo las instrucciones del proveedor
   ```

2. **Configura la variable de entorno:**
   ```bash
   # En el navegador console:
   localStorage.setItem('apiUrl', 'https://tu-backend-url.com')
   ```

## 👥 Credenciales de Prueba

Por defecto, puedes crear un nuevo usuario registrándote en la aplicación.

Para pruebas rápidas:
- **Usuario:** `ivnlinares`
- **Contraseña:** `admin123`

> ⚠️ Nota: Estas son credenciales de demostración. Cambia siempre en producción.

## 🎯 Características Disponibles

La aplicación incluye:

✅ **Task Management**
- Crear, editar y eliminar tareas
- Organizar por categorías y etiquetas
- Establecer prioridades y fechas de vencimiento
- Enable/disable drag and drop

✅ **Integraciones** (Requiere backend)
- Google Calendar Sync
- iCloud Calendar Sync
- Notion Integration
- Automatic sync to external services

✅ **Características Modernas**
- Interfaz responsive
- Modo claro/oscuro automático
- PWA (Progressive Web App) - Instala en tu dispositivo
- Notificaciones push
- Caché offline

## 🔧 Variables de Entorno

### Frontend (.env.local)
```
VITE_API_URL=https://tu-backend-url.com
```

### Backend (.env)
```
PORT=3000
NODE_ENV=production
JWT_SECRET=tu_secret_key_segura

# Integraciones
GOOGLE_CLIENT_ID=tu_google_client_id
GOOGLE_CLIENT_SECRET=tu_google_client_secret
NOTION_API_KEY=tu_notion_key
```

## 📱 Instalación como PWA

En cualquier navegador moderno:

1. Ve a https://ivnlinares.github.io/Copilot-Testing/
2. Haz clic en el botón "Instalar" (esquina superior derecha)
3. ¡Disfruta la aplicación como una app nativa!

## 🐛 Solución de Problemas

### Error: "Cannot connect to API"
- Verifica que el backend esté ejecutándose
- Comprueba la URL de la API en localStorage
- Abre la consola del navegador (F12) para ver los errores

### Error: "Network Error"
- Si usas un backend local, asegúrate de que CORS esté configurado
- Si usas un backend remoto, verifica que el HTTPS sea válido

### La app se ve diferente
- Limpia el cache: `Ctrl+Shift+Delete`
- Recarga: `Ctrl+F5`
- Si instalaste como PWA, desinstala y reinstala

## 📚 Documentación Adicional

- [README Principal](./README.md) - Descripción general del proyecto
- [ROADMAP](./ROADMAP.md) - Características planificadas
- [Backend README](./backend/README.md) - Documentación del API

## 🤝 Contribuir

¿Encontraste un bug o tienes una idea? 
[Abre un issue en GitHub](https://github.com/IvnLinares/Copilot-Testing/issues)

## 📄 Licencia

Este proyecto está bajo licencia ISC.

---

**¡Disfruta usando Copilot Task Manager!** 🚀
