"use client";
import { useEffect, useState } from "react";
import { Button } from "../ui/button";
import { ChevronRight, X } from "lucide-react";
import { Separator } from "../ui/separator";
import { Textarea } from "../ui/textarea";
import { Input } from "../ui/input";

import Tag from "@/assets/images/popup/tag-user.svg";
import Music from "@/assets/images/popup/music.svg";
import Eye from "@/assets/images/popup/eye.svg";
import EyePerView from "@/assets/images/popup/eye-per-view.svg";
import Sub from "@/assets/images/search-user-profile/subscribed.svg";
import BackArrow from "@/assets/images/Signup/back.svg";
import Video from "../video-tag";
import { ABeeZee } from "next/font/google";
import { useCreatePostMutation } from "@/redux/services/haveme/posts";
import { useUploadFileMutation } from "@/redux/services/haveme";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { MediaPostFormSchema } from "@/schemas/mediaPostSchema";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../ui/form";
import { toast } from "../ui/use-toast";
import { cn } from "@/lib/utils";
import { useClientHardwareInfo } from "@/hooks/use-client-hardware-info";
import { useTheme } from "next-themes";
import { TagMultiSelect } from "../ui/multi-select";
import { useTypedSelector } from "@/redux/store";
import { selectFilteredUsersFromTags } from "@/redux/slices/adapters";
import { useUserTagsContext } from "@/context/UserTags";
import { useGetUsersQuery } from "@/redux/services/haveme/search";

const fontItalic = ABeeZee({
  subsets: ["latin"],
  weight: ["400"],
  style: "italic",
});

interface SharedPopupsProps {
  uploadString: string;
  selectedFile: File | null;
  setIsContentUploadOpen?: (value: boolean) => void;
  onFileUpload?: (value: boolean) => void;
  setFile?: React.Dispatch<React.SetStateAction<File | null>>;
  orientation?: string;
}

const PublishModalDropBox = ({
  uploadString,
  selectedFile,
  setIsContentUploadOpen,
  onFileUpload,
  setFile,
  orientation,
}: SharedPopupsProps) => {
  const [menuItem, setMenuItem] = useState("");
  const [isOpenMenu, setIsOpenMenu] = useState(false);
  const [isTagPeople, setIsTagPeople] = useState(false);
  const fileType = selectedFile.type.split("/")[0];
  const { isMobile } = useClientHardwareInfo();

  const { resolvedTheme } = useTheme();
  const searchedTagsData = useTypedSelector(selectFilteredUsersFromTags);
  const { state, dispatch } = useUserTagsContext();
  const { userTag, taggedUsers } = state;

  const [query, setQuery] = useState({
    searchTerm: "a",
    page: 1,
    perPage: 10,
  });

  const { data: userDetails, isLoading } = useGetUsersQuery(query);

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

  const mediaPostForm = useForm<z.infer<typeof MediaPostFormSchema>>({
    resolver: zodResolver(MediaPostFormSchema),
    defaultValues: {
      description: "",
      viewOptions: "public",
    },
  });

  const [uploadMediaTrigger, { isLoading: isPublishing }] =
    useUploadFileMutation();
  const [uploadPostTrigger] = useCreatePostMutation();

  const renderClick = (data) => {
    mediaPostForm.setValue("viewOptions", data);
    if (data !== "pay-per-view") {
      mediaPostForm.setValue("price", undefined);
    }
    setMenuItem(data);
    setIsOpenMenu(false);
  };

  useEffect(() => {
    if (uploadString === "story") {
      mediaPostForm.setValue("uploadString", "story");
    } else if (uploadString === "post") {
      mediaPostForm.setValue("uploadString", "post");
    }
  }, [uploadString]);

  const toggleDiv = () => {
    setIsOpenMenu(!isOpenMenu);
  };

  function onSubmit(data: z.infer<typeof MediaPostFormSchema>) {
    // console.log("🚀 ~ onSubmit ~ data:", data);
    uploadPost(data);
  }

  const uploadPost = async (data) => {
    const formData = new FormData();
    formData.append("file", selectedFile);

    await uploadMediaTrigger(formData)
      .unwrap()
      .then((res) => {
        let postInfoObject = {
          orientation: orientation,
          content: data.description,
          privacy: data.viewOptions,
          media: [{ mediaId: res?.id, mediaType: fileType }],
          status: "published",
          tags: [],
          userTags: taggedUsers ?? [],
          ...(data.viewOptions === "pay-per-view" && {
            price: data.price * 100,
          }),
          type: uploadString,
        };
        return uploadPostTrigger(postInfoObject).unwrap();
      })
      .then((res) => {
        setIsContentUploadOpen && setIsContentUploadOpen(false);
        onFileUpload && onFileUpload(false);
        setFile && setFile(null);
        toast({
          description: `Your ${uploadString} has been published successfully.`,
          variant: "success",
        });
      })
      .catch((err) => {
        console.log("err", err);
        toast({
          variant: "destructive",
          description: "Something went wrong",
        });
      });
  };

  const renderTagPeople = () => {
    setIsTagPeople(!isTagPeople);
  };

  return (
    <Form {...mediaPostForm}>
      <form onSubmit={mediaPostForm.handleSubmit(onSubmit)}>
        <div
          className={cn("flex flex-col", {
            "min-h-screen max-h-screen overflow-y-auto": isMobile,
          })}
        >
          <div
            className={`text-2xl  flex w-full justify-between items-center px-4 py-2 ${fontItalic.className}`}
          >
            <div className="flex">
              <BackArrow
                className="fill-foreground mr-4 cursor-pointer mt-1"
                onClick={() => {
                  setFile && setFile(null);
                  onFileUpload && onFileUpload(false);
                }}
              />
              {fileType === "image" ? "Image Preview" : "Video Preview"}
            </div>
            <div>
              <X
                className="mt-1 lg:size-12 cursor-pointer text-secondary-foreground/20"
                onClick={() => {
                  setIsContentUploadOpen && setIsContentUploadOpen(false);
                  onFileUpload && onFileUpload(false);
                }}
              />
            </div>
          </div>
          <div className="flex flex-col lg:flex lg:flex-row ">
            <div className="w-full max-h-[18rem] lg:max-h-[35.5rem]">
              {fileType === "image" ? (
                <div
                  className="relative h-full"
                  onClick={(e) => findCoordinates(e)}
                >
                  <img
                    src={selectedFile && URL.createObjectURL(selectedFile)}
                    className={cn(
                      "w-full object-contain",
                      isMobile && uploadString === "post"
                        ? "h-[18rem]"
                        : isMobile
                        ? "h-[18rem]"
                        : "h-full"
                    )}
                  />
                  {userTag?.location.y && userTag?.location.x ? (
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
                  ) : null}
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
                <Video selectedFile={selectedFile} />
              )}
            </div>

            <div
              className={cn(
                "flex flex-col w-full ml-2 justify-between",
                isMobile && uploadString === "post"
                  ? "h-80"
                  : isMobile
                  ? "h-96"
                  : uploadString === "story"
                  ? "h-auto"
                  : !isMobile
                  ? "h-auto"
                  : "h-[32rem]"
              )}
            >
              {uploadString === "post" && (
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
              )}

              <div className="flex items-center mb-4">
                <div className="min-h-3/4 p-4 w-full">
                  <div className="flex flex-col mx-auto w-full mt-8 ">
                    {isTagPeople ? (
                      <TagMultiSelect
                        options={searchedTagsData}
                        setQuery={setQuery}
                      />
                    ) : (
                      <div
                        className="flex justify-between items-center"
                        onClick={() => renderTagPeople()}
                      >
                        <div className="flex gap-1 items-center">
                          <Tag className="fill-foreground text-lg" />
                          <Button
                            variant={"link"}
                            className="text-foreground text-lg italic font-normal"
                            type="button"
                          >
                            Tag People
                          </Button>
                        </div>
                        <ChevronRight />
                      </div>
                    )}
                    <Separator />
                    <div className="flex justify-between">
                      <div className="flex gap-1 items-center">
                        <Music className="fill-foreground text-lg" />
                        <Button
                          variant={"link"}
                          className="text-foreground text-lg italic font-normal "
                          type="button"
                        >
                          Add Music
                        </Button>
                      </div>
                      <ChevronRight className="mt-2" />
                    </div>
                    <Separator />

                    <div
                      className="flex justify-between"
                      onClick={() => toggleDiv()}
                    >
                      <div className="flex gap-1 items-center ">
                        {menuItem === "Pay-per-view" ? (
                          <EyePerView className="fill-foreground text-lg" />
                        ) : menuItem === "Subscriber" ? (
                          <Sub className="fill-foreground ml-[-3px] text-lg" />
                        ) : (
                          <Eye className="fill-foreground text-lg" />
                        )}

                        <Button
                          variant={"link"}
                          className="text-foreground text-lg italic font-normal"
                          type="button"
                        >
                          {menuItem ? menuItem : "Public"}
                        </Button>
                      </div>
                      <ChevronRight className="mt-2" />
                    </div>

                    {isOpenMenu && (
                      <div
                        className={cn(
                          "w-[26.5rem] h-auto border-[#0B0F14] bg-secondary dark:bg-[#0B0F14] rounded-lg p-4 absolute",
                          isMobile ? "bottom-[200px]" : "top-[240px]"
                        )}
                      >
                        <div className="flex items-center">
                          <Eye className="fill-foreground" />
                          <Button
                            variant={"link"}
                            className="text-foreground"
                            onClick={() => renderClick("public")}
                            type="button"
                          >
                            Public
                          </Button>
                        </div>
                        <div className="flex items-center">
                          <Sub className="fill-foreground ml-[-3px]" />
                          <Button
                            variant={"link"}
                            className="text-foreground"
                            onClick={() => renderClick("subscriber")}
                            type="button"
                          >
                            Subscriber
                          </Button>
                        </div>
                        {uploadString === "post" && (
                          <div className="flex items-center">
                            <EyePerView className="fill-foreground" />
                            <Button
                              variant={"link"}
                              onClick={() => renderClick("pay-per-view")}
                              className="text-foreground"
                              type="button"
                            >
                              Pay-per-view
                            </Button>
                          </div>
                        )}
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

              <div className={cn("p-3 mb-3")}>
                <Button
                  className="w-full"
                  type="submit"
                  disabled={isPublishing}
                >
                  {uploadString === "post"
                    ? "Publish the post"
                    : "Publish the story"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </form>
    </Form>
  );
};
export default PublishModalDropBox;
