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

    const { assignmentId, sourceTypes } = await request.json()

    // Get assignment details
    const { data: assignment, error: assignmentError } = await supabase
      .from("assignments")
      .select("*, groups(id, name)")
      .eq("id", assignmentId)
      .single()

    if (assignmentError || !assignment) {
      return NextResponse.json({ error: "Assignment not found" }, { status: 404 })
    }

    const sourceTypesText = sourceTypes.length > 0 ? sourceTypes.join(", ") : "any relevant sources"

    const prompt = `You are an academic research assistant helping students find relevant sources for their group project.

Assignment: ${assignment.title}
Description: ${assignment.description || "No description provided"}
Requested source types: ${sourceTypesText}

Please recommend 5-7 high-quality sources that would be helpful for this assignment. For each source, provide:
1. A realistic title
2. A URL (use realistic academic/news/video URLs based on the type)
3. A brief description of why it's relevant
4. The category (news, book, scientific, video, or other)

Focus on sources that are:
- Directly relevant to the assignment topic
- From credible sources
- Diverse in perspective
- Accessible to students

Return your response as a JSON array of sources with this structure:
[
  {
    "title": "Source title",
    "url": "https://example.com/source",
    "description": "Why this source is relevant and helpful",
    "category": "news" | "book" | "scientific" | "video" | "other"
  }
]

Only return the JSON array, no additional text.`

    const { text } = await generateText({
      model: "openai/gpt-4o-mini",
      prompt,
    })

    const cleanedText = cleanJsonResponse(text)
    const sources = JSON.parse(cleanedText)

    return NextResponse.json({ sources })
  } catch (error) {
    console.error("[v0] Error recommending sources:", error)
    return NextResponse.json({ error: "Failed to recommend sources" }, { status: 500 })
  }
}
