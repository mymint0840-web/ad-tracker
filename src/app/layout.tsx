import type { Metadata } from "next";
import { Noto_Sans_Thai, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const noto = Noto_Sans_Thai({ subsets: ["thai", "latin"], variable: "--font-sans", weight: ["300", "400", "500", "600", "700", "800"] });
const jetbrains = JetBrains_Mono({ subsets: ["latin"], variable: "--font-mono", weight: ["400", "500", "600", "700"] });

export const metadata: Metadata = {
  title: "Ad Performance Tracker",
  description: "ระบบติดตามผลการยิงโฆษณา วิเคราะห์ต้นทุน คำนวณกำไร",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="th" className="dark">
      <body className={`${noto.variable} ${jetbrains.variable} font-sans`}>
        {children}
      </body>
    </html>
  );
}
