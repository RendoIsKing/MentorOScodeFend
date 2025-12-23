"use client";

// Verbatim port of `Edit Design Request (1)/src/pages/MentorOnboardingFlow.tsx`,
// wired to backend `/auth/me` via RTK `useUpdateMeMutation`.

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Users,
  DollarSign,
  Award,
  Upload,
  Sparkles,
  Heart,
  Brain,
  Dumbbell,
  Utensils,
  TrendingUp,
  Target,
  Briefcase,
  Mic,
  Clock,
  Wind,
  Activity,
  Scale,
  Lightbulb,
  Zap,
  MessageSquare,
  Plus,
  X,
} from "lucide-react";
import { motion } from "motion/react";
import { useRouter } from "next/navigation";
import { useUpdateMeMutation } from "@/redux/services/haveme/user";
import { useCreateProductPlanMutation, useGetPlanDetailsQuery } from "@/redux/services/haveme/subscription";
import { useGetUserDetailsQuery } from "@/redux/services/haveme";

const mentorOSLogo = "/assets/images/mentorio-logo.svg";

const expertiseOptions = [
  { id: "fitness", label: "Fitness Training", icon: Dumbbell },
  { id: "nutrition", label: "Nutrition", icon: Utensils },
  { id: "mindset", label: "Mindset & Mental Health", icon: Brain },
  { id: "habits", label: "Habit Coaching", icon: Target },
  { id: "wellness", label: "Wellness", icon: Heart },
  { id: "business", label: "Business & Career", icon: TrendingUp },
  { id: "life-coaching", label: "Life Coaching", icon: Lightbulb },
  { id: "relationships", label: "Relationship Coaching", icon: MessageSquare },
  { id: "finance", label: "Financial Planning", icon: DollarSign },
  { id: "leadership", label: "Leadership Development", icon: Award },
  { id: "public-speaking", label: "Public Speaking", icon: Mic },
  { id: "time-management", label: "Time Management", icon: Clock },
  { id: "stress", label: "Stress Management", icon: Wind },
  { id: "sports", label: "Sports Performance", icon: Activity },
  { id: "weight-loss", label: "Weight Loss", icon: Scale },
  { id: "productivity", label: "Productivity", icon: Zap },
  { id: "career", label: "Career Transitions", icon: Briefcase },
];

function parseYearsExperience(level: string): number | undefined {
  const s = (level || "").trim();
  if (!s) return undefined;
  if (s.includes("10+")) return 10;
  const m = s.match(/(\d+)\s*-\s*(\d+)/);
  if (m) return Number(m[2]);
  const n = Number(s.replace(/[^\d]/g, ""));
  return Number.isFinite(n) ? n : undefined;
}

export default function MentorOnboardingWired() {
  const router = useRouter();
  const [updateMe, { isLoading: isSaving }] = useUpdateMeMutation();
  const [createProductPlan] = useCreateProductPlanMutation();
  const { data: plansData } = useGetPlanDetailsQuery();
  const { data: meRes } = useGetUserDetailsQuery();
  const me = (meRes as any)?.data ?? {};

  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState({
    expertise: [] as string[],
    customExpertise: [] as string[],
    experienceLevel: "",
    certifications: [] as string[],
    monthlyPrice: "",
    offerFreeTrial: false,
  });
  const [customTag, setCustomTag] = useState("");

  const totalSteps = 4;
  const progress = ((currentStep + 1) / totalSteps) * 100;

  const toggleExpertise = (id: string) => {
    setFormData((prev) => ({
      ...prev,
      expertise: prev.expertise.includes(id) ? prev.expertise.filter((e) => e !== id) : [...prev.expertise, id],
    }));
  };

  const addCustomExpertise = () => {
    const t = customTag.trim();
    if (t && !formData.customExpertise.includes(t)) {
      setFormData((prev) => ({ ...prev, customExpertise: [...prev.customExpertise, t] }));
      setCustomTag("");
    }
  };

  const removeCustomExpertise = (tag: string) => {
    setFormData((prev) => ({ ...prev, customExpertise: prev.customExpertise.filter((t) => t !== tag) }));
  };

  const handleBack = () => {
    if (currentStep > 0) setCurrentStep(currentStep - 1);
  };

  const handleCancel = () => {
    router.push("/settings");
  };

  const completeSetup = async () => {
    const expertiseLabels = formData.expertise
      .map((id) => expertiseOptions.find((o) => o.id === id)?.label)
      .filter(Boolean) as string[];
    const allExpertise = [...expertiseLabels, ...formData.customExpertise].filter(Boolean);
    const years = parseYearsExperience(formData.experienceLevel);
    const monthlyPrice = Math.max(0, Number(formData.monthlyPrice || 0));

    // Preserve export behavior: save to localStorage
    try {
      const mentorProfile = {
        expertise: formData.expertise,
        customExpertise: formData.customExpertise,
        experienceLevel: formData.experienceLevel,
        certifications: formData.certifications,
        monthlyPrice: formData.monthlyPrice,
        offerFreeTrial: formData.offerFreeTrial,
        setupCompleted: true,
        completedAt: new Date().toISOString(),
      };
      window.localStorage.setItem("mentorProfile", JSON.stringify(mentorProfile));
    } catch {}

    // Persist mentor flags in backend
    try {
      await updateMe({
        isMentor: true,
        mentorExpertise: allExpertise,
        mentorCertifications: formData.certifications,
        mentorYearsExperience: years,
        mentorHasFreeTrial: formData.offerFreeTrial,
      } as any).unwrap();
    } catch {}

    // Best-effort: auto-create a FIXED subscription plan if none exists.
    // If Stripe is not configured, this may fail; we still complete onboarding.
    try {
      const existingFixed = (plansData as any)?.data?.find?.((p: any) => p?.planType === "fixed" && !p?.isDeleted);
      if (!existingFixed && monthlyPrice >= 25) {
        await createProductPlan({
          planType: "fixed",
          title: `${String(me?.userName || "Mentor")} Subscription`,
          price: Math.round(monthlyPrice * 100),
          entitlements: [],
        } as any).unwrap();
      }
    } catch {}

    router.push("/feature/design/mentor-dashboard");
  };

  const handleNext = async () => {
    if (currentStep < totalSteps - 1) {
      setCurrentStep(currentStep + 1);
      return;
    }
    await completeSetup();
  };

  const disableNext =
    isSaving ||
    (currentStep === 1 && formData.expertise.length === 0) ||
    (currentStep === 2 && !formData.experienceLevel) ||
    (currentStep === 3 && (!formData.monthlyPrice || parseFloat(formData.monthlyPrice) < 25));

  return (
    <div className="min-h-screen bg-white flex flex-col" data-test="design-mentor-onboarding-wired">
      {/* Header with Progress */}
      <div className="sticky top-0 z-50 bg-white border-b border-gray-200">
        <div className="max-w-2xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            {currentStep > 0 && (
              <button onClick={handleBack} className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors">
                <ArrowLeft className="w-5 h-5" />
                <span>Back</span>
              </button>
            )}
            {currentStep === 0 && (
              <button onClick={handleCancel} className="text-gray-600 hover:text-gray-900 transition-colors">
                Cancel
              </button>
            )}
            <div className="ml-auto text-sm text-gray-600">
              Step {currentStep + 1} of {totalSteps}
            </div>
          </div>
          <Progress value={progress} className="h-2" />
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto pb-24">
        <div className="max-w-2xl mx-auto px-4 py-8">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            {/* Step 0: Welcome */}
            {currentStep === 0 && (
              <div className="space-y-8">
                <div className="flex justify-center">
                  <img src={mentorOSLogo} alt="mentorio" className="h-20 w-20" />
                </div>
                <div className="text-center space-y-4">
                  <h1 className="text-4xl text-gray-900">Become a Mentor on mentorio</h1>
                  <p className="text-xl text-gray-600 max-w-lg mx-auto">
                    Share your expertise, build your community, and earn income by helping others achieve their goals
                  </p>
                </div>

                <div className="grid gap-4 mt-12">
                  <Card className="border-[#00AEEF]/20">
                    <CardContent className="p-6 flex items-start gap-4">
                      <div className="p-3 rounded-lg bg-[#00AEEF]/10">
                        <Users className="w-6 h-6 text-[#00AEEF]" />
                      </div>
                      <div>
                        <h3 className="text-gray-900 mb-1">Build Your Community</h3>
                        <p className="text-sm text-gray-600">
                          Connect with motivated individuals seeking guidance in your area of expertise
                        </p>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-[#00AEEF]/20">
                    <CardContent className="p-6 flex items-start gap-4">
                      <div className="p-3 rounded-lg bg-[#00AEEF]/10">
                        <DollarSign className="w-6 h-6 text-[#00AEEF]" />
                      </div>
                      <div>
                        <h3 className="text-gray-900 mb-1">Earn on Your Terms</h3>
                        <p className="text-sm text-gray-600">
                          Set your own pricing and manage your availability—you&apos;re in control
                        </p>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-[#00AEEF]/20">
                    <CardContent className="p-6 flex items-start gap-4">
                      <div className="p-3 rounded-lg bg-[#00AEEF]/10">
                        <Award className="w-6 h-6 text-[#00AEEF]" />
                      </div>
                      <div>
                        <h3 className="text-gray-900 mb-1">Make an Impact</h3>
                        <p className="text-sm text-gray-600">
                          Help others transform their lives while growing your personal brand
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            )}

            {/* Step 1: Choose Expertise */}
            {currentStep === 1 && (
              <div className="space-y-6">
                <div className="text-center space-y-2">
                  <h2 className="text-3xl text-gray-900">What&apos;s your expertise?</h2>
                  <p className="text-gray-600">Select all areas where you can provide guidance (choose at least 1)</p>
                </div>

                <div className="grid gap-3">
                  {expertiseOptions.map((option) => {
                    const Icon = option.icon;
                    const isSelected = formData.expertise.includes(option.id);
                    return (
                      <button
                        key={option.id}
                        onClick={() => toggleExpertise(option.id)}
                        className={`p-4 rounded-lg border-2 transition-all text-left flex items-center gap-4 ${
                          isSelected ? "border-[#0078D7] bg-[#0078D7]/5" : "border-gray-200 hover:border-gray-300 bg-white"
                        }`}
                      >
                        <div className={`p-2 rounded-lg ${isSelected ? "bg-[#0078D7]/10" : "bg-gray-100"}`}>
                          <Icon className={`w-5 h-5 ${isSelected ? "text-[#0078D7]" : "text-gray-600"}`} />
                        </div>
                        <span className={`flex-1 ${isSelected ? "text-gray-900" : "text-gray-700"}`}>{option.label}</span>
                        {isSelected && <Check className="w-5 h-5 text-[#0078D7]" />}
                      </button>
                    );
                  })}
                </div>

                {/* Custom Expertise Tags */}
                <div className="space-y-3 pt-4 border-t border-gray-200">
                  <Label className="text-gray-900">Add Custom Expertise (Optional)</Label>
                  <div className="flex gap-2">
                    <Input
                      value={customTag}
                      onChange={(e) => setCustomTag(e.target.value)}
                      placeholder="e.g., Yoga, Meditation, etc."
                      onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addCustomExpertise())}
                      className="bg-white border-gray-300 text-gray-900"
                    />
                    <Button onClick={addCustomExpertise} variant="outline" className="border-[#0078D7] text-[#0078D7] hover:bg-[#0078D7]/10">
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                  {formData.customExpertise.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {formData.customExpertise.map((tag, index) => (
                        <div key={index} className="px-3 py-1 bg-[#00AEEF]/10 text-[#0078D7] rounded-full text-sm flex items-center gap-2">
                          {tag}
                          <button onClick={() => removeCustomExpertise(tag)}>
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Step 2: Experience & Credentials */}
            {currentStep === 2 && (
              <div className="space-y-6">
                <div className="text-center space-y-2">
                  <h2 className="text-3xl text-gray-900">Share your experience</h2>
                  <p className="text-gray-600">Help mentees understand your background and qualifications</p>
                </div>

                <div className="space-y-6">
                  <div className="space-y-3">
                    <Label className="text-gray-900">Years of Experience</Label>
                    <div className="grid grid-cols-2 gap-3">
                      {["1-2 years", "3-5 years", "6-10 years", "10+ years"].map((level) => (
                        <button
                          key={level}
                          onClick={() => setFormData({ ...formData, experienceLevel: level })}
                          className={`p-4 rounded-lg border-2 transition-all ${
                            formData.experienceLevel === level
                              ? "border-[#0078D7] bg-[#0078D7]/5 text-gray-900"
                              : "border-gray-200 hover:border-gray-300 bg-white text-gray-700"
                          }`}
                        >
                          {level}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-3">
                    <Label className="text-gray-900">Certifications & Credentials (Optional)</Label>
                    <p className="text-sm text-gray-600">Add any relevant certifications, degrees, or professional credentials</p>
                    <Textarea
                      value={formData.certifications.join("\n")}
                      onChange={(e) =>
                        setFormData({ ...formData, certifications: e.target.value.split("\n").map((x) => x.trim()).filter((c) => c) })
                      }
                      placeholder={
                        "e.g., Certified Personal Trainer (NASM)\nNutrition Coach Certification\nBachelor's Degree in Exercise Science"
                      }
                      rows={4}
                      className="bg-white border-gray-300 text-gray-900 placeholder:text-gray-400"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Pricing */}
            {currentStep === 3 && (
              <div className="space-y-6">
                <div className="text-center space-y-2">
                  <h2 className="text-3xl text-gray-900">Set your pricing</h2>
                  <p className="text-gray-600">Choose a monthly subscription price for your mentees</p>
                </div>

                <div className="space-y-6">
                  <div className="space-y-3">
                    <Label htmlFor="monthly-price" className="text-gray-900">
                      Monthly Subscription Price
                    </Label>
                    <div className="flex items-center">
                      <span className="px-4 py-2 bg-gray-100 border border-gray-300 border-r-0 rounded-l-md text-gray-600">$</span>
                      <Input
                        id="monthly-price"
                        type="number"
                        value={formData.monthlyPrice}
                        onChange={(e) => setFormData({ ...formData, monthlyPrice: e.target.value })}
                        placeholder="29"
                        min="25"
                        className="rounded-l-none bg-white border-gray-300 text-gray-900"
                      />
                    </div>
                    <p className="text-sm text-gray-600">Recommended range: $25-$99/month</p>
                  </div>

                  <Card className="bg-[#00AEEF]/5 border-[#00AEEF]/20">
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <Sparkles className="w-5 h-5 text-[#00AEEF] flex-shrink-0 mt-0.5" />
                        <div className="text-sm text-gray-900">
                          <p className="mb-2">What mentees get for their subscription:</p>
                          <ul className="space-y-1 text-gray-600">
                            <li>• Access to your exclusive content and insights</li>
                            <li>• Direct messaging and Q&A support</li>
                            <li>• Monthly group sessions or workshops</li>
                            <li>• Community access with other mentees</li>
                          </ul>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <div className="flex items-center justify-between p-4 border-2 border-gray-200 rounded-lg bg-white">
                    <div>
                      <p className="text-gray-900">Offer 7-day free trial</p>
                      <p className="text-sm text-gray-600">Let mentees try before they commit</p>
                    </div>
                    <button
                      onClick={() => setFormData({ ...formData, offerFreeTrial: !formData.offerFreeTrial })}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        formData.offerFreeTrial ? "bg-[#0078D7]" : "bg-gray-300"
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          formData.offerFreeTrial ? "translate-x-6" : "translate-x-1"
                        }`}
                      />
                    </button>
                  </div>

                  <Card className="border-gray-200">
                    <div className="p-6 space-y-4">
                      <div>
                        <h4 className="text-gray-900 mb-2">Expertise Areas</h4>
                        <div className="flex flex-wrap gap-2">
                          {formData.expertise.map((id) => {
                            const option = expertiseOptions.find((o) => o.id === id);
                            return (
                              <div key={id} className="px-3 py-1 bg-[#00AEEF]/10 text-[#0078D7] rounded-full text-sm">
                                {option?.label}
                              </div>
                            );
                          })}
                          {formData.customExpertise.map((tag, index) => (
                            <div key={index} className="px-3 py-1 bg-[#00AEEF]/10 text-[#0078D7] rounded-full text-sm">
                              {tag}
                            </div>
                          ))}
                        </div>
                      </div>
                      <div>
                        <h4 className="text-gray-900 mb-2">Experience</h4>
                        <p className="text-gray-600">{formData.experienceLevel || "Not specified"}</p>
                      </div>
                      <div>
                        <h4 className="text-gray-900 mb-2">Monthly Price</h4>
                        <p className="text-gray-600">
                          ${formData.monthlyPrice || "0"}/month
                          {formData.offerFreeTrial && <span className="text-[#0078D7] ml-2">(with 7-day free trial)</span>}
                        </p>
                      </div>
                    </div>
                  </Card>
                </div>
              </div>
            )}
          </motion.div>
        </div>
      </div>

      {/* Footer with Actions */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4">
        <div className="max-w-2xl mx-auto">
          <Button
            onClick={handleNext}
            disabled={disableNext}
            className="w-full bg-[#0078D7] hover:bg-[#004C97] text-white disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {currentStep === totalSteps - 1 ? "Complete Setup" : "Continue"}
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
        </div>
      </div>
    </div>
  );
}


