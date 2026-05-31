import QueryProvider from "@/providers/QueryProvider";
import AuthProvider from "@/providers/AuthProvider";
import Navbar from "@/components/Navbar";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "SocialClone",
  description: "A simple social media app",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          background: "#0f172a",
          fontFamily: "Arial, sans-serif",
        }}
      >
        <QueryProvider>
          <AuthProvider>
            <Navbar />
            {/* push content below fixed navbar */}
            <div style={{ paddingTop: "56px" }}>{children}</div>
          </AuthProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
