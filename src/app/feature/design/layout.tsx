import React from "react";
import DesignShellClient from "./DesignShellClient";

export default function DesignLayout({ children }: { children: React.ReactNode }) {
  // Keep the layout extremely thin; all routing logic lives in the client shell.
  return <DesignShellClient>{children}</DesignShellClient>;
}


