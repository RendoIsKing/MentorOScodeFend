"use client";

// Port of `Edit Design Request (1)/src/pages/UserProfilePage.tsx` wired to real backend data.
// Note: we keep the export layout/classes for the main screen and grid; post modal interactions are simplified for now.

import React, { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  MessageCircle,
  Share2,
  MoreVertical,
  Flame,
  TrendingUp,
  Target,
  Award,
  Link,
  AlertTriangle,
  UserX,
  VolumeX,
  Heart,
  Bookmark,
  Play,
  Dumbbell,
  Clock,
  Zap,
  Grid,
  UserPlus,
} from "lucide-react";
import { ImageWithFallback } from "@/components/design/figma/ImageWithFallback";
import { useGetUserDetailsByUserNameQuery, useFollowUserMutation } from "@/redux/services/haveme/user";
import { useGetUserDetailsQuery } from "@/redux/services/haveme";
import { useGetPostsByUserNameQuery } from "@/redux/services/haveme/posts";
import { adaptPostsToProfileThumbs, adaptUserToUiV2ProfileUser } from "@/lib/adapters/profile";
import { createConversation } from "@/lib/api/conversations";

function formatCount(n: any): string {
  const num = Number(n || 0);
  if (Number.isNaN(num)) return "0";
  if (num >= 1_000_000) return `${(num / 1_000_000).toFixed(1).replace(/\.0$/, "")}M`;
  if (num >= 1_000) return `${(num / 1_000).toFixed(1).replace(/\.0$/, "")}K`;
  return String(num);
}

export default function UserProfilePageWired() {
  const router = useRouter();
  const params = useParams() as any;
  const uid = String(params?.uid || "");

  const { data: meRes } = useGetUserDetailsQuery();
  const meRaw = (meRes as any)?.data;

  const { data: userRes } = useGetUserDetailsByUserNameQuery({ userName: uid } as any, { skip: !uid });
  const targetRaw = (userRes as any)?.data ?? {};
  const user = useMemo(() => adaptUserToUiV2ProfileUser(targetRaw), [targetRaw]);

  const isOwnProfile =
    Boolean(meRaw?._id && user.id && String(meRaw._id) === String(user.id)) ||
    Boolean(meRaw?.userName && uid && String(meRaw.userName).toLowerCase() === uid.toLowerCase());

  // Route-level behavior to match design flows:
  // - Own profile should use the dedicated self-profile screen
  // - Mentors should use the mentor public profile screen
  useEffect(() => {
    if (!uid) return;
    if (isOwnProfile) {
      router.replace("/feature/design/profile");
      return;
    }
    if (Boolean(targetRaw?.isMentor)) {
      router.replace(`/feature/design/mentor/${encodeURIComponent(uid)}`);
    }
  }, [router, uid, isOwnProfile, targetRaw?.isMentor]);

  const [followUser, { isLoading: followBusy }] = useFollowUserMutation();
  const [isFollowing, setIsFollowing] = useState<boolean>(Boolean(targetRaw?.isFollowing));
  useEffect(() => setIsFollowing(Boolean(targetRaw?.isFollowing)), [targetRaw?.isFollowing, targetRaw?._id]);

  const onFollowToggle = async () => {
    if (followBusy || !user.id) return;
    try {
      const res: any = await (followUser as any)({ followingTo: user.id }).unwrap?.();
      const next = Boolean(res?.data?.isFollowing ?? !isFollowing);
      setIsFollowing(next);
    } catch {}
  };

  const onMessage = () => {
    const unameNorm = String(user.userName || uid).toLowerCase().replace(/[^a-z0-9]/g, "");
    if (unameNorm === "coachmajen") return router.push("/coach-majen");
    if (!user.id) return;
    createConversation(String(user.id))
      .then((id) => router.push(`/feature/design/chat-wired?conversationId=${encodeURIComponent(id)}`))
      .catch(() => {});
  };

  const { data: postsRes } = useGetPostsByUserNameQuery(
    { userName: uid, page: 1, perPage: 60, filter: "posts" } as any,
    { skip: !uid }
  );
  const postsRaw = (postsRes as any)?.data ?? [];
  const thumbs = useMemo(() => adaptPostsToProfileThumbs(postsRaw), [postsRaw]);

  const stats = useMemo(
    () => [
      { label: "Posts", value: formatCount(targetRaw?.postsCount ?? 0) },
      { label: "Followers", value: formatCount(targetRaw?.followersCount ?? 0) },
      { label: "Following", value: formatCount(targetRaw?.followingCount ?? 0) },
    ],
    [targetRaw]
  );

  const achievements = [
    { icon: Flame, label: "30 Day Streak", color: "text-stats-primary", bg: "bg-stats-primary/10" },
    { icon: TrendingUp, label: "Top Performer", color: "text-training-primary", bg: "bg-training-primary/10" },
    { icon: Target, label: "Goal Crusher", color: "text-goals-primary", bg: "bg-goals-primary/10" },
    { icon: Award, label: "Community Leader", color: "text-brand-primary", bg: "bg-brand-primary/10" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white pb-20" data-test="design-user-profile-wired">
      {/* Header with Banner */}
      <div className="relative">
        <div
          className="h-56 bg-gradient-to-br from-[#00AEEF]/20 via-[#0078D7]/20 to-[#004C97]/20 relative"
          style={
            user.coverUrl ? { backgroundImage: `url(${user.coverUrl})`, backgroundSize: "cover", backgroundPosition: "center" } : {}
          }
        >
          <div className="absolute top-4 left-4 z-10">
            <Button size="icon" onClick={() => router.back()} className="bg-white/90 hover:bg-white text-gray-900 backdrop-blur-sm shadow-lg h-10 w-10 rounded-full">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </div>
          <div className="absolute top-4 right-4 z-10">
            <Button size="icon" className="bg-white/90 hover:bg-white text-gray-900 backdrop-blur-sm shadow-lg h-10 w-10 rounded-full">
              <MoreVertical className="h-5 w-5" />
            </Button>
          </div>
        </div>

        <div className="max-w-4xl mx-auto px-4">
          <div className="relative -mt-20">
            <div className="flex items-end gap-4">
              <div className="h-36 w-36 border-4 border-white shadow-2xl ring-4 ring-gray-100 rounded-full overflow-hidden bg-gradient-to-br from-[#00AEEF] to-[#0078D7]">
                {user.avatarUrl ? (
                  <img src={user.avatarUrl} alt={user.fullName} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-white">
                    <UserPlus className="h-16 w-16" />
                  </div>
                )}
              </div>

              <div className="flex-1 pb-2">
                <div className="flex items-center gap-2 mb-1">
                  <h1 className="text-3xl text-gray-900">{user.fullName || user.userName}</h1>
                  {Boolean(targetRaw?.isMentor) && (
                    <Badge className="bg-gradient-to-r from-[#00AEEF] to-[#0078D7] text-white border-0 shadow-sm">
                      <Award className="h-3 w-3 mr-1" />
                      Mentor
                    </Badge>
                  )}
                </div>
                <p className="text-gray-500">@{user.userName || uid}</p>
              </div>
            </div>

            <div className="mt-6 space-y-4">
              <p className="text-gray-700 max-w-2xl leading-relaxed">{String(targetRaw?.bio || "")}</p>

              {!isOwnProfile && (
                <div className="grid grid-cols-2 gap-3">
                  <Button
                    variant={isFollowing ? "outline" : "default"}
                    className={
                      isFollowing
                        ? "gap-2 border-2 border-[#0078D7] text-[#0078D7] hover:bg-[#0078D7]/5 h-12 rounded-xl"
                        : "gap-2 bg-gradient-to-r from-[#00AEEF] to-[#0078D7] hover:from-[#0078D7] hover:to-[#004C97] text-white shadow-lg shadow-[#00AEEF]/20 h-12 rounded-xl"
                    }
                    onClick={onFollowToggle}
                    disabled={followBusy}
                  >
                    <UserPlus className="h-4 w-4" />
                    {isFollowing ? "Following" : "Follow"}
                  </Button>
                  <Button
                    variant="outline"
                    className="gap-2 border-2 border-[#0078D7] text-[#0078D7] hover:bg-[#0078D7]/5 h-12 rounded-xl"
                    onClick={onMessage}
                  >
                    <MessageCircle className="h-4 w-4" />
                    Message
                  </Button>
                </div>
              )}

              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
                <div className="flex justify-around items-center">
                  {stats.map((stat, index) => (
                    <button
                      key={index}
                      onClick={() => {
                        if (stat.label === "Followers") router.push(`/followers?uid=${encodeURIComponent(user.id)}&tab=followers`);
                        if (stat.label === "Following") router.push(`/followers?uid=${encodeURIComponent(user.id)}&tab=following`);
                      }}
                      className="flex flex-col items-center text-center hover:opacity-80 transition-opacity flex-1 group"
                      disabled={stat.label === "Posts"}
                    >
                      <p className="text-2xl text-gray-900 group-hover:text-[#0078D7] transition-colors">{stat.value}</p>
                      <p className="text-sm text-gray-500">{stat.label}</p>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 mt-6">
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center gap-2 mb-5">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-amber-500/10 to-amber-500/5 flex items-center justify-center">
              <Award className="h-5 w-5 text-amber-500" />
            </div>
            <div>
              <h3 className="text-lg text-gray-900">Achievements</h3>
              <p className="text-xs text-gray-500">Highlights</p>
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {achievements.map((a, i) => {
              const Icon = a.icon;
              return (
                <div key={i} className={`flex flex-col items-center gap-3 p-4 rounded-xl ${a.bg} border border-gray-100 hover:shadow-md transition-all cursor-pointer`}>
                  <div className="h-12 w-12 rounded-xl bg-white/50 flex items-center justify-center">
                    <Icon className={`h-6 w-6 ${a.color}`} />
                  </div>
                  <p className={`text-xs text-center ${a.color}`}>{a.label}</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 mt-6 pb-6">
        <Tabs defaultValue="posts" className="w-full">
          <TabsList className="w-full grid grid-cols-2 bg-white p-1.5 rounded-xl shadow-sm border-2 border-gray-200">
            <TabsTrigger value="posts" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#00AEEF] data-[state=active]:to-[#0078D7] data-[state=active]:text-white text-gray-700 font-medium data-[state=active]:shadow-md rounded-lg transition-all">
              <Grid className="h-4 w-4 mr-2" />
              Posts
            </TabsTrigger>
            <TabsTrigger value="saved" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#00AEEF] data-[state=active]:to-[#0078D7] data-[state=active]:text-white text-gray-700 font-medium data-[state=active]:shadow-md rounded-lg transition-all">
              <Bookmark className="h-4 w-4 mr-2" />
              Saved
            </TabsTrigger>
          </TabsList>

          <TabsContent value="posts" className="mt-6">
            <div className="grid grid-cols-3 gap-2">
              {thumbs.map((p, idx) => (
                <div key={p.id} className="aspect-square overflow-hidden rounded-xl shadow-sm border border-gray-100 group cursor-pointer">
                  <ImageWithFallback src={p.thumbUrl} alt={`Post ${idx + 1}`} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="saved" className="mt-6">
            <div className="bg-white rounded-2xl p-12 shadow-sm border border-gray-100">
              <p className="text-gray-600 text-center">Saved posts will be wired to the existing saved-posts backend next.</p>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}


