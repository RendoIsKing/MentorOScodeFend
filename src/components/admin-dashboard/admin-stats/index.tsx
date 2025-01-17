"use client";
import React from "react";
import AdminStatsCard from "./admin-stats-card";
import AdminAnalyticsTable from "./admin-analytics-table";
import AdminEarnings from "../admin-earnings";

interface statsCard {
  title: string;
  value: string;
  percentageChange: number;
  duration: number;
}

interface postAnalytics {
  title: string;
  played: number;
  liked: number;
  tipped: number;
}

const StatistcsCards: statsCard[] = [
  {
    title: "Views",
    value: "230,342",
    percentageChange: 25,
    duration: 7,
  },
  {
    title: "Followers",
    value: "230,342",
    percentageChange: 25,
    duration: 7,
  },
  {
    title: "Subscribers",
    value: "230,342",
    percentageChange: 25,
    duration: 7,
  },
  {
    title: "Likes",
    value: "51,000",
    percentageChange: 25,
    duration: 7,
  },
];

const postAnalyticsData: postAnalytics[] = [
  {
    title: "Your newest post",
    played: 587,
    liked: 21,
    tipped: 23,
  },
  {
    title: "Your viewed post",
    played: 587,
    liked: 21,
    tipped: 23,
  },
  {
    title: "Most liked post",
    played: 587,
    liked: 21,
    tipped: 23,
  },
  {
    title: "Your tipped post",
    played: 587,
    liked: 21,
    tipped: 100,
  },
];

const AdminStatistics = () => {
  return (
    <>
      <AdminStatsCard cards={StatistcsCards} />
      <AdminEarnings />

      <div className="flex justify-center">
        <AdminAnalyticsTable analytics={postAnalyticsData} />
        <AdminAnalyticsTable analytics={postAnalyticsData} />
      </div>
    </>
  );
};

export default AdminStatistics;
