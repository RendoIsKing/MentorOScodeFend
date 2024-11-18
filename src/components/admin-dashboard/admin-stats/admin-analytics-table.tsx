import { Table, TableRow, TableCell, TableBody } from "@/components/ui/table";
import React from "react";
import Play from "@/assets/images/Creator-center/play.svg";
import Tip from "@/assets/images/Creator-center/Tip.svg";
import Heart from "@/assets/images/Creator-center/heart.svg";
import { ABeeZee } from "next/font/google";

const fontItalic = ABeeZee({
  subsets: ["latin"],
  weight: ["400"],
  style: "italic",
});

interface PostAnalyticsData {
  title: string;
  played: number;
  liked: number;
  tipped: number;
}

interface IPostAnalyticsDataProps {
  analytics: PostAnalyticsData[];
}

const AdminAnalyticsTable = ({ analytics }: IPostAnalyticsDataProps) => {
  return (
    <div className="flex flex-col w-[45%] mx-4 ">
      <div
        className={`text-lg  w-full mx-auto mt-8 mb-2 ${fontItalic.className}`}
      >
        Post Analytics
      </div>
      <div className="rounded-3xl lg:rounded-xl bg-muted">
        <Table>
          <TableBody>
            {analytics.map((analytic, index) => (
              <TableRow
                key={analytic.title}
                className="flex p-0 w-full lg:justify-around lg:border-b-2 lg:border-secondary lg:py-2"
              >
                <TableCell className="w-2/6 py-3 px-2 lg:text-lg">
                  {analytic.title}
                </TableCell>
                <TableCell className="flex w-1/6 py-3 items-center">
                  <Play className="mx-2 min-h-4 min-w-4  lg:mb-0 stroke-foreground" />
                  <div className="mt-1 text-sm lg:text-lg">
                    {analytic.played}
                  </div>
                </TableCell>
                <TableCell className="flex w-1/6 py-3 items-center">
                  <Heart className="mx-2 min-h-4 min-w-5 lg:mb-0 fill-foreground" />
                  <div className="mt-1 text-sm lg:text:lg">
                    {analytic.liked}
                  </div>
                </TableCell>
                <TableCell className="flex w-1/6 py-3 items-center">
                  <Tip className="mx-2 min-h-4 min-w-5  lg:mb-0 stroke-foreground" />
                  <div className="mt-1 text-sm lg:text:lg">{`$${analytic.tipped}`}</div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default AdminAnalyticsTable;
