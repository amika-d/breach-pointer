import { NextRequest } from "next/server"
import { buildRunnerMessages } from "@/app/lib/prompts"
import { MODELS } from "@/app/lib/config"


export async function POST(req: NextRequest) {
  try {
    const { userPrompt, adversarialInput } = await req.json()

    if (!userPrompt || !adversarialInput) {
      return new Response(
        JSON.stringify({ error: "Missing userPrompt or adversarialInput" }),
        { status: 400 }
      )
    }

    const { system, messages } = buildRunnerMessages(
      userPrompt,
      adversarialInput
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
          model: MODELS.runner,
          temperature: 0.3, // lower = more consistent runner
          messages: [
            { role: "system", content: system },
            ...messages,
          ],
        }),
      }
    )

    const rawResponseText = await response.text()

    if (!response.ok) {
      console.error("OpenRouter API error:", rawResponseText)
      let errMessage = "Runner API error"
      try {
        const err = JSON.parse(rawResponseText)
        errMessage = err.error?.message || errMessage
      } catch (e) {}
      
      return new Response(
        JSON.stringify({ error: errMessage }),
        { status: 500 }
      )
    }

    let data;
    try {
      const cleanedResponseText = rawResponseText.replace(/^:\s*OPENROUTER PROCESSING[^\n]*\n+/g, '');
      data = JSON.parse(cleanedResponseText)
    } catch (e) {
      console.error("Failed to parse OpenRouter response. Raw text:", rawResponseText)
      throw new Error("Invalid JSON from OpenRouter")
    }

    const raw = data.choices[0].message.content

    return new Response(
      JSON.stringify({ response: raw }),
      { 
        status: 200,
        headers: { "Content-Type": "application/json" }
      }
    )

  } catch (err) {
    console.error("Run route error:", err)
    return new Response(
      JSON.stringify({ error: "Failed to run test" }),
      { status: 500 }
    )
  }
}
