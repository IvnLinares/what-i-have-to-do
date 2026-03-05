#!/bin/bash

# Migration script to switch backend from SQLite to Supabase PostgreSQL

echo "🔄 Migrando backend de SQLite a Supabase PostgreSQL..."
echo ""
echo "⏭️  PASO 1: Obtener credenciales de Supabase"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "1. Ve a: https://supabase.com/dashboard/project/pemudfoinavlslhkgjlk/settings/database"
echo "2. En 'Connection Info', copia la DATABASE_PASSWORD"
echo ""
read -p "Pega la contraseña de Supabase aquí: " DB_PASSWORD

if [ -z "$DB_PASSWORD" ]; then
    echo "❌ Error: La contraseña no puede estar vacía"
    exit 1
fi

echo ""
echo "⏭️  PASO 2: Actualizar backend/.env"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Update .env file
cat > backend/.env << EOF
# Server Configuration
PORT=3000
NODE_ENV=development

# Database - Supabase (PostgreSQL)
DB_HOST=db.pemudfoinavlslhkgjlk.supabase.co
DB_PORT=5432
DB_NAME=postgres
DB_USER=postgres
DB_PASSWORD=$DB_PASSWORD
DB_SSL=true

# Session & Security
SESSION_SECRET=dev_session_secret_super_secure_change_in_production_12345
ENCRYPTION_KEY=dev_encryption_key_super_secure_change_in_production_67890abcdef

# Google Calendar Integration (optional)
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_REDIRECT_URI=http://localhost:3000/api/integrations/auth/google/callback

# iCloud Calendar Integration
ICLOUD_ENABLED=true

# Notion Integration (optional)
NOTION_ENABLED=false
EOF

echo "✅ Archivo .env actualizado"
echo ""

echo "⏭️  PASO 3: Instalar dependencias PostgreSQL"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

cd backend

# Remove sqlite3
echo "Removiendo sqlite3..."
npm uninstall sqlite3

# Install pg
echo "Instalando pg (PostgreSQL driver)..."
npm install pg

echo ""
echo "✅ Dependencias actualizado"
echo ""

echo "⏭️  PASO 4: Cambiar configuración de base de datos"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Backup original
cp src/config/db.js src/config/db-sqlite-backup.js
echo "✅ Copia de respaldo creada: src/config/db-sqlite-backup.js"

# Replace with PostgreSQL version
cp src/config/db-postgres.js src/config/db.js
echo "✅ src/config/db.js actualizado para PostgreSQL"
echo ""

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ ¡Migración completada!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📝 Próximos pasos:"
echo "1. npm run dev               # Probar localmente"
echo "2. git add -A"
echo "3. git commit -m 'chore: Migrate backend to Supabase PostgreSQL'"
echo "4. git push origin main"
echo "5. Desplegar en Railway/Render (ver DEPLOYMENT.md)"
echo ""
