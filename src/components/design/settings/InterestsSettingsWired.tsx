"use client";

// Port of `Edit Design Request (1)/src/pages/InterestsSettingsPage.tsx`
// Wired to backend interests endpoints: GET /interests, POST /interests/user

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, X, Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { useGetUserDetailsQuery, useGetInterestsQuery, useUpdateInterestsMutation } from "@/redux/services/haveme";

export default function InterestsSettingsWired() {
  const router = useRouter();
  const { data: meRes, refetch: refetchMe } = useGetUserDetailsQuery();
  const me = (meRes as any)?.data ?? {};

  const { data: interestsRes } = useGetInterestsQuery();
  const all = (interestsRes as any)?.data ?? [];

  const [updateInterests, { isLoading: saving }] = useUpdateInterestsMutation();

  const initialSelected = React.useMemo(() => {
    const raw = (me?.interests ?? []) as any[];
    // can be array of ObjectIds or populated objects
    return raw.map((x) => String(x?._id || x)).filter(Boolean);
  }, [meRes]);

  const [selectedIds, setSelectedIds] = React.useState<string[]>([]);
  const [newInterest, setNewInterest] = React.useState("");

  React.useEffect(() => {
    setSelectedIds(initialSelected);
  }, [initialSelected]);

  const selectedObjects = React.useMemo(() => {
    const map = new Map<string, any>(all.map((i: any) => [String(i?._id), i]));
    return selectedIds.map((id) => map.get(id)).filter(Boolean);
  }, [all, selectedIds]);

  const addByTitle = () => {
    const t = newInterest.trim();
    if (!t) return;
    const found = all.find((x: any) => String(x?.title || "").toLowerCase() === t.toLowerCase());
    if (!found?._id) return;
    const id = String(found._id);
    if (selectedIds.includes(id)) return;
    if (selectedIds.length >= 10) return;
    setSelectedIds([...selectedIds, id]);
    setNewInterest("");
  };

  const toggleId = (id: string) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter((x) => x !== id));
    } else {
      if (selectedIds.length >= 10) return;
      setSelectedIds([...selectedIds, id]);
    }
  };

  const removeId = (id: string) => setSelectedIds(selectedIds.filter((x) => x !== id));

  const handleSave = async () => {
    try {
      await updateInterests({ interestIds: selectedIds } as any).unwrap();
      refetchMe();
    } catch {}
    router.back();
  };

  return (
    <div className="min-h-screen bg-white pb-24" data-test="design-interests-settings">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white/80 backdrop-blur-xl border-b border-gray-200">
        <div className="container max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="icon" onClick={() => router.back()} className="hover:bg-gray-100">
                <ArrowLeft className="h-5 w-5 text-gray-900" />
              </Button>
              <h1 className="text-xl text-gray-900">Interests & Topics</h1>
            </div>
            <Button
              onClick={handleSave}
              disabled={saving}
              className="bg-[hsl(var(--brand-medium-blue))] hover:bg-[hsl(var(--brand-dark-blue))] text-white"
            >
              Save
            </Button>
          </div>
        </div>
      </div>

      <div className="container max-w-4xl mx-auto px-4 py-6 space-y-6">
        {/* Your Interests */}
        <Card>
          <CardHeader>
            <CardTitle className="text-gray-900">Your Interests</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-gray-600">
              Add topics you&apos;re interested in to help personalize your feed and connect with like-minded people.
            </p>

            <div className="flex flex-wrap gap-2">
              {selectedObjects.map((i: any) => (
                <Badge key={String(i._id)} variant="secondary" className="pr-1 text-gray-900">
                  {String(i.title || "")}
                  <button onClick={() => removeId(String(i._id))} className="ml-2 hover:bg-muted rounded-full p-0.5">
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
              {selectedIds.length === 0 && <p className="text-sm text-gray-600 italic">No interests added yet. Add some below!</p>}
            </div>

            {selectedIds.length < 10 && (
              <div className="flex gap-2">
                <Input
                  value={newInterest}
                  onChange={(e) => setNewInterest(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addByTitle();
                    }
                  }}
                  placeholder="Add an interest (e.g., Running, Yoga, Nutrition)"
                  maxLength={30}
                  className="text-gray-900 bg-white border-gray-300"
                />
                <Button
                  onClick={addByTitle}
                  variant="outline"
                  size="icon"
                  disabled={!newInterest.trim()}
                  className="border-[hsl(var(--brand-medium-blue))] text-[hsl(var(--brand-medium-blue))] hover:bg-[hsl(var(--brand-medium-blue))]/10 disabled:border-muted disabled:text-muted-foreground"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            )}

            <div className="bg-white p-3 rounded-lg border border-gray-200">
              <p className="text-xs text-gray-600">Add up to 10 interests. {selectedIds.length}/10</p>
            </div>
          </CardContent>
        </Card>

        {/* Suggested Topics */}
        <Card>
          <CardHeader>
            <CardTitle className="text-gray-900">Suggested Topics</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 mb-4">Popular topics you might be interested in:</p>
            <div className="flex flex-wrap gap-2">
              {Array.isArray(all) &&
                all.slice(0, 30).map((topic: any) => {
                  const id = String(topic?._id || "");
                  const title = String(topic?.title || "");
                  const isSelected = selectedIds.includes(id);
                  return (
                    <Button
                      key={id}
                      variant="outline"
                      size="sm"
                      onClick={() => toggleId(id)}
                      disabled={!id || (!isSelected && selectedIds.length >= 10)}
                      className="border-[hsl(var(--brand-medium-blue))]/30 text-[hsl(var(--brand-medium-blue))] hover:bg-[hsl(var(--brand-medium-blue))]/10 disabled:opacity-50"
                    >
                      {isSelected ? <X className="h-3 w-3 mr-1" /> : <Plus className="h-3 w-3 mr-1" />}
                      {title}
                    </Button>
                  );
                })}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}


