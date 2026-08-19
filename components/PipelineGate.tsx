"use client";
import React from "react";
import { ShieldCheck, ShieldAlert } from "lucide-react";

interface Props {
  score: number;
  failedCount: number;
}

export default function PipelineGate({ score, failedCount }: Props) {
  const isReady = score >= 75;

  return (
    <div className={`flex items-start gap-4 rounded-2xl border p-4 mb-6 backdrop-blur-xl ${
      isReady
        ? "border-emerald-300/25 bg-emerald-300/[0.06]"
        : "border-rose-300/25 bg-rose-300/[0.06]"
    }`}>
      <div className={`flex size-10 shrink-0 items-center justify-center rounded-xl ${
        isReady ? "bg-emerald-300/15 text-emerald-300" : "bg-rose-300/15 text-rose-300"
      }`}>
        {isReady ? <ShieldCheck className="size-5" /> : <ShieldAlert className="size-5" />}
      </div>
      <div>
        <h3 className={`text-sm font-semibold ${isReady ? "text-emerald-200" : "text-rose-200"}`}>
          {isReady ? "Ready to promote to Validated" : "Not ready to move from Testing → Validated"}
        </h3>
        <p className={`mt-1 text-xs leading-5 ${isReady ? "text-emerald-100/70" : "text-rose-100/70"}`}>
          {isReady
            ? "Score is 75 or higher. Share this report with your manager."
            : `Score is below 75. Fix ${failedCount} critical failure${failedCount !== 1 ? "s" : ""} first.`}
        </p>
      </div>
    </div>
  );
}
