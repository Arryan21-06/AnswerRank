import { Card, CardContent } from "@/components/ui/card";
import { Sparkles } from "lucide-react";

export default function CampaignPage() {
  return (
    <div className="flex flex-col gap-6 p-2 h-full min-h-[calc(100vh-12rem)]">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight text-black">Campaign Studio</h1>
      </div>

      <div className="flex-1 flex items-center justify-center">
        <Card className="bg-white shadow-sm border border-zinc-100 max-w-md w-full">
          <CardContent className="flex flex-col items-center justify-center p-12 text-center space-y-4">
            <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center text-[#1A7FE0] mb-2">
              <Sparkles className="w-6 h-6" />
            </div>
            <h2 className="text-xl font-semibold text-black">Coming Soon</h2>
            <p className="text-sm text-zinc-500">
              We&apos;re working hard to bring you the Campaign Studio. Check back soon for updates to help you manage your campaigns!
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
