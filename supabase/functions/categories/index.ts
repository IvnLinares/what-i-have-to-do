import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4"

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
}

const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
)

async function getAuthUser(req: Request): Promise<string | null> {
  const authHeader = req.headers.get("Authorization")
  if (!authHeader) return null

  const token = authHeader.replace("Bearer ", "")
  const { data: { user }, error } = await supabase.auth.getUser(token)

  if (error || !user) {
    console.error("Auth error:", error)
    return null
  }

  return user.id
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders })
  }

  try {
    const userId = await getAuthUser(req)
    if (!userId) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      )
    }

    console.log("Authenticated user:", userId)
    const url = new URL(req.url)
    const id = parseInt(url.pathname.split("/").pop()!)

    let result

    if (req.method === "GET") {
      console.log("GET categories for user:", userId)
      const { data, error } = await supabase
        .from("categories")
        .select("*")
        .eq("user_id", userId)
        .order("name")

      if (error) {
        console.error("Database error:", error.message)
        result = { error: error.message, status: 400 }
      } else {
        console.log("Found categories:", data?.length || 0)
        result = { categories: data || [], status: 200 }
      }
    } else if (req.method === "POST") {
      console.log("POST category for user:", userId)
      const body = await req.json()
      const { data, error } = await supabase
        .from("categories")
        .insert([{ ...body, user_id: userId }])
        .select()
        .single()

      if (error) {
        console.error("Insert error:", error.message)
        result = { error: error.message, status: 400 }
      } else {
        console.log("Category created:", data?.id || "unknown")
        result = { category: data, status: 201 }
      }
    } else if (req.method === "PUT") {
      console.log("PUT category for user:", userId)
      const body = await req.json()
      const { data, error } = await supabase
        .from("categories")
        .update(body)
        .eq("id", id)
        .eq("user_id", userId)
        .select()
        .single()

      if (error) {
        console.error("Update error:", error.message)
        result = { error: error.message, status: 400 }
      } else {
        console.log("Category updated:", id)
        result = { category: data, status: 200 }
      }
    } else if (req.method === "DELETE") {
      console.log("DELETE category for user:", userId)
      const { error } = await supabase
        .from("categories")
        .delete()
        .eq("id", id)
        .eq("user_id", userId)

      if (error) {
        console.error("Delete error:", error.message)
        result = { error: error.message, status: 400 }
      } else {
        console.log("Category deleted:", id)
        result = { status: 200 }
      }
    } else {
      result = { error: "Method not allowed", status: 405 }
    }

    return new Response(
      JSON.stringify(result),
      {
        status: result.status,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    )
  } catch (error) {
    console.error("Catch block error:", error.message, error.stack)
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    )
  }
})
