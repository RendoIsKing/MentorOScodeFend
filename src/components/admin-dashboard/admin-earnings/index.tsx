"use client";
import React from "react";
import { Button } from "@/components/ui/button";
import { Info, Star } from "lucide-react";
import { useRouter } from "next/navigation";
import { ABeeZee } from "next/font/google";

const fontItalic = ABeeZee({
  subsets: ["latin"],
  weight: ["400"],
  style: "italic",
});

const AdminEarnings = () => {
  const router = useRouter();
  return (
    <div className="flex justify-center gap-8 mx-4 lg:mx-10 mt-8">
      {/* <div className="p-2 flex bg-primary/50 rounded-lg align-middle">
        <Star className="mx-2" fill="yellow" />
        {"You're in the 2.7% of all creators."}
      </div> */}

      <div className=" w-[46%] bg-secondary rounded-lg mt-4 ">
        <div
          className={`flex justify-center text-primary  mt-4 ${fontItalic.className}`}
        >{`Primary Balance`}</div>
        <div
          className={`flex justify-center  text-3xl mt-2 ${fontItalic.className}`}
        >{`$2535.54`}</div>
        <div className={`flex justify-center  my-4 ${fontItalic.className}`}>
          <Button className="w-3/4">Request Withdrawal</Button>
        </div>
        <div className="flex justify-center text-muted-foreground">{`Minimum withdrawal amount is $20`}</div>
        <div className="flex justify-center text-muted-foreground">
          {`Next Payout is on `}{" "}
          <span className="ml-2 text-primary mb-4">{" 2 Mar 2024"}</span>
        </div>
      </div>

      <div className="w-[46%] bg-secondary rounded-lg mt-4 ">
        <div
          className={`flex justify-center text-primary  mt-4 ${fontItalic.className}`}
        >{`Primary Balance`}</div>
        <div
          className={`flex justify-center  text-3xl mt-2 ${fontItalic.className}`}
        >{`$2535.54`}</div>
        <div className={`flex justify-center  my-4 ${fontItalic.className}`}>
          <Button className="w-3/4">Request Withdrawal</Button>
        </div>
        <div className="flex justify-center text-muted-foreground">{`Minimum withdrawal amount is $20`}</div>
        <div className="flex justify-center text-muted-foreground">
          {`Next Payout is on `}{" "}
          <span className="ml-2 text-primary mb-4">{" 2 Mar 2024"}</span>
        </div>
      </div>
    </div>
  );
};

export default AdminEarnings;
