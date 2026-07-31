import type { ReactNode } from "react";

export const metadata = {
  title: "LinerCore Booking",
  description: "Booking quote-to-cash workspace"
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
