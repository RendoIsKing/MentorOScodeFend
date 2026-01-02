"use client";

// Verbatim-ish port of `Edit Design Request (1)/src/pages/PrivacySettingsPage.tsx`
// Backend does not currently expose these settings, so we persist locally for now.

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Lock, Users, MessageCircle, Shield } from "lucide-react";
import { useRouter } from "next/navigation";

type PrivacyPrefs = {
  privateAccount: boolean;
  showActivityStatus: boolean;
  allowMessages: "everyone" | "followers" | "no-one";
  whoCanSeeFollowers: "everyone" | "followers" | "only-me";
  whoCanTag: "everyone" | "followers" | "no-one";
};

const KEY = "designPrivacyPrefs";

export default function PrivacySettingsWired() {
  const router = useRouter();

  const [privateAccount, setPrivateAccount] = React.useState(false);
  const [showActivityStatus, setShowActivityStatus] = React.useState(true);
  const [allowMessages, setAllowMessages] = React.useState<PrivacyPrefs["allowMessages"]>("everyone");
  const [whoCanSeeFollowers, setWhoCanSeeFollowers] = React.useState<PrivacyPrefs["whoCanSeeFollowers"]>("everyone");
  const [whoCanTag, setWhoCanTag] = React.useState<PrivacyPrefs["whoCanTag"]>("everyone");

  React.useEffect(() => {
    try {
      const raw = window.localStorage.getItem(KEY);
      if (!raw) return;
      const x = JSON.parse(raw) as Partial<PrivacyPrefs>;
      if (typeof x.privateAccount === "boolean") setPrivateAccount(x.privateAccount);
      if (typeof x.showActivityStatus === "boolean") setShowActivityStatus(x.showActivityStatus);
      if (x.allowMessages) setAllowMessages(x.allowMessages);
      if (x.whoCanSeeFollowers) setWhoCanSeeFollowers(x.whoCanSeeFollowers);
      if (x.whoCanTag) setWhoCanTag(x.whoCanTag);
    } catch {}
  }, []);

  const handleSave = () => {
    try {
      const next: PrivacyPrefs = {
        privateAccount,
        showActivityStatus,
        allowMessages,
        whoCanSeeFollowers,
        whoCanTag,
      };
      window.localStorage.setItem(KEY, JSON.stringify(next));
    } catch {}
    router.back();
  };

  return (
    <div className="min-h-screen bg-white pb-24" data-test="design-privacy-settings">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white/80 backdrop-blur-xl border-b border-gray-200">
        <div className="container max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="icon" onClick={() => router.back()} className="hover:bg-gray-100">
                <ArrowLeft className="h-5 w-5 text-gray-900" />
              </Button>
              <h1 className="text-xl text-gray-900">Privacy Settings</h1>
            </div>
            <Button onClick={handleSave} className="bg-[hsl(var(--brand-medium-blue))] hover:bg-[hsl(var(--brand-dark-blue))] text-white">
              Save
            </Button>
          </div>
        </div>
      </div>

      <div className="container max-w-4xl mx-auto px-4 py-6 space-y-6">
        {/* Account Privacy */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Lock className="h-5 w-5 text-[hsl(var(--brand-medium-blue))]" />
              <CardTitle className="text-gray-900">Account Privacy</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-start justify-between gap-4 pb-4 border-b">
              <div className="flex-1">
                <Label className="font-medium cursor-pointer text-gray-900">Private Account</Label>
                <p className="text-sm text-gray-600">
                  When your account is private, only followers you approve can see your posts, followers, and following lists
                </p>
              </div>
              <Button
                variant={privateAccount ? "default" : "outline"}
                size="sm"
                onClick={() => setPrivateAccount(!privateAccount)}
                className={privateAccount ? "bg-[hsl(var(--brand-medium-blue))] hover:bg-[hsl(var(--brand-dark-blue))]" : ""}
              >
                {privateAccount ? "On" : "Off"}
              </Button>
            </div>

            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <Label className="font-medium cursor-pointer text-gray-900">Show Activity Status</Label>
                <p className="text-sm text-gray-600">Let others see when you're active on mentorio</p>
              </div>
              <Button
                variant={showActivityStatus ? "default" : "outline"}
                size="sm"
                onClick={() => setShowActivityStatus(!showActivityStatus)}
                className={showActivityStatus ? "bg-[hsl(var(--brand-medium-blue))] hover:bg-[hsl(var(--brand-dark-blue))]" : ""}
              >
                {showActivityStatus ? "On" : "Off"}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Messages */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <MessageCircle className="h-5 w-5 text-[hsl(var(--brand-medium-blue))]" />
              <CardTitle className="text-gray-900">Messages</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label className="font-medium mb-3 block text-gray-900">Who can send you messages?</Label>
              <div className="space-y-2">
                {(["everyone", "followers", "no-one"] as const).map((key) => (
                  <button
                    key={key}
                    onClick={() => setAllowMessages(key)}
                    className={`w-full flex items-center justify-between p-3 rounded-lg border transition-colors ${
                      allowMessages === key
                        ? "border-[hsl(var(--brand-medium-blue))] bg-[hsl(var(--brand-medium-blue))]/5"
                        : "border-border hover:bg-muted/50"
                    }`}
                  >
                    <span className="text-gray-900">
                      {key === "everyone" ? "Everyone" : key === "followers" ? "People you follow" : "No one"}
                    </span>
                    {allowMessages === key && <div className="h-4 w-4 rounded-full bg-[hsl(var(--brand-medium-blue))]" />}
                  </button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Content Visibility */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-[hsl(var(--brand-medium-blue))]" />
              <CardTitle className="text-gray-900">Content Visibility</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label className="font-medium mb-3 block text-gray-900">Who can see your followers?</Label>
              <div className="space-y-2">
                {(["everyone", "followers", "only-me"] as const).map((key) => (
                  <button
                    key={key}
                    onClick={() => setWhoCanSeeFollowers(key)}
                    className={`w-full flex items-center justify-between p-3 rounded-lg border transition-colors ${
                      whoCanSeeFollowers === key
                        ? "border-[hsl(var(--brand-medium-blue))] bg-[hsl(var(--brand-medium-blue))]/5"
                        : "border-border hover:bg-muted/50"
                    }`}
                  >
                    <span className="text-gray-900">
                      {key === "everyone" ? "Everyone" : key === "followers" ? "Only people you follow" : "Only me"}
                    </span>
                    {whoCanSeeFollowers === key && <div className="h-4 w-4 rounded-full bg-[hsl(var(--brand-medium-blue))]" />}
                  </button>
                ))}
              </div>
            </div>

            <div className="pt-4 border-t">
              <Label className="font-medium mb-3 block text-gray-900">Who can tag you in posts?</Label>
              <div className="space-y-2">
                {(["everyone", "followers", "no-one"] as const).map((key) => (
                  <button
                    key={key}
                    onClick={() => setWhoCanTag(key)}
                    className={`w-full flex items-center justify-between p-3 rounded-lg border transition-colors ${
                      whoCanTag === key
                        ? "border-[hsl(var(--brand-medium-blue))] bg-[hsl(var(--brand-medium-blue))]/5"
                        : "border-border hover:bg-muted/50"
                    }`}
                  >
                    <span className="text-gray-900">
                      {key === "everyone" ? "Everyone" : key === "followers" ? "People you follow" : "No one"}
                    </span>
                    {whoCanTag === key && <div className="h-4 w-4 rounded-full bg-[hsl(var(--brand-medium-blue))]" />}
                  </button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Note */}
        <Card className="border-blue-100 bg-gradient-to-r from-blue-50/50 to-indigo-50/30 shadow-sm">
          <CardContent className="p-4 flex items-start gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Shield className="w-5 h-5 text-blue-600" />
            </div>
            <div className="text-sm">
              <p className="text-gray-900 mb-1">Note</p>
              <p className="text-gray-600">
                These settings are saved on your device for now. If you want these stored server-side, we can add backend fields later.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}


