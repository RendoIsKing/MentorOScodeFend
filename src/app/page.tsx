"use client";
import * as React from "react";
import Logo from "@/components/shared/Logo";
import { Progress } from "@/components/ui/progress";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();

  const [progress, setProgress] = React.useState(10);

  React.useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prevProgress) => {
        return prevProgress < 100 ? prevProgress + 10 : prevProgress;
      });
    }, 100);

    return () => clearInterval(interval);
  }, []);
  React.useEffect(() => {
    if (progress === 100) {
      router.push("/signin");
    }
  }, [progress, router]);
  return (
    <div className="flex justify-center items-center min-h-screen">
      <div>
        <Logo />
        <Progress value={progress} className="w-full" />
      </div>
    </div>
  );
}
