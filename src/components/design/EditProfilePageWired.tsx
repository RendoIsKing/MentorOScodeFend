"use client";

// Verbatim-ish port of `Edit Design Request (1)/src/pages/EditProfilePage.tsx`
// Wired to existing backend via `/api/app-media` (file upload) + `useUpdateMeMutation`.

import React, { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ArrowLeft, Check, Loader2, User as UserIcon, Camera, Image as ImageIcon, Sparkles } from "lucide-react";
import { useRouter } from "next/navigation";
import { useGetUserDetailsQuery } from "@/redux/services/haveme";
import { useUpdateMeMutation } from "@/redux/services/haveme/user";
import { uploadMedia } from "@/lib/api/content";

function fileUrl(fileId?: string | null) {
  if (!fileId) return "";
  return `/api/backend/v1/user/files/${encodeURIComponent(String(fileId))}`;
}

export default function EditProfilePageWired() {
  const router = useRouter();
  const { data: meRes, refetch: refetchMe } = useGetUserDetailsQuery();
  const meRaw = (meRes as any)?.data ?? {};

  const [updateMe, { isLoading: saving }] = useUpdateMeMutation();

  const [name, setName] = useState(String(meRaw?.fullName || ""));
  const [username, setUsername] = useState(String(meRaw?.userName || ""));
  const [bio, setBio] = useState(String(meRaw?.bio || ""));

  const [profileImage, setProfileImage] = useState<string>(fileUrl(meRaw?.photoId) || "");
  const [coverImage, setCoverImage] = useState<string>(fileUrl(meRaw?.coverPhotoId) || "");
  const [pendingProfileFile, setPendingProfileFile] = useState<File | null>(null);
  const [pendingCoverFile, setPendingCoverFile] = useState<File | null>(null);

  const profileInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setName(String(meRaw?.fullName || ""));
    setUsername(String(meRaw?.userName || ""));
    setBio(String(meRaw?.bio || ""));
    setProfileImage(fileUrl(meRaw?.photoId) || "");
    setCoverImage(fileUrl(meRaw?.coverPhotoId) || "");
  }, [meRaw?.fullName, meRaw?.userName, meRaw?.bio, meRaw?.photoId, meRaw?.coverPhotoId]);

  const handleProfileImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPendingProfileFile(file);
    const url = URL.createObjectURL(file);
    setProfileImage(url);
  };

  const handleCoverImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPendingCoverFile(file);
    const url = URL.createObjectURL(file);
    setCoverImage(url);
  };

  const handleSave = async () => {
    // Upload files first (if changed)
    let photoId: string | undefined;
    let coverPhotoId: string | undefined;
    if (pendingProfileFile) {
      const up = await uploadMedia(pendingProfileFile);
      photoId = up.id;
    }
    if (pendingCoverFile) {
      const up = await uploadMedia(pendingCoverFile);
      coverPhotoId = up.id;
    }

    await updateMe({
      fullName: name,
      userName: username,
      bio,
      ...(photoId ? { photoId } : {}),
      ...(coverPhotoId ? { coverPhotoId } : {}),
    } as any).unwrap();

    refetchMe();
    router.refresh();
    router.replace("/feature/design/profile");
  };

  const quitMentor = async () => {
    if (!Boolean(meRaw?.isMentor)) return;
    const ok = window.confirm("Quit being a mentor? You can become a mentor again later.");
    if (!ok) return;

    try {
      await updateMe({
        isMentor: false,
      } as any).unwrap();
    } catch {}

    // Clear local mentor caches used by design flows
    try {
      const myId = String(meRaw?._id || "");
      if (myId) {
        window.localStorage.removeItem(`mentorDashboardAvatar:${myId}`);
        window.localStorage.removeItem(`mentorAvatarDocs:${myId}`);
      }
      window.localStorage.removeItem("mentorProfile");
      window.localStorage.removeItem("mentorAiSetup");
    } catch {}

    refetchMe();
    router.refresh();
    router.replace("/feature/design/profile");
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white pb-24">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white/80 backdrop-blur-xl border-b border-gray-200">
        <div className="max-w-3xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="icon" onClick={() => router.back()} className="hover:bg-gray-100 rounded-full">
                <ArrowLeft className="h-5 w-5 text-gray-900" />
              </Button>
              <div>
                <h1 className="text-xl text-gray-900">Edit Profile</h1>
                <p className="text-xs text-gray-500">Customize your profile</p>
              </div>
            </div>
            <Button
              onClick={handleSave}
              disabled={saving}
              className="bg-gradient-to-r from-[#00AEEF] to-[#0078D7] hover:from-[#0078D7] hover:to-[#004C97] text-white shadow-lg shadow-[#00AEEF]/20"
            >
              {saving ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Check className="h-4 w-4 mr-2" />
                  Save Changes
                </>
              )}
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-6 space-y-6">
        {/* Cover & Profile Photo Section */}
        <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100">
          {/* Cover Photo */}
          <div
            className="h-48 bg-gradient-to-br from-[#00AEEF]/20 via-[#0078D7]/20 to-[#004C97]/20 relative group cursor-pointer"
            style={
              coverImage
                ? { backgroundImage: `url(${coverImage})`, backgroundSize: "cover", backgroundPosition: "center" }
                : {}
            }
            onClick={() => coverInputRef.current?.click()}
          >
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all flex items-center justify-center">
              <div className="opacity-0 group-hover:opacity-100 transition-all bg-white/90 backdrop-blur-sm rounded-xl px-4 py-2 flex items-center gap-2">
                <ImageIcon className="h-4 w-4 text-gray-900" />
                <span className="text-sm text-gray-900">{coverImage ? "Change Cover" : "Add Cover Photo"}</span>
              </div>
            </div>
          </div>

          {/* Profile Picture */}
          <div className="px-6 pb-6">
            <div className="flex items-end gap-4 -mt-16">
              <div className="relative group">
                <Avatar className="h-32 w-32 border-4 border-white shadow-xl">
                  <AvatarImage src={profileImage || undefined} />
                  <AvatarFallback className="bg-gradient-to-br from-[#00AEEF] to-[#0078D7] text-white text-3xl">
                    <UserIcon className="h-16 w-16" />
                  </AvatarFallback>
                </Avatar>
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    profileInputRef.current?.click();
                  }}
                  className="absolute bottom-0 right-0 h-10 w-10 bg-[#0078D7] hover:bg-[#004C97] text-white rounded-full shadow-lg flex items-center justify-center transition-all transform hover:scale-110"
                >
                  <Camera className="h-5 w-5" />
                </button>
              </div>
              <div className="flex-1 mb-2">
                <h3 className="text-2xl text-gray-900">{name || "Your Name"}</h3>
                <p className="text-gray-500">@{username || "username"}</p>
              </div>
            </div>
          </div>

          <input type="file" accept="image/*" ref={profileInputRef} onChange={handleProfileImageChange} className="hidden" />
          <input type="file" accept="image/*" ref={coverInputRef} onChange={handleCoverImageChange} className="hidden" />
        </div>

        {/* Basic Information */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center gap-2 mb-6">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-[#00AEEF]/10 to-[#0078D7]/10 flex items-center justify-center">
              <Sparkles className="h-5 w-5 text-[#0078D7]" />
            </div>
            <div>
              <h2 className="text-lg text-gray-900">Basic Information</h2>
              <p className="text-xs text-gray-500">Tell us about yourself</p>
            </div>
          </div>

          <div className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-sm text-gray-700">
                Display Name
              </Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your name"
                className="bg-gray-50 border-gray-200 focus:border-[#0078D7] focus:ring-[#0078D7]/20 h-12 rounded-xl text-gray-900"
                style={{ color: "#1F2937" }}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="username" className="text-sm text-gray-700">
                Username
              </Label>
              <div className="flex items-center bg-gray-50 border border-gray-200 rounded-xl overflow-hidden focus-within:border-[#0078D7] focus-within:ring-2 focus-within:ring-[#0078D7]/20 transition-all">
                <span className="px-4 text-gray-500 bg-gray-100 h-12 flex items-center border-r border-gray-200">@</span>
                <input
                  id="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="username"
                  className="flex-1 px-4 bg-transparent border-0 focus:outline-none h-12 text-gray-900"
                  style={{ color: "#1F2937" }}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="bio" className="text-sm text-gray-700">
                Bio
              </Label>
              <Textarea
                id="bio"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Write a short bio..."
                className="bg-gray-50 border-gray-200 focus:border-[#0078D7] focus:ring-[#0078D7]/20 rounded-xl text-gray-900"
                style={{ color: "#1F2937" }}
                rows={4}
              />
            </div>
          </div>
        </div>

        {/* Quit Mentor (only if currently a mentor) */}
        {Boolean(meRaw?.isMentor) && (
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-red-100">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h2 className="text-lg text-gray-900">Mentor Mode</h2>
                <p className="text-sm text-gray-500 mt-1">
                  Stop being a mentor. Your mentor dashboard and mentor-only features will be removed.
                </p>
              </div>
              <Button
                variant="outline"
                onClick={quitMentor}
                className="border-red-300 text-red-600 hover:bg-red-50"
              >
                Quit being a mentor
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}


