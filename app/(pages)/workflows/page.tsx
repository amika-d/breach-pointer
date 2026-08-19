"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import RoleSelector from "@/components/RoleSelector";
import PromptInput from "@/components/PromptInput";
import { useEvalContext } from "@/app/context/EvalContext";
import { Zap, ShieldCheck, TrendingUp } from "lucide-react";

export default function Home() {
  const router = useRouter();
  const { selectedRole, setSelectedRole, prompt, setPrompt, testCount, setTestCount, resetEval } = useEvalContext();
  const [error, setError] = useState("");

  const startTest = () => {
    setError("");
    if (!selectedRole) return setError("Please select your role first.");
    if (!prompt || prompt.length < 20) return setError("Please add a more detailed prompt (at least 20 characters).");

    const savedRole = selectedRole;
    const savedPrompt = prompt;
    const savedCount = testCount;
    resetEval();
    setSelectedRole(savedRole);
    setPrompt(savedPrompt);
    setTestCount(savedCount);
    router.push("/eval");
  };

  return (
    <main className="relative h-[calc(100dvh-61px)] overflow-hidden bg-background text-foreground">
      {/* Background */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_12%_10%,oklch(0.55_0.22_290/.18),transparent_32%),radial-gradient(circle_at_88%_12%,oklch(0.7_0.18_205/.14),transparent_28%),linear-gradient(135deg,oklch(0.16_0.04_285),oklch(0.1_0.025_250)_55%,oklch(0.08_0.03_220))]" />
      <div className="pointer-events-none absolute inset-0 opacity-20 [background-image:linear-gradient(oklch(1_0_0/.06)_1px,transparent_1px),linear-gradient(90deg,oklch(1_0_0/.06)_1px,transparent_1px)] [background-size:42px_42px]" />
      <div className="pointer-events-none absolute left-1/4 top-20 size-72 rounded-full bg-primary/10 blur-3xl" />
      <div className="pointer-events-none absolute bottom-0 right-1/4 size-56 rounded-full bg-accent/10 blur-3xl" />

      <div className="relative mx-auto flex h-full max-w-3xl flex-col px-5 py-6 sm:px-8 lg:px-10 pb-10">

        {/* Hero */}
        <div className="mb-12 text-center">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1.5 text-xs font-semibold text-primary backdrop-blur-md">
            <Zap className="size-3.5" /> Adversarial AI Testing
          </div>
          <h1 className="text-balance text-5xl font-semibold tracking-[-0.05em] text-white sm:text-6xl">
            Is your AI workflow{" "}
            <span className="bg-gradient-to-r from-violet-300 via-fuchsia-200 to-cyan-200 bg-clip-text text-transparent">
              actually ready?
            </span>
          </h1>
          <p className="mt-5 max-w-xl mx-auto text-pretty text-base leading-7 text-muted-foreground">
            Paste your AI prompt. Pick your role. We run adversarial tests against it and tell you exactly where it breaks — before your users find out.
          </p>

          {/* Feature pills */}
          <div className="mt-7 flex flex-wrap items-center justify-center gap-3 text-xs text-muted-foreground">
            {[
              { icon: ShieldCheck, text: "10 attack categories" },
              { icon: TrendingUp, text: "TAI pipeline gate" },
              { icon: Zap, text: "Inline AI fixes" },
            ].map(({ icon: Icon, text }) => (
              <span key={text} className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1.5">
                <Icon className="size-3 text-primary" /> {text}
              </span>
            ))}
          </div>
        </div>

        {/* Form */}
        <div className="flex flex-col gap-4">
          <RoleSelector selectedRole={selectedRole} onSelect={setSelectedRole} />
          <PromptInput prompt={prompt} setPrompt={setPrompt} testCount={testCount} setTestCount={setTestCount} />

          {error && (
            <div className="flex items-center gap-2 rounded-xl border border-rose-300/20 bg-rose-300/10 px-4 py-3 text-sm text-rose-200">
              ⚠ {error}
            </div>
          )}

          <button
            onClick={startTest}
            className="group relative overflow-hidden rounded-2xl bg-white px-6 py-4 text-base font-semibold text-slate-950 shadow-xl shadow-white/10 transition-all hover:scale-[1.01] hover:shadow-violet-500/20 active:scale-[0.99]"
          >
            <span className="relative z-10 flex items-center justify-center gap-2">
              <Zap className="size-5" /> Run Stress Test
            </span>
            <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-violet-200 to-cyan-100 opacity-0 transition-all duration-300 group-hover:translate-x-0 group-hover:opacity-100" />
          </button>
        </div>

        <footer className="mt-auto pt-12 flex items-center justify-center text-[11px] text-white/20">
          Breach Pointer · TAI Labs
        </footer>
      </div>
    </main>
  );
}
