import type { ReactNode } from "react";
import { PlatformShell } from "@erp/ui";

export const metadata = {
  title: "LinerCore Charge Agreements",
  description: "Charge and customer agreement workbench"
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <PlatformShell title="Charge Agreements">{children}</PlatformShell>
      </body>
    </html>
  );
}
