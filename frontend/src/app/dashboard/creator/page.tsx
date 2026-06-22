"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ArrowUpRight } from "lucide-react";
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from "recharts";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

// ─── Demo data ────────────────────────────────────────────────────────────────

const DEMO_RADAR_DATA = [
  { subject: "Citation Likelihood", A: 78, fullMark: 100 },
  { subject: "Authority",           A: 65, fullMark: 100 },
  { subject: "Freshness",           A: 82, fullMark: 100 },
  { subject: "Structure",           A: 70, fullMark: 100 },
  { subject: "Engagement",          A: 69, fullMark: 100 },
];

const DEMO_SCORES = {
  citation:  78,
  authority: 65,
  freshness: 82,
  structure: 70,
  engagement: 69,
};

const DEMO_RECOMMENDATIONS = [
  "Add more authoritative citations from peer-reviewed sources",
  "Include publish date and last-updated timestamp",
  "Structure content with clear H2/H3 headings for AI parsing",
];

const DEMO_AUDITS = [
  {
    id: "1",
    source_url: "youtube.com/watch?v=abc123",
    status: "complete",
    composite_score: 78,
    date: "Jun 20, 2026",
  },
  {
    id: "2",
    source_url: "medium.com/ai-trends-2026",
    status: "complete",
    composite_score: 71,
    date: "Jun 19, 2026",
  },
  {
    id: "3",
    source_url: "linkedin.com/pulse/ml-insights",
    status: "processing",
    composite_score: null,
    date: "Jun 21, 2026",
  },
];

// ─── Before / After comparison ────────────────────────────────────────────────

const BEFORE = { citation: 78, authority: 65 };
const AFTER  = { citation: 89, authority: 81 };

function OptimizeView({ onClose }: { onClose: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 12 }}
      transition={{ duration: 0.3 }}
      className="space-y-5"
    >
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-black">AI Optimization Preview</h3>
        <button
          onClick={onClose}
          className="text-xs text-zinc-500 hover:text-zinc-800 underline"
        >
          ← Back
        </button>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {/* BEFORE */}
        <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-4">
          <p className="text-xs font-semibold uppercase tracking-widest text-zinc-400 mb-3">Before</p>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-zinc-600">Citation Likelihood</span>
              <span className="font-semibold text-black">{BEFORE.citation}</span>
            </div>
            <div className="w-full bg-zinc-200 rounded-full h-1.5">
              <div className="bg-zinc-400 h-1.5 rounded-full" style={{ width: `${BEFORE.citation}%` }} />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-zinc-600">Authority</span>
              <span className="font-semibold text-black">{BEFORE.authority}</span>
            </div>
            <div className="w-full bg-zinc-200 rounded-full h-1.5">
              <div className="bg-zinc-400 h-1.5 rounded-full" style={{ width: `${BEFORE.authority}%` }} />
            </div>
          </div>
        </div>

        {/* AFTER */}
        <div className="rounded-xl border border-blue-200 bg-blue-50 p-4">
          <p className="text-xs font-semibold uppercase tracking-widest text-blue-400 mb-3">After</p>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-zinc-700">Citation Likelihood</span>
              <div className="flex items-center gap-1.5">
                <span className="font-semibold text-black">{AFTER.citation}</span>
                <span className="text-xs font-bold text-green-600 bg-green-100 px-1.5 py-0.5 rounded-full">
                  +{AFTER.citation - BEFORE.citation}
                </span>
              </div>
            </div>
            <div className="w-full bg-blue-200 rounded-full h-1.5">
              <div className="bg-blue-500 h-1.5 rounded-full transition-all" style={{ width: `${AFTER.citation}%` }} />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-zinc-700">Authority</span>
              <div className="flex items-center gap-1.5">
                <span className="font-semibold text-black">{AFTER.authority}</span>
                <span className="text-xs font-bold text-green-600 bg-green-100 px-1.5 py-0.5 rounded-full">
                  +{AFTER.authority - BEFORE.authority}
                </span>
              </div>
            </div>
            <div className="w-full bg-blue-200 rounded-full h-1.5">
              <div className="bg-blue-500 h-1.5 rounded-full transition-all" style={{ width: `${AFTER.authority}%` }} />
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-xl bg-gradient-to-r from-blue-600 to-blue-500 p-4 text-white text-sm font-medium text-center leading-relaxed">
        AI-optimized content will increase your citation likelihood by{" "}
        <span className="font-bold text-lg">23%</span>
      </div>

      <Button className="w-full bg-[#1A7FE0] hover:bg-blue-600 text-white font-semibold py-2.5">
        Apply AI Optimizations
      </Button>
    </motion.div>
  );
}

// ─── Drawer content ───────────────────────────────────────────────────────────

function AuditDrawerContent({ audit }: { audit: (typeof DEMO_AUDITS)[0] }) {
  const [showOptimize, setShowOptimize] = useState(false);

  const dims = [
    { label: "Citation Likelihood", value: DEMO_SCORES.citation },
    { label: "Authority",           value: DEMO_SCORES.authority },
    { label: "Freshness",           value: DEMO_SCORES.freshness },
    { label: "Structure",           value: DEMO_SCORES.structure },
    { label: "Engagement",          value: DEMO_SCORES.engagement },
  ];

  return (
    <div className="flex flex-col gap-5 mt-2">
      <AnimatePresence mode="wait">
        {showOptimize ? (
          <OptimizeView key="optimize" onClose={() => setShowOptimize(false)} />
        ) : (
          <motion.div
            key="detail"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            transition={{ duration: 0.25 }}
            className="space-y-6"
          >
            {/* Score breakdown */}
            <div>
              <h3 className="text-base font-semibold text-black mb-3">Score Breakdown per Dimension</h3>
              <div className="flex flex-col gap-3">
                {dims.map((d) => (
                  <div key={d.label}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm text-zinc-600">{d.label}</span>
                      <span className="text-sm font-semibold text-black">{d.value}/100</span>
                    </div>
                    <div className="w-full bg-zinc-100 rounded-full h-1.5">
                      <div
                        className="bg-[#1A7FE0] h-1.5 rounded-full"
                        style={{ width: `${d.value}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* AI Recommendations */}
            <div>
              <h3 className="text-base font-semibold text-black mb-3">AI Recommendations</h3>
              <ol className="list-decimal pl-5 space-y-2 text-sm text-zinc-700">
                {DEMO_RECOMMENDATIONS.map((rec, i) => (
                  <li key={i} className="leading-relaxed">{rec}</li>
                ))}
              </ol>
            </div>

            {/* Optimize CTA */}
            <Button
              className="w-full bg-[#1A7FE0] hover:bg-blue-600 text-white font-semibold py-2.5 flex items-center justify-center gap-2"
              onClick={() => setShowOptimize(true)}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/></svg>
              Optimize with AI
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function CreatorDashboard() {
  const [selectedAudit, setSelectedAudit] = useState<(typeof DEMO_AUDITS)[0] | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [newContentUrl, setNewContentUrl] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  function openAudit(audit: (typeof DEMO_AUDITS)[0]) {
    setSelectedAudit(audit);
    setSheetOpen(true);
  }

  function badgeClass(status: string) {
    if (status === "complete")   return "bg-green-50 text-green-700 border-green-200";
    if (status === "failed")     return "bg-red-50 text-red-700 border-red-200";
    if (status === "processing") return "bg-blue-50 text-blue-700 border-blue-200";
    return "bg-zinc-100 text-zinc-700 border-zinc-200";
  }

  return (
    <div className="flex flex-col gap-6 p-2">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight text-black">Creator Dashboard</h1>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-[#1A7FE0] hover:bg-blue-600 text-white font-medium shadow-sm transition-all rounded-md px-4 py-2 text-sm flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="M12 5v14"/></svg>
              Analyze New Content
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px] bg-white border-zinc-200">
            <DialogHeader>
              <DialogTitle className="text-black">Submit Content</DialogTitle>
              <DialogDescription className="text-zinc-500">
                Enter the URL of your YouTube video or blog post to calculate its AI Visibility Score.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="url" className="text-black">Content URL</Label>
                <Input
                  id="url"
                  placeholder="https://youtube.com/..."
                  value={newContentUrl}
                  onChange={(e) => setNewContentUrl(e.target.value)}
                  className="bg-white border-zinc-200 text-black focus-visible:ring-[#1A7FE0]"
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                onClick={() => setIsDialogOpen(false)}
                disabled={!newContentUrl}
                className="bg-[#1A7FE0] hover:bg-blue-600 text-white"
              >
                Analyze
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* ── Stat cards ── */}
      <motion.div
        className="grid gap-4 md:grid-cols-2 lg:grid-cols-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* AnswerRank Score */}
        <Card className="bg-white shadow-sm border border-zinc-100">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-zinc-600">AnswerRank Score</CardTitle>
            <ArrowUpRight className="h-4 w-4 text-zinc-400" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-black">73</div>
            <p className="text-xs text-zinc-500 mt-1">Out of 100</p>
          </CardContent>
        </Card>

        {/* Total Content Analyzed */}
        <Card className="bg-white shadow-sm border border-zinc-100">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-zinc-600">Total Content Analyzed</CardTitle>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" className="h-4 w-4 text-zinc-400">
              <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-black">4</div>
            <p className="text-xs text-zinc-500 mt-1">Overall audits</p>
          </CardContent>
        </Card>

        {/* AI Citations This Month */}
        <Card className="bg-white shadow-sm border border-zinc-100">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-zinc-600">AI Citations This Month</CardTitle>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" className="h-4 w-4 text-zinc-400">
              <rect width="20" height="14" x="2" y="5" rx="2" />
              <path d="M2 10h20" />
            </svg>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-black">12</div>
            <p className="text-xs text-zinc-500 mt-1">+2 from last month</p>
          </CardContent>
        </Card>

        {/* Top Performing Platform */}
        <Card className="bg-white shadow-sm border border-zinc-100">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-zinc-600">Top Performing Platform</CardTitle>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" className="h-4 w-4 text-zinc-400">
              <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
            </svg>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-black">ChatGPT</div>
            <p className="text-xs text-zinc-500 mt-1">Based on citation likelihood</p>
          </CardContent>
        </Card>
      </motion.div>

      {/* ── Chart + Table ── */}
      <motion.div
        className="mt-4 grid gap-4 grid-cols-1 md:grid-cols-7"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        {/* Radar chart */}
        <div className="md:col-span-3">
          <Card className="bg-white shadow-sm border border-zinc-100 h-[400px]">
            <CardHeader>
              <CardTitle>Score Breakdown</CardTitle>
              <CardDescription>Your performance across key AnswerRank dimensions.</CardDescription>
            </CardHeader>
            <CardContent className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="70%" data={DEMO_RADAR_DATA}>
                  <PolarGrid stroke="#e4e4e7" />
                  <PolarAngleAxis dataKey="subject" tick={{ fill: "#3f3f46", fontSize: 12 }} />
                  <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                  <Radar name="Score" dataKey="A" stroke="#2563eb" fill="#bfdbfe" fillOpacity={0.6} />
                </RadarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Content table */}
        <div className="md:col-span-4">
          <Card className="bg-white shadow-sm border border-zinc-100 h-[400px] overflow-hidden flex flex-col">
            <CardHeader>
              <CardTitle>Analyzed Content</CardTitle>
              <CardDescription>Recent content audits and their status.</CardDescription>
            </CardHeader>
            <CardContent className="flex-1 overflow-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Content Title / URL</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Score</TableHead>
                    <TableHead>Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {DEMO_AUDITS.map((audit) => (
                    <TableRow
                      key={audit.id}
                      className="cursor-pointer hover:bg-zinc-50 transition-colors"
                      onClick={() => openAudit(audit)}
                    >
                      <TableCell className="font-medium text-black truncate max-w-[200px]" title={audit.source_url}>
                        {audit.source_url.split("/").pop() || audit.source_url}
                        <br />
                        <span className="text-xs font-normal text-zinc-500 truncate">{audit.source_url}</span>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={badgeClass(audit.status)}>
                          {audit.status}
                        </Badge>
                      </TableCell>
                      <TableCell>{audit.composite_score ?? "-"}</TableCell>
                      <TableCell className="text-zinc-500">{audit.date}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      </motion.div>

      {/* ── Side drawer ── */}
      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent className="bg-white border-l border-zinc-200 p-6 flex flex-col gap-4 min-w-[420px] overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Audit Details</SheetTitle>
            <SheetDescription className="break-all text-xs">
              {selectedAudit?.source_url}
            </SheetDescription>
          </SheetHeader>
          {selectedAudit && <AuditDrawerContent audit={selectedAudit} />}
        </SheetContent>
      </Sheet>
    </div>
  );
}
