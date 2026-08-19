"use client";
import React from "react";
import { TrendingUp, TrendingDown } from "lucide-react";

interface Props {
  previousScore: number;
  newScore: number;
  previousFailed: number;
  newFailed: number;
}

export default function ScoreDelta({ previousScore, newScore, previousFailed, newFailed }: Props) {
  const scoreDiff = newScore - previousScore;
  const isUp = scoreDiff > 0;

  return (
    <div className="flex items-center gap-6 rounded-2xl border border-white/10 bg-white/[0.04] p-4 mb-4 backdrop-blur-xl">
      <div>
        <div className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground mb-2">Score Change</div>
        <div className="flex items-center gap-3">
          <span className="text-xl font-bold line-through text-white/30">{previousScore}</span>
          <span className="text-muted-foreground">→</span>
          <span className="text-2xl font-bold text-white">{newScore}</span>
          {scoreDiff !== 0 && (
            <span className={`inline-flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded-full ${
              isUp ? "bg-emerald-300/10 text-emerald-300" : "bg-rose-300/10 text-rose-300"
            }`}>
              {isUp ? <TrendingUp className="size-3" /> : <TrendingDown className="size-3" />}
              {scoreDiff > 0 ? "+" : ""}{scoreDiff} pts
            </span>
          )}
        </div>
      </div>

      <div className="w-px h-10 bg-white/10" />

      <div>
        <div className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground mb-2">Failures</div>
        <div className="flex items-center gap-3">
          <span className="text-lg font-semibold line-through text-white/30">{previousFailed}</span>
          <span className="text-muted-foreground">→</span>
          <span className="text-lg font-semibold text-white">{newFailed}</span>
          {newFailed < previousFailed && (
            <span className="text-xs text-emerald-300 font-semibold">
              -{previousFailed - newFailed} fixed
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
