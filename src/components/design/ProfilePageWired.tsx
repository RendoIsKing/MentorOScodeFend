"use client";

// Verbatim port of `Edit Design Request (1)/src/pages/ProfilePage.tsx` wired to real data.

import React, { useMemo, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  Settings,
  Flame,
  TrendingUp,
  Target,
  Award,
  Edit,
  Bookmark,
  User,
  Image as ImageIcon,
  LayoutDashboard,
  Heart,
  MessageCircle,
  Eye,
  Grid,
  Sparkles,
  Camera,
} from "lucide-react";
import { useRouter } from "next/navigation";
import EmptyState from "@/components/EmptyState";
import DesignBottomNav from "@/components/design/DesignBottomNav";
import { ImageWithFallback } from "@/components/design/figma/ImageWithFallback";
import { useGetUserDetailsQuery } from "@/redux/services/haveme";
import { useGetPostsByUserNameQuery } from "@/redux/services/haveme/posts";
import { adaptPostsToProfileThumbs, adaptUserToUiV2ProfileUser } from "@/lib/adapters/profile";

function formatCount(n: any): string {
  const num = Number(n || 0);
  if (Number.isNaN(num)) return "0";
  if (num >= 1_000_000) return `${(num / 1_000_000).toFixed(1).replace(/\.0$/, "")}M`;
  if (num >= 1_000) return `${(num / 1_000).toFixed(1).replace(/\.0$/, "")}K`;
  return String(num);
}

export default function ProfilePageWired() {
  const router = useRouter();
  const { data: meRes } = useGetUserDetailsQuery();
  const meRaw = (meRes as any)?.data ?? {};
  const me = useMemo(() => adaptUserToUiV2ProfileUser(meRaw), [meRaw]);

  const userName = String(meRaw?.userName || "");
  const { data: postsRes } = useGetPostsByUserNameQuery(
    { userName, page: 1, perPage: 60, filter: "posts" } as any,
    { skip: !userName }
  );
  const postsRaw = (postsRes as any)?.data ?? [];
  const thumbs = useMemo(() => adaptPostsToProfileThumbs(postsRaw), [postsRaw]);

  const posts = useMemo(() => thumbs.map((p) => p.thumbUrl), [thumbs]);

  const [showCreatePostDialog, setShowCreatePostDialog] = useState(false);

  const stats = [
    { label: "Posts", value: formatCount((meRaw as any)?.postsCount ?? 0) },
    { label: "Followers", value: formatCount((meRaw as any)?.followersCount ?? 0) },
    { label: "Following", value: formatCount((meRaw as any)?.followingCount ?? 0) },
  ];

  const achievements = [
    { icon: Flame, label: "30 Day Streak", color: "text-orange-500", bg: "from-orange-500/10 to-orange-500/5" },
    { icon: TrendingUp, label: "Top Performer", color: "text-emerald-500", bg: "from-emerald-500/10 to-emerald-500/5" },
    { icon: Target, label: "Goal Crusher", color: "text-purple-500", bg: "from-purple-500/10 to-purple-500/5" },
    { icon: Award, label: "Community Leader", color: "text-[#0078D7]", bg: "from-[#0078D7]/10 to-[#0078D7]/5" },
  ];

  const interests: string[] = Array.isArray(meRaw?.interests) ? [] : [];

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white pb-20" data-test="design-profile-wired">
      {/* Header with Cover */}
      <div className="relative">
        <div
          className="h-56 bg-gradient-to-br from-[#00AEEF]/20 via-[#0078D7]/20 to-[#004C97]/20 relative"
          style={
            me.coverUrl
              ? { backgroundImage: `url(${me.coverUrl})`, backgroundSize: "cover", backgroundPosition: "center" }
              : {}
          }
        >
          {/* Settings Button */}
          <div className="absolute top-4 right-4 z-10">
            <Button
              size="icon"
              onClick={() => router.push("/settings")}
              className="bg-white/90 hover:bg-white text-gray-900 backdrop-blur-sm shadow-lg h-10 w-10 rounded-full"
            >
              <Settings className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Profile Section */}
        <div className="max-w-4xl mx-auto px-4">
          <div className="relative -mt-20">
            <div className="flex items-end gap-4">
              {/* Profile Picture */}
              <div className="relative group">
                <div className="h-36 w-36 border-4 border-white shadow-2xl ring-4 ring-gray-100 rounded-full overflow-hidden bg-gradient-to-br from-[#00AEEF] to-[#0078D7]">
                  {me.avatarUrl ? (
                    <img src={me.avatarUrl} alt={me.fullName} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <User className="h-20 w-20 text-white" />
                    </div>
                  )}
                </div>
                <button className="absolute bottom-0 right-0 h-10 w-10 bg-gradient-to-r from-[#00AEEF] to-[#0078D7] hover:from-[#0078D7] hover:to-[#004C97] text-white rounded-full shadow-lg flex items-center justify-center transition-all transform hover:scale-110">
                  <Camera className="h-5 w-5" />
                </button>
              </div>

              {/* Name & Edit Button */}
              <div className="flex-1 pb-2">
                <div className="flex items-center gap-2 mb-1">
                  <h1 className="text-3xl text-gray-900">{me.fullName || me.userName}</h1>
                  {Boolean(meRaw?.isMentor) && (
                    <Badge className="bg-gradient-to-r from-[#00AEEF] to-[#0078D7] text-white border-0 shadow-sm">
                      <Award className="h-3 w-3 mr-1" />
                      Mentor
                    </Badge>
                  )}
                </div>
                <p className="text-gray-500">@{me.userName}</p>
              </div>

              {/* Edit Button - Desktop */}
              <div className="hidden sm:block pb-2">
                <Button
                  variant="outline"
                  className="gap-2 border-2 border-[#0078D7] text-[#0078D7] hover:bg-[#0078D7]/5 h-11 px-6 rounded-xl"
                  onClick={() => router.push("/edit-profile")}
                >
                  <Edit className="h-4 w-4" />
                  Edit Profile
                </Button>
              </div>
            </div>

            {/* Bio & Actions */}
            <div className="mt-6 space-y-4">
              <p className="text-gray-700 max-w-2xl leading-relaxed">{String(meRaw?.bio || "")}</p>

              {/* Edit Button - Mobile */}
              <div className="sm:hidden">
                <Button
                  variant="outline"
                  className="w-full gap-2 border-2 border-[#0078D7] text-[#0078D7] hover:bg-[#0078D7]/5 h-11 rounded-xl"
                  onClick={() => router.push("/edit-profile")}
                >
                  <Edit className="h-4 w-4" />
                  Edit Profile
                </Button>
              </div>

              {/* Mentor Dashboard Access */}
              {Boolean(meRaw?.isMentor) && (
                <div className="bg-gradient-to-br from-[#00AEEF]/5 via-[#0078D7]/5 to-[#004C97]/5 rounded-2xl p-4 border-2 border-[#00AEEF]/30 shadow-sm relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-[#00AEEF]/20 to-transparent rounded-full blur-2xl"></div>
                  <Button
                    className="w-full gap-2 bg-gradient-to-r from-[#00AEEF] to-[#0078D7] hover:from-[#0078D7] hover:to-[#004C97] text-white shadow-lg shadow-[#00AEEF]/20 h-14 rounded-xl relative z-10"
                    onClick={() => router.push("/feature/design/mentor-dashboard")}
                  >
                    <LayoutDashboard className="h-5 w-5" />
                    Open Mentor Dashboard
                    <Sparkles className="h-4 w-4 ml-auto" />
                  </Button>
                </div>
              )}

              {/* Interests */}
              {interests.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {interests.map((interest, index) => (
                    <Badge
                      key={index}
                      variant="secondary"
                      className="bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-200 px-3 py-1"
                    >
                      {interest}
                    </Badge>
                  ))}
                </div>
              )}

              {/* Stats */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
                <div className="flex justify-around items-center">
                  {stats.map((stat, index) => (
                    <button
                      key={index}
                      onClick={() => {
                        if (stat.label === "Followers") {
                          router.push(`/followers?uid=${encodeURIComponent(me.id)}&tab=followers`);
                        } else if (stat.label === "Following") {
                          router.push(`/followers?uid=${encodeURIComponent(me.id)}&tab=following`);
                        }
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

      {/* Achievements */}
      <div className="max-w-4xl mx-auto px-4 mt-6">
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center gap-2 mb-5">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-amber-500/10 to-amber-500/5 flex items-center justify-center">
              <Award className="h-5 w-5 text-amber-500" />
            </div>
            <div>
              <h3 className="text-lg text-gray-900">My Achievements</h3>
              <p className="text-xs text-gray-500">Your accomplishments</p>
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {achievements.map((achievement, index) => {
              const Icon = achievement.icon;
              return (
                <div
                  key={index}
                  className={`flex flex-col items-center gap-3 p-4 rounded-xl bg-gradient-to-br ${achievement.bg} border border-gray-100 hover:shadow-md transition-all cursor-pointer`}
                >
                  <div className="h-12 w-12 rounded-xl bg-white/50 flex items-center justify-center">
                    <Icon className={`h-6 w-6 ${achievement.color}`} />
                  </div>
                  <p className={`text-xs text-center ${achievement.color}`}>{achievement.label}</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Content Tabs */}
      <div className="max-w-4xl mx-auto px-4 mt-6 pb-6">
        <Tabs defaultValue="posts" className="w-full">
          <TabsList className="w-full grid grid-cols-3 bg-white p-1.5 rounded-xl shadow-sm border-2 border-gray-200">
            <TabsTrigger
              value="posts"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#00AEEF] data-[state=active]:to-[#0078D7] data-[state=active]:text-white text-gray-700 font-medium data-[state=active]:shadow-md rounded-lg transition-all"
            >
              <Grid className="h-4 w-4 mr-2" />
              Posts
            </TabsTrigger>
            <TabsTrigger
              value="saved"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#00AEEF] data-[state=active]:to-[#0078D7] data-[state=active]:text-white text-gray-700 font-medium data-[state=active]:shadow-md rounded-lg transition-all"
            >
              <Bookmark className="h-4 w-4 mr-2" />
              Saved
            </TabsTrigger>
            <TabsTrigger
              value="stats"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#00AEEF] data-[state=active]:to-[#0078D7] data-[state=active]:text-white text-gray-700 font-medium data-[state=active]:shadow-md rounded-lg transition-all"
            >
              <TrendingUp className="h-4 w-4 mr-2" />
              Stats
            </TabsTrigger>
          </TabsList>

          <TabsContent value="posts" className="mt-6">
            {posts.length === 0 ? (
              <div className="bg-white rounded-2xl p-12 shadow-sm border border-gray-100">
                <EmptyState
                  icon={ImageIcon}
                  title="No posts yet"
                  description="Share your fitness journey with the community. Your posts will appear here."
                  iconColor="hsl(var(--brand-medium-blue))"
                  iconBgColor="hsl(var(--brand-medium-blue)/0.1)"
                />
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-2">
                {posts.map((post, index) => (
                  <div key={index} className="aspect-square overflow-hidden rounded-xl shadow-sm border border-gray-100 group cursor-pointer">
                    <ImageWithFallback
                      src={post}
                      alt={`Post ${index + 1}`}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="saved" className="mt-6">
            <div className="bg-white rounded-2xl p-12 shadow-sm border border-gray-100">
              <EmptyState
                icon={Bookmark}
                title="No saved posts"
                description="Posts you save will appear here for easy access later."
                iconColor="hsl(var(--brand-medium-blue))"
                iconBgColor="hsl(var(--brand-medium-blue)/0.1)"
              />
            </div>
          </TabsContent>

          <TabsContent value="stats" className="mt-6 pb-24">
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <Card className="bg-gradient-to-br from-[#00AEEF]/10 to-[#00AEEF]/5 border-[#00AEEF]/30 shadow-sm rounded-2xl">
                  <CardContent className="p-5">
                    <div className="flex items-start justify-between mb-3">
                      <div className="w-12 h-12 rounded-xl bg-white/50 flex items-center justify-center">
                        <Grid className="w-6 h-6 text-[#00AEEF]" />
                      </div>
                    </div>
                    <p className="text-3xl text-gray-900 mb-1">{formatCount((meRaw as any)?.postsCount ?? 0)}</p>
                    <p className="text-sm text-gray-600">Total Posts</p>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-rose-500/10 to-rose-500/5 border-rose-500/30 shadow-sm rounded-2xl">
                  <CardContent className="p-5">
                    <div className="flex items-start justify-between mb-3">
                      <div className="w-12 h-12 rounded-xl bg-white/50 flex items-center justify-center">
                        <Heart className="w-6 h-6 text-rose-500" />
                      </div>
                    </div>
                    <p className="text-3xl text-gray-900 mb-1">{formatCount((meRaw as any)?.totalLikes ?? 0)}</p>
                    <p className="text-sm text-gray-600">Likes Received</p>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-violet-500/10 to-violet-500/5 border-violet-500/30 shadow-sm rounded-2xl">
                  <CardContent className="p-5">
                    <div className="flex items-start justify-between mb-3">
                      <div className="w-12 h-12 rounded-xl bg-white/50 flex items-center justify-center">
                        <MessageCircle className="w-6 h-6 text-violet-500" />
                      </div>
                    </div>
                    <p className="text-3xl text-gray-900 mb-1">0</p>
                    <p className="text-sm text-gray-600">Comments</p>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-emerald-500/10 to-emerald-500/5 border-emerald-500/30 shadow-sm rounded-2xl">
                  <CardContent className="p-5">
                    <div className="flex items-start justify-between mb-3">
                      <div className="w-12 h-12 rounded-xl bg-white/50 flex items-center justify-center">
                        <Eye className="w-6 h-6 text-emerald-500" />
                      </div>
                    </div>
                    <p className="text-3xl text-gray-900 mb-1">0</p>
                    <p className="text-sm text-gray-600">Profile Views</p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      <DesignBottomNav
        currentPage="profile"
        onNavigate={(page) => {
          if (page === "home") router.push("/home");
          else if (page === "chat") router.push("/room");
          else if (page === "search") router.push("/feature/design/search");
          else if (page === "profile") router.push("/feature/design/profile");
        }}
        onCreateClick={() => setShowCreatePostDialog(true)}
      />

      {/* Create Post Flow (wired later) */}
      {showCreatePostDialog && (
        <div
          className="fixed inset-0 z-50 flex items-start justify-center p-4 pt-16 pb-28"
          style={{ backgroundColor: "rgba(0, 0, 0, 0.05)" }}
          onClick={() => setShowCreatePostDialog(false)}
        >
          <div
            className="bg-white rounded-2xl max-w-lg w-full flex flex-col shadow-2xl overflow-hidden p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <p className="text-gray-900 font-semibold mb-2">Create</p>
            <p className="text-gray-600 text-sm mb-4">Post creation flow will be wired to the existing backend uploader next.</p>
            <Button onClick={() => setShowCreatePostDialog(false)} className="bg-[#0078D7] hover:bg-[#004C97]">
              Close
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}


