import React from "react";

export default function MobileVideoFrame({ src, poster, children }:{
  src: string; poster?: string; children?: React.ReactNode;
}) {
  return (
    <div className="relative h-dvh w-full bg-black">
      <video
        src={src}
        poster={poster}
        playsInline
        muted
        autoPlay
        loop
        preload="metadata"
        className="absolute inset-0 h-full w-full object-cover"
      />
      <div className="pointer-events-none absolute inset-0">{children}</div>
    </div>
  );
}


