"use client";

// Verbatim-ish port of `Edit Design Request (1)/src/pages/SettingsPage.tsx`
// Wired to real app routing + logout behavior.

import React from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ChevronRight, Tag, Award, Shield, Bell, HelpCircle, LogOut, Sparkles } from "lucide-react";
import { useRouter } from "next/navigation";
import { useAppDispatch } from "@/redux/store";
import { logout } from "@/redux/slices/auth";
import { useGetUserDetailsQuery } from "@/redux/services/haveme";

export default function SettingsPageWired() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { data: meRes } = useGetUserDetailsQuery();
  const me = (meRes as any)?.data ?? {};
  const isMentor = Boolean(me?.isMentor);

  const handleLogout = async () => {
    try {
      dispatch(logout());
    } catch {}
    router.replace("/signin");
  };

  const settingsSections = [
    {
      title: "Account",
      items: [
        {
          icon: Tag,
          label: "Interests & Topics",
          description: "Manage your interests and preferences",
          href: "/feature/design/settings/interests",
          color: "from-purple-500/10 to-purple-500/5",
          iconColor: "text-purple-600",
        },
        {
          icon: Shield,
          label: "Account Settings",
          description: "Profile, username, and account details",
          href: "/feature/design/settings/account",
          color: "from-blue-500/10 to-blue-500/5",
          iconColor: "text-blue-600",
        },
      ],
    },
    {
      title: "Features",
      items: [
        {
          icon: Award,
          label: "Mentor Mode",
          description: isMentor ? "Manage your mentor profile and settings" : "Become a mentor and share your expertise",
          href: "/feature/design/mentor-settings",
          color: "from-amber-500/10 to-amber-500/5",
          iconColor: "text-amber-600",
          featured: true,
        },
      ],
    },
    {
      title: "Privacy & Security",
      items: [
        {
          icon: Shield,
          label: "Privacy",
          description: "Control who can see your content",
          href: "/feature/design/settings/privacy",
          color: "from-green-500/10 to-green-500/5",
          iconColor: "text-green-600",
        },
        {
          icon: Bell,
          label: "Notifications",
          description: "Manage notification preferences",
          href: "/feature/design/settings/notifications",
          color: "from-rose-500/10 to-rose-500/5",
          iconColor: "text-rose-600",
        },
      ],
    },
    {
      title: "Support",
      items: [
        {
          icon: HelpCircle,
          label: "Help & Support",
          description: "Get help and contact support",
          href: "/settings/report-a-problem",
          color: "from-cyan-500/10 to-cyan-500/5",
          iconColor: "text-cyan-600",
        },
      ],
    },
  ] as const;

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white pb-20">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white/80 backdrop-blur-xl border-b border-gray-200">
        <div className="max-w-3xl mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => router.back()} className="hover:bg-gray-100 rounded-full">
              <ArrowLeft className="h-5 w-5 text-gray-900" />
            </Button>
            <div>
              <h1 className="text-xl text-gray-900">Settings</h1>
              <p className="text-xs text-gray-500">Manage your account</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-6 space-y-6">
        {settingsSections.map((section, sectionIndex) => (
          <div key={sectionIndex} className="space-y-3">
            <div className="flex items-center gap-2 px-2">
              <h2 className="text-sm text-gray-500">{section.title}</h2>
              <div className="flex-1 h-px bg-gradient-to-r from-gray-200 to-transparent" />
            </div>
            <div className="space-y-3">
              {section.items.map((item, itemIndex) => {
                const Icon = item.icon;
                return (
                  <button
                    key={itemIndex}
                    onClick={() => router.push(item.href)}
                    className={`w-full flex items-center gap-4 p-5 rounded-2xl transition-all hover:shadow-md border ${
                      (item as any).featured
                        ? "bg-gradient-to-br from-[#00AEEF]/5 via-[#0078D7]/5 to-[#004C97]/5 border-[#00AEEF]/30 hover:border-[#00AEEF]/50"
                        : "bg-white border-gray-100 hover:border-gray-200"
                    }`}
                  >
                    <div className={`flex items-center justify-center h-12 w-12 rounded-xl bg-gradient-to-br ${item.color} flex-shrink-0`}>
                      <Icon className={`h-6 w-6 ${item.iconColor}`} />
                    </div>
                    <div className="flex-1 text-left">
                      <div className="flex items-center gap-2">
                        <p className="text-gray-900">{item.label}</p>
                        {(item as any).featured && <Sparkles className="h-3.5 w-3.5 text-amber-500" />}
                      </div>
                      <p className="text-sm text-gray-500 mt-0.5">{item.description}</p>
                    </div>
                    <ChevronRight className="h-5 w-5 text-gray-400 flex-shrink-0" />
                  </button>
                );
              })}
            </div>
          </div>
        ))}

        {/* Log Out */}
        <div className="pt-4">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-4 p-5 rounded-2xl bg-white border-2 border-red-200 hover:border-red-300 hover:bg-red-50 transition-all"
          >
            <div className="flex items-center justify-center h-12 w-12 rounded-xl bg-gradient-to-br from-red-500/10 to-red-500/5">
              <LogOut className="h-6 w-6 text-red-600" />
            </div>
            <div className="flex-1 text-left">
              <p className="text-red-600">Log Out</p>
              <p className="text-sm text-red-500/70">Sign out of your account</p>
            </div>
            <ChevronRight className="h-5 w-5 text-red-400" />
          </button>
        </div>
      </div>
    </div>
  );
}


