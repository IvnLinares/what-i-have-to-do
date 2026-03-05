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
  
  try {
    const token = auth.replace("Bearer ", "")
    const payload = JSON.parse(atob(token))
    return payload.user_id || payload.sub
  } catch (e) {
    return null
  }
}

async function getTasks(userId: number) {
  const { data, error } = await supabase
    .from("tasks")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })

  if (error) {
    return { error: error.message, status: 400 }
  }

  return { tasks: data || [], status: 200 }
}

async function createTask(userId: number, taskData: any) {
  // Check task limit
  const { count, error: countError } = await supabase
    .from("tasks")
    .select("*", { count: "exact", head: true })
    .eq("user_id", userId)

  if (count! >= 50) {
    return {
      error: "Task limit reached: 50/50 tasks. Delete some completed tasks.",
      status: 429,
    }
  }

  const { data, error } = await supabase
    .from("tasks")
    .insert([{
      ...taskData,
      user_id: userId,
      completed: false,
      expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    }])
    .select()
    .single()

  if (error) {
    return { error: error.message, status: 400 }
  }

  // Update user last_login
  await supabase
    .from("users")
    .update({ last_login: new Date().toISOString() })
    .eq("id", userId)

  return { task: data, status: 201 }
}

async function updateTask(userId: number, taskId: number, updates: any) {
  // Check ownership
  const { data: task, error: checkError } = await supabase
    .from("tasks")
    .select("user_id")
    .eq("id", taskId)
    .single()

  if (checkError || task?.user_id !== userId) {
    return { error: "Unauthorized", status: 403 }
  }

  // Update expires_at if completing/uncompleting
  let updateData = { ...updates }
  if (updates.completed !== undefined) {
    if (updates.completed) {
      updateData.expires_at = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString()
    } else {
      updateData.expires_at = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
    }
  }

  const { data, error } = await supabase
    .from("tasks")
    .update(updateData)
    .eq("id", taskId)
    .select()
    .single()

  if (error) {
    return { error: error.message, status: 400 }
  }

  return { task: data, status: 200 }
}

async function deleteTask(userId: number, taskId: number) {
  // Check ownership
  const { data: task, error: checkError } = await supabase
    .from("tasks")
    .select("user_id")
    .eq("id", taskId)
    .single()

  if (checkError || task?.user_id !== userId) {
    return { error: "Unauthorized", status: 403 }
  }

  const { error } = await supabase
    .from("tasks")
    .delete()
    .eq("id", taskId)

  if (error) {
    return { error: error.message, status: 400 }
  }

  return { status: 200 }
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
    const taskId = parseInt(url.pathname.split("/").pop()!)

    let result

    if (req.method === "GET") {
      if (taskId && !isNaN(taskId)) {
        const { data, error } = await supabase
          .from("tasks")
          .select("*")
          .eq("id", taskId)
          .eq("user_id", userId)
          .single()

        result = error ? { error: error.message, status: 404 } : { task: data, status: 200 }
      } else {
        result = await getTasks(userId)
      }
    } else if (req.method === "POST") {
      const body = await req.json()
      result = await createTask(userId, body)
    } else if (req.method === "PUT") {
      const body = await req.json()
      result = await updateTask(userId, taskId, body)
    } else if (req.method === "DELETE") {
      result = await deleteTask(userId, taskId)
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
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    )
  }
})
