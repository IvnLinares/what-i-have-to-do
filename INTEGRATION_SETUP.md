# Configuración de Integraciones (Google Calendar, iCloud, Notion)

Este documento detalla los pasos necesarios para configurar y desplegar la sincronización bidireccional de tareas.

## 1. Configuración de Credenciales

### Google Calendar
1.  Ir a [Google Cloud Console](https://console.cloud.google.com/).
2.  Crear un nuevo proyecto o seleccionar uno existente.
3.  Habilitar la **Google Calendar API**.
4.  Ir a **APIs & Services > Credentials**.
5.  Crear credenciales de tipo **OAuth 2.0 Client ID**.
    -   Tipo de aplicación: **Web application**.
    -   Authorized redirect URIs: `http://localhost:3000/api/integrations/auth/google/callback` (ajustar dominio en producción).
6.  Copiar `Client ID` y `Client Secret` al archivo `.env`.

### iCloud Calendar
1.  Ir a [Apple ID](https://appleid.apple.com/).
2.  Iniciar sesión y buscar la sección **App-Specific Passwords**.
3.  Generar una nueva contraseña (ej. "task-manager-sync").
4.  Copiar la contraseña generada.
5.  En la aplicación, el usuario debe ingresar su correo de iCloud y esta contraseña específica.

### Notion
1.  Ir a [Notion Integrations](https://www.notion.so/my-integrations).
2.  Crear una nueva integración (Internal).
3.  Copiar el **Internal Integration Secret** (`NOTION_API_KEY`).
4.  En Notion, crear una base de datos (Full Page o Inline) para las tareas.
5.  Añadir las propiedades requeridas:
    -   **Task Name** (Title)
    -   **Description** (Text)
    -   **Priority** (Select: Low, Medium, High)
    -   **Due Date** (Date)
    -   **Completed** (Checkbox)
    -   **Category** (Select)
6.  Compartir la base de datos con la integración creada (menú "..." > Add connections).
7.  Copiar el ID de la base de datos de la URL (`https://notion.so/myworkspace/[DATABASE_ID]?v=...`) al archivo `.env`.

### Variables de Entorno (.env)

Crear un archivo `.env` en la carpeta `backend/` con el siguiente contenido:

```env
# GOOGLE CALENDAR
GOOGLE_CLIENT_ID=your_client_id
GOOGLE_CLIENT_SECRET=your_client_secret
GOOGLE_REDIRECT_URI=http://localhost:3000/api/integrations/auth/google/callback

# NOTION
NOTION_API_KEY=your_notion_secret
NOTION_DATABASE_ID=your_database_id

# SYNC CONFIG
SYNC_INTERVAL_MINUTES=60
AUTO_SYNC_ENABLED=true

# SESSION
SESSION_SECRET=your_session_secret
```

## 2. Estructura de Base de Datos

### Tabla `integrations`
Almacena los tokens y estado de conexión de cada servicio por usuario.

```sql
CREATE TABLE integrations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    service TEXT NOT NULL, -- 'google-calendar', 'icloud-calendar', 'notion'
    access_token TEXT,
    refresh_token TEXT,
    settings TEXT, -- JSON con configuración adicional (ej. calendarId, syncToken)
    last_sync DATETIME,
    connected BOOLEAN DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, service),
    FOREIGN KEY(user_id) REFERENCES users(id)
);
```

### Tabla `sync_logs`
Registra el historial de sincronizaciones y errores.

```sql
CREATE TABLE sync_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    integration_id INTEGER NOT NULL,
    status TEXT NOT NULL, -- 'success', 'error'
    details TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(integration_id) REFERENCES integrations(id)
);
```

### Migraciones
Las tablas se crean automáticamente al iniciar la aplicación si no existen, mediante el script de inicialización en `backend/src/db/init.js` (o migraciones SQL en `backend/migrations/`).

## 3. Arquitectura de Implementación

### Estructura de Carpetas (`backend/src/`)
*   `integrations/`: Lógica específica de cada servicio.
    *   `google-calendar.js`: Manejo de OAuth y API de Google.
    *   `icloud-calendar.js`: Cliente CalDAV para iCloud.
    *   `notion.js`: Cliente de API de Notion.
    *   `sync-service.js`: Orquestador de sincronización (cron jobs, lógica bidireccional).
*   `routes/integrations.js`: Endpoints para autenticación y estado (`/auth/google`, `/status`, `/disconnect`).
*   `models/integration.js`: Abstracción de base de datos para integraciones.

### Flujo de Autenticación
1.  **Google/Notion (OAuth)**:
    -   Frontend redirige a `/api/integrations/auth/{service}`.
    -   Backend redirige al proveedor.
    -   Proveedor redirige al callback.
    -   Backend intercambia código por tokens, guarda en BD y redirige al frontend (con cookie de sesión o token).
2.  **iCloud (Basic Auth)**:
    -   Frontend envía credenciales (email, app-password) a `/api/integrations/icloud/connect`.
    -   Backend valida con servidor CalDAV y guarda credenciales encriptadas (o hash/token si fuera posible, pero CalDAV requiere credenciales). *Nota: Por seguridad, se recomienda encriptar estos datos en reposo.*

### Lógica de Sincronización
-   **Pull (Importar)**: Se traen eventos/tareas modificados desde la última sincronización (`last_sync`). Se actualizan o crean tareas locales.
-   **Push (Exportar)**: Se envían tareas locales modificadas o nuevas al servicio externo.
-   **Conflictos**: La versión más reciente (basada en `updated_at`) suele ganar, o se prioriza la fuente externa en caso de duda.

## 4. Testing & Validación

### Casos de Prueba
1.  **Conexión Exitosa**: Verificar que al completar el flujo OAuth/CalDAV, la integración aparece como "Conectada" en la UI.
2.  **Sincronización Inicial**: Crear una tarea en Google/Notion y verificar que aparece en la app tras ejecutar la sincronización.
3.  **Sincronización Bidireccional**: Modificar una tarea en la app y verificar que se actualiza en el servicio externo, y viceversa.
4.  **Manejo de Errores**: Simular fallo de red o token expirado y verificar que se registra en `sync_logs` y la UI muestra el estado de error (si aplica).
5.  **Desconexión**: Verificar que al desconectar, se eliminan los tokens de la BD y se detiene la sincronización.

### Verificación Manual
-   Revisar la tabla `sync_logs` para asegurar que el cron job se ejecuta cada hora (o según configuración).
-   Usar el botón "Sincronizar ahora" en la UI para forzar una ejecución inmediata y observar los resultados en tiempo real.
