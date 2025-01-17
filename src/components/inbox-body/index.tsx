// "use client";
// import UserChat from "@/components/chat/UserChat";
// import UserStories from "@/components/stories/user-story";
// import YourStories from "@/components/stories/your-story";
// import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
// import { Separator } from "@/components/ui/separator";
// import { X } from "lucide-react";
// import React, { ChangeEvent, useEffect, useState } from "react";
// import { Input } from "@/components/ui/input";
// import { useClientHardwareInfo } from "@/hooks/use-client-hardware-info";
// import { LivePostPopup } from "../live-post-popup";
// import Search from "@/assets/images/Sidebar/search.svg";
// import FeedFooter from "../feed/feed-footer";
// import Link from "next/link";
// import ContentUploadProvider from "@/context/open-content-modal";
// import {
//   useGetFollowingUsersStoryQuery,
//   useGetStoriesByUserNameQuery,
// } from "@/redux/services/haveme/posts";
// import { useUserOnboardingContext } from "@/context/UserOnboarding";
// import { Stories, UserInfo } from "@/contracts/haveme/stories";

// interface UserChatProps {
//   name: string;
//   message: string;
//   profilePhoto: string;
// }

// interface UserId {
//   userId: string;
// }

// interface User {
//   userInfo: UserInfo;
// }
// interface InboxBodyProps {
//   loggedInUser?: string;
//   fullName?: string;
//   image?: string;
// }

// const userChats: UserChatProps[] = [
//   {
//     name: "Alice",
//     message: "Hi there!",
//     profilePhoto: "/assets/images/search/image1.svg",
//   },
//   {
//     name: "Bob",
//     message: "Hey, how's it going?",
//     profilePhoto: "/assets/images/search/image2.svg",
//   },
//   {
//     name: "Charlie",
//     message: "I'm doing well",
//     profilePhoto: "/assets/images/search/image3.svg",
//   },
//   {
//     name: "David",
//     message: "What's up?",
//     profilePhoto: "/assets/images/search/image4.svg",
//   },
//   {
//     name: "Eva",
//     message: "Not much, just chilling.",
//     profilePhoto: "/assets/images/search/image5.svg",
//   },
//   {
//     name: "Frank",
//     message: "Anyone up for a game tonight?",
//     profilePhoto: "/assets/images/search/image6.svg",
//   },
//   {
//     name: "Grace",
//     message: "Sure, count me in!",
//     profilePhoto: "/assets/images/search/image7.svg",
//   },
//   {
//     name: "Henry",
//     message: "I'm in too!",
//     profilePhoto: "/assets/images/search/image8.svg",
//   },
//   {
//     name: "Isabel",
//     message: "Sounds fun, I'll join as well.",
//     profilePhoto: "/assets/images/search/image9.svg",
//   },
//   {
//     name: "Jack",
//     message: "Great, let's meet at 8 PM.",
//     profilePhoto: "/assets/images/search/image10.svg",
//   },
// ];

// function InboxBody({ loggedInUser, fullName, image }: InboxBodyProps) {
//   const userData = useUserOnboardingContext();
//   const { userStoriesData } = useGetStoriesByUserNameQuery(
//     { userName: userData?.user?.userName, page: 1, perPage: 100 },
//     {
//       selectFromResult: ({ data }) => {
//         return {
//           userStoriesData: data?.data.map((story: Stories) => {
//             return {
//               type: story.media[0].mediaType,
//               url: `${process.env.NEXT_PUBLIC_API_SERVER}/${story.mediaFiles[0].path}`,
//               storyId: story._id,
//               isLiked: story.isLiked,
//             };
//           }),
//         };
//       },
//     }
//   );

//   const { otherStoriesData, isLoading } = useGetFollowingUsersStoryQuery(
//     { page: 1, perPage: 100 },
//     {
//       selectFromResult: ({ data, isLoading }) => {
//         return {
//           otherStoriesData: data?.data.map((user: User) => {
//             let allStories: {
//               type: string;
//               url: string;
//               storyId: string;
//               isLiked: boolean;
//             }[] = [];
//             user?.userInfo?.stories.map((story: Stories) => {
//               allStories.push({
//                 type: story.media[0].mediaType,
//                 url: `${process.env.NEXT_PUBLIC_API_SERVER}/${story.mediaFiles[0].path}`,
//                 storyId: story._id,
//                 isLiked: story.isLiked,
//               });
//             });
//             return {
//               key: user.userInfo._id,
//               content: allStories,
//               fullName: user.userInfo.fullName,
//               userName: user.userInfo.userName,
//               imagePath: user.userInfo.photo[0].path,
//             };
//           }),

//           isLoading: isLoading,
//         };
//       },
//     }
//   );

//   const totalUnreadCount = 2;
//   const { isMobile } = useClientHardwareInfo();
//   const [inputValue, setInputValue] = useState("");

//   const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
//     setInputValue(event.target.value);
//   };

//   const resetField = () => {
//     setInputValue("");
//   };

//   return (
//     <>
//       {/* <LoadingSpinner loading={isLoading}> */}
//       <div>
//         {isMobile ? (
//           <>
//             <div className="px-6 pt-4">
//               <div className="flex justify-between">
//                 <div></div>
//                 <h1>Inbox</h1>
//                 <Link href={"/chat-search"}>
//                   <Search className="stroke-foreground" />
//                 </Link>
//               </div>
//             </div>
//             <FeedFooter />
//           </>
//         ) : (
//           <div className="relative px-4 pt-6 mb-5 ">
//             <Input
//               type="text"
//               onChange={handleChange}
//               value={inputValue}
//               className="px-12 text-muted-foreground bg-muted border border-muted h-10 w-full rounded-3xl text-sm"
//               placeholder="Search Inbox"
//             />
//             <img
//               //assets/images/search/search-normal.svg
//               src="/assets/images/search/search-normal.svg"
//               alt="search"
//               className="absolute left-8 top-8 text-primary"
//             />

//             {inputValue && (
//               <X
//                 className="cancel-button absolute right-8 top-9 cursor-pointer"
//                 size={20}
//                 onClick={resetField}
//               />
//             )}
//           </div>
//         )}

//         <ScrollArea>
//           <div className="flex flex-row overflow-scroll lg:overflow-hidden h-[15vh] ">
//             <ContentUploadProvider>
//               <YourStories content={userStoriesData} />
//             </ContentUploadProvider>

//             <div className="flex flex-col justify-center align-middle w-fit min-w-24 p-2 cursor-pointer">
//               <LivePostPopup />
//             </div>

//             {!isLoading &&
//               otherStoriesData?.map((stories: any) => {
//                 return (
//                   <UserStories
//                     key={stories.key}
//                     id={stories.key}
//                     content={stories.content}
//                     fullName={stories.fullName}
//                     imagePath={stories.imagePath}
//                     userName={stories.userName}
//                   />
//                 );
//               })}
//           </div>
//           <ScrollBar orientation="horizontal" />
//         </ScrollArea>

//         <Separator />
//         <ScrollArea className="h-[75vh] p-2">
//           <h1 className="text-muted-foreground">
//             Unread messages ({totalUnreadCount})
//           </h1>
//           {
//              userChats.map((chat, index) => (
//               <Link key={index} href={`/chat/${chat.name}`}>
//                 <UserChat
//                   name={chat.name}
//                   message={chat.message}
//                   profilePhoto={chat.profilePhoto}
//                 />
//               </Link>
//           ))}
//           {/* {isLoading
//             ? Array.from({ length: 9 }).map((_, index) => (
//                 <SkeletonChat key={index} />
//               ))
//             : userChats.map((chat, index) => (
//                 <Link key={index} href={`/chat/${chat.name}`}>
//                   <UserChat
//                     name={chat.name}
//                     message={chat.message}
//                     profilePhoto={chat.profilePhoto}
//                   />
//                 </Link>
//               ))} */}

//         </ScrollArea>
//       </div>
//       {/* </LoadingSpinner> */}
//     </>
//   );
// }

// export default InboxBody;

"use client";
import UserChat from "@/components/chat/UserChat";
import UserStories from "@/components/stories/user-story";
import YourStories from "@/components/stories/your-story";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { X } from "lucide-react";
import React, { ChangeEvent, useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { useClientHardwareInfo } from "@/hooks/use-client-hardware-info";
import { LivePostPopup } from "../live-post-popup";
import Search from "@/assets/images/Sidebar/search.svg";
import FeedFooter from "../feed/feed-footer";
import Link from "next/link";
import ContentUploadProvider from "@/context/open-content-modal";
import {
  useGetFollowingUsersStoryQuery,
  useGetStoriesByUserNameQuery,
} from "@/redux/services/haveme/posts";
import { useUserOnboardingContext } from "@/context/UserOnboarding";
import { Stories, UserInfo } from "@/contracts/haveme/stories";

interface UserChatProps {
  name: string;
  message: string;
  profilePhoto: string;
}

interface UserId {
  userId: string;
}

interface User {
  userInfo: UserInfo;
}
interface InboxBodyProps {
  loggedInUser?: string;
  fullName?: string;
  image?: string;
}

const userChats: UserChatProps[] = [
  {
    name: "Alice",
    message: "Hi there!",
    profilePhoto: "/assets/images/search/image1.svg",
  },
];

function InboxBody({ loggedInUser, fullName, image }: InboxBodyProps) {
  const totalUnreadCount = 2;
  const { isMobile } = useClientHardwareInfo();
  const [inputValue, setInputValue] = useState("");

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    setInputValue(event.target.value);
  };

  const resetField = () => {
    setInputValue("");
  };

  return (
    <>
      {/* <LoadingSpinner loading={isLoading}> */}
      <div>
        {isMobile ? (
          <>
            <div className="px-6 pt-4">
              <div className="flex justify-between">
                <div></div>
                <h1>Inbox</h1>
                <Link href={"/chat-search"}>
                  <Search className="stroke-foreground" />
                </Link>
              </div>
            </div>
            <FeedFooter />
          </>
        ) : (
          <div className="relative px-4 pt-6 mb-5 ">
            <Input
              type="text"
              onChange={handleChange}
              value={inputValue}
              className="px-12 text-muted-foreground bg-muted border border-muted h-10 w-full rounded-3xl text-sm"
              placeholder="Search Inbox"
            />
            <img
              //assets/images/search/search-normal.svg
              src="/assets/images/search/search-normal.svg"
              alt="search"
              className="absolute left-8 top-8 text-primary"
            />

            {inputValue && (
              <X
                className="cancel-button absolute right-8 top-9 cursor-pointer"
                size={20}
                onClick={resetField}
              />
            )}
          </div>
        )}
        <Separator />
        <ScrollArea className="h-[75vh] p-2">
          <h1 className="text-muted-foreground">
            Unread messages ({totalUnreadCount})
          </h1>
          {userChats.map((chat, index) => (
            <Link key={index} href={`/room/${chat.name}`}>
              <UserChat
                name={chat.name}
                message={chat.message}
                profilePhoto={chat.profilePhoto}
              />
            </Link>
          ))}
        </ScrollArea>
      </div>
      {/* </LoadingSpinner> */}
    </>
  );
}

export default InboxBody;
