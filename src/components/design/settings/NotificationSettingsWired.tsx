"use client";

// Verbatim-ish port of `Edit Design Request (1)/src/pages/NotificationSettingsPage.tsx`
// Backend does not currently expose notification prefs, so we persist locally for now.

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Bell, Heart, MessageCircle, UserPlus, Award } from "lucide-react";
import { useRouter } from "next/navigation";

type NotifPrefs = {
  pushNotifications: boolean;
  emailNotifications: boolean;
  likes: boolean;
  comments: boolean;
  newFollowers: boolean;
  messages: boolean;
  mentorUpdates: boolean;
};

const KEY = "designNotificationPrefs";

export default function NotificationSettingsWired() {
  const router = useRouter();

  const [pushNotifications, setPushNotifications] = React.useState(true);
  const [emailNotifications, setEmailNotifications] = React.useState(true);
  const [likes, setLikes] = React.useState(true);
  const [comments, setComments] = React.useState(true);
  const [newFollowers, setNewFollowers] = React.useState(true);
  const [messages, setMessages] = React.useState(true);
  const [mentorUpdates, setMentorUpdates] = React.useState(true);

  React.useEffect(() => {
    try {
      const raw = window.localStorage.getItem(KEY);
      if (!raw) return;
      const x = JSON.parse(raw) as Partial<NotifPrefs>;
      if (typeof x.pushNotifications === "boolean") setPushNotifications(x.pushNotifications);
      if (typeof x.emailNotifications === "boolean") setEmailNotifications(x.emailNotifications);
      if (typeof x.likes === "boolean") setLikes(x.likes);
      if (typeof x.comments === "boolean") setComments(x.comments);
      if (typeof x.newFollowers === "boolean") setNewFollowers(x.newFollowers);
      if (typeof x.messages === "boolean") setMessages(x.messages);
      if (typeof x.mentorUpdates === "boolean") setMentorUpdates(x.mentorUpdates);
    } catch {}
  }, []);

  const save = () => {
    try {
      const next: NotifPrefs = { pushNotifications, emailNotifications, likes, comments, newFollowers, messages, mentorUpdates };
      window.localStorage.setItem(KEY, JSON.stringify(next));
    } catch {}
    router.back();
  };

  return (
    <div className="min-h-screen bg-white pb-24" data-test="design-notification-settings">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white/80 backdrop-blur-xl border-b border-gray-200">
        <div className="container max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="icon" onClick={() => router.back()} className="hover:bg-gray-100">
                <ArrowLeft className="h-5 w-5 text-gray-900" />
              </Button>
              <h1 className="text-xl text-gray-900">Notifications</h1>
            </div>
            <Button onClick={save} className="bg-[hsl(var(--brand-medium-blue))] hover:bg-[hsl(var(--brand-dark-blue))] text-white">
              Save
            </Button>
          </div>
        </div>
      </div>

      <div className="container max-w-4xl mx-auto px-4 py-6 space-y-6">
        {/* Push Notifications */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Bell className="h-5 w-5 text-[hsl(var(--brand-medium-blue))]" />
              <CardTitle className="text-gray-900">Push Notifications</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-start justify-between gap-4 pb-4 border-b">
              <div className="flex-1">
                <Label className="font-medium cursor-pointer text-gray-900">Enable Push Notifications</Label>
                <p className="text-sm text-gray-600">Receive notifications on your device</p>
              </div>
              <Button
                variant={pushNotifications ? "default" : "outline"}
                size="sm"
                onClick={() => setPushNotifications(!pushNotifications)}
                className={pushNotifications ? "bg-[hsl(var(--brand-medium-blue))] hover:bg-[hsl(var(--brand-dark-blue))]" : ""}
              >
                {pushNotifications ? "On" : "Off"}
              </Button>
            </div>

            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <Label className="font-medium cursor-pointer text-gray-900">Email Notifications</Label>
                <p className="text-sm text-gray-600">Receive notifications via email</p>
              </div>
              <Button
                variant={emailNotifications ? "default" : "outline"}
                size="sm"
                onClick={() => setEmailNotifications(!emailNotifications)}
                className={emailNotifications ? "bg-[hsl(var(--brand-medium-blue))] hover:bg-[hsl(var(--brand-dark-blue))]" : ""}
              >
                {emailNotifications ? "On" : "Off"}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Activity */}
        <Card>
          <CardHeader>
            <CardTitle className="text-gray-900">Activity</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-start justify-between gap-4 pb-4 border-b">
              <div className="flex items-center gap-3 flex-1">
                <Heart className="h-5 w-5 text-[hsl(var(--brand-medium-blue))]" />
                <div>
                  <Label className="font-medium cursor-pointer text-gray-900">Likes</Label>
                  <p className="text-sm text-gray-600">When someone likes your post</p>
                </div>
              </div>
              <Button
                variant={likes ? "default" : "outline"}
                size="sm"
                onClick={() => setLikes(!likes)}
                className={likes ? "bg-[hsl(var(--brand-medium-blue))] hover:bg-[hsl(var(--brand-dark-blue))]" : ""}
              >
                {likes ? "On" : "Off"}
              </Button>
            </div>

            <div className="flex items-start justify-between gap-4 pb-4 border-b">
              <div className="flex items-center gap-3 flex-1">
                <MessageCircle className="h-5 w-5 text-[hsl(var(--brand-medium-blue))]" />
                <div>
                  <Label className="font-medium cursor-pointer text-gray-900">Comments</Label>
                  <p className="text-sm text-gray-600">When someone comments on your post</p>
                </div>
              </div>
              <Button
                variant={comments ? "default" : "outline"}
                size="sm"
                onClick={() => setComments(!comments)}
                className={comments ? "bg-[hsl(var(--brand-medium-blue))] hover:bg-[hsl(var(--brand-dark-blue))]" : ""}
              >
                {comments ? "On" : "Off"}
              </Button>
            </div>

            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-3 flex-1">
                <UserPlus className="h-5 w-5 text-[hsl(var(--brand-medium-blue))]" />
                <div>
                  <Label className="font-medium cursor-pointer text-gray-900">New Followers</Label>
                  <p className="text-sm text-gray-600">When someone follows you</p>
                </div>
              </div>
              <Button
                variant={newFollowers ? "default" : "outline"}
                size="sm"
                onClick={() => setNewFollowers(!newFollowers)}
                className={newFollowers ? "bg-[hsl(var(--brand-medium-blue))] hover:bg-[hsl(var(--brand-dark-blue))]" : ""}
              >
                {newFollowers ? "On" : "Off"}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Messages & Updates */}
        <Card>
          <CardHeader>
            <CardTitle className="text-gray-900">Messages & Updates</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-start justify-between gap-4 pb-4 border-b">
              <div className="flex items-center gap-3 flex-1">
                <MessageCircle className="h-5 w-5 text-[hsl(var(--brand-medium-blue))]" />
                <div>
                  <Label className="font-medium cursor-pointer text-gray-900">Direct Messages</Label>
                  <p className="text-sm text-gray-600">When you receive a new message</p>
                </div>
              </div>
              <Button
                variant={messages ? "default" : "outline"}
                size="sm"
                onClick={() => setMessages(!messages)}
                className={messages ? "bg-[hsl(var(--brand-medium-blue))] hover:bg-[hsl(var(--brand-dark-blue))]" : ""}
              >
                {messages ? "On" : "Off"}
              </Button>
            </div>

            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-3 flex-1">
                <Award className="h-5 w-5 text-[hsl(var(--brand-medium-blue))]" />
                <div>
                  <Label className="font-medium cursor-pointer text-gray-900">Mentor Updates</Label>
                  <p className="text-sm text-gray-600">Updates from mentors you follow</p>
                </div>
              </div>
              <Button
                variant={mentorUpdates ? "default" : "outline"}
                size="sm"
                onClick={() => setMentorUpdates(!mentorUpdates)}
                className={mentorUpdates ? "bg-[hsl(var(--brand-medium-blue))] hover:bg-[hsl(var(--brand-dark-blue))]" : ""}
              >
                {mentorUpdates ? "On" : "Off"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}


