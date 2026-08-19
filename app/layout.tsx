import type { Metadata } from "next";
import { Inter, JetBrains_Mono, Geist } from "next/font/google";
import "./globals.css";
import { EvalProvider } from "./context/EvalContext";
import { cn } from "@/lib/utils";

const geist = Geist({subsets:['latin'],variable:'--font-sans'});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Workflow Stress Tester — TAI Labs",
  description: "Test your AI workflow against adversarial prompts.",
  icons: {
    icon: "/logo-2.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      data-scroll-behavior="smooth"
      className={cn("antialiased", inter.variable, jetbrainsMono.variable, "font-sans", geist.variable)}
    >
      <body className="min-h-screen bg-background text-foreground">
        <EvalProvider>
          {children}
        </EvalProvider>
      </body>
    </html>
  );
}
