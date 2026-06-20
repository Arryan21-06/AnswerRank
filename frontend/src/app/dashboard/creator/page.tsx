"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchWithAuth } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
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
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetTrigger } from "@/components/ui/sheet";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { motion } from "framer-motion";

const MOCK_RADAR_DATA = [
  { subject: "Citation Likelihood", A: 85, fullMark: 100 },
  { subject: "Authority", A: 60, fullMark: 100 },
  { subject: "Freshness", A: 90, fullMark: 100 },
  { subject: "Structure", A: 75, fullMark: 100 },
  { subject: "Engagement", A: 80, fullMark: 100 },
];

export default function CreatorDashboard() {
  const [selectedAuditId, setSelectedAuditId] = useState<string | null>(null);
  const [newContentUrl, setNewContentUrl] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const queryClient = useQueryClient();

  const submitContentMutation = useMutation({
    mutationFn: async (url: string) => {
      const res = await fetchWithAuth("/creator/content", {
        method: "POST",
        body: JSON.stringify({ source_url: url }),
      });
      if (!res.ok) throw new Error("Failed to submit content");
      const json = await res.json();
      return json.data;
    },
    onSuccess: () => {
      toast.success("Content submitted for analysis!");
      queryClient.invalidateQueries({ queryKey: ["creatorContentList"] });
      queryClient.invalidateQueries({ queryKey: ["creatorDashboard"] });
      setIsDialogOpen(false);
      setNewContentUrl("");
    },
    onError: () => {
      toast.error("Failed to submit content. Please try again.");
    },
  });

  const { data, isLoading, error } = useQuery({
    queryKey: ["creatorDashboard"],
    queryFn: async () => {
      const res = await fetchWithAuth("/creator/dashboard");
      if (!res.ok) throw new Error("Failed to fetch dashboard data");
      const json = await res.json();
      return json.data;
    },
  });

  const { data: listData, isLoading: listLoading } = useQuery({
    queryKey: ["creatorContentList"],
    queryFn: async () => {
      const res = await fetchWithAuth("/creator/content/list");
      if (!res.ok) throw new Error("Failed to fetch content list");
      const json = await res.json();
      return json.data;
    },
  });

  const { data: auditDetail, isLoading: detailLoading } = useQuery({
    queryKey: ["creatorContentDetail", selectedAuditId],
    queryFn: async () => {
      if (!selectedAuditId) return null;
      const res = await fetchWithAuth(`/creator/content/${selectedAuditId}`);
      if (!res.ok) throw new Error("Failed to fetch content detail");
      const json = await res.json();
      return json.data;
    },
    enabled: !!selectedAuditId,
  });

  return (
    <div className="flex flex-col gap-6 p-2">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight text-black">Creator Dashboard</h1>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-[#1A7FE0] hover:bg-blue-600 text-white font-medium shadow-sm transition-all rounded-md px-4 py-2 text-sm flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-plus"><path d="M5 12h14"/><path d="M12 5v14"/></svg>
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
                onClick={(e) => {
                  e.preventDefault();
                  submitContentMutation.mutate(newContentUrl);
                }}
                disabled={!newContentUrl || submitContentMutation.isPending}
                className="bg-[#1A7FE0] hover:bg-blue-600 text-white"
              >
                {submitContentMutation.isPending ? "Submitting..." : "Analyze"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Top Stats Row */}
      <motion.div
        className="grid gap-4 md:grid-cols-2 lg:grid-cols-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card className="bg-white shadow-sm border border-zinc-100">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-zinc-600">AnswerRank Score</CardTitle>
            <ArrowUpRight className="h-4 w-4 text-zinc-400" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-20" />
            ) : (
              <div className="text-3xl font-bold text-black">
                {data?.profile?.current_answer_rank_score ?? 0}
              </div>
            )}
            <p className="text-xs text-zinc-500 mt-1">Out of 100</p>
          </CardContent>
        </Card>

        <Card className="bg-white shadow-sm border border-zinc-100">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-zinc-600">Total Content Analyzed</CardTitle>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              className="h-4 w-4 text-zinc-400"
            >
              <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-20" />
            ) : (
              <div className="text-3xl font-bold text-black">{data?.recent_audits?.length ?? 0}</div>
            )}
            <p className="text-xs text-zinc-500 mt-1">Overall audits</p>
          </CardContent>
        </Card>

        <Card className="bg-white shadow-sm border border-zinc-100">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-zinc-600">AI Citations This Month</CardTitle>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              className="h-4 w-4 text-zinc-400"
            >
              <rect width="20" height="14" x="2" y="5" rx="2" />
              <path d="M2 10h20" />
            </svg>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-20" />
            ) : (
              <div className="text-3xl font-bold text-black">12</div> /* Mocked as not provided by API */
            )}
            <p className="text-xs text-zinc-500 mt-1">+2 from last month</p>
          </CardContent>
        </Card>

        <Card className="bg-white shadow-sm border border-zinc-100">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-zinc-600">Top Performing Platform</CardTitle>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              className="h-4 w-4 text-zinc-400"
            >
              <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
            </svg>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-20" />
            ) : (
              <div className="text-3xl font-bold text-black">ChatGPT</div> /* Mocked as not provided by API */
            )}
            <p className="text-xs text-zinc-500 mt-1">Based on citation likelihood</p>
          </CardContent>
        </Card>
      </motion.div>

      {/* Chart Placeholder */}
      <motion.div
        className="mt-4 grid gap-4 grid-cols-1 md:grid-cols-7"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
         <div className="md:col-span-3">
             {/* Score Breakdown Chart */}
            <Card className="bg-white shadow-sm border border-zinc-100 col-span-3 h-[400px]">
              <CardHeader>
                <CardTitle>Score Breakdown</CardTitle>
                <CardDescription>
                  Your performance across key AnswerRank dimensions.
                </CardDescription>
              </CardHeader>
              <CardContent className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart cx="50%" cy="50%" outerRadius="70%" data={MOCK_RADAR_DATA}>
                    <PolarGrid stroke="#e4e4e7" />
                    <PolarAngleAxis dataKey="subject" tick={{ fill: "#3f3f46", fontSize: 12 }} />
                    <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                    <Radar
                      name="Score"
                      dataKey="A"
                      stroke="#2563eb"
                      fill="#bfdbfe"
                      fillOpacity={0.6}
                    />
                  </RadarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
         </div>
         <div className="md:col-span-4">
             {/* Content Table */}
            <Card className="bg-white shadow-sm border border-zinc-100 h-[400px] overflow-hidden flex flex-col">
              <CardHeader>
                <CardTitle>Analyzed Content</CardTitle>
                <CardDescription>
                  Recent content audits and their status.
                </CardDescription>
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
                    {listLoading ? (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center py-4">
                          <Skeleton className="h-6 w-full" />
                        </TableCell>
                      </TableRow>
                    ) : listData?.audits?.length > 0 ? (
                      listData.audits.map((audit: any) => (
                        <Sheet key={audit.id}>
                          <SheetTrigger asChild>
                            <TableRow
                              className="cursor-pointer hover:bg-zinc-50 transition-colors"
                              onClick={() => setSelectedAuditId(audit.id)}
                            >
                              <TableCell className="font-medium text-black truncate max-w-[200px]" title={audit.source_url}>
                                {audit.source_url.split('/').pop() || audit.source_url}
                                <br/>
                                <span className="text-xs font-normal text-zinc-500 truncate">{audit.source_url}</span>
                              </TableCell>
                              <TableCell>
                                <Badge
                                  variant="outline"
                                  className={
                                    audit.status === "complete"
                                      ? "bg-green-50 text-green-700 border-green-200"
                                      : audit.status === "failed"
                                      ? "bg-red-50 text-red-700 border-red-200"
                                      : audit.status === "pending" || audit.status === "queued"
                                      ? "bg-zinc-100 text-zinc-700 border-zinc-200"
                                      : "bg-blue-50 text-blue-700 border-blue-200"
                                  }
                                >
                                  {audit.status}
                                </Badge>
                              </TableCell>
                              <TableCell>{audit.composite_score ?? "-"}</TableCell>
                              <TableCell className="text-zinc-500">
                                {new Date(audit.created_at).toLocaleDateString()}
                              </TableCell>
                            </TableRow>
                          </SheetTrigger>
                          <SheetContent className="bg-white border-l border-zinc-200 p-6 flex flex-col gap-4 min-w-[400px] overflow-y-auto">
                            <SheetHeader>
                              <SheetTitle>Audit Details</SheetTitle>
                              <SheetDescription className="break-all">{audit.source_url}</SheetDescription>
                            </SheetHeader>
                            <div className="flex-1 overflow-auto mt-4">
                              {detailLoading ? (
                                <Skeleton className="h-32 w-full" />
                              ) : auditDetail ? (
                                <div className="space-y-6">
                                  <div>
                                    <h3 className="text-lg font-semibold text-black mb-4">Score Breakdown per Dimension</h3>
                                    <div className="flex flex-col gap-3">
                                      <div className="flex items-center justify-between">
                                        <span className="text-zinc-600 text-sm">Citation Likelihood</span>
                                        <span className="font-medium text-black">85/100</span>
                                      </div>
                                      <div className="flex items-center justify-between">
                                        <span className="text-zinc-600 text-sm">Authority</span>
                                        <span className="font-medium text-black">60/100</span>
                                      </div>
                                      <div className="flex items-center justify-between">
                                        <span className="text-zinc-600 text-sm">Freshness</span>
                                        <span className="font-medium text-black">90/100</span>
                                      </div>
                                      <div className="flex items-center justify-between">
                                        <span className="text-zinc-600 text-sm">Structure</span>
                                        <span className="font-medium text-black">75/100</span>
                                      </div>
                                      <div className="flex items-center justify-between">
                                        <span className="text-zinc-600 text-sm">Engagement</span>
                                        <span className="font-medium text-black">80/100</span>
                                      </div>
                                    </div>
                                  </div>

                                  <div>
                                    <h3 className="text-lg font-semibold text-black mb-2">AI Recommendations</h3>
                                    <ul className="list-disc pl-5 space-y-2 text-sm text-zinc-700">
                                      <li>Add a structured FAQ section with at least 5 Q&A pairs.</li>
                                      <li>Use clearer definitions for named entities.</li>
                                      <li>Ensure content is formatted with proper hierarchical headers.</li>
                                    </ul>
                                  </div>

                                  <div className="pt-4">
                                    <button
                                      className="bg-black text-white px-4 py-2 rounded-md hover:bg-zinc-800 transition-colors w-full"
                                      onClick={(e) => {
                                        e.preventDefault();
                                        submitContentMutation.mutate(audit.source_url);
                                      }}
                                    >
                                      {submitContentMutation.isPending ? "Re-analyzing..." : "Re-analyze"}
                                    </button>
                                  </div>
                                </div>
                              ) : (
                                <div className="text-center text-zinc-500">Failed to load details.</div>
                              )}
                            </div>
                          </SheetContent>
                        </Sheet>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center py-16 text-zinc-500">
                          <div className="flex flex-col items-center justify-center gap-2">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-inbox h-10 w-10 text-zinc-300"><polyline points="22 12 16 12 14 15 10 15 8 12 2 12"/><path d="M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"/></svg>
                            <p className="font-medium text-black">No content analyzed yet</p>
                            <p className="text-sm">Click &quot;Analyze New Content&quot; to get started.</p>
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
         </div>
      </motion.div>
    </div>
  );
}
