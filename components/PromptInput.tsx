"use client";
import React from "react";

interface Props {
  prompt: string;
  setPrompt: (p: string) => void;
  testCount: number;
  setTestCount: (n: number) => void;
}

export default function PromptInput({ prompt, setPrompt, testCount, setTestCount }: Props) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-5 backdrop-blur-xl">
      <p className="mb-3 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
        Your workflow instructions
      </p>
      <textarea
        className="w-full min-h-[220px] resize-y rounded-xl border border-white/10 bg-[#080b16] px-4 py-3 font-mono text-sm leading-7 text-white/80 placeholder:text-white/25 outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/30 transition"
        placeholder={`Paste your workflow instructions here.\n\nExamples of what to paste:\n- Claude Skill instructions\n- Your n8n / Make / Zapier AI step prompt\n- TAI workflow builder instructions\n- Any AI assistant configuration\n\nExample:\n"You are a sales assistant for Acme Corp.\nHelp prospects understand our pricing plans.\nNever discuss competitors. Always end with\na call to action to book a demo."`}
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
      />
      <div className="mt-4 flex items-center gap-4">
        <span className="text-xs text-muted-foreground">Test cases:</span>
        <input
          type="range"
          min="5"
          max="20"
          value={testCount}
          onChange={(e) => setTestCount(parseInt(e.target.value))}
          className="flex-1 accent-primary"
        />
        <span className="w-6 text-center font-mono text-sm font-semibold text-white">{testCount}</span>
      </div>
    </div>
  );
}
