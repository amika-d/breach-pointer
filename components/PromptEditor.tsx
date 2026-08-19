"use client";
import React, { useState, useMemo, useEffect } from "react";
import { InlineSuggestion } from "@/app/lib/types";
import {
  ArrowUpRight,
  Check,
  ChevronDown,
  Clipboard,
  Cpu,
  Edit3,
  FileText,
  Flag,
  Lightbulb,
  ShieldCheck,
  Zap,
} from "lucide-react";

interface Props {
  originalPrompt: string;
  suggestions: InlineSuggestion[];
  onPromptChange: (p: string) => void;
  onRetest: () => void;
  isRetesting: boolean;
}

function getIconForCategory(cat: string) {
  if (cat.includes("jailbreak") || cat.includes("social_engineering")) return Flag;
  if (cat.includes("tool_misuse")) return Zap;
  if (cat.includes("pii")) return ShieldCheck;
  return Lightbulb;
}

function highlightLine(line: string) {
  const escaped = line.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  if (/^Hard rules:|Before returning|^- Do not|^- Respect|^- If evidence/.test(line))
    return <span className="text-rose-200">{escaped}</span>;
  if (/^You are|^Follow|^For each/.test(line))
    return <span className="text-cyan-200">{escaped}</span>;
  if (line.trim().startsWith("- "))
    return <span className="text-amber-100">{escaped}</span>;
  return <span className="text-slate-300">{escaped}</span>;
}

export default function PromptEditor({ originalPrompt, suggestions, onPromptChange, onRetest, isRetesting }: Props) {
  const [prompt, setPrompt] = useState(originalPrompt);
  const [activeLine, setActiveLine] = useState(1);
  const [activeFinding, setActiveFinding] = useState<number | null>(null);
  const [copied, setCopied] = useState(false);
  const [applied, setApplied] = useState(false);
  const [appliedFixes, setAppliedFixes] = useState<Set<number>>(new Set());

  const lines = useMemo(() => prompt.split("\n"), [prompt]);

  const findings = useMemo(() => {
    return suggestions
      .filter((s) => !appliedFixes.has(s.line_number))
      .map((s, idx) => ({
        id: idx,
        severity: s.confidence === "high" ? "High" : s.confidence === "medium" ? "Medium" : "Low",
        category: s.test_category.replace(/_/g, " "),
        label: "Risk detected",
        line: s.line_number,
        icon: getIconForCategory(s.test_category),
        text: s.issue,
        fix: s.suggested_line,
        original: s.original_line,
      }));
  }, [suggestions, appliedFixes]);

  const guardrails = lines.filter((line) =>
    /Hard rules:|^- Do not|^- Respect|^- If evidence|Before returning/.test(line)
  ).length;

  useEffect(() => {
    onPromptChange(prompt);
  }, [prompt, onPromptChange]);

  function applyFinding(finding: typeof findings[0]) {
    const newLines = [...lines];
    const lineIndex = finding.line - 1;
    if (newLines[lineIndex] && newLines[lineIndex].trim() === finding.original.trim()) {
      newLines[lineIndex] = finding.fix;
      setPrompt(newLines.join("\n"));
    } else {
      setPrompt((current) => current.replace(finding.original, finding.fix));
    }
    setActiveFinding(finding.id);
    window.setTimeout(() => {
      setAppliedFixes((prev) => new Set(prev).add(finding.line));
      setActiveFinding(null);
    }, 1500);
  }

  function handleCopy() {
    navigator.clipboard.writeText(originalPrompt);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2000);
  }

  function handleApply() {
    setApplied(true);
    window.setTimeout(() => setApplied(false), 2200);
  }

  return (
    <div className="flex flex-col gap-8 w-full">
      {/* Title Row */}
      <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
        <div className="max-w-3xl">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-accent/20 bg-accent/10 px-3 py-1.5 text-xs font-medium text-accent backdrop-blur-md">
            <Cpu className="size-3.5" />
            Workflow instructions
            <ChevronDown className="size-3.5 opacity-60" />
          </div>
          <h1 className="text-balance text-4xl font-semibold tracking-[-0.05em] text-white sm:text-5xl lg:text-6xl">
            Make every prompt{" "}
            <span className="bg-gradient-to-r from-violet-300 via-fuchsia-200 to-cyan-200 bg-clip-text text-transparent">
              safer.
            </span>
          </h1>
          <p className="mt-4 max-w-xl text-pretty text-sm leading-6 text-muted-foreground sm:text-base">
            Edit long-form instructions like code. Guardrails stay visible inline, so every rule is easy to audit before you ship.
          </p>
        </div>
        <div className="flex items-center gap-2 self-start rounded-full border border-white/10 bg-white/5 px-3 py-2 text-xs text-muted-foreground backdrop-blur-md md:self-end">
          <span className="size-1.5 rounded-full bg-emerald-300 shadow-[0_0_10px_theme(colors.emerald.300)]" />
          {guardrails} guardrails active
        </div>
      </div>

      {/* Dual Pane */}
      <div className="grid flex-1 gap-5 lg:grid-cols-[0.72fr_1.28fr]">

        {/* Left: Original Prompt */}
        <section className="flex min-h-[430px] flex-col rounded-3xl border border-white/15 bg-white/[0.07] p-5 shadow-2xl shadow-black/20 backdrop-blur-2xl sm:p-7">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="flex size-9 items-center justify-center rounded-xl bg-white/10 text-muted-foreground">
                <FileText className="size-4" />
              </div>
              <div>
                <p className="text-sm font-medium text-white">Original prompt</p>
                <p className="mt-0.5 text-xs text-muted-foreground">Before adversarial testing</p>
              </div>
            </div>
            <button
              aria-label="Copy original prompt"
              onClick={handleCopy}
              className="rounded-lg p-2 text-muted-foreground transition hover:bg-white/10 hover:text-white"
            >
              {copied ? <Check className="size-4 text-emerald-400" /> : <Clipboard className="size-4" />}
            </button>
          </div>
          <div className="mt-8 flex flex-1 flex-col justify-between gap-8">
            <p className="max-h-[530px] overflow-auto whitespace-pre-wrap pr-2 text-base leading-8 tracking-[-0.01em] text-white/85 sm:text-lg">
              {originalPrompt}
            </p>
            <div className="border-t border-white/10 pt-5">
              <div className="mb-3 flex items-center justify-between text-xs text-muted-foreground">
                <span>Prompt snapshot</span>
                <span>{originalPrompt.length} characters</span>
              </div>
              <div className="h-1 overflow-hidden rounded-full bg-white/10">
                <div className="h-full w-full rounded-full bg-gradient-to-r from-primary to-accent" />
              </div>
            </div>
          </div>
        </section>

        {/* Right: Working Draft */}
        <section className="flex min-h-[560px] flex-col rounded-3xl border border-white/20 bg-white/[0.1] p-5 shadow-2xl shadow-primary/10 backdrop-blur-2xl sm:p-7">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <Edit3 className="size-4 text-accent" />
                <p className="text-sm font-medium text-white">Working draft</p>
              </div>
              <p className="mt-1 text-xs text-muted-foreground">A real editable prompt editor with inline safety checks.</p>
            </div>
            <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
              prompt.ts
            </span>
          </div>

          {/* Editor Shell */}
          <div className="mt-6 flex min-h-[420px] flex-1 overflow-hidden rounded-2xl border border-white/10 bg-[#080b16]/80 shadow-inner shadow-black/30">
            {/* Gutter */}
            <div
              aria-hidden="true"
              className="select-none border-r border-white/10 bg-white/[0.025] py-5 text-right font-mono text-xs leading-7 text-slate-600"
            >
              {lines.map((_, index) => (
                <div
                  key={index}
                  className={[
                    activeLine === index + 1 ? "bg-accent/10 text-accent" : "",
                    findings.some((f) => f.line === index + 1) ? "border-l-2 border-rose-300/70" : "",
                    "pr-3",
                  ].filter(Boolean).join(" ")}
                >
                  {index + 1}
                </div>
              ))}
            </div>

            {/* Highlight + Textarea Layer */}
            <div className="relative min-w-0 flex-1 overflow-auto">
              <pre aria-hidden="true" className="pointer-events-none absolute inset-0 m-0 whitespace-pre-wrap break-words p-5 font-mono text-[12px] leading-7">
                {lines.map((line, index) => (
                  <div
                    key={`${index}-${line}`}
                    className={[
                      activeLine === index + 1 ? "-mx-2 rounded bg-white/[0.06] px-2" : "",
                      findings.some((f) => f.line === index + 1) ? "border-b border-dashed border-rose-300/40" : "",
                    ].filter(Boolean).join(" ")}
                  >
                    {highlightLine(line || " ")}
                  </div>
                ))}
              </pre>
              <textarea
                aria-label="Working prompt code editor"
                spellCheck={false}
                value={prompt}
                onChange={(e) => {
                  setPrompt(e.target.value);
                  setActiveLine(e.target.value.slice(0, e.target.selectionStart).split("\n").length);
                }}
                onClick={(e) => setActiveLine(e.currentTarget.value.slice(0, e.currentTarget.selectionStart).split("\n").length)}
                onKeyUp={(e) => setActiveLine(e.currentTarget.value.slice(0, e.currentTarget.selectionStart).split("\n").length)}
                className="relative z-10 block h-full min-h-[420px] w-full resize-none overflow-auto whitespace-pre-wrap break-words bg-transparent p-5 font-mono text-[12px] leading-7 text-transparent caret-cyan-200 outline-none selection:bg-cyan-300/20"
              />
            </div>

            {/* AI Findings Sidebar */}
            <aside
              aria-label="AI findings"
              className="hidden w-64 shrink-0 overflow-auto border-l border-white/10 bg-white/[0.025] p-3 xl:block"
            >
              <div className="mb-3 flex items-center justify-between">
                <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">AI findings</span>
                {findings.length > 0 && (
                  <span className="rounded-full bg-rose-300/10 px-2 py-0.5 text-[10px] text-rose-200">
                    {findings.length} open
                  </span>
                )}
              </div>
              <div className="flex flex-col gap-2">
                {findings.length === 0 ? (
                  <div className="mt-10 text-center text-[11px] text-muted-foreground">No active findings.</div>
                ) : (
                  findings.map((finding) => {
                    const Icon = finding.icon;
                    return (
                      <button
                        key={finding.id}
                        onClick={() => applyFinding(finding)}
                        className={`rounded-xl border p-3 text-left transition ${
                          activeFinding === finding.id
                            ? "border-emerald-300/50 bg-emerald-300/10"
                            : "border-rose-300/15 bg-rose-300/[0.04] hover:border-rose-300/40 hover:bg-rose-300/[0.08]"
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <span className="flex items-center gap-1.5 text-[11px] font-medium text-rose-100">
                            <Icon className="size-3" />
                            {finding.label}
                          </span>
                          <span className="font-mono text-[9px] text-muted-foreground">L{finding.line}</span>
                        </div>
                        <p className="mt-1 text-[10px] uppercase tracking-wider text-rose-200/70">
                          {finding.severity} · {finding.category}
                        </p>
                        <p className="mt-2 text-[11px] leading-4 text-muted-foreground">
                          {activeFinding === finding.id ? "Guardrail added to editor." : finding.text}
                        </p>
                        <span className="mt-2 inline-flex text-[10px] text-accent">
                          {activeFinding === finding.id ? "Applied ✓" : "Apply fix →"}
                        </span>
                      </button>
                    );
                  })
                )}
              </div>
            </aside>
          </div>

          {/* Bottom Action Bar */}
          <div className="mt-4 flex flex-col gap-3 border-t border-white/10 pt-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3 font-mono text-[11px] text-muted-foreground">
              <span>{lines.length} lines</span>
              <span className="text-white/20">/</span>
              <span>{prompt.length} chars</span>
            </div>
            <button
              onClick={onRetest}
              disabled={isRetesting}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-slate-950 shadow-lg shadow-white/10 transition hover:bg-cyan-100 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isRetesting ? <span className="spinner" /> : <ArrowUpRight className="size-4" />}
              {isRetesting ? "Retesting…" : "Apply & Retest"}
            </button>
          </div>
        </section>
      </div>

      {/* Guardrail Banner */}
      <div className="flex items-center gap-3 rounded-2xl border border-rose-300/20 bg-rose-300/[0.06] px-4 py-3 text-xs text-rose-100/80 mb-10">
        <Flag className="size-4 shrink-0 text-rose-200" />
        <span>
          <strong className="font-medium text-rose-100">Inline guardrails active.</strong>{" "}
          Hard rules are highlighted in rose, and the final check audits accuracy, privacy, relevance, and tone.
        </span>
      </div>
    </div>
  );
}
