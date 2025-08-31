import Breadcrumb from "@/components/common/Breadcrumb";
import MainNavigation from "@/components/common/MainNavigation";
import { AuthProvider } from "@/contexts/AuthContext";
import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Vegana - Học lập trình để đi làm",
  description: "Nền tảng học lập trình trực tuyến với các khóa học chất lượng cao",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        <AuthProvider>
          <MainNavigation />
          <Breadcrumb />
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
