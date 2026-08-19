import { NextRequest, NextResponse } from "next/server"
import { buildInlineSuggestionsPrompt } from "@/app/lib/prompts"
import { Role } from "@/app/lib/types"
import { MODELS } from "@/app/lib/config"

export const runtime = "edge"

export async function POST(req: NextRequest) {
  try {
    const { role, userPrompt, failedTests } = await req.json()

    const { system, user } = buildInlineSuggestionsPrompt(
      role as Role,
      userPrompt,
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
