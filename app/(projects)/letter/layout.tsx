import type { Metadata } from "next";
import Navbar from "./components/Navbar";
import "./index.css";

export const metadata: Metadata = {
  title: "信纸计划 - 每周给你爱的人写一封精美的信",
  description:
    "信纸计划是一个优雅的 Markdown 排版工具。将你平淡的文字，转化为充满温度的信笺。",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html>
      <body>
        <div className="min-h-screen flex flex-col bg-stone-50 text-stone-900 font-sans selection:bg-stone-200">
          <Navbar />
          <main className="flex-1 flex flex-col">{children}</main>
        </div>
      </body>
    </html>
  );
}
