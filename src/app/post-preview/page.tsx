import PostPreview from "@/components/publish-post-modal/postpreview";
import InnerPageHeader from "@/components/shared/inner-page-header";
import React from "react";

function PostPreviewPage() {
  return (
    <div>
      <InnerPageHeader showBackButton={true} title="Christina Jack" />

      <PostPreview />
    </div>
  );
}

export default PostPreviewPage;
