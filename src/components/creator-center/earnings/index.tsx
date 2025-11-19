"use client";
import React from "react";
import DsButton from "@/ui/ds/Button";
import { Info, Star } from "lucide-react";
import { useRouter } from "next/navigation";
import { ABeeZee } from "next/font/google";
import AddMoneyComponent from "@/components/shared/add-money";

const fontItalic = ABeeZee({
  subsets: ["latin"],
  weight: ["400"],
  style: "italic",
});

const Earnings = () => {
  const router = useRouter();

  return (
    <div className="flex flex-col mx-4 lg:mx-10 mt-8">
      <div className="p-2 flex bg-[hsl(var(--accent))] rounded-[var(--radius)] align-middle border border-[hsl(var(--border))]">
        <Star className="mx-2" fill="yellow" />
        {"You're in the 2.7% of all creators."}
      </div>
      <div className="lg:flex lg:gap-4">
        <div className="bg-[hsl(var(--card))] border border-[hsl(var(--border))] rounded-[var(--radius)] mt-4 lg:w-1/2">
          <div
            className={`flex justify-center text-primary  mt-4 ${fontItalic.className}`}
          >{`Primary Balance`}</div>
          <div
            className={`flex justify-center  text-3xl mt-2 ${fontItalic.className}`}
          >{`$2535.54`}</div>
          <div className={`flex justify-center  my-4 ${fontItalic.className}`}>
            <DsButton className="w-3/4">Request Withdrawal</DsButton>
          </div>
          {/* <div className={`flex justify-center  my-4 ${fontItalic.className}`}>
           <AddMoneyComponent/>
          </div> */}
          <div className="flex justify-center text-muted-foreground">{`Minimum withdrawal amount is $20`}</div>
          <div className="flex justify-center text-muted-foreground">
            {`Next Payout is on `}{" "}
            <span className="ml-2 text-primary mb-4">{" 2 Mar 2024"}</span>
          </div>
        </div>
        <div className="flex flex-col mt-8 lg:w-1/2">
          <div
            className={`flex justify-between text-lg  py-4 border-b-2 border-secondary ${fontItalic.className}`}
          >
            <div className="flex align-middle gap-2">
              {"Pending Balance"}
              <Info className="ml-2 mt-1 text-muted-foreground" />
            </div>
            <div>{"$7883.70"}</div>
          </div>
          <div
            className={`flex justify-between text-lg  py-4 border-b-2 border-secondary ${fontItalic.className}`}
          >
            <div>{"Earning in February"}</div>
            <div>{"$2322.00"}</div>
          </div>
          <div className="flex justify-between text-lg italic py-4 lg:border-b-2 lg:border-secondary lg:mb-4">
            <div>{"Total Earnings"}</div>
            <div>{"$2322.00"}</div>
          </div>
          <div className="flex justify-center w-11/12 fixed lg:relative lg:bottom-0 lg:justify-end lg:w-full bottom-8">
            <DsButton
              className="w-full text-lg italic lg:w-1/2"
              onClick={() => router.push("creator-center/statistics")}
            >
              Earning Statistics
            </DsButton>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Earnings;
