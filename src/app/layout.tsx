import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "IndustriaLease | Industrial approvals",
  description: "Secure unified gateway for Maharashtra industrial approvals.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en"><body>{children}</body></html>
  );
}
