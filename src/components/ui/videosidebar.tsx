import {
  BookmarkMinus,
  GripHorizontal,
  Heart,
  MessageSquareMore,
  RotateCcwSquare,
} from "lucide-react";
import React from "react";

const VideoSidebar = () => {
  return (
    <div>
      <ul>
        <li className="list-item">
          <div className="flex flex-col menus_list items-center">
            <Heart size={23} color="#ffffff" />
            <h3>2.9M</h3>
          </div>
        </li>
        <li className="list-item">
          <div className="flex flex-col menus_list items-center">
            <MessageSquareMore size={23} color="#ffffff" />
            <h3>300</h3>
          </div>
        </li>
        <li className="list-item">
          <div className="flex flex-col menus_list items-center">
            <BookmarkMinus size={23} color="#ffffff" />
            <h3>20k</h3>
          </div>
        </li>
        <li className="list-item">
          <GripHorizontal size={23} color="#ffffff" />
        </li>
        <li className="list-item">
          <RotateCcwSquare size={23} color="#ffffff" />
        </li>
      </ul>
    </div>
  );
};

export default VideoSidebar;
