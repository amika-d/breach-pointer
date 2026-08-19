'use client'

import Link from 'next/link'
import Image from 'next/image'
import { ArrowRight, Check, CircleAlert, Shield, X } from 'lucide-react'

const attacks = [
  ['Prompt injection', 'Attempts to override your instructions', 'border-l-red-400'],
  ['Social engineering', 'Authority claims, urgency, manipulation', 'border-l-orange-400'],
  ['Data extraction', 'Attempts to reveal internal rules', 'border-l-red-400'],
  ['Jailbreak', 'Roleplay framing to bypass restrictions', 'border-l-violet-400'],
  ['Scope violation', "Requests outside your workflow's purpose", 'border-l-yellow-400'],
  ['Ambiguity exploit', 'Vague inputs that expose prompt gaps', 'border-l-sky-400'],
]

const steps = [
  ['01', 'Paste your workflow instructions', 'From Claude Skills, n8n, Make, Zapier, or TAI\\\'s workflow builder. Any AI instruction set works.'],
  ['02', 'We attack it', 'Real adversarial tests across 6 categories: social engineering, prompt injection, jailbreaks, data extraction, scope violations, and ambiguity exploits.'],
  ['03', 'Fix it inline', 'Suggestions tied to each specific failure. Accept, edit, or ignore. Retest and watch your score climb.'],
]

export default function Page() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-background text-foreground"><div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_18%_8%,oklch(0.68_0.2_290_/_0.16),transparent_28%),radial-gradient(circle_at_86%_18%,oklch(0.78_0.14_205_/_0.12),transparent_25%)]" /><div className="relative">
      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        <header className="flex items-center justify-between border-b border-white/[0.06] py-5">
          <Link href="/" className="flex items-center gap-3"><Image src="/logo-2.png" alt="Breach Pointer Eval Coach" width={32} height={32} className="rounded-md object-contain" /><span className="text-sm font-semibold tracking-tight">Breach Pointer <span className="font-normal text-white/35">· Eval Coach</span></span></Link>
          <Link href="/workflows" className="rounded-md bg-violet-500 px-4 py-2 text-xs font-medium transition hover:bg-violet-400">Test your workflow <ArrowRight className="ml-1 inline size-3.5" /></Link>
        </header>

        <section className="mx-auto max-w-4xl py-24 text-center sm:py-32"><div className="mb-7 inline-flex items-center gap-2 rounded-full border border-violet-400/20 bg-violet-400/[0.08] px-3 py-1.5 text-[11px] text-violet-200"><span className="size-1.5 rounded-full bg-violet-400" /> Powered by Claude · Official TAI Labs Tool</div><h1 className="text-balance text-5xl font-semibold tracking-[-0.06em] text-white sm:text-7xl">Your AI workflow passed your tests.<br /><span className="text-violet-400">It won&apos;t pass your users&apos;.</span></h1><p className="mx-auto mt-7 max-w-2xl text-pretty text-base leading-7 text-white/50 sm:text-lg">Eval Coach runs real adversarial attacks against your Claude Skills and workflow prompts — and coaches you through exactly where they break before your team ships it.</p><div className="mt-9 flex flex-col justify-center gap-3 sm:flex-row"><Link href="/workflows" className="rounded-md bg-violet-500 px-5 py-3 text-sm font-medium transition hover:bg-violet-400">Test your workflow free <ArrowRight className="ml-1 inline size-4" /></Link><a href="#how-it-works" className="rounded-md border border-white/10 px-5 py-3 text-sm text-white/70 transition hover:border-white/20 hover:text-white">See how it works</a></div></section>

        <section className="grid rounded-2xl border border-white/10 bg-white/[0.045] shadow-2xl shadow-violet-950/20 backdrop-blur-xl sm:grid-cols-3"><div className="border-b border-white/[0.06] p-6 sm:border-b-0 sm:border-r"><p className="text-3xl font-semibold tracking-tight">63 / 100</p><p className="mt-2 text-xs leading-5 text-white/40">Average output eval score across TAI client base</p></div><div className="border-b border-white/[0.06] p-6 sm:border-b-0 sm:border-r"><p className="text-3xl font-semibold tracking-tight">6 categories</p><p className="mt-2 text-xs leading-5 text-white/40">Prompt injection, jailbreaks, social engineering and more</p></div><div className="p-6"><p className="text-3xl font-semibold tracking-tight">Testing <span className="text-violet-400">→</span> Validated</p><p className="mt-2 text-xs leading-5 text-white/40">The exact pipeline gate this tool sits at</p></div></section>

        <section className="grid gap-14 py-28 lg:grid-cols-[0.85fr_1.15fr] lg:items-center"><div><p className="mb-4 font-mono text-[10px] uppercase tracking-[0.25em] text-violet-400">Why this exists</p><h2 className="text-balance text-4xl font-semibold tracking-[-0.05em] sm:text-5xl">TAI teams build well. They don&apos;t eval.</h2><p className="mt-6 text-sm leading-7 text-white/50">TAI&apos;s own quarterly reports show output evaluation is the weakest dimension across client teams — scoring 63/100 on average. Workflows move from Testing to Validated with no systematic safety check. Eval Coach is that check.</p></div><div className="rounded-2xl border border-white/10 bg-white/[0.045] shadow-2xl shadow-violet-950/20 backdrop-blur-xl p-6"><p className="mb-6 font-mono text-[10px] uppercase tracking-widest text-white/35">TAI workflow pipeline</p><div className="flex flex-wrap items-center gap-2 text-xs text-white/45">{['Identified', 'Scoped', 'Testing'].map((item) => <span key={item} className="rounded border border-white/10 px-3 py-2">{item}</span>)}<ArrowRight className="size-4 text-red-400" /><span className="rounded border border-violet-400/40 bg-violet-400/10 px-3 py-2 text-violet-200">Validated</span><span className="text-[10px] text-red-300">← you are here</span><ArrowRight className="size-4 text-white/20" />{['Adopted', 'Scaled'].map((item) => <span key={item} className="rounded border border-white/10 px-3 py-2">{item}</span>)}</div><div className="mt-8 flex items-center gap-3 border-t border-white/[0.06] pt-5 text-xs text-red-300"><X className="size-4" /> No tooling here</div></div></section>

        <section id="how-it-works" className="border-t border-white/[0.06] py-28"><div className="mb-12 max-w-xl"><p className="mb-4 font-mono text-[10px] uppercase tracking-[0.25em] text-violet-400">How it works</p><h2 className="text-4xl font-semibold tracking-[-0.05em] sm:text-5xl">A test loop built for real workflows.</h2></div><div className="grid gap-4 md:grid-cols-3">{steps.map(([number, title, body]) => <article key={number} className="rounded-2xl border border-white/10 bg-white/[0.045] shadow-2xl shadow-violet-950/20 backdrop-blur-xl p-6"><span className="font-mono text-xs text-violet-400">{number}</span><h3 className="mt-12 text-lg font-medium">{title}</h3><p className="mt-3 text-sm leading-6 text-white/45">{body}</p></article>)}</div></section>

        <section className="rounded-2xl border border-white/10 bg-white/[0.045] shadow-2xl shadow-violet-950/20 backdrop-blur-xl px-6 py-16 text-center sm:px-12"><span className="text-5xl text-violet-400">“</span><blockquote className="mx-auto mt-4 max-w-3xl text-2xl font-medium leading-9 tracking-tight sm:text-3xl">Require a documented evaluation step on every Testing → Validated promotion.</blockquote><p className="mt-6 text-xs text-white/35">— TAI Labs QBR Report · Modern Health · August 2026</p><p className="mt-8 text-sm text-violet-300">Eval Coach is that step.</p></section>

        <section className="py-28"><div className="mb-10"><p className="mb-4 font-mono text-[10px] uppercase tracking-[0.25em] text-violet-400">What we test</p><h2 className="text-4xl font-semibold tracking-[-0.05em] sm:text-5xl">Every failure has a name.</h2></div><div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{attacks.map(([title, body, border]) => <article key={title} className={`border border-white/[0.06] border-l-2 ${border} bg-[#111118] p-5`}><h3 className="text-sm font-medium">{title}</h3><p className="mt-2 text-sm leading-6 text-white/40">{body}</p></article>)}</div></section>

        <section className="border-t border-white/[0.06] py-28 text-center"><Shield className="mx-auto size-7 text-violet-400" /><h2 className="mt-6 text-4xl font-semibold tracking-[-0.05em] sm:text-5xl">Ready to certify your workflow?</h2><p className="mt-4 text-sm text-white/45">Paste your instructions. Get a score. Fix what breaks.</p><Link href="/workflows" className="mt-8 inline-flex rounded-md bg-violet-500 px-6 py-3 text-sm font-medium transition hover:bg-violet-400">Run your first eval free <ArrowRight className="ml-2 size-4" /></Link><p className="mt-4 text-[11px] text-white/30">No signup. No install. Paste and run.</p></section>

        <footer className="flex flex-col justify-between gap-3 border-t border-white/[0.06] py-6 text-xs text-white/30 sm:flex-row"><span>Eval Coach · TAI Labs</span><span className="flex items-center gap-2"><Check className="size-3 text-violet-400" /> Built for safer AI workflows</span></footer>
      </div>
    </div></main>
  )
}
