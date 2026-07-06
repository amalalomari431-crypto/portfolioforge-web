import { Bodoni_Moda, Archivo, Space_Mono } from "next/font/google";

const bodoni = Bodoni_Moda({
  variable: "--font-bodoni",
  subsets: ["latin"],
  style: ["normal", "italic"],
  weight: ["400", "500", "600", "700"],
});

const archivo = Archivo({
  variable: "--font-archivo",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

const spaceMono = Space_Mono({
  variable: "--font-space-mono",
  subsets: ["latin"],
  weight: ["400", "700"],
});

export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  return (
    <div
      className={`${bodoni.variable} ${archivo.variable} ${spaceMono.variable} min-h-screen bg-ground font-editorial text-ink selection:bg-ember selection:text-[#1a1208]`}
    >
      {children}
    </div>
  );
}
