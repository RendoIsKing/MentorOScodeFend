import React from "react";
import { Orbitron } from "next/font/google";

const orbitron = Orbitron({ subsets: ["latin"], weight: ["700", "800"] });

const Logo = () => {
  return (
    <div className="px-2 select-none whitespace-nowrap">
      <h1
        className={`${orbitron.className} my-0 leading-none tracking-tight text-2xl md:text-3xl`}
      >
        <span className="inline-flex items-baseline">
          <span className="mr-1">Mentor</span>
          <span className="text-[#3B0CA6] relative top-[1px]">io</span>
        </span>
      </h1>
    </div>
  );
};

export default Logo;
