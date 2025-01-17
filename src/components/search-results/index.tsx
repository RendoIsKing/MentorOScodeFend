"use client";
import React, { useEffect, useState } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "../ui/tabs";
import UserSearchResults from "../user-search-results";
import PostSearchResults from "../post-search-results";
import { useParams, useRouter, useSearchParams } from "next/navigation";

const SearchResults = () => {
  const [activeTab, setActiveTab] = useState("users");
  const router = useRouter();
  const searchParams = useSearchParams();
  const search = searchParams.get("q") ?? "";

  useEffect(() => {
    router.push(`?q=${search}&type=${activeTab}`);
  }, [router, activeTab]);

  return (
    <Tabs
      value={activeTab}
      onValueChange={setActiveTab}
      className="w-full mx-auto my-2 lg:my-6"
    >
      <TabsList className="lg:h-14 grid w-full grid-cols-2 bg-transparent border-b border-secondary ">
        
        <TabsTrigger
          value="users"
          className=" lg:h-14 lg:text-xl data-[state=active]:text-primary data-[state=active]:border-b border-primary italic data-[state=active]:bg-transparent"
        >
          Users
        </TabsTrigger>
        <TabsTrigger
          value="posts"
          className="lg:h-14 lg:text-xl data-[state=active]:text-primary data-[state=active]:border-b border-primary italic data-[state=active]:bg-transparent"
        >
          Posts
        </TabsTrigger>
      </TabsList>

      <TabsContent value="posts">
        <PostSearchResults />
      </TabsContent>

      <TabsContent value="users">
        <UserSearchResults />
      </TabsContent>
    </Tabs>
  );
};

export default SearchResults;
