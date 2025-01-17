"use client";
import React, { useEffect, useRef, useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useClientHardwareInfo } from "@/hooks/use-client-hardware-info";
import Image from "next/image";
import { useGetPostsByUserNameQuery } from "@/redux/services/haveme/posts";
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
    userName: userName.uid as string,
  });

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

  const loadMorePosts = () => {
    setPostQuery((prevQuery) => ({
      ...prevQuery,
      page: prevQuery.page + 1,
    }));
  };

  const handleTabClick = (filter) => {
    appDispatcher(resetUserPosts());
    setPostQuery((prevQuery) => ({
      ...prevQuery,
      filter: filter,
      page: 1,
    }));
    setCurrentTab(filter);
  };

  useEffect(() => {
    if (inView && postQuery.page !== userPostsData?.meta?.total) {
      loadMorePosts();
    }
  }, [inView]);

  if (isUsersPostDataLoading) {
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
  if (isPostError) {
    return <div>Error fetching data</div>;
  }

  return (
    <div className="lg:mx-8 h-screen scrollbar " ref={containerRef}>
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
        <Button
          variant="ghost"
          onClick={() => handleTabClick("tagged")}
          className={cn("rounded-none not-italic", {
            "border-t-2 border-secondary-foreground brightness-50 dark:brightness-200":
              currentTab === "tagged",
          })}
        >
          <Image
            height={32}
            width={32}
            alt="navicon"
            src="/assets/images/search-user-profile/people.svg"
          />
          {!isMobile && <h1 className="ml-4 text-base">Tagged </h1>}
        </Button>

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
        {!isMobile && (
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
      </div>
      {userPosts?.length === 0 && (
        <div className="w-full justify-center items-center flex h-full">
          <h3>No Posts to show</h3>
        </div>
      )}

      <AutoSizer>
        {({ height, width }) => (
          <Grid
            className="abc scrollbar"
            height={height}
            width={width}
            columnCount={columnCount}
            columnWidth={() => containerRef?.current?.clientWidth / columnCount}
            rowHeight={() => containerRef?.current?.clientWidth / columnCount}
            rowCount={Math.ceil(userPosts?.length / columnCount)}
            onItemsRendered={({ visibleRowStopIndex }) => {
              if (
                visibleRowStopIndex >=
                  Math.ceil(userPosts?.length / columnCount) - 1 &&
                userPosts?.length < userPostsData?.meta?.total
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
              const post = userPosts[index];
              if (!post) return null;
              return <UserPosts post={post} style={style} />;
            }}
          </Grid>
        )}
      </AutoSizer>
    </div>
  );
}
