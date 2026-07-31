import type { ReactNode } from "react";
import { PlatformShell } from "@erp/ui";
import "./booking.css";

export const metadata = {
  title: "LinerCore Booking",
  description: "Booking quote-to-cash workspace"
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <PlatformShell title="Booking">{children}</PlatformShell>
      </body>
    </html>
  );
}
