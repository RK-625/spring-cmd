import type { Metadata } from "next";
import { Geist, Geist_Mono, Public_Sans, Lora } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import { ThemeProvider } from "@/components/theme-provider";

const loraHeading = Lora({subsets:['latin'],variable:'--font-heading'});

const publicSans = Public_Sans({subsets:['latin'],variable:'--font-sans'});

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const title = "Spring CMD — Spring Initializr CLI Command Builder";
const description =
  "Choose your Spring Boot project settings and dependencies, then copy a ready-to-run spring init command.";

export const metadata: Metadata = {
  metadataBase: new URL("https://spring-cmd.onrender.com"),
  applicationName: "Spring CMD",
  title,
  description,
  keywords: ["Spring Boot", "Spring Initializr", "Spring CLI", "spring init", "command builder", "Java", "Kotlin", "Gradle", "Maven"],
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "/",
    siteName: "Spring CMD",
    title,
    description,
    images: [{ url: "/social-preview.png", width: 1200, height: 630, alt: "Spring CMD — Configure. Copy. Create." }],
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
    images: ["/social-preview.png"],
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={cn("h-full", "antialiased", geistSans.variable, geistMono.variable, "font-sans", publicSans.variable, loraHeading.variable)}
    >
      <body className="min-h-full flex flex-col">
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
