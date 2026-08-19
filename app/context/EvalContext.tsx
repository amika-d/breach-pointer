"use client";
import React, { createContext, useContext, useState, ReactNode, useEffect } from "react";
import { TestResult } from "@/components/TestResults";
import { AttackCategory, InlineSuggestion } from "@/app/lib/types";

export type ScoreData = {
  score: number;
  passed: number;
  failed: number;
  summary: string;
  fixes: string[];
};

export type EvalRun = {
  prompt: string;
  score: number;
  results: TestResult[];
  fixes: string[];
  summary: string;
  category_scores: Record<AttackCategory, { pass: number; total: number }>;
  acceptedSuggestions: string[];
  timestamp: number;
};

interface EvalContextType {
  selectedRole: string;
  setSelectedRole: (role: string) => void;
  prompt: string;
  setPrompt: (prompt: string) => void;
  testCount: number;
  setTestCount: (count: number) => void;

  allTests: TestResult[];
  setAllTests: (tests: TestResult[]) => void;
  initialTests: TestResult[];
  setInitialTests: (tests: TestResult[]) => void;

  scoreData: ScoreData | null;
  setScoreData: (data: ScoreData | null) => void;
  previousScoreData: ScoreData | null;
  setPreviousScoreData: (data: ScoreData | null) => void;

  evalHistory: EvalRun[];
  pushEvalRun: (run: EvalRun) => void;

  suggestions: InlineSuggestion[];
  setSuggestions: (s: InlineSuggestion[]) => void;
  appliedFixes: Set<number>;
  setAppliedFixes: React.Dispatch<React.SetStateAction<Set<number>>>;
  fixedPrompt: string;
  setFixedPrompt: (p: string) => void;

  resetEval: () => void;
  isHydrated: boolean;
}

const EvalContext = createContext<EvalContextType | undefined>(undefined);

export function EvalProvider({ children }: { children: ReactNode }) {
  const [selectedRole, setSelectedRole] = useState("");
  const [prompt, setPrompt] = useState("");
  const [testCount, setTestCount] = useState(10);

  const [allTests, setAllTests] = useState<TestResult[]>([]);
  const [initialTests, setInitialTests] = useState<TestResult[]>([]);

  const [scoreData, setScoreData] = useState<ScoreData | null>(null);
  const [previousScoreData, setPreviousScoreData] = useState<ScoreData | null>(null);

  const [suggestions, setSuggestions] = useState<InlineSuggestion[]>([]);
  const [appliedFixes, setAppliedFixes] = useState<Set<number>>(new Set());
  const [fixedPrompt, setFixedPrompt] = useState("");
  const [evalHistory, setEvalHistory] = useState<EvalRun[]>([]);
  const [isHydrated, setIsHydrated] = useState(false);

  const pushEvalRun = (run: EvalRun) =>
    setEvalHistory((prev) => [...prev, run]);

  useEffect(() => {
    const saved = sessionStorage.getItem("stress_tester_eval");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.selectedRole) setSelectedRole(parsed.selectedRole);
        if (parsed.prompt) setPrompt(parsed.prompt);
        if (parsed.testCount) setTestCount(parsed.testCount);
        if (parsed.allTests) setAllTests(parsed.allTests);
        if (parsed.initialTests) setInitialTests(parsed.initialTests);
        if (parsed.scoreData) setScoreData(parsed.scoreData);
        if (parsed.previousScoreData) setPreviousScoreData(parsed.previousScoreData);
        if (parsed.suggestions) setSuggestions(parsed.suggestions);
        if (parsed.appliedFixes) setAppliedFixes(new Set(parsed.appliedFixes));
        if (parsed.fixedPrompt) setFixedPrompt(parsed.fixedPrompt);
        if (parsed.evalHistory) setEvalHistory(parsed.evalHistory);
      } catch (e) {
        console.error("Failed to parse session storage", e);
      }
    }
    setIsHydrated(true);
  }, []);

  useEffect(() => {
    if (!isHydrated) return;
    const dataToSave = {
      selectedRole, prompt, testCount,
      allTests, initialTests, scoreData,
      previousScoreData, suggestions, 
      appliedFixes: Array.from(appliedFixes), 
      fixedPrompt, evalHistory
    };
    sessionStorage.setItem("stress_tester_eval", JSON.stringify(dataToSave));
  }, [
    isHydrated,
    selectedRole, prompt, testCount,
    allTests, initialTests, scoreData,
    previousScoreData, suggestions, appliedFixes, fixedPrompt, evalHistory
  ]);

  const resetEval = () => {
    setSelectedRole("");
    setPrompt("");
    setTestCount(10);
    setAllTests([]);
    setInitialTests([]);
    setScoreData(null);
    setPreviousScoreData(null);
    setSuggestions([]);
    setAppliedFixes(new Set());
    setFixedPrompt("");
    setEvalHistory([]);
    sessionStorage.removeItem("stress_tester_eval");
  };

  return (
    <EvalContext.Provider value={{
      selectedRole, setSelectedRole,
      prompt, setPrompt,
      testCount, setTestCount,
      allTests, setAllTests,
      initialTests, setInitialTests,
      scoreData, setScoreData,
      previousScoreData, setPreviousScoreData,
      suggestions, setSuggestions,
      appliedFixes, setAppliedFixes,
      fixedPrompt, setFixedPrompt,
      evalHistory, pushEvalRun,
      resetEval,
      isHydrated
    }}>
      {children}
    </EvalContext.Provider>
  );
}

export function useEvalContext() {
  const context = useContext(EvalContext);
  if (!context) {
    throw new Error("useEvalContext must be used within an EvalProvider");
  }
  return context;
}
