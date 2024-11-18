import { Table, TableRow, TableCell, TableBody } from "@/components/ui/table";
import React from "react";
import Play from "@/assets/images/Creator-center/play.svg";
import Tip from "@/assets/images/Creator-center/Tip.svg";
import Heart from "@/assets/images/Creator-center/heart.svg";
import { ABeeZee } from "next/font/google";
import { PostAnalytics as PostAnalyticsType } from "@/redux/services/haveme/creator-center";

const fontItalic = ABeeZee({
  subsets: ["latin"],
  weight: ["400"],
  style: "italic",
});

interface IPostAnalyticsDataProps {
  analytics: PostAnalyticsType[];
}

const PostAnalytics: React.FC<IPostAnalyticsDataProps> = ({ analytics }) => {
  return (
    <div className="flex flex-col mx-4 lg:mx-10 lg:mb-4">
      <div
        className={`text-lg  w-full mx-auto mt-8 mb-2 ${fontItalic.className}`}
      >
        Post Analytics
      </div>
      <div className="rounded-3xl lg:rounded-xl bg-muted">
        <Table>
          <TableBody>
            {analytics?.map((analytic, index) => (
              <TableRow
                key={index.toString()}
                className="flex p-0 w-full lg:justify-around lg:border-b-2 lg:border-secondary lg:py-2"
              >
                <TableCell className="w-2/6 py-3 px-2 lg:text-lg">
                  {analytic.title}
                </TableCell>
                <TableCell className="flex w-1/6 py-3 items-center">
                  <Play className="mx-2 min-h-4 min-w-4  lg:mb-0 stroke-foreground" />
                  <div className="mt-1 text-sm lg:text-lg">
                    {/* {analytic.played} */}
                    100
                  </div>
                </TableCell>
                <TableCell className="flex w-1/6 py-3 items-center">
                  <Heart className="mx-2 min-h-4 min-w-5 lg:mb-0 fill-foreground" />
                  <div className="mt-1 text-sm lg:text-lg">
                    {analytic.liked}
                  </div>
                </TableCell>
                <TableCell className="flex w-1/6 py-3 items-center">
                  <Tip className="mx-2 min-h-4 min-w-5  lg:mb-0 stroke-foreground" />
                  <div className="mt-1 text-sm lg:text-lg">
                    {`$${analytic.tipped / 100}`}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default PostAnalytics;
