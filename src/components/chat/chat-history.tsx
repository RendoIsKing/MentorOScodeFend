// "use client";
// import React, { useState } from "react";
// import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
// import { ChevronLeft, X } from "lucide-react";
// import {
//   AlertDialog,
//   AlertDialogCancel,
//   AlertDialogContent,
//   AlertDialogHeader,
//   AlertDialogTitle,
//   AlertDialogTrigger,
// } from "@/components/ui/alert-dialog";
// import { Button } from "@/components/ui/button";
// import CreatorChatHistory from "@/components/chat/creator-chat";
// import AvatarChatHistory from "@/components/chat/avatar-chat";
// import ChatFooter from "@/components/chat/chat-footer";
// import { useClientHardwareInfo } from "@/hooks/use-client-hardware-info";

// import AlertPopup from "@/components/shared/popup";
// import { Label } from "@/components/ui/label";
// import { Input } from "@/components/ui/input";
// import { RadioButtonGroup } from "@/components/postInteraction";
// import AvatarWithDescription from "@/components/shared/avatar-with-description";
// import InboxReport from "@/components/inbox-report";
// import { Separator } from "@/components/ui/separator";
// import { usePathname, useRouter } from "next/navigation";
// import Image from "next/image";
// import { ABeeZee } from "next/font/google";
// import ContentUploadProvider from "@/context/open-content-modal";
// import { useForm } from "react-hook-form";
// import { zodResolver } from "@hookform/resolvers/zod";
// import { tipAmountSchema } from "@/schemas/tipAmount";
// import { z } from "zod";
// import {
//   Form,
//   FormControl,
//   FormField,
//   FormItem,
//   FormLabel,
//   FormMessage,
// } from "@/components/ui/form";

// // TODO: Make this font definition dynamic
// const fontItalic = ABeeZee({
//   subsets: ["latin"],
//   weight: ["400"],
//   style: "italic",
// });

// const ChatHistory: React.FC = () => {
//   const pathName = usePathname();
//   const usernameFromPath = pathName.split("/")[pathName.split("/").length - 1];
//   const router = useRouter();
//   const { isMobile } = useClientHardwareInfo();
//   const [activeTab, setActiveTab] = useState("creator");
//   const [open, setOpen] = useState(false);

//   const handleTabChange = (value: string) => {
//     setActiveTab(value);
//   };

//   const form = useForm<z.infer<typeof tipAmountSchema>>({
//     resolver: zodResolver(tipAmountSchema),
//     defaultValues: {
//       amount: 1,
//       message: "",
//     },
//   });

//   const onSubmit = async (data: z.infer<typeof tipAmountSchema>) => {
//     setOpen(false);
//   };

//   return (
//     <div className="flex flex-col h-screen relative">
//       <div>
//         <div className="relative bg-gray-900/30 flex flex-col justify-end overflow-hidden pt-24 mx-auto  top-0 right-0 left-0 h-[20vh] lg:h-[10vh]">
//           {isMobile && (
//             <div className="">
//               <img
//                 src="https://images.pexels.com/photos/1261728/pexels-photo-1261728.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1"
//                 alt="University of Southern California"
//                 className="absolute inset-0 h-full w-full object-cover"
//               />
//               <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/40">
//                 <div
//                   onClick={() => {
//                     router.back();
//                   }}
//                   className="absolute left-3 top-2 lg:hidden"
//                 >
//                   <ChevronLeft className="font-bold w-8 h-8" />
//                 </div>
//               </div>
//             </div>
//           )}

//           <div className="flex items-center px-4 py-2 z-10  justify-between">
//             <div className="flex items-center gap-x-8 ">
//               <div className="flex align-middle mb-2">
//                 <div onClick={() => router.push("/view-other-profile")}>
//                   <Image
//                     className={
//                       activeTab === "creator"
//                         ? `rounded-full cursor-pointer`
//                         : `rounded-full ring ring-white ring-offset-0 cursor-pointer`
//                     }
//                     alt="profile picture"
//                     src={
//                       activeTab === "creator"
//                         ? `/assets/images/Home/small-profile-img.svg`
//                         : "/assets/images/my-Profile/avtar-dummy.svg"
//                     }
//                     height={56}
//                     width={56}
//                   />
//                 </div>

//                 <div className="ml-4 text-white h-full mt-2">
//                   <h2 className="z-10 gap-y-1 overflow-hidden leading-6 ">
//                     {usernameFromPath}
//                   </h2>
//                   <h2 className="text-lg font-semibold"></h2>
//                   <p className="text-sm ">@{usernameFromPath}usertag</p>
//                 </div>
//               </div>
//               {!isMobile && (
//                 <div className="flex gap-6 justify-center items-center align-middle ">
//                   <div>
//                     <Button size={"icon"} variant="outline">
//                       <AlertPopup
//                         headerText="Subscribe to Jaylon Stanton"
//                         bodyText="Full access to this user's content, Direct message with this user. You can cancel your subscription at any time"
//                         footerText="$20 Monthly"
//                         color={true}
//                       />
//                     </Button>
//                   </div>
//                   <div>
//                     <Button className="bg-primary rounded-full h-8 w-16">
//                       Follow
//                     </Button>
//                   </div>

//                   <AlertDialog open={open} onOpenChange={setOpen}>
//                     <AlertDialogTrigger asChild>
//                       <img
//                         src="/assets/images/Home/give-tip.svg"
//                         alt="give tip"
//                         className="cursor-pointer"
//                       />
//                     </AlertDialogTrigger>
//                     <AlertDialogContent className="sm:w-11/12 w-4/5 rounded-md p-0 border-0">
//                       <AlertDialogHeader className="">
//                         <div className="flex justify-between border-b border-secondary align-middle text-start px-3 py-2">
//                           <AlertDialogTitle
//                             className={`w-full text-base pb-2 ${fontItalic.className}`}
//                           >
//                             <AvatarWithDescription
//                               imageUrl="/assets/images/Home/small-profile-img.svg"
//                               userName="Christina Jack"
//                               ImageFallBackText="cj"
//                               userNameTag="@username"
//                             />
//                           </AlertDialogTitle>
//                           <AlertDialogCancel>
//                             <X className="mb-1 cursor-pointer text-secondary-foreground/20" />
//                           </AlertDialogCancel>
//                         </div>
//                       </AlertDialogHeader>

//                       <Form {...form}>
//                         <form
//                           onSubmit={form.handleSubmit(onSubmit)}
//                           className="flex flex-col px-4 gap-4"
//                         >
//                           <RadioButtonGroup />

//                           <FormField
//                             control={form.control}
//                             name="message"
//                             render={({ field }) => (
//                               <FormItem>
//                                 <FormLabel>Message</FormLabel>
//                                 <FormControl>
//                                   <Input
//                                     className="text-left mt-2"
//                                     placeholder="Write comment..."
//                                     {...field}
//                                   />
//                                 </FormControl>
//                                 <FormMessage />
//                               </FormItem>
//                             )}
//                           />
//                           <Button className="mb-8" type="submit">
//                             Tip
//                           </Button>
//                         </form>
//                       </Form>
//                     </AlertDialogContent>
//                   </AlertDialog>
//                 </div>
//               )}
//             </div>
//             <div className="flex gap-3">
//               {!isMobile && <InboxReport />}
//               {isMobile && (
//                 <>
//                   <Button
//                     variant={"link"}
//                     size={"icon"}
//                     className="opacity-90 size-8 bg-muted-foreground/40"
//                   >
//                     <InboxReport />
//                   </Button>

//                   <AlertDialog open={open} onOpenChange={setOpen}>
//                     <AlertDialogTrigger asChild>
//                       <Button
//                         variant={"link"}
//                         size={"icon"}
//                         className="opacity-90 size-8 bg-muted-foreground/40"
//                       >
//                         <img
//                           src="/assets/images/Home/give-tip.svg"
//                           alt="give tip"
//                           className="cursor-pointer"
//                           width={20}
//                         />
//                       </Button>
//                     </AlertDialogTrigger>
//                     <AlertDialogContent className="sm:w-11/12 w-4/5 rounded-md p-0 border-0">
//                       <AlertDialogHeader className="">
//                         <div className="flex justify-between border-b border-secondary align-middle text-start px-3 py-2">
//                           <AlertDialogTitle
//                             className={`w-full text-base pb-2 ${fontItalic.className}`}
//                           >
//                             <AvatarWithDescription
//                               imageUrl="/assets/images/Home/small-profile-img.svg"
//                               userName="Christina Jack"
//                               ImageFallBackText="cj"
//                               userNameTag="@username"
//                             />
//                           </AlertDialogTitle>
//                           <AlertDialogCancel>
//                             <X className="mb-1 cursor-pointer text-secondary-foreground/20" />
//                           </AlertDialogCancel>
//                         </div>
//                       </AlertDialogHeader>

//                       <Form {...form}>
//                         <form
//                           onSubmit={form.handleSubmit(onSubmit)}
//                           className="flex flex-col px-4 gap-4"
//                         >
//                           <RadioButtonGroup />

//                           <FormField
//                             control={form.control}
//                             name="message"
//                             render={({ field }) => (
//                               <FormItem>
//                                 <FormLabel>Message</FormLabel>
//                                 <FormControl>
//                                   <Input
//                                     className="text-left mt-2"
//                                     placeholder="Write comment..."
//                                     {...field}
//                                   />
//                                 </FormControl>
//                                 <FormMessage />
//                               </FormItem>
//                             )}
//                           />
//                           <Button className="mb-8" type="submit">
//                             Tip
//                           </Button>
//                         </form>
//                       </Form>
//                     </AlertDialogContent>
//                   </AlertDialog>
//                 </>
//               )}
//             </div>
//           </div>
//           <Separator />
//         </div>
//       </div>

//       <Tabs
//         defaultValue="creator"
//         className="p-0 m-0 w-full flex-grow mb-16 overflow-y-auto scrollbar"
//       >
//         <div className="w-full flex align-middle justify-center items-center sticky top-0  bg-white dark:bg-background">
//           <TabsList className="h-12 lg:w-11/12 lg:border-t-0 grid rounded-none w-full bg-white dark:bg-background grid-cols-2 border-b border-secondary">
//             <TabsTrigger
//               onClick={() => handleTabChange("creator")}
//               value="creator"
//               className="h-12 text-muted-foreground data-[state=active]:bg-white dark:data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:border-b border-primary italic"
//             >
//               Creator
//             </TabsTrigger>
//             <TabsTrigger
//               onClick={() => handleTabChange("avatar")}
//               value="avatar"
//               className="h-12 text-muted-foreground data-[state=active]:bg-white dark:data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:border-b border-primary italic"
//             >
//               Avatar
//             </TabsTrigger>
//           </TabsList>
//         </div>
//         <TabsContent value="creator" className="p-2">
//           <CreatorChatHistory />
//         </TabsContent>
//         <TabsContent value="avatar" className="p-2">
//           <AvatarChatHistory />
//         </TabsContent>
//       </Tabs>
//       <div className="bg-background/90 absolute bottom-0 w-full">
//         <ContentUploadProvider>
//           <ChatFooter />
//         </ContentUploadProvider>
//       </div>
//     </div>
//   );
// };

// export default ChatHistory;

"use client";
import React, { useEffect, useState } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { ChevronLeft, X } from "lucide-react";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import CreatorChatHistory from "@/components/chat/creator-chat";
import AvatarChatHistory from "@/components/chat/avatar-chat";
import ChatFooter from "@/components/chat/chat-footer";
import { useClientHardwareInfo } from "@/hooks/use-client-hardware-info";

import AlertPopup from "@/components/shared/popup";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { RadioButtonGroup } from "@/components/postInteraction";
import AvatarWithDescription from "@/components/shared/avatar-with-description";
import InboxReport from "@/components/inbox-report";
import { Separator } from "@/components/ui/separator";
import { usePathname, useRouter } from "next/navigation";
import Image from "next/image";
import { ABeeZee } from "next/font/google";
import ContentUploadProvider from "@/context/open-content-modal";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { tipAmountSchema } from "@/schemas/tipAmount";
import { useCreateItemMutation } from "@/redux/slices/chat&avatar/index";
import { useGetChatQuery } from "@/redux/slices/userChats/index";
import { z } from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

// TODO: Make this font definition dynamic
const fontItalic = ABeeZee({
  subsets: ["latin"],
  weight: ["400"],
  style: "italic",
});

export interface Message {
  sender?: "user" | "other";
  text?: string;
  name?: string;
  time?: string;
  date?: string;
  image?: string;
}

interface ApiResponse {
  chat?: {
    createdAt: string;
    sender: string;
    chatMessage: string;
    userId: string;
  }[];
  // other properties of ApiResponse if there are any
}

const ChatHistory: React.FC = () => {
  const pathName = usePathname();
  const usernameFromPath = pathName.split("/")[pathName.split("/").length - 1];
  const router = useRouter();
  const { isMobile } = useClientHardwareInfo();
  const [activeTab, setActiveTab] = useState("creator");
  const [createItem, { isLoading }] = useCreateItemMutation();
  const [userId, setUserID] = useState<any>("1234556789");

  const {
    data: chatData,
    isLoading: chatLoading,
    error: chatError,
  } = useGetChatQuery(userId);
  const [messages, setMessages] = useState<any>([]);

  const [open, setOpen] = useState(false);
  const [inputMessage, setInputMessage] = useState("");

  const handleTabChange = (value: string) => {
    setActiveTab(value);
  };

  const handleInputChange = (e: any) => {
    setInputMessage(e.target.value);
  };

  const form = useForm<z.infer<typeof tipAmountSchema>>({
    resolver: zodResolver(tipAmountSchema),
    defaultValues: {
      amount: 1,
      message: "",
    },
  });

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return; // Avoid sending empty messages

    const newMessage = {
      sender: "user",
      text: inputMessage,
      time: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
      date: new Date().toLocaleDateString(),
    };

    // Add the user's message to the chat immediately
    setMessages((prevMessages) => [...prevMessages, newMessage]);

    setInputMessage("");
    try {
      // Call the API and get the response
      const apiResponse: any = await createItem({
        query: inputMessage,
      }).unwrap();
      if (apiResponse) {
        const apiResponseMessage = {
          sender: "other",
          text: apiResponse.Details,
          time: new Date().toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
          date: new Date().toLocaleDateString(),
        };

        if (apiResponse.Details.startsWith("Outputs/")) {
          const imageUrl = `https://apistaging.haveme.net/chat${apiResponse.Details}`;
          setMessages((prevMessages) => [
            ...prevMessages,
            { ...apiResponseMessage, image: imageUrl },
          ]);
        } else {
          setMessages((prevMessages) => [...prevMessages, apiResponseMessage]);
        }
      }
    } catch (err) {
      console.error("Error sending message:", err);
    }

    // Clear the input after the API response is processed
    setInputMessage("");
  };

  useEffect(() => {
    // console.log("input messaage...", inputMessage);
  }, [inputMessage]);
  const onSubmit = async (data: z.infer<typeof tipAmountSchema>) => {
    setOpen(false);
  };

  useEffect(() => {
    if (chatData) {
      // console.log("chatData", chatData);
      const initialMessages = chatData?.chat?.map((message: any) => {
        const messageDate = new Date(message.createdAt);
        const date = messageDate.toISOString().split("T")[0]; // Get 'YYYY-MM-DD'
        const time = messageDate.toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        });

        return {
          sender: message.sender,
          text: message.chatMessage,
          name: message.userId,
          time: time,
          date: date,
        };
      });

      setMessages(initialMessages); // Update the messages state
    }
  }, [chatData]);

  // console.log("messages", messages);

  return (
    <div className="flex flex-col h-screen relative">
      <div>
        <div className="relative bg-gray-900/30 flex flex-col justify-end overflow-hidden pt-24 mx-auto  top-0 right-0 left-0 h-[20vh] lg:h-[10vh]">
          {isMobile && (
            <div className="">
              <img
                src="https://images.pexels.com/photos/1261728/pexels-photo-1261728.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1"
                alt="University of Southern California"
                className="absolute inset-0 h-full w-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/40">
                <div
                  onClick={() => {
                    router.back();
                  }}
                  className="absolute left-3 top-2 lg:hidden"
                >
                  <ChevronLeft className="font-bold w-8 h-8" />
                </div>
              </div>
            </div>
          )}

          <div className="flex items-center px-4 py-2 z-10  justify-between">
            <div className="flex items-center gap-x-8 ">
              <div className="flex align-middle mb-2">
                <div onClick={() => router.push("/view-other-profile")}>
                  <Image
                    className={
                      activeTab === "creator"
                        ? `rounded-full cursor-pointer`
                        : `rounded-full ring ring-white ring-offset-0 cursor-pointer`
                    }
                    alt="profile picture"
                    src={
                      activeTab === "creator"
                        ? `/assets/images/Home/small-profile-img.svg`
                        : "/assets/images/my-Profile/avtar-dummy.svg"
                    }
                    height={56}
                    width={56}
                  />
                </div>

                <div className="ml-4 text-white h-full mt-2">
                  <h2 className="z-10 gap-y-1 overflow-hidden leading-6 ">
                    {usernameFromPath}
                  </h2>
                  <h2 className="text-lg font-semibold"></h2>
                  <p className="text-sm ">@{usernameFromPath}usertag</p>
                </div>
              </div>
              {!isMobile && (
                <div className="flex gap-6 justify-center items-center align-middle ">
                  <div>
                    <Button size={"icon"} variant="outline">
                      <AlertPopup
                        headerText="Subscribe to Jaylon Stanton"
                        bodyText="Full access to this user's content, Direct message with this user. You can cancel your subscription at any time"
                        footerText="$20 Monthly"
                        color={true}
                      />
                    </Button>
                  </div>
                  <div>
                    <Button className="bg-primary rounded-full h-8 w-16">
                      Follow
                    </Button>
                  </div>

                  <AlertDialog open={open} onOpenChange={setOpen}>
                    <AlertDialogTrigger asChild>
                      <img
                        src="/assets/images/Home/give-tip.svg"
                        alt="give tip"
                        className="cursor-pointer"
                      />
                    </AlertDialogTrigger>
                    <AlertDialogContent className="sm:w-11/12 w-4/5 rounded-md p-0 border-0">
                      <AlertDialogHeader className="">
                        <div className="flex justify-between border-b border-secondary align-middle text-start px-3 py-2">
                          <AlertDialogTitle
                            className={`w-full text-base pb-2 ${fontItalic.className}`}
                          >
                            <AvatarWithDescription
                              imageUrl="/assets/images/Home/small-profile-img.svg"
                              userName="Christina Jack"
                              ImageFallBackText="cj"
                              userNameTag="@username"
                            />
                          </AlertDialogTitle>
                          <AlertDialogCancel>
                            <X className="mb-1 cursor-pointer text-secondary-foreground/20" />
                          </AlertDialogCancel>
                        </div>
                      </AlertDialogHeader>

                      <Form {...form}>
                        <form
                          onSubmit={form.handleSubmit(onSubmit)}
                          className="flex flex-col px-4 gap-4"
                        >
                          <RadioButtonGroup />

                          <FormField
                            control={form.control}
                            name="message"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Message</FormLabel>
                                <FormControl>
                                  <Input
                                    className="text-left mt-2"
                                    placeholder="Write comment..."
                                    {...field}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <Button className="mb-8" type="submit">
                            Tip
                          </Button>
                        </form>
                      </Form>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              )}
            </div>
            <div className="flex gap-3">
              {!isMobile && <InboxReport />}
              {isMobile && (
                <>
                  <Button
                    variant={"link"}
                    size={"icon"}
                    className="opacity-90 size-8 bg-muted-foreground/40"
                  >
                    <InboxReport />
                  </Button>

                  <AlertDialog open={open} onOpenChange={setOpen}>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant={"link"}
                        size={"icon"}
                        className="opacity-90 size-8 bg-muted-foreground/40"
                      >
                        <img
                          src="/assets/images/Home/give-tip.svg"
                          alt="give tip"
                          className="cursor-pointer"
                          width={20}
                        />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent className="sm:w-11/12 w-4/5 rounded-md p-0 border-0">
                      <AlertDialogHeader className="">
                        <div className="flex justify-between border-b border-secondary align-middle text-start px-3 py-2">
                          <AlertDialogTitle
                            className={`w-full text-base pb-2 ${fontItalic.className}`}
                          >
                            <AvatarWithDescription
                              imageUrl="/assets/images/Home/small-profile-img.svg"
                              userName="Christina Jack"
                              ImageFallBackText="cj"
                              userNameTag="@username"
                            />
                          </AlertDialogTitle>
                          <AlertDialogCancel>
                            <X className="mb-1 cursor-pointer text-secondary-foreground/20" />
                          </AlertDialogCancel>
                        </div>
                      </AlertDialogHeader>

                      <Form {...form}>
                        <form
                          onSubmit={form.handleSubmit(onSubmit)}
                          className="flex flex-col px-4 gap-4"
                        >
                          <RadioButtonGroup />

                          <FormField
                            control={form.control}
                            name="message"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Message</FormLabel>
                                <FormControl>
                                  <Input
                                    className="text-left mt-2"
                                    placeholder="Write comment..."
                                    {...field}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <Button className="mb-8" type="submit">
                            Tip
                          </Button>
                        </form>
                      </Form>
                    </AlertDialogContent>
                  </AlertDialog>
                </>
              )}
            </div>
          </div>
          <Separator />
        </div>
      </div>

      <Tabs
        defaultValue="creator"
        className="p-0 m-0 w-full flex-grow mb-16 overflow-y-auto scrollbar"
      >
        <div className="w-full flex align-middle justify-center items-center sticky top-0  bg-white dark:bg-background">
          <TabsList className="h-12 lg:w-11/12 lg:border-t-0 grid rounded-none w-full bg-white dark:bg-background grid-cols-2 border-b border-secondary">
            <TabsTrigger
              onClick={() => handleTabChange("creator")}
              value="creator"
              className="h-12 text-muted-foreground data-[state=active]:bg-white dark:data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:border-b border-primary italic"
            >
              Creator
            </TabsTrigger>
            <TabsTrigger
              onClick={() => handleTabChange("avatar")}
              value="avatar"
              className="h-12 text-muted-foreground data-[state=active]:bg-white dark:data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:border-b border-primary italic"
            >
              Avatar
            </TabsTrigger>
          </TabsList>
        </div>
        <TabsContent value="creator" className="p-2">
          <CreatorChatHistory />
        </TabsContent>
        <TabsContent value="avatar" className="p-2">
          <AvatarChatHistory messages={messages} isLoading={isLoading} />
        </TabsContent>
      </Tabs>
      <div className="bg-background/90 absolute bottom-0 w-full">
        <ContentUploadProvider>
          <ChatFooter
            inputMessage={inputMessage}
            handleSendMessage={handleSendMessage}
            handleInputChange={handleInputChange}
          />
        </ContentUploadProvider>
      </div>
    </div>
  );
};

export default ChatHistory;
