import React, {
  useCallback,
  useEffect,
  useReducer,
  useRef,
  useState,
} from "react";
import PostInteraction from "@/components/postInteraction";

import { cn, textFormatter } from "@/lib/utils";
import { VideoPlayer, VideoPlayerHandle } from "@/components/video-player";
import { Maximize2, Minimize2 } from "lucide-react";
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

// Typography handled via utility classes; no special font import

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
    // Include the current user's own posts when viewing the generic Feed
    includeSelf: homeHeaderFilter === "foryou" ? true : undefined,
  } as any;
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
            "h-[88vh] w-[40vw] xl:w-[44vw] 2xl:w-[48vw]": !isMobile,
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
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isPseudoFullscreen, setIsPseudoFullscreen] = useState(false);
  const isFsActive = () =>
    !!(
      document.fullscreenElement ||
      (document as any).webkitFullscreenElement ||
      (document as any).mozFullScreenElement ||
      (document as any).msFullscreenElement
    );

  const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));

  const toggleContainerFullscreen = async () => {
    const container = videoContainerRef.current as any;
    if (!container) return;
    const active = isFsActive();
    try {
      if (!active) {
        const req =
          container.requestFullscreen ||
          container.webkitRequestFullscreen ||
          container.mozRequestFullScreen ||
          container.msRequestFullscreen;
        if (req) await req.call(container);
        await wait(150);
        if (!isFsActive()) {
          // Try page-level
          const docReq = (document.documentElement as any).requestFullscreen ||
            (document.documentElement as any).webkitRequestFullscreen ||
            (document.documentElement as any).mozRequestFullScreen ||
            (document.documentElement as any).msRequestFullscreen;
          if (docReq) await docReq.call(document.documentElement);
          await wait(150);
        }
        if (!isFsActive()) {
          // Pseudo fullscreen
          setIsPseudoFullscreen(true);
          document.body.style.overflow = "hidden";
        }
      } else {
        await (document.exitFullscreen ||
          (document as any).webkitExitFullscreen ||
          (document as any).mozCancelFullScreen ||
          (document as any).msExitFullscreen)?.call(document);
        await wait(150);
        setIsPseudoFullscreen(false);
        document.body.style.overflow = "";
      }
    } catch (e) {
      setIsPseudoFullscreen(true);
      document.body.style.overflow = "hidden";
    }
  };

  useEffect(() => {
    const handleFsChange = () => {
      const fsEl = (document.fullscreenElement ||
        (document as any).webkitFullscreenElement ||
        (document as any).mozFullScreenElement ||
        (document as any).msFullscreenElement) as HTMLElement | null;
      const active = fsEl === videoContainerRef.current;
      setIsFullscreen(active);
      if (active) {
        setIsPseudoFullscreen(false);
        document.body.style.overflow = "hidden";
      } else {
        document.body.style.overflow = "";
      }
    };
    document.addEventListener("fullscreenchange", handleFsChange);
    document.addEventListener("webkitfullscreenchange", handleFsChange as any);
    document.addEventListener("mozfullscreenchange", handleFsChange as any);
    document.addEventListener("MSFullscreenChange", handleFsChange as any);
    return () => {
      document.removeEventListener("fullscreenchange", handleFsChange);
      document.removeEventListener("webkitfullscreenchange", handleFsChange as any);
      document.removeEventListener("mozfullscreenchange", handleFsChange as any);
      document.removeEventListener("MSFullscreenChange", handleFsChange as any);
    };
  }, []);

  // Keyboard shortcut: press "f" to toggle fullscreen for accessibility and Opera GX reliability
  useEffect(() => {
    const keyHandler = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() === "f") {
        e.preventDefault();
        toggleContainerFullscreen();
      }
    };
    document.addEventListener("keydown", keyHandler);
    return () => document.removeEventListener("keydown", keyHandler);
  }, []);

  const [createImpressionTrigger] = useCreateImpressionMutation();
  const [logViewTrigger] = useLogViewMutation();

  const [viewPortTimer, setViewPortTimer] = useState(null);
  const [pointerTimer, setPointerTimer] = useState(null);
  const [isCaptionExpanded, setIsCaptionExpanded] = useState(false);
  const clampStyle: React.CSSProperties = {
    display: "-webkit-box",
    WebkitBoxOrient: "vertical" as any,
    WebkitLineClamp: 2 as any,
    overflow: "hidden",
  };

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
          className={cn(
            "relative",
            {
              "p-0 flex justify-center h-screen pr-16 sm:pr-20 md:pr-24":
                isMobile && !isFullscreen && !isPseudoFullscreen,
              "flex justify-center h-[86vh] w-full pr-24 xl:pr-28 2xl:pr-32":
                !isMobile && !isFullscreen && !isPseudoFullscreen,
              "fixed inset-0 z-50 flex justify-center items-center bg-black pr-0":
                isPseudoFullscreen,
              "flex justify-center h-screen w-screen pr-0": isFullscreen,
            }
          )}
        >
          <div
            className={cn("relative", {
              "h-full": isMobile,
              "w-full h-full flex": !isPortraitHardware,
              "w-screen": !isPortraitHardware && isMobile,
              "rotate-90": !isPortraitSoftware && isPortraitHardware,
            })}
          >
            {fileType === "image" ? (
              <img
                onLoad={() => createImpression()}
                src={post?.mediaFiles?.[0]?.path ? `${process.env.NEXT_PUBLIC_API_SERVER}/${post.mediaFiles[0].path}` : undefined}
                alt="post details"
                className={cn("rounded-md object-contain w-full h-full")}
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
              />
            ) : (
              <VideoPlayer
                videoSrc={post?.mediaFiles?.[0]?.path ? `${process.env.NEXT_PUBLIC_API_SERVER}/${post.mediaFiles[0].path}` : undefined}
                className={cn("rounded-md w-full h-full")}
                ref={videoRef}
                createImpression={createImpression}
              />
            )}

            <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent rounded-md pointer-events-none" />
            {/* Double-click anywhere on media to toggle fullscreen (safe overlay, not the video element) */}
            <div
              className="absolute inset-0 z-30 cursor-zoom-in"
              onDoubleClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                toggleContainerFullscreen();
              }}
            />
            <button
              className="absolute top-2 right-2 z-40 bg-black/40 hover:bg-black/60 text-white p-2 rounded-md"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                if (isFullscreen || isPseudoFullscreen) {
                  (document.exitFullscreen || (document as any).webkitExitFullscreen || (document as any).mozCancelFullScreen || (document as any).msExitFullscreen)?.call(document);
                  setIsPseudoFullscreen(false);
                  document.body.style.overflow = "";
                } else {
                  toggleContainerFullscreen();
                }
              }}
              aria-label="Toggle fullscreen"
            >
              {isFullscreen || isPseudoFullscreen ? (
                <Minimize2 size={18} />
              ) : (
                <Maximize2 size={18} />
              )}
            </button>
            <div className="absolute left-3 bottom-3 md:left-4 md:bottom-4 text-white space-y-1 text-left pr-24 z-40">
              <p className="text-base md:text-lg font-semibold leading-tight drop-shadow select-none">
                {post?.userInfo[0]?.fullName || "Guest"}
              </p>
              <p
                className="text-xs md:text-sm text-white/90 max-w-[60ch] drop-shadow cursor-pointer"
                style={isCaptionExpanded ? undefined : clampStyle}
                onClick={(e) => {
                  e.stopPropagation();
                  setIsCaptionExpanded((v) => !v);
                }}
              >
                {textFormatter(post?.content)}
              </p>
              {post?.content && post?.content.length > 80 && (
                <button
                  className="text-xs underline"
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsCaptionExpanded((v) => !v);
                  }}
                  aria-expanded={isCaptionExpanded}
                >
                  {isCaptionExpanded ? "See less" : "See more"}
                </button>
              )}
            </div>
          </div>

          {isMobile && (
            <div
              className={cn(
                "absolute right-0 top-1/2 -translate-y-1/2",
                {
                  "scale-50": !isPortraitHardware,
                }
              )}
            >
              <PostInteraction postDetails={post} />
            </div>
          )}
          {!isMobile && (
            <>
              <div className={cn("absolute right-0 top-1/2 -translate-y-1/2", { hidden: isFullscreen || isPseudoFullscreen })}>
                <PostInteraction postDetails={post} />
              </div>
              {/* remove dblclick overlay; using explicit button for reliability */}
              {/* overlay now attached to media wrapper above */}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default HomeFeedCarousel;
