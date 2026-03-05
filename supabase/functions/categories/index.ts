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

function getAuthUser(req: Request) {
  const auth = req.headers.get("authorization")
  if (!auth) return null
  const token = auth.replace("Bearer ", "")
  const payload = JSON.parse(atob(token.split(".")[1]))
  return payload.user_id || payload.sub
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders })
  }

  try {
    const userId = getAuthUser(req)
    if (!userId) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      )
    }

    const url = new URL(req.url)
    const id = parseInt(url.pathname.split("/").pop()!)

    let result

    if (req.method === "GET") {
      const { data, error } = await supabase
        .from("categories")
        .select("*")
        .eq("user_id", userId)
        .order("name")

      result = error ? { error: error.message, status: 400 } : { categories: data || [], status: 200 }
    } else if (req.method === "POST") {
      const body = await req.json()
      const { data, error } = await supabase
        .from("categories")
        .insert([{ ...body, user_id: userId }])
        .select()
        .single()

      result = error ? { error: error.message, status: 400 } : { category: data, status: 201 }
    } else if (req.method === "PUT") {
      const body = await req.json()
      const { data, error } = await supabase
        .from("categories")
        .update(body)
        .eq("id", id)
        .eq("user_id", userId)
        .select()
        .single()

      result = error ? { error: error.message, status: 400 } : { category: data, status: 200 }
    } else if (req.method === "DELETE") {
      const { error } = await supabase
        .from("categories")
        .delete()
        .eq("id", id)
        .eq("user_id", userId)

      result = error ? { error: error.message, status: 400 } : { status: 200 }
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
