"use client"

import Link from "next/link"

// ナビゲーション
const Navigation = () => {
  return (
    <header className="border-b">
      <div className="mx-auto max-w-screen-lg px-2 py-5 flex items-center justify-between">
        <Link href="/" className="font-bold text-xl">
          KnowNext
        </Link>
        
      </div>
    </header>
  )
}

export default Navigation
