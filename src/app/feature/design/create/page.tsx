import React from "react";
import DesignCreateClient from "./DesignCreateClient";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default function DesignCreatePage(props: {
  searchParams?: Record<string, string | string[] | undefined>;
}) {
  const sp = props?.searchParams || {};
  const raw = Array.isArray(sp.type) ? sp.type[0] : sp.type;
  const initialType = String(raw || "").toLowerCase() === "story" ? "story" : "post";
  return <DesignCreateClient initialType={initialType} />;
}


