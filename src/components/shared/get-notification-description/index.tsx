import React from "react";

interface NotificationProps {
  actorAvatar?: string; // left profile pic
  actorName?: string;   // left actor name
  verb: "follow" | "like_post" | "comment" | string;
  text?: string;        // comment text if any
  mediaThumb?: string;  // right media thumbnail for like/comment
}

const NotificationRow: React.FC<NotificationProps> = ({ actorAvatar, actorName, verb, text, mediaThumb }) => {
  const leftSrc = actorAvatar || "/assets/images/Notification/user-another1.svg";
  const rightSrc = mediaThumb || "";

  const renderLine = () => {
    if (verb === "follow") return (<span><strong>{actorName}</strong> started following you</span>);
    if (verb === "like_post") return (<span><strong>{actorName}</strong> liked your post</span>);
    if (verb === "comment") return (<span><strong>{actorName}</strong> commented on your post</span>);
    return (<span><strong>{actorName}</strong> {verb}</span>);
  };

  return (
    <div className="flex items-start justify-between gap-3 py-3">
      <div className="flex items-start gap-3 min-w-0">
        <img src={leftSrc} alt="avatar" className="h-11 w-11 rounded-full object-cover" />
        <div className="min-w-0">
          <div className="text-sm leading-tight">{renderLine()}</div>
          {text ? (
            <div className="text-xs text-muted-foreground mt-1 line-clamp-2 break-words">
              {text}
            </div>
          ) : null}
        </div>
      </div>
      { (verb === "like_post" || verb === "comment") && rightSrc ? (
        <img src={rightSrc} alt="media" className="h-11 w-11 rounded object-cover" />
      ) : null }
    </div>
  );
};

export default NotificationRow;
