'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { ArrowUpRight, ArrowRight, ShieldCheck, Shield, X, Check } from 'lucide-react'

const attacks = [
  ['Prompt injection', 'Attempts to override your instructions', 'bg-red-400'],
  ['Social engineering', 'Authority claims, urgency, manipulation', 'bg-orange-400'],
  ['Data extraction', 'Attempts to reveal internal rules', 'bg-red-400'],
  ['Jailbreak', 'Roleplay framing to bypass restrictions', 'bg-violet-400'],
  ['Scope violation', "Requests outside your workflow's purpose", 'bg-yellow-400'],
  ['Ambiguity exploit', 'Vague inputs that expose prompt gaps', 'bg-sky-400'],
]

const steps = [
  ['01', 'Paste your instructions', 'From Claude Skills, n8n, Make, Zapier, or TAI\'s workflow builder. Any AI instruction set works.'],
  ['02', 'We attack it', 'Real adversarial tests across 6 categories: social engineering, prompt injection, jailbreaks, data extraction, scope violations, and ambiguity exploits.'],
  ['03', 'Fix it inline', 'Suggestions tied to each specific failure. Accept, edit, or ignore. Retest and watch your score climb.'],
]

export default function Page() {
  const [playing, setPlaying] = useState(true)

  useEffect(() => {
    const reveal = new IntersectionObserver(
      (entries) => entries.forEach((entry) => entry.isIntersecting && entry.target.classList.add('is-visible')),
      { threshold: 0.12 },
    )
    document.querySelectorAll('.reveal').forEach((element) => reveal.observe(element))
    return () => reveal.disconnect()
  }, [])

  return (
    <main className="min-h-screen overflow-hidden bg-background text-foreground">
      {/* Workflows page gradient background */}
      <div className="pointer-events-none fixed inset-0 z-0 bg-[radial-gradient(circle_at_12%_10%,oklch(0.55_0.22_290/.18),transparent_32%),radial-gradient(circle_at_88%_12%,oklch(0.7_0.18_205/.14),transparent_28%),linear-gradient(135deg,oklch(0.16_0.04_285),oklch(0.1_0.025_250)_55%,oklch(0.08_0.03_220))]" />
      <div className="pointer-events-none fixed inset-0 z-0 opacity-20 [background-image:linear-gradient(oklch(1_0_0/.06)_1px,transparent_1px),linear-gradient(90deg,oklch(1_0_0/.06)_1px,transparent_1px)] [background-size:42px_42px]" />
      <div className="pointer-events-none fixed left-1/4 top-20 z-0 size-72 rounded-full bg-violet-500/10 blur-3xl" />
      <div className="pointer-events-none fixed bottom-0 right-1/4 z-0 size-56 rounded-full bg-cyan-400/10 blur-3xl" />

      {/* Header */}
      <header className="fixed inset-x-0 top-0 z-50 border-b border-white/5 bg-background/50 backdrop-blur-xl">
        <div className="mx-auto flex h-[72px] max-w-[1280px] items-center justify-between px-6 lg:px-10">
          <Link href="/" className="flex items-center gap-3">
            <Image src="/logo-2.png" alt="Breach Pointer Eval Coach" width={32} height={32} className="rounded-md object-contain" />
            <span className="text-sm font-semibold tracking-tight text-white">Breach Pointer <span className="font-normal text-white/50">· Eval Coach</span></span>
          </Link>
          <div className="flex items-center gap-3">
            <Link href="/workflows" className="rounded-full bg-violet-600 px-5 py-2.5 text-xs font-semibold text-white transition hover:bg-violet-500 hover:-translate-y-0.5 shadow-lg shadow-violet-900/20">
              Test your workflow <ArrowUpRight className="ml-1 inline size-3" />
            </Link>
          </div>
        </div>
      </header>

      <div className="relative z-10">
        {/* HERO */}
        <section id="top" className="mx-auto max-w-[1280px] px-6 pb-24 pt-36 lg:px-10 lg:pb-36 lg:pt-48">
          <div className="grid gap-14 lg:grid-cols-12 lg:items-end">
            <div className="reveal lg:col-span-8">

              <h1 className="max-w-4xl text-balance text-6xl font-semibold leading-[0.96] tracking-[-0.05em] sm:text-7xl lg:text-[88px]">
                Your workflow passed your tests.<br />
                <span className="bg-gradient-to-r from-violet-400 via-fuchsia-300 to-cyan-300 bg-clip-text text-transparent">It won't pass your users'.</span>
              </h1>
            </div>
            <div className="reveal reveal-delay-2 lg:col-span-4 lg:col-start-9">
              <p className="max-w-sm text-pretty text-lg leading-7 text-white/60">
                Eval Coach runs real adversarial attacks against your Claude Skills and prompts — and coaches you through exactly where they break before your team ships it.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link href="/workflows" className="rounded-full bg-white px-5 py-3 text-sm font-semibold text-background transition-transform hover:-translate-y-0.5">
                  Run your first eval <ArrowUpRight className="ml-1 inline size-4" />
                </Link>
                <a href="#how-it-works" className="rounded-full border border-white/20 bg-white/5 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-white/10">
                  See how it works
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* METRICS PLATFORM */}
        <section id="platform" className="reveal mx-4 mb-28 rounded-[28px] border border-white/10 bg-white/[0.03] shadow-2xl shadow-violet-900/10 p-4 backdrop-blur-2xl sm:mx-6 sm:p-6 lg:mx-auto lg:max-w-[1280px] lg:p-8">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-5">
            <div className="flex gap-4">
              <span className="text-sm font-semibold text-white">Adversarial Suite</span>
              <span className="text-sm text-white/40">TAI Pipeline Gate</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-white/60">
              <span className="size-2 animate-pulse rounded-full bg-cyan-400" /> Operational
            </div>
          </div>
          <div className="grid min-h-[470px] gap-8 py-10 lg:grid-cols-12 lg:items-center lg:py-14">
            <div className="lg:col-span-5">
              <p className="eyebrow mb-4 text-violet-400">Why this exists</p>
              <h2 className="max-w-lg text-4xl font-semibold tracking-[-0.055em] sm:text-5xl text-white">
                TAI teams build well.<br />They don't eval.
              </h2>
              <p className="mt-6 max-w-md leading-7 text-white/60">
                TAI's quarterly reports show output evaluation is the weakest dimension across client teams — scoring 63/100 on average. Workflows move to Validated with no systematic check.
              </p>
              <div className="mt-8 flex items-center gap-5 text-xs text-white/60">
                <span className="flex items-center gap-2"><ShieldCheck className="size-4 text-cyan-400" /> Automated safety net</span>
              </div>
            </div>
            <div className="lg:col-span-6 lg:col-start-7">
              <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-black/40 p-5 shadow-[0_20px_60px_-30px_rgba(0,0,0,.5)]">
                <div className="mb-8 flex items-center justify-between">
                  <div>
                    <p className="text-xs font-semibold text-white">TAI Workflow Pipeline</p>
                    <p className="mt-1 font-mono text-[10px] uppercase tracking-widest text-rose-300">Testing → Validated Gate</p>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="group rounded-xl border border-white/5 bg-white/[0.02] p-4 flex flex-wrap items-center gap-3 text-xs text-white/50">
                    <span className="rounded border border-white/10 bg-white/5 px-3 py-2">Identified</span>
                    <span className="rounded border border-white/10 bg-white/5 px-3 py-2">Scoped</span>
                    <span className="rounded border border-white/10 bg-white/5 px-3 py-2">Testing</span>
                  </div>
                  <div className="flex justify-center my-2 text-rose-400/80">
                    <ArrowRight className="size-4 rotate-90 sm:rotate-0 sm:hidden" />
                    <ArrowRight className="size-4 hidden sm:block" />
                  </div>
                  <div className="group rounded-xl border border-rose-500/20 bg-rose-500/10 p-4 transition-colors">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-rose-200">Evaluation Gap</span>
                      <span className="text-rose-400 font-medium">No tooling here</span>
                    </div>
                  </div>
                  <div className="flex justify-center my-2 text-white/20">
                    <ArrowRight className="size-4 rotate-90 sm:rotate-0 sm:hidden" />
                    <ArrowRight className="size-4 hidden sm:block" />
                  </div>
                  <div className="group rounded-xl border border-white/5 bg-white/[0.02] p-4 flex flex-wrap items-center gap-3 text-xs text-white/50">
                    <span className="rounded border border-violet-500/40 bg-violet-500/20 text-violet-200 px-3 py-2">Validated</span>
                    <span className="rounded border border-white/10 bg-white/5 px-3 py-2">Adopted</span>
                    <span className="rounded border border-white/10 bg-white/5 px-3 py-2">Scaled</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* SOLUTIONS GRID */}
        <section id="how-it-works" className="mx-auto max-w-[1280px] px-6 pb-32 lg:px-10">
          <div className="reveal mb-14 flex flex-col justify-between gap-6 md:flex-row md:items-end">
            <div>
              <p className="eyebrow mb-4 text-violet-400">How it works</p>
              <h2 className="max-w-2xl text-4xl font-semibold tracking-[-0.055em] sm:text-6xl text-white">
                A test loop built for real workflows.
              </h2>
            </div>
            <p className="max-w-xs text-sm leading-6 text-white/50">
              One workspace for the teams who build, govern, and improve AI products.
            </p>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            {steps.map(([number, title, copy], index) => (
              <article key={number} className={`reveal reveal-delay-${index + 1} group rounded-2xl border border-white/10 bg-white/[0.03] p-6 transition-all hover:-translate-y-1 hover:bg-white/[0.06] hover:shadow-[0_18px_45px_-30px_rgba(0,0,0,.4)]`}>
                <div className="mb-20 flex items-start justify-between">
                  <span className="font-mono text-xs text-violet-400">{number}</span>
                  <span className="grid size-8 place-items-center rounded-full bg-white/5 transition-colors group-hover:bg-violet-500 group-hover:text-white">
                    <ArrowUpRight className="size-4" />
                  </span>
                </div>
                <h3 className="text-xl font-semibold tracking-tight text-white">{title}</h3>
                <p className="mt-3 text-sm leading-6 text-white/50">{copy}</p>
              </article>
            ))}
          </div>
        </section>

        {/* ATTACK CATEGORIES */}
        <section className="mx-auto max-w-[1280px] px-6 pb-32 lg:px-10">
          <div className="reveal mb-14">
            <p className="eyebrow mb-4 text-violet-400">What we test</p>
            <h2 className="text-4xl font-semibold tracking-[-0.055em] sm:text-5xl text-white">Every failure has a name.</h2>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {attacks.map(([title, body, bgClass], index) => (
              <article key={title} className={`reveal reveal-delay-${(index % 3) + 1} group rounded-2xl border border-white/[0.06] bg-[#111118] p-6 transition-colors hover:border-white/10`}>
                <div className={`mb-5 h-1 w-12 rounded-full ${bgClass}`} />
                <h3 className="text-base font-semibold text-white">{title}</h3>
                <p className="mt-2 text-sm leading-6 text-white/40">{body}</p>
              </article>
            ))}
          </div>
        </section>

        {/* QUOTE SECTION */}
        <section className="reveal mx-6 mb-24 rounded-3xl border border-violet-500/20 bg-violet-500/10 px-6 py-20 text-center sm:px-12 lg:mx-auto lg:max-w-[1280px]">
          <Shield className="mx-auto mb-8 size-10 text-violet-400 opacity-80" />
          <blockquote className="mx-auto max-w-4xl text-2xl font-medium leading-[1.4] tracking-tight text-white sm:text-4xl">
            "A workflow that hasn't been attacked
            hasn't been tested."
          </blockquote>
          <p className="mt-8 text-sm font-medium tracking-wide text-violet-300/80 uppercase">

          </p>
        </section>

        {/* FOOTER CTA */}
        <section id="contact" className="border-t border-white/10 bg-[#0A0A0C] px-6 py-24 text-white lg:px-10">
          <div className="mx-auto flex max-w-[1280px] flex-col justify-between gap-10 md:flex-row md:items-end">
            <div>
              <p className="eyebrow mb-5 text-white/50">Ready to certify your workflow?</p>
              <h2 className="max-w-2xl text-5xl font-semibold tracking-[-0.06em] sm:text-7xl">
                Build the signal<br />your team trusts.
              </h2>
            </div>
            <div className="flex flex-col gap-4 md:items-end">
              <Link href="/workflows" className="group flex items-center justify-between gap-6 rounded-full bg-white pl-6 pr-2 py-2 text-sm font-semibold text-slate-950 transition hover:bg-slate-200">
                Run your first eval free
                <span className="grid size-10 place-items-center rounded-full bg-slate-950 text-white transition-transform group-hover:scale-95">
                  <ArrowUpRight className="size-4" />
                </span>
              </Link>
              <p className="text-[11px] text-white/40 md:pr-3">No signup. No install. Paste and run.</p>
            </div>
          </div>
        </section>

        {/* FOOTER */}
        <footer className="flex flex-col justify-between gap-3 bg-[#0A0A0C] px-6 pb-8 text-xs text-white/30 sm:flex-row lg:px-10">
          <span>© 2026 Breach Pointer · Eval Coach</span>
          <span className="flex items-center gap-1.5"><Check className="size-3.5 text-violet-400" /> Built for safer AI workflows</span>
        </footer>
      </div>
    </main>
  )
}
