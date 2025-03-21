import type { Metadata, Viewport } from "next";
import { M_PLUS_1 } from "next/font/google";
import { Toaster } from "react-hot-toast";
import "./globals.css";
import Navigation from "@/components/navigation/Navigation"


const mPlus1 = M_PLUS_1({
  weight: ["400", "700", "900"],
  subsets: ["latin"],
})

export const metadata: Metadata = {
  title: {
    template: "KnowNext",
    default: "KnowNext",
  },
}

export const viewport: Viewport = {
  maximumScale: 1,
  userScalable: false,
}

interface RootLayoutProps {
  children: React.ReactNode
}

// ルートレイアウト
const RootLayout = async ({ children }: RootLayoutProps) => {
  return (
    <html lang="ja">
      <body className={mPlus1.className}>
        <Toaster />
        <div className="flex min-h-screen flex-col">
          <Navigation />

          <main className="flex-1">{children}</main>

          <footer className="border-t py-2">
            <div className="flex flex-col items-center justify-center text-sm space-y-5">
              <div>©Hiroaki Arimura. ALL Rights Reserved.</div>
            </div>
          </footer>
        </div>
      </body>
    </html>
  )
}

export default RootLayout
