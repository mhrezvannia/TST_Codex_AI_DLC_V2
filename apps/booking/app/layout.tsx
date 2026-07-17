import type { ReactNode } from "react";
import "./booking.css";

export const metadata = {
  title: "LinerCore Booking",
  description: "Booking quote-to-cash workspace"
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <header className="booking-nav">
          <a className="booking-brand" href="/bookings">LinerCore Booking</a>
          <nav aria-label="Booking navigation">
            <a href="/bookings">Bookings</a>
            <a href="/bookings/new">New booking</a>
          </nav>
        </header>
        {children}
      </body>
    </html>
  );
}
