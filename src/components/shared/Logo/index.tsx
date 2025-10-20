import React from "react";
import Wordmark from "./Wordmark";
import MonogramBars from "./MonogramBars";
import MonogramArrow from "./MonogramArrow";

export type LogoVariant = "wordmark" | "bars" | "arrow";

function getVariantFromSearch(): LogoVariant | null {
  if (typeof window === "undefined") return null;
  const v = new URLSearchParams(window.location.search).get("logo");
  if (v === "bars" || v === "arrow" || v === "wordmark") return v;
  return null;
}

const Logo = ({ variant, className = "" }: { variant?: LogoVariant; className?: string }) => {
  const chosen: LogoVariant = variant || getVariantFromSearch() || "wordmark";
  if (chosen === "bars") return <MonogramBars className={className} />;
  if (chosen === "arrow") return <MonogramArrow className={className} />;
  return <Wordmark className={className} />;
};

export default Logo;
