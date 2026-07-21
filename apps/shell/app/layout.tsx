import type { ReactNode } from "react";
import "./shell.css";

export const metadata = {
  title: "LinerCore Shell",
  description: "Authenticated LinerCore application shell"
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
