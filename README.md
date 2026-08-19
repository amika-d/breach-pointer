# Breach Pointer (v1)

**Red-team your guardrails.** Breach Pointer is an adversarial stress-testing platform designed to evaluate, break, and fix long-form AI workflow prompts.

<p align="center">
  <img src="public/screenshot-1.png" width="49%" alt="Eval Dashboard" />
  <img src="public/screenshot-2.png" width="49%" alt="Refine Workspace" />
</p>
## Features

- **Automated Adversarial Testing:** Automatically generates highly targeted attacks against your prompt based on specific categories (Jailbreaks, Social Engineering, Tool Misuse, PII Extraction, Authority Overrides).
- **LLM-as-a-Judge Scoring:** Evaluates the AI's response to adversarial inputs, scores the resilience of your prompt, and categorizes failures by severity.
- **Pipeline Gate:** Provides a clear pass/fail score to determine if a workflow is safe to ship to production.
- **Inline Fix Editor:** When a prompt fails, Breach Pointer generates specific, line-by-line code suggestions. Use the dual-pane code editor to preview fixes and apply them directly to your draft.

## Tech Stack

- **Framework:** [Next.js](https://nextjs.org/) (App Router) v16.3
- **UI & Styling:** React 19, [Tailwind CSS v4](https://tailwindcss.com/), `lucide-react`
- **AI Integration:** OpenRouter API (`@openrouter/ai-sdk-provider`)

## Getting Started

1. **Clone the repository and install dependencies**
   We recommend using `pnpm` as the package manager.
   ```bash
   pnpm install
   ```

2. **Configure Environment Variables**
   Create a `.env.local` file in the root directory. You will need an OpenRouter API key.
   ```env
   OPENROUTER_API_KEY=your_openrouter_api_key_here
   NEXT_PUBLIC_APP_URL=http://localhost:3000
   ```

3. **Run the Development Server**
   ```bash
   pnpm dev
   ```
   Open [http://localhost:3000](http://localhost:3000) in your browser.

## How it Works (The V1 Loop)

1. **Configure:** Enter the target role (e.g., "Sales Agent") and your current system prompt/workflow instructions.
2. **Attack:** The system generates adversarial payloads explicitly designed to break the rules you defined.
3. **Judge:** The models process the attacks and are evaluated by a judging agent on a Pass/Fail rubric.
4. **Fix:** Navigate to the Refine Workspace editor. Review the generated inline suggestions (add, replace, or remove lines) and apply them to build a stronger prompt.
5. **Retest:** Run the exact same attacks against your patched prompt to verify your new guardrails hold.

## License

Private / Confidential.
