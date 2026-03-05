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

async function getTasks(userId: string) {
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

async function createTask(userId: string, taskData: any) {
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

  return { task: data, status: 201 }
}

async function updateTask(userId: string, taskId: number, updates: any) {
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

async function deleteTask(userId: string, taskId: number) {
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
    const userId = await getAuthUser(req)
    if (!userId) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      )
    }

    console.log("Authenticated user:", userId)
    const url = new URL(req.url)
    const taskId = parseInt(url.pathname.split("/").pop()!)

    let result

    if (req.method === "GET") {
      console.log("GET request - taskId:", taskId)
      if (taskId && !isNaN(taskId)) {
        console.log("Fetching single task:", taskId)
        const { data, error } = await supabase
          .from("tasks")
          .select("*")
          .eq("id", taskId)
          .eq("user_id", userId)
          .single()

        if (error) {
          console.error("Single task fetch error:", error.message)
          result = { error: error.message, status: 404 }
        } else {
          console.log("Single task found:", taskId)
          result = { task: data, status: 200 }
        }
      } else {
        console.log("Fetching all tasks")
        result = await getTasks(userId)
      }
    } else if (req.method === "POST") {
      console.log("POST task for user:", userId)
      const body = await req.json()
      result = await createTask(userId, body)
    } else if (req.method === "PUT") {
      console.log("PUT task for user:", userId, "taskId:", taskId)
      const body = await req.json()
      result = await updateTask(userId, taskId, body)
    } else if (req.method === "DELETE") {
      console.log("DELETE task for user:", userId, "taskId:", taskId)
      result = await deleteTask(userId, taskId)
    } else {
      console.log("Unsupported method:", req.method)
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

