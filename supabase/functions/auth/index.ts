import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4"

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
}

const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
)

async function loginUser(username: string, password: string) {
  try {
    // Get user from database
    const { data: user, error: userError } = await supabase
      .from("users")
      .select("*")
      .eq("username", username)
      .single()

    if (userError || !user) {
      return { error: "Invalid credentials", status: 401 }
    }

    // Simple password verification (in production, use bcrypt properly)
    const { data: { session }, error: authError } = await supabase.auth.signInWithPassword({
      email: `${username}@copilot-testing.local`,
      password: password,
    })

    if (authError) {
      // Fallback: Direct password check (simplified for demo)
      // In production, passwords should be hashed with bcrypt
      return { error: "Invalid credentials", status: 401 }
    }

    return {
      user: {
        id: user.id,
        username: user.username,
        role: user.role,
      },
      token: session?.access_token || "temp_token",
      status: 200
    }
  } catch (error) {
    return { error: error.message, status: 500 }
  }
}

async function registerUser(username: string, password: string) {
  try {
    // Check if user exists
    const { data: existing } = await supabase
      .from("users")
      .select("id")
      .eq("username", username)
      .single()

    if (existing) {
      return { error: "User already exists", status: 409 }
    }

    // Create user in database
    const { data: user, error: insertError } = await supabase
      .from("users")
      .insert([{ username, password, role: "user" }])
      .select()
      .single()

    if (insertError) {
      return { error: insertError.message, status: 400 }
    }

    return {
      user: {
        id: user.id,
        username: user.username,
        role: user.role,
      },
      status: 201
    }
  } catch (error) {
    return { error: error.message, status: 500 }
  }
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders })
  }

  try {
    const { action, username, password } = await req.json()

    let result
    switch (action) {
      case "login":
        result = await loginUser(username, password)
        break
      case "register":
        result = await registerUser(username, password)
        break
      default:
        result = { error: "Unknown action", status: 400 }
    }

    return new Response(
      JSON.stringify(result),
      {
        status: result.status,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    )
  }
})
