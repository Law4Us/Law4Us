import type { ReactNode } from "react";
import StyledComponentsRegistry from "@/lib/registry";

export const metadata = {
  title: "Law4Us Studio",
  description: "Content management for Law4Us Blog",
};

export default function StudioLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <StyledComponentsRegistry>
      <div className="min-h-screen bg-white">{children}</div>
    </StyledComponentsRegistry>
  );
}
