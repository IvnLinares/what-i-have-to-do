import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://pemudfoinavlslhkgjlk.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBlbXVkZm9pbmF2bHNsaGtnamxrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI2ODEzOTIsImV4cCI6MjA4ODI1NzM5Mn0.X6TbnQkZ6aEWJSUjV36ataKRo_JBmZUqt49bYdKXCUI'

if (!import.meta.env.VITE_SUPABASE_ANON_KEY) {
  console.info('Usando clave Supabase por defecto (VITE_SUPABASE_ANON_KEY no detectada en .env)')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
