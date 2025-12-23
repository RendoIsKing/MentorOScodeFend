"use client";

// Verbatim-ish port of `Edit Design Request (1)/src/pages/SearchPage.tsx` wired to backend search.

import React, { useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Search,
  X,
  TrendingUp,
  Hash,
  Clock,
  Flame,
  Heart,
  MessageCircle,
  UserPlus,
  CheckCircle2,
  SearchX,
  Loader2,
} from "lucide-react";
import { useRouter } from "next/navigation";
import EmptyState from "@/components/EmptyState";
import DesignBottomNav from "@/components/design/DesignBottomNav";
import { useGetUsersQuery } from "@/redux/services/haveme/search";
import { useFollowUserMutation } from "@/redux/services/haveme/user";
import { useGetPostsQuery } from "@/redux/services/haveme/posts";
import { getUserAvatarUrl } from "@/lib/media";
import { adaptPostToFeedItem } from "@/lib/adapters/feed";
import { formatTimestamp } from "@/lib/utils";

function formatCount(n: any): string {
  const num = Number(n || 0);
  if (Number.isNaN(num)) return "0";
  if (num >= 1_000_000) return `${(num / 1_000_000).toFixed(1).replace(/\.0$/, "")}M`;
  if (num >= 1_000) return `${(num / 1_000).toFixed(1).replace(/\.0$/, "")}K`;
  return String(num);
}

export default function SearchPageWired() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [loadingFollowIds, setLoadingFollowIds] = useState<Set<string>>(new Set());
  const [isFocused, setIsFocused] = useState(false);
  const [activeCategory, setActiveCategory] = useState<"recent" | "trending" | "suggested">("recent");

  const clearSearch = () => setSearchQuery("");

  const { data: usersRes, isFetching: usersLoading } = useGetUsersQuery(
    { page: 1, perPage: 20, searchTerm: searchQuery || "", filter: "all" } as any,
    { skip: searchQuery.trim().length === 0 && activeCategory !== "suggested" } as any
  );

  const usersRaw = ((usersRes as any)?.data ?? []) as any[];
  const users = useMemo(() => {
    return usersRaw.map((u) => {
      const name = String(u?.fullName || u?.userName || "User");
      const userName = String(u?.userName || "");
      return {
        id: String(u?._id || u?.id || userName),
        name,
        username: userName ? `@${userName}` : "",
        avatar: getUserAvatarUrl(u),
        bio: String(u?.bio || ""),
        followers: formatCount(u?.followersCount ?? 0),
        isVerified: Boolean(u?.isVerified || u?.hasDocumentVerified),
        isFollowing: Boolean(u?.isFollowing),
        isMentor: Boolean(u?.isMentor),
        raw: u,
      };
    });
  }, [usersRaw]);

  const { data: postsRes, isFetching: postsLoading } = useGetPostsQuery(
    { perPage: 12, page: 1, search: searchQuery || "", filter: "all" } as any,
    { skip: searchQuery.trim().length === 0 } as any
  );
  const postsRaw = ((postsRes as any)?.data ?? []) as any[];
  const myId = ""; // not needed for mapping counts; like-state handled elsewhere
  const posts = useMemo(() => {
    return postsRaw
      .map((p) => {
        const adapted = adaptPostToFeedItem(p, myId);
        if (!adapted) return null;
        const authorName = adapted.user?.displayName || adapted.user?.username || "User";
        const uname = adapted.user?.username ? `@${adapted.user.username}` : "";
        return {
          id: adapted.id,
          author: authorName,
          username: uname,
          avatar: adapted.user?.avatarUrl || "/assets/images/Home/small-profile-img.svg",
          content: adapted.caption || "",
          image: adapted.src,
          likes: Number(adapted.likesCount || 0),
          comments: Number(adapted.commentsCount || 0),
          time: adapted.createdAt ? formatTimestamp(adapted.createdAt) : "",
        };
      })
      .filter(Boolean) as any[];
  }, [postsRaw]);

  const [followUser] = useFollowUserMutation();
  const handleFollowToggle = async (userId: string) => {
    if (!userId) return;
    setLoadingFollowIds((prev) => new Set(prev).add(userId));
    try {
      await (followUser as any)({ followingTo: userId }).unwrap?.();
    } catch {
      // ignore
    } finally {
      setLoadingFollowIds((prev) => {
        const next = new Set(prev);
        next.delete(userId);
        return next;
      });
    }
  };

  const trendingTopics = [
    { tag: "MarathonTraining", posts: "12.5K" },
    { tag: "HealthyEating", posts: "8.2K" },
    { tag: "MindfulMonday", posts: "5.8K" },
    { tag: "WorkoutMotivation", posts: "15.3K" },
  ];

  const hasResults = users.length > 0 || posts.length > 0;

  const suggestedUsers = useMemo(() => {
    // When not searching, reuse the first page of users as "suggested".
    return users;
  }, [users]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50/50 via-white to-indigo-50/30 pb-20" data-test="design-search-wired">
      <header className="sticky top-0 z-50 bg-white/70 backdrop-blur-xl border-b border-gray-100 shadow-sm">
        <div className="container max-w-4xl mx-auto px-4 py-4">
          <div className="relative">
            {!searchQuery && !isFocused && (
              <div className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center gap-2 pointer-events-none text-gray-400">
                <Search className="h-5 w-5 text-[#0078D7]" />
                <span>Search users, posts, hashtags...</span>
              </div>
            )}
            <Input
              type="text"
              placeholder=""
              className="pl-4 pr-12 h-14 bg-white border-2 border-gray-100 text-gray-900 placeholder:text-gray-400 rounded-2xl focus:ring-2 focus:ring-[#0078D7]/20 focus:border-[#0078D7]/30 shadow-sm"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
            />
            {searchQuery && (
              <button
                onClick={clearSearch}
                className="absolute right-4 top-1/2 -translate-y-1/2 p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-all"
              >
                <X className="h-5 w-5" />
              </button>
            )}
          </div>
        </div>
      </header>

      {searchQuery === "" && (
        <div className="sticky top-[82px] z-40 bg-white/70 backdrop-blur-xl border-b border-gray-100">
          <div className="container max-w-4xl mx-auto py-3">
            <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide pl-4">
              <button
                onClick={() => setActiveCategory("recent")}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl whitespace-nowrap transition-all flex-shrink-0 ${
                  activeCategory === "recent"
                    ? "bg-gradient-to-r from-[#00AEEF] to-[#0078D7] text-white shadow-lg shadow-[#00AEEF]/30"
                    : "bg-white text-gray-600 border-2 border-gray-100 hover:border-[#0078D7]/30"
                }`}
              >
                <Clock className="h-4 w-4" />
                Recent
              </button>
              <button
                onClick={() => setActiveCategory("trending")}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl whitespace-nowrap transition-all flex-shrink-0 ${
                  activeCategory === "trending"
                    ? "bg-gradient-to-r from-[#00AEEF] to-[#0078D7] text-white shadow-lg shadow-[#00AEEF]/30"
                    : "bg-white text-gray-600 border-2 border-gray-100 hover:border-[#0078D7]/30"
                }`}
              >
                <TrendingUp className="h-4 w-4" />
                Trending
              </button>
              <button
                onClick={() => setActiveCategory("suggested")}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl whitespace-nowrap transition-all flex-shrink-0 mr-4 ${
                  activeCategory === "suggested"
                    ? "bg-gradient-to-r from-[#00AEEF] to-[#0078D7] text-white shadow-lg shadow-[#00AEEF]/30"
                    : "bg-white text-gray-600 border-2 border-gray-100 hover:border-[#0078D7]/30"
                }`}
              >
                <Flame className="h-4 w-4" />
                Suggested
              </button>
            </div>
          </div>
        </div>
      )}

      <main className="container max-w-4xl mx-auto px-4 py-6 pb-32">
        {searchQuery === "" ? (
          <div className="space-y-6">
            {activeCategory === "recent" && (
              <section>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl text-gray-900 flex items-center gap-3">
                    <div className="p-2.5 bg-gradient-to-br from-[#00AEEF]/10 to-[#0078D7]/10 rounded-xl">
                      <Clock className="h-5 w-5 text-[#0078D7]" />
                    </div>
                    Recent
                  </h2>
                </div>
                <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
                  <EmptyState
                    icon={Clock}
                    title="No recent searches"
                    description="Searches you make will show up here."
                    iconColor="hsl(var(--brand-medium-blue))"
                    iconBgColor="hsl(var(--brand-medium-blue)/0.1)"
                  />
                </div>
              </section>
            )}

            {activeCategory === "trending" && (
              <section>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl text-gray-900 flex items-center gap-3">
                    <div className="p-2.5 bg-gradient-to-br from-orange-500/10 to-red-500/10 rounded-xl">
                      <TrendingUp className="h-5 w-5 text-orange-600" />
                    </div>
                    Trending Topics
                  </h2>
                </div>
                <div className="grid gap-3">
                  {trendingTopics.map((topic, index) => (
                    <Card key={index} className="cursor-pointer hover:shadow-lg hover:border-[#0078D7]/20 transition-all bg-white border-gray-100 rounded-2xl overflow-hidden group">
                      <CardContent className="p-5">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className="p-3 rounded-xl bg-gradient-to-br from-[#00AEEF]/10 to-[#0078D7]/10 group-hover:from-[#00AEEF]/20 group-hover:to-[#0078D7]/20 transition-all">
                              <Hash className="h-5 w-5 text-[#0078D7]" />
                            </div>
                            <div>
                              <p className="text-gray-900">#{topic.tag}</p>
                              <p className="text-sm text-gray-500">{topic.posts} posts</p>
                            </div>
                          </div>
                          <div className="p-2 rounded-lg bg-gradient-to-br from-green-500/10 to-emerald-500/10">
                            <TrendingUp className="h-5 w-5 text-green-600" />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </section>
            )}

            {activeCategory === "suggested" && (
              <section>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl text-gray-900 flex items-center gap-3">
                    <div className="p-2.5 bg-gradient-to-br from-amber-500/10 to-orange-500/10 rounded-xl">
                      <Flame className="h-5 w-5 text-amber-600" />
                    </div>
                    Suggested For You
                  </h2>
                </div>
                <div className="space-y-3">
                  {suggestedUsers.map((u, index) => (
                    <Card
                      key={index}
                      className="hover:shadow-lg hover:border-[#0078D7]/20 transition-all cursor-pointer bg-white border-gray-100 rounded-2xl overflow-hidden"
                      onClick={() => router.push(`/feature/design/u/${encodeURIComponent(String(u.raw?.userName || u.id))}`)}
                    >
                      <CardContent className="p-5">
                        <div className="flex items-start gap-4">
                          <Avatar className="h-14 w-14 border-2 border-white shadow-md ring-2 ring-gray-100">
                            <AvatarImage src={u.avatar} />
                            <AvatarFallback className="bg-gradient-to-br from-[#00AEEF] to-[#0078D7] text-white">
                              {u.name?.[0] || "U"}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-1.5 mb-0.5">
                              <p className="text-gray-900 truncate">{u.name}</p>
                              {u.isVerified && (
                                <div className="flex-shrink-0 p-0.5 bg-gradient-to-br from-[#00AEEF] to-[#0078D7] rounded-full">
                                  <CheckCircle2 className="h-3.5 w-3.5 text-white" />
                                </div>
                              )}
                            </div>
                            <p className="text-sm text-gray-500 mb-1.5">{u.username}</p>
                            {u.bio ? <p className="text-sm text-gray-700 mb-1.5">{u.bio}</p> : null}
                            <p className="text-xs text-gray-400">{u.followers} followers</p>
                          </div>
                          <Button
                            size="sm"
                            variant={u.isFollowing ? "outline" : "default"}
                            className={
                              u.isFollowing
                                ? "border-2 border-gray-200 text-gray-700 hover:bg-gray-50 rounded-xl"
                                : "bg-gradient-to-r from-[#00AEEF] to-[#0078D7] hover:from-[#0078D7] hover:to-[#004C97] text-white shadow-lg shadow-[#00AEEF]/30 rounded-xl"
                            }
                            onClick={(e) => {
                              e.stopPropagation();
                              handleFollowToggle(u.id);
                            }}
                          >
                            {loadingFollowIds.has(u.id) ? <Loader2 className="h-4 w-4 animate-spin" /> : u.isFollowing ? "Following" : "Follow"}
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </section>
            )}
          </div>
        ) : (
          <div>
            {!hasResults && !usersLoading && !postsLoading ? (
              <EmptyState
                icon={SearchX}
                title="No results found"
                description={`We couldn't find anything matching "${searchQuery}". Try different keywords or check your spelling.`}
                iconColor="hsl(var(--muted-foreground))"
                iconBgColor="hsl(var(--muted)/0.1)"
              />
            ) : (
              <Tabs defaultValue="all" className="w-full" onValueChange={setActiveTab}>
                <TabsList className="w-full grid grid-cols-3 bg-white p-1.5 rounded-2xl shadow-sm border-2 border-gray-100 mb-6">
                  <TabsTrigger value="all" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#00AEEF] data-[state=active]:to-[#0078D7] data-[state=active]:text-white text-gray-600 data-[state=active]:shadow-md rounded-xl transition-all">
                    All
                  </TabsTrigger>
                  <TabsTrigger value="users" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#00AEEF] data-[state=active]:to-[#0078D7] data-[state=active]:text-white text-gray-600 data-[state=active]:shadow-md rounded-xl transition-all">
                    Users
                  </TabsTrigger>
                  <TabsTrigger value="posts" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#00AEEF] data-[state=active]:to-[#0078D7] data-[state=active]:text-white text-gray-600 data-[state=active]:shadow-md rounded-xl transition-all">
                    Posts
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="all" className="space-y-6">
                  {users.length > 0 && (
                    <section>
                      <h3 className="text-gray-900 mb-3 flex items-center gap-2">
                        <UserPlus className="h-5 w-5 text-[#0078D7]" />
                        Users
                      </h3>
                      <div className="space-y-3">
                        {users.slice(0, 5).map((u, index) => (
                          <Card key={index} className="bg-white border-gray-100 rounded-2xl shadow-sm hover:shadow-lg transition-all cursor-pointer" onClick={() => router.push(`/feature/design/u/${encodeURIComponent(String(u.raw?.userName || u.id))}`)}>
                            <CardContent className="p-5">
                              <div className="flex items-center gap-3">
                                <Avatar className="h-12 w-12 border-2 border-white shadow-md ring-2 ring-gray-100">
                                  <AvatarImage src={u.avatar} />
                                  <AvatarFallback className="bg-gradient-to-br from-[#00AEEF] to-[#0078D7] text-white">{u.name?.[0] || "U"}</AvatarFallback>
                                </Avatar>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-1.5">
                                    <p className="text-gray-900 truncate">{u.name}</p>
                                    {u.isVerified && (
                                      <div className="p-0.5 bg-gradient-to-br from-[#00AEEF] to-[#0078D7] rounded-full">
                                        <CheckCircle2 className="h-3.5 w-3.5 text-white" />
                                      </div>
                                    )}
                                  </div>
                                  <p className="text-sm text-gray-500">{u.username}</p>
                                </div>
                                <Button
                                  size="sm"
                                  variant={u.isFollowing ? "outline" : "default"}
                                  className={
                                    u.isFollowing
                                      ? "border-2 border-gray-200 text-gray-700 hover:bg-gray-50 rounded-xl"
                                      : "bg-gradient-to-r from-[#00AEEF] to-[#0078D7] hover:from-[#0078D7] hover:to-[#004C97] text-white shadow-lg shadow-[#00AEEF]/30 rounded-xl"
                                  }
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleFollowToggle(u.id);
                                  }}
                                >
                                  {loadingFollowIds.has(u.id) ? <Loader2 className="h-4 w-4 animate-spin" /> : u.isFollowing ? "Following" : "Follow"}
                                </Button>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </section>
                  )}

                  {posts.length > 0 && (
                    <section>
                      <h3 className="text-gray-900 mb-3 flex items-center gap-2">
                        <MessageCircle className="h-5 w-5 text-[#0078D7]" />
                        Posts
                      </h3>
                      <div className="space-y-3">
                        {posts.slice(0, 5).map((p, idx) => (
                          <Card key={idx} className="bg-white border-gray-100 rounded-2xl shadow-sm hover:shadow-lg transition-all">
                            <CardContent className="p-5">
                              <div className="flex items-start gap-3">
                                <Avatar className="h-10 w-10 border-2 border-white shadow-md ring-2 ring-gray-100">
                                  <AvatarImage src={p.avatar} />
                                  <AvatarFallback className="bg-gradient-to-br from-[#00AEEF] to-[#0078D7] text-white">{p.author?.[0] || "U"}</AvatarFallback>
                                </Avatar>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center justify-between gap-2">
                                    <div className="min-w-0">
                                      <p className="text-gray-900 truncate">{p.author}</p>
                                      <p className="text-xs text-gray-500">
                                        {p.username} • {p.time}
                                      </p>
                                    </div>
                                  </div>
                                  <p className="text-gray-700 mt-2">{p.content}</p>
                                  {p.image ? (
                                    <div className="mt-3 overflow-hidden rounded-2xl border border-gray-100">
                                      <img src={p.image} alt="post" className="w-full h-44 object-cover" />
                                    </div>
                                  ) : null}
                                  <div className="mt-3 flex items-center gap-4 text-gray-500 text-sm">
                                    <span className="flex items-center gap-1">
                                      <Heart className="h-4 w-4 text-rose-500" /> {formatCount(p.likes)}
                                    </span>
                                    <span className="flex items-center gap-1">
                                      <MessageCircle className="h-4 w-4 text-violet-500" /> {formatCount(p.comments)}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </section>
                  )}
                </TabsContent>

                <TabsContent value="users" className="space-y-3">
                  {users.map((u, index) => (
                    <Card key={index} className="bg-white border-gray-100 rounded-2xl shadow-sm hover:shadow-lg transition-all cursor-pointer" onClick={() => router.push(`/feature/design/u/${encodeURIComponent(String(u.raw?.userName || u.id))}`)}>
                      <CardContent className="p-5">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-12 w-12 border-2 border-white shadow-md ring-2 ring-gray-100">
                            <AvatarImage src={u.avatar} />
                            <AvatarFallback className="bg-gradient-to-br from-[#00AEEF] to-[#0078D7] text-white">{u.name?.[0] || "U"}</AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-1.5">
                              <p className="text-gray-900 truncate">{u.name}</p>
                              {u.isVerified && (
                                <div className="p-0.5 bg-gradient-to-br from-[#00AEEF] to-[#0078D7] rounded-full">
                                  <CheckCircle2 className="h-3.5 w-3.5 text-white" />
                                </div>
                              )}
                            </div>
                            <p className="text-sm text-gray-500">{u.username}</p>
                          </div>
                          <Button
                            size="sm"
                            variant={u.isFollowing ? "outline" : "default"}
                            className={
                              u.isFollowing
                                ? "border-2 border-gray-200 text-gray-700 hover:bg-gray-50 rounded-xl"
                                : "bg-gradient-to-r from-[#00AEEF] to-[#0078D7] hover:from-[#0078D7] hover:to-[#004C97] text-white shadow-lg shadow-[#00AEEF]/30 rounded-xl"
                            }
                            onClick={(e) => {
                              e.stopPropagation();
                              handleFollowToggle(u.id);
                            }}
                          >
                            {loadingFollowIds.has(u.id) ? <Loader2 className="h-4 w-4 animate-spin" /> : u.isFollowing ? "Following" : "Follow"}
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </TabsContent>

                <TabsContent value="posts" className="space-y-3">
                  {posts.map((p, idx) => (
                    <Card key={idx} className="bg-white border-gray-100 rounded-2xl shadow-sm hover:shadow-lg transition-all">
                      <CardContent className="p-5">
                        <div className="flex items-start gap-3">
                          <Avatar className="h-10 w-10 border-2 border-white shadow-md ring-2 ring-gray-100">
                            <AvatarImage src={p.avatar} />
                            <AvatarFallback className="bg-gradient-to-br from-[#00AEEF] to-[#0078D7] text-white">{p.author?.[0] || "U"}</AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <p className="text-gray-900">{p.author}</p>
                            <p className="text-xs text-gray-500">
                              {p.username} • {p.time}
                            </p>
                            <p className="text-gray-700 mt-2">{p.content}</p>
                            {p.image ? (
                              <div className="mt-3 overflow-hidden rounded-2xl border border-gray-100">
                                <img src={p.image} alt="post" className="w-full h-44 object-cover" />
                              </div>
                            ) : null}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </TabsContent>
              </Tabs>
            )}
          </div>
        )}
      </main>

      <DesignBottomNav
        currentPage="search"
        onNavigate={(page) => {
          if (page === "home") router.push("/home");
          else if (page === "chat") router.push("/room");
          else if (page === "search") router.push("/feature/design/search");
          else if (page === "profile") router.push("/feature/design/profile");
        }}
      />
    </div>
  );
}


