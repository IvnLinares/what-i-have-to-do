# 🚀 Supabase Edge Functions Backend

Tu backend ahora está deployado como **Edge Functions** en Supabase!

---

## 📌 Estructura

```
supabase/
├── functions/
│   ├── auth/index.ts          # Login & Register
│   ├── tasks/index.ts         # Task CRUD
│   ├── categories/index.ts    # Category CRUD
│   └── tags/index.ts          # Tag CRUD
└── deno.json                  # Deno imports
```

---

## 🔌 API Endpoints

Todas las funciones están disponibles en:

```
https://[YOUR-PROJECT].supabase.co/functions/v1/[FUNCTION-NAME]
```

### Auth
- **POST** `/functions/v1/auth` 
  ```json
  { "action": "login", "username": "user@example.com", "password": "pass" }
  { "action": "register", "username": "user@example.com", "password": "pass" }
  ```

### Tasks
- **GET** `/functions/v1/tasks` - Get all tasks
- **GET** `/functions/v1/tasks/:id` - Get single task
- **POST** `/functions/v1/tasks` - Create task
- **PUT** `/functions/v1/tasks/:id` - Update task
- **DELETE** `/functions/v1/tasks/:id` - Delete task

### Categories
- **GET** `/functions/v1/categories` - Get all
- **POST** `/functions/v1/categories` - Create
- **PUT** `/functions/v1/categories/:id` - Update
- **DELETE** `/functions/v1/categories/:id` - Delete

### Tags
- **GET** `/functions/v1/tags` - Get all
- **POST** `/functions/v1/tags` - Create
- **PUT** `/functions/v1/tags/:id` - Update
- **DELETE** `/functions/v1/tags/:id` - Delete

---

## 🔐 Authentication

Todas las requests (excepto auth) deben incluir:

```
Authorization: Bearer [JWT_TOKEN]
```

El token se obtiene al hacer login.

---

## 📍 URLs por Entorno

**Local Development:**
```
http://localhost:54321/functions/v1/tasks
```

**Production (Supabase):**
```
https://pemudfoinavlslhkgjlk.supabase.co/functions/v1/tasks
```

---

## 📝 Next Steps

1. ✅ Edge Functions creadas
2. ⏭️ Deploy a Supabase
3. ⏭️ Actualizar Frontend API_URL
4. ⏭️ Probar conexión

Ver EDGE_FUNCTIONS_SETUP.md para instrucciones de deployment
