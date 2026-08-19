import { NextRequest, NextResponse } from "next/server"
import { buildJudgePrompt } from "@/app/lib/prompts"
import { Role, AttackCategory } from "@/app/lib/types"
import { MODELS } from "@/app/lib/config"

export const maxDuration = 60;

export async function POST(req: NextRequest) {
  try {
    const { role, userPrompt, tests } = await req.json()

    if (!role || !userPrompt || !tests?.length) {
      return NextResponse.json(
        { error: "Missing role, userPrompt, or tests" },
        { status: 400 }
      )
    }

    const { system, user } = buildJudgePrompt(
      role as Role,
      userPrompt,
      tests
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
          model: MODELS.judge,
          temperature: 0.1, // very low = consistent judging
          messages: [
            { role: "system", content: system },
            { role: "user", content: user },
          ],
        }),
      }
    )

    const rawResponseText = await response.text()

    if (!response.ok) {
      console.error("OpenRouter API error:", rawResponseText)
      let errMessage = "OpenRouter error"
      try {
        const err = JSON.parse(rawResponseText)
        errMessage = err.error?.message || errMessage
      } catch (e) {}
      
      return NextResponse.json(
        { error: errMessage },
        { status: 500 }
      )
    }

    let data;
    try {
      // OpenRouter sometimes sends keep-alive comments even in non-streaming mode
      // which can break JSON parsing. We strip them if present.
      const cleanedResponseText = rawResponseText.replace(/^:\s*OPENROUTER PROCESSING[^\n]*\n+/g, '');
      data = JSON.parse(cleanedResponseText)
    } catch (e) {
      console.error("Failed to parse OpenRouter response. Raw text:", rawResponseText)
      throw new Error("Invalid JSON from OpenRouter")
    }

    const raw = data.choices[0].message.content

    const clean = raw
      .replace(/```json\n?/g, "")
      .replace(/```\n?/g, "")
      .trim()

    const parsed = JSON.parse(clean)

    return NextResponse.json(parsed)

  } catch (err) {
    console.error("Judge route error:", err)
    return NextResponse.json(
      { error: "Failed to judge results" },
      { status: 500 }
    )
  }
}
