"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, HelpCircle, Bug, Mail } from "lucide-react";
import { useRouter } from "next/navigation";

export default function HelpSupportWired() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white pb-24" data-test="design-help-support">
      <div className="sticky top-0 z-10 bg-white/80 backdrop-blur-xl border-b border-gray-200">
        <div className="max-w-3xl mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => router.back()} className="hover:bg-gray-100 rounded-full">
              <ArrowLeft className="h-5 w-5 text-gray-900" />
            </Button>
            <div>
              <h1 className="text-xl text-gray-900">Help & Support</h1>
              <p className="text-xs text-gray-500">Get help and contact support</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-6 space-y-4">
        <Card className="border-gray-100">
          <CardContent className="p-5 flex items-start gap-4">
            <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-cyan-500/10 to-cyan-500/5 flex items-center justify-center">
              <HelpCircle className="h-6 w-6 text-cyan-600" />
            </div>
            <div className="flex-1">
              <p className="text-gray-900">FAQ</p>
              <p className="text-sm text-gray-500 mt-0.5">Common questions and answers</p>
              <div className="mt-3">
                <Button variant="outline" className="rounded-xl" onClick={() => router.push("/settings/help")}>
                  Open FAQ
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-gray-100">
          <CardContent className="p-5 flex items-start gap-4">
            <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-rose-500/10 to-rose-500/5 flex items-center justify-center">
              <Bug className="h-6 w-6 text-rose-600" />
            </div>
            <div className="flex-1">
              <p className="text-gray-900">Report a problem</p>
              <p className="text-sm text-gray-500 mt-0.5">Something isn’t working? Tell us.</p>
              <div className="mt-3">
                <Button variant="outline" className="rounded-xl" onClick={() => router.push("/settings/report-a-problem")}>
                  Report
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-gray-100">
          <CardContent className="p-5 flex items-start gap-4">
            <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-blue-500/10 to-blue-500/5 flex items-center justify-center">
              <Mail className="h-6 w-6 text-blue-600" />
            </div>
            <div className="flex-1">
              <p className="text-gray-900">Contact</p>
              <p className="text-sm text-gray-500 mt-0.5">Send us an email</p>
              <div className="mt-3">
                <Button
                  variant="outline"
                  className="rounded-xl"
                  onClick={() => {
                    try {
                      window.location.href = "mailto:support@mentorio.app";
                    } catch {}
                  }}
                >
                  Email support
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}


