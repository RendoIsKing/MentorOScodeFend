"use client";
import React, { useEffect } from "react";
import StatsCard from "./stats-card";
import PostAnalytics from "./post-analytics";

import StatsRangeOption, {
  dropdownOptions,
} from "@/components/shared/stats-range-option";
import { useGetCreatorCenterStatsMutation } from "@/redux/services/haveme/creator-center";
import { format } from "date-fns";

function Statistics() {
  const [duration, setDuration] = React.useState("1");

  const [getCreatorCenterStats, { data }] = useGetCreatorCenterStatsMutation();

  useEffect(() => {
    const selectedOption = dropdownOptions.find(
      (option) => option.value === duration
    );
    if (selectedOption) {
      const today = new Date();
      const startDate = new Date(today);
      startDate.setDate(today.getDate() - parseInt(duration));
      const endDate = new Date(today);
      getCreatorCenterStats({
        startDate: format(startDate, "yyyy-MM-dd"),
        endDate: format(endDate, "yyyy-MM-dd"),
      });
    }
  }, [duration]);

  return (
    <>
      <div className="flex justify-between mx-4 lg:mx-10">
        <div className="mt-2">Overview</div>
        <StatsRangeOption duration={duration} setDuration={setDuration} />
      </div>
      <StatsCard cards={data?.statistics} duration={duration} />
      <PostAnalytics analytics={data?.postAnalytics} />
    </>
  );
}

export default Statistics;
