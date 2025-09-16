"use client";
import React, { useEffect, useState } from "react";
import { Textarea } from "../ui/textarea";
import { ChevronRight } from "lucide-react";
import { Separator } from "../ui/separator";
import { Button } from "../ui/button";

import Tag from "@/assets/images/popup/tag-user.svg";
import Music from "@/assets/images/popup/music.svg";
import Eye from "@/assets/images/popup/eye.svg";
import EyePerView from "@/assets/images/popup/eye-per-view.svg";
import Sub from "@/assets/images/search-user-profile/subscribed.svg";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTrigger,
} from "../ui/dialog";
import { Input } from "../ui/input";
import { ABeeZee } from "next/font/google";
import { IPostContentObject } from "@/contracts/responses/IPostContentResponse";
import { baseServerUrl, cn } from "@/lib/utils";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { MediaPostFormSchema } from "@/schemas/mediaPostSchema";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "../ui/form";
import {
  useGetPostByIdQuery,
  useUpdatePostMutation,
} from "@/redux/services/haveme/posts";
import { useClientHardwareInfo } from "@/hooks/use-client-hardware-info";
import { useGetUsersQuery } from "@/redux/services/haveme/search";
import { useUserTagsContext } from "@/context/UserTags";
import { useTheme } from "next-themes";
import { TagMultiSelect } from "../ui/multi-select";
import { useTypedSelector } from "@/redux/store";
import { selectFilteredUsersFromTags } from "@/redux/slices/adapters";

// TODO: Make this font definition dynamic
const fontItalic = ABeeZee({
  subsets: ["latin"],
  weight: ["400"],
  style: "italic",
});

interface IEditPostModalProps {
  postDetails?: IPostContentObject;
  close?: () => void;
}

const EditPostModal: React.FC<IEditPostModalProps> = ({
  postDetails,
  close,
}) => {
  const { resolvedTheme } = useTheme();
  const [isOpenMenu, setIsOpenMenu] = useState(false);
  const [isTagPeople, setIsTagPeople] = useState(false);

  const [menuItem, setMenuItem] = useState("");

  const fileType = postDetails?.media[0]?.mediaType;
  const mediaPath = `${baseServerUrl}/${postDetails?.mediaFiles[0]?.path}`;

  const searchedTagsData = useTypedSelector(selectFilteredUsersFromTags);

  const [query, setQuery] = useState({
    searchTerm: "a",
    page: 1,
    perPage: 10,
  });

  const [updatePostTrigger] = useUpdatePostMutation();
  const { data: userDetails, isLoading } = useGetUsersQuery(query);
  const { state, dispatch } = useUserTagsContext();
  const { userTag, taggedUsers } = state;

  const { isMobile } = useClientHardwareInfo();

  const mediaPostForm = useForm<z.infer<typeof MediaPostFormSchema>>({
    resolver: zodResolver(MediaPostFormSchema),
    defaultValues: {
      description: postDetails?.content || "",
      viewOptions: postDetails?.privacy || "public",
      uploadString: "post",
    },
  });

  const toggleDiv = () => {
    setIsOpenMenu(!isOpenMenu);
  };

  function onSubmit(data: z.infer<typeof MediaPostFormSchema>) {
    updatePost(data);
  }

  const updatePost = async (data) => {
    let postInfoObject = {
      id: postDetails?._id,
      content: data.description,
      privacy: data.viewOptions,
      media: [{ mediaId: postDetails?.media[0]?.mediaId, mediaType: fileType }],
      status: "published",
      tags: [],
      ...(data.viewOptions === "pay-per-view" && { price: data.price * 100 }),
      type: data?.uploadString,
      userTags: taggedUsers ?? [],
    };
    await updatePostTrigger(postInfoObject)
      .unwrap()
      .then((res) => {
        return close && close();
      })
      .catch((err) => console.log(err));
  };

  const renderClick = (data) => {
    mediaPostForm.setValue("viewOptions", data);
    if (data !== "pay-per-view") {
      mediaPostForm.setValue("price", undefined);
    }
    setMenuItem(data);
    setIsOpenMenu(false);
  };

  const findCoordinates = (e) => {
    var rect = e.target.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const xPercent = (x / rect.width) * 100;
    const yPercent = (y / rect.height) * 100;
    dispatch({
      type: "SET_USER_TAG",
      payload: {
        ...userTag,
        location: {
          x: xPercent,
          y: yPercent,
        },
      },
    });
    setIsTagPeople(true);
  };

  const renderTagPeople = () => {
    setIsTagPeople(!isTagPeople);
  };

  useEffect(() => {
    const initialTaggedUsers = postDetails?.userTags ?? [];
    dispatch({
      type: "SET_BULK_TAGGED_USERS",
      payload: initialTaggedUsers,
    });
  }, [dispatch, postDetails?.userTags]);

  return (
    <div>
      <Dialog
        onOpenChange={(isOpen) => {
          try {
            if (typeof document !== "undefined") {
              document.body.classList.toggle("editing-post", Boolean(isOpen));
            }
          } catch {}
        }}
      >
        <DialogTrigger asChild>
          <Button
            variant={"link"}
            className={cn("text-foreground self-center ")}
          >
            Edit
          </Button>
        </DialogTrigger>
        <DialogContent
          onCloseAutoFocus={() => {
            dispatch({ type: "RESET_TAGGED_USERS" });
          }}
          className="py-10 p-0 bg-[#171a1f] w-full max-w-[58rem] border-none bg-background max-h-screen items-center overflow-y-auto pb-tabbar"
        >
          <DialogHeader>
            <div className="flex justify-between items-center px-4 pt-2 w-full">
              <p className={`text-lg ${fontItalic.className}`}>Edit</p>
            </div>
          </DialogHeader>
          <Form {...mediaPostForm}>
            <form onSubmit={mediaPostForm.handleSubmit(onSubmit)} className="min-h-screen overflow-y-auto pb-tabbar">
              <div className="flex-col lg:flex lg:flex-row pb-tabbar">
                <div className="lg:w-1/2">
                  <div className="w-full max-h-[32rem]">
                    {fileType === "image" ? (
                      <div
                        className="relative"
                        onClick={(e) => findCoordinates(e)}
                      >
                        <img
                          src={mediaPath}
                          className={cn(
                            "w-full object-contain",
                            isMobile && postDetails?.type === "post"
                              ? "h-[20rem]"
                              : isMobile
                              ? "h-[20rem]"
                              : "h-[32rem]"
                          )}
                        />
                        {userTag?.location.y && userTag?.location.x && (
                          <p
                            style={{
                              position: "absolute",
                              top: `${userTag.location.y}%`,
                              left: `${userTag.location.x}%`,
                              backgroundColor: "black",
                            }}
                          >
                            Tag
                          </p>
                        )}

                        {taggedUsers?.map((userInfo, index) => {
                          return (
                            <p
                              key={index}
                              style={{
                                position: "absolute",
                                top: `${userInfo.location.y}%`,
                                left: `${userInfo.location.x}%`,
                                backgroundColor:
                                  resolvedTheme === "dark" ? "black" : "white",
                              }}
                            >
                              {userInfo.userName}
                            </p>
                          );
                        })}
                      </div>
                    ) : (
                      <video
                        src={mediaPath}
                        controls
                        controlsList="nodownload"
                        className={cn(
                          "max-w-lg h-[37.8rem]  w-[inherit]",
                          isMobile ? "max-h-[20rem]" : "max-h-[32rem]"
                        )}
                        id="video-preview"
                      />
                    )}
                  </div>
                </div>
                <div className="flex flex-col w-full lg:w-1/2">
                  <FormField
                    control={mediaPostForm.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <div>
                            <Textarea
                              className=" pl-7 pt-7 text-base h-[226px] resize-none rounded-md border-none"
                              placeholder="Write post description...."
                              {...field}
                            />
                            <FormMessage />
                          </div>
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  <div className="flex items-center">
                    <div className="min-h-3/4 p-4 w-full">
                      <div className="flex flex-col  mx-auto w-full mt-8">
                        <div className="flex justify-between items-center">
                          {isTagPeople ? (
                            <div className="flex flex-col w-[600px]">
                              {fileType === "image" && (
                                <span>
                                  Tap the image for tag people or direct search.
                                </span>
                              )}
                              <TagMultiSelect
                                options={searchedTagsData}
                                setQuery={setQuery}
                              />
                            </div>
                          ) : (
                            <>
                              <div
                                className="flex gap-2 items-center"
                                onClick={() => renderTagPeople()}
                              >
                                <Tag className="fill-foreground" />
                                <Button
                                  variant={"link"}
                                  className="text-foreground"
                                  type="button"
                                >
                                  Tag People
                                </Button>
                              </div>
                              <ChevronRight />
                            </>
                          )}
                        </div>
                        <Separator />
                        <div className="flex justify-between items-center">
                          <div className="flex gap-2 items-center">
                            <Music className="fill-foreground" />
                            <Button
                              variant={"link"}
                              className="text-foreground"
                            >
                              Add Music
                            </Button>
                          </div>
                          <ChevronRight />
                        </div>
                        <Separator />

                        <div
                          className="flex justify-between items-center"
                          onClick={() => toggleDiv()}
                        >
                          <div className="flex gap-2 items-center">
                            {menuItem === "Pay-per-view" ? (
                              <EyePerView className="fill-foreground" />
                            ) : menuItem === "Subscriber" ? (
                              <Sub className="fill-foreground ml-[-3px]" />
                            ) : (
                              <Eye className="fill-foreground" />
                            )}

                            <Button
                              variant={"link"}
                              className="text-foreground"
                              type="button"
                            >
                              {menuItem ? menuItem : "Public"}
                            </Button>
                          </div>
                          <ChevronRight />
                        </div>
                        {isOpenMenu && (
                          <div className="w-[26.5rem] h-auto border-[#0B0F14] bg-secondary dark:bg-[#0B0F14] rounded-lg p-4 absolute top-[240px]">
                            <div className="flex items-center">
                              <Eye className="fill-foreground" />
                              <Button
                                variant={"link"}
                                className="text-foreground"
                                onClick={() => {
                                  renderClick("public");
                                }}
                              >
                                Public
                              </Button>
                            </div>
                            <div className="flex items-center">
                              <Sub className="fill-foreground ml-[-3px]" />
                              <Button
                                variant={"link"}
                                className="text-foreground"
                                onClick={() => {
                                  renderClick("subscriber");
                                }}
                                type="button"
                              >
                                Subscriber
                              </Button>
                            </div>
                            <div className="flex items-center">
                              <EyePerView className="fill-foreground" />
                              <Button
                                variant={"link"}
                                onClick={() => {
                                  renderClick("pay-per-view");
                                }}
                                className="text-foreground"
                                type="button"
                              >
                                Pay-per-view
                              </Button>
                            </div>
                          </div>
                        )}
                        {menuItem === "pay-per-view" && (
                          <div>
                            <FormField
                              control={mediaPostForm.control}
                              name="price"
                              render={({ field }) => (
                                <FormItem>
                                  <FormControl>
                                    <div>
                                      <Input
                                        placeholder="Enter video view price"
                                        className="mb-3"
                                        {...field}
                                      />
                                      <FormMessage />
                                    </div>
                                  </FormControl>
                                </FormItem>
                              )}
                            />
                            <Separator />
                          </div>
                        )}
                        <Separator />
                      </div>
                    </div>
                  </div>
                  <div className="p-4">
                    <Button className="w-full" type="submit">
                      {" "}
                      Post
                    </Button>
                  </div>
                </div>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default EditPostModal;
