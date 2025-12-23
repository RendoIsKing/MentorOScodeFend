"use client";
import React from "react";
import PostSearchResults from "@/components/post-search-results";
import SearchResults from "@/components/search-results";
import { Separator } from "@/components/ui/separator";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";

const Search = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const search = searchParams.get("q") ?? "";

  React.useEffect(() => {
    const designEnabled =
      String(process.env.NEXT_PUBLIC_DESIGN_SEARCH || "") === "1" ||
      String(process.env.NEXT_PUBLIC_DESIGN || "") === "1";
    if (!designEnabled) return;
    router.replace("/feature/design/search");
  }, [router]);

  return (
    <>
      {!!search === false ? (
        <div className="lg:-mx-8">
          {/* <div className="p-2 pt-8  px-1 flex justify-between">
            <div className="flex">
              <Image
                src="/assets/images/search/clock.svg"
                alt="clock"
                width={20}
                height={20}
              />
               <p className="px-2 cursor-pointer">
                <span className="text-primary ">#</span>
                Search
              </p> 
            </div>

            <Image
              src="/assets/images/search/close-circle.svg"
              alt="close-circle"
              width={20}
              height={20}
            />
          </div> */}

          {/* <Separator /> */}
          <div className="p-4 py-0">
            <div className="overflow-y-auto max-h-70vh ">
              <PostSearchResults />
            </div>
          </div>
        </div>
      ) : (
        <SearchResults />
      )}
    </>
  );
};

export default Search;
