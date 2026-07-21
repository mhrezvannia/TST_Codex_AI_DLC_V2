import type { ReactNode } from "react";
import { PlatformShell } from "@erp/ui";

export const metadata = {
  title: "LinerCore Reference Data",
  description: "Shared Platform reference data shell"
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <PlatformShell title="Reference Data" showWorkflow={false}>{children}</PlatformShell>
      </body>
    </html>
  );
}
