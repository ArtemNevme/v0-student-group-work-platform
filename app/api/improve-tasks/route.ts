import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { generateText } from "ai"

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

    const { assignmentId, action } = await request.json()

    // Get assignment and tasks
    const { data: assignment, error: assignmentError } = await supabase
      .from("assignments")
      .select("*, groups(id, name, member_count)")
      .eq("id", assignmentId)
      .single()

    if (assignmentError || !assignment) {
      return NextResponse.json({ error: "Assignment not found" }, { status: 404 })
    }

    const { data: tasks } = await supabase
      .from("tasks")
      .select("*, task_assignments(*, profiles(id, full_name, email))")
      .eq("assignment_id", assignmentId)
      .order("created_at", { ascending: true })

    const { data: members } = await supabase
      .from("group_members")
      .select("user_id, profiles(id, full_name, email)")
      .eq("group_id", assignment.groups.id)

    let prompt = ""

    if (action === "improve") {
      prompt = `You are an AI assistant helping students improve their group project work plan.

Assignment: ${assignment.title}
Description: ${assignment.description || "No description provided"}
Group size: ${assignment.groups.member_count} members

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
    } else if (action === "suggest") {
      prompt = `You are an AI assistant helping students with their group project.

Assignment: ${assignment.title}
Description: ${assignment.description || "No description provided"}
Group size: ${assignment.groups.member_count} members

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
