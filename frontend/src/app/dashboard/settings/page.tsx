"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { toast } from "sonner";

export default function SettingsPage() {
  const [fullName, setFullName] = useState("");
  // In a real app we'd fetch this from context or an API
  const email = "user@example.com";

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    // Simulate save
    toast.success("Settings saved successfully!");
  };

  return (
    <div className="flex flex-col gap-6 p-2">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight text-black">Settings</h1>
      </div>

      <div className="max-w-2xl">
        <Card className="bg-white shadow-sm border border-zinc-100">
          <CardHeader>
            <CardTitle>Profile Settings</CardTitle>
            <CardDescription>
              Update your personal information.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSave} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-black">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  disabled
                  className="bg-zinc-50 border-zinc-200 text-zinc-500"
                />
                <p className="text-xs text-zinc-500">Your email address cannot be changed.</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="fullName" className="text-black">Full Name</Label>
                <Input
                  id="fullName"
                  placeholder="John Doe"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="bg-white border-zinc-200 text-black focus-visible:ring-[#1A7FE0]"
                />
              </div>

              <Button type="submit" className="bg-[#1A7FE0] hover:bg-blue-600 text-white w-full sm:w-auto">
                Save Changes
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
