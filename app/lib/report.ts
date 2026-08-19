import { jsPDF } from "jspdf";
import { EvalRun } from "@/app/context/EvalContext";

// ─── Constants ───────────────────────────────────────────────────────────────
const MARGIN = 18;
const PAGE_W = 210;
const PAGE_H = 297;
const CONTENT_W = PAGE_W - MARGIN * 2;

// Light palette (print-friendly)
const C = {
  bg: "#ffffff",
  ink: "#0f172a",
  muted: "#64748b",
  faint: "#f1f5f9",
  border: "#e2e8f0",
  pass: "#16a34a",
  fail: "#dc2626",
  accent: "#7c3aed",
  accentLight: "#ede9fe",
  warn: "#d97706",
  warnLight: "#fef3c7",
};

// ─── Helpers ─────────────────────────────────────────────────────────────────
function hex2rgb(hex: string): [number, number, number] {
  const h = hex.replace("#", "");
  return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)];
}

function setFill(pdf: jsPDF, hex: string) { pdf.setFillColor(...hex2rgb(hex)); }
function setDraw(pdf: jsPDF, hex: string) { pdf.setDrawColor(...hex2rgb(hex)); }
function setTextColor(pdf: jsPDF, hex: string) { pdf.setTextColor(...hex2rgb(hex)); }

function chip(pdf: jsPDF, x: number, y: number, label: string, bgHex: string, textHex: string) {
  setFill(pdf, bgHex);
  setDraw(pdf, bgHex);
  const w = pdf.getTextWidth(label) + 6;
  pdf.roundedRect(x, y - 4, w, 6, 1.5, 1.5, "F");
  setTextColor(pdf, textHex);
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(7);
  pdf.text(label, x + 3, y);
}

function addFooter(pdf: jsPDF, pageNum: number, totalPages: number, role: string) {
  const y = PAGE_H - 10;
  setTextColor(pdf, C.muted);
  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(7.5);
  pdf.text("Breach Pointer · TAI Labs", MARGIN, y);
  pdf.text(`${role} Workflow Evaluation Report`, PAGE_W / 2, y, { align: "center" });
  pdf.text(`Page ${pageNum} / ${totalPages}`, PAGE_W - MARGIN, y, { align: "right" });
  setDraw(pdf, C.border);
  pdf.setLineWidth(0.2);
  pdf.line(MARGIN, y - 4, PAGE_W - MARGIN, y - 4);
}

function sectionHeading(pdf: jsPDF, y: number, text: string): number {
  setTextColor(pdf, C.accent);
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(9);
  pdf.text(text.toUpperCase(), MARGIN, y);
  setDraw(pdf, C.accent);
  pdf.setLineWidth(0.5);
  pdf.line(MARGIN, y + 2, PAGE_W - MARGIN, y + 2);
  return y + 8;
}

function scoreLabel(score: number): string {
  if (score >= 90) return "Excellent";
  if (score >= 75) return "Good";
  if (score >= 50) return "Needs Work";
  return "At Risk";
}

function scoreColor(score: number): string {
  if (score >= 90) return C.pass;
  if (score >= 75) return "#16a34a";
  if (score >= 50) return C.warn;
  return C.fail;
}

// ─── PAGE 1: Cover ───────────────────────────────────────────────────────────
function addCoverPage(
  pdf: jsPDF,
  runs: EvalRun[],
  role: string,
  totalPages: number
) {
  const isRetest = runs.length >= 2;
  const latest = runs[runs.length - 1];
  const first = runs[0];
  const date = new Date(latest.timestamp).toLocaleDateString("en-GB", {
    day: "numeric", month: "long", year: "numeric",
  });

  // Header band
  setFill(pdf, C.ink);
  pdf.rect(0, 0, PAGE_W, 38, "F");

  setTextColor(pdf, "#ffffff");
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(11);
  pdf.text("BREACH POINTER", MARGIN, 15);
  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(8);
  pdf.text("TAI Labs · Workflow Evaluation Report", MARGIN, 22);
  pdf.setFontSize(7.5);
  pdf.text(`${role} Role · ${date}`, MARGIN, 29);

  // Score display
  let y = 55;
  setTextColor(pdf, C.ink);
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(52);
  const scoreStr = `${latest.score}`;
  pdf.text(scoreStr, MARGIN, y + 16);

  const numWidth = pdf.getTextWidth(scoreStr);
  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(18);
  setTextColor(pdf, C.muted);
  pdf.text("/100", MARGIN + numWidth + 2, y + 16);

  pdf.setFontSize(13);
  setTextColor(pdf, scoreColor(latest.score));
  pdf.setFont("helvetica", "bold");
  pdf.text(`— ${scoreLabel(latest.score)}`, MARGIN, y + 28);

  if (isRetest) {
    const delta = latest.score - first.score;
    const sign = delta >= 0 ? "+" : "";
    pdf.setFontSize(10);
    setTextColor(pdf, delta >= 0 ? C.pass : C.fail);
    pdf.text(`was ${first.score}/100  →  now ${latest.score}/100   ${sign}${delta} pts`, MARGIN, y + 40);
    y += 10;
  }

  // Pipeline gate
  y += 55;
  const passed = latest.score >= 75;
  setFill(pdf, passed ? "#dcfce7" : "#fee2e2");
  setDraw(pdf, passed ? C.pass : C.fail);
  pdf.setLineWidth(0.4);
  pdf.roundedRect(MARGIN, y, CONTENT_W, 18, 3, 3, "FD");
  setTextColor(pdf, passed ? C.pass : C.fail);
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(11);
  pdf.text(passed ? "✓  PIPELINE GATE: READY TO PROMOTE" : "✗  PIPELINE GATE: NOT READY", MARGIN + 5, y + 11);

  // Summary
  y += 30;
  y = sectionHeading(pdf, y, "Evaluation Summary");
  setTextColor(pdf, C.ink);
  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(9);
  const summaryLines = pdf.splitTextToSize(latest.summary || "No summary provided.", CONTENT_W);
  pdf.text(summaryLines, MARGIN, y);
  y += summaryLines.length * 5 + 8;

  // Stats row
  const stats = [
    { label: "Tests run", value: String(latest.results.length) },
    { label: "Passed", value: String(latest.results.filter(r => r.pass).length) },
    { label: "Failed", value: String(latest.results.filter(r => !r.pass).length) },
    { label: "Top fixes", value: String(latest.fixes.length) },
  ];
  const colW = CONTENT_W / stats.length;
  stats.forEach((s, i) => {
    const x = MARGIN + i * colW;
    setFill(pdf, C.faint);
    setDraw(pdf, C.border);
    pdf.setLineWidth(0.3);
    pdf.roundedRect(x, y, colW - 4, 18, 2, 2, "FD");
    setTextColor(pdf, C.accent);
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(16);
    pdf.text(s.value, x + (colW - 4) / 2, y + 10, { align: "center" });
    setTextColor(pdf, C.muted);
    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(7.5);
    pdf.text(s.label, x + (colW - 4) / 2, y + 16, { align: "center" });
  });

  addFooter(pdf, 1, totalPages, role);
}

// ─── PAGE 2: Category Breakdown ──────────────────────────────────────────────
function addCategoryPage(pdf: jsPDF, runs: EvalRun[], role: string, totalPages: number) {
  const latest = runs[runs.length - 1];
  const categories = Object.entries(latest.category_scores ?? {});

  let y = MARGIN;
  y = sectionHeading(pdf, y, "Category Breakdown");

  if (categories.length === 0) {
    setTextColor(pdf, C.muted);
    pdf.setFont("helvetica", "italic");
    pdf.setFontSize(9);
    pdf.text("No category data available for this run.", MARGIN, y + 8);
  } else {
    categories.forEach(([cat, data]) => {
      const pct = data.total > 0 ? Math.round((data.pass / data.total) * 100) : 100;
      const label = cat.replace(/_/g, " ");
      const barW = CONTENT_W - 60;

      // Row bg
      setFill(pdf, C.faint);
      pdf.rect(MARGIN, y - 1, CONTENT_W, 9, "F");

      // Category name
      setTextColor(pdf, C.ink);
      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(8.5);
      pdf.text(label.charAt(0).toUpperCase() + label.slice(1), MARGIN + 2, y + 5.5);

      // Score text
      pdf.setFont("helvetica", "bold");
      setTextColor(pdf, pct >= 75 ? C.pass : pct >= 50 ? C.warn : C.fail);
      pdf.text(`${pct}%`, MARGIN + CONTENT_W - 10, y + 5.5, { align: "right" });
      pdf.text(`${data.pass}/${data.total}`, MARGIN + CONTENT_W - 22, y + 5.5, { align: "right" });

      // Bar track
      const barX = MARGIN + CONTENT_W * 0.38;
      const barY = y + 2.5;
      const barH = 4;
      setFill(pdf, C.border);
      pdf.roundedRect(barX, barY, barW * 0.6, barH, 1.5, 1.5, "F");
      setFill(pdf, pct >= 75 ? C.pass : pct >= 50 ? C.warn : C.fail);
      pdf.roundedRect(barX, barY, (barW * 0.6 * pct) / 100, barH, 1.5, 1.5, "F");

      y += 12;
    });
  }

  // Top fixes
  y += 6;
  y = sectionHeading(pdf, y, "Recommended Fixes");
  (latest.fixes ?? []).slice(0, 5).forEach((fix, i) => {
    setTextColor(pdf, C.ink);
    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(8.5);
    const lines = pdf.splitTextToSize(`${i + 1}.  ${fix}`, CONTENT_W - 4);
    pdf.text(lines, MARGIN + 2, y);
    y += lines.length * 5 + 2;
  });

  addFooter(pdf, 2, totalPages, role);
}

// ─── PAGE 3: Prompt (single or diff) ─────────────────────────────────────────
function addPromptPage(pdf: jsPDF, runs: EvalRun[], role: string, totalPages: number) {
  const isRetest = runs.length >= 2;
  let y = MARGIN;

  if (!isRetest) {
    y = sectionHeading(pdf, y, "Original Prompt");
    const lines = pdf.splitTextToSize(runs[0].prompt, CONTENT_W - 4);
    setFill(pdf, C.faint);
    pdf.rect(MARGIN, y, CONTENT_W, Math.min(lines.length * 4.8 + 6, PAGE_H - y - 20), "F");
    y += 4;
    setTextColor(pdf, C.ink);
    pdf.setFont("courier", "normal");
    pdf.setFontSize(7.5);
    const maxLines = Math.floor((PAGE_H - y - 25) / 4.8);
    pdf.text(lines.slice(0, maxLines), MARGIN + 2, y);
    y += Math.min(lines.length, maxLines) * 4.8 + 6;
    if (lines.length > maxLines) {
      setTextColor(pdf, C.muted);
      pdf.setFontSize(7);
      pdf.text("[Prompt truncated — copy from editor for full text]", MARGIN + 2, y);
    }
  } else {
    const colW = CONTENT_W / 2 - 3;

    // Left: original
    y = sectionHeading(pdf, y, "Original Prompt");
    const origLines = pdf.splitTextToSize(runs[0].prompt, colW - 4);
    setFill(pdf, "#fff1f2");
    setDraw(pdf, "#fecaca");
    pdf.setLineWidth(0.3);
    pdf.roundedRect(MARGIN, y, colW, 180, 2, 2, "FD");
    setTextColor(pdf, C.ink);
    pdf.setFont("courier", "normal");
    pdf.setFontSize(7);
    const maxL = 36;
    pdf.text(origLines.slice(0, maxL), MARGIN + 3, y + 5);

    // Right: improved
    const rx = MARGIN + colW + 6;
    setTextColor(pdf, C.accent);
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(9);
    pdf.text("IMPROVED PROMPT", rx, y);
    setDraw(pdf, C.accent);
    pdf.setLineWidth(0.5);
    pdf.line(rx, y + 2, rx + colW, y + 2);
    y += 8;
    const improvedLines = pdf.splitTextToSize(runs[runs.length - 1].prompt, colW - 4);
    setFill(pdf, "#f0fdf4");
    setDraw(pdf, "#bbf7d0");
    pdf.setLineWidth(0.3);
    pdf.roundedRect(rx, y - 8, colW, 180, 2, 2, "FD");
    pdf.setFont("courier", "normal");
    pdf.setFontSize(7);
    setTextColor(pdf, C.ink);
    pdf.text(improvedLines.slice(0, maxL), rx + 3, y - 3);

    if (origLines.length > maxL || improvedLines.length > maxL) {
      setTextColor(pdf, C.muted);
      pdf.setFontSize(6.5);
      pdf.text("[Truncated — see editor for full diff]", MARGIN, y + 178);
    }
  }

  addFooter(pdf, 3, totalPages, role);
}

// ─── PAGE 4: Failed Tests ─────────────────────────────────────────────────────
function addFailuresPage(pdf: jsPDF, runs: EvalRun[], role: string, totalPages: number) {
  const isRetest = runs.length >= 2;
  const latest = runs[runs.length - 1];
  const failures = latest.results.filter(r => !r.pass);

  let y = MARGIN;
  y = sectionHeading(pdf, y, isRetest ? "Failures — Before vs After Retest" : "Failed Tests");

  if (failures.length === 0) {
    setFill(pdf, "#dcfce7");
    setDraw(pdf, C.pass);
    pdf.setLineWidth(0.4);
    pdf.roundedRect(MARGIN, y, CONTENT_W, 14, 3, 3, "FD");
    setTextColor(pdf, C.pass);
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(10);
    pdf.text("✓  All tests passed — no failures to report.", MARGIN + 5, y + 9);
    addFooter(pdf, 4, totalPages, role);
    return;
  }

  // Column headers for retest mode
  if (isRetest) {
    const firstFailIds = new Set(runs[0].results.filter(r => !r.pass).map(r => r.id));
    const fixedIds = new Set(latest.results.filter(r => r.pass && firstFailIds.has(r.id)).map(r => r.id));

    setTextColor(pdf, C.muted);
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(7.5);
    pdf.text("CATEGORY + SEVERITY", MARGIN, y);
    pdf.text("FIRST RUN", MARGIN + 90, y);
    pdf.text("AFTER RETEST", MARGIN + 128, y);
    y += 5;

    runs[0].results.filter(r => !r.pass).forEach(fail => {
      if (y > PAGE_H - 30) return;
      const nowResult = latest.results.find(r => r.id === fail.id);
      const isFixed = nowResult?.pass === true;

      setFill(pdf, C.faint);
      pdf.rect(MARGIN, y, CONTENT_W, 10, "F");

      setTextColor(pdf, C.ink);
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(8);
      const cat = fail.category.replace(/_/g, " ");
      pdf.text(cat.charAt(0).toUpperCase() + cat.slice(1), MARGIN + 2, y + 6.5);

      chip(pdf, MARGIN + 72, y + 4, (fail.severity_if_fail ?? fail.severity).toUpperCase(), isFixed ? "#e0f2fe" : "#fee2e2", isFixed ? "#0369a1" : C.fail);

      chip(pdf, MARGIN + 90, y + 4, "FAILED", "#fee2e2", C.fail);

      chip(pdf, MARGIN + 128, y + 4, isFixed ? "✓ FIXED" : "✗ STILL FAILING", isFixed ? "#dcfce7" : "#fee2e2", isFixed ? C.pass : C.fail);

      y += 13;
    });
  } else {
    failures.forEach(fail => {
      if (y > PAGE_H - 40) return;

      const cat = fail.category.replace(/_/g, " ");
      setFill(pdf, C.faint);
      pdf.rect(MARGIN, y, CONTENT_W, 22, "F");

      setTextColor(pdf, C.ink);
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(8.5);
      pdf.text(cat.charAt(0).toUpperCase() + cat.slice(1), MARGIN + 2, y + 6);

      chip(pdf, MARGIN + 80, y + 3, (fail.severity_if_fail ?? fail.severity).toUpperCase(), "#fee2e2", C.fail);
      chip(pdf, MARGIN + 100, y + 3, (fail.failure_type ?? "").replace(/_/g, " ").toUpperCase(), "#fef3c7", C.warn);

      setTextColor(pdf, C.muted);
      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(7.5);
      const reasonLines = pdf.splitTextToSize(fail.reason ?? "", CONTENT_W - 4);
      pdf.text(reasonLines.slice(0, 2), MARGIN + 2, y + 13);

      y += 26;
    });
  }

  addFooter(pdf, 4, totalPages, role);
}

// ─── PAGE 5: Next Steps + Footer ─────────────────────────────────────────────
function addNextStepsPage(
  pdf: jsPDF,
  runs: EvalRun[],
  role: string,
  totalPages: number
) {
  const latest = runs[runs.length - 1];
  const passed = latest.score >= 75;
  let y = MARGIN;

  y = sectionHeading(pdf, y, "Next Steps");

  const steps = [
    passed
      ? "✓  All critical gates passed — workflow is clear for promotion."
      : "□  Review failed tests and apply suggested fixes in Eval Coach.",
    passed
      ? "□  Schedule a team review of the passed test cases before go-live."
      : "□  Retest after applying fixes to confirm score improvement.",
    "□  Share this report with your manager for workflow promotion approval.",
    `□  Submit for ${passed ? "Testing → Validated" : "Testing → Validated"} stage promotion.`,
    "□  Ensure all stakeholders acknowledge the pipeline gate verdict.",
  ];

  steps.forEach((step) => {
    setFill(pdf, C.faint);
    setDraw(pdf, C.border);
    pdf.setLineWidth(0.3);
    pdf.roundedRect(MARGIN, y, CONTENT_W, 10, 2, 2, "FD");
    setTextColor(pdf, C.ink);
    pdf.setFont("helvetica", passed && step.startsWith("✓") ? "bold" : "normal");
    pdf.setFontSize(9);
    pdf.text(step, MARGIN + 5, y + 6.5);
    y += 14;
  });

  // Accepted suggestions block
  if (runs[runs.length - 1].acceptedSuggestions?.length > 0) {
    y += 4;
    y = sectionHeading(pdf, y, "Accepted Fixes");
    runs[runs.length - 1].acceptedSuggestions.forEach((s, i) => {
      setTextColor(pdf, C.ink);
      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(8);
      const lines = pdf.splitTextToSize(`${i + 1}. ${s}`, CONTENT_W - 6);
      pdf.text(lines, MARGIN + 3, y);
      y += lines.length * 4.8 + 3;
    });
  }

  // Branding box at bottom
  const boxY = PAGE_H - 42;
  setFill(pdf, C.ink);
  pdf.rect(MARGIN, boxY, CONTENT_W, 24, "F");
  setTextColor(pdf, "#ffffff");
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(9);
  pdf.text("Breach Pointer", MARGIN + 6, boxY + 8);
  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(7.5);
  pdf.text("AI Workflow Adversarial Testing Platform · TAI Labs", MARGIN + 6, boxY + 14);
  setTextColor(pdf, "#94a3b8");
  pdf.setFontSize(7);
  pdf.text(`Session exported ${new Date().toISOString()}`, MARGIN + 6, boxY + 20);

  addFooter(pdf, 5, totalPages, role);
}

// ─── Public entry point ────────────────────────────────────────────────────────
export function generateReport(evalHistory: EvalRun[], role: string) {
  const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const totalPages = 5;

  // Page 1 — Cover
  addCoverPage(pdf, evalHistory, role, totalPages);

  // Page 2 — Categories
  pdf.addPage();
  addCategoryPage(pdf, evalHistory, role, totalPages);

  // Page 3 — Prompt
  pdf.addPage();
  addPromptPage(pdf, evalHistory, role, totalPages);

  // Page 4 — Failures
  pdf.addPage();
  addFailuresPage(pdf, evalHistory, role, totalPages);

  // Page 5 — Next Steps
  pdf.addPage();
  addNextStepsPage(pdf, evalHistory, role, totalPages);

  const date = new Date().toISOString().slice(0, 10);
  pdf.save(`breach-pointer-${role.toLowerCase().replace(/\s+/g, "-")}-${date}.pdf`);
}
