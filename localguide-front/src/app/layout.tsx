import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Sarabun } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "./contexts/AuthContext";
import { NotificationProvider } from "./contexts/NotificationContext";
import { NotificationSystemProvider } from "./contexts/NotificationSystemContext";
import NotificationContainer from "./components/NotificationContainer";

const sarabun = Sarabun({
  subsets: ["latin", "thai"],
  weight: ["100", "200", "300", "400", "500", "600", "700", "800"],
  display: "swap",
});

export const metadata: Metadata = {
  title: { default: "LocalGuide", template: "%s | LocalGuide" },
  description: "Connect with local guides for authentic travel experiences",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="th">
      <body className={`${sarabun.className} bg-gray-50 antialiased`}>
        <AuthProvider>
          <NotificationProvider>
            <NotificationSystemProvider>
              {/* ถ้ามี Navbar สูง ~150px: main ด้านล่างจะสูงเต็มหน้าจอที่เหลือ */}
              <main id="content" className="min-h-[calc(100dvh-150px)]">
                {children}
              </main>
              <NotificationContainer />
            </NotificationSystemProvider>
          </NotificationProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
