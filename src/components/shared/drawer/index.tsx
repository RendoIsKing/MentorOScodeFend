"use client";
import React from "react";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";

import { Button } from "@/components/ui/button";
import { Forward, Twitter } from "lucide-react";
import { ABeeZee } from "next/font/google";

const fontItalic = ABeeZee({
  subsets: ["latin"],
  weight: ["400"],
  style: "italic",
});

const DrawerComponent = () => {
  return (
    <Drawer>
      <DrawerTrigger>
        <Button
          variant={"outline"}
          size={"icon"}
          className="opacity-90 bg-muted-foreground"
        >
          <Forward strokeWidth={3} className="text-white" />
        </Button>{" "}
      </DrawerTrigger>

      <DrawerContent>
        <div className="w-full">
          <div className="flex justify-center">
            <DrawerHeader className={`text-xl   ${fontItalic.className}`}>
              Share Profile
            </DrawerHeader>
          </div>
          <div className="flex justify-around px-5">
            <div className="flex flex-col">
              <div className=" m-auto p-5 rounded-full  bg-muted-foreground/50">
                <img src="\assets\images\ShareIcons\whatsapp 1.svg" alt="W" />
              </div>
              <p className="mt-1 text-sm">Whatsapp</p>
            </div>

            <div className="flex flex-col">
              <div className=" m-auto p-5 rounded-full  bg-muted-foreground/50">
                <img
                  src="\assets\images\ShareIcons\telegram-alt 1.svg"
                  alt="W"
                />
              </div>
              <p className="mt-1 text-sm">Telegram</p>
            </div>

            <div className="flex flex-col">
              <div className=" p-5 m-auto rounded-full  bg-muted-foreground/50">
                <img
                  src="\assets\images\ShareIcons\twitter-alt 1.svg"
                  alt="W"
                />
              </div>
              <p className="mt-1 text-sm ml-2">Twitter</p>
            </div>

            <div className="flex flex-col">
              <div className=" p-5 m-auto rounded-full  bg-muted-foreground/50">
                <img
                  src="\assets\images\ShareIcons\alternate_email.svg"
                  alt="W"
                />
              </div>
              <p className="mt-1 text-sm ml-3">E-mail</p>
            </div>
          </div>

          <a href="" className="invisible">
            m
          </a>

          <div className="flex justify-around px-5">
            <div className="flex flex-col">
              <div className=" m-auto p-5 rounded-full  bg-muted-foreground/50">
                <img src="\assets\images\ShareIcons\facebook1.svg" alt="W" />
              </div>
              <p className="mt-1 text-sm">Facebook</p>
            </div>

            <div className="flex flex-col">
              <div className=" m-auto p-5 rounded-full  bg-muted-foreground/50">
                <img src="\assets\images\ShareIcons\instagram2.svg" alt="W" />
              </div>
              <p className="mt-1 text-sm">Instagram</p>
            </div>

            <div className="flex flex-col">
              <div className=" m-auto p-5 rounded-full  bg-muted-foreground/50">
                <img src="\assets\images\ShareIcons\share2.svg" alt="W" />
              </div>
              <p className="mt-1 text-sm ml-4">More</p>
            </div>

            <div className="flex flex-col">
              <div className=" p-5 m-auto rounded-full  bg-muted-foreground/50">
                <img src="\assets\images\ShareIcons\copy-alt 1.svg" alt="W" />
              </div>
              <p className="mt-1 text-sm">Copy link</p>
            </div>
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  );
};

export default DrawerComponent;
