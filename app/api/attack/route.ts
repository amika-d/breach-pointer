import { NextRequest, NextResponse } from "next/server"
import { buildAttackerPrompt } from "@/app/lib/prompts"
import { Role } from "@/app/lib/types"
import { MODELS } from "@/app/lib/config"



export async function POST(req: NextRequest) {
  try {
    const { role, prompt, testCount } = await req.json()

    if (!role || !prompt || !testCount) {
      return NextResponse.json(
        { error: "Missing role, prompt, or testCount" },
        { status: 400 }
      )
    }

    const { system, user } = buildAttackerPrompt(
      role as Role,
      prompt,
      testCount
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
          model: MODELS.attacker,
          temperature: 0.8, // higher = more creative attacks
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

    // Strip markdown if Claude wraps in backticks
    const clean = raw
      .replace(/```json\n?/g, "")
      .replace(/```\n?/g, "")
      .trim()

    const parsed = JSON.parse(clean)

    return NextResponse.json(parsed)

  } catch (err) {
    console.error("Attack route error:", err)
    return NextResponse.json(
      { error: "Failed to generate test cases" },
      { status: 500 }
    )
  }
}
