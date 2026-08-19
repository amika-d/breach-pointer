"use client";
import React, { useEffect, useState } from "react";

interface Props {
  score: number;
  passed: number;
  failed: number;
  summary: string;
}

export default function ScoreRing({ score, passed, failed, summary }: Props) {
  const [animatedScore, setAnimatedScore] = useState(0);
  const [offset, setOffset] = useState(251.2);
  const circumference = 251.2;

  useEffect(() => {
    const targetOffset = circumference - (score / 100) * circumference;
    const t = setTimeout(() => setOffset(targetOffset), 100);
    let cur = 0;
    const iv = setInterval(() => {
      cur = Math.min(cur + 2, score);
      setAnimatedScore(cur);
      if (cur >= score) clearInterval(iv);
    }, 18);
    return () => { clearTimeout(t); clearInterval(iv); };
  }, [score]);

  const strokeColor = score >= 75 ? "#34D399" : score >= 50 ? "#FBB741" : "#F87171";

  const verdict =
    score >= 75
      ? { text: "✓ Production Ready", cls: "border-emerald-300/30 bg-emerald-300/10 text-emerald-300" }
      : score >= 50
      ? { text: "⚠ Needs Work", cls: "border-amber-300/30 bg-amber-300/10 text-amber-300" }
      : { text: "✗ Not Ready", cls: "border-rose-300/30 bg-rose-300/10 text-rose-300" };

  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-6 mb-4 backdrop-blur-xl">
      <div className="flex items-center gap-8">
        {/* Ring */}
        <div className="relative size-28 shrink-0">
          <svg className="size-28 -rotate-90" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="40" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="8" />
            <circle
              cx="50" cy="50" r="40"
              fill="none"
              stroke={strokeColor}
              strokeWidth="8"
              strokeDasharray={circumference}
              strokeDashoffset={offset}
              strokeLinecap="round"
              style={{ transition: "stroke-dashoffset 1s ease" }}
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-2xl font-black tracking-tight text-white">{animatedScore}</span>
          </div>
        </div>

        {/* Meta */}
        <div className="flex flex-col gap-2">
          <span className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-[11px] font-semibold tracking-wider self-start ${verdict.cls}`}>
            {verdict.text}
          </span>
          <h2 className="text-xl font-bold tracking-tight text-white">Robustness Score</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            {summary || `Your workflow passed ${passed} of ${passed + failed} adversarial tests.`}
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="mt-5 grid grid-cols-3 gap-3">
        {[
          { label: "Tests Run", value: passed + failed, cls: "text-violet-300" },
          { label: "Passed", value: passed, cls: "text-emerald-300" },
          { label: "Failed", value: failed, cls: "text-rose-300" },
        ].map((s) => (
          <div key={s.label} className="rounded-xl border border-white/10 bg-white/[0.025] p-4 text-center">
            <div className={`text-2xl font-black tracking-tight ${s.cls}`}>{s.value}</div>
            <div className="mt-1 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">{s.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
