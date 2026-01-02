"use client";

// Verbatim-ish port of `Edit Design Request (1)/src/pages/MentorDashboard.tsx` wired to real backend data.
// We keep markup/classes as close as possible and replace mock arrays with backend-driven equivalents.

import React, { useEffect, useMemo, useRef, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Users,
  DollarSign,
  UserPlus,
  MessageCircle,
  Clock,
  User,
  Search,
  BarChart3,
  ChevronRight,
  CreditCard,
  Plus,
  ChevronDown,
  Eye,
  CheckCircle,
  Settings,
  Star,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useGetUserDetailsQuery } from "@/redux/services/haveme";
import { useGetSubscriberListQuery } from "@/redux/services/haveme/user";
import {
  useCreateProductPlanMutation,
  useDeletePlanMutation,
  useGetPlanDetailsQuery,
  useUpdatePlanMutation,
} from "@/redux/services/haveme/subscription";
import {
  useGetUserChartsDataMutation,
  useGetUserEarningDataMutation,
} from "@/redux/services/haveme/creator-center";
import { listConversations } from "@/lib/api/conversations";
import { getUserById } from "@/lib/api/conversations";
import { getUserAvatarUrl } from "@/lib/media";
import { format } from "date-fns";

type TabType = "overview" | "students" | "messages" | "avatar" | "earnings" | "subscription";

type DashboardPlan = {
  id: string;
  name: string;
  price: number; // dollars
  billingPeriod: "month" | "year";
  features: string[];
  isActive: boolean;
};

type DashboardStudent = {
  id: string;
  name: string;
  avatar: string;
  goal: string;
  progress: number;
  joinedDate: string;
  status: "active" | "inactive" | "new";
  lastActive: string;
  unreadMessages: number;
  subscriptionPlan: string;
  userName?: string;
};

type DashboardMessage = {
  id: string;
  name: string;
  avatar: string;
  text: string;
  timestamp: string;
  unread: boolean;
  userId?: string;
};

function compactMoneyCents(n: number): string {
  if (!n || Number.isNaN(n)) return "$0";
  return `$${Math.round(n / 100).toLocaleString()}`;
}

function relTime(iso?: string | null) {
  if (!iso) return "";
  try {
    const d = new Date(iso);
    const diff = Date.now() - d.getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${Math.max(1, mins)}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    const days = Math.floor(hrs / 24);
    return `${days}d ago`;
  } catch {
    return "";
  }
}

export default function MentorDashboardWired() {
  const router = useRouter();
  const { data: meRes } = useGetUserDetailsQuery();
  const me = (meRes as any)?.data ?? {};
  const myId = String(me?._id || "");

  const isMentor = Boolean(me?.isMentor);

  const [activeTab, setActiveTab] = useState<TabType>("overview");
  const [searchQuery, setSearchQuery] = useState("");
  const [studentFilter, setStudentFilter] = useState<"all" | "active" | "inactive" | "new">("all");
  const [showDropdown, setShowDropdown] = useState(false);

  // ----- Students (subscribers)
  const { data: subscriberRes } = useGetSubscriberListQuery(myId as any, { skip: !isMentor || !myId });
  const students: DashboardStudent[] = useMemo(() => {
    const list = ((subscriberRes as any)?.data ?? []) as any[];
    return list.map((s) => {
      const name = String(s.fullName || s.userName || "Subscriber");
      const uname = String(s.userName || "");
      return {
        id: String(s.userId),
        name,
        userName: uname,
        avatar: s.photoId
          ? `/api/backend/${String(s.photoId).replace(/^\/+/, "")}`
          : "/assets/images/Home/small-profile-img.svg",
        goal: "Subscriber",
        progress: 0,
        joinedDate: "—",
        status: "active",
        lastActive: "—",
        unreadMessages: 0,
        subscriptionPlan: "Subscription",
      };
    });
  }, [subscriberRes]);

  const filteredStudents = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return students.filter((s) => {
      const matchesQ = !q || s.name.toLowerCase().includes(q) || String(s.userName || "").toLowerCase().includes(q);
      const matchesFilter = studentFilter === "all" ? true : s.status === studentFilter;
      return matchesQ && matchesFilter;
    });
  }, [students, searchQuery, studentFilter]);

  // ----- Messages (conversations)
  const [messages, setMessages] = useState<DashboardMessage[]>([]);
  const [loadingMessages, setLoadingMessages] = useState(true);
  const partnerCache = useRef<Map<string, any>>(new Map());

  const hydratePartner = async (id: string) => {
    if (!id) return null;
    if (partnerCache.current.has(id)) return partnerCache.current.get(id);
    try {
      const u = await getUserById(id);
      partnerCache.current.set(id, u);
      return u;
    } catch {
      return null;
    }
  };

  useEffect(() => {
    let cancelled = false;
    async function load() {
      if (!myId) return;
      setLoadingMessages(true);
      try {
        const list = await listConversations();
        const out: DashboardMessage[] = [];
        for (const c of list) {
          const partnerId = (c.participants || []).map(String).find((p) => p !== myId) || "";
          const u = await hydratePartner(partnerId);
          const name = String(u?.fullName || u?.userName || "User");
          out.push({
            id: String(c.id),
            userId: partnerId,
            name,
            avatar: getUserAvatarUrl(u),
            text: String(c.lastMessageText || ""),
            timestamp: relTime(c.lastMessageAt || null),
            unread: Number(c.unread || 0) > 0,
          });
        }
        if (!cancelled) setMessages(out);
      } catch {
        if (!cancelled) setMessages([]);
      } finally {
        if (!cancelled) setLoadingMessages(false);
      }
    }
    load();
    const t = setInterval(load, 5000);
    return () => {
      cancelled = true;
      clearInterval(t);
    };
  }, [myId]);

  const unreadCount = useMemo(() => messages.filter((m) => m.unread).length, [messages]);

  // ----- Earnings (reuse existing endpoints)
  const [getUserEarningData, { data: earningsData }] = useGetUserEarningDataMutation();
  const [getUserChartsData, { data: chartsData }] = useGetUserChartsDataMutation();

  useEffect(() => {
    const end = new Date();
    const start = new Date();
    start.setDate(end.getDate() - 30);
    getUserEarningData({ startDate: format(start, "yyyy-MM-dd"), endDate: format(end, "yyyy-MM-dd") } as any);
    getUserChartsData({ startDate: format(start, "yyyy-MM-dd"), endDate: format(end, "yyyy-MM-dd") } as any);
  }, [getUserEarningData, getUserChartsData]);

  const totalGrossCents = useMemo(() => {
    const rows = Array.isArray((earningsData as any)?.data) ? (earningsData as any).data : [];
    return rows.reduce((sum: number, r: any) => sum + Number(r?.gross || 0), 0);
  }, [earningsData]);

  // ----- Subscription plans
  const { data: plansData, refetch: refetchPlans } = useGetPlanDetailsQuery();
  const [createPlan] = useCreateProductPlanMutation();
  const [updatePlan] = useUpdatePlanMutation();
  const [deletePlan] = useDeletePlanMutation();

  const subscriptionPlans: DashboardPlan[] = useMemo(() => {
    const list = (plansData as any)?.data ?? [];
    return (Array.isArray(list) ? list : []).map((p: any) => {
      const title = String(p?.title || p?.name || "Plan");
      const priceDollars = Math.round(Number(p?.price || 0) / 100);
      const features = Array.isArray(p?.permissions) ? p.permissions.map((x: any) => String(x?.description || x?.feature || "")).filter(Boolean) : [];
      return {
        id: String(p?._id || p?.id),
        name: title,
        price: priceDollars,
        billingPeriod: "month",
        features: features.length ? features.slice(0, 8) : ["Subscription access"],
        isActive: !Boolean(p?.isDeleted),
      };
    });
  }, [plansData]);

  const [showEditPlanModal, setShowEditPlanModal] = useState(false);
  const [editingPlanId, setEditingPlanId] = useState<string | null>(null);
  const [editingPlanData, setEditingPlanData] = useState({
    name: "",
    price: 0,
    billingPeriod: "month" as "month" | "year",
    features: [] as string[],
    isActive: true,
  });
  const [newFeature, setNewFeature] = useState("");

  const openEditPlanModal = (planId: string | null = null) => {
    if (planId) {
      const plan = subscriptionPlans.find((p) => p.id === planId);
      if (plan) {
        setEditingPlanId(planId);
        setEditingPlanData({
          name: plan.name,
          price: plan.price,
          billingPeriod: plan.billingPeriod,
          features: [...plan.features],
          isActive: plan.isActive,
        });
      }
    } else {
      setEditingPlanId(null);
      setEditingPlanData({ name: "", price: 0, billingPeriod: "month", features: [], isActive: true });
    }
    setShowEditPlanModal(true);
  };

  const savePlan = async () => {
    const title = editingPlanData.name.trim() || "Plan";
    const price = Math.max(0, Number(editingPlanData.price || 0));
    try {
      if (editingPlanId) {
        await updatePlan({ id: editingPlanId, title, price: price * 100 } as any).unwrap();
      } else {
        await createPlan({
          planType: "custom",
          title,
          price: price * 100,
          entitlements: (editingPlanData.features || []).filter(Boolean).map((f) => ({ feature: f, description: f })),
        } as any).unwrap();
      }
      setShowEditPlanModal(false);
      setEditingPlanId(null);
      refetchPlans();
    } catch {}
  };

  const addFeature = () => {
    const f = newFeature.trim();
    if (!f) return;
    setEditingPlanData((p) => ({ ...p, features: [...p.features, f] }));
    setNewFeature("");
  };

  const removeFeature = (index: number) => {
    setEditingPlanData((p) => ({ ...p, features: p.features.filter((_, i) => i !== index) }));
  };

  const togglePlanActivation = async (planId: string) => {
    const plan = subscriptionPlans.find((p) => p.id === planId);
    if (!plan) return;
    if (plan.isActive) {
      try {
        await deletePlan(planId).unwrap();
        refetchPlans();
      } catch {}
      return;
    }
    // No restore endpoint in backend; keep UI honest.
  };

  // Dropdown menu options
  const menuOptions = [
    { id: "overview" as TabType, label: "Overview", icon: BarChart3 },
    { id: "students" as TabType, label: "Students", icon: Users, badge: students.length },
    { id: "messages" as TabType, label: "Messages", icon: MessageCircle, badge: unreadCount },
    { id: "avatar" as TabType, label: "Avatar", icon: User },
    { id: "earnings" as TabType, label: "Earnings", icon: DollarSign },
    { id: "subscription" as TabType, label: "Subscription", icon: CreditCard },
  ];

  const currentTabLabel = menuOptions.find((opt) => opt.id === activeTab)?.label || "Overview";
  const CurrentIcon = menuOptions.find((opt) => opt.id === activeTab)?.icon || BarChart3;

  // KPI cards mapped to real data where possible
  const kpiData = useMemo(() => {
    return [
      {
        icon: Users,
        title: "Total Subscribers",
        value: String(students.length),
        change: "+0",
        changeType: "increase" as const,
        color: "#0078D7",
        gradient: "from-[#0078D7]/10 to-[#0078D7]/5",
      },
      {
        icon: UserPlus,
        title: "Active This Week",
        value: String(students.length),
        change: "+0",
        changeType: "increase" as const,
        color: "#00AEEF",
        gradient: "from-[#00AEEF]/10 to-[#00AEEF]/5",
      },
      {
        icon: DollarSign,
        title: "Monthly Revenue",
        value: compactMoneyCents(totalGrossCents),
        change: "+$0",
        changeType: "increase" as const,
        color: "#10B981",
        gradient: "from-emerald-500/10 to-emerald-500/5",
      },
      {
        icon: MessageCircle,
        title: "Unread Messages",
        value: String(unreadCount),
        change: `${unreadCount} new`,
        changeType: "neutral" as const,
        color: "#8B5CF6",
        gradient: "from-purple-500/10 to-purple-500/5",
      },
    ];
  }, [students.length, totalGrossCents, unreadCount]);

  // Basic activity feed: derived from messages + student list (keeps UI alive)
  const activityFeed = useMemo(() => {
    const items: any[] = [];
    if (students[0]) {
      items.push({
        id: "a1",
        icon: UserPlus,
        text: `${students[0].name} is a subscriber`,
        timestamp: "recently",
        bgColor: "from-[#00AEEF]/10 to-[#0078D7]/5",
        iconColor: "#0078D7",
      });
    }
    if (messages[0]) {
      items.push({
        id: "a2",
        icon: MessageCircle,
        text: `New message from ${messages[0].name}`,
        timestamp: messages[0].timestamp || "recently",
        bgColor: "from-purple-500/10 to-purple-500/5",
        iconColor: "#8B5CF6",
      });
    }
    return items.slice(0, 6);
  }, [students, messages]);

  const newStudents = useMemo(() => students.filter((s) => s.status === "new"), [students]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50/30 via-white to-indigo-50/20 pb-20" data-test="design-mentor-dashboard-wired">
      {/* Header - Modern Frosted Glass */}
      <div className="sticky top-0 z-10 bg-white/70 backdrop-blur-xl border-b border-gray-100 shadow-sm">
        <div className="container max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-gradient-to-br from-[#00AEEF]/10 to-[#0078D7]/10 rounded-xl">
                <BarChart3 className="h-5 w-5 text-[#0078D7]" />
              </div>
              <div className="flex-1 min-w-0">
                <h1 className="text-gray-900">Mentor Dashboard</h1>
                <p className="text-sm text-gray-500">Manage your coaching business</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="hidden sm:flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="rounded-xl"
                  onClick={() => router.push("/feature/design/mentor-ai-setup")}
                >
                  AI Setup
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="rounded-xl"
                  onClick={() => router.push("/feature/design/mentor-settings")}
                >
                  <Settings className="h-4 w-4 mr-2" />
                  Settings
                </Button>
              </div>
              <Avatar className="h-9 w-9 border border-gray-200">
                <AvatarImage src={getUserAvatarUrl(me)} />
                <AvatarFallback className="bg-gradient-to-br from-[#00AEEF] to-[#0078D7] text-white">
                  {String(me?.fullName || me?.userName || "M").slice(0, 1)}
                </AvatarFallback>
              </Avatar>
            </div>
          </div>
        </div>

        {/* Tab Dropdown */}
        <div className="container max-w-6xl mx-auto px-4">
          <div className="relative">
            <button
              onClick={() => setShowDropdown(!showDropdown)}
              className="flex items-center gap-2.5 px-4 py-3 rounded-xl hover:bg-gradient-to-r hover:from-[#00AEEF]/5 hover:to-[#0078D7]/5 transition-all group"
            >
              <div className="p-1.5 bg-gradient-to-br from-[#00AEEF]/10 to-[#0078D7]/10 rounded-lg group-hover:from-[#00AEEF]/20 group-hover:to-[#0078D7]/20 transition-all">
                <CurrentIcon className="w-4 h-4 text-[#0078D7]" />
              </div>
              <span className="text-gray-900">{currentTabLabel}</span>
              <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${showDropdown ? "rotate-180" : ""}`} />
            </button>

            {showDropdown && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setShowDropdown(false)} />
                <div className="absolute top-full left-0 mt-2 w-72 bg-white/95 backdrop-blur-xl border border-gray-100 rounded-2xl shadow-xl z-20 overflow-hidden">
                  {menuOptions.map((option) => {
                    const Icon = option.icon;
                    return (
                      <button
                        key={option.id}
                        onClick={() => {
                          setActiveTab(option.id);
                          setShowDropdown(false);
                        }}
                        className={`w-full flex items-center justify-between px-4 py-3.5 hover:bg-gradient-to-r hover:from-[#00AEEF]/5 hover:to-[#0078D7]/5 transition-all ${
                          activeTab === option.id ? "bg-gradient-to-r from-[#00AEEF]/10 to-[#0078D7]/10" : ""
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-lg ${activeTab === option.id ? "bg-gradient-to-br from-[#00AEEF]/20 to-[#0078D7]/20" : "bg-gray-50"}`}>
                            <Icon className={`w-4 h-4 ${activeTab === option.id ? "text-[#0078D7]" : "text-gray-600"}`} />
                          </div>
                          <span className={`${activeTab === option.id ? "text-[#0078D7]" : "text-gray-900"}`}>{option.label}</span>
                        </div>
                        {option.badge !== undefined && (
                          <Badge
                            className={`${
                              option.id === "messages" && unreadCount > 0
                                ? "bg-gradient-to-r from-[#00AEEF] to-[#0078D7] text-white shadow-lg shadow-[#00AEEF]/30"
                                : "bg-gray-100 text-gray-600"
                            } text-xs px-2.5 py-0.5`}
                          >
                            {option.badge}
                          </Badge>
                        )}
                      </button>
                    );
                  })}
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="container max-w-6xl mx-auto px-4 py-6">
        {/* OVERVIEW TAB */}
        {activeTab === "overview" && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {kpiData.map((kpi) => {
                const Icon = kpi.icon;
                return (
                  <Card key={kpi.title} className="border-gray-100 shadow-md hover:shadow-lg transition-all rounded-2xl overflow-hidden group">
                    <CardContent className="p-5">
                      <div className={`p-3 bg-gradient-to-br ${kpi.gradient} rounded-xl w-fit mb-3 group-hover:scale-110 transition-transform`}>
                        <Icon className="w-6 h-6" style={{ color: kpi.color }} />
                      </div>
                      <p className="text-2xl text-gray-900 mb-1">{kpi.value}</p>
                      <p className="text-sm text-gray-600 mb-2">{kpi.title}</p>
                      <p className={`text-xs ${kpi.changeType === "increase" ? "text-emerald-600" : "text-gray-500"}`}>{kpi.change} this week</p>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <Card className="border-gray-100 shadow-md rounded-2xl overflow-hidden">
                <CardHeader className="bg-gradient-to-r from-gray-50 to-white border-b border-gray-100">
                  <CardTitle className="text-gray-900">Recent Activity</CardTitle>
                </CardHeader>
                <CardContent className="p-5 space-y-3">
                  {activityFeed.length === 0 ? (
                    <div className="text-sm text-gray-500">No recent activity.</div>
                  ) : (
                    activityFeed.map((activity) => {
                      const Icon = activity.icon;
                      return (
                        <div key={activity.id} className="flex items-start gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors">
                          <div className={`p-2 bg-gradient-to-br ${activity.bgColor} rounded-xl flex-shrink-0`}>
                            <Icon className="w-4 h-4" style={{ color: activity.iconColor }} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm text-gray-900">{activity.text}</p>
                            <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {activity.timestamp}
                            </p>
                          </div>
                        </div>
                      );
                    })
                  )}
                </CardContent>
              </Card>

              <Card className="border-gray-100 shadow-md rounded-2xl overflow-hidden">
                <CardHeader className="bg-gradient-to-r from-gray-50 to-white border-b border-gray-100">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-gray-900">New Students</CardTitle>
                    <Button variant="ghost" size="sm" onClick={() => setActiveTab("students")} className="text-[#0078D7] hover:bg-[#0078D7]/10 rounded-lg">
                      View All
                      <ChevronRight className="w-4 h-4 ml-1" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="p-5 space-y-3">
                  {newStudents.length === 0 ? (
                    <div className="text-sm text-gray-500">No new students.</div>
                  ) : (
                    newStudents.map((student) => (
                      <div key={student.id} className="flex items-center gap-3 p-3 bg-gradient-to-r from-gray-50 to-white border border-gray-100 rounded-xl">
                        <Avatar className="w-11 h-11 border-2 border-white shadow-sm ring-2 ring-gray-100">
                          <AvatarImage src={student.avatar} />
                          <AvatarFallback className="bg-gradient-to-br from-[#00AEEF] to-[#0078D7] text-white">{student.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <p className="text-gray-900">{student.name}</p>
                          <p className="text-xs text-gray-500">{student.joinedDate}</p>
                        </div>
                        <Badge className="bg-gradient-to-r from-emerald-500 to-emerald-600 text-white shadow-md shadow-emerald-500/30 text-xs px-2.5 py-0.5">New</Badge>
                      </div>
                    ))
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {/* STUDENTS TAB */}
        {activeTab === "students" && (
          <div className="space-y-4">
            <div className="flex flex-col gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input
                  placeholder="Search students..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-11 bg-white border-gray-200 rounded-xl shadow-sm focus:ring-2 focus:ring-[#0078D7]/20 h-12"
                />
              </div>
              <div className="flex gap-2 overflow-x-auto pb-2">
                {["all", "active", "inactive", "new"].map((filter) => (
                  <Button
                    key={filter}
                    variant={studentFilter === filter ? "default" : "outline"}
                    size="sm"
                    onClick={() => setStudentFilter(filter as any)}
                    className={`${
                      studentFilter === filter
                        ? "bg-gradient-to-r from-[#00AEEF] to-[#0078D7] hover:from-[#0078D7] hover:to-[#004C97] text-white shadow-lg shadow-[#00AEEF]/30"
                        : "bg-white border-gray-200 text-gray-700 hover:bg-gray-50"
                    } whitespace-nowrap rounded-xl px-4`}
                  >
                    {filter.charAt(0).toUpperCase() + filter.slice(1)}
                  </Button>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-600">
                {filteredStudents.length} student{filteredStudents.length !== 1 ? "s" : ""}
              </p>
            </div>

            <div className="space-y-3">
              {filteredStudents.map((student) => (
                <Card key={student.id} className="border-gray-100 shadow-md rounded-2xl overflow-hidden">
                  <CardContent className="p-4 flex items-center gap-3">
                    <Avatar className="w-12 h-12 border-2 border-white shadow-sm ring-2 ring-gray-100">
                      <AvatarImage src={student.avatar} />
                      <AvatarFallback className="bg-gradient-to-br from-[#00AEEF] to-[#0078D7] text-white">{student.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="text-gray-900">{student.name}</p>
                      <p className="text-xs text-gray-500">@{student.userName || ""}</p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        className="rounded-xl"
                        onClick={() => router.push(`/feature/design/u/${encodeURIComponent(student.userName || student.id)}`)}
                      >
                        View
                      </Button>
                      <Button
                        size="sm"
                        className="rounded-xl bg-gradient-to-r from-[#00AEEF] to-[#0078D7] hover:from-[#0078D7] hover:to-[#004C97] text-white"
                        onClick={() => router.push(`/feature/design/chat-wired?to=${encodeURIComponent(student.id)}`)}
                      >
                        Message
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* MESSAGES TAB */}
        {activeTab === "messages" && (
          <div className="space-y-4">
            <div className="text-sm text-gray-600">{loadingMessages ? "Loading..." : `${messages.length} conversations`}</div>
            <div className="space-y-3">
              {messages.map((m) => (
                <Card key={m.id} className="border-gray-100 shadow-md rounded-2xl overflow-hidden cursor-pointer hover:shadow-lg transition-all" onClick={() => router.push(`/feature/design/chat-wired?conversationId=${encodeURIComponent(m.id)}`)}>
                  <CardContent className="p-4 flex items-center gap-3">
                    <Avatar className="w-12 h-12 border-2 border-white shadow-sm ring-2 ring-gray-100">
                      <AvatarImage src={m.avatar} />
                      <AvatarFallback className="bg-gradient-to-br from-[#00AEEF] to-[#0078D7] text-white">{m.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-gray-900">{m.name}</p>
                        <p className="text-xs text-gray-500">{m.timestamp}</p>
                      </div>
                      <p className="text-sm text-gray-600 truncate">{m.text}</p>
                    </div>
                    {m.unread && <Badge className="bg-gradient-to-r from-[#00AEEF] to-[#0078D7] text-white">New</Badge>}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* EARNINGS TAB */}
        {activeTab === "earnings" && (
          <div className="space-y-6">
            <Card className="border-gray-100 shadow-md rounded-2xl overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-gray-50 to-white border-b border-gray-100">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-gradient-to-br from-[#00AEEF]/10 to-[#0078D7]/10 rounded-lg">
                    <BarChart3 className="w-4 h-4 text-[#0078D7]" />
                  </div>
                  <h3 className="text-gray-900">Earnings (last 30d)</h3>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                <p className="text-4xl text-gray-900 mb-2">{compactMoneyCents(totalGrossCents)}</p>
                <p className="text-sm text-gray-500">Gross</p>
                <div className="mt-4">
                  <Button variant="outline" className="rounded-xl" onClick={() => router.push("/creator-center/statistics")}>
                    Open full earnings analytics
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* SUBSCRIPTION TAB */}
        {activeTab === "subscription" && (
          <div className="space-y-6">
            <div className="p-6 bg-gradient-to-r from-purple-50 to-indigo-50 rounded-2xl border border-purple-100">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2.5 bg-gradient-to-br from-purple-500/20 to-indigo-500/20 rounded-xl">
                  <CreditCard className="h-6 w-6 text-purple-600" />
                </div>
                <h2 className="text-2xl text-gray-900">Subscription Plans</h2>
              </div>
              <p className="text-gray-600">Create and manage your subscription tiers</p>
            </div>

            <div className="flex justify-end">
              <Button className="bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-white shadow-lg shadow-purple-500/30 rounded-xl" onClick={() => router.push(`/feature/design/mentor/${encodeURIComponent(me?.userName || myId)}`)}>
                <Eye className="w-4 h-4 mr-2" />
                Preview Subscription Page
              </Button>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {subscriptionPlans.map((plan) => (
                <Card key={plan.id} className={`border-gray-100 shadow-md hover:shadow-lg transition-all rounded-2xl overflow-hidden ${!plan.isActive ? "opacity-60" : ""}`}>
                  <CardHeader className="bg-gradient-to-r from-gray-50 to-white border-b border-gray-100">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-xl text-gray-900">{plan.name}</h3>
                      <Badge className={`${plan.isActive ? "bg-gradient-to-r from-emerald-500 to-green-600 text-white shadow-md shadow-emerald-500/30" : "bg-gray-200 text-gray-600"} text-xs px-3 py-1`}>
                        {plan.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </div>
                    <div className="flex items-baseline gap-1">
                      <p className="text-4xl text-gray-900">${plan.price}</p>
                      <p className="text-sm text-gray-500">/{plan.billingPeriod}</p>
                    </div>
                  </CardHeader>
                  <CardContent className="p-6">
                    <div className="space-y-3 mb-6">
                      {plan.features.map((feature, idx) => (
                        <div key={idx} className="flex items-start gap-2">
                          <CheckCircle className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                          <p className="text-sm text-gray-700">{feature}</p>
                        </div>
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" className="flex-1 border-gray-200 text-gray-900 hover:bg-gray-50 rounded-lg" onClick={() => openEditPlanModal(plan.id)}>
                        <Settings className="w-3.5 h-3.5 mr-1.5" />
                        Edit
                      </Button>
                      <Button
                        size="sm"
                        className={`flex-1 ${
                          plan.isActive ? "bg-gray-200 hover:bg-gray-300 text-gray-700" : "bg-gray-100 text-gray-500"
                        } rounded-lg`}
                        onClick={() => togglePlanActivation(plan.id)}
                        disabled={!plan.isActive}
                      >
                        {plan.isActive ? "Deactivate" : "Activate"}
                      </Button>
                    </div>
                    {!plan.isActive && <p className="text-xs text-gray-500 mt-2">Re-activating is not supported; create a new plan instead.</p>}
                  </CardContent>
                </Card>
              ))}

              <Card className="border-2 border-dashed border-gray-300 shadow-md hover:shadow-lg hover:border-[#0078D7] transition-all rounded-2xl overflow-hidden group cursor-pointer" onClick={() => openEditPlanModal(null)}>
                <CardContent className="p-6 flex flex-col items-center justify-center h-full min-h-[400px]">
                  <div className="p-4 bg-gradient-to-br from-[#00AEEF]/10 to-[#0078D7]/10 rounded-2xl mb-4 group-hover:from-[#00AEEF]/20 group-hover:to-[#0078D7]/20 transition-all">
                    <Plus className="w-12 h-12 text-[#0078D7]" />
                  </div>
                  <p className="text-gray-900 mb-2">Add New Plan</p>
                  <p className="text-sm text-gray-500 text-center">Create a new subscription tier</p>
                </CardContent>
              </Card>
            </div>

            <Card className="border-blue-100 bg-gradient-to-r from-blue-50/50 to-indigo-50/30 shadow-sm rounded-2xl overflow-hidden">
              <CardContent className="p-6">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Star className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-gray-900 mb-1">Subscription Best Practices</p>
                    <ul className="text-sm text-gray-600 space-y-1">
                      <li>• Offer clear value in each tier</li>
                      <li>• Keep your most popular plan in the middle</li>
                      <li>• Include a free trial or basic tier to attract users</li>
                      <li>• Clearly communicate what each plan includes</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>

      {/* Local "edit plan" modal (minimal; keeps page functional) */}
      {showEditPlanModal && (
        <>
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50" onClick={() => setShowEditPlanModal(false)} />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <Card className="w-full max-w-lg bg-white border-gray-100 shadow-2xl rounded-2xl overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-gray-50 to-white border-b border-gray-100">
                <CardTitle className="text-gray-900">{editingPlanId ? "Edit Plan" : "Create Plan"}</CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                <div className="space-y-2">
                  <p className="text-sm text-gray-700">Name</p>
                  <Input value={editingPlanData.name} onChange={(e) => setEditingPlanData((p) => ({ ...p, name: e.target.value }))} />
                </div>
                <div className="space-y-2">
                  <p className="text-sm text-gray-700">Price (USD/month)</p>
                  <Input type="number" value={editingPlanData.price as any} onChange={(e) => setEditingPlanData((p) => ({ ...p, price: Number(e.target.value) }))} />
                </div>
                <div className="space-y-2">
                  <p className="text-sm text-gray-700">Features</p>
                  <div className="flex gap-2">
                    <Input value={newFeature} onChange={(e) => setNewFeature(e.target.value)} placeholder="Add feature..." />
                    <Button onClick={addFeature} className="bg-[#0078D7] hover:bg-[#004C97]">Add</Button>
                  </div>
                  <div className="space-y-2">
                    {editingPlanData.features.map((f, idx) => (
                      <div key={idx} className="flex items-center justify-between gap-2 bg-gray-50 border border-gray-200 rounded-xl px-3 py-2">
                        <span className="text-sm text-gray-800">{f}</span>
                        <Button variant="ghost" size="sm" onClick={() => removeFeature(idx)} className="text-gray-600">Remove</Button>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="flex justify-end gap-2 pt-2">
                  <Button variant="outline" onClick={() => setShowEditPlanModal(false)}>Cancel</Button>
                  <Button onClick={savePlan} className="bg-gradient-to-r from-[#00AEEF] to-[#0078D7] hover:from-[#0078D7] hover:to-[#004C97] text-white">Save</Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </>
      )}

      {/* Bottom nav is provided by `src/app/feature/design/layout.tsx` */}
    </div>
  );
}


