import React, {
  useCallback,
  useEffect,
  useReducer,
  useRef,
  useState,
} from "react";
import PostInteraction from "@/components/postInteraction";

import { cn, textFormatter } from "@/lib/utils";
import { Label } from "@radix-ui/react-dropdown-menu";
import { ABeeZee } from "next/font/google";
import { VideoPlayer, VideoPlayerHandle } from "@/components/video-player";
import { IGetPostContentRequest } from "@/contracts/requests/IPostContentRequest";
import { useGetPostsQuery } from "@/redux/services/haveme/posts";
import AutoSizer from "react-virtualized-auto-sizer";
import { VariableSizeList as List } from "react-window";
import useIntersectionObserver from "@/components/intersectionObserver";
import { useClientHardwareInfo } from "@/hooks/use-client-hardware-info";
import { useHomeHeaderFilter } from "@/context/HomeFeedHeader";
import {
  useCreateImpressionMutation,
  useLogViewMutation,
} from "@/redux/services/haveme/interactions";

interface IMyCarouselProps {
  isMobile: boolean;
}

const ADD_POSTS = "ADD_POSTS";
const RESET_POSTS = "RESET_POSTS";

// TODO: Make this font definition dynamic
const fontItalic = ABeeZee({
  subsets: ["latin"],
  weight: ["400"],
  style: "italic",
});

const HomeFeedCarousel: React.FC<IMyCarouselProps> = ({ isMobile }) => {
  const listRef = useRef(null);
  const rowHeights = useRef({});
  const [page, setPage] = useState(1);
  const { homeHeaderFilter } = useHomeHeaderFilter();

  const perPage = 5;

  const query = {
    perPage: perPage,
    page: page,
    search: "",
    filter: homeHeaderFilter,
  };
  const { data: postDetails, isLoading: isLoadingDetails } =
    useGetPostsQuery(query);

  //console.log("postDetails??", homeHeaderFilter, query, postDetails);

  const getRowHeight = useCallback(
    (index) => rowHeights.current[index] + 8 || 82,
    []
  );

  const setRowHeight = useCallback((index, size) => {
    if (listRef.current) {
      listRef.current?.resetAfterIndex(0);
      rowHeights.current = { ...rowHeights.current, [index]: size };
    }
  }, []);

  function getPostsReducer(state, action) {
    switch (action.type) {
      case ADD_POSTS:
        const newPosts = action?.payload?.filter(
          (newPost) =>
            !state.posts.some(
              (existingPost) => existingPost._id === newPost._id
            )
        );
        // console.log("newPosts>>>", newPosts);
        return {
          ...state,
          posts: [...state.posts, ...newPosts],
        };
      case RESET_POSTS:
        return {
          ...state,
          posts: [],
        };
      default:
        return state;
    }
  }

  const [postsData, updatepostsData] = useReducer(getPostsReducer, {
    posts: [],
  });

  useEffect(() => {
    if (postDetails?.data) {
      updatepostsData({ type: RESET_POSTS });
      setPage(1);
    }
  }, [homeHeaderFilter]);

  useEffect(() => {
    if (postDetails?.data) {
      updatepostsData({ type: ADD_POSTS, payload: postDetails?.data });
    }
  }, [postDetails?.data]);

  return (
    <div className={isMobile ? "absolute top-2 -z-10" : "relative"}>
      <div>
        <div
          className={cn(" scrollbar", {
            "h-screen w-screen ": isMobile,
            "h-[88vh] w-[28vw]": !isMobile,
          })}
        >
          {isLoadingDetails ? (
            <div className="flex h-full w-full justify-center items-center text-gray-500 text-2xl">
              Loading...
            </div>
          ) : postsData?.posts?.length === 0 ? (
            <div className="flex h-full w-full justify-center items-center text-gray-500 text-2xl">
              {homeHeaderFilter === "following"
                ? "Please follow some accounts to see posts."
                : homeHeaderFilter === "subscribed"
                ? "Please subscribe some accounts to see posts."
                : "No posts found."}
            </div>
          ) : (
            <AutoSizer disableWidth>
              {({ height }) => (
                <List
                  className="snap-y snap-mandatory"
                  height={height}
                  itemCount={postsData?.posts?.length}
                  itemSize={getRowHeight}
                  ref={listRef}
                  onItemsRendered={({
                    visibleStartIndex,
                    visibleStopIndex,
                  }) => {
                    if (
                      visibleStopIndex >= postsData?.posts.length - 1 &&
                      !isLoadingDetails &&
                      postsData?.posts.length !== postDetails?.meta?.total
                    ) {
                      setPage((prevPage) => prevPage + 1);
                    }
                  }}
                >
                  {({ index, style }) => {
                    const post = postsData?.posts[index];

                    return (
                      <PostItem
                        style={style}
                        post={post}
                        isMobile={isMobile}
                        index={index}
                        setRowHeight={setRowHeight}
                      />
                    );
                  }}
                </List>
              )}
            </AutoSizer>
          )}
        </div>
      </div>
    </div>
  );
};

export function PostItem({
  style,
  index,
  setRowHeight,
  post,
  isMobile,
}: {
  style: React.CSSProperties;
  index: number;
  isMobile: boolean;
  setRowHeight: (index: number, size: number) => void;
  post: any;
}) {
  const rowRef = useRef(null);
  const { orientation, softwareOrientation, hardwareOrientation } =
    useClientHardwareInfo();
  const isPortraitHardware = hardwareOrientation === "portrait-primary";
  const isPortraitSoftware = softwareOrientation === "portrait-primary";

  const videoContainerRef = useRef<HTMLDivElement>(null);

  const videoRef = useRef<VideoPlayerHandle>(null);

  const [createImpressionTrigger] = useCreateImpressionMutation();
  const [logViewTrigger] = useLogViewMutation();

  const [viewPortTimer, setViewPortTimer] = useState(null);
  const [pointerTimer, setPointerTimer] = useState(null);

  useEffect(() => {
    if (rowRef.current) {
      setRowHeight(index, rowRef.current.clientHeight);
    }
  }, [rowRef]);

  const handleIntersection = useCallback(
    (entry) => {
      if (entry.isIntersecting) {
        if (!viewPortTimer) {
          const timer = setTimeout(() => {
            logViewTrigger({ postId: post._id });
          }, 5000);
          setViewPortTimer(timer);
        }
        videoRef?.current?.play();
      } else {
        if (viewPortTimer) {
          clearTimeout(viewPortTimer);
          setViewPortTimer(null);
        }
        videoRef?.current?.pause();
      }
    },
    [post._id, logViewTrigger, viewPortTimer]
  );

  const setRefs = useIntersectionObserver(handleIntersection, {
    threshold: 0.5,
  });

  useEffect(() => {
    if (videoContainerRef.current) {
      setRefs([videoContainerRef.current]);
    }
    return () => {
      if (viewPortTimer) {
        clearTimeout(viewPortTimer);
      }
      if (pointerTimer) {
        clearTimeout(pointerTimer);
      }
    };
  }, [videoContainerRef.current, setRefs, viewPortTimer, pointerTimer]);

  const fileType = post?.media[0]?.mediaType;

  const createImpression = useCallback(() => {
    createImpressionTrigger({ postId: post._id });
  }, [post._id, createImpressionTrigger]);

  const handleMouseEnter = () => {
    if (!pointerTimer) {
      const timer = setTimeout(() => {
        logViewTrigger({ postId: post._id });
      }, 5000);
      setPointerTimer(timer);
    }
  };

  const handleMouseLeave = () => {
    if (pointerTimer) {
      clearTimeout(pointerTimer);
      setPointerTimer(null);
    }
  };

  return (
    <div style={style}>
      <div
        ref={rowRef}
        className={cn({
          "p-0 snap-center ": isMobile,
          "p-1 snap-center": !isMobile,
        })}
      >
        <div
          ref={videoContainerRef}
          className={cn({
            "p-0 flex justify-center h-screen ": isMobile,
            "flex justify-between h-[86vh] w-[86%]": !isMobile,
          })}
        >
          {fileType === "image" ? (
            <img
              onLoad={() => createImpression()}
              src={`${
                process.env.NEXT_PUBLIC_API_SERVER +
                "/" +
                post?.mediaFiles[0].path
              }`}
              alt="post details"
              className={cn("rounded-md object-contain", {
                "h-full": isMobile,
                "w-full h-full flex": !isPortraitHardware,
                "w-screen": !isPortraitHardware && isMobile,
                "rotate-90": !isPortraitSoftware && isPortraitHardware,
              })}
              onMouseEnter={handleMouseEnter}
              onMouseLeave={handleMouseLeave}
            />
          ) : (
            <VideoPlayer
              videoSrc={`${
                process.env.NEXT_PUBLIC_API_SERVER +
                "/" +
                post?.mediaFiles[0].path
              }`}
              className={cn("rounded-md", {
                "h-full": isMobile,
                "w-full h-full flex": !isPortraitHardware,
                "w-screen": !isPortraitHardware && isMobile,
                "rotate-90": !isPortraitSoftware && isPortraitHardware,
              })}
              ref={videoRef}
              createImpression={createImpression}
            />
          )}

          {isMobile && (
            <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/10">
              <div
                className={cn("absolute right-0 bottom-16 ", {
                  "absolute right-0 top-0 scale-50 -mt-12": !isPortraitHardware,
                })}
              >
                <PostInteraction postDetails={post} />
              </div>
              <div className="flex flex-col p-4 absolute bottom-20 text-white">
                <div>
                  <Label>{post?.userInfo[0]?.fullName || "Guest"}</Label>
                </div>
                <div className="">
                  <Label>{textFormatter(post?.content)}</Label>
                </div>
              </div>
            </div>
          )}
          {!isMobile && (
            <div className="flex items-end">
              <PostInteraction postDetails={post} />
              <div
                className={`flex flex-col absolute items-start left-8 font-thin text-white py-4 ${fontItalic.className}`}
              >
                <div className="dark:text-white text-muted-foreground">
                  <Label>{post?.userInfo[0]?.fullName || "Guest"}</Label>
                </div>
                <div className="dark:text-white text-muted-foreground">
                  <Label>{textFormatter(post?.content)}</Label>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default HomeFeedCarousel;
