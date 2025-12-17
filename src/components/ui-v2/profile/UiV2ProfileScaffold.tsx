"use client";

import React from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { Award, Camera, Edit, MessageCircle, Settings } from "lucide-react";
import { cn } from "@/lib/utils";
import type { UiV2ProfilePostThumb, UiV2ProfileUser } from "@/lib/adapters/profile";

export function UiV2ProfileScaffold({
  mode,
  user,
  isOwnProfile,
  isFollowing,
  onSettings,
  onEditProfile,
  onBecomeMentor,
  onFollowToggle,
  onMessage,
  onFollowers,
  onFollowing,
  posts,
}: {
  mode: "self" | "visitor";
  user: UiV2ProfileUser;
  isOwnProfile: boolean;
  isFollowing: boolean;
  onSettings?: () => void;
  onEditProfile?: () => void;
  onBecomeMentor?: () => void;
  onFollowToggle?: () => void;
  onMessage?: () => void;
  onFollowers?: () => void;
  onFollowing?: () => void;
  posts: UiV2ProfilePostThumb[];
}) {
  const stats = [
    { label: "Posts", value: String(user.postsCount ?? posts.length ?? 0), onClick: undefined },
    { label: "Followers", value: String(user.followersCount ?? 0), onClick: onFollowers },
    { label: "Following", value: String(user.followingCount ?? 0), onClick: onFollowing },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white pb-tabbar" data-test="profile-root">
      {/* Header with Cover */}
      <div className="relative">
        <div
          className="h-56 bg-gradient-to-br from-[#00AEEF]/20 via-[#0078D7]/20 to-[#004C97]/20 relative"
          style={user.coverUrl ? { backgroundImage: `url(${user.coverUrl})`, backgroundSize: "cover", backgroundPosition: "center" } : {}}
        >
          {/* Settings / More */}
          <div className="absolute top-4 right-4 z-10">
            {mode === "self" ? (
              <Button
                size="icon"
                onClick={onSettings}
                className="bg-white/90 hover:bg-white text-gray-900 backdrop-blur-sm shadow-lg h-10 w-10 rounded-full"
                aria-label="Settings"
              >
                <Settings className="h-5 w-5" />
              </Button>
            ) : null}
          </div>
        </div>

        {/* Profile Section */}
        <div className="max-w-4xl mx-auto px-4">
          <div className="relative -mt-20">
            <div className="flex items-end gap-4">
              {/* Profile Picture */}
              <div className="relative group">
                <div className="h-36 w-36 border-4 border-white shadow-2xl ring-4 ring-gray-100 rounded-full overflow-hidden bg-gradient-to-br from-[#00AEEF] to-[#0078D7]">
                  <img src={user.avatarUrl} alt={user.fullName} className="w-full h-full object-cover" />
                </div>
                {mode === "self" ? (
                  <button
                    className="absolute bottom-0 right-0 h-10 w-10 bg-gradient-to-r from-[#00AEEF] to-[#0078D7] hover:from-[#0078D7] hover:to-[#004C97] text-white rounded-full shadow-lg flex items-center justify-center transition-all transform hover:scale-110"
                    aria-label="Change profile photo"
                    onClick={onEditProfile}
                    type="button"
                  >
                    <Camera className="h-5 w-5" />
                  </button>
                ) : null}
              </div>

              {/* Name & actions */}
              <div className="flex-1 pb-2">
                <div className="flex items-center gap-2 mb-1">
                  <h1 className="text-3xl text-gray-900">{user.fullName}</h1>
                  {user.isMentor ? (
                    <Badge className="bg-gradient-to-r from-[#00AEEF] to-[#0078D7] text-white border-0 shadow-sm">
                      <Award className="h-3 w-3 mr-1" />
                      Mentor
                    </Badge>
                  ) : null}
                </div>
                <p className="text-gray-500">@{user.userName}</p>
              </div>

              {/* Desktop action buttons */}
              <div className="hidden sm:block pb-2">
                {isOwnProfile ? (
                  <Button
                    variant="outline"
                    className="gap-2 border-2 border-[#0078D7] text-[#0078D7] hover:bg-[#0078D7]/5 h-11 px-6 rounded-xl"
                    onClick={onEditProfile}
                    data-test="profile-edit"
                  >
                    <Edit className="h-4 w-4" />
                    Edit Profile
                  </Button>
                ) : (
                  <div className="flex gap-2">
                    <Button
                      className={cn(
                        "h-11 px-6 rounded-xl shadow-sm",
                        isFollowing ? "bg-gray-900 text-white hover:bg-gray-800" : "bg-gradient-to-r from-[#00AEEF] to-[#0078D7] hover:from-[#0078D7] hover:to-[#004C97] text-white"
                      )}
                      onClick={onFollowToggle}
                      data-test="profile-follow"
                    >
                      {isFollowing ? "Following" : "Follow"}
                    </Button>
                    <Button
                      variant="outline"
                      className="gap-2 border-2 border-[#0078D7] text-[#0078D7] hover:bg-[#0078D7]/5 h-11 px-6 rounded-xl"
                      onClick={onMessage}
                      disabled={isOwnProfile}
                      data-test="profile-message"
                    >
                      <MessageCircle className="h-4 w-4" />
                      Message
                    </Button>
                  </div>
                )}
              </div>
            </div>

            {/* Bio & Actions */}
            <div className="mt-6 space-y-4">
              <p className="text-gray-700 max-w-2xl leading-relaxed">{user.bio || ""}</p>

              {/* Mentor CTA (self only, if not mentor yet) */}
              {mode === "self" && !user.isMentor ? (
                <div className="bg-gradient-to-br from-[#00AEEF]/5 via-[#0078D7]/5 to-[#004C97]/5 rounded-2xl p-4 border-2 border-[#00AEEF]/30 shadow-sm relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-[#00AEEF]/20 to-transparent rounded-full blur-2xl"></div>
                  <Button
                    className="w-full gap-2 bg-gradient-to-r from-[#00AEEF] to-[#0078D7] hover:from-[#0078D7] hover:to-[#004C97] text-white shadow-lg shadow-[#00AEEF]/20 h-14 rounded-xl relative z-10"
                    onClick={onBecomeMentor}
                    data-test="become-mentor"
                  >
                    <Award className="h-5 w-5" />
                    Become a Mentor
                  </Button>
                </div>
              ) : null}

              {/* Mobile buttons */}
              <div className="sm:hidden space-y-2">
                {isOwnProfile ? (
                  <Button
                    variant="outline"
                    className="w-full gap-2 border-2 border-[#0078D7] text-[#0078D7] hover:bg-[#0078D7]/5 h-11 rounded-xl"
                    onClick={onEditProfile}
                    data-test="profile-edit"
                  >
                    <Edit className="h-4 w-4" />
                    Edit Profile
                  </Button>
                ) : (
                  <div className="grid grid-cols-2 gap-2">
                    <Button
                      className={cn(
                        "h-11 rounded-xl shadow-sm",
                        isFollowing ? "bg-gray-900 text-white hover:bg-gray-800" : "bg-gradient-to-r from-[#00AEEF] to-[#0078D7] hover:from-[#0078D7] hover:to-[#004C97] text-white"
                      )}
                      onClick={onFollowToggle}
                      data-test="profile-follow"
                    >
                      {isFollowing ? "Following" : "Follow"}
                    </Button>
                    <Button
                      variant="outline"
                      className="gap-2 border-2 border-[#0078D7] text-[#0078D7] hover:bg-[#0078D7]/5 h-11 rounded-xl"
                      onClick={onMessage}
                      disabled={isOwnProfile}
                      data-test="profile-message"
                    >
                      <MessageCircle className="h-4 w-4" />
                      Message
                    </Button>
                  </div>
                )}
              </div>

              {/* Stats */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
                <div className="flex justify-around items-center">
                  {stats.map((stat) => (
                    <button
                      key={stat.label}
                      onClick={stat.onClick}
                      className="flex flex-col items-center text-center hover:opacity-80 transition-opacity flex-1 group disabled:opacity-60"
                      disabled={!stat.onClick}
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

      {/* Achievements placeholder (until backend provides) */}
      <div className="max-w-4xl mx-auto px-4 mt-6">
        <Card className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center gap-2 mb-5">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-amber-500/10 to-amber-500/5 flex items-center justify-center">
              <Award className="h-5 w-5 text-amber-500" />
            </div>
            <div>
              <h3 className="text-lg text-gray-900">My Achievements</h3>
              <p className="text-xs text-gray-500">Your accomplishments</p>
            </div>
          </div>
          <div className="text-sm text-gray-500">Coming soon</div>
        </Card>
      </div>

      {/* Posts grid */}
      <div className="max-w-4xl mx-auto px-4 mt-6">
        <Tabs defaultValue="posts" className="w-full">
          <TabsList className="grid w-full grid-cols-1 bg-white border border-gray-100 rounded-2xl p-1">
            <TabsTrigger value="posts" className="rounded-xl">Posts</TabsTrigger>
          </TabsList>
          <TabsContent value="posts" className="mt-4">
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
              {posts.map((p) => (
                <a
                  key={p.id}
                  href={`/post/${encodeURIComponent(p.id)}`}
                  className="relative aspect-square rounded-xl overflow-hidden bg-gray-100"
                  data-test="profile-post"
                >
                  <img src={p.thumbUrl} alt="" className="absolute inset-0 w-full h-full object-cover" loading="lazy" decoding="async" />
                  {p.isVideo ? (
                    <div className="absolute right-2 top-2 text-white text-xs bg-black/50 rounded-full px-2 py-1">VIDEO</div>
                  ) : null}
                </a>
              ))}
              {posts.length === 0 ? <div className="col-span-full text-sm text-gray-500">No posts yet</div> : null}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}


