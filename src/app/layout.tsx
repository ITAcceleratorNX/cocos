import type { Metadata } from "next";
import { Onest } from "next/font/google";
import { Analytics } from "@/components/Analytics";
import "./globals.css";

const onest = Onest({
  variable: "--font-onest",
  subsets: ["latin", "cyrillic"],
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "https://cocos.kz"),
  title: {
    default: "CoCo’s — партнёрская программа",
    template: "%s · CoCo’s",
  },
  description:
    "Премиальные прокладки и послеродовые наборы CoCo’s. Партнёрские ссылки и покупки через Kaspi.",
  openGraph: {
    title: "CoCo’s — партнёрская программа",
    description: "Рекомендуй CoCo’s и получай % с покупок на Kaspi.",
    url: "/",
    siteName: "CoCo’s",
    locale: "ru_KZ",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru">
      <body className={`${onest.variable} antialiased`}>
        <Analytics />
        {children}
      </body>
    </html>
  );
}
