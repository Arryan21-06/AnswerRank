"use client";

import { useQuery, useMutation } from "@tanstack/react-query";
import { fetchWithAuth } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useState } from "react";
import { toast } from "sonner";

// Mock saved creators list as backend only returns count in V1
const MOCK_SAVED_CREATORS = [
  { id: "1", handle: "@glow.with.me", primary_niche: "skincare", current_answer_rank_score: 91, platform: "youtube", follower_count: 50000 },
  { id: "2", handle: "@techguru", primary_niche: "tech", current_answer_rank_score: 85, platform: "blog", follower_count: 120000 },
  { id: "3", handle: "@fitness_pro", primary_niche: "fitness", current_answer_rank_score: 78, platform: "instagram", follower_count: 85000 }
];

export default function BrandDashboard() {
  const [searchQuery, setSearchQuery] = useState("");
  const [nicheFilter, setNicheFilter] = useState("all");

  const searchMutation = useMutation({
    mutationFn: async (data: { query_text: string, niche_filter?: string, min_score_filter?: number }) => {
      const res = await fetchWithAuth("/brand/search", {
        method: "POST",
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Search failed");
      const json = await res.json();
      return json.data;
    },
    onError: () => {
      toast.error("Failed to perform search. Please try again.");
    }
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    searchMutation.mutate({
      query_text: searchQuery,
      niche_filter: nicheFilter !== "all" ? nicheFilter : undefined,
      min_score_filter: 0 // Default to 0 for V1 simplicity
    });
  };

  const { data, isLoading, error } = useQuery({
    queryKey: ["brandDashboard"],
    queryFn: async () => {
      const res = await fetchWithAuth("/brand/dashboard");
      if (!res.ok) throw new Error("Failed to fetch dashboard data");
      const json = await res.json();
      return json.data;
    },
  });

  return (
    <div className="flex flex-col gap-6 p-2">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight text-black">Brand Dashboard</h1>
      </div>

      {/* Top Stats Row */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="bg-white shadow-sm border border-zinc-100">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-zinc-600">Creators Discovered</CardTitle>
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
              <div className="text-3xl font-bold text-black">1,204</div> /* Mocked as not explicitly provided by API dashboard endpoint but rather by DB length */
            )}
            <p className="text-xs text-zinc-500 mt-1">Verified creator network</p>
          </CardContent>
        </Card>

        <Card className="bg-white shadow-sm border border-zinc-100">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-zinc-600">Searches This Month</CardTitle>
            <Search className="h-4 w-4 text-zinc-400" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-20" />
            ) : (
              <div className="text-3xl font-bold text-black">{data?.recent_queries?.length ?? 0}</div>
            )}
            <p className="text-xs text-zinc-500 mt-1">Campaign queries run</p>
          </CardContent>
        </Card>

        <Card className="bg-white shadow-sm border border-zinc-100">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-zinc-600">Saved Creators</CardTitle>
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
              <path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z" />
            </svg>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-20" />
            ) : (
              <div className="text-3xl font-bold text-black">{data?.saved_creator_count ?? 0}</div>
            )}
            <p className="text-xs text-zinc-500 mt-1">Shortlisted candidates</p>
          </CardContent>
        </Card>
      </div>

      {/* Creator Search Section */}
      <div className="flex flex-col gap-4 mt-4">
        <h2 className="text-lg font-semibold text-black">Find Creators</h2>
        <form onSubmit={handleSearch} className="flex gap-3 max-w-3xl">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 h-4 w-4 text-zinc-400" />
            <Input
              placeholder="Search by campaign keyword (e.g., Organic Skincare)"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 bg-white border-zinc-200 text-black focus-visible:ring-[#1A7FE0] h-10"
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
            disabled={!searchQuery.trim() || searchMutation.isPending}
            className="bg-[#1A7FE0] hover:bg-blue-600 text-white h-10 px-6"
          >
            {searchMutation.isPending ? "Searching..." : "Search"}
          </Button>
        </form>

        {/* Search Results Grid */}
        {searchMutation.isSuccess && (
          <div className="mt-6">
            <h3 className="text-md font-semibold text-zinc-600 mb-4">Search Results</h3>
            {searchMutation.data?.length > 0 ? (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {searchMutation.data.map((creator: any) => (
                  <Card key={creator.id} className="bg-white border-zinc-200 shadow-sm hover:shadow-md transition-shadow">
                    <CardHeader className="pb-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-base text-black truncate max-w-[150px]" title={creator.handle || 'Unknown'}>
                            {creator.handle || 'Unknown Handle'}
                          </CardTitle>
                          <CardDescription className="text-zinc-500 capitalize">{creator.primary_niche}</CardDescription>
                        </div>
                        <Badge className="bg-[#E8F4FF] text-blue-700 hover:bg-[#d0e9ff] border-none font-bold">
                          {creator.current_answer_rank_score ?? 0}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0 flex flex-col gap-3">
                       <div className="flex justify-between text-sm text-zinc-600">
                          <span>Platform: <span className="font-medium text-black capitalize">{creator.platform || 'N/A'}</span></span>
                          <span>Followers: <span className="font-medium text-black">{creator.follower_count?.toLocaleString() || '0'}</span></span>
                       </div>
                       <Button
                          variant="outline"
                          className="w-full mt-2 border-zinc-200 text-black hover:bg-zinc-50 hover:text-black"
                          onClick={() => toast.success(`${creator.handle || 'Creator'} saved to your list!`)}
                       >
                          Save Creator
                       </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 bg-white border border-zinc-100 rounded-lg">
                <p className="text-zinc-500">No creators found matching your query.</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Saved Creators List */}
      <div className="flex flex-col gap-4 mt-8">
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
                 {MOCK_SAVED_CREATORS.map((creator) => (
                   <TableRow key={creator.id}>
                     <TableCell className="font-medium text-black">{creator.handle}</TableCell>
                     <TableCell className="capitalize">{creator.primary_niche}</TableCell>
                     <TableCell>
                        <Badge className="bg-[#E8F4FF] text-blue-700 hover:bg-[#d0e9ff] border-none font-bold">
                          {creator.current_answer_rank_score}
                        </Badge>
                     </TableCell>
                     <TableCell className="capitalize">{creator.platform}</TableCell>
                     <TableCell>{creator.follower_count.toLocaleString()}</TableCell>
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

    </div>
  );
}
