"use client";

// Verbatim port of `Edit Design Request (1)/src/pages/MentorProfilePublic.tsx` wired to real backend data.

import React, { useEffect, useMemo, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  ArrowLeft,
  Star,
  Users,
  Award,
  MessageCircle,
  FileText,
  CheckCircle2,
  Sparkles,
  PenSquare,
  Heart,
  Share2,
  Bookmark,
  X,
  Play,
  Flame,
  TrendingUp,
  Target,
  Grid,
  MoreVertical,
  UserPlus,
} from "lucide-react";
import { ImageWithFallback } from "@/components/design/figma/ImageWithFallback";
import { useGetUserDetailsByUserNameQuery, useFollowUserMutation } from "@/redux/services/haveme/user";
import { useGetUserDetailsQuery } from "@/redux/services/haveme";
import { useGetPostsByUserNameQuery } from "@/redux/services/haveme/posts";
import { useCreateSubscriptionMutation } from "@/redux/services/haveme/subscription";
import { adaptPostsToProfileThumbs, adaptUserToUiV2ProfileUser } from "@/lib/adapters/profile";
import { createConversation } from "@/lib/api/conversations";
import { useStripe } from "@stripe/react-stripe-js";
import { toast } from "@/components/ui/use-toast";
import { Loader2 } from "lucide-react";
import { useAppDispatch } from "@/redux/store";
import { havemeApi } from "@/redux/services/haveme";
import { TAG_GET_USER_DETAILS_BY_USER_NAME } from "@/contracts/haveme/haveMeApiTags";

function formatCount(n: any): string {
  const num = Number(n || 0);
  if (Number.isNaN(num)) return "0";
  if (num >= 1_000_000) return `${(num / 1_000_000).toFixed(1).replace(/\.0$/, "")}M`;
  if (num >= 1_000) return `${(num / 1_000).toFixed(1).replace(/\.0$/, "")}K`;
  return String(num);
}

export default function MentorProfilePublicWired() {
  const router = useRouter();
  const params = useParams() as any;
  const uid = String(params?.uid || "");

  const { data: meRes } = useGetUserDetailsQuery();
  const meRaw = (meRes as any)?.data;

  const { data: userRes } = useGetUserDetailsByUserNameQuery({ userName: uid } as any, { skip: !uid });
  const targetRaw = (userRes as any)?.data ?? {};
  const target = useMemo(() => adaptUserToUiV2ProfileUser(targetRaw), [targetRaw]);

  const [followUser] = useFollowUserMutation();
  const [isFollowing, setIsFollowing] = useState<boolean>(Boolean(targetRaw?.isFollowing));
  useEffect(() => setIsFollowing(Boolean(targetRaw?.isFollowing)), [targetRaw?.isFollowing, targetRaw?._id]);

  const onFollowToggle = async () => {
    if (!target.id) return;
    try {
      const res: any = await (followUser as any)({ followingTo: target.id }).unwrap?.();
      const next = Boolean(res?.data?.isFollowing ?? !isFollowing);
      setIsFollowing(next);
    } catch {}
  };

  const { data: postsRes } = useGetPostsByUserNameQuery(
    { userName: uid, page: 1, perPage: 60, filter: "posts" } as any,
    { skip: !uid }
  );
  const postsRaw = (postsRes as any)?.data ?? [];
  const thumbs = useMemo(() => adaptPostsToProfileThumbs(postsRaw), [postsRaw]);

  const mentorData = useMemo(() => {
    const plans = Array.isArray(targetRaw?.subscriptionPlans) ? targetRaw.subscriptionPlans : [];
    const plan = plans.find((p: any) => !p?.isDeleted) || plans[0];
    const price = Number(plan?.price ?? 0);
    return {
      name: target.fullName || target.userName,
      username: `@${target.userName || uid}`,
      avatar: target.avatarUrl,
      bannerImage: target.coverUrl,
      bio: String(targetRaw?.bio || ""),
      expertise: (Array.isArray(targetRaw?.mentorExpertise) ? targetRaw.mentorExpertise : []).filter(Boolean),
      rating: Number(targetRaw?.mentorRating ?? 0),
      reviewCount: Number(targetRaw?.mentorReviewCount ?? 0),
      subscriberCount: Number(targetRaw?.subscriberCount ?? 0),
      postCount: Number(targetRaw?.postsCount ?? 0),
      monthlyPrice: price,
      hasFreeTrial: Boolean(targetRaw?.mentorHasFreeTrial),
      yearsExperience: targetRaw?.mentorYearsExperience ?? null,
      certifications: (Array.isArray(targetRaw?.mentorCertifications) ? targetRaw.mentorCertifications : []).filter(Boolean),
      planId: plan?._id ? String(plan._id) : "",
      isJoined: Boolean(plan?.isJoined),
    };
  }, [target, targetRaw, uid]);

  const stats = useMemo(
    () => [
      { label: "(reviews)", value: `${mentorData.rating ? mentorData.rating.toFixed(1) : "0.0"} ⭐`, subValue: String(mentorData.reviewCount || 0) },
      { label: "posts", value: formatCount(mentorData.postCount) },
      { label: "subscribers", value: formatCount(mentorData.subscriberCount) },
    ],
    [mentorData]
  );

  const [activeTab, setActiveTab] = useState("posts");
  const [moreMenuOpen, setMoreMenuOpen] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  useEffect(() => setIsSubscribed(Boolean(mentorData.isJoined)), [mentorData.isJoined]);

  const [showSubscribeDialog, setShowSubscribeDialog] = useState(false);
  const [showReviewDialog, setShowReviewDialog] = useState(false);
  const [reviewRating, setReviewRating] = useState(0);
  const [reviewText, setReviewText] = useState("");

  const [likedPosts, setLikedPosts] = useState<Set<number>>(new Set());
  const [savedPosts, setSavedPosts] = useState<Set<number>>(new Set());

  const [selectedPostIndex, setSelectedPostIndex] = useState<number | null>(null);
  const [isPostModalOpen, setIsPostModalOpen] = useState(false);
  const [currentPostIndex, setCurrentPostIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const isScrolling = useRef(false);
  const touchStartY = useRef(0);
  const touchEndY = useRef(0);
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);

  const handleLike = (postId: number) => {
    setLikedPosts((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(postId)) newSet.delete(postId);
      else newSet.add(postId);
      return newSet;
    });
  };

  const handleSave = (postId: number) => {
    setSavedPosts((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(postId)) newSet.delete(postId);
      else newSet.add(postId);
      return newSet;
    });
  };

  const handlePostClick = (index: number) => {
    setSelectedPostIndex(index);
    setCurrentPostIndex(index);
    setIsPostModalOpen(true);
  };

  const handleClosePostView = () => {
    setIsPostModalOpen(false);
    setSelectedPostIndex(null);
    setCurrentPostIndex(0);
  };

  useEffect(() => {
    if (!isPostModalOpen || !containerRef.current) return;
    const container = containerRef.current;

    const handleTouchStart = (e: TouchEvent) => {
      touchStartY.current = e.touches[0].clientY;
      touchStartX.current = e.touches[0].clientX;
    };

    const handleTouchEnd = (e: TouchEvent) => {
      touchEndY.current = e.changedTouches[0].clientY;
      touchEndX.current = e.changedTouches[0].clientX;
      handleSwipe();
    };

    const handleSwipe = () => {
      const swipeDistanceY = touchStartY.current - touchEndY.current;
      const swipeDistanceX = touchEndX.current - touchStartX.current;
      const minSwipeDistance = 50;

      if (Math.abs(swipeDistanceX) > Math.abs(swipeDistanceY)) {
        if (swipeDistanceX > minSwipeDistance) {
          setIsPostModalOpen(false);
          setSelectedPostIndex(null);
          return;
        }
      } else if (Math.abs(swipeDistanceY) > minSwipeDistance) {
        if (swipeDistanceY > 0 && currentPostIndex < thumbs.length - 1) {
          setCurrentPostIndex((prev) => prev + 1);
        } else if (swipeDistanceY < 0 && currentPostIndex > 0) {
          setCurrentPostIndex((prev) => prev - 1);
        }
      }
    };

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      if (isScrolling.current) return;
      if (e.deltaY > 0 && currentPostIndex < thumbs.length - 1) {
        isScrolling.current = true;
        setCurrentPostIndex((prev) => prev + 1);
        setTimeout(() => {
          isScrolling.current = false;
        }, 500);
      } else if (e.deltaY < 0 && currentPostIndex > 0) {
        isScrolling.current = true;
        setCurrentPostIndex((prev) => prev - 1);
        setTimeout(() => {
          isScrolling.current = false;
        }, 500);
      }
    };

    container.addEventListener("touchstart", handleTouchStart);
    container.addEventListener("touchend", handleTouchEnd);
    container.addEventListener("wheel", handleWheel, { passive: false });

    return () => {
      container.removeEventListener("touchstart", handleTouchStart);
      container.removeEventListener("touchend", handleTouchEnd);
      container.removeEventListener("wheel", handleWheel);
    };
  }, [isPostModalOpen, currentPostIndex, thumbs.length]);

  const selectedPost = selectedPostIndex !== null ? thumbs[selectedPostIndex] : null;

  const handleShareProfile = () => {
    const profileUrl = typeof window !== "undefined" ? `${window.location.origin}/${mentorData.username}` : mentorData.username;
    navigator.clipboard
      .writeText(profileUrl)
      .then(() => alert("Profile link copied to clipboard!"))
      .catch(() => alert("Failed to copy link"));
    setMoreMenuOpen(false);
  };

  const [createSubscription, { isLoading: subscribing }] = useCreateSubscriptionMutation();
  const stripe = useStripe();
  const appDispatcher = useAppDispatch();
  const [isConfirmPaymentLoading, setIsConfirmPaymentLoading] = useState(false);

  const confirmPayment = (clientSecret: string) => {
    if (!stripe) {
      toast({
        variant: "destructive",
        title: "Stripe not ready",
        description: "Please try again in a moment.",
      });
      return;
    }
    stripe
      .confirmCardPayment(clientSecret)
      .then((res) => {
        if (res?.paymentIntent?.status === "succeeded") {
          toast({ variant: "success", title: "Payment Successful" });
          appDispatcher(havemeApi.util.invalidateTags([TAG_GET_USER_DETAILS_BY_USER_NAME]));
          setIsSubscribed(true);
          setShowSubscribeDialog(false);
        } else if (res?.error) {
          toast({
            variant: "destructive",
            title: res.error.message || "Payment failed",
          });
        }
      })
      .catch(() => {
        toast({ variant: "destructive", title: "Something went wrong." });
      })
      .finally(() => setIsConfirmPaymentLoading(false));
  };

  const onSubscribe = async () => {
    if (!mentorData.planId) return;
    try {
      const res: any = await createSubscription(mentorData.planId).unwrap();
      // Backend returns a Stripe PaymentIntent clientSecret (same flow used in old UI).
      if (res?.clientSecret) {
        setIsConfirmPaymentLoading(true);
        confirmPayment(String(res.clientSecret));
      } else {
        // Fallback (non-stripe environments): treat as subscribed if backend says ok.
        setIsSubscribed(true);
        setShowSubscribeDialog(false);
        toast({ variant: "success", title: "Subscribed" });
      }
    } catch (e: any) {
      const msg = e?.data?.error?.message || e?.data?.message || e?.error || "Failed to subscribe";
      toast({ variant: "destructive", title: String(msg) });
    }
  };

  const onMessage = () => {
    const unameNorm = String(target.userName || uid).toLowerCase().replace(/[^a-z0-9]/g, "");
    if (unameNorm === "coachmajen") return router.push("/coach-majen");
    if (!target.id) return;
    createConversation(String(target.id))
      .then((id) => router.push(`/feature/design/chat-wired?conversationId=${encodeURIComponent(id)}`))
      .catch(() => {});
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white pb-24" data-test="design-mentor-profile-wired">
      {/* Header */}
      <div className="relative">
        <div
          className="h-64 bg-gradient-to-br from-[#00AEEF]/20 via-[#0078D7]/20 to-[#004C97]/20"
          style={
            mentorData.bannerImage
              ? { backgroundImage: `url(${mentorData.bannerImage})`, backgroundSize: "cover", backgroundPosition: "center" }
              : {}
          }
        />
        <div className="absolute top-4 left-4 z-10">
          <Button
            size="icon"
            onClick={() => router.back()}
            className="bg-white/90 hover:bg-white text-gray-900 backdrop-blur-sm shadow-lg h-10 w-10 rounded-full"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </div>
        <div className="absolute top-4 right-4 z-10">
          <Button
            size="icon"
            onClick={() => setMoreMenuOpen((v) => !v)}
            className="bg-white/90 hover:bg-white text-gray-900 backdrop-blur-sm shadow-lg h-10 w-10 rounded-full"
          >
            <MoreVertical className="h-5 w-5" />
          </Button>
          {moreMenuOpen && (
            <div className="absolute right-0 mt-2 w-44 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden">
              <button onClick={handleShareProfile} className="w-full flex items-center gap-2 px-4 py-3 hover:bg-gray-50 text-left">
                <Share2 className="h-4 w-4 text-gray-600" /> <span className="text-sm text-gray-800">Share</span>
              </button>
            </div>
          )}
        </div>

        {/* Profile row */}
        <div className="max-w-4xl mx-auto px-4">
          <div className="relative -mt-16 flex items-end gap-4">
            <div className="h-32 w-32 border-4 border-white shadow-2xl ring-4 ring-gray-100 rounded-full overflow-hidden bg-gradient-to-br from-[#00AEEF] to-[#0078D7]">
              <Avatar className="h-32 w-32 rounded-full">
                <AvatarImage src={mentorData.avatar} />
                <AvatarFallback>{(mentorData.name || "M").slice(0, 1)}</AvatarFallback>
              </Avatar>
            </div>

            <div className="flex-1 pb-2">
              <div className="flex items-center gap-2">
                <h1 className="text-2xl text-gray-900">{mentorData.name}</h1>
                <Badge className="bg-gradient-to-r from-[#00AEEF] to-[#0078D7] text-white border-0 shadow-sm">
                  <Award className="h-3 w-3 mr-1" />
                  Mentor
                </Badge>
              </div>
              <p className="text-gray-500">{mentorData.username}</p>
            </div>
          </div>

          {/* Bio */}
          <div className="mt-5 space-y-4">
            <p className="text-gray-700 leading-relaxed">{mentorData.bio}</p>

            {/* Expertise */}
            {mentorData.expertise.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {mentorData.expertise.map((item: string, idx: number) => (
                  <Badge key={idx} variant="secondary" className="bg-gray-100 text-gray-700 border border-gray-200 px-3 py-1">
                    {item}
                  </Badge>
                ))}
              </div>
            )}

            {/* Stats row */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
              <div className="flex justify-around items-center">
                {stats.map((s, idx) => (
                  <div key={idx} className="flex flex-col items-center text-center flex-1">
                    <p className="text-2xl text-gray-900">{s.value}</p>
                    <p className="text-sm text-gray-500">
                      {s.label} {s.subValue ? <span className="text-gray-400">{s.subValue}</span> : null}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* CTAs */}
            <div className="grid grid-cols-2 gap-3">
              <Button
                variant="outline"
                className="gap-2 border-2 border-[#0078D7] text-[#0078D7] hover:bg-[#0078D7]/5 h-12 rounded-xl"
                onClick={onMessage}
              >
                <MessageCircle className="h-4 w-4" />
                Message
              </Button>
              <Button
                className="gap-2 bg-gradient-to-r from-[#00AEEF] to-[#0078D7] hover:from-[#0078D7] hover:to-[#004C97] text-white shadow-lg shadow-[#00AEEF]/20 h-12 rounded-xl"
                onClick={() => setShowSubscribeDialog(true)}
                disabled={!mentorData.planId || subscribing}
              >
                <UserPlus className="h-4 w-4" />
                {isSubscribed ? "Subscribed" : "Subscribe"}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="max-w-4xl mx-auto px-4 mt-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="w-full grid grid-cols-3 bg-white p-1.5 rounded-xl shadow-sm border-2 border-gray-200">
            <TabsTrigger
              value="posts"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#00AEEF] data-[state=active]:to-[#0078D7] data-[state=active]:text-white text-gray-700 font-medium data-[state=active]:shadow-md rounded-lg transition-all"
            >
              <Grid className="h-4 w-4 mr-2" /> Posts
            </TabsTrigger>
            <TabsTrigger
              value="about"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#00AEEF] data-[state=active]:to-[#0078D7] data-[state=active]:text-white text-gray-700 font-medium data-[state=active]:shadow-md rounded-lg transition-all"
            >
              <FileText className="h-4 w-4 mr-2" /> About
            </TabsTrigger>
            <TabsTrigger
              value="reviews"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#00AEEF] data-[state=active]:to-[#0078D7] data-[state=active]:text-white text-gray-700 font-medium data-[state=active]:shadow-md rounded-lg transition-all"
            >
              <Star className="h-4 w-4 mr-2" /> Reviews
            </TabsTrigger>
          </TabsList>

          <TabsContent value="posts" className="mt-6">
            <div className="grid grid-cols-3 gap-2">
              {thumbs.map((p, idx) => (
                <div key={p.id} className="aspect-square overflow-hidden rounded-xl shadow-sm border border-gray-100 group cursor-pointer" onClick={() => handlePostClick(idx)}>
                  <ImageWithFallback src={p.thumbUrl} alt={`Post ${idx + 1}`} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="about" className="mt-6">
            <div className="space-y-4">
              <Card className="bg-white border-gray-100 shadow-sm rounded-2xl">
                <CardContent className="p-5 space-y-4">
                  <h3 className="text-lg text-gray-900 flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-[#0078D7]" /> Experience
                  </h3>
                  <p className="text-gray-700">{mentorData.yearsExperience ? `${mentorData.yearsExperience}+ years coaching` : "—"}</p>
                </CardContent>
              </Card>

              <Card className="bg-white border-gray-100 shadow-sm rounded-2xl">
                <CardContent className="p-5 space-y-3">
                  <h3 className="text-lg text-gray-900 flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600" /> Certifications
                  </h3>
                  {mentorData.certifications.length ? (
                    <ul className="space-y-2">
                      {mentorData.certifications.map((c: string, i: number) => (
                        <li key={i} className="text-gray-700 flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                          {c}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-gray-500">—</p>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="reviews" className="mt-6">
            <Card className="bg-white border-gray-100 shadow-sm rounded-2xl">
              <CardContent className="p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg text-gray-900">Reviews</h3>
                    <p className="text-sm text-gray-500">{mentorData.reviewCount} total</p>
                  </div>
                  <Button variant="outline" className="gap-2 rounded-xl" onClick={() => setShowReviewDialog(true)}>
                    <PenSquare className="h-4 w-4" /> Write review
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Subscribe dialog */}
      <Dialog open={showSubscribeDialog} onOpenChange={setShowSubscribeDialog}>
        <DialogContent className="sm:max-w-md rounded-2xl">
          <DialogHeader>
            <DialogTitle>Subscribe</DialogTitle>
            <DialogDescription>Get full access to {mentorData.name}&apos;s mentoring experience.</DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div className="bg-gradient-to-br from-[#00AEEF]/10 to-[#0078D7]/5 border border-[#00AEEF]/20 rounded-xl p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-[#0078D7]" />
                  <span className="text-gray-900 font-medium">Monthly</span>
                </div>
                <span className="text-gray-900 font-semibold">${mentorData.monthlyPrice}/mo</span>
              </div>
              {mentorData.hasFreeTrial && <p className="text-sm text-emerald-600 mt-2">Includes a free trial</p>}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowSubscribeDialog(false)} className="rounded-xl">
              Cancel
            </Button>
            <Button onClick={onSubscribe} className="rounded-xl bg-[#0078D7] hover:bg-[#004C97]" disabled={subscribing || isSubscribed || !mentorData.planId}>
              {subscribing || isConfirmPaymentLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : isSubscribed ? (
                "Subscribed"
              ) : (
                "Confirm"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Review dialog (placeholder until review backend exists) */}
      <Dialog open={showReviewDialog} onOpenChange={setShowReviewDialog}>
        <DialogContent className="sm:max-w-md rounded-2xl">
          <DialogHeader>
            <DialogTitle>Write a review</DialogTitle>
            <DialogDescription>This will be wired to the review system once enabled.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Rating</Label>
              <div className="flex gap-2 mt-2">
                {[1, 2, 3, 4, 5].map((n) => (
                  <button key={n} className="p-2" onClick={() => setReviewRating(n)} aria-label={`Rate ${n}`}>
                    <Star className={`h-6 w-6 ${n <= reviewRating ? "text-yellow-500 fill-yellow-500" : "text-gray-300"}`} />
                  </button>
                ))}
              </div>
            </div>
            <div>
              <Label>Review</Label>
              <Textarea value={reviewText} onChange={(e) => setReviewText(e.target.value)} placeholder="Share your experience..." className="mt-2" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowReviewDialog(false)} className="rounded-xl">
              Cancel
            </Button>
            <Button
              onClick={() => {
                setShowReviewDialog(false);
                setReviewText("");
                setReviewRating(0);
                alert("Thanks! Reviews will be stored once the review backend is enabled.");
              }}
              className="rounded-xl bg-[#0078D7] hover:bg-[#004C97]"
            >
              Submit
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Post modal */}
      {isPostModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/95">
          <div className="absolute top-4 left-4 z-10">
            <Button size="icon" onClick={handleClosePostView} className="bg-white/10 hover:bg-white/20 text-white h-10 w-10 rounded-full">
              <X className="h-5 w-5" />
            </Button>
          </div>
          <div ref={containerRef} className="h-full w-full overflow-hidden flex items-center justify-center">
            {thumbs[currentPostIndex] ? (
              <img src={thumbs[currentPostIndex].thumbUrl} className="max-h-full max-w-full object-contain" alt="post" />
            ) : null}
          </div>
          {/* Right actions (visual parity) */}
          <div className="absolute right-4 bottom-24 flex flex-col gap-4 items-center">
            <button onClick={() => handleLike(currentPostIndex)} className="text-white flex flex-col items-center gap-1">
              <Heart className={`h-7 w-7 ${likedPosts.has(currentPostIndex) ? "fill-rose-500 text-rose-500" : ""}`} />
              <span className="text-xs">{likedPosts.has(currentPostIndex) ? 1 : 0}</span>
            </button>
            <button onClick={() => handleSave(currentPostIndex)} className="text-white flex flex-col items-center gap-1">
              <Bookmark className={`h-7 w-7 ${savedPosts.has(currentPostIndex) ? "fill-white text-white" : ""}`} />
              <span className="text-xs">{savedPosts.has(currentPostIndex) ? 1 : 0}</span>
            </button>
            <button className="text-white flex flex-col items-center gap-1" onClick={() => {}}>
              <Share2 className="h-7 w-7" />
              <span className="text-xs">0</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}


