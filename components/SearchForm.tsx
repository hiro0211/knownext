"use client"

import React, { useState } from "react"
import { useRouter } from "next/navigation"

/**
 * 検索欄 + ボタン
 * 入力後、/?search=xxx に遷移させることでサーバーコンポーネントが検索を行う
 */
export default function SearchForm() {
  const [keyword, setKeyword] = useState("")
  const router = useRouter()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // 検索クエリ付きのURLに移動
    router.push(`/?search=${encodeURIComponent(keyword)}`)
  }

  return (
    <form onSubmit={handleSubmit} className="mb-4 flex items-center gap-2">
      <input
        type="text"
        value={keyword}
        onChange={(e) => setKeyword(e.target.value)}
        placeholder="検索ワードを入力"
        className="border border-gray-300 rounded-md p-2 w-full max-w-sm"
      />
      <button
        type="submit"
        className="bg-blue-600 text-white hover:bg-blue-800 px-4 py-2 rounded-md"
      >
        検索
      </button>
    </form>
  )
}
