"use client";

// Verbatim port of `Edit Design Request (1)/src/pages/MentorAISetup.tsx`,
// wired to backend `/auth/me` (store AI config) and `/user/file-upload` (knowledge base files).

import React, { useEffect, useRef, useState } from "react";
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
  Upload,
  Sparkles,
  MessageCircle,
  Volume2,
  Brain,
  Zap,
} from "lucide-react";
import { motion } from "motion/react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useRouter } from "next/navigation";
import { useUpdateMeMutation } from "@/redux/services/haveme/user";
import { useGetUserDetailsQuery, useUploadFileMutation } from "@/redux/services/haveme";

const voiceTones = [
  { id: "professional", label: "Professional", description: "Clear, formal, and structured" },
  { id: "friendly", label: "Friendly", description: "Warm, approachable, and casual" },
  { id: "energetic", label: "Energetic", description: "Motivating, enthusiastic, and upbeat" },
  { id: "disciplined", label: "Discipline-Focused", description: "Direct, no-nonsense, accountability-driven" },
];

type KnowledgeFile = { id: string; name: string };

export default function MentorAISetupWired() {
  const router = useRouter();
  const { data: meRes } = useGetUserDetailsQuery();
  const me = (meRes as any)?.data ?? {};

  const [updateMe, { isLoading: saving }] = useUpdateMeMutation();
  const [uploadFile] = useUploadFileMutation();

  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState({
    voiceTone: "",
    knowledgeBase: [] as string[],
    trainingPhilosophy: "",
    nutritionPhilosophy: "",
    macroApproach: "",
    dietaryNotes: "",
  });
  const [knowledgeFiles, setKnowledgeFiles] = useState<KnowledgeFile[]>([]);
  const [previewMessage, setPreviewMessage] = useState("");

  const fileInputRef = useRef<HTMLInputElement>(null);

  const totalSteps = 6; // steps 0..5
  const progress = ((currentStep + 1) / totalSteps) * 100;

  useEffect(() => {
    // hydrate from backend user fields (if present) + localStorage fallback
    const next = {
      voiceTone: String(me?.mentorAiVoiceTone || ""),
      knowledgeBase: [] as string[],
      trainingPhilosophy: String(me?.mentorAiTrainingPhilosophy || ""),
      nutritionPhilosophy: String(me?.mentorAiNutritionPhilosophy || ""),
      macroApproach: String(me?.mentorAiMacroApproach || ""),
      dietaryNotes: String(me?.mentorAiDietaryNotes || ""),
    };

    try {
      const raw = window.localStorage.getItem("mentorAiSetup");
      if (raw) {
        const x = JSON.parse(raw);
        if (x?.voiceTone && !next.voiceTone) next.voiceTone = String(x.voiceTone);
        if (x?.trainingPhilosophy && !next.trainingPhilosophy) next.trainingPhilosophy = String(x.trainingPhilosophy);
        if (x?.nutritionPhilosophy && !next.nutritionPhilosophy) next.nutritionPhilosophy = String(x.nutritionPhilosophy);
        if (x?.macroApproach && !next.macroApproach) next.macroApproach = String(x.macroApproach);
        if (x?.dietaryNotes && !next.dietaryNotes) next.dietaryNotes = String(x.dietaryNotes);
        if (Array.isArray(x?.knowledgeBase)) next.knowledgeBase = x.knowledgeBase.map(String);
        if (Array.isArray(x?.knowledgeFiles)) setKnowledgeFiles(x.knowledgeFiles.map((k: any) => ({ id: String(k.id), name: String(k.name) })));
      }
    } catch {}

    setFormData((prev) => ({ ...prev, ...next }));
  }, [meRes]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleNext = async () => {
    if (currentStep < totalSteps - 1) {
      setCurrentStep(currentStep + 1);
      return;
    }

    // Persist AI config on final step
    try {
      await updateMe({
        mentorAiVoiceTone: formData.voiceTone,
        mentorAiKnowledgeBaseFileIds: knowledgeFiles.map((f) => f.id),
        mentorAiTrainingPhilosophy: formData.trainingPhilosophy,
        mentorAiNutritionPhilosophy: formData.nutritionPhilosophy,
        mentorAiMacroApproach: formData.macroApproach,
        mentorAiDietaryNotes: formData.dietaryNotes,
      } as any).unwrap();
    } catch {}

    try {
      window.localStorage.setItem(
        "mentorAiSetup",
        JSON.stringify({
          ...formData,
          knowledgeFiles,
        })
      );
    } catch {}

    router.push("/feature/design/mentor-dashboard");
  };

  const handleBack = () => {
    if (currentStep > 0) setCurrentStep(currentStep - 1);
  };

  const generatePreview = () => {
    const toneExamples: Record<string, string> = {
      professional:
        "Hello! I\u2019ve reviewed your training plan and I\u2019d recommend increasing your protein intake to 1.2g per pound of bodyweight to support your strength goals.",
      friendly:
        "Hey! I noticed you\u2019re doing great with consistency. Let\u2019s bump up your protein a bit to really fuel those gains!",
      energetic:
        "YES! You\u2019re crushing it! Let\u2019s level up your nutrition game\u2014more protein will supercharge your results!",
      disciplined:
        "Your effort is noted. Hit 1.2g protein per lb bodyweight daily. No excuses. This is how champions are built.",
    };
    setPreviewMessage(toneExamples[formData.voiceTone] || "");
  };

  const onChooseFiles = () => fileInputRef.current?.click();

  const handleFilesSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const picked = Array.from(files);
    for (const f of picked) {
      try {
        const fd = new FormData();
        fd.append("file", f);
        const res: any = await uploadFile(fd).unwrap();
        if (res?.id) {
          setKnowledgeFiles((prev) => [...prev, { id: String(res.id), name: f.name }]);
          setFormData((prev) => ({ ...prev, knowledgeBase: [...prev.knowledgeBase, f.name] }));
        }
      } catch {
        // ignore (export has no error UI)
      }
    }

    // reset input so selecting the same file again still triggers change
    try {
      e.target.value = "";
    } catch {}
  };

  return (
    <div className="min-h-screen bg-white flex flex-col" data-test="design-mentor-ai-setup-wired">
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
              <button onClick={() => router.push("/feature/design/mentor-dashboard")} className="text-gray-600 hover:text-gray-900 transition-colors">
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
                <div className="text-center space-y-4">
                  <div className="w-16 h-16 mx-auto bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center">
                    <Sparkles className="w-8 h-8 text-white" />
                  </div>
                  <h1 className="text-4xl">Configure Your AI Mentor</h1>
                  <p className="text-xl text-muted-foreground max-w-lg mx-auto">
                    Create an AI-powered version of yourself that can help your subscribers 24/7
                  </p>
                </div>

                <div className="grid gap-4 mt-12">
                  <Card className="border-purple-500/20 bg-gradient-to-br from-purple-500/5 to-transparent">
                    <CardContent className="p-6 flex items-start gap-4">
                      <div className="p-3 rounded-lg bg-purple-500/10">
                        <Zap className="w-6 h-6 text-purple-400" />
                      </div>
                      <div>
                        <h3 className="font-semibold mb-1">Instant Responses</h3>
                        <p className="text-sm text-muted-foreground">
                          Your AI mentor can answer subscriber questions immediately, even when you&apos;re busy
                        </p>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-purple-500/20 bg-gradient-to-br from-purple-500/5 to-transparent">
                    <CardContent className="p-6 flex items-start gap-4">
                      <div className="p-3 rounded-lg bg-purple-500/10">
                        <Brain className="w-6 h-6 text-purple-400" />
                      </div>
                      <div>
                        <h3 className="font-semibold mb-1">Your Knowledge, Amplified</h3>
                        <p className="text-sm text-muted-foreground">
                          Trained on your methods, philosophy, and content to sound authentically like you
                        </p>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-purple-500/20 bg-gradient-to-br from-purple-500/5 to-transparent">
                    <CardContent className="p-6 flex items-start gap-4">
                      <div className="p-3 rounded-lg bg-purple-500/10">
                        <MessageCircle className="w-6 h-6 text-purple-400" />
                      </div>
                      <div>
                        <h3 className="font-semibold mb-1">You&apos;re Still in Control</h3>
                        <p className="text-sm text-muted-foreground">
                          Review conversations, override responses, and update your AI&apos;s knowledge anytime
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            )}

            {/* Step 1: Voice/Tone Selection */}
            {currentStep === 1 && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-3xl mb-2">Choose Your AI&apos;s Voice</h2>
                  <p className="text-muted-foreground">Select the communication style that best matches your coaching approach</p>
                </div>

                <div className="grid gap-3">
                  {voiceTones.map((tone) => {
                    const isSelected = formData.voiceTone === tone.id;
                    return (
                      <button
                        key={tone.id}
                        onClick={() => setFormData({ ...formData, voiceTone: tone.id })}
                        className={`p-4 rounded-lg border-2 transition-all text-left ${
                          isSelected ? "border-purple-500 bg-purple-500/10" : "border-border hover:border-purple-500/50"
                        }`}
                      >
                        <div className="flex items-center gap-3 mb-2">
                          <Volume2 className={`w-5 h-5 ${isSelected ? "text-purple-400" : "text-muted-foreground"}`} />
                          <h3 className={`font-semibold ${isSelected ? "text-purple-400" : ""}`}>{tone.label}</h3>
                          {isSelected && <Check className="w-5 h-5 ml-auto text-purple-400" />}
                        </div>
                        <p className="text-sm text-muted-foreground">{tone.description}</p>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Step 2: Knowledge Base Upload */}
            {currentStep === 2 && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-3xl mb-2">Upload Your Knowledge Base</h2>
                  <p className="text-muted-foreground">
                    Share PDFs, notes, workout programs, and any content that represents your expertise
                  </p>
                </div>

                <Card>
                  <CardContent className="p-6 space-y-4">
                    <div className="border-2 border-dashed border-border rounded-lg p-8 text-center space-y-3">
                      <Upload className="w-10 h-10 mx-auto text-muted-foreground" />
                      <div>
                        <h4 className="font-medium mb-1">Drag &amp; drop or click to upload</h4>
                        <p className="text-sm text-muted-foreground">PDF, DOC, TXT files • Max 50MB per file</p>
                      </div>
                      <Button variant="outline" onClick={onChooseFiles}>
                        Choose Files
                      </Button>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept=".pdf,.doc,.docx,.txt"
                        multiple
                        className="hidden"
                        onChange={handleFilesSelected}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label className="text-sm text-muted-foreground">Suggested content:</Label>
                      <ul className="text-sm space-y-1 text-muted-foreground">
                        <li>• Training methodologies and workout programs</li>
                        <li>• Nutrition guides and meal planning strategies</li>
                        <li>• Client success stories and case studies</li>
                        <li>• Your coaching philosophy and principles</li>
                      </ul>
                    </div>

                    {knowledgeFiles.length > 0 && (
                      <div className="pt-2 space-y-1">
                        <Label className="text-sm text-muted-foreground">Selected files:</Label>
                        <ul className="text-sm text-muted-foreground space-y-1">
                          {knowledgeFiles.slice(0, 10).map((f) => (
                            <li key={f.id}>• {f.name}</li>
                          ))}
                          {knowledgeFiles.length > 10 && <li>• +{knowledgeFiles.length - 10} more</li>}
                        </ul>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Step 3: Training Philosophy */}
            {currentStep === 3 && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-3xl mb-2">Your Training Philosophy</h2>
                  <p className="text-muted-foreground">Help your AI understand your approach to training and coaching</p>
                </div>

                <Card>
                  <CardContent className="p-6 space-y-6">
                    <div className="space-y-2">
                      <Label htmlFor="trainingPhilosophy">Core Training Principles</Label>
                      <Textarea
                        id="trainingPhilosophy"
                        placeholder="Describe your training methodology, what you prioritize (e.g., progressive overload, movement quality, sustainability), and how you approach programming..."
                        value={formData.trainingPhilosophy}
                        onChange={(e) => setFormData({ ...formData, trainingPhilosophy: e.target.value })}
                        className="min-h-32"
                        maxLength={500}
                      />
                      <p className="text-xs text-muted-foreground">{formData.trainingPhilosophy.length}/500</p>
                    </div>

                    <div className="p-4 bg-muted rounded-lg space-y-2">
                      <h4 className="font-semibold text-sm">Example questions your AI will answer:</h4>
                      <ul className="text-sm text-muted-foreground space-y-1">
                        <li>• &quot;How many sets should I do for muscle growth?&quot;</li>
                        <li>• &quot;Can I substitute this exercise?&quot;</li>
                        <li>• &quot;What if I can only train 3 days per week?&quot;</li>
                      </ul>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Step 4: Nutrition Philosophy */}
            {currentStep === 4 && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-3xl mb-2">Your Nutrition Philosophy</h2>
                  <p className="text-muted-foreground">Define your approach to nutrition and dietary guidance</p>
                </div>

                <Card>
                  <CardContent className="p-6 space-y-6">
                    <div className="space-y-2">
                      <Label htmlFor="nutritionPhilosophy">Nutrition Approach</Label>
                      <Textarea
                        id="nutritionPhilosophy"
                        placeholder="Describe your nutrition philosophy (e.g., flexible dieting, whole foods focused, performance-based)..."
                        value={formData.nutritionPhilosophy}
                        onChange={(e) => setFormData({ ...formData, nutritionPhilosophy: e.target.value })}
                        className="min-h-24"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="macroApproach">Macro Approach</Label>
                      <Input
                        id="macroApproach"
                        placeholder="e.g., Moderate carb, high protein, flexible IIFYM"
                        value={formData.macroApproach}
                        onChange={(e) => setFormData({ ...formData, macroApproach: e.target.value })}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="dietaryNotes">Dietary Restrictions &amp; Preferences</Label>
                      <Textarea
                        id="dietaryNotes"
                        placeholder="How do you handle special diets, allergies, or food preferences?"
                        value={formData.dietaryNotes}
                        onChange={(e) => setFormData({ ...formData, dietaryNotes: e.target.value })}
                        className="min-h-20"
                      />
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Step 5: Preview */}
            {currentStep === 5 && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-3xl mb-2">Preview Your AI Mentor</h2>
                  <p className="text-muted-foreground">See how your AI mentor will interact with subscribers</p>
                </div>

                <Card>
                  <CardContent className="p-4 space-y-4">
                    <div className="flex items-center gap-3 pb-3 border-b">
                      <div className="relative">
                        <Avatar className="w-10 h-10">
                          <AvatarImage src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400" />
                          <AvatarFallback>AI</AvatarFallback>
                        </Avatar>
                        <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-purple-500 rounded-full border-2 border-background flex items-center justify-center">
                          <Sparkles className="w-2.5 h-2.5 text-white" />
                        </div>
                      </div>
                      <div>
                        <h4 className="font-semibold text-sm">AI Mentor (Preview)</h4>
                        <p className="text-xs text-muted-foreground">Powered by your knowledge</p>
                      </div>
                    </div>

                    <div className="flex justify-end">
                      <div className="bg-[hsl(var(--brand-medium-blue))] text-white rounded-2xl rounded-tr-sm px-4 py-2 max-w-[80%]">
                        <p className="text-sm">How much protein should I eat per day for building muscle?</p>
                      </div>
                    </div>

                    {!previewMessage ? (
                      <div className="flex justify-start">
                        <Button variant="outline" size="sm" onClick={generatePreview}>
                          Generate Response Preview
                        </Button>
                      </div>
                    ) : (
                      <div className="flex justify-start">
                        <div className="bg-muted rounded-2xl rounded-tl-sm px-4 py-2 max-w-[80%]">
                          <p className="text-sm">{previewMessage}</p>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card className="bg-purple-500/5 border-purple-500/20">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <Sparkles className="w-5 h-5 text-purple-400 flex-shrink-0 mt-0.5" />
                      <div>
                        <h4 className="font-semibold mb-1">Your AI is Learning</h4>
                        <p className="text-sm text-muted-foreground">
                          Your AI mentor will continue learning from your interactions and content updates. You can adjust its settings anytime from your dashboard.
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </motion.div>
        </div>
      </div>

      {/* Footer with Actions */}
      <div className="sticky bottom-0 bg-background border-t">
        <div className="max-w-2xl mx-auto px-4 py-4">
          <Button
            onClick={handleNext}
            disabled={
              saving ||
              (currentStep === 1 && !formData.voiceTone) ||
              (currentStep === 3 && !formData.trainingPhilosophy) ||
              (currentStep === 4 && !formData.nutritionPhilosophy)
            }
            className="w-full bg-gradient-to-r from-purple-500 to-blue-500 hover:opacity-90 text-white"
            size="lg"
          >
            {currentStep === totalSteps - 1 ? (
              <>
                <Check className="w-5 h-5 mr-2" />
                Activate AI Mentor
              </>
            ) : (
              <>
                Continue
                <ArrowRight className="w-5 h-5 ml-2" />
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}


