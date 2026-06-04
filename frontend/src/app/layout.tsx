import type { Metadata } from "next";
import QueryProvider from "@/providers/QueryProvider";
import AuthProvider from "@/providers/AuthProvider";
import Navbar from "@/components/Navbar";

export const metadata: Metadata = {
  title: "SocialClone",
  description: "A simple social media app",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          backgroundColor: "#0f172a",
          color: "white",
          fontFamily: "Arial, sans-serif",
        }}
      >
        <QueryProvider>
          <AuthProvider>
            <Navbar />

            <main
              style={{
                paddingTop: "56px",
                minHeight: "calc(100vh - 56px)",
              }}
            >
              {children}
            </main>
          </AuthProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
