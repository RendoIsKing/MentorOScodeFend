"use client";
import { useSearchParams } from "next/navigation";
import { useGetUsersQuery } from "@/redux/services/haveme/search";
import UserCard from "@/components/shared/user-card";
import { baseServerUrl } from "@/lib/utils";
import { useEffect, useState } from "react";
import DsButton from "@/ui/ds/Button";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { useInView } from "react-intersection-observer";
import { useAppDispatch, useTypedSelector } from "@/redux/store";
import {
  selectFilteredUsers,
  setUserSearchQuery,
} from "@/redux/slices/adapters";

type ButtonType = {
  name: string;
  value: string;
};

function UserSearchResults() {
  const appDispatcher = useAppDispatch();

  const [selectedUserFilter, setSelectedUserFilter] = useState("all");
  const searchParams = useSearchParams();
  const type = searchParams.get("type") ?? "";
  const { ref, inView } = useInView();
  const search = searchParams.get("q") ?? "";

  const [query, setQuery] = useState({
    searchTerm: search ?? "",
    type: type ?? "",
    filter: selectedUserFilter,
    page: 1,
    perPage: 10,
  });

  const userResults = useTypedSelector(selectFilteredUsers);

  useEffect(() => {
    appDispatcher(setUserSearchQuery(search));
  }, [search]);

  const loadMoreUsers = () => {
    if (query?.page === data?.meta?.pageCount) return;

    setQuery((prevQuery) => ({
      ...prevQuery,
      page: prevQuery.page + 1,
    }));
  };

  const { data, isLoading, isError } = useGetUsersQuery(query);

  useEffect(() => {
    loadMoreUsers();
  }, [inView]);

  const handleUserButtonClick = (value: string) => {
    setSelectedUserFilter(value);
    setQuery((prevQuery) => ({
      ...prevQuery,
      filter: value,
      page: 1,
    }));
  };

  if (isLoading) {
    return <div className="w-full flex justify-center">Loading...</div>;
  }

  if (userResults.length === 0) {
    return (
      <>
        <h1 className="w-full flex justify-center text-4xl  h-[50vh] items-center">
          {`No results found for "${search}" `}{" "}
        </h1>
      </>
    );
  }

  if (isError) {
    return <div>Error fetching data</div>;
  }

  const buttonUserTabs: ButtonType[] = [
    {
      name: "All",
      value: "all",
    },
    {
      name: "Popular",
      value: "popular",
    },
    { name: "Trending", value: "trending" },
    {
      name: "Rookies",
      value: "rookies",
    },
  ];

  return (
    <div>
      <div className="flex justify-start my-4 lg:justify-start gap-2">
        {buttonUserTabs.map((item, index) => (
          <DsButton
            key={index}
            className={cn(
              "justify-center lg:min-w-24",
              selectedUserFilter === item.value && "brightness-110"
            )}
            onClick={(e) => {
              handleUserButtonClick(item.value);
            }}
          >
            <div className="flex justify-start items-center gap-2 text-sm lg:text-base">
              {item.name}
            </div>
          </DsButton>
        ))}
      </div>
      <div className="flex gap-4 flex-col">
        {userResults?.map((user, index) => (
          <Link href={`/${user?.userName}`} key={index}>
            <UserCard
              imageUrl={`${baseServerUrl}/${user?.photo?.path}`}
              ImageFallBackText={user?.fullName}
              userName={user?.fullName}
              userNameTag={user?.userName}
              userId={user?._id}
              isFollowing={user?.isFollowing}
              hasPlan={user?.hasPlan}
            />
          </Link>
        ))}
        <div ref={ref}></div>
      </div>
    </div>
  );
}

export default UserSearchResults;
