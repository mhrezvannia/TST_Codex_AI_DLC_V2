import type { ReactNode } from "react";
import { DesignSystemStyles } from "@erp/ui";
import "./auth-gateway.css";

export const metadata = {
  title: "LinerCore Auth",
  description: "Secure company access to LinerCore"
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
