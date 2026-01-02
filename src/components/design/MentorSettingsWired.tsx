"use client";

// Verbatim port of `Edit Design Request (1)/src/pages/MentorSettingsPage.tsx`,
// wired to backend `/auth/me` via RTK `useUpdateMeMutation`.

import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Award, Star, LayoutDashboard } from "lucide-react";
import { useRouter } from "next/navigation";
import { useGetUserDetailsQuery } from "@/redux/services/haveme";
import { useUpdateMeMutation } from "@/redux/services/haveme/user";
import { useGetSubscriberListQuery } from "@/redux/services/haveme/user";

export default function MentorSettingsWired() {
  const router = useRouter();
  const { data: meRes, refetch: refetchMe } = useGetUserDetailsQuery();
  const me = (meRes as any)?.data ?? {};
  const myId = String(me?._id || "");

  const [updateMe, { isLoading: isSaving }] = useUpdateMeMutation();

  const [isMentor, setIsMentor] = useState(Boolean(me?.isMentor));
  const [mentorBio, setMentorBio] = useState(String(me?.mentorBio || ""));
  const [expertise, setExpertise] = useState(
    Array.isArray(me?.mentorExpertise) ? me.mentorExpertise.join(", ") : String(me?.expertise || "")
  );
  const [rate, setRate] = useState(String(me?.rate || ""));
  const [availability, setAvailability] = useState(String(me?.availability || ""));

  // Load current profile data when query updates
  useEffect(() => {
    setIsMentor(Boolean(me?.isMentor));
    setMentorBio(String(me?.mentorBio || ""));
    setExpertise(Array.isArray(me?.mentorExpertise) ? me.mentorExpertise.join(", ") : String(me?.expertise || ""));
    setRate(String(me?.rate || ""));
    setAvailability(String(me?.availability || ""));

    // Preserve export behavior: apply localStorage mentorProfile if it exists (but don't override user edits)
    try {
      const raw = window.localStorage.getItem("mentorProfile");
      if (!raw) return;
      if (!Boolean(me?.isMentor)) return;
      const mentorProfile = JSON.parse(raw);
      if (!mentorProfile?.setupCompleted) return;

      if (mentorProfile.mentorBio && !String(me?.mentorBio || "")) setMentorBio(String(mentorProfile.mentorBio));
      if ((mentorProfile.expertise?.length || mentorProfile.customExpertise?.length) && !String(me?.expertise || "")) {
        const all = [...(mentorProfile.expertise || []), ...(mentorProfile.customExpertise || [])].filter(Boolean);
        setExpertise(all.join(", "));
      }
      if (mentorProfile.monthlyPrice && !String(me?.rate || "")) setRate(String(mentorProfile.monthlyPrice));
    } catch {}
  }, [meRes]); // eslint-disable-line react-hooks/exhaustive-deps

  const { data: subscriberRes } = useGetSubscriberListQuery(myId as any, { skip: !myId || !isMentor });
  const menteeCount = Array.isArray((subscriberRes as any)?.data) ? (subscriberRes as any).data.length : 0;

  const handleSave = async () => {
    // Backend supports mentor fields we added (isMentor + mentorExpertise + optional rating fields etc).
    const expertiseList = expertise
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    try {
      await updateMe({
        isMentor,
        mentorBio,
        mentorExpertise: expertiseList,
        rate,
        availability,
      } as any).unwrap();
      router.push("/settings");
    } catch {
      // keep UI silent for now (export had no toasts)
    }
  };

  const handleStartMentorOnboarding = () => {
    // Persist mentor status right away so UI updates immediately (badge + dashboard entry points).
    // Onboarding will fill in the rest of the mentor profile fields.
    (async () => {
      try {
        await updateMe({ isMentor: true } as any).unwrap();
        refetchMe();
      } catch {}
      router.push("/feature/design/mentor-onboarding");
    })();
  };

  const handleCancel = () => {
    router.push("/settings");
  };

  return (
    <div className="min-h-screen bg-white pb-20" data-test="design-mentor-settings-wired">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white border-b border-gray-200">
        <div className="container max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={handleCancel} className="text-gray-900 hover:bg-gray-100">
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-xl text-gray-900">Mentor Mode</h1>
          </div>
        </div>
      </div>

      <div className="container max-w-4xl mx-auto px-4 py-6 space-y-6">
        {/* Quick Access to Mentor Dashboard - Only shown if already a mentor */}
        {isMentor && (
          <Card className="border-[#0078D7]/30 bg-gradient-to-br from-[#00AEEF]/5 to-transparent">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-[#0078D7]/10 rounded-lg">
                    <LayoutDashboard className="h-5 w-5 text-[#0078D7]" />
                  </div>
                  <div>
                    <p className="text-gray-900 font-medium">Mentor Dashboard</p>
                    <p className="text-sm text-gray-600">Manage subscribers, content, and messages</p>
                  </div>
                </div>
                <Button
                  size="sm"
                  className="bg-[#0078D7] hover:bg-[#004C97] text-white"
                  onClick={() => router.push("/feature/design/mentor-dashboard")}
                >
                  Open Dashboard
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Become a Mentor or Mentor Status */}
        <Card className="border-[#00AEEF]/50 bg-[#00AEEF]/5">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Award className="h-5 w-5 text-[#00AEEF]" />
              <CardTitle className="text-gray-900">Mentor Mode</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <p className="text-gray-900 mb-1">{isMentor ? "Mentor Status" : "Become a Mentor"}</p>
                <p className="text-sm text-gray-600">
                  {isMentor
                    ? "You are currently a mentor. Manage your mentor profile and settings below."
                    : "Share your expertise, build your community, and earn income. Start your mentor journey today!"}
                </p>
              </div>
              {!isMentor && (
                <Button
                  size="sm"
                  onClick={handleStartMentorOnboarding}
                  className="bg-[#00AEEF] hover:bg-[#0078D7] text-white whitespace-nowrap"
                >
                  Become a Mentor
                </Button>
              )}
              {isMentor && (
                <Button
                  variant="outline"
                  size="sm"
                  className="text-red-600 border-red-300 hover:bg-red-50"
                  onClick={() => setIsMentor(false)}
                >
                  Disable
                </Button>
              )}
            </div>

            {isMentor && (
              <div className="pt-4 space-y-4 border-t border-gray-200">
                <div className="space-y-2">
                  <Label htmlFor="mentorBio" className="text-gray-900">
                    Mentor Bio
                  </Label>
                  <Textarea
                    id="mentorBio"
                    value={mentorBio}
                    onChange={(e) => setMentorBio(e.target.value)}
                    placeholder="Describe your mentoring approach, experience, and what mentees can expect from working with you..."
                    rows={4}
                    maxLength={500}
                    className="bg-white border-gray-300 text-gray-900 placeholder:text-gray-400"
                  />
                  <p className="text-xs text-gray-500 text-right">{mentorBio.length}/500 characters</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="expertise" className="text-gray-900">
                    Areas of Expertise
                  </Label>
                  <Input
                    id="expertise"
                    value={expertise}
                    onChange={(e) => setExpertise(e.target.value)}
                    placeholder="e.g., Strength Training, Nutrition, Marathon Running"
                    className="bg-white border-gray-300 text-gray-900 placeholder:text-gray-400"
                  />
                  <p className="text-xs text-gray-500">Separate multiple areas with commas</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="rate" className="text-gray-900">
                      Hourly Rate
                    </Label>
                    <div className="flex items-center">
                      <span className="px-3 py-2 bg-gray-100 border border-gray-300 border-r-0 rounded-l-md text-gray-600">
                        $
                      </span>
                      <Input
                        id="rate"
                        type="number"
                        value={rate}
                        onChange={(e) => setRate(e.target.value)}
                        placeholder="50"
                        className="rounded-l-none bg-white border-gray-300 text-gray-900"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="availability" className="text-gray-900">
                      Weekly Availability
                    </Label>
                    <Input
                      id="availability"
                      type="number"
                      value={availability}
                      onChange={(e) => setAvailability(e.target.value)}
                      placeholder="10"
                      max="40"
                      className="bg-white border-gray-300 text-gray-900"
                    />
                    <p className="text-xs text-gray-500">Hours per week</p>
                  </div>
                </div>

                <div className="bg-gray-50 border border-gray-200 p-4 rounded-lg flex items-start gap-3">
                  <Star className="h-5 w-5 text-[#00AEEF] flex-shrink-0 mt-0.5" />
                  <div className="text-sm">
                    <p className="text-gray-900 mb-1">Mentor Benefits:</p>
                    <ul className="space-y-1 text-gray-600">
                      <li>• Get featured in the mentor discovery feed</li>
                      <li>• Earn from 1-on-1 sessions and group programs</li>
                      <li>• Build your personal brand and following</li>
                      <li>• Access mentor-only tools and analytics</li>
                    </ul>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Mentor Stats (simple real data) */}
        {isMentor && (
          <Card className="border-gray-200">
            <CardHeader>
              <CardTitle className="text-gray-900">Your Mentor Stats</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <p className="text-2xl text-[#0078D7]">{menteeCount}</p>
                  <p className="text-sm text-gray-600">Total Mentees</p>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <p className="text-2xl text-[#0078D7]">0</p>
                  <p className="text-sm text-gray-600">Sessions</p>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <p className="text-2xl text-[#0078D7]">{me?.mentorRating ?? "-"}</p>
                  <p className="text-sm text-gray-600">Rating</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Action Buttons - Only show when user is already a mentor */}
        {isMentor && (
          <div className="flex gap-3 pt-4">
            <Button variant="outline" className="flex-1 border-gray-300 text-gray-900 hover:bg-gray-100" onClick={handleCancel}>
              Cancel
            </Button>
            <Button className="flex-1 bg-[#0078D7] hover:bg-[#004C97] text-white" onClick={handleSave} disabled={isSaving}>
              Save Changes
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}


