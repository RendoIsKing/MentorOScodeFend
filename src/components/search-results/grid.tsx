"use client";
import React, { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { CirclePlay } from "lucide-react";
import { Dialog, DialogContent, DialogTrigger } from "../ui/dialog";
import PostModal from "../post-modal";
import { useClientHardwareInfo } from "@/hooks/use-client-hardware-info";

import Link from "next/link";


interface GridItem {
  id: number;
  content: string;
}

interface Props {
  items: GridItem[];
}
interface Image {
  src: string;
  alt: string;
}
const Grid: React.FC<Props> = ({ items }) => {
  const images = getShuffledImages();

  function getShuffledImages(): Image[] {
    const images: Image[] = [];
    for (let i = 1; i <= 10; i++) {
      images.push({
        src: `/assets/images/search/image${i}.svg`,
        alt: `Image ${i}`,
      });
    }

    // Shuffle the array
    for (let i = images.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [images[i], images[j]] = [images[j], images[i]];
    }

    return images;
  }

  const { isMobile } = useClientHardwareInfo();

  return (
    <>
      {isMobile ? (
        <div
          className={`grid grid-cols-3 lg:grid-cols-4 mt-4 w-full p-0 mx-auto `}
        >
          {images.map((image, index) => (
            <div key={index} className="relative w-full">
              <Link href="/your-story">
                <div className="absolute top-1 right-4">
                  <CirclePlay fill="" className="fill-white dark:fill-black" />
                </div>
                <img
                  className="cursor-pointer"
                  style={{ width: "inherit" }}
                  src={image.src}
                  alt={image.alt}
                />
              </Link>
            </div>
          ))}
        </div>
      ) : (
        <div
          className={`grid grid-cols-3 lg:grid-cols-4 mt-4 w-full p-0 mx-auto `}
        >
          <React.Fragment>
            {images.map((image, index) => (
              <div key={index} className="relative w-full">
                <div className="absolute top-1 right-4">
                  <CirclePlay fill="" className="fill-white dark:fill-black" />
                </div>

                <Link
                  className="card"
                  key={index}
                  href={`/post/${index}`}
                  passHref
                >
                  <div key={index} className="w-full">
                    <img
                      className="cursor-pointer"
                      style={{ width: "inherit" }}
                      src={image.src}
                      alt={image.alt}
                    />

                    {/* {index} */}
                  </div>
                </Link>
              </div>
            ))}
          </React.Fragment>
        </div>
      )}
    </>
  );
};

export default Grid;
