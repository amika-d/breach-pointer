import { NextRequest, NextResponse } from "next/server"
import { buildImproverPrompt } from "@/app/lib/prompts"
import { Role, AttackCategory } from "@/app/lib/types"
import { MODELS } from "@/app/lib/config"

export const runtime = "edge"

export async function POST(req: NextRequest) {
  try {
    const { role, originalPrompt, fixes, failedTests } = await req.json()

    if (!role || !originalPrompt || !fixes || !failedTests) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      )
    }

    const { system, user } = buildImproverPrompt(
      role as Role,
      originalPrompt,
      fixes,
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
          temperature: 0.3,
          messages: [
            { role: "system", content: system },
            { role: "user", content: user },
          ],
        }),
      }
    )

    if (!response.ok) {
      return NextResponse.json(
        { error: "Improver API error" },
        { status: 500 }
      )
    }

    const data = await response.json()
    const raw = data.choices[0].message.content

    const clean = raw
      .replace(/```json\n?/g, "")
      .replace(/```\n?/g, "")
      .trim()

    const parsed = JSON.parse(clean)

    return NextResponse.json(parsed)

  } catch (err) {
    console.error("Improve route error:", err)
    return NextResponse.json(
      { error: "Failed to improve prompt" },
      { status: 500 }
    )
  }
}
