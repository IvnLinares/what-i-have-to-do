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

function getAuthUser(req: Request): any {
  const auth = req.headers.get("authorization")
  if (!auth) {
    console.error("No authorization header")
    return null
  }
  
  try {
    const token = auth.replace("Bearer ", "").trim()
    if (!token) {
      console.error("Empty token")
      return null
    }

    const tokenParts = token.split(".")
    let base64String = tokenParts.length === 3 ? tokenParts[1] : token

    base64String = base64String.replace(/-/g, "+").replace(/_/g, "/")
    while (base64String.length % 4) {
      base64String += "="
    }

    const payload = JSON.parse(atob(base64String))
    const userId = payload.user_id || payload.sub
    if (!userId) {
      console.error("No user_id in token")
      return null
    }
    return userId
  } catch (e) {
    console.error("Token parse error:", e.message)
    return null
  }
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders })
  }

  try {
    const userId = getAuthUser(req)
    if (!userId) {
      console.error("Auth failed: userId is null")
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
      console.log("GET tags for user:", userId)
      const { data, error } = await supabase
        .from("tags")
        .select("*")
        .eq("user_id", userId)
        .order("name")

      if (error) {
        console.error("Database error:", error.message)
        result = { error: error.message, status: 400 }
      } else {
        console.log("Found tags:", data?.length || 0)
        result = { tags: data || [], status: 200 }
      }
    } else if (req.method === "POST") {
      console.log("POST tag for user:", userId)
      const body = await req.json()
      const { data, error } = await supabase
        .from("tags")
        .insert([{ ...body, user_id: userId }])
        .select()
        .single()

      if (error) {
        console.error("Insert error:", error.message)
        result = { error: error.message, status: 400 }
      } else {
        console.log("Tag created:", data?.id || "unknown")
        result = { tag: data, status: 201 }
      }
    } else if (req.method === "PUT") {
      console.log("PUT tag for user:", userId)
      const body = await req.json()
      const { data, error } = await supabase
        .from("tags")
        .update(body)
        .eq("id", id)
        .eq("user_id", userId)
        .select()
        .single()

      if (error) {
        console.error("Update error:", error.message)
        result = { error: error.message, status: 400 }
      } else {
        console.log("Tag updated:", id)
        result = { tag: data, status: 200 }
      }
    } else if (req.method === "DELETE") {
      console.log("DELETE tag for user:", userId)
      const { error } = await supabase
        .from("tags")
        .delete()
        .eq("id", id)
        .eq("user_id", userId)

      if (error) {
        console.error("Delete error:", error.message)
        result = { error: error.message, status: 400 }
      } else {
        console.log("Tag deleted:", id)
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
