"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useEvalContext } from "@/app/context/EvalContext";
import PromptEditor from "@/components/PromptEditor";
import { TestResult } from "@/components/TestResults";
import Link from "next/link";
import { ArrowLeft, Check, Clipboard, Command, MoreHorizontal, Sparkles } from "lucide-react";

export default function EditorPage() {
  const router = useRouter();
  const {
    selectedRole, prompt,
    initialTests,
    scoreData, setScoreData,
    setPreviousScoreData,
    suggestions, setSuggestions,
    fixedPrompt, setFixedPrompt,
    setAllTests,
    pushEvalRun,
    isHydrated,
  } = useEvalContext();

  const [isRetesting, setIsRetesting] = useState(false);
  const [error, setError] = useState("");
  const [copiedPrompt, setCopiedPrompt] = useState(false);

  useEffect(() => {
    if (!isHydrated) return;
    if (!prompt || initialTests.length === 0) {
      router.push("/");
    }
  }, [prompt, initialTests, router, isHydrated]);

  const runRetest = async () => {
    if (isRetesting) return;
    setError("");
    setIsRetesting(true);
    setPreviousScoreData(scoreData);

    try {
      const runnerResults: TestResult[] = [];
      for (let i = 0; i < initialTests.length; i++) {
        const t = initialTests[i];
        const runRes = await fetch("/api/run", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userPrompt: fixedPrompt, adversarialInput: t.input }),
        });
        if (!runRes.ok) throw new Error(`Failed to run test ${i + 1}`);
        const { response } = await runRes.json();
        runnerResults.push({ ...t, response });
      }

      const judgeRes = await fetch("/api/judge", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: selectedRole, userPrompt: fixedPrompt, tests: runnerResults }),
      });
      if (!judgeRes.ok) throw new Error("Failed to judge tests");
      const judgeData = await judgeRes.json();

      const merged = runnerResults.map((t) => {
        const j = judgeData.judgements?.find((x: any) => x.id === t.id) ?? {};
        return { ...t, pass: j.pass !== false, reason: j.reason ?? "", severity_if_fail: j.severity_if_fail ?? t.severity, failure_type: j.failure_type ?? "none" };
      });

      const passed = merged.filter((t) => t.pass).length;
      const failed = merged.length - passed;
      const score = Math.round((passed / merged.length) * 100);
      const newScoreData = { score, passed, failed, summary: judgeData.overall_summary ?? "", fixes: judgeData.fixes ?? [] };

      // Fire fresh suggestions in background if there are failures
      if (failed > 0) {
        fetch("/api/suggest", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ 
            role: selectedRole, 
            userPrompt: fixedPrompt, 
            failedTests: merged.filter((t) => !t.pass),
            fixes: newScoreData.fixes
          }),
        }).then(r => r.json()).then(d => { if (d.suggestions) setSuggestions(d.suggestions); }).catch(console.error);
      } else {
        setSuggestions([]);
      }

      setAllTests(merged);
      setScoreData(newScoreData);
      setIsRetesting(false);
      // Record retest run for the report
      pushEvalRun({
        prompt: fixedPrompt,
        score,
        results: merged,
        fixes: judgeData.fixes ?? [],
        summary: judgeData.overall_summary ?? "",
        category_scores: judgeData.category_scores ?? {},
        acceptedSuggestions: [],
        timestamp: Date.now(),
      });
      router.push("/eval");
    } catch (err: any) {
      setError(err.message ?? "Something went wrong during retest.");
      setIsRetesting(false);
    }
  };

  if (!isHydrated || !prompt || initialTests.length === 0) return null;

  return (
    <main className="relative min-h-screen bg-background text-foreground">
      {/* Background */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_15%_15%,oklch(0.55_0.22_290/.18),transparent_32%),radial-gradient(circle_at_90%_12%,oklch(0.7_0.18_205/.14),transparent_28%),linear-gradient(135deg,oklch(0.16_0.04_285),oklch(0.1_0.025_250)_55%,oklch(0.08_0.03_220))]" />
      <div className="pointer-events-none absolute inset-0 opacity-20 [background-image:linear-gradient(oklch(1_0_0/.06)_1px,transparent_1px),linear-gradient(90deg,oklch(1_0_0/.06)_1px,transparent_1px)] [background-size:42px_42px]" />
      <div className="pointer-events-none absolute left-1/4 top-20 size-56 rounded-full bg-primary/10 blur-3xl" />
      <div className="pointer-events-none absolute bottom-0 right-1/4 size-72 rounded-full bg-accent/10 blur-3xl" />

      <div className="relative mx-auto flex min-h-screen max-w-[1800px] flex-col px-3 py-5">
        {/* Sub-header */}
        <header className="flex items-center justify-between border-b border-white/10 pb-5">
          <div className="flex items-center gap-3">
            <div className="flex size-9 items-center justify-center rounded-xl border border-white/15 bg-white/10 shadow-lg shadow-primary/10 backdrop-blur-xl">
              <Sparkles className="size-4 text-accent" />
            </div>
            <div>
              <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-muted-foreground">Breach Pointer</p>
              <p className="text-sm font-medium tracking-tight text-white">Refine workspace</p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Link href="/eval" className="hidden rounded-full border border-rose-300/20 bg-rose-300/10 px-3 py-1.5 text-rose-100 backdrop-blur-md transition hover:bg-rose-300/20 sm:inline no-underline">
              ← Back to evals
            </Link>
            <span className="hidden rounded-full border border-white/10 bg-white/5 px-3 py-1.5 backdrop-blur-md sm:inline">Autosave on</span>
            <button
              aria-label="Copy updated prompt"
              onClick={async () => {
                await navigator.clipboard.writeText(fixedPrompt || prompt);
                setCopiedPrompt(true);
                setTimeout(() => setCopiedPrompt(false), 2000);
              }}
              className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-muted-foreground backdrop-blur-md transition hover:bg-white/10 hover:text-white"
            >
              {copiedPrompt ? <Check className="size-3 text-emerald-400" /> : <Clipboard className="size-3" />}
              {copiedPrompt ? "Copied!" : "Copy prompt"}
            </button>
            <button aria-label="More options" className="flex size-9 items-center justify-center rounded-xl border border-white/10 bg-white/5 transition-colors hover:bg-white/10">
              <MoreHorizontal className="size-4" />
            </button>
          </div>
        </header>

        {error && (
          <div className="mt-4 rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
            ⚠ {error}
          </div>
        )}

        {/* Retesting progress */}
        {isRetesting && (
          <div className="mt-6 rounded-3xl border border-white/10 bg-white/[0.04] p-6 shadow-2xl shadow-black/20 backdrop-blur-2xl">
            <div className="flex items-center gap-3">
              <span className="spinner" />
              <strong className="text-sm text-white">Running retest against the same attacks…</strong>
            </div>
          </div>
        )}

        {/* Main Content */}
        <section className="flex flex-1 flex-col gap-8 py-10 lg:gap-12 lg:py-14">
          {!isRetesting && (
            suggestions.length === 0 ? (
              <div className="space-y-3 mt-4">
                {[...Array(3)].map((_, i) => (
                  <div
                    key={i}
                    className="h-16 rounded-2xl bg-white/[0.03] border border-white/5 animate-pulse"
                    style={{ animationDelay: `${i * 120}ms` }}
                  />
                ))}
                <p className="text-xs text-muted-foreground text-center mt-4">
                  Analysing failures to generate inline suggestions…
                </p>
              </div>
            ) : (
              <PromptEditor
                originalPrompt={prompt}
                initialDraft={fixedPrompt || prompt}
                suggestions={suggestions}
                onPromptChange={setFixedPrompt}
                onRetest={runRetest}
                isRetesting={isRetesting}
              />
            )
          )}
        </section>

        <footer className="flex items-center justify-between border-t border-white/10 py-5 text-[11px] text-muted-foreground">
          <span>Breach Pointer / Workspace</span>
          <span className="flex items-center gap-2">
            <Command className="size-3" /> K to open command menu
          </span>
        </footer>
      </div>
    </main>
  );
}
