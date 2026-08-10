import type { ReactNode, SVGProps } from "react";

export type LucideIconName =
  | "alert-circle"
  | "archive"
  | "check"
  | "chevron-left"
  | "chevron-right"
  | "clipboard-list"
  | "cloud-off"
  | "copy"
  | "database"
  | "file-question"
  | "file-text"
  | "history"
  | "home"
  | "link-off"
  | "log-out"
  | "menu"
  | "plus"
  | "refresh-cw"
  | "route"
  | "search"
  | "shield-alert"
  | "shield-check"
  | "ship"
  | "triangle-alert"
  | "user"
  | "x";

const paths: Record<LucideIconName, ReactNode> = {
  "alert-circle": <>
    <circle cx="12" cy="12" r="10" />
    <path d="M12 8v4" />
    <path d="M12 16h.01" />
  </>,
  archive: <>
    <rect width="20" height="5" x="2" y="3" rx="1" />
    <path d="M4 8v11a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8" />
    <path d="M10 12h4" />
  </>,
  check: <path d="m5 12 4 4L19 6" />,
  "chevron-left": <path d="m15 18-6-6 6-6" />,
  "chevron-right": <path d="m9 18 6-6-6-6" />,
  "clipboard-list": <>
    <rect width="8" height="4" x="8" y="2" rx="1" />
    <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
    <path d="M9 12h6" />
    <path d="M9 16h6" />
  </>,
  "cloud-off": <>
    <path d="m2 2 20 20" />
    <path d="M5.8 5.8A7 7 0 0 0 5 19h10.8" />
    <path d="M17.5 17.5A5 5 0 0 0 16 8.1 7 7 0 0 0 8.3 4.3" />
  </>,
  copy: <>
    <rect width="14" height="14" x="8" y="8" rx="2" />
    <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
  </>,
  database: <>
    <ellipse cx="12" cy="5" rx="9" ry="3" />
    <path d="M3 5v14c0 1.7 4 3 9 3s9-1.3 9-3V5" />
    <path d="M3 12c0 1.7 4 3 9 3s9-1.3 9-3" />
  </>,
  "file-question": <>
    <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
    <polyline points="14 2 14 8 20 8" />
    <path d="M9.5 13a2.5 2.5 0 1 1 3.7 2.2c-.8.4-1.2.8-1.2 1.8" />
    <path d="M12 19h.01" />
  </>,
  "file-text": <>
    <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
    <polyline points="14 2 14 8 20 8" />
    <path d="M8 13h8" />
    <path d="M8 17h8" />
  </>,
  history: <>
    <path d="M3 12a9 9 0 1 0 3-6.7L3 8" />
    <path d="M3 3v5h5" />
    <path d="M12 7v5l3 2" />
  </>,
  home: <>
    <path d="m3 11 9-8 9 8" />
    <path d="M5 10v10h14V10" />
    <path d="M9 20v-6h6v6" />
  </>,
  "link-off": <>
    <path d="M9 17H7A5 5 0 0 1 7 7" />
    <path d="M15 7h2a5 5 0 0 1 4.6 7" />
    <path d="M8 12h4" />
    <path d="m2 2 20 20" />
  </>,
  "log-out": <>
    <path d="M10 17l5-5-5-5" />
    <path d="M15 12H3" />
    <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
  </>,
  menu: <>
    <path d="M4 6h16" />
    <path d="M4 12h16" />
    <path d="M4 18h16" />
  </>,
  plus: <>
    <path d="M12 5v14" />
    <path d="M5 12h14" />
  </>,
  "refresh-cw": <>
    <path d="M21 12a9 9 0 0 0-15.5-6.2L3 8" />
    <path d="M3 3v5h5" />
    <path d="M3 12a9 9 0 0 0 15.5 6.2L21 16" />
    <path d="M16 16h5v5" />
  </>,
  route: <>
    <circle cx="6" cy="19" r="3" />
    <path d="M9 19h8.5a3.5 3.5 0 0 0 0-7h-11a3.5 3.5 0 0 1 0-7H15" />
    <circle cx="18" cy="5" r="3" />
  </>,
  search: <>
    <circle cx="11" cy="11" r="8" />
    <path d="m21 21-4.3-4.3" />
  </>,
  "shield-alert": <>
    <path d="M20 13c0 5-3.5 7.5-8 9-4.5-1.5-8-4-8-9V5l8-3 8 3v8z" />
    <path d="M12 8v4" />
    <path d="M12 16h.01" />
  </>,
  "shield-check": <>
    <path d="M20 13c0 5-3.5 7.5-8 9-4.5-1.5-8-4-8-9V5l8-3 8 3v8z" />
    <path d="m9 12 2 2 4-4" />
  </>,
  ship: <>
    <path d="M12 10.2V6" />
    <path d="M8 8h8" />
    <path d="M18 15 12 18l-6-3-3 1 2 4h14l2-4-3-1z" />
    <path d="M6 15V9l6-3 6 3v6" />
  </>,
  "triangle-alert": <>
    <path d="m21.7 18-8-14a2 2 0 0 0-3.4 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.7-3z" />
    <path d="M12 9v4" />
    <path d="M12 17h.01" />
  </>,
  user: <>
    <path d="M19 21a7 7 0 0 0-14 0" />
    <circle cx="12" cy="7" r="4" />
  </>,
  x: <>
    <path d="M18 6 6 18" />
    <path d="m6 6 12 12" />
  </>
};

export function LucideIcon({
  name,
  size = 18,
  ...props
}: { name: LucideIconName; size?: number } & Omit<SVGProps<SVGSVGElement>, "children">) {
  return (
    <svg
      aria-hidden="true"
      fill="none"
      height={size}
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      viewBox="0 0 24 24"
      width={size}
      {...props}
    >
      {paths[name]}
    </svg>
  );
}
