import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { generateText } from "ai"
import { z } from "zod"

const requestSchema = z.object({
  assignmentId: z.string().uuid(),
  action: z.enum(["improve", "suggest"]),
})

function cleanJsonResponse(text: string): string {
  // Remove markdown code fences if present
  let cleaned = text.trim()

  // Check for \`\`\`json ... \`\`\` or \`\`\` ... \`\`\`
  if (cleaned.startsWith("```")) {
    // Remove opening fence
    cleaned = cleaned.replace(/^```(?:json)?\n?/, "")
    // Remove closing fence
    cleaned = cleaned.replace(/\n?```$/, "")
  }

  return cleaned.trim()
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const parsedRequest = requestSchema.safeParse(await request.json())
    if (!parsedRequest.success) {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 })
    }

    const { assignmentId, action } = parsedRequest.data

    // Get assignment and tasks
    const { data: assignment, error: assignmentError } = await supabase
      .from("assignments")
      .select("*, groups(id, name, member_count)")
      .eq("id", assignmentId)
      .single()

    if (assignmentError || !assignment) {
      return NextResponse.json({ error: "Assignment not found" }, { status: 404 })
    }

    const groupId = assignment.group_id

    if (groupId) {
      const { data: membership } = await supabase
        .from("group_members")
        .select("id")
        .eq("group_id", groupId)
        .eq("user_id", user.id)
        .maybeSingle()

      if (!membership) {
        return NextResponse.json({ error: "Not authorized" }, { status: 403 })
      }
    } else if (assignment.created_by !== user.id) {
      return NextResponse.json({ error: "Not authorized" }, { status: 403 })
    }

    const { data: quotaAvailable, error: quotaError } = await supabase.rpc("consume_ai_quota")
    if (quotaError) {
      console.error("AI quota check failed:", quotaError)
      return NextResponse.json({ error: "AI service is temporarily unavailable" }, { status: 503 })
    }
    if (!quotaAvailable) {
      return NextResponse.json({ error: "Daily AI request limit reached" }, { status: 429 })
    }

    const { data: tasks } = await supabase
      .from("tasks")
      .select("*, task_assignments(*, profiles(id, full_name, email))")
      .eq("assignment_id", assignmentId)
      .order("created_at", { ascending: true })

    const { data: members } = groupId
      ? await supabase
          .from("group_members")
          .select("user_id, profiles(id, full_name, email)")
          .eq("group_id", groupId)
      : { data: [] }

    let prompt = ""

    if (action === "improve") {
      prompt = `You are an AI assistant helping students improve their group project work plan.

Assignment: ${assignment.title}
Description: ${assignment.description || "No description provided"}
Group size: ${members?.length || 1} members

Current tasks:
${tasks?.map((t, i) => `${i + 1}. ${t.title} (${t.estimated_hours}h) - ${t.description}`).join("\n")}

Please analyze the current work plan and suggest improvements:
1. Identify tasks that could be broken down into smaller, more manageable pieces
2. Suggest additional tasks that might be missing
3. Recommend better task descriptions for clarity
4. Suggest time estimate adjustments if needed

Return your response as JSON with this structure:
{
  "improvements": [
    {
      "taskId": "existing-task-id or null for new tasks",
      "type": "improve" | "add" | "split",
      "suggestion": "Description of the improvement",
      "newTask": {
        "title": "Task title",
        "description": "Task description",
        "estimatedHours": number
      }
    }
  ],
  "summary": "Overall summary of improvements"
}

Only return the JSON, no additional text.`
    } else {
      prompt = `You are an AI assistant helping students with their group project.

Assignment: ${assignment.title}
Description: ${assignment.description || "No description provided"}
Group size: ${members?.length || 1} members

Current tasks:
${tasks?.map((t, i) => `${i + 1}. ${t.title} (${t.estimated_hours}h)`).join("\n")}

Suggest 2-3 additional tasks that would complement the existing work plan and help ensure project success. Consider:
- Research tasks
- Review and quality assurance tasks
- Documentation tasks
- Presentation preparation

Return your response as JSON array:
[
  {
    "title": "Task title",
    "description": "Detailed description",
    "estimatedHours": number,
    "rationale": "Why this task is important"
  }
]

Only return the JSON array, no additional text.`
    }

    const { text } = await generateText({
      model: "openai/gpt-4o-mini",
      prompt,
    })

    const cleanedText = cleanJsonResponse(text)
    const result = JSON.parse(cleanedText)

    return NextResponse.json(result)
  } catch (error) {
    console.error("[v0] Error improving tasks:", error)
    return NextResponse.json({ error: "Failed to improve tasks" }, { status: 500 })
  }
}
