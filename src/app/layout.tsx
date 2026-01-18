import type { Metadata } from "next";
import "./globals.css";
import { auth } from "@/lib/auth";
import Header from "@/components/layout/Header";

export const metadata: Metadata = {
  title: "CAAAMP - Camping Event Applications",
  description: "Manage camping event applications with ease",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await auth();

  return (
    <html lang="en">
      <body>
        <Header user={session?.user} />
        {children}
      </body>
    </html>
  );
}
