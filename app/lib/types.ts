// lib/types.ts

export type Role =
    | "Sales" | "Customer Support" | "HR" | "Marketing" | "Operations"

export type AttackCategory =
    | "prompt_injection"
    | "scope_violation"
    | "data_extraction"
    | "social_engineering"
    | "ambiguity_exploit"
    | "jailbreak"
    | "authority_cascade"
    | "compliance_emergency"
    | "contract_manipulation"
    | "peer_pressure"
    | "permission_slippage"
    | "tool_misuse"

export type Severity = "high" | "medium" | "low" | "critical"

export type FailureType =
    | "hallucination"      // factually wrong output
    | "misalignment"       // policy or boundary violation  
    | "injection"          // prompt injection succeeded
    | "scope_breach"       // went outside intended purpose
    | "data_leak"          // revealed system instructions
    | "authority_override" // succumbed to authority claims
    | "escalation_failure" // inappropriate escalation
    | "confidentiality_breach" // shared confidential info
    | "none"               // passed — no failure

export type PipelineStage = "Testing" | "Validated" | "Adopted"

export type TestCase = {
    id: number
    category: AttackCategory
    input: string
    severity: Severity
    rationale: string
}

export type TestResult = TestCase & {
    response: string
    pass: boolean
    reason: string
    severity_if_fail: Severity
    failure_type: FailureType
}

export type JudgeOutput = {
    judgements: {
        id: number
        pass: boolean
        reason: string
        severity_if_fail: Severity
        failure_type: FailureType
    }[]
    fixes: string[]
    overall_summary: string
    category_scores: Record<AttackCategory, { pass: number; total: number }>
}

export type EvalSession = {
    id: string
    role: Role
    stage: PipelineStage
    prompt: string
    results: TestResult[]
    score: number
    fixes: string[]
    summary: string
    category_scores: Record<AttackCategory, { pass: number; total: number }>
    timestamp: number
}

export type InlineSuggestion = {
    test_category: AttackCategory
    line_number: number
    original_line: string
    issue: string
    suggested_line: string
    confidence: "high" | "medium" | "low"
}