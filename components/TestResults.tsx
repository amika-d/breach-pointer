"use client";
import React, { useState } from "react";

export type TestResult = {
  id: number;
  category: string;
  input: string;
  severity: string;
  rationale: string;
  response?: string;
  pass?: boolean;
  reason?: string;
  severity_if_fail?: string;
};

interface Props {
  tests: TestResult[];
  fixes: string[];
  onReset: () => void;
}

type Filter = "all" | "pass" | "fail";

export default function TestResults({ tests, fixes, onReset }: Props) {
  const [filter, setFilter] = useState<Filter>("all");
  const [openIds, setOpenIds] = useState<Set<number>>(new Set());

  const toggle = (id: number) => {
    const next = new Set(openIds);
    next.has(id) ? next.delete(id) : next.add(id);
    setOpenIds(next);
  };

  const filtered = tests.filter((t) =>
    filter === "all" ? true : filter === "pass" ? t.pass : !t.pass
  );

  const passCount = tests.filter(t => t.pass).length;
  const failCount = tests.length - passCount;

  return (
    <>
      {fixes.length > 0 && (
        <div className="fixes-card">
          <h3>⚡ How to strengthen your prompt</h3>
          {fixes.map((fix, i) => (
            <div key={i} className="fix-item">
              <div className="fix-num">{i + 1}</div>
              <div className="fix-text">{fix}</div>
            </div>
          ))}
        </div>
      )}

      <div className="results-card">
        <div className="results-header">
          <h3>Test Results</h3>
          <div className="filter-tabs">
            {(["all", "fail", "pass"] as Filter[]).map((f) => (
              <button
                key={f}
                className={`filter-tab${filter === f ? " active" : ""}`}
                onClick={() => setFilter(f)}
              >
                {f === "all" ? `All (${tests.length})` : f === "fail" ? `Failed (${failCount})` : `Passed (${passCount})`}
              </button>
            ))}
          </div>
        </div>

        {filtered.map((t, idx) => (
          <div key={idx} className="test-item">
            <div className="test-header" onClick={() => toggle(t.id)}>
              <span className={`test-badge ${t.pass ? "badge-pass" : "badge-fail"}`}>
                {t.pass ? "PASS" : "FAIL"}
              </span>
              <div className="test-content">
                <div className="test-category">{t.category.replace(/_/g, " ")}</div>
                <div className="test-input">{t.input}</div>
              </div>
              {!t.pass && (
                <span className={`test-severity sev-${t.severity_if_fail || "medium"}`}>
                  {(t.severity_if_fail || "medium").toUpperCase()}
                </span>
              )}
            </div>
            <div className={`test-expand${openIds.has(t.id) ? " open" : ""}`}>
              <div className="expand-section">
                <div className="expand-label">Adversarial Input</div>
                <div className="expand-mono">{t.input}</div>
              </div>
              <div className="expand-section">
                <div className="expand-label">Workflow Response</div>
                <div className="expand-mono">{t.response}</div>
              </div>
              <div className="expand-section">
                <div className="expand-label">Verdict</div>
                <div className="expand-text">{t.reason}</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <button className="reset-btn" onClick={onReset}>← Test another prompt</button>
    </>
  );
}
