import type { Metadata } from "next";
import { Fraunces, Manrope } from "next/font/google";

import { LandingPage } from "@/components/marketing/landing-page";

const display = Fraunces({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  style: ["normal", "italic"],
  variable: "--font-marketing-display",
});

const sans = Manrope({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-marketing-sans",
});

export const metadata: Metadata = {
  title: {
    absolute: "MindCare · Sites para profissionais de saúde mental",
  },
  description:
    "Plataforma para psicólogos e psiquiatras criarem e editarem o site profissional com prévia ao vivo. A equipe MindCare cuida da publicação.",
};

export default function Home() {
  return (
    <div className={`${display.variable} ${sans.variable} flex min-h-full flex-1 flex-col`}>
      <LandingPage />
    </div>
  );
}
