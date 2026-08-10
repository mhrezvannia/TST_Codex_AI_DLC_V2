import type { ReactNode } from "react";
import { DesignSystemStyles } from "@erp/ui";
import "./shell.css";

export const metadata = {
  title: "LinerCore Shell",
  description: "Authenticated LinerCore application shell"
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html data-theme="light" lang="en">
      <body>
        <DesignSystemStyles />
        {children}
      </body>
    </html>
  );
}
