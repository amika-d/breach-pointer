"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useEvalContext } from "@/app/context/EvalContext";
import Link from "next/link";
import ScoreRing from "@/components/ScoreRing";
import TestResults, { TestResult } from "@/components/TestResults";
import PipelineGate from "@/components/PipelineGate";
import ScoreDelta from "@/components/ScoreDelta";
import {
  ArrowUpRight,
  ChevronRight,
  CircleAlert,
  CircleCheck,
  FlaskConical,
  Gauge,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

type Progress = { pct: number; phase: string; sub: string };

export default function EvalPage() {
  const router = useRouter();
  const {
    selectedRole, prompt, testCount,
    allTests, setAllTests,
    initialTests, setInitialTests,
    scoreData, setScoreData,
    previousScoreData,
    setSuggestions,
    fixedPrompt, setFixedPrompt,
    isHydrated,
  } = useEvalContext();

  const [running, setRunning] = useState(false);
  const [progress, setProgress] = useState<Progress>({ pct: 0, phase: "", sub: "" });
  const [error, setError] = useState("");
  const [hasStarted, setHasStarted] = useState(false);
  const [selectedTest, setSelectedTest] = useState<TestResult | null>(null);

  useEffect(() => {
    if (!isHydrated) return;
    if (!prompt) { router.push("/"); return; }
    if (!scoreData && !hasStarted) {
      setHasStarted(true);
      runInitialTest();
    }
  }, [isHydrated, prompt, scoreData, hasStarted]);

  useEffect(() => {
    if (allTests.length > 0 && !selectedTest) {
      setSelectedTest(allTests.find(t => !t.pass) ?? allTests[0]);
    }
  }, [allTests]);

  const runInitialTest = async () => {
    setError("");
    setRunning(true);
    try {
      setProgress({ pct: 10, phase: "Generating adversarial test cases…", sub: `Creating ${testCount} attacks for ${selectedRole} workflows` });
      const attackRes = await fetch("/api/attack", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt, role: selectedRole, testCount }),
      });
      if (!attackRes.ok) throw new Error("Failed to generate test cases");
      const { tests }: { tests: TestResult[] } = await attackRes.json();
      setInitialTests(tests);

      const runnerResults: TestResult[] = [];
      for (let i = 0; i < tests.length; i++) {
        const t = tests[i];
        setProgress({ pct: 35 + Math.round((i / tests.length) * 35), phase: `Running test ${i + 1} of ${tests.length}…`, sub: `Category: ${t.category.replace(/_/g, " ")}` });
        const runRes = await fetch("/api/run", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userPrompt: prompt, adversarialInput: t.input }),
        });
        if (!runRes.ok) throw new Error(`Failed to run test ${i + 1}`);
        const { response } = await runRes.json();
        runnerResults.push({ ...t, response });
      }

      setProgress({ pct: 72, phase: "Judging responses…", sub: "Scoring each output for safety, accuracy and robustness" });
      const judgeRes = await fetch("/api/judge", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: selectedRole, userPrompt: prompt, tests: runnerResults }),
      });
      if (!judgeRes.ok) throw new Error("Failed to judge tests");
      const judgeData = await judgeRes.json();

      setProgress({ pct: 95, phase: "Building your report…", sub: "" });

      const merged = runnerResults.map((t) => {
        const j = judgeData.judgements?.find((x: any) => x.id === t.id) ?? {};
        return { ...t, pass: j.pass !== false, reason: j.reason ?? "", severity_if_fail: j.severity_if_fail ?? t.severity, failure_type: j.failure_type ?? "none" };
      });

      const passed = merged.filter((t) => t.pass).length;
      const failed = merged.length - passed;
      const score = Math.round((passed / merged.length) * 100);
      const newScoreData = { score, passed, failed, summary: judgeData.overall_summary ?? "", fixes: judgeData.fixes ?? [] };

      // Fire suggestions in background
      fetch("/api/suggest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: selectedRole, userPrompt: prompt, failedTests: merged.filter((t) => !t.pass) }),
      }).then(r => r.json()).then(d => { if (d.suggestions) setSuggestions(d.suggestions); }).catch(console.error);

      setTimeout(() => {
        setAllTests(merged);
        setInitialTests(tests);
        setFixedPrompt(prompt);
        setScoreData(newScoreData);
        setSelectedTest(merged.find(t => !t.pass) ?? merged[0]);
        setRunning(false);
      }, 350);
    } catch (err: any) {
      setError(err.message ?? "Something went wrong.");
      setRunning(false);
    }
  };

  if (!isHydrated) return null;

  const blocked = allTests.filter(t => t.pass).length;
  const avgScore = scoreData?.score ?? 0;

  return (
    <main className="relative min-h-screen overflow-hidden bg-background text-foreground">
      {/* Background */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_12%_10%,oklch(0.55_0.22_290/.18),transparent_32%),radial-gradient(circle_at_88%_12%,oklch(0.7_0.18_205/.14),transparent_28%),linear-gradient(135deg,oklch(0.16_0.04_285),oklch(0.1_0.025_250)_55%,oklch(0.08_0.03_220))]" />
      <div className="pointer-events-none absolute inset-0 opacity-20 [background-image:linear-gradient(oklch(1_0_0/.06)_1px,transparent_1px),linear-gradient(90deg,oklch(1_0_0/.06)_1px,transparent_1px)] [background-size:42px_42px]" />

      <div className="relative mx-auto flex min-h-screen max-w-7xl flex-col px-5 py-5 sm:px-8 lg:px-10">

        {/* Section Header */}
        <section className="flex flex-1 flex-col gap-8 py-10 lg:py-14">

          {/* Title */}
          <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
            <div className="max-w-3xl">
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-rose-300/20 bg-rose-300/10 px-3 py-1.5 text-xs font-medium text-rose-100 backdrop-blur-md">
                <FlaskConical className="size-3.5" /> Adversarial test suite
              </div>
              <h1 className="text-balance text-4xl font-semibold tracking-[-0.05em] text-white sm:text-5xl lg:text-6xl">
                Red-team your{" "}
                <span className="bg-gradient-to-r from-violet-300 via-fuchsia-200 to-cyan-200 bg-clip-text text-transparent">
                  guardrails.
                </span>
              </h1>
              <p className="mt-4 max-w-xl text-pretty text-sm leading-6 text-muted-foreground sm:text-base">
                Adversarial prompts run against your working draft. Every finding maps to an actionable editor suggestion.
              </p>
            </div>
            {scoreData && (
              <div className="flex items-center gap-2 rounded-full border border-emerald-300/20 bg-emerald-300/10 px-3 py-2 text-xs text-emerald-100 backdrop-blur-md">
                <span className="size-1.5 rounded-full bg-emerald-300 shadow-[0_0_10px_theme(colors.emerald.300)]" />
                {running ? "Running…" : "Suite complete"}
              </div>
            )}
          </div>

          {/* Progress */}
          {running && (
            <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-6 shadow-2xl shadow-black/20 backdrop-blur-2xl">
              <div className="flex items-center gap-3 mb-4">
                <span className="spinner" />
                <strong className="text-sm text-white">{progress.phase}</strong>
              </div>
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/10">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-violet-500 to-cyan-400 transition-all duration-500"
                  style={{ width: `${progress.pct}%` }}
                />
              </div>
              <p className="mt-3 text-xs text-muted-foreground">{progress.sub}</p>
            </div>
          )}

          {error && (
            <div className="rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
              ⚠ {error}
            </div>
          )}

          {/* Metrics */}
          {scoreData && !running && (
            <>
              {previousScoreData && (
                <ScoreDelta
                  previousScore={previousScoreData.score}
                  newScore={scoreData.score}
                  previousFailed={previousScoreData.failed}
                  newFailed={scoreData.failed}
                />
              )}

              <div className="grid gap-4 sm:grid-cols-3">
                <Metric icon={Gauge} label="Safety score" value={`${avgScore}%`} detail={`${scoreData.passed}/${allTests.length} tests passed`} />
                <Metric icon={ShieldCheck} label="Tests passed" value={`${blocked}/${allTests.length}`} detail="All categories evaluated" />
                <Metric icon={CircleAlert} label="Failures" value={`${scoreData.failed}`} detail={scoreData.failed > 0 ? "Needs remediation" : "All clear"} />
              </div>

              <PipelineGate score={scoreData.score} failedCount={scoreData.failed} />
            </>
          )}

          {/* Results Panel */}
          {allTests.length > 0 && !running && (
            <div className="grid gap-5 md:grid-cols-[0.95fr_1.05fr]">
              {/* Test Case List */}
              <section className="rounded-3xl border border-white/10 bg-white/[0.04] p-4 shadow-2xl shadow-black/20 backdrop-blur-2xl sm:p-6 flex flex-col h-[520px]">
                <div className="mb-4 flex items-center justify-between">
                  <h2 className="text-sm font-medium text-white">Test cases</h2>
                  <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                    {allTests.length} runs
                  </span>
                </div>
                <p className="mb-4 mt-1 text-xs text-muted-foreground">Select a scenario to inspect the model response.</p>
                <div className="flex flex-col gap-2 overflow-y-auto pr-2 custom-scrollbar flex-1">
                  {allTests.map((test, idx) => {
                    const testId = `RT-${String(idx + 1).padStart(3, "0")}`;
                    const isSelected = selectedTest?.id === test.id;
                    const statusText = test.pass ? "Passed" : "Needs review";
                    const subtitle = test.pass ? `${statusText} · ${test.severity} risk` : `${statusText} · ${test.severity_if_fail ?? test.severity} risk`;
                    
                    return (
                      <button
                        key={test.id}
                        onClick={() => setSelectedTest(test)}
                        className={`flex items-center gap-3 rounded-2xl border p-4 text-left transition ${
                          isSelected
                            ? "border-white/20 bg-white/[0.08]"
                            : "border-white/5 bg-white/[0.02] hover:bg-white/[0.05]"
                        }`}
                      >
                        <div className={`flex size-8 shrink-0 items-center justify-center rounded-full ${
                          test.pass ? "bg-emerald-300/10 text-emerald-300" : "bg-amber-300/10 text-amber-300"
                        }`}>
                          {test.pass ? <CircleCheck className="size-4" /> : <ShieldAlert className="size-4" />}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-medium text-white capitalize">{test.category.replace(/_/g, " ")}</p>
                          <p className="mt-1 text-xs text-muted-foreground truncate">{subtitle}</p>
                        </div>
                        <div className="flex flex-col items-end gap-1 shrink-0">
                          <span className="font-mono text-[10px] font-medium text-muted-foreground">{testId}</span>
                          <ChevronRight className="size-4 text-muted-foreground/50" />
                        </div>
                      </button>
                    );
                  })}
                </div>
              </section>

              {/* Detail Panel */}
              {selectedTest && (() => {
                const testIdx = allTests.findIndex(t => t.id === selectedTest.id);
                const testId = `RT-${String(testIdx + 1).padStart(3, "0")}`;
                return (
                  <section className="rounded-3xl border border-white/15 bg-white/[0.05] p-5 shadow-2xl shadow-primary/10 backdrop-blur-2xl sm:p-7 flex flex-col h-[520px]">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-2">
                          {selectedTest.pass ? (
                            <CircleCheck className="size-4 text-emerald-300" />
                          ) : (
                            <ShieldAlert className="size-4 text-rose-300" />
                          )}
                          <p className="text-sm font-medium text-white capitalize">{selectedTest.category.replace(/_/g, " ")}</p>
                        </div>
                        <p className="mt-1 font-mono text-[10px] font-bold uppercase tracking-widest text-blue-400">
                          {testId} / {selectedTest.pass ? selectedTest.severity : (selectedTest.severity_if_fail ?? selectedTest.severity)} SEVERITY
                        </p>
                      </div>
                      <span className={`rounded-full px-2.5 py-1 font-mono text-[10px] font-bold uppercase tracking-wider border ${
                        selectedTest.pass 
                          ? "border-emerald-300/20 bg-emerald-300/10 text-emerald-300" 
                          : "border-blue-400/20 bg-blue-400/10 text-blue-400"
                      }`}>
                        {selectedTest.pass ? "PASSED" : "NEEDS REVIEW"}
                      </span>
                    </div>

                    <div className="mt-8 flex flex-col gap-6 overflow-y-auto pr-2 custom-scrollbar flex-1">
                      <div>
                        <div className="mb-2 inline-block bg-blue-600/30 px-2 py-0.5 font-mono text-[10px] font-bold tracking-widest text-blue-300">
                          ATTACK PROMPT
                        </div>
                        <div className="rounded-xl border border-white/5 bg-black/20 p-4">
                          <p className="text-sm leading-6 text-white/90">
                            <span className="bg-blue-600/40 text-blue-100 selection:bg-blue-500/50">{selectedTest.input}</span>
                          </p>
                        </div>
                      </div>
                      {selectedTest.response && (
                        <div>
                          <div className="mb-2 inline-block bg-blue-600/30 px-2 py-0.5 font-mono text-[10px] font-bold tracking-widest text-blue-300">
                            MODEL RESPONSE
                          </div>
                          <p className="text-sm leading-7 text-white/90 px-1">
                            <span className="bg-blue-600/40 text-blue-100 leading-normal selection:bg-blue-500/50">{selectedTest.response}</span>
                          </p>
                        </div>
                      )}
                    </div>

                    {!selectedTest.pass && (
                      <div className="mt-6 rounded-2xl border border-white/5 bg-white/[0.02] p-5">
                        <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground mb-3">
                          <Sparkles className="size-3.5" /> Suggested editor change
                        </div>
                        <p className="text-sm leading-6 text-white/80">{selectedTest.reason}</p>
                        <Link href="/eval/editor" className="mt-4 inline-flex items-center gap-1.5 text-xs font-medium text-white hover:text-blue-300 transition-colors no-underline">
                          Open in prompt editor <ArrowUpRight className="size-3" />
                        </Link>
                      </div>
                    )}
                  </section>
                );
              })()}
            </div>
          )}

          {/* CTA Footer */}
          {scoreData && !running && (
            <>
              <div className="flex items-center gap-3 rounded-2xl border border-primary/20 bg-primary/[0.06] px-4 py-3 text-xs text-muted-foreground">
                <FlaskConical className="size-4 shrink-0 text-primary" />
                <span>
                  <strong className="font-medium text-white">Evaluation loop complete.</strong>{" "}
                  {scoreData.failed > 0
                    ? `Review ${scoreData.failed} failure${scoreData.failed > 1 ? "s" : ""}, apply suggested rules in the editor, then retest.`
                    : "All tests passed. Your workflow is ready to promote."}
                </span>
              </div>

              <div className="flex items-center justify-between gap-4">
                <Link
                  href="/"
                  className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-muted-foreground transition hover:bg-white/10 hover:text-white no-underline"
                >
                  ← Start over
                </Link>
                <Link
                  href="/eval/editor"
                  className="inline-flex items-center gap-2 rounded-xl bg-white px-5 py-2.5 text-sm font-semibold text-slate-950 shadow-lg shadow-white/10 transition hover:bg-violet-100 no-underline"
                >
                  Fix your workflow <ArrowUpRight className="size-4" />
                </Link>
              </div>
            </>
          )}
        </section>

        <footer className="flex items-center justify-between border-t border-white/10 py-5 text-[11px] text-muted-foreground">
          <span>Breach Pointer / Eval suite</span>
          <span>TAI Labs</span>
        </footer>
      </div>
    </main>
  );
}

function Metric({ icon: Icon, label, value, detail }: { icon: typeof Gauge; label: string; value: string; detail: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4 backdrop-blur-xl">
      <div className="flex items-center justify-between">
        <span className="flex items-center gap-2 text-xs text-muted-foreground">
          <Icon className="size-3.5 text-primary" />{label}
        </span>
        <span className="font-mono text-2xl font-semibold tracking-tight text-white">{value}</span>
      </div>
      <p className="mt-2 text-[11px] text-muted-foreground">{detail}</p>
    </div>
  );
}
