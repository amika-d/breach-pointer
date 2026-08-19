import { NextRequest, NextResponse } from "next/server"
import { buildInlineSuggestionsPrompt, buildImproverPrompt } from "@/app/lib/prompts"
import { Role } from "@/app/lib/types"
import { MODELS } from "@/app/lib/config"

export const maxDuration = 60 // Allow up to 60 seconds (Vercel Hobby plan maximum)

export async function POST(req: NextRequest) {
  try {
    const { role, userPrompt, failedTests, fixes = [] } = await req.json()

    // Step 1: Run the Improver to get a globally rewritten prompt
    const improverPrompt = buildImproverPrompt(
      role as Role,
      userPrompt,
      fixes,
      failedTests
    )

    const improverResponse = await fetch(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
          "Content-Type": "application/json",
          "HTTP-Referer": process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
        },
        body: JSON.stringify({
          model: MODELS.improver,
          temperature: 0.2,
          messages: [
            { role: "system", content: improverPrompt.system },
            { role: "user", content: improverPrompt.user }
          ]
        })
      }
    )

    if (!improverResponse.ok) {
      return NextResponse.json(
        { error: "Improver API error" },
        { status: 500 }
      )
    }

    const improverData = await improverResponse.json()
    const improverRaw = improverData.choices[0].message.content
    const improverClean = improverRaw
      .replace(/```json\n?/g, "")
      .replace(/```\n?/g, "")
      .trim()
      
    const { improved_prompt } = JSON.parse(improverClean)

    // Step 2: Use the improved prompt to generate inline suggestions (add/remove/replace)
    const { system, user } = buildInlineSuggestionsPrompt(
      role as Role,
      userPrompt,
      improved_prompt,
      failedTests
    )

    const response = await fetch(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
          "Content-Type": "application/json",
          "HTTP-Referer": process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
        },
        body: JSON.stringify({
          model: MODELS.improver,
          temperature: 0.2,
          messages: [
            { role: "system", content: system },
            { role: "user", content: user }
          ]
        })
      }
    )

    if (!response.ok) {
      return NextResponse.json(
        { error: "Suggest API error" },
        { status: 500 }
      )
    }

    const data = await response.json()
    const raw = data.choices[0].message.content
    const clean = raw
      .replace(/```json\n?/g, "")
      .replace(/```\n?/g, "")
      .trim()

    return NextResponse.json(JSON.parse(clean))

  } catch (err) {
    console.error("Suggest route error:", err)
    return NextResponse.json(
      { error: "Failed to generate suggestions" },
      { status: 500 }
    )
  }
}
