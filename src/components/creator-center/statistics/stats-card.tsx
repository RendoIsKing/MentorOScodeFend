import { ChevronUp } from "lucide-react";
import React from "react";
import { ABeeZee } from "next/font/google";
import { Statistics } from "@/redux/services/haveme/creator-center";

const fontItalic = ABeeZee({
  subsets: ["latin"],
  weight: ["400"],
  style: "italic",
});

interface IStatsCardProps {
  cards: Statistics[];
  duration: string;
}

const StatsCard: React.FC<IStatsCardProps> = ({ cards, duration }) => {
  return (
    <div className="grid grid-cols-2 mt-4 mx-4 lg:mx-10 gap-4 lg:gap-8">
      {cards?.map((card: Statistics) => (
        <div
          key={card.title}
          className="p-2 bg-[hsl(var(--card))] border border-[hsl(var(--border))] rounded-[var(--radius)] lg:px-6 lg:py-7"
        >
          <div className="text-muted-foreground">{card.title}</div>
          <div
            className={`text-lg  tracking-wide my-2 ${fontItalic.className}`}
          >
            {card.value}
          </div>
          <div className={`flex justify-between  ${fontItalic.className}`}>
            <div className="text-sm flex">
              <ChevronUp color="green" />
              <div className="mt-0.5 text-[green]">
                {" "}
                {"+"}
                {`${card.percentageChange}%`}
              </div>
            </div>
            <div className="text-sm text-muted-foreground">{`Last ${duration} days`}</div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default StatsCard;
