import type { Metadata, Viewport } from "next";
import { LogsProvider } from "@/providers/LogsProvider";
import TaskBar from "@/components/ui/TaskBar";
import "./globals.css";

export const metadata: Metadata = {
  title: "Train Car Logger",
  description: "Track and log train car sightings",
  icons: {
    icon: "/img/icon.png",
    apple: "/img/icon.png",
    shortcut: "/img/icon.png",
  },
};

export const viewport: Viewport = {
  themeColor: "#ffffff",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta
          name="apple-mobile-web-app-status-bar-style"
          content="black-translucent"
        />
      </head>
      <body className="min-h-screen bg-white font-sans antialiased text-slate-900">
        <div className="max-w-[440px] mx-auto">
          <LogsProvider>
            <div className="flex min-h-screen w-full flex-col">
              <div className="flex flex-1 items-stretch justify-center px-6 pb-[9rem] pt-6">
                {children}
              </div>
              <TaskBar />
            </div>
          </LogsProvider>
        </div>
      </body>
    </html>
  );
}
