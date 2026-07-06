import { Bodoni_Moda, Archivo, Space_Mono } from "next/font/google";
import { auth } from "@/auth";
import { AppTopNav } from "@/components/dashboard/app-top-nav";

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

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();

  return (
    <div
      className={`${bodoni.variable} ${archivo.variable} ${spaceMono.variable} flex min-h-screen flex-1 flex-col bg-ground font-editorial text-ink`}
    >
      <AppTopNav userLabel={session?.user?.name || session?.user?.email || ""} />
      <div className="flex flex-1 flex-col">{children}</div>
    </div>
  );
}
