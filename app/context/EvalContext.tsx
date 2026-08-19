"use client";
import React, { createContext, useContext, useState, ReactNode, useEffect } from "react";
import { TestResult } from "@/components/TestResults";
import { InlineSuggestion } from "@/app/lib/types";

export type ScoreData = {
  score: number;
  passed: number;
  failed: number;
  summary: string;
  fixes: string[];
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

  suggestions: InlineSuggestion[];
  setSuggestions: (s: InlineSuggestion[]) => void;
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
  const [fixedPrompt, setFixedPrompt] = useState("");
  const [isHydrated, setIsHydrated] = useState(false);

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
        if (parsed.fixedPrompt) setFixedPrompt(parsed.fixedPrompt);
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
      previousScoreData, suggestions, fixedPrompt
    };
    sessionStorage.setItem("stress_tester_eval", JSON.stringify(dataToSave));
  }, [
    isHydrated,
    selectedRole, prompt, testCount,
    allTests, initialTests, scoreData,
    previousScoreData, suggestions, fixedPrompt
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
    setFixedPrompt("");
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
      fixedPrompt, setFixedPrompt,
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
