"use client";
import React, { useEffect, useRef, useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useClientHardwareInfo } from "@/hooks/use-client-hardware-info";
import Image from "next/image";
import { useGetPostsByUserNameQuery, useGetPostsQuery } from "@/redux/services/haveme/posts";
import UserPosts from "../user-posts";
import { useParams, usePathname } from "next/navigation";
import { useInView } from "react-intersection-observer";
import { useAppDispatch, useTypedSelector } from "@/redux/store";
import { resetUserPosts, selectAllPostForUser } from "@/redux/slices/adapters";
import { Skeleton } from "../ui/skeleton";
import AutoSizer from "react-virtualized-auto-sizer";
import { VariableSizeGrid as Grid } from "react-window";
import { Button } from "../ui/button";
import { cn } from "@/lib/utils";
import { useGetUserDetailsByUserNameQuery } from "@/redux/services/haveme/user";
import { useGetUserDetailsQuery } from "@/redux/services/haveme";

const ADD_POSTS = "ADD_POSTS";

export default function ProfileBody() {
  const userName = useParams();
  const { isMobile } = useClientHardwareInfo();
  const columnCount = isMobile ? 3 : 4;
  const containerRef = useRef<any>(null);
  const [currentTab, setCurrentTab] = useState("posts");
  const { ref, inView } = useInView();
  const appDispatcher = useAppDispatch();
  const [postQuery, setPostQuery] = useState({
    page: 1,
    perPage: 8,
    filter: "posts",
    userName: String(userName.uid || "").toLowerCase(),
  });
  const [savedQuery, setSavedQuery] = useState({ page: 1, perPage: 8, filter: "saved" });

  // Resolve canonical username (case-insensitive) so posts query always hits
  const { userDetailsData: resolvedUser } = useGetUserDetailsByUserNameQuery(
    { userName: userName.uid as string },
    { selectFromResult: ({ data }) => ({ userDetailsData: data?.data }) }
  );

  useEffect(() => {
    if (resolvedUser?.userName && resolvedUser.userName !== postQuery.userName) {
      setPostQuery((prev) => ({ ...prev, userName: resolvedUser.userName }));
    }
  }, [resolvedUser?.userName]);

  useEffect(() => {
    return () => {
      appDispatcher(resetUserPosts());
    };
  }, [userName?.uid]);

  const userPosts = useTypedSelector(selectAllPostForUser);

  const { userPostsData, isUsersPostDataLoading, isPostError } =
    useGetPostsByUserNameQuery(postQuery, {
      refetchOnMountOrArgChange: true,
      selectFromResult: ({ data, isLoading, isError }) => {
        return {
          userPostsData: data,
          isUsersPostDataLoading: isLoading,
          isPostError: isError,
        };
      },
    });

  // Saved posts for own profile (across all authors)
  const { data: savedPostsData, isLoading: isSavedLoading, isError: isSavedError } =
    useGetPostsQuery(savedQuery as any, { skip: currentTab !== "saved" });

  // Fallback: build saved list from localStorage if server returns empty or unsupported
  const [savedLocalPosts, setSavedLocalPosts] = useState<any[]>([]);
  useEffect(() => {
    if (currentTab !== "saved") return;
    let cancelled = false;
    const load = async () => {
      try {
        const raw = typeof window !== 'undefined' ? window.localStorage.getItem('savedPosts') : null;
        const map = raw ? JSON.parse(raw) : {};
        const ids: string[] = Object.keys(map).filter((k) => map[k] === true).slice(0, 30);
        if (ids.length === 0) {
          if (!cancelled) setSavedLocalPosts([]);
          return;
        }
        const base = (process.env.NEXT_PUBLIC_API_SERVER as any) || '/api/backend';
        const results = await Promise.all(
          ids.map(async (id) => {
            try {
              const res = await fetch(`${base}/v1/post/${id}`, { credentials: 'include' });
              if (!res.ok) return null;
              const data = await res.json();
              return data || null;
            } catch { return null; }
          })
        );
        const posts = results.filter(Boolean);
        if (!cancelled) setSavedLocalPosts(posts as any[]);
      } catch { if (!cancelled) setSavedLocalPosts([]); }
    };
    load();
    const onStorage = (e?: StorageEvent) => {
      if (!e || e.key === 'savedPosts') load();
    };
    if (typeof window !== 'undefined') window.addEventListener('storage', onStorage as any);
    return () => { cancelled = true; if (typeof window !== 'undefined') window.removeEventListener('storage', onStorage as any); };
  }, [currentTab]);

  // Additional client filter safety for "saved" tab: include only posts where isSaved === true
  // Saved tab should match the yellow save state (localStorage + backend flag)
  let savedMap: Record<string, boolean> = {};
  try {
    const raw = typeof window !== 'undefined' ? window.localStorage.getItem('savedPosts') : null;
    savedMap = raw ? JSON.parse(raw) : {};
  } catch {}
  let safeUserPosts = currentTab === "saved"
    ? ((savedPostsData?.data && Array.isArray(savedPostsData.data) && savedPostsData.data.length > 0)
        ? savedPostsData.data
        : savedLocalPosts)
    : (Array.isArray(userPosts) ? userPosts : []);

  // Ensure "Subscribed" tab only shows subscriber-only content
  if (currentTab === "subscribed" && Array.isArray(safeUserPosts)) {
    safeUserPosts = safeUserPosts.filter((p: any) => {
      const privacy = String(p?.privacy || "").toLowerCase();
      const isSubscriberOnly = privacy === "subscriber" || privacy === "subscribed" || privacy === "subscriber-only" || privacy === "pay-per-view";
      return isSubscriberOnly || Boolean(p?.isSubscriberOnly);
    });
  }

  // Determine if viewing own profile to show "Saved" tab and data
  const { data: me } = useGetUserDetailsQuery();
  const isOwnProfile = Boolean(me?.data?._id && resolvedUser?._id && me?.data?._id === resolvedUser?._id);

  const loadMorePosts = () => {
    if (currentTab === "saved") {
      setSavedQuery((prev) => ({ ...prev, page: prev.page + 1 }));
    } else {
      setPostQuery((prevQuery) => ({
        ...prevQuery,
        page: prevQuery.page + 1,
      }));
    }
  };

  const handleTabClick = (filter) => {
    appDispatcher(resetUserPosts());
    const nextUserName = filter === "saved"
      ? String(me?.data?.userName || resolvedUser?.userName || postQuery.userName)
      : String(resolvedUser?.userName || postQuery.userName);
    setPostQuery((prevQuery) => ({
      ...prevQuery,
      filter: filter,
      userName: nextUserName.toLowerCase(),
      page: 1,
    }));
    if (filter === "saved") {
      setSavedQuery({ page: 1, perPage: 8, filter: "saved" });
    }
    setCurrentTab(filter);
  };

  useEffect(() => {
    if (inView && postQuery.page !== userPostsData?.meta?.total) {
      loadMorePosts();
    }
  }, [inView]);

  if ((currentTab !== "saved" && isUsersPostDataLoading) || (currentTab === "saved" && isSavedLoading && savedLocalPosts.length === 0)) {
    return (
      <>
        {" "}
        <div className="grid grid-cols-3 md:grid-cols-4 gap-1">
          {Array.from({ length: 12 }, (_, index) => (
            <div key={index} className="flex flex-col space-y-3">
              <Skeleton className="h-[250px] w-full" />
            </div>
          ))}
        </div>
        .
      </>
    );
  }
  if ((currentTab !== "saved" && isPostError) || (currentTab === "saved" && isSavedError)) {
    return <div>Error fetching data</div>;
  }

  return (
    <div className="lg:mx-8 h-[calc(100dvh-110px)] scrollbar pb-tabbar" ref={containerRef}>
      <div className=" grid w-full grid-cols-4 lg:grid-cols-5 bg-transparent border-t rounded-none  border-secondary lg:px-16 lg:h-12">
        <Button
          variant="ghost"
          onClick={() => handleTabClick("posts")}
          className={cn("rounded-none not-italic", {
            "border-t-2 border-secondary-foreground brightness-50 dark:brightness-200":
              currentTab === "posts",
          })}
        >
          <Image
            height={30}
            width={30}
            alt="navicon"
            src="/assets/images/search-user-profile/post.svg"
          />
          {!isMobile && <h1 className="ml-4 text-base">Posts</h1>}
        </Button>
        {isOwnProfile && (
          <Button
            variant="ghost"
            onClick={() => handleTabClick("saved")}
            className={cn("rounded-none not-italic", {
              "border-t-2 border-secondary-foreground brightness-50 dark:brightness-200":
                currentTab === "saved",
            })}
          >
            <Image
              height={28}
              width={28}
              alt="navicon"
              src="/assets/images/my-Profile/bookmark.svg"
            />
            {!isMobile && <h1 className="ml-4 text-base">Saved</h1>}
          </Button>
        )}

        <Button
          variant="ghost"
          onClick={() => handleTabClick("subscribed")}
          className={cn("rounded-none not-italic", {
            "border-t-2 border-secondary-foreground brightness-50 dark:brightness-200":
              currentTab === "subscribed",
          })}
        >
          <Image
            height={32}
            width={32}
            alt="navicon"
            src="/assets/images/search-user-profile/subscribed.svg"
          />
          {!isMobile && <h1 className="ml-4 text-base">Subscribed</h1>}
        </Button>
        <Button
          variant="ghost"
          onClick={() => handleTabClick("liked")}
          className={cn("rounded-none not-italic", {
            "border-t-2 border-secondary-foreground brightness-50 dark:brightness-200":
              currentTab === "liked",
          })}
        >
          <Image
            height={32}
            width={32}
            alt="navicon"
            src="/assets/images/search-user-profile/heart.svg"
          />
          {!isMobile && <h1 className="ml-4 text-base">Likes</h1>}
        </Button>
        {/* liked remains fourth tab */}
      </div>
      {safeUserPosts?.length === 0 && (
        <div className="w-full justify-center items-center flex h-full py-10 text-muted-foreground">
          <h3>No posts yet</h3>
        </div>
      )}

      {/* Grid only */}

      <AutoSizer>
        {({ height, width }) => (
          <Grid
            className="abc scrollbar"
            height={height}
            width={width}
            columnCount={columnCount}
            columnWidth={() => containerRef?.current?.clientWidth / columnCount}
            rowHeight={() => containerRef?.current?.clientWidth / columnCount}
            rowCount={Math.ceil(safeUserPosts?.length / columnCount)}
            onItemsRendered={({ visibleRowStopIndex }) => {
              if (
                visibleRowStopIndex >=
                  Math.ceil(safeUserPosts?.length / columnCount) - 1 &&
                safeUserPosts?.length < userPostsData?.meta?.total
              ) {
                setPostQuery((prevQuery) => ({
                  ...prevQuery,
                  page: prevQuery.page + 1,
                }));
              }
            }}
          >
            {({ columnIndex, rowIndex, style }) => {
              const index = rowIndex * columnCount + columnIndex;
              const post = safeUserPosts[index];
              if (!post) return null;
              return <UserPosts post={post} style={style} />;
            }}
          </Grid>
        )}
      </AutoSizer>
    </div>
  );
}
