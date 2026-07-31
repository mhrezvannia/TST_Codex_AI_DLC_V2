import type { ReactNode } from "react";
import { DesignSystemStyles } from "@erp/ui";
import "./shell.css";

export const metadata = {
  title: "LinerCore Shell",
  description: "Authenticated LinerCore application shell"
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body><DesignSystemStyles />{children}</body>
    </html>
  );
}
