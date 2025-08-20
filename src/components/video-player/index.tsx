import React, { forwardRef, useEffect, useImperativeHandle, useRef, useState } from "react";

interface VideoPlayerProps {
  videoSrc: string;
  className: string;
  createImpression?: () => void;
}

export interface VideoPlayerHandle {
  play: () => void;
  pause: () => void;
  toggleFullscreen: () => void;
}

export const VideoPlayer = forwardRef<VideoPlayerHandle, VideoPlayerProps>(
  ({ videoSrc, className, createImpression }, ref) => {
    const videoRef = useRef<HTMLVideoElement>(null);

    useImperativeHandle(ref, () => ({
      play: () => {
        videoRef.current?.play();
      },
      pause: () => {
        videoRef.current?.pause();
      },
      toggleFullscreen: async () => {
        const el = videoRef.current as any;
        if (!el) return;
        const isFs = document.fullscreenElement ||
          (document as any).webkitFullscreenElement ||
          (document as any).mozFullScreenElement ||
          (document as any).msFullscreenElement;
        try {
          if (!isFs) {
            await (el.requestFullscreen || el.webkitRequestFullscreen || el.mozRequestFullScreen || el.msRequestFullscreen)?.call(el);
          } else {
            await (document.exitFullscreen || (document as any).webkitExitFullscreen || (document as any).mozCancelFullScreen || (document as any).msExitFullscreen)?.call(document);
          }
        } catch (e) {
          // ignore
        }
      },
    }));

    const [isFullscreen, setIsFullscreen] = useState(false);
    const justHandledDoubleClickRef = useRef(false);

    useEffect(() => {
      const onFsChange = () => {
        const fs = !!(
          document.fullscreenElement ||
          (document as any).webkitFullscreenElement ||
          (document as any).mozFullScreenElement ||
          (document as any).msFullscreenElement
        );
        setIsFullscreen(fs);
      };
      document.addEventListener("fullscreenchange", onFsChange);
      document.addEventListener("webkitfullscreenchange", onFsChange as any);
      document.addEventListener("mozfullscreenchange", onFsChange as any);
      document.addEventListener("MSFullscreenChange", onFsChange as any);
      return () => {
        document.removeEventListener("fullscreenchange", onFsChange);
        document.removeEventListener("webkitfullscreenchange", onFsChange as any);
        document.removeEventListener("mozfullscreenchange", onFsChange as any);
        document.removeEventListener("MSFullscreenChange", onFsChange as any);
      };
    }, []);

    const toggleFullscreen = async () => {
      const el = videoRef.current?.parentElement as any; // request full screen on wrapper for better cross-browser support
      if (!el) return;
      try {
        if (!isFullscreen) {
          await (el.requestFullscreen || el.webkitRequestFullscreen || el.mozRequestFullScreen || el.msRequestFullscreen)?.call(el);
        } else {
          await (document.exitFullscreen || (document as any).webkitExitFullscreen || (document as any).mozCancelFullScreen || (document as any).msExitFullscreen)?.call(document);
        }
      } catch (e) {
        // noop
      }
    };

    return (
      <video
        onPlay={() => createImpression()}
        src={videoSrc}
        autoPlay
        loop
        controls={false}
        className={className}
        ref={videoRef}
        onClick={() => {
          if (justHandledDoubleClickRef.current) return;
          if (videoRef.current?.paused) {
            videoRef.current.play();
          } else {
            videoRef.current.pause();
          }
        }}
        // remove double-click handler; fullscreen controlled externally
        playsInline
      />
    );
  }
);

VideoPlayer.displayName = "VideoPlayer";
