import { generateObject } from "ai"
import { z } from "zod"
import { createClient } from "@/lib/supabase/server"

const workPlanSchema = z.object({
  tasks: z.array(
    z.object({
      title: z.string().describe("Clear, actionable task title"),
      description: z.string().describe("Detailed description of what needs to be done"),
      estimatedHours: z.number().describe("Estimated hours to complete this task"),
      assignedMemberIndex: z.number().describe("Index of the member to assign this task to (0-based)"),
    }),
  ),
  rationale: z.string().describe("Brief explanation of how tasks were divided and workload balanced"),
  sources: z
    .array(
      z.object({
        title: z.string().describe("Title of the source"),
        url: z.string().describe("URL of the source"),
        description: z.string().describe("Brief description of why this source is relevant"),
        category: z
          .enum(["news", "book", "scientific", "video", "other"])
          .describe("Type of source: news, book, scientific, video, or other"),
      }),
    )
    .optional()
    .describe("Recommended sources for research"),
})

export async function POST(req: Request) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return Response.json({ error: "Not authenticated" }, { status: 401 })
  }

  const { assignmentId, sourceTypes, files = [] } = await req.json()

  const { data: assignment, error: assignmentError } = await supabase
    .from("assignments")
    .select(
      `
      *,
      groups (
        id,
        name
      )
    `,
    )
    .eq("id", assignmentId)
    .single()

  if (assignmentError || !assignment) {
    return Response.json({ error: "Assignment not found" }, { status: 404 })
  }

  const { data: membership } = await supabase
    .from("group_members")
    .select("*")
    .eq("group_id", assignment.group_id)
    .eq("user_id", user.id)
    .single()

  if (!membership) {
    return Response.json({ error: "Not authorized" }, { status: 403 })
  }

  const { data: members, error: membersError } = await supabase
    .from("group_members")
    .select(
      `
      *,
      profiles (
        id,
        full_name,
        email
      )
    `,
    )
    .eq("group_id", assignment.group_id)

  if (membersError || !members) {
    return Response.json({ error: "Failed to fetch members" }, { status: 500 })
  }

  const deadline = new Date(assignment.deadline)
  const now = new Date()
  const daysUntilDeadline = Math.ceil((deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))

  const sourceTypesText =
    sourceTypes && sourceTypes.length > 0
      ? `\n\nRecommend 3-5 relevant sources for this assignment. Focus on these types: ${sourceTypes.join(", ")}. Provide specific, real sources that would be helpful for this assignment.`
      : ""

  const filesText =
    files.length > 0
      ? `\n\nUploaded Files (${files.length} total):
${files.map((f: any, i: number) => `${i + 1}. ${f.name} (${f.type})`).join("\n")}

IMPORTANT: Analyze these uploaded files to understand the assignment requirements. The files likely contain:
- Assignment instructions and requirements
- Rubrics or grading criteria
- Reference materials or examples
- Specific tasks or deliverables

Create tasks based on what these files indicate needs to be done. If the files contain detailed requirements, break them down into specific, actionable tasks.`
      : ""

  const prompt = `You are an AI assistant helping students divide group work fairly and efficiently.

Assignment Details:
- Title: ${assignment.title}
- Description: ${assignment.description || "No description provided"}
- Deadline: ${deadline.toLocaleDateString()} (${daysUntilDeadline} days from now)${filesText}

Group Members (${members.length} total):
${members.map((m, i) => `${i}. ${m.profiles.full_name || "Member " + (i + 1)}`).join("\n")}

Your task:
1. ${files.length > 0 ? "FIRST, analyze the uploaded files to understand what needs to be done" : "Analyze the assignment description"}
2. Break down this assignment into ${Math.max(3, members.length * 2)} concrete, actionable tasks
3. Distribute tasks EVENLY across all ${members.length} members to balance workload
4. Each member should get roughly the same total estimated hours
5. Consider task dependencies and logical order
6. Estimate realistic hours for each task
7. Assign each task to a specific member by their index (0-${members.length - 1})${sourceTypesText}

Important: Make sure EVERY member gets assigned at least one task, and the total hours are balanced.${files.length > 0 ? " Base your task breakdown on the requirements found in the uploaded files." : ""}`

  try {
    const { object } = await generateObject({
      model: "openai/gpt-4o",
      schema: workPlanSchema,
      prompt,
      maxOutputTokens: 3000,
    })

    const memberTaskCounts = new Array(members.length).fill(0)
    object.tasks.forEach((task) => {
      if (task.assignedMemberIndex >= 0 && task.assignedMemberIndex < members.length) {
        memberTaskCounts[task.assignedMemberIndex]++
      }
    })

    const tasksWithMembers = object.tasks.map((task) => ({
      ...task,
      assignedMember: members[task.assignedMemberIndex]?.profiles,
    }))

    return Response.json({
      tasks: tasksWithMembers,
      rationale: object.rationale,
      memberTaskCounts,
      sources: object.sources || [],
    })
  } catch (error) {
    console.error("AI generation error:", error)
    return Response.json({ error: "Failed to generate work plan" }, { status: 500 })
  }
}
