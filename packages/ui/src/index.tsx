import type { ReactNode } from "react";

export function PlatformShell({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div>
      <header>
        <span>{title}</span>
      </header>
      {children}
    </div>
  );
}
