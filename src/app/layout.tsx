import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { AuthProvider } from "@/lib/auth";
import { LearningStyleProvider } from "@/lib/style";
import { InstructorProvider } from "@/lib/instructor";
import StyleToggle from "@/components/StyleToggle";
import InstructorGuide from "@/components/InstructorGuide";
import "./globals.css";

const inter = Inter({ variable: "--font-inter", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Legal to Fly: Pass the FAA Part 107 exam",
  description:
    "Practice questions for the FAA Part 107 Remote Pilot knowledge test, written from the current regulations and mapped to the ACS codes printed on your test report.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${inter.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">
        <AuthProvider>
          <LearningStyleProvider>
            <InstructorProvider>
              {children}
              <StyleToggle />
              <InstructorGuide />
            </InstructorProvider>
          </LearningStyleProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
