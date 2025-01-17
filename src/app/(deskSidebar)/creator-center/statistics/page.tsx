"use client";
import React, { useEffect, useSyncExternalStore } from "react";
import InnerPageHeader from "@/components/shared/inner-page-header";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { DatePickerWithRange, formattedDate } from "@/components/ui/date";
import { Line } from "react-chartjs-2";
import { Chart, registerables } from "chart.js";
import { useTheme } from "next-themes";
import { useClientHardwareInfo } from "@/hooks/use-client-hardware-info";

import StatsRangeOption, {
  dropdownOptions,
} from "@/components/shared/stats-range-option";
import { cn } from "@/lib/utils";
import "./style.css";

import { ABeeZee } from "next/font/google";
import {
  useGetUserChartsDataMutation,
  useGetUserEarningDataMutation,
} from "@/redux/services/haveme/creator-center";
import { subDays, format } from "date-fns";
import { DateRange } from "react-day-picker";

// TODO: Make this font definition dynamic
const fontItalic = ABeeZee({
  subsets: ["latin"],
  weight: ["400"],
  style: "italic",
});

Chart.register(...registerables);

interface invoiceData {
  invoice: string;
  gross: string;
  netAmt: string;
  paymentMethod: string;
}

const EarningStatistics = () => {
  const [duration, setDuration] = React.useState("1");
  const [totalGross, setTotalGross] = React.useState(0);
  const [totalNet, setTotalNet] = React.useState(0);

  const [getUserChartsData, { data: chartsData }] =
    useGetUserChartsDataMutation();

  const [getUserEarningData, { data: earningsData }] =
    useGetUserEarningDataMutation();

  const [date, setDate] = React.useState<DateRange | undefined>({
    from: subDays(new Date(formattedDate), 20),
    to: new Date(formattedDate),
  });

  useEffect(() => {
    if (date?.from && date?.to) {
      getUserEarningData({
        startDate: format(date?.from, "yyyy-MM-dd"),
        endDate: format(date?.to, "yyyy-MM-dd"),
      });
    }
  }, [date]);

  useEffect(() => {
    const selectedOption = dropdownOptions.find(
      (option) => option.value === duration
    );
    if (selectedOption) {
      const today = new Date();
      const startDate = new Date(today);
      startDate.setDate(today.getDate() - parseInt(duration));
      const endDate = new Date(today);
      getUserChartsData({
        startDate: format(startDate, "yyyy-MM-dd"),
        endDate: format(endDate, "yyyy-MM-dd"),
      });
    }
  }, [duration]);

  useEffect(() => {
    if (earningsData?.data) {
      // Calculate total gross and total net
      const grossTotal = earningsData.data.reduce(
        (acc, item) => acc + (item.gross || 0),
        0
      );
      const netTotal = earningsData.data.reduce(
        (acc, item) => acc + (item.netAmt || 0),
        0
      );
      setTotalGross(grossTotal);
      setTotalNet(netTotal);
    }
  }, [earningsData]);

  const { isMobile } = useClientHardwareInfo();

  const { resolvedTheme } = useTheme();

  const options = {
    scales: {
      y: {
        ticks: {
          stepSize: 100, // Set the interval between ticks
          min: 0, // Set the minimum value for the y-axis
          max: 600, // Set the maximum value for the y-axis
        },
        beginAtZero: true,
        grid: {
          color:
            resolvedTheme === "dark"
              ? "#464e5a"
              : resolvedTheme === "light"
              ? "#f0f1f4"
              : "#464e5a",
        },
      },
      x: {
        grid: {
          color:
            resolvedTheme === "dark"
              ? "#464e5a"
              : resolvedTheme === "light"
              ? "#f0f1f4"
              : "#464e5a",
        },
      },
    },
    plugins: {
      legend: {
        display: isMobile ? true : false,
        labels: {
          color:
            resolvedTheme === "dark"
              ? "#fff"
              : resolvedTheme === "light"
              ? "#000"
              : "#fff", // Change label color here
          boxWidth: 22,
          boxHeight: 10,
        },
      },
    },
    layout: {
      padding: {
        top: 1, // Add padding at the top to make space for legend
      },
    },
  };

  const chartData = {
    labels: chartsData?.data?.labels || [],
    datasets: [
      {
        label: "Tips",
        data:
          chartsData?.data?.datasets.find((dataset) => dataset.label === "tips")
            ?.data || [],
        backgroundColor: "#b913e2",
        borderColor: "#b913e2",
        borderWidth: 1,
      },
      {
        label: "Subscribers",
        data:
          chartsData?.data?.datasets.find(
            (dataset) => dataset.label === "subscription"
          )?.data || [],
        backgroundColor: "#e47de1",
        borderColor: "#e47de1",
        borderWidth: 1,
      },
      {
        label: "Posts",
        data:
          chartsData?.data?.datasets.find(
            (dataset) => dataset.label === "posts"
          )?.data || [],
        backgroundColor: "#7375FD",
        borderColor: "#7375FD",
        borderWidth: 1,
      },
    ],
  };

  return (
    <div>
      <InnerPageHeader showBackButton={true} title="Earning Statistics" />
      <div className="bg-secondary/40 rounded-3xl m-3.5 lg:m-12">
        <div className="flex justify-between">
          <div className="flex flex-col p-6">
            <Label
              className={`lg:text-xl lg:font-normal ${fontItalic.className} mb-1`}
            >
              Earning Statistics
            </Label>
            <div>
              <Label
                className={`text-2xl lg:text-4xl ${fontItalic.className} font-normal`}
              >
                ${totalGross / 100}
              </Label>
            </div>
          </div>
          <div className="content-center lg:w-96">
            {!isMobile && (
              <div className="flex justify-between">
                <div className="w-7 h-3 bg-[#B913E2] shadow-md"></div>
                <Label>Tips</Label>

                <div className="w-7 h-3 bg-[#E47DE1] shadow-md"></div>
                <Label>Subscribes</Label>

                <div className="w-7 h-3 bg-[#7375FD] shadow-md"></div>
                <Label>Posts</Label>

                <div className="flex flex-col justify-center w-fit p-2"></div>
              </div>
            )}
            <div className="lg:mt-4">
              <StatsRangeOption duration={duration} setDuration={setDuration} />
            </div>
          </div>
        </div>

        <div className="lg:p-4 demo">
          {chartsData && chartsData.data ? (
            <Line data={chartData} options={options} />
          ) : null}
        </div>
      </div>
      <div className="flex justify-between p-6 cursor-pointer lg:mx-12">
        <Label className={`lg:text-lg self-center ${fontItalic.className}`}>
          Earnings
        </Label>
        <DatePickerWithRange date={date} setDate={setDate} />
      </div>

      <div className="lg:mx-12">
        <Table>
          <TableHeader>
            <TableRow className="lg:border-secondary">
              <TableHead className="text-primary">Category</TableHead>
              <TableHead className="text-primary text-center">Gross</TableHead>
              <TableHead className="text-primary text-right">Net</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {earningsData?.data?.map((invoice) => (
              <TableRow key={invoice.invoice} className="lg:border-secondary">
                <TableCell className={`${fontItalic.className}`}>
                  {invoice.invoice}
                </TableCell>
                <TableCell className="text-center">
                  ${invoice?.gross ? invoice?.gross / 100 : 0}
                </TableCell>
                <TableCell className="text-right">
                  ${invoice?.netAmt ? invoice?.netAmt / 100 : 0}
                </TableCell>
              </TableRow>
            ))}
            <TableRow className="lg:border-secondary">
              <TableCell>Total</TableCell>
              <TableCell className="text-center">${totalGross / 100}</TableCell>
              <TableCell className="text-right">${totalNet / 100}</TableCell>
            </TableRow>

          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default EarningStatistics;
