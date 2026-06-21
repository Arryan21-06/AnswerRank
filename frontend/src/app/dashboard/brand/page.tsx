"use client";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { useState } from "react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
} from "recharts";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Creator {
  id: string;
  name: string;
  handle: string;
  niche: string;
  nicheColor: string;
  score: number;
  campaignMatch: number;
  insight: string;
  avatarColor: string;
  topics: string[];
  radarData: { subject: string; A: number; fullMark: number }[];
  rationale: string;
}

// ─── Demo data ────────────────────────────────────────────────────────────────

const ALL_CREATORS: Record<string, Creator[]> = {
  skincare: [
    {
      id: "sk1",
      name: "Dr. Evelyn Carter",
      handle: "@evelyncarter_md",
      niche: "Skincare",
      nicheColor: "bg-pink-100 text-pink-700",
      score: 93,
      campaignMatch: 96,
      insight: "Cited in 14 AI responses for Vitamin C serums this quarter.",
      avatarColor: "bg-pink-500",
      topics: ["Vitamin C", "L-Ascorbic Acid", "Bioavailability", "Collagen"],
      radarData: [
        { subject: "Direct Answer", A: 91, fullMark: 100 },
        { subject: "Entity Clarity", A: 88, fullMark: 100 },
        { subject: "FAQ Coverage", A: 94, fullMark: 100 },
        { subject: "Trust Signals", A: 95, fullMark: 100 },
        { subject: "Structure", A: 89, fullMark: 100 },
        { subject: "Freshness", A: 92, fullMark: 100 },
        { subject: "Content Depth", A: 93, fullMark: 100 },
      ],
      rationale:
        "Dr. Carter's peer-reviewed citations and dermatologist credentials make her the top AI-cited voice for Vitamin C skincare. Her structured FAQ format aligns with how LLMs retrieve answers. Strong semantic overlap with your campaign keywords around antioxidant serums. Consistently updated content ensures high freshness scores across all major AI platforms.",
    },
    {
      id: "sk2",
      name: "Sarah Glow",
      handle: "@sarahglow",
      niche: "Skincare",
      nicheColor: "bg-pink-100 text-pink-700",
      score: 87,
      campaignMatch: 89,
      insight: "Top-ranked blog for 'morning skincare routine' queries on Perplexity.",
      avatarColor: "bg-rose-400",
      topics: ["Retinol", "SPF", "Morning Routine", "Hydration"],
      radarData: [
        { subject: "Direct Answer", A: 85, fullMark: 100 },
        { subject: "Entity Clarity", A: 82, fullMark: 100 },
        { subject: "FAQ Coverage", A: 88, fullMark: 100 },
        { subject: "Trust Signals", A: 86, fullMark: 100 },
        { subject: "Structure", A: 90, fullMark: 100 },
        { subject: "Freshness", A: 84, fullMark: 100 },
        { subject: "Content Depth", A: 87, fullMark: 100 },
      ],
      rationale:
        "Sarah's long-form blog posts score highly on structure and FAQ coverage, driving consistent Perplexity citations. Her content covers morning routines with authoritative retinol and SPF guidance, matching your campaign's target queries. High audience trust signals due to consistent publishing cadence.",
    },
    {
      id: "sk3",
      name: "Maya Skin",
      handle: "@mayaskin",
      niche: "Skincare",
      nicheColor: "bg-pink-100 text-pink-700",
      score: 82,
      campaignMatch: 84,
      insight: "Strong YouTube presence with AI-indexed video transcripts.",
      avatarColor: "bg-fuchsia-400",
      topics: ["Niacinamide", "Acne", "Glass Skin", "Korean Beauty"],
      radarData: [
        { subject: "Direct Answer", A: 80, fullMark: 100 },
        { subject: "Entity Clarity", A: 79, fullMark: 100 },
        { subject: "FAQ Coverage", A: 83, fullMark: 100 },
        { subject: "Trust Signals", A: 81, fullMark: 100 },
        { subject: "Structure", A: 84, fullMark: 100 },
        { subject: "Freshness", A: 83, fullMark: 100 },
        { subject: "Content Depth", A: 82, fullMark: 100 },
      ],
      rationale:
        "Maya's YouTube transcripts are actively indexed by AI search engines, giving her strong multimodal reach. Her Korean beauty and glass skin content fills a gap in the AI knowledge base that aligns with your product positioning.",
    },
  ],

  fitness: [
    {
      id: "fi1",
      name: "Jake Moves",
      handle: "@jakemoves",
      niche: "Fitness",
      nicheColor: "bg-orange-100 text-orange-700",
      score: 89,
      campaignMatch: 91,
      insight: "Cited by ChatGPT for HIIT and recovery protocols 22 times this month.",
      avatarColor: "bg-orange-500",
      topics: ["HIIT", "Recovery", "Progressive Overload", "Protein Intake"],
      radarData: [
        { subject: "Direct Answer", A: 88, fullMark: 100 },
        { subject: "Entity Clarity", A: 85, fullMark: 100 },
        { subject: "FAQ Coverage", A: 90, fullMark: 100 },
        { subject: "Trust Signals", A: 87, fullMark: 100 },
        { subject: "Structure", A: 91, fullMark: 100 },
        { subject: "Freshness", A: 89, fullMark: 100 },
        { subject: "Content Depth", A: 88, fullMark: 100 },
      ],
      rationale:
        "Jake's exercise science background drives high trust signals in AI responses. His HIIT and recovery content is structured with numbered lists and Q&A sections that AI systems easily parse. Consistent weekly publishing keeps freshness scores high. Best match for performance-focused campaign angles.",
    },
    {
      id: "fi2",
      name: "Priya Fit",
      handle: "@priyafit",
      niche: "Fitness",
      nicheColor: "bg-orange-100 text-orange-700",
      score: 84,
      campaignMatch: 86,
      insight: "Strong female fitness authority — cited across Gemini and Claude.",
      avatarColor: "bg-amber-500",
      topics: ["Strength Training", "Nutrition", "Mindset", "Mobility"],
      radarData: [
        { subject: "Direct Answer", A: 82, fullMark: 100 },
        { subject: "Entity Clarity", A: 80, fullMark: 100 },
        { subject: "FAQ Coverage", A: 85, fullMark: 100 },
        { subject: "Trust Signals", A: 84, fullMark: 100 },
        { subject: "Structure", A: 86, fullMark: 100 },
        { subject: "Freshness", A: 83, fullMark: 100 },
        { subject: "Content Depth", A: 84, fullMark: 100 },
      ],
      rationale:
        "Priya occupies the female strength training niche with high entity clarity, making her the go-to citation for LLMs answering questions about women's fitness. Her nutrition + mindset content broadens campaign reach beyond just physical training.",
    },
    {
      id: "fi3",
      name: "Leo Strong",
      handle: "@leostrong",
      niche: "Fitness",
      nicheColor: "bg-orange-100 text-orange-700",
      score: 79,
      campaignMatch: 81,
      insight: "Rising creator with high freshness — 3 posts/week indexed by AI.",
      avatarColor: "bg-yellow-600",
      topics: ["Calisthenics", "Bodyweight", "Beginner Fitness", "Home Workouts"],
      radarData: [
        { subject: "Direct Answer", A: 77, fullMark: 100 },
        { subject: "Entity Clarity", A: 76, fullMark: 100 },
        { subject: "FAQ Coverage", A: 80, fullMark: 100 },
        { subject: "Trust Signals", A: 78, fullMark: 100 },
        { subject: "Structure", A: 82, fullMark: 100 },
        { subject: "Freshness", A: 85, fullMark: 100 },
        { subject: "Content Depth", A: 79, fullMark: 100 },
      ],
      rationale:
        "Leo's high publishing frequency and beginner-friendly tone make him the fastest-growing AI-cited creator in the home workout category. Excellent fit for product awareness campaigns targeting first-time fitness buyers.",
    },
  ],

  finance: [
    {
      id: "fn1",
      name: "Alex Invest",
      handle: "@alexinvest",
      niche: "Finance",
      nicheColor: "bg-green-100 text-green-700",
      score: 91,
      campaignMatch: 93,
      insight: "Top AI-cited voice for index fund and ETF investment queries.",
      avatarColor: "bg-green-600",
      topics: ["ETFs", "Index Funds", "Compound Interest", "FIRE Movement"],
      radarData: [
        { subject: "Direct Answer", A: 90, fullMark: 100 },
        { subject: "Entity Clarity", A: 89, fullMark: 100 },
        { subject: "FAQ Coverage", A: 92, fullMark: 100 },
        { subject: "Trust Signals", A: 93, fullMark: 100 },
        { subject: "Structure", A: 91, fullMark: 100 },
        { subject: "Freshness", A: 88, fullMark: 100 },
        { subject: "Content Depth", A: 91, fullMark: 100 },
      ],
      rationale:
        "Alex's CFA credentials and data-backed analysis give him the highest trust signal scores in personal finance. His ETF and index fund content is directly surfaced by ChatGPT and Perplexity in response to investment beginner queries. Near-perfect alignment with your fintech campaign keywords.",
    },
    {
      id: "fn2",
      name: "Nisha Money",
      handle: "@nishamoney",
      niche: "Finance",
      nicheColor: "bg-green-100 text-green-700",
      score: 86,
      campaignMatch: 88,
      insight: "Specialises in women-focused financial independence content.",
      avatarColor: "bg-emerald-500",
      topics: ["Budgeting", "Side Hustles", "Financial Independence", "Tax"],
      radarData: [
        { subject: "Direct Answer", A: 84, fullMark: 100 },
        { subject: "Entity Clarity", A: 83, fullMark: 100 },
        { subject: "FAQ Coverage", A: 87, fullMark: 100 },
        { subject: "Trust Signals", A: 86, fullMark: 100 },
        { subject: "Structure", A: 88, fullMark: 100 },
        { subject: "Freshness", A: 85, fullMark: 100 },
        { subject: "Content Depth", A: 86, fullMark: 100 },
      ],
      rationale:
        "Nisha dominates the women's personal finance niche with AI-optimized budgeting content. Her FAQ-structured articles are frequently cited in Gemini responses about financial planning. Strong campaign match for products targeting 25-40 female demographics.",
    },
    {
      id: "fn3",
      name: "Chris Wealth",
      handle: "@chriswealth",
      niche: "Finance",
      nicheColor: "bg-green-100 text-green-700",
      score: 88,
      campaignMatch: 90,
      insight: "Real estate + stock hybrid creator with very high content depth.",
      avatarColor: "bg-teal-600",
      topics: ["Real Estate", "REITs", "Stock Picks", "Portfolio Diversification"],
      radarData: [
        { subject: "Direct Answer", A: 86, fullMark: 100 },
        { subject: "Entity Clarity", A: 85, fullMark: 100 },
        { subject: "FAQ Coverage", A: 89, fullMark: 100 },
        { subject: "Trust Signals", A: 88, fullMark: 100 },
        { subject: "Structure", A: 90, fullMark: 100 },
        { subject: "Freshness", A: 87, fullMark: 100 },
        { subject: "Content Depth", A: 92, fullMark: 100 },
      ],
      rationale:
        "Chris's hybrid real-estate and equities coverage gives him the widest portfolio in finance. His exceptionally deep content scores drive high citations on complex multi-asset queries. Ideal for investment platforms seeking broad financial authority.",
    },
  ],

  tech: [
    {
      id: "tc1",
      name: "Raj Codes",
      handle: "@rajcodes",
      niche: "Tech",
      nicheColor: "bg-blue-100 text-blue-700",
      score: 85,
      campaignMatch: 87,
      insight: "Most cited developer for 'best programming language' queries on Claude.",
      avatarColor: "bg-blue-600",
      topics: ["Python", "System Design", "Backend", "APIs"],
      radarData: [
        { subject: "Direct Answer", A: 83, fullMark: 100 },
        { subject: "Entity Clarity", A: 82, fullMark: 100 },
        { subject: "FAQ Coverage", A: 86, fullMark: 100 },
        { subject: "Trust Signals", A: 84, fullMark: 100 },
        { subject: "Structure", A: 87, fullMark: 100 },
        { subject: "Freshness", A: 85, fullMark: 100 },
        { subject: "Content Depth", A: 85, fullMark: 100 },
      ],
      rationale:
        "Raj's technical depth and code-example format are precisely what AI models look for when answering programming questions. His Python and backend content is indexed across all major AI platforms. Strong match for developer tools and SaaS campaigns.",
    },
    {
      id: "tc2",
      name: "Zoe Dev",
      handle: "@zoedev",
      niche: "Tech",
      nicheColor: "bg-blue-100 text-blue-700",
      score: 90,
      campaignMatch: 92,
      insight: "AI/ML creator with the highest freshness score in tech niche.",
      avatarColor: "bg-violet-500",
      topics: ["Machine Learning", "LLMs", "AI Tools", "Prompt Engineering"],
      radarData: [
        { subject: "Direct Answer", A: 88, fullMark: 100 },
        { subject: "Entity Clarity", A: 87, fullMark: 100 },
        { subject: "FAQ Coverage", A: 91, fullMark: 100 },
        { subject: "Trust Signals", A: 89, fullMark: 100 },
        { subject: "Structure", A: 92, fullMark: 100 },
        { subject: "Freshness", A: 95, fullMark: 100 },
        { subject: "Content Depth", A: 90, fullMark: 100 },
      ],
      rationale:
        "Zoe's AI and LLM content is consistently the freshest in the tech category, posting within hours of major model releases. Her prompt engineering guides are cited by ChatGPT itself when users ask about AI usage. Perfect alignment for AI-product campaigns.",
    },
    {
      id: "tc3",
      name: "Sam AI",
      handle: "@samai",
      niche: "Tech",
      nicheColor: "bg-blue-100 text-blue-700",
      score: 94,
      campaignMatch: 95,
      insight: "Highest overall AnswerRank score in the tech niche — rare 94.",
      avatarColor: "bg-indigo-600",
      topics: ["Generative AI", "GPU Computing", "Transformers", "Open Source"],
      radarData: [
        { subject: "Direct Answer", A: 93, fullMark: 100 },
        { subject: "Entity Clarity", A: 91, fullMark: 100 },
        { subject: "FAQ Coverage", A: 95, fullMark: 100 },
        { subject: "Trust Signals", A: 94, fullMark: 100 },
        { subject: "Structure", A: 96, fullMark: 100 },
        { subject: "Freshness", A: 93, fullMark: 100 },
        { subject: "Content Depth", A: 94, fullMark: 100 },
      ],
      rationale:
        "Sam holds the highest AnswerRank score in the tech category, with near-perfect dimension scores across all 7 metrics. His generative AI and transformers content is the primary source cited by Gemini Advanced for technical questions. Unmatched authority for AI-adjacent product campaigns.",
    },
  ],
};

// Mixed top 6 across niches
ALL_CREATORS.all = [
  ALL_CREATORS.tech[2],    // Sam AI — 94
  ALL_CREATORS.skincare[0], // Dr. Evelyn — 93
  ALL_CREATORS.finance[0], // Alex Invest — 91
  ALL_CREATORS.tech[1],    // Zoe Dev — 90
  ALL_CREATORS.fitness[0], // Jake Moves — 89
  ALL_CREATORS.finance[2], // Chris Wealth — 88
];

// ─── Saved creators (existing table kept) ────────────────────────────────────

const SAVED_CREATORS = [
  { id: "s1", handle: "@glow.with.me",  niche: "skincare", score: 91, platform: "YouTube",   followers: 50000  },
  { id: "s2", handle: "@techguru",      niche: "tech",     score: 85, platform: "Blog",       followers: 120000 },
  { id: "s3", handle: "@fitness_pro",   niche: "fitness",  score: 78, platform: "Instagram",  followers: 85000  },
];

// ─── Helper: avatar initials ──────────────────────────────────────────────────

function Initials({ name, color }: { name: string; color: string }) {
  const parts = name.trim().split(" ");
  const init = parts.length >= 2
    ? `${parts[0][0]}${parts[parts.length - 1][0]}`
    : name.slice(0, 2);
  return (
    <div
      className={`w-11 h-11 rounded-full flex items-center justify-center text-white font-bold text-base shrink-0 ${color}`}
    >
      {init.toUpperCase()}
    </div>
  );
}

// ─── Creator card ─────────────────────────────────────────────────────────────

function CreatorCard({
  creator,
  onInspect,
  onSave,
}: {
  creator: Creator;
  onInspect: () => void;
  onSave: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="bg-white border border-zinc-100 rounded-2xl shadow-sm hover:shadow-md transition-shadow p-5 flex flex-col gap-4"
    >
      {/* Top row */}
      <div className="flex items-start gap-3">
        <Initials name={creator.name} color={creator.avatarColor} />
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-black text-sm leading-tight truncate">{creator.name}</p>
          <p className="text-xs text-zinc-500 truncate">{creator.handle}</p>
          <p className="text-[10px] text-zinc-400 mt-0.5">Updated 2h ago</p>
        </div>
        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full shrink-0 ${creator.nicheColor}`}>
          {creator.niche}
        </span>
      </div>

      {/* Scores */}
      <div className="space-y-2">
        <div>
          <div className="flex justify-between text-xs mb-1">
            <span className="text-zinc-500">AnswerRank Score</span>
            <span className="font-semibold text-black">{creator.score}/100</span>
          </div>
          <div className="w-full bg-zinc-100 rounded-full h-1.5">
            <div className="bg-[#1A7FE0] h-1.5 rounded-full" style={{ width: `${creator.score}%` }} />
          </div>
        </div>
        <div>
          <div className="flex justify-between text-xs mb-1">
            <span className="text-zinc-500">Campaign Match</span>
            <span className="font-semibold text-green-600">{creator.campaignMatch}%</span>
          </div>
          <div className="w-full bg-zinc-100 rounded-full h-1.5">
            <div className="bg-green-500 h-1.5 rounded-full" style={{ width: `${creator.campaignMatch}%` }} />
          </div>
        </div>
      </div>

      {/* Insight */}
      <p className="text-xs text-zinc-600 leading-relaxed border-l-2 border-blue-200 pl-2">
        {creator.insight}
      </p>

      {/* Actions */}
      <div className="flex items-center justify-between pt-1">
        <button
          onClick={onInspect}
          className="text-sm font-medium text-[#1A7FE0] hover:text-blue-700 transition-colors flex items-center gap-1"
        >
          Inspect <span>→</span>
        </button>
        <Button
          size="sm"
          variant="outline"
          className="border-zinc-200 text-black text-xs hover:bg-zinc-50"
          onClick={onSave}
        >
          Save to Shortlist
        </Button>
      </div>
    </motion.div>
  );
}

// ─── Inspect drawer content ───────────────────────────────────────────────────

function InspectDrawer({
  creator,
  onClose,
}: {
  creator: Creator;
  onClose: () => void;
}) {
  return (
    <div className="flex flex-col gap-6 h-full overflow-y-auto">
      {/* Header */}
      <div className="flex items-start gap-3">
        <Initials name={creator.name} color={creator.avatarColor} />
        <div className="flex-1 min-w-0">
          <h2 className="font-bold text-black text-base">{creator.name}</h2>
          <p className="text-sm text-zinc-500">{creator.handle}</p>
          <div className="flex items-center gap-2 mt-1.5 flex-wrap">
            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${creator.nicheColor}`}>
              {creator.niche}
            </span>
            <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-green-100 text-green-700">
              CMP {creator.campaignMatch}%
            </span>
          </div>
        </div>
        <button
          onClick={onClose}
          className="text-zinc-400 hover:text-zinc-700 transition-colors mt-0.5"
          aria-label="Close"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
        </button>
      </div>

      {/* AI Audit Profile Metrics */}
      <div>
        <p className="text-[10px] font-bold tracking-widest uppercase text-zinc-400 mb-3">
          AI Audit Profile Metrics
        </p>
        <div className="h-[260px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart cx="50%" cy="50%" outerRadius="68%" data={creator.radarData}>
              <PolarGrid stroke="#e4e4e7" />
              <PolarAngleAxis dataKey="subject" tick={{ fill: "#52525b", fontSize: 10 }} />
              <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
              <Radar name="Score" dataKey="A" stroke="#1A7FE0" fill="#bfdbfe" fillOpacity={0.55} />
            </RadarChart>
          </ResponsiveContainer>
        </div>
        {/* Dimension scores list */}
        <div className="mt-2 grid grid-cols-2 gap-x-4 gap-y-1.5">
          {creator.radarData.map((d) => (
            <div key={d.subject} className="flex items-center justify-between text-xs">
              <span className="text-zinc-500 truncate">{d.subject}</span>
              <span className="font-semibold text-black ml-2">{d.A}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Topic tags */}
      <div>
        <p className="text-[10px] font-bold tracking-widest uppercase text-zinc-400 mb-2">
          Topic Coverage
        </p>
        <div className="flex flex-wrap gap-2">
          {creator.topics.map((t) => (
            <span
              key={t}
              className="text-xs px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 font-medium border border-blue-100"
            >
              {t}
            </span>
          ))}
        </div>
      </div>

      {/* Campaign match rationale */}
      <div>
        <p className="text-[10px] font-bold tracking-widest uppercase text-zinc-400 mb-2">
          Campaign Match Rationale
        </p>
        <p className="text-sm text-zinc-700 leading-relaxed">{creator.rationale}</p>
      </div>

      {/* Actions */}
      <div className="mt-auto space-y-3 pb-4">
        <Button
          className="w-full bg-[#1A7FE0] hover:bg-blue-600 text-white font-semibold"
          onClick={() => toast.success(`${creator.name} saved to shortlist!`)}
        >
          Save to Shortlist
        </Button>
        <button
          onClick={onClose}
          className="w-full text-sm text-zinc-500 hover:text-zinc-800 transition-colors text-center"
        >
          ← Back to results
        </button>
      </div>
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function BrandDashboard() {
  const [searchQuery, setSearchQuery]   = useState("");
  const [nicheFilter, setNicheFilter]   = useState("all");
  const [hasSearched, setHasSearched]   = useState(false);
  const [results, setResults]           = useState<Creator[]>([]);
  const [inspecting, setInspecting]     = useState<Creator | null>(null);
  const [drawerOpen, setDrawerOpen]     = useState(false);

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    const key = nicheFilter as keyof typeof ALL_CREATORS;
    setResults(ALL_CREATORS[key] ?? ALL_CREATORS.all);
    setHasSearched(true);
  }

  function openInspect(creator: Creator) {
    setInspecting(creator);
    setDrawerOpen(true);
  }

  return (
    <div className="flex flex-col gap-6 p-2">
      {/* Page title */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight text-black">Brand Dashboard</h1>
      </div>

      {/* ── Stat cards ── */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="bg-white shadow-sm border border-zinc-100">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-zinc-600">Creators Discovered</CardTitle>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" className="h-4 w-4 text-zinc-400">
              <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-black">1,204</div>
            <p className="text-xs text-zinc-500 mt-1">Verified creator network</p>
          </CardContent>
        </Card>

        <Card className="bg-white shadow-sm border border-zinc-100">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-zinc-600">Searches This Month</CardTitle>
            <Search className="h-4 w-4 text-zinc-400" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-black">18</div>
            <p className="text-xs text-zinc-500 mt-1">Campaign queries run</p>
          </CardContent>
        </Card>

        <Card className="bg-white shadow-sm border border-zinc-100">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-zinc-600">Saved Creators</CardTitle>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" className="h-4 w-4 text-zinc-400">
              <path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z" />
            </svg>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-black">{SAVED_CREATORS.length}</div>
            <p className="text-xs text-zinc-500 mt-1">Shortlisted candidates</p>
          </CardContent>
        </Card>
      </div>

      {/* ── Find Creators ── */}
      <div className="flex flex-col gap-4 mt-2">
        <h2 className="text-lg font-semibold text-black">Find Creators</h2>

        <form onSubmit={handleSearch} className="flex gap-3 max-w-3xl">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 h-4 w-4 text-zinc-400" />
            <input
              placeholder="Search by campaign keyword (e.g., Organic Skincare)"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 h-10 w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm text-black placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-[#1A7FE0] focus:ring-offset-0"
            />
          </div>

          <Select value={nicheFilter} onValueChange={setNicheFilter}>
            <SelectTrigger className="w-[180px] bg-white border-zinc-200 text-black h-10">
              <SelectValue placeholder="All Niches" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Niches</SelectItem>
              <SelectItem value="skincare">Skincare</SelectItem>
              <SelectItem value="fitness">Fitness</SelectItem>
              <SelectItem value="finance">Finance</SelectItem>
              <SelectItem value="tech">Tech</SelectItem>
            </SelectContent>
          </Select>

          <Button
            type="submit"
            disabled={!searchQuery.trim()}
            className="bg-[#1A7FE0] hover:bg-blue-600 text-white h-10 px-6"
          >
            Search
          </Button>
        </form>

        {/* Search results / empty state */}
        <AnimatePresence mode="wait">
          {!hasSearched ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center py-20 text-center bg-white border border-zinc-100 rounded-2xl mt-2"
            >
              <div className="w-14 h-14 rounded-full bg-zinc-100 flex items-center justify-center mb-4">
                <Search className="w-6 h-6 text-zinc-400" />
              </div>
              <p className="font-semibold text-zinc-700">Search for creators above to see results</p>
              <p className="text-sm text-zinc-400 mt-1 max-w-xs">
                Enter a campaign keyword and optionally filter by niche to discover AI-visible creators.
              </p>
            </motion.div>
          ) : (
            <motion.div
              key="results"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="mt-2"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base font-semibold text-zinc-700">
                  Search Results
                  <span className="ml-2 text-sm font-normal text-zinc-400">
                    {results.length} creators found
                  </span>
                </h3>
                <button
                  onClick={() => { setHasSearched(false); setResults([]); setSearchQuery(""); }}
                  className="text-xs text-zinc-400 hover:text-zinc-700 underline"
                >
                  Clear results
                </button>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                {results.map((creator) => (
                  <CreatorCard
                    key={creator.id}
                    creator={creator}
                    onInspect={() => openInspect(creator)}
                    onSave={() => toast.success(`${creator.name} saved to shortlist!`)}
                  />
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── Saved Creators ── */}
      <div className="flex flex-col gap-4 mt-6">
        <h2 className="text-lg font-semibold text-black">Saved Creators</h2>
        <Card className="bg-white border-zinc-200 shadow-sm">
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Handle</TableHead>
                  <TableHead>Niche</TableHead>
                  <TableHead>Score</TableHead>
                  <TableHead>Platform</TableHead>
                  <TableHead>Followers</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {SAVED_CREATORS.map((c) => (
                  <TableRow key={c.id}>
                    <TableCell className="font-medium text-black">{c.handle}</TableCell>
                    <TableCell className="capitalize">{c.niche}</TableCell>
                    <TableCell>
                      <Badge className="bg-[#E8F4FF] text-blue-700 hover:bg-[#d0e9ff] border-none font-bold">
                        {c.score}
                      </Badge>
                    </TableCell>
                    <TableCell>{c.platform}</TableCell>
                    <TableCell>{c.followers.toLocaleString()}</TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        onClick={() => toast("Removed from saved list")}
                      >
                        Remove
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      {/* ── Inspect drawer ── */}
      <Sheet open={drawerOpen} onOpenChange={setDrawerOpen}>
        <SheetContent
          side="right"
          className="bg-white border-l border-zinc-200 p-6 w-[480px] sm:w-[480px] max-w-full overflow-y-auto"
        >
          <SheetHeader className="sr-only">
            <SheetTitle>Creator Inspect</SheetTitle>
          </SheetHeader>
          {inspecting && (
            <InspectDrawer
              creator={inspecting}
              onClose={() => setDrawerOpen(false)}
            />
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
