"use client";
import { useParams, useSearchParams } from "next/navigation";
import { useEffect, useReducer, useCallback, useState, useRef } from "react";
import { Button } from "../ui/button";
import { cn } from "@/lib/utils";
import UserPosts from "../user-posts";
import { useGetPostsQuery } from "@/redux/services/haveme/posts";
import { Skeleton } from "../ui/skeleton";
import AutoSizer from "react-virtualized-auto-sizer";
import { VariableSizeGrid as Grid } from "react-window";
import { useMediaQuery } from "@/hooks/use-media-query";
import { useAppDispatch, useTypedSelector } from "@/redux/store";
import {
  resetSearchedPosts,
  selectAllSearchedPosts,
} from "@/redux/slices/adapters";

type ButtonType = {
  name: string;
  value: string;
};

const buttonTabs: ButtonType[] = [
  {
    name: "All",
    value: "all",
  },
  // {
  //   name: "Unseen",
  //   value: "unseen",
  // },
  {
    name: "Seen",
    value: "seen",
  },
  {
    name: "Recently uploaded",
    value: "recently-uploaded",
  },
];

function PostSearchResults() {
  const containerRef = useRef<any>(null);
  const isMobile = useMediaQuery("(max-width: 768px)");
  const columnCount = isMobile ? 3 : 4;
  const appDispatcher = useAppDispatch();

  const searchParams = useSearchParams();
  const search = searchParams.get("q") ?? "";
  const [selectedFilter, setSelectedFilter] = useState("all");

  const [postQuery, setPostQuery] = useState({
    perPage: 8,
    page: 1,
    search: search ?? "a",
    filter: selectedFilter, // Default filter value
  });
  const postsData = useTypedSelector(selectAllSearchedPosts);

  const { userPostsData, isUsersPostDataLoading, isPostError } =
    useGetPostsQuery(postQuery, {
      refetchOnMountOrArgChange: true,
      selectFromResult: ({ data, isLoading, isError }) => {
        return {
          userPostsData: data,
          isUsersPostDataLoading: isLoading,
          isPostError: isError,
        };
      },
    });

  useEffect(() => {
    const search = searchParams.get("q") ?? "";
    setPostQuery({
      perPage: 8,
      page: 1,
      search: search,
      filter: selectedFilter,
    });
    if (search?.length > 0) {
      appDispatcher(resetSearchedPosts());
    }
  }, [searchParams]);

  const handleButtonClick = (value: string) => {
    setSelectedFilter(value);
    setPostQuery((prevQuery) => ({
      ...prevQuery,
      filter: value, // Update the filter value in the postQuery state
    }));
  };

  if (isUsersPostDataLoading) {
    return (
      <>
        <div className="grid grid-cols-3 md:grid-cols-4 gap-1">
          {Array.from({ length: 12 }, (_, index) => (
            <div key={index} className="flex flex-col space-y-3">
              <Skeleton className="h-[250px] w-full " />
            </div>
          ))}
        </div>
      </>
    );
  }

  if (userPostsData?.data.length === 0 && postQuery.page === 1) {
    return (
      <>
        <h1 className="w-full flex justify-center text-4xl h-[50vh] items-center">
          {`No results found for "${search}" `}{" "}
        </h1>
      </>
    );
  }

  return (
    <div className="h-screen scrollbar" ref={containerRef}>
      <div className="flex justify-start my-4 lg:justify-start gap-2">
        {buttonTabs.map((item, index) => (
          <Button
            key={index}
            className={cn(
              "justify-center rounded-3xl lg:min-w-24 text-foreground bg-muted hover:bg-transparent/10 dark:hover:bg-muted/50 dark:hover:text-foreground",
              selectedFilter === item.value &&
                "font-bold dark:text-muted dark:bg-white bg-transparent/10 focus:dark:bg-white focus:dark:text-muted"
            )}
            onClick={(e) => {
              handleButtonClick(item.value);
            }}
          >
            <div className="flex justify-start items-center gap-2 text-sm lg:text-base">
              {item.name}
            </div>
          </Button>
        ))}
      </div>
      <AutoSizer>
        {({ height, width }) => (
          <Grid
            height={height}
            width={width}
            columnCount={columnCount}
            columnWidth={() => containerRef?.current?.clientWidth / columnCount}
            rowHeight={() => containerRef?.current?.clientWidth / columnCount}
            rowCount={Math.ceil(postsData.length / columnCount)}
            onItemsRendered={({ visibleRowStopIndex }) => {
              if (
                visibleRowStopIndex >=
                  Math.ceil(postsData.length / columnCount) - 1 &&
                postQuery.page < userPostsData?.meta?.pageCount
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
              const post = postsData[index];
              if (!post) return null;
              return <UserPosts post={post} style={style} />;
            }}
          </Grid>
        )}
      </AutoSizer>
    </div>
  );
}

export default PostSearchResults;
