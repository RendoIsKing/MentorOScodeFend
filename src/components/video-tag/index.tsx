import { useClientHardwareInfo } from "@/hooks/use-client-hardware-info";

import { cn } from "@/lib/utils";
import React, { memo } from "react";

interface VideoProps {
  selectedFile: File | null;
}

const Video: React.FC<VideoProps> = memo(({ selectedFile }) => {
  const { isMobile } = useClientHardwareInfo();

  return (
    <video
      src={selectedFile ? URL.createObjectURL(selectedFile) : ""}
      controls
      controlsList="nodownload"
      className={cn(
        "max-w-lg h-full  w-[inherit]",
        isMobile ? "max-h-[20rem]" : "max-h-[35.5rem]"
      )}
      id="video-preview"
    />
  );
});

Video.displayName = "Video";

export default Video;
