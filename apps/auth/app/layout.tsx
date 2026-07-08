import type { ReactNode } from "react";
import { PlatformShell } from "@erp/ui";

export const metadata = {
  title: "LinerCore Auth",
  description: "Shared Platform authentication shell"
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <PlatformShell title="Shared Platform Auth">{children}</PlatformShell>
      </body>
    </html>
  );
}
