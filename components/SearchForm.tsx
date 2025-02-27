"use client"

import React, { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Search, X } from "lucide-react"

/**
 * 検索欄 + ボタン
 * 入力後、/?search=xxx に遷移させることでサーバーコンポーネントが検索を行う
 * UX向上：現在の検索クエリを表示、クリアボタン追加、入力中のフィードバック
 */
export default function SearchForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [keyword, setKeyword] = useState("")
  const [isFocused, setIsFocused] = useState(false)

  // URLから現在の検索クエリを取得して初期表示
  useEffect(() => {
    const currentSearch = searchParams.get("search") || ""
    setKeyword(currentSearch)
  }, [searchParams])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (keyword.trim()) {
      // 検索クエリ付きのURLに移動
      router.push(`/?search=${encodeURIComponent(keyword.trim())}`)
    } else {
      // 空の場合はクエリなしのトップページへ
      router.push("/")
    }
  }

  const handleClear = () => {
    setKeyword("")
    router.push("/")
  }

  return (
    <form onSubmit={handleSubmit} className="mb-6 w-full max-w-xl mx-auto">
      <div className={`flex items-center relative rounded-md overflow-hidden transition-all shadow-sm ${
        isFocused ? "ring-2 ring-blue-300" : "hover:shadow-md"
      }`}>
        {/* 検索アイコン */}
        <div className="absolute left-3 top-0 bottom-0 flex items-center text-gray-400">
          <Search size={18} />
        </div>
        
        {/* 検索入力欄 */}
        <input
          type="text"
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder="キーワードで記事を検索..."
          className="border border-gray-300 rounded-l-md p-3 pl-10 w-full focus:outline-none"
          aria-label="検索キーワード"
        />
        
        {/* クリアボタン（キーワードがある場合のみ表示） */}
        {keyword && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-24 text-gray-400 hover:text-gray-600 transition-colors focus:outline-none"
            aria-label="検索をクリア"
          >
            <X size={18} />
          </button>
        )}
        
        {/* 検索ボタン */}
        <button
          type="submit"
          className="bg-blue-600 text-white hover:bg-blue-700 px-5 py-3 transition-colors flex items-center whitespace-nowrap font-medium"
          aria-label="検索を実行"
        >
          検索
        </button>
      </div>
      
      {/* 現在の検索状態表示 */}
      {searchParams.get("search") && (
        <div className="mt-2 text-sm text-gray-500 flex items-center">
          <span>「{searchParams.get("search")}」の検索結果</span>
          <button
            onClick={handleClear}
            className="ml-2 text-blue-600 hover:underline focus:outline-none text-xs"
            aria-label="検索をクリアして全ての投稿を表示"
          >
            すべて表示
          </button>
        </div>
      )}
    </form>
  )
}