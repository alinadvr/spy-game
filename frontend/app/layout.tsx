import Image from "next/image";
import type { Metadata } from "next";
import { Montserrat } from "next/font/google";

import { ToastContainer } from "react-toastify";

import classNames from "@/utils/classNames";

import "./globals.css";
import "react-toastify/dist/ReactToastify.css";

import logo from "@/public/logo.svg";
import backfround from "@/public/background.jpg";

const montserrat = Montserrat({ subsets: ["latin", "cyrillic"] });

export const metadata: Metadata = {
  title: "FindSpy",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={classNames(
          montserrat.className,
          "relative h-screen w-screen bg-violet-950",
        )}
      >
        <Image
          src={backfround}
          alt="Background"
          className="absolute -z-10 w-full object-cover"
          priority
          quality={100}
        />
        <header className="pt-30 flex flex-col items-center gap-4 pt-[30%]">
          <Image
            src={logo}
            alt="FindSpy Logo"
            className="w-[55%] max-w-60"
            priority
            quality={100}
          />
          <h1 className="text-5xl font-extrabold tracking-wide text-white">
            FindSpy
          </h1>
        </header>
        <main>{children}</main>
        <ToastContainer position="top-right" />
      </body>
    </html>
  );
}
