import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "InterviewSetu | Multilingual AI Voice Interviewer",
  description:
    "Context-grounded multilingual AI voice interviewer powered by Gnani AI (Prisma STT & Timbre TTS) and Gemini 1.5 Flash.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="bg-[#0A0D14] text-[#F8FAFC] min-h-screen antialiased selection:bg-[#F59E0B]/20 selection:text-[#F59E0B]">
        {children}
      </body>
    </html>
  );
}
