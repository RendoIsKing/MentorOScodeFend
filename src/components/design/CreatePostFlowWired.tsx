"use client";

// Based on `Edit Design Request (1)/src/components/CreatePostFlow.tsx`.
// Kept visually identical, but we capture the selected File so we can upload to the real backend.

import React, { useEffect, useRef, useState } from "react";
import { X, ChevronLeft, Image as ImageIcon, Film, Upload } from "lucide-react";
import WorkoutWidgetPreview from "@/components/design/WorkoutWidgetPreview";

interface CustomFeed {
  id: string;
  name: string;
  emoji: string;
}

export type CreateFlowResult = {
  type: "post" | "story";
  file?: File | null;
  mediaUrl: string; // preview url (object URL)
  mediaType?: "image" | "video";
  caption: string;
  feedIds: string[];
  widgetType?: string;
  widgetData?: any;
};

interface CreatePostFlowProps {
  onClose: () => void;
  onPost: (postData: CreateFlowResult) => void;
  customFeeds: CustomFeed[];
  initialWidget?: { type: string; data: any };
}

type PostType = "post" | "story" | null;
type Step = "type" | "media" | "crop" | "details";

export default function CreatePostFlowWired({ onClose, onPost, customFeeds, initialWidget }: CreatePostFlowProps) {
  const [step, setStep] = useState<Step>("type");
  const [postType, setPostType] = useState<PostType>(null);
  const [mediaUrl, setMediaUrl] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [widgetType, setWidgetType] = useState<string | undefined>(initialWidget?.type);
  const [widgetData, setWidgetData] = useState<any>(initialWidget?.data);
  const [mediaType, setMediaType] = useState<"image" | "video">("image");
  const [caption, setCaption] = useState("");
  const [selectedFeeds, setSelectedFeeds] = useState<string[]>([]);
  const [zoom, setZoom] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Skip to details step if we have a widget
  useEffect(() => {
    if (initialWidget) {
      setStep("type");
      setWidgetType(initialWidget.type);
      setWidgetData(initialWidget.data);
    }
  }, [initialWidget]);

  // Cleanup object URL
  useEffect(() => {
    return () => {
      if (mediaUrl) {
        try { URL.revokeObjectURL(mediaUrl); } catch {}
      }
    };
  }, [mediaUrl]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setSelectedFile(file);
      setMediaUrl(url);
      setMediaType(file.type.startsWith("video/") ? "video" : "image");
      setStep("crop");
    }
  };

  const handleCropComplete = () => setStep("details");

  const handlePost = () => {
    if (widgetType) {
      onPost({
        type: postType || "post",
        file: null,
        mediaUrl: "",
        caption,
        feedIds: selectedFeeds,
        widgetType,
        widgetData,
      });
    } else if (mediaUrl) {
      onPost({
        type: postType || "post",
        file: selectedFile,
        mediaUrl,
        mediaType,
        caption,
        feedIds: selectedFeeds,
      });
    }
  };

  const toggleFeed = (feedId: string) => {
    setSelectedFeeds((prev) => (prev.includes(feedId) ? prev.filter((id) => id !== feedId) : [...prev, feedId]));
  };

  const handleBack = () => {
    if (step === "crop") {
      setStep("media");
      if (mediaUrl) {
        try { URL.revokeObjectURL(mediaUrl); } catch {}
      }
      setMediaUrl("");
      setSelectedFile(null);
    } else if (step === "details") {
      if (widgetType) {
        setStep("type");
        setPostType(null);
      } else {
        setStep("crop");
      }
    } else if (step === "media") {
      setStep("type");
      setPostType(null);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center p-4 pt-16 pb-28"
      style={{ backgroundColor: "rgba(0, 0, 0, 0.05)" }}
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl max-w-lg w-full h-[calc(100vh-200px)] flex flex-col shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center gap-3">
            {step !== "type" && step !== "media" && (
              <button onClick={handleBack} className="p-1.5 hover:bg-gray-100 rounded-full transition-colors">
                <ChevronLeft className="w-5 h-5 text-gray-600" />
              </button>
            )}
            <h2 className="text-xl font-semibold text-gray-900">
              {step === "type" && "Create"}
              {step === "media" && `New ${postType === "story" ? "Story" : "Post"}`}
              {step === "crop" && "Crop"}
              {step === "details" && (widgetType ? "Share Widget" : "Share")}
            </h2>
          </div>
          <button onClick={onClose} className="p-1.5 hover:bg-gray-100 rounded-full transition-colors">
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden flex flex-col">
          {/* Step 1: Choose Post Type */}
          {step === "type" && (
            <div className="p-6 space-y-4">
              <button
                onClick={() => {
                  setPostType("post");
                  if (widgetType) setStep("details");
                  else setStep("media");
                }}
                className="w-full p-6 bg-gradient-to-br from-blue-50 to-blue-100 hover:from-blue-100 hover:to-blue-200 rounded-xl transition-all duration-200 group"
              >
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-[hsl(var(--brand-light-blue))] rounded-xl group-hover:scale-110 transition-transform duration-200">
                    <ImageIcon className="w-6 h-6 text-white" />
                  </div>
                  <div className="text-left flex-1">
                    <h3 className="font-semibold text-gray-900">Create Post</h3>
                    <p className="text-sm text-gray-600">Share a photo or video to your feed</p>
                  </div>
                </div>
              </button>

              <button
                onClick={() => {
                  setPostType("story");
                  if (widgetType) setStep("details");
                  else setStep("media");
                }}
                className="w-full p-6 bg-gradient-to-br from-purple-50 to-purple-100 hover:from-purple-100 hover:to-purple-200 rounded-xl transition-all duration-200 group"
              >
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-purple-600 rounded-xl group-hover:scale-110 transition-transform duration-200">
                    <Film className="w-6 h-6 text-white" />
                  </div>
                  <div className="text-left flex-1">
                    <h3 className="font-semibold text-gray-900">Create Story</h3>
                    <p className="text-sm text-gray-600">Share a moment that disappears after 24h</p>
                  </div>
                </div>
              </button>
            </div>
          )}

          {/* Step 2: Upload Media */}
          {step === "media" && (
            <div className="p-6 flex flex-col items-center justify-center min-h-[400px]">
              <input ref={fileInputRef} type="file" accept="image/*,video/*" onChange={handleFileSelect} className="hidden" />
              <button
                onClick={() => fileInputRef.current?.click()}
                className={`p-12 border-2 border-dashed rounded-2xl transition-all duration-200 hover:border-opacity-100 hover:bg-opacity-50 ${
                  postType === "story" ? "border-purple-300 hover:bg-purple-50" : "border-blue-300 hover:bg-blue-50"
                }`}
              >
                <div className="flex flex-col items-center gap-4">
                  <div className={`p-6 rounded-2xl ${postType === "story" ? "bg-purple-100" : "bg-blue-100"}`}>
                    <Upload className={`w-12 h-12 ${postType === "story" ? "text-purple-600" : "text-[hsl(var(--brand-light-blue))]"}`} />
                  </div>
                  <div className="text-center">
                    <p className="font-semibold text-gray-900">Upload media</p>
                    <p className="text-sm text-gray-500 mt-1">Click to select a photo or video</p>
                  </div>
                </div>
              </button>
            </div>
          )}

          {/* Step 3: Crop/Adjust */}
          {step === "crop" && mediaUrl && (
            <div className="flex flex-col h-full">
              <div className="flex-1 bg-gray-900 relative overflow-hidden flex items-center justify-center">
                {mediaType === "video" ? (
                  <video
                    src={mediaUrl}
                    className="max-w-full max-h-full"
                    controls
                    style={{ transform: `scale(${zoom}) translate(${position.x}px, ${position.y}px)` }}
                  />
                ) : (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={mediaUrl}
                    alt="Preview"
                    className="max-w-full max-h-full object-contain"
                    style={{ transform: `scale(${zoom}) translate(${position.x}px, ${position.y}px)` }}
                  />
                )}
              </div>

              {/* Controls */}
              <div className="p-4 bg-white border-t">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex-1">
                    <label className="text-sm font-medium text-gray-700">Zoom</label>
                    <input
                      type="range"
                      min="1"
                      max="3"
                      step="0.1"
                      value={zoom}
                      onChange={(e) => setZoom(parseFloat(e.target.value))}
                      className="w-full mt-2"
                    />
                  </div>
                  <button
                    onClick={handleCropComplete}
                    className={`px-6 py-2 rounded-xl text-white font-semibold transition-colors ${
                      postType === "story" ? "bg-purple-600 hover:bg-purple-700" : "bg-[hsl(var(--brand-medium-blue))] hover:bg-[hsl(var(--brand-dark-blue))]"
                    }`}
                  >
                    Next
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Add Details */}
          {step === "details" && (
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* Preview */}
              <div className="space-y-3">
                <h3 className="font-semibold text-gray-900">
                  {postType === "story" ? "New Story" : "New Post"}
                </h3>

                {widgetType ? (
                  <div className="rounded-xl border border-gray-200 p-4 bg-white">
                    {widgetType === "today-workout" && widgetData?.workout && (
                      <WorkoutWidgetPreview workout={widgetData.workout} />
                    )}
                    {/* Other widget types: keep UI parity but not fully wired yet */}
                  </div>
                ) : mediaUrl ? (
                  <div className="rounded-xl overflow-hidden bg-gray-100">
                    {mediaType === "video" ? (
                      <video src={mediaUrl} className="w-full h-64 object-cover" controls />
                    ) : (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={mediaUrl} alt="Preview" className="w-full h-64 object-cover" />
                    )}
                  </div>
                ) : null}
              </div>

              {/* Caption */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Caption</label>
                <textarea
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                  placeholder="Write something..."
                  className="w-full p-3 border border-gray-200 rounded-xl resize-none focus:ring-2 focus:ring-[hsl(var(--brand-medium-blue))] focus:border-transparent"
                  rows={4}
                />
              </div>

              {/* Custom Feeds */}
              {customFeeds.length > 0 && (
                <div className="space-y-3">
                  <h4 className="text-sm font-medium text-gray-700">Share to feeds</h4>
                  <div className="space-y-2">
                    {customFeeds.map((feed) => (
                      <button
                        key={feed.id}
                        onClick={() => toggleFeed(feed.id)}
                        className={`w-full flex items-center justify-between p-4 rounded-xl border transition-all ${
                          selectedFeeds.includes(feed.id)
                            ? "border-[hsl(var(--brand-medium-blue))] bg-blue-50"
                            : "border-gray-200 hover:border-gray-300"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-xl">{feed.emoji}</span>
                          <span className="font-medium text-gray-900">{feed.name}</span>
                        </div>
                        <div
                          className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                            selectedFeeds.includes(feed.id)
                              ? "border-[hsl(var(--brand-medium-blue))] bg-[hsl(var(--brand-medium-blue))]"
                              : "border-gray-300"
                          }`}
                        >
                          {selectedFeeds.includes(feed.id) && <div className="w-2 h-2 bg-white rounded-full" />}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="pt-2">
                <button
                  onClick={handlePost}
                  disabled={!widgetType && !mediaUrl}
                  className={`w-full py-3 rounded-xl font-semibold text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                    postType === "story" ? "bg-purple-600 hover:bg-purple-700" : "bg-[hsl(var(--brand-medium-blue))] hover:bg-[hsl(var(--brand-dark-blue))]"
                  }`}
                >
                  {postType === "story" ? "Share Story" : "Share Post"}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}


