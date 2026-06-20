'use client';

import Link from "next/link";
import dynamic from 'next/dynamic';

const Globe = dynamic(() => import('@/components/Globe'), { ssr: false });

export default function Home() {
  return (
    <div className="min-h-screen bg-white font-sans flex flex-col">
      {/* Top Navigation */}
      <header className="w-full max-w-7xl mx-auto px-6 py-6 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-black rounded-md flex items-center justify-center">
            <span className="text-white font-bold text-lg">A</span>
          </div>
          <span className="text-xl font-bold tracking-tight text-black">AnswerRank</span>
        </div>
        <nav className="flex items-center gap-6">
          <Link href="/login" className="text-sm font-medium text-zinc-600 hover:text-black transition-colors">
            Login
          </Link>
          <Link
            href="/signup"
            className="text-sm font-medium text-white bg-black px-5 py-2.5 rounded-full hover:bg-zinc-800 transition-colors"
          >
            Get Started
          </Link>
        </nav>
      </header>

      {/* Main Content */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-6 flex flex-col">

        {/* Hero Section */}
        <section className="flex flex-col lg:flex-row items-center justify-between py-16 lg:py-24 gap-12 lg:gap-8">

          {/* Left: Copy & CTAs */}
          <div className="flex-1 flex flex-col items-start gap-6 max-w-2xl">
            <div className="inline-flex items-center px-3 py-1 rounded-full bg-[#E8F4FF] text-blue-700 text-xs font-bold tracking-wide uppercase">
              AI VISIBILITY PLATFORM
            </div>

            <h1 className="text-5xl lg:text-7xl font-extrabold tracking-tight text-black leading-tight">
              Map your AI <br className="hidden lg:block" /> Citation Score.
            </h1>

            <p className="text-lg lg:text-xl text-zinc-600 max-w-xl">
              Find out how likely AI assistants cite your content. Optimize your visibility across the next generation of search.
            </p>

            <div className="flex flex-wrap items-center gap-4 pt-4">
              <Link
                href="/signup"
                className="text-base font-semibold text-white bg-black px-8 py-4 rounded-full hover:bg-zinc-800 transition-colors"
              >
                Get Started Free
              </Link>
              <button className="text-base font-semibold text-black bg-white border border-zinc-200 px-8 py-4 rounded-full hover:bg-zinc-50 transition-colors">
                View Demo
              </button>
            </div>

            <div className="flex items-center gap-3 pt-8">
              <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Analyzes:</span>
              <span className="px-3 py-1 rounded-full border border-zinc-200 text-xs font-medium text-zinc-600">ChatGPT</span>
              <span className="px-3 py-1 rounded-full border border-zinc-200 text-xs font-medium text-zinc-600">Gemini</span>
              <span className="px-3 py-1 rounded-full border border-zinc-200 text-xs font-medium text-zinc-600">Perplexity</span>
            </div>
          </div>

          {/* Right: Interactive Globe */}
          <div className="flex-1 w-full max-w-xl">
            <Globe />
          </div>

        </section>

        {/* Feature Cards Section */}
        <section className="py-16 grid grid-cols-1 md:grid-cols-3 gap-8">

          <div className="bg-white p-8 rounded-2xl border border-zinc-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-shadow">
            <div className="w-12 h-12 bg-[#E8F4FF] rounded-xl flex items-center justify-center mb-6">
              <svg className="w-6 h-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-black mb-3">AI Citation Score</h3>
            <p className="text-zinc-600 leading-relaxed">
              Get a definitive score out of 100 indicating your content&apos;s visibility to major AI models.
            </p>
          </div>

          <div className="bg-white p-8 rounded-2xl border border-zinc-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-shadow">
            <div className="w-12 h-12 bg-[#E8F4FF] rounded-xl flex items-center justify-center mb-6">
              <svg className="w-6 h-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-black mb-3">Multi-Platform</h3>
            <p className="text-zinc-600 leading-relaxed">
              Analyze your visibility across ChatGPT, Gemini, and Perplexity all in one single dashboard.
            </p>
          </div>

          <div className="bg-white p-8 rounded-2xl border border-zinc-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-shadow">
            <div className="w-12 h-12 bg-[#E8F4FF] rounded-xl flex items-center justify-center mb-6">
              <svg className="w-6 h-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-black mb-3">Actionable Insights</h3>
            <p className="text-zinc-600 leading-relaxed">
              Receive concrete, AI-driven recommendations to improve your format, entities, and citations.
            </p>
          </div>

        </section>
      </main>
    </div>
  );
}
