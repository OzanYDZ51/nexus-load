import type { Metadata } from "next";
import { Orbitron, Rajdhani, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { Sidebar } from "@/components/layout/sidebar";
import { MobileNav } from "@/components/layout/mobile-nav";
import { ParticlesBackground } from "@/components/particles-background";
import { Toaster } from "sonner";
import { HydrationProvider } from "@/components/hydration-provider";

const orbitron = Orbitron({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
});

const rajdhani = Rajdhani({
  variable: "--font-body",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "NEXUS — Intelligence Logistique",
  description:
    "Optimisation 3D de chargement camion par intelligence artificielle",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <body
        className={`${orbitron.variable} ${rajdhani.variable} ${jetbrainsMono.variable} antialiased`}
      >
        <ParticlesBackground />
        <MobileNav />
        <Sidebar />
        <HydrationProvider>
          <main className="ml-0 md:ml-[280px] min-h-screen relative z-[1] p-4 pt-20 md:p-10 md:pt-10">
            {children}
          </main>
        </HydrationProvider>
        <Toaster
          theme="dark"
          position="top-right"
          toastOptions={{
            style: {
              background: "rgba(12, 12, 30, 0.85)",
              border: "1px solid rgba(100, 200, 255, 0.1)",
              color: "#e8ecff",
              backdropFilter: "blur(20px)",
            },
          }}
        />
      </body>
    </html>
  );
}
