import React, { forwardRef, useImperativeHandle, useRef } from "react";

interface VideoPlayerProps {
  videoSrc: string;
  className: string;
  createImpression?: () => void;
}

export interface VideoPlayerHandle {
  play: () => void;
  pause: () => void;
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
    }));

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
          if (videoRef.current?.paused) {
            videoRef.current.play();
          } else {
            videoRef.current.pause();
          }
        }}
      />
    );
  }
);

VideoPlayer.displayName = "VideoPlayer";
